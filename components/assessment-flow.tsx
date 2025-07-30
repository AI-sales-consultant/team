"use client"

import { useAssessment } from "@/contexts/assessment-context"
import { AssessmentSidebar } from "./assessment-sidebar"
import { ServiceOfferingQuestions } from "./service-offering-questions"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { BaseCampQuestions } from "./base-camp-questions"
import { TrackingClimbQuestions } from "./tracking-climb-questions"
import { ScalingEssentialsQuestions } from "./scaling-essentials-questions"
import { StreamliningClimbQuestions } from "./streamlining-climb-questions"
import { AssemblingTeamQuestions } from "./assembling-team-questions"
import { ToolboxSuccessQuestions } from "./toolbox-success-questions"
import { calculateAllPillarScores, calculateCategoryScores, saveScoresToFile, getAllPillarReports, CATEGORY_MAPPING } from "@/lib/score-calculator"
import { useState, useEffect } from "react"

const assessmentSteps = [
  { id: "service-offering", title: "Service Offering", completed: false },
  { id: "base-camp", title: "Base camp for success", completed: false },
  { id: "tracking-climb", title: "Tracking the climb", completed: false },
  { id: "scaling-essentials", title: "Scaling essentials", completed: false },
  { id: "streamlining-climb", title: "Streamlining the climb", completed: false },
  { id: "assembling-team", title: "Assembling the team", completed: false },
  { id: "toolbox-success", title: "Toolbox for success", completed: false },
]

