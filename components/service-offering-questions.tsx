"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronUp } from "lucide-react"

interface Question {
  id: string
  title: string
  type: "multiple-choice" | "text"
  options?: string[]
  additionalInfo?: boolean
  required?: boolean
}

const serviceOfferingQuestions: Question[] = [
  {
    id: "industry",
    title: "What is your industry?",
    type: "text",
    required: true,
  },
  {
    id: "business-challenge",
    title: "What is the most challenging part in your business?",
    type: "text",
    required: true,
  },
  {
    id: "service-type",
    title: "How would you describe what you offer?",
    type: "multiple-choice",
    options: ["Service", "Platform", "Product"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "opportunity-type",
    title: "How would you describe the opportunity you have?",
    type: "multiple-choice",
    options: ["First mover", "Disruptor", "Competitive"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "concerns",
    title: "What keeps you awake at night?",
    type: "multiple-choice",
    options: ["Cashflow", "Readiness of your offering", "Customer Acquisition"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "growth-route",
    title: "What do you believe is your best route to growth?",
    type: "multiple-choice",
    options: ["Marketing", "Direct Sales", "Sales via a partner"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "business-age",
    title: "How long has your business been trading?",
    type: "multiple-choice",
    options: ["Less than 3 years", "3-5 years", "5 years plus"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "business-size-employees",
    title: "How big is your business? (Employees)",
    type: "multiple-choice",
    options: ["5 people or less", "5-15 people", "15 people or more"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "business-size-revenue",
    title: "How big is your business? (Annual Revenue)",
    type: "multiple-choice",
    options: ["Less than £1m", "£1m - £2.5m", "£2.5m"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "paying-clients",
    title: "How many paying clients do you have?",
    type: "multiple-choice",
    options: ["3 or less", "4 to 8", "9 plus"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "biggest-client-revenue",
    title: "How much of your revenue does your biggest client account for?",
    type: "multiple-choice",
    options: [">50%", "25-50%", "<25%"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "revenue-type",
    title: "What sort of revenue do you mainly have currently?",
    type: "multiple-choice",
    options: ["One-off fees", "Monthly recurring revenue", "Multi-year recurring revenue"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "funding-status",
    title: "How are you currently funded?",
    type: "multiple-choice",
    options: ["Bootstrapped", "Seed Funded", "Series A & beyond"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "revenue-targets",
    title: "What are your revenue targets in the next year?",
    type: "multiple-choice",
    options: ["50%+ growth", "100%+ growth", "200%+ growth"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "growth-ambitions",
    title: "What are your growth ambitions in the next three years?",
    type: "multiple-choice",
    options: ["Not even contemplated", "Regular, Steady growth", "Explosive growth"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "clients-needed",
    title: "How many more clients do you need to achieve those growth ambitions?",
    type: "multiple-choice",
    options: ["1 to 2", "3 to 6", "7+"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "preferred-revenue",
    title: "What sort of revenue would you be happy with as the majority of your earnings?",
    type: "multiple-choice",
    options: ["One-off fees", "Monthly recurring revenue", "Multi-year recurring revenue"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "funding-plans",
    title: "What are your future funding plans?",
    type: "multiple-choice",
    options: ["Self-funded from here", "VC / Angel Investment", "Sale of company"],
    additionalInfo: true,
    required: true,
  },
]

interface ServiceOfferingQuestionsProps {
  answers: Record<string, any>
  onAnswer: (questionId: string, answer: any) => void
}

export function ServiceOfferingQuestions({ answers, onAnswer }: ServiceOfferingQuestionsProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set([serviceOfferingQuestions[0].id]))

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  const handleOptionSelect = (questionId: string, option: string) => {
    const currentAnswer = answers[questionId] || { selectedOption: "", additionalText: "" }
    onAnswer(questionId, {
      ...currentAnswer,
      selectedOption: option,
    })
    // 自动跳转到下一题
      const currentIndex = serviceOfferingQuestions.findIndex((q) => q.id === questionId)
      if (currentIndex < serviceOfferingQuestions.length - 1) {
        const nextQuestionId = serviceOfferingQuestions[currentIndex + 1].id
        setTimeout(() => {
          setExpandedQuestions(new Set([nextQuestionId]))
        }, 300)
    }
  }

  const handleTextChange = (questionId: string, text: string) => {
    const currentAnswer = answers[questionId] || { selectedOption: "", additionalText: "" }
    onAnswer(questionId, {
      ...currentAnswer,
      additionalText: text,
    })
  }

  const isQuestionCompleted = (question: Question) => {
    const answer = answers[question.id]
    if (!answer) return false
    if (question.type === "text") {
      // 文本题：只要有内容就算完成
      return answer.text && answer.text.trim() !== ""
    }
    // 单选题：只要选了一个选项或填写了附加信息就算完成
    if (question.type === "multiple-choice") {
      const hasOption = typeof answer.selectedOption === "string" && answer.selectedOption.trim() !== ""
      const hasText = typeof answer.additionalText === "string" && answer.additionalText.trim() !== ""
      return hasOption || hasText
    }
    return false
  }

  const handleNext = (questionId: string) => {
    const currentIndex = serviceOfferingQuestions.findIndex((q) => q.id === questionId)
    if (currentIndex < serviceOfferingQuestions.length - 1) {
      const nextQuestionId = serviceOfferingQuestions[currentIndex + 1].id
      setExpandedQuestions(new Set([nextQuestionId]))
    }
  }

  return (
    <div className="space-y-4">
      {serviceOfferingQuestions.map((question, index) => {
        const isExpanded = expandedQuestions.has(question.id)
        const isCompleted = isQuestionCompleted(question)
        const currentAnswer = answers[question.id] || { selectedOption: "", additionalText: "" }

        return (
          <Card key={question.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <button
                onClick={() => toggleQuestion(question.id)}
                className="flex items-center justify-between w-full text-left mb-4"
              >
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-white">{question.title}</h3>
                  {isCompleted && (
                    <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">Complete</div>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div className="space-y-4">
                  {question.type === "text" && (
                    <Textarea
                      value={currentAnswer.text || ""}
                      onChange={e => onAnswer(question.id, { text: e.target.value })}
                      placeholder={question.id === "industry" ? "Please enter your industry" : "Please enter your challenge"}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[60px]"
                    />
                  )}
                  {question.type === "multiple-choice" && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        {question.options?.map((option) => (
                          <Button
                            key={option}
                            variant={currentAnswer.selectedOption === option ? "default" : "outline"}
                            onClick={() => handleOptionSelect(question.id, option)}
                            className={
                              currentAnswer.selectedOption === option
                                ? "bg-slate-600 text-white border-slate-500"
                                : "bg-transparent text-slate-300 border-slate-600 hover:bg-slate-700"
                            }
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {question.additionalInfo && (
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Please provide additional information (optional)</label>
                      <Textarea
                        value={currentAnswer.additionalText || ""}
                        onChange={(e) => handleTextChange(question.id, e.target.value)}
                        placeholder="Please provide additional information"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[80px]"
                      />
                    </div>
                  )}
                </div>
              )}

              {!isExpanded && isCompleted && (
                <div className="text-sm text-slate-400">
                  {question.type === "text" && currentAnswer.text}
                  {question.type === "multiple-choice" && (
                    <>
                      Selected: {currentAnswer.selectedOption}
                      {currentAnswer.additionalText && (
                        <div className="mt-1 text-xs">
                          Additional info: {currentAnswer.additionalText.substring(0, 100)}
                          {currentAnswer.additionalText.length > 100 && "..."}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