export function generateNewJsonFormat(answers: Record<string, any>) {
  const result: any = {
    serviceOffering: {},
    "Base camp for success (go to market GTM)": {},
    "Tracking the climb (Performance Metrics PM)": {},
    "Scaling essentials (Commercial Essentials CE)": {},
    "Streamlining the climb (Optimal Processes OP)": {},
    "Assembling the team (People, Structure & Culture PSC)": {},
    "Toolbox for success (Systems & Tools ST)": {}
  }

  // Service Offering 部分
  const serviceOfferingQuestions = [
    { id: "industry", question: "What is your industry?" },
    { id: "business-challenge", question: "What is the most challenging part in your business?" },
    { id: "service-type", question: "How would you describe what you offer?", options: ["Service", "Platform", "Product"] },
    { id: "opportunity-type", question: "How would you describe the opportunity you have?", options: ["First mover", "Disruptor", "Competitive"] },
    { id: "concerns", question: "What keeps you awake at night?", options: ["Cashflow", "Readiness of your offering", "Customer Acquisition"] },
    { id: "growth-route", question: "What do you believe is your best route to growth?", options: ["Marketing", "Direct Sales", "Sales via a partner"] },
    { id: "business-age", question: "How long has your business been trading?", options: ["Less than 3 years", "3-5 years", "5 years plus"] },
    { id: "business-size-employees", question: "How big is your business? (Employees)", options: ["5 people or less", "5-15 people", "15 people or more"] },
    { id: "business-size-revenue", question: "How big is your business? (Annual Revenue)", options: ["Less than £1m", "£1m - £2.5m", "£2.5m"] },
    { id: "paying-clients", question: "How many paying clients do you have?", options: ["3 or less", "4 to 8", "9 plus"] },
    { id: "biggest-client-revenue", question: "How much of your revenue does your biggest client account for?", options: [">50%", "25-50%", "<25%"] },
    { id: "revenue-type", question: "What sort of revenue do you mainly have currently?", options: ["One-off fees", "Monthly recurring revenue", "Multi-year recurring revenue"] },
    { id: "funding-status", question: "How are you currently funded?", options: ["Bootstrapped", "Seed Funded", "Series A & beyond"] },
    { id: "revenue-targets", question: "What are your revenue targets in the next year?", options: ["50%+ growth", "100%+ growth", "200%+ growth"] },
    { id: "growth-ambitions", question: "What are your growth ambitions in the next three years?", options: ["Not even contemplated", "Regular, Steady growth", "Explosive growth"] },
    { id: "clients-needed", question: "How many more clients do you need to achieve those growth ambitions?", options: ["1 to 2", "3 to 6", "7+"] },
    { id: "preferred-revenue", question: "What sort of revenue would you be happy with as the majority of your earnings?", options: ["One-off fees", "Monthly recurring revenue", "Multi-year recurring revenue"] },
    { id: "funding-plans", question: "What are your future funding plans?", options: ["Self-funded from here", "VC / Angel Investment", "Sale of company"] }
  ]

  // 处理 Service Offering 部分
  let rCounter = 1 // 从R1开始
  serviceOfferingQuestions.forEach((q, index) => {
    const answer = answers[q.id]
    if (!answer) return

    if (q.id === "industry" || q.id === "business-challenge") {
      // 文本题
      result.serviceOffering[q.id] = {
        text: answer.text || answer.additionalText || ""
      }
    } else {
      // 选择题 - 从R1开始编号
      const selectedOption = answer.selectedOption || ""
      // 使用更严格的字符串匹配
      const optionIndex = q.options?.findIndex(option => option.trim() === selectedOption.trim()) || -1
      const answerLetter = optionIndex >= 0 ? String.fromCharCode(97 + optionIndex) : "" // a, b, c...

      result.serviceOffering[q.id] = {
        question: q.question,
        question_name: `R${rCounter}`,
        anwser: selectedOption,
        anwserselete: answerLetter,
        additionalText: answer.additionalText || ""
      }
      rCounter++ // 递增R编号
    }
  })

  // 处理其他问卷部分
  const sectionMappings = [
    {
      name: "Base camp for success (go to market GTM)",
      questionPrefix: "GTM",
      category: "go to market",
      questions: [
        { id: "target-niche", question: "We know exactly which niche sector(s), and in which geographies, to target" },
        { id: "pinpoint-clients", question: "We could pinpoint specific clients right now who need our offering" },
        { id: "targeted-pipeline", question: "We've purposely targeted the clients in our pipeline because they all share the same characteristics" },
        { id: "know-buyers", question: "We know exactly who the typical buyers, influencers & decision-makers are for our offering" },
        { id: "clear-problems", question: "We are clear on the specific problems we solve and can articulate that to everyone we speak to" },
        { id: "proven-approach", question: "We have a proven approach to secure new clients who we've never even spoken to before" },
        { id: "partners-resellers", question: "We use partners or resellers effectively to help achieve our revenue goals" },
        { id: "account-management", question: "We're in control of our biggest accounts and have a structured approach to account management" },
        { id: "global-growth", question: "We want to, and have a clear plan for how to, grow our service offering globally" },
        { id: "know-competitors", question: "We know who all of our competitors are and can articulate how our offering differs to theirs" }
      ]
    },
    {
      name: "Tracking the climb (Performance Metrics PM)",
      questionPrefix: "PM",
      category: "performance metrics",
      questions: [
        { id: "commercial-performance", question: "We have a good grasp of our current commercial performance including revenue, gross profit, average deal value" },
        { id: "revenue-profit-targets", question: "Everyone, that needs to know, has clarity on what our revenue & profit targets are for this current financial year" },
        { id: "pipeline-management", question: "Our pipeline is managed by stages in a sales funnel, and we can use it to forecast sales for the next 12 months" },
        { id: "great-sale-recognition", question: "Everyone that is responsible for working with clients recognises what makes a great sale for this business" },
        { id: "three-year-targets", question: "We have clarity on what our sales & profit targets need to be for the next 3 years to achieve our goals" },
        { id: "kpis-metrics", question: "We have KPIs or metrics defined at each stage of our sales funnel leading to our ultimate targets" }
      ]
    },
    {
      name: "Scaling essentials (Commercial Essentials CE)",
      questionPrefix: "CE",
      category: "commercial essentials",
      questions: [
        { id: "objections-techniques", question: "We know all of the objections prospects or clients may come up with, and have clear techniques to overcome them" },
        { id: "commercial-model", question: "Our commercial model is easy to understand and makes it easy for clients to buy from us" },
        { id: "pricing-testing", question: "We've tested our pricing to ensure it is competitive whilst at the same time allows us to achieve our targets" },
        { id: "terms-conditions", question: "We have terms & conditions and an SoW which can be agreed quickly and promote a win-win relationship" }
      ]
    },
    {
      name: "Streamlining the climb (Optimal Processes OP)",
      questionPrefix: "OP",
      category: "optimal processes",
      questions: [
        { id: "outbound-sales-approach", question: "We have a proven approach to bringing new leads into this business via an outbound sales approach" },
        { id: "marketing-brand-awareness", question: "Our marketing efforts are increasing brand awareness whilst also bringing in new regular inbound leads" },
        { id: "lead-qualification", question: "We have a structured approach to qualifying every lead, which enables us to prioritise hot leads and say no to the wrong ones" },
        { id: "delivery-handoff", question: "Once a sale is closed, the process for handing off to the team responsible for delivery is clearly defined & understood" }
      ]
    },
    {
      name: "Assembling the team (People, Structure & Culture PSC)",
      questionPrefix: "PSC",
      category: "people structure culture",
      questions: [
        { id: "team-structure", question: "We have the right team structure in place to support our growth ambitions" },
        { id: "right-people-roles", question: "We have the right people in the right roles to achieve our growth ambitions" },
        { id: "compensation-plans", question: "We have compensation plans in place that incentivise the right behaviours" },
        { id: "sales-culture", question: "We have a sales culture that supports our growth ambitions" },
        { id: "performance-management", question: "We have a performance management system in place that supports our growth ambitions" }
      ]
    },
    {
      name: "Toolbox for success (Systems & Tools ST)",
      questionPrefix: "ST",
      category: "systems tools",
      questions: [
        { id: "central-shared-drive", question: "Anyone involved in sales has access to a central shared drive, where they can easily access any information they might need" },
        { id: "client-collateral", question: "Our collateral to share with clients paints us in the best possible light and sets us apart from the competition" },
        { id: "capability-demonstration", question: "We have a repeatable way to demonstrate our full capability, in a way which is engaging and effective" },
        { id: "digital-tools", question: "Our team have access to the digital & online tools they need to run effective outbound activity" },
        { id: "crm-implementation", question: "We have a CRM implemented which allows us to run an efficient sales organisation, including pipeline management" }
      ]
    }
  ]

  // 处理每个部分的问题
  sectionMappings.forEach((section, sectionIndex) => {
    let questionCounter = 1 // 每个部分从1开始计数
    section.questions.forEach((q, questionIndex) => {
      const answer = answers[q.id]
      if (!answer || !answer.selectedOption) return

      const scoreMapping: Record<string, number> = {
        "Strongly Disagree": -2,
        "Disagree": -1,
        "N/A": 0,
        "Agree": 1,
        "Strongly Agree": 2
      }

      const score = scoreMapping[answer.selectedOption] || 0

      result[section.name][q.id] = {
        question_name: `${section.questionPrefix}${questionCounter}`, // 使用前缀+递增编号
        category: section.category,
        catmapping: CATEGORY_MAPPING[q.id] || "", // 添加三大能力分类映射
        question: q.question,
        anwser: answer.selectedOption,
        score: score
      }
      questionCounter++ // 递增问题编号
    })
  })

  return result
}

export function AssessmentFlow() {
  const { state, dispatch } = useAssessment()
  const router = useRouter()
  const [showFloatingProgress, setShowFloatingProgress] = useState(false)

  // 监听滚动事件来控制浮动进度条的显示
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingProgress(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 自动滚动到下一个问题的函数
  const scrollToNextQuestion = (currentQuestionId: string, questions: any[]) => {
    const currentIndex = questions.findIndex((q) => q.id === currentQuestionId)
    if (currentIndex < questions.length - 1) {
      const nextQuestionId = questions[currentIndex + 1].id
      const nextQuestionElement = document.getElementById(`question-${nextQuestionId}`)
      if (nextQuestionElement) {
        setTimeout(() => {
          nextQuestionElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
        }, 300)
      }
    }
  }

  const currentStepData = assessmentSteps[state.currentStep]

  // 检查当前步骤是否完成
  const isCurrentStepCompleted = () => {
    if (state.currentStep === 0) {
      // Service Offering 步骤的完成检查
      const requiredQuestions = [
        "industry",           // 文本题
        "business-challenge", // 文本题
        "service-type",
        "opportunity-type",
        "concerns",
        "growth-route",
        "business-age",
        "business-size-employees",
        "business-size-revenue",
        "paying-clients",
        "biggest-client-revenue",
        "revenue-type",
        "funding-status",
        "revenue-targets",
        "growth-ambitions",
        "clients-needed",
        "preferred-revenue",
        "funding-plans",
      ]

      return requiredQuestions.every((questionId) => {
        const answer = state.answers[questionId]
        if (!answer) return false

        // 选择题：检查 selectedOption
        if (answer.selectedOption) {
          return answer.selectedOption.trim() !== ""
        }
        
        // 文本题：检查 additionalText
        if (answer.additionalText) {
          return answer.additionalText.trim() !== ""
        }

        return false
      })
    } else if (state.currentStep === 1) {
      // Base Camp for Success 步骤的完成检查
      const requiredQuestions = [
        "target-niche",
        "pinpoint-clients",
        "targeted-pipeline",
        "know-buyers",
        "clear-problems",
        "proven-approach",
        "partners-resellers",
        "account-management",
        "global-growth",
        "know-competitors",
      ]

      return requiredQuestions.every((questionId) => {
        const answer = state.answers[questionId]
        if (!answer) return false

        return answer.selectedOption && answer.selectedOption.trim() !== ""
      })
    } else if (state.currentStep === 2) {
      // Tracking the climb 步骤的完成检查
      const requiredQuestions = [
        "commercial-performance",
        "revenue-profit-targets",
        "pipeline-management",
        "great-sale-recognition",
        "three-year-targets",
        "kpis-metrics",
      ]

      return requiredQuestions.every((questionId) => {
        const answer = state.answers[questionId]
        if (!answer) return false

        return answer.selectedOption && answer.selectedOption.trim() !== ""
      })
    } else if (state.currentStep === 3) {
      // Scaling essentials 步骤的完成检查
      const requiredQuestions = ["objections-techniques", "commercial-model", "pricing-testing", "terms-conditions"]

      return requiredQuestions.every((questionId) => {
        const answer = state.answers[questionId]
        if (!answer) return false

        return answer.selectedOption && answer.selectedOption.trim() !== ""
      })
    } else if (state.currentStep === 4) {
      // Streamlining the climb 步骤的完成检查
      const requiredQuestions = [
        "outbound-sales-approach",
        "marketing-brand-awareness",
        "lead-qualification",
        "delivery-handoff",
      ]

      return requiredQuestions.every((questionId) => {
        const answer = state.answers[questionId]
        if (!answer) return false

        return answer.selectedOption && answer.selectedOption.trim() !== ""
      })
    } else if (state.currentStep === 5) {
      // Assembling the team 步骤的完成检查
      const requiredQuestions = [
        "team-structure",
        "right-people-roles",
        "compensation-plans",
        "sales-culture",
        "performance-management",
      ]

      return requiredQuestions.every((questionId) => {
        const answer = state.answers[questionId]
        if (!answer) return false

        return answer.selectedOption && answer.selectedOption.trim() !== ""
      })
    } else if (state.currentStep === 6) {
      // Toolbox for success 步骤的完成检查
      const requiredQuestions = [
        "central-shared-drive",
        "client-collateral",
        "capability-demonstration",
        "digital-tools",
        "crm-implementation",
      ]

      return requiredQuestions.every((questionId) => {
        const answer = state.answers[questionId]
        if (!answer) return false

        return answer.selectedOption && answer.selectedOption.trim() !== ""
      })
    }
    return false
  }

  const handleCompleteSection = async () => {
    if (isCurrentStepCompleted()) {
      // 标记当前步骤为完成
      dispatch({ type: "COMPLETE_STEP", payload: state.currentStep })

      // 如果是最后一步，计算分数并跳转到dashboard
      if (state.currentStep === assessmentSteps.length - 1) {
        dispatch({ type: "COMPLETE_ASSESSMENT" })
        // 计算所有六大类的分数
        const pillarScores = calculateAllPillarScores(state.answers)
        // 计算三大能力分数
        const categoryScores = calculateCategoryScores(state.answers)
        // 统一 userId：用当前登录用户邮箱
        let userId = "user_default"
        if (typeof window !== "undefined") {
          const userStr = localStorage.getItem("currentUser")
          if (userStr) {
            try {
              const user = JSON.parse(userStr)
              if (user.email) userId = user.email
            } catch {}
          }
        }
        // 保存分数到文件
        try {
          await saveScoresToFile(userId, pillarScores, categoryScores)
          console.log("Pillar & Category scores saved:", pillarScores, categoryScores)
        } catch (error) {
          console.error("Failed to save scores:", error)
        }
        
        // 生成新的JSON格式
        const newJsonData = generateNewJsonFormat(state.answers)
        
        // 自动POST到FastAPI
        try {
          console.log("🚀 开始发送数据到后端...")
          console.log("📤 发送的数据:", newJsonData)
          
          const response = await fetch("http://localhost:8000/api/save-user-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newJsonData)
          })
          
          console.log("📥 后端响应状态:", response.status)
          console.log("📥 后端响应头:", Object.fromEntries(response.headers.entries()))
          
          if (response.ok) {
            const responseData = await response.json()
            console.log("✅ 数据成功发送到后端")
            console.log("📥 后端返回数据:", responseData)
          } else {
            const errorText = await response.text()
            console.warn("⚠️ 后端响应异常:", response.status)
            console.warn("⚠️ 错误详情:", errorText)
          }
        } catch (e) {
          console.error("❌ 自动POST到FastAPI失败", e)
          console.error("❌ 错误类型:", e instanceof Error ? e.constructor.name : typeof e)
          console.error("❌ 错误消息:", e instanceof Error ? e.message : String(e))
          // 不影响用户体验，继续执行
        }
        
        // 新增：设置评估完成标记，触发dashboard获取LLM建议
        localStorage.setItem("assessmentCompleted", "true")
        // 存储标准化json格式的答题数据
        localStorage.setItem("assessment_answers", JSON.stringify(generateNewJsonFormat(state.answers)))
        // 存储原始答题数据，用于dashboard显示指标
        localStorage.setItem("assessment_answers_original", JSON.stringify(state.answers))
        
        router.push("/dashboard")
      } else {
        // 否则进入下一步
        dispatch({ type: "NEXT_STEP" })
      }
    }
  }

  const handleAnswer = (questionId: string, answer: any) => {
    dispatch({ type: "SET_ANSWER", payload: { questionId, answer } })
  }

  // 更新步骤完成状态
  const updatedSteps = assessmentSteps.map((step, index) => ({
    ...step,
    completed: state.completedSteps.has(index), // 只有明确完成的步骤才显示为completed
  }))

  // 统计所有题目和已完成题目数
  const allSections = [
    {
      id: 'service-offering',
      questions: [
        "industry", "business-challenge", "service-type", "opportunity-type", "concerns", "growth-route", "business-age", "business-size-employees", "business-size-revenue", "paying-clients", "biggest-client-revenue", "revenue-type", "funding-status", "revenue-targets", "growth-ambitions", "clients-needed", "preferred-revenue", "funding-plans"
      ]
    },
    {
      id: 'base-camp',
      questions: [
        "target-niche", "pinpoint-clients", "targeted-pipeline", "know-buyers", "clear-problems", "proven-approach", "partners-resellers", "account-management", "global-growth", "know-competitors"
      ]
    },
    {
      id: 'tracking-climb',
      questions: [
        "commercial-performance", "revenue-profit-targets", "pipeline-management", "great-sale-recognition", "three-year-targets", "kpis-metrics"
      ]
    },
    {
      id: 'scaling-essentials',
      questions: [
        "objections-techniques", "commercial-model", "pricing-testing", "terms-conditions"
      ]
    },
    {
      id: 'streamlining-climb',
      questions: [
        "outbound-sales-approach", "marketing-brand-awareness", "lead-qualification", "delivery-handoff"
      ]
    },
    {
      id: 'assembling-team',
      questions: [
        "team-structure", "right-people-roles", "compensation-plans", "sales-culture", "performance-management"
      ]
    },
    {
      id: 'toolbox-success',
      questions: [
        "central-shared-drive", "client-collateral", "capability-demonstration", "digital-tools", "crm-implementation"
      ]
    }
  ]

  const totalQuestions = allSections.reduce((sum, section) => sum + section.questions.length, 0)
  const completedQuestions = allSections.reduce((sum, section) =>
    sum + section.questions.filter(qid => {
      const answer = state.answers[qid]
      if (!answer) return false
      if (answer.selectedOption) return answer.selectedOption.trim() !== ""
      if (answer.additionalText) return answer.additionalText.trim() !== ""
      return false
    }).length, 0
  )
  const progressPercent = Math.round((completedQuestions / totalQuestions) * 100)

  return (
    <div className="flex min-h-screen">
      <AssessmentSidebar
        steps={updatedSteps}
        currentStep={state.currentStep}
        onStepClick={(step) => dispatch({ type: "SET_STEP", payload: step })}
      />

      <div className="flex-1 bg-white relative">
        <div className="max-w-4xl mx-auto p-8">
          {/* Enhanced Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {completedQuestions} / {totalQuestions} questions completed
                  </span>
                  <span className="text-sm text-gray-500">
                    {progressPercent}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700 ease-out transform origin-left"
                    style={{ 
                      width: `${progressPercent}%`
                    }}
                  >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{currentStepData.title}</h1>
            </div>
            <p className="text-gray-600 mb-4">
              Please answer the following questions as accurately as possible. Make your choice, provide any additional
              relevant info.
            </p>
            
            {/* Improved Value Proposition */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6 shadow flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-6 animate-bounce-slow">
                  {/* 更大icon，可以换成你喜欢的svg或emoji */}
                  <span className="text-4xl">🚀</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900 mb-1">Transform Your Business Journey</h3>
                <p className="text-base text-blue-800 leading-relaxed">
                  <span className="font-semibold">💼 Unlock insights & strategies to scale faster.</span><br/>
                  <span className="text-gray-700">📊 Get a growth roadmap tailored for your business — in minutes.</span>
                </p>
              </div>
            </div>
          </div>

          {/* 根据当前步骤显示不同的问卷 */}
          {state.currentStep === 0 && <ServiceOfferingQuestions answers={state.answers} onAnswer={handleAnswer} scrollToNextQuestion={scrollToNextQuestion} />}
          {state.currentStep === 1 && <BaseCampQuestions answers={state.answers} onAnswer={handleAnswer} scrollToNextQuestion={scrollToNextQuestion} />}
          {state.currentStep === 2 && <TrackingClimbQuestions answers={state.answers} onAnswer={handleAnswer} scrollToNextQuestion={scrollToNextQuestion} />}
          {state.currentStep === 3 && <ScalingEssentialsQuestions answers={state.answers} onAnswer={handleAnswer} scrollToNextQuestion={scrollToNextQuestion} />}
          {state.currentStep === 4 && <StreamliningClimbQuestions answers={state.answers} onAnswer={handleAnswer} scrollToNextQuestion={scrollToNextQuestion} />}
          {state.currentStep === 5 && <AssemblingTeamQuestions answers={state.answers} onAnswer={handleAnswer} scrollToNextQuestion={scrollToNextQuestion} />}
          {state.currentStep === 6 && <ToolboxSuccessQuestions answers={state.answers} onAnswer={handleAnswer} scrollToNextQuestion={scrollToNextQuestion} />}

          {/* 底部按钮 */}
          <div className="flex justify-between mt-12">
            <Button
              onClick={handleCompleteSection}
              disabled={!isCurrentStepCompleted()}
              className={`px-8 py-2 rounded-full transition-all duration-300 ${
                isCurrentStepCompleted()
                  ? "bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {state.currentStep === assessmentSteps.length - 1 ? "Complete Assessment" : "Complete section"}
            </Button>
          </div>
        </div>

        {/* Floating Progress Column - Always visible in top-right corner */}
        <div className="fixed top-8 right-8 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64">
            <div className="text-center mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Assessment Progress</h4>
              <div className="text-2xl font-bold text-blue-600">
                {progressPercent}%
              </div>
            </div>
            <div className="space-y-2">
              {assessmentSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    allSections[index] && allSections[index].questions.every(qid => {
                      const answer = state.answers[qid]
                      if (!answer) return false
                      if (answer.selectedOption) return answer.selectedOption.trim() !== ""
                      if (answer.additionalText) return answer.additionalText.trim() !== ""
                      return false
                    })
                      ? 'bg-green-500' 
                      : index === state.currentStep 
                      ? 'bg-blue-500 animate-pulse' 
                      : 'bg-gray-300'
                  }`}></div>
                  <span className={`text-xs ${
                    allSections[index] && allSections[index].questions.every(qid => {
                      const answer = state.answers[qid]
                      if (!answer) return false
                      if (answer.selectedOption) return answer.selectedOption.trim() !== ""
                      if (answer.additionalText) return answer.additionalText.trim() !== ""
                      return false
                    })
                      ? 'text-green-600 font-medium' 
                      : index === state.currentStep 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                {completedQuestions} / {totalQuestions} questions completed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}