"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"
import { Download, Target, Users, TrendingUp, DollarSign, User } from "lucide-react"
import { useEffect, useState } from "react"
import { getUserScoreHistory } from "@/lib/score-calculator"
import pillarAdvice from "@/lib/pillar-advice.json"
import { useRouter } from "next/navigation"
import { generateNewJsonFormat } from "./assessment-flow" // 确保导入

const radarData = [
  { subject: "Go To Market", A: 50, fullMark: 100 },
  { subject: "Systems & Tools", A: 80, fullMark: 100 },
  { subject: "Performance Metrics", A: 90, fullMark: 100 },
  { subject: "Commercial Essentials", A: 70, fullMark: 100 },
  { subject: "Optimal Processes", A: 60, fullMark: 100 },
  { subject: "People Structure & Culture", A: 85, fullMark: 100 },
]

const keyMetrics = [
  { icon: Target, label: "Growth Target", value: "100% growth", target: "Target: 90%" },
  { icon: Users, label: "Employees", value: "5-15 people" },
  { icon: TrendingUp, label: "Annual Revenue", value: "£1m - £2.5m" },
  { icon: User, label: "Paying Clients", value: "4 to 8" },
  { icon: DollarSign, label: "Service Offering", value: "Service" },
]

const metricsFieldMap = [
  { label: "Growth Target", key: "revenue-targets" },
  { label: "Employees", key: "business-size-employees" },
  { label: "Annual Revenue", key: "business-size-revenue" },
  { label: "Paying Clients", key: "paying-clients" }
]

function toPercent(score: number) {
  return Math.round((score + 2) * 25)
}

function getCircleColor(score: number) {
  if (score < -1.25) return "#e53e3e" // red
  if (score > 1.25) return "#38a169" // green
  return "#f6ad55" // amber
}
function getCircleLabel(score: number) {
  if (score < -1.25) return "Poor"
  if (score > 1.25) return "Good"
  return "Fair"
}

// 修正 keyMap，key 与 tab.label 完全一致
const keyMap = {
  "Go To Market": "GTM Tips",
  "Performance Metrics": "PM Tips",
  "Commercial Essentials": "CE Tips",
  "Optimal Processes": "OP Tips",
  "People, Structure & Culture": "PSC Tips",
  "Systems & Tools": "S&T Tips"
} as const

// 获取建议文本（pillar-advice.json）
function getAdviceList(pillar: keyof typeof keyMap, userId: string) {
  const arr = (pillarAdvice as any)[keyMap[pillar]] as any[]
  if (!arr || arr.length === 0) return ["No advice available.", "No advice available.", "No advice available."]
  // 用 userId 做 hash，保证同一用户每次一样
  let idx = 0
  for (let i = 0; i < userId.length; i++) idx += userId.charCodeAt(i)
  idx = idx % arr.length
  const item = arr[idx]
  return [item["Top Tips"] || "", item["Unnamed: 2"] || "", item["Unnamed: 3"] || ""]
}

// 根据得分区间和 userId 随机返回一条建议
function getAdviceByScore(pillar: keyof typeof keyMap, userId: string, score: number) {
  const arr = (pillarAdvice as any)[keyMap[pillar]] as any[]
  let col = "Top Tips"
  if (score > 1.25) col = "Unnamed: 3"
  else if (score >= -1.25) col = "Unnamed: 2"
  // 过滤掉空建议
  const filtered = arr?.filter(item => item[col] && item[col].trim()) || []
  if (!filtered.length) return "No advice available."
  // 用 userId 做 hash，保证同一用户每次一样
  let idx = 0
  for (let i = 0; i < userId.length; i++) idx += userId.charCodeAt(i)
  idx = idx % filtered.length
  return filtered[idx][col]
}

function getMetricValue(answers: any, key: string) {
  // 现在 answers 是标准化JSON格式，需要从 serviceOffering 部分获取数据
  const serviceOffering = answers?.serviceOffering
  if (!serviceOffering) return "-"
  
  const questionData = serviceOffering[key]
  if (!questionData) return "-"
  
  // 对于选择题，返回 anwser 字段
  if (questionData.anwser) {
    return questionData.anwser
  }
  
  // 对于文本题，返回 text 字段
  if (questionData.text) {
    return questionData.text
  }
  
  return "-"
}

// 自动 POST 用户问卷 JSON 到后端
async function postUserReportJson(userId: string, serviceOffering: Record<string, any>, pillarReports: Record<string, string>) {
  // 生成标准化 JSON
  const standardJson = generateNewJsonFormat(serviceOffering)
  try {
    await fetch("http://localhost:8000/api/save-user-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(standardJson)
    })
  } catch (e) {
    // 可以加错误提示
    console.error("Failed to post user report json", e)
  }
}

// 新增：LLM建议相关的状态和函数
interface LLMAdvice {
  advice: string
  timestamp: string
}

export function BusinessDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("")
  const [pillarScores, setPillarScores] = useState<Record<string, number>>({})
  const [radarData, setRadarData] = useState<any[]>([])
  const [pillarReports, setPillarReports] = useState<Record<string, string>>({})
  const [userId, setUserId] = useState<string>("user_default")
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({})
  const [metrics, setMetrics] = useState<Record<string, string>>({})
  const [industry, setIndustry] = useState("")
  const [businessChallenge, setBusinessChallenge] = useState("")
  const [serviceOffering, setServiceOffering] = useState<Record<string, any>>({})
  
  // 新增：LLM建议相关状态
  const [llmAdvice, setLlmAdvice] = useState<LLMAdvice | null>(null)
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false)
  const [adviceError, setAdviceError] = useState<string>("")

  // 新增：获取LLM建议的函数
  const fetchLLMAdvice = async (assessmentData: any) => {
    setIsLoadingAdvice(true)
    setAdviceError("")
    
    try {
      const response = await fetch("http://localhost:8000/api/llm-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          assessmentData: assessmentData  // 这里应该是标准化JSON格式
        })
      })

      if (!response.ok) {
        throw new Error("Failed to fetch advice")
      }

      const data = await response.json()
      setLlmAdvice(data)
      
      // 保存到localStorage
      localStorage.setItem("llmAdvice", JSON.stringify(data))
    } catch (error) {
      console.error("Error fetching LLM advice:", error)
      setAdviceError("Failed to load business advice. Please try again later.")
    } finally {
      setIsLoadingAdvice(false)
    }
  }

  // 新增：检查是否需要获取建议
  const checkAndFetchAdvice = async () => {
    // 检查是否刚完成评估
    const hasCompletedAssessment = localStorage.getItem("assessmentCompleted");
    const assessmentData = localStorage.getItem("assessment_answers");
  
    if (hasCompletedAssessment && assessmentData) {
      // 每次都强制 fetch，不管 llmAdvice 是否存在
      // 确保传递的是标准化JSON格式
      const standardizedData = JSON.parse(assessmentData);
      await fetchLLMAdvice(standardizedData);
      // 清除完成标记
      localStorage.removeItem("assessmentCompleted");
    } else {
      // 没有 assessmentCompleted，但有 llmAdvice，才用缓存
      const hasAdvice = localStorage.getItem("llmAdvice");
      if (hasAdvice) {
        setLlmAdvice(JSON.parse(hasAdvice));
      }
    }
  }

  useEffect(() => {
    // 未登录自动跳转
    const userStr = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
    if (!userStr) {
      router.push("/login");
      return;
    }
    let localUserId = "user_default"
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserName(user.firstName || user.email || "")
        if (user.email) localUserId = user.email
      } catch {}
    }
    setUserId(localUserId)
    // 获取最新的分数数据
    const scoreHistory = getUserScoreHistory(localUserId)
    if (scoreHistory.length > 0) {
      const latest = scoreHistory[scoreHistory.length - 1]
      const latestScores = latest.pillarScores || latest.scores
      setPillarScores(latestScores)
      setPillarReports(latest.pillarReports || {})
      setCategoryScores(latest.categoryScores || {})
      // 更新雷达图数据
      const newRadarData = Object.entries(latestScores).map(([pillar, score]) => ({
        subject: pillar,
        A: Math.max(0, ((score as number) + 2) * 25),
        fullMark: 100
      }))
      setRadarData(newRadarData)
    }
    // 读取 Service Offering 问卷结果
    if (typeof window !== "undefined") {
      const answersStr = localStorage.getItem("assessment_answers")
      if (answersStr) {
        const answers = JSON.parse(answersStr)
        const m: Record<string, string> = {}
        metricsFieldMap.forEach(f => {
          m[f.key] = getMetricValue(answers, f.key)
        })
        setMetrics(m)
      }
    }
    // 读取 Service Offering 问卷主观题
    if (typeof window !== "undefined") {
      const answersStr = localStorage.getItem("assessment_answers")
      if (answersStr) {
        const answers = JSON.parse(answersStr)
        const serviceOffering = answers?.serviceOffering || {}
        setIndustry(serviceOffering["industry"]?.text || "")
        setBusinessChallenge(serviceOffering["business-challenge"]?.text || "")
      }
    }
    // 读取 Service Offering 问卷所有题目
    if (typeof window !== "undefined") {
      const answersStr = localStorage.getItem("assessment_answers")
      if (answersStr) {
        const answers = JSON.parse(answersStr)
        // 这里需要的是原始答题数据，不是标准化JSON
        // 所以我们需要从 localStorage 中读取原始数据
        const originalAnswersStr = localStorage.getItem("assessment_answers_original")
        if (originalAnswersStr) {
          const originalAnswers = JSON.parse(originalAnswersStr)
          setServiceOffering(originalAnswers)
        } else {
          // 如果没有原始数据，使用标准化数据中的 serviceOffering 部分
          setServiceOffering(answers?.serviceOffering || {})
        }
      }
    }

    // 新增：检查并获取LLM建议
    checkAndFetchAdvice()
  }, [router])

  // 自动 POST JSON 到后端
  useEffect(() => {
    if (
      userId &&
      serviceOffering &&
      Object.keys(serviceOffering).length > 0 &&
      pillarReports &&
      Object.keys(pillarReports).length === 6
    ) {
      postUserReportJson(userId, serviceOffering, pillarReports)
    }
  }, [userId, serviceOffering, pillarReports])

  // 导出/同步按钮
  async function syncMetricsToBackend() {
    const payload = {
      growth_target: metrics["revenue-targets"] || "",
      employees: metrics["business-size-employees"] || "",
      annual_revenue: metrics["business-size-revenue"] || "",
      paying_clients: metrics["paying-clients"] || "",
      service_offering: metrics["service-type"] || ""
    }
    try {
      const res = await fetch("/api/user-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (res.ok) alert("同步成功！")
      else alert("同步失败")
    } catch {
      alert("同步失败")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <img src="/images/ascent-logo.png" alt="logo" className="h-10 w-auto" />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <div>
              <h1 className="text-2xl font-bold mb-2">Good evening{userName ? `, ${userName}` : ""}</h1>
              <p className="text-slate-300 mb-4">
                Here's the current standing of your business report based on your most recent assessment.
              </p>

              {/* 新增：LLM建议文本框 */}
              {(llmAdvice || isLoadingAdvice || adviceError) && (
                <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 mb-6 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">AI Business Insights</h3>
                        <p className="text-purple-100 text-sm">Personalized recommendations for your business</p>
                      </div>
                    </div>

                    {isLoadingAdvice && (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <span className="ml-3 text-white">Generating personalized advice...</span>
                      </div>
                    )}

                    {adviceError && (
                      <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4">
                        <p className="text-red-100">{adviceError}</p>
                        <button 
                          onClick={() => checkAndFetchAdvice()}
                          className="mt-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded hover:bg-opacity-30 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    )}

                    {llmAdvice && !isLoadingAdvice && (
                      <div className="bg-white bg-opacity-10 rounded-lg p-4">
                        <div className="prose prose-invert max-w-none">
                          <div className="whitespace-pre-line text-white leading-relaxed">
                            {llmAdvice.advice}
                          </div>
                        </div>
                        <div className="mt-4 text-xs text-purple-200">
                          Generated on {new Date(llmAdvice.timestamp).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Score Cards */}
              <div className="flex space-x-4 mb-6">
                <Card className="bg-slate-800 border-slate-700 flex-1">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{toPercent(categoryScores["Repeatable"] ?? 0)}</div>
                    <div className="text-sm text-slate-300">Repeatable</div>
                    <div className="text-xs text-slate-400">Target: 90%</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700 flex-1">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{toPercent(categoryScores["Profitable"] ?? 0)}</div>
                    <div className="text-sm text-slate-300">Profitable</div>
                    <div className="text-xs text-slate-400">Target: 90%</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700 flex-1">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{toPercent(categoryScores["Scalable"] ?? 0)}</div>
                    <div className="text-sm text-slate-300">Scalable</div>
                    <div className="text-xs text-slate-400">Target: 90%</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Key Metrics */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="text-lg font-bold mb-4">Your key metrics</div>
                <div className="space-y-2 w-full">
                  {metricsFieldMap.map(f => (
                    <div key={f.key} className="flex items-center justify-between w-full">
                      <span>{f.label}</span>
                      <span className="font-semibold">{metrics[f.key] || "-"}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report Tabs */}
            <Card className="bg-white text-slate-900">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Report</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="go-to-market" className="w-full">
                  <TabsList className="zoom-safe-tabs h-auto min-h-[40px]">
                    <TabsTrigger value="go-to-market" className="zoom-safe-tab text-xs">Go To Market</TabsTrigger>
                    <TabsTrigger value="performance" className="zoom-safe-tab text-xs">Performance Metrics</TabsTrigger>
                    <TabsTrigger value="commercial" className="zoom-safe-tab text-xs">Commercial Essentials</TabsTrigger>
                    <TabsTrigger value="processes" className="zoom-safe-tab text-xs">Optimal Processes</TabsTrigger>
                    <TabsTrigger value="people" className="zoom-safe-tab text-xs">People, Structure & Culture</TabsTrigger>
                    <TabsTrigger value="systems" className="zoom-safe-tab text-xs">Systems & Tools</TabsTrigger>
                  </TabsList>
                  {[
                    { key: "go-to-market", label: "Go To Market" },
                    { key: "performance", label: "Performance Metrics" },
                    { key: "commercial", label: "Commercial Essentials" },
                    { key: "processes", label: "Optimal Processes" },
                    { key: "people", label: "People, Structure & Culture" },
                    { key: "systems", label: "Systems & Tools" },
                  ].map(tab => {
                    const score = pillarScores[tab.label] ?? 0
                    const percent = toPercent(score)
                    const color = getCircleColor(score)
                    const label = getCircleLabel(score)
                    // 兼容 key 大小写和空格差异
                    const reportKey = Object.keys(pillarReports).find(k => k.trim().toLowerCase() === tab.label.trim().toLowerCase()) || tab.label
                    const desc = pillarReports[reportKey] || "No advice available."
                    return (
                      <TabsContent key={tab.key} value={tab.key} className="mt-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                          {/* 圆环分数 */}
                          <div className="flex-shrink-0 flex flex-col items-center">
                            <svg width="120" height="120" viewBox="0 0 120 120">
                              <circle cx="60" cy="60" r="54" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                              <circle
                                cx="60" cy="60" r="54"
                                stroke={color}
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray={339.292}
                                strokeDashoffset={339.292 * (1 - percent / 100)}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.5s' }}
                              />
                              <text x="60" y="65" textAnchor="middle" fontSize="28" fontWeight="bold" fill={color}>{label}</text>
                            </svg>
                        </div>
                          {/* 右侧标题和描述 */}
                          <div className="flex-1 flex flex-col justify-between h-full">
                        <div>
                              <h3 className="text-2xl font-bold mb-2 text-slate-900">{tab.label}</h3>
                              <p className="text-slate-700 mb-6 whitespace-pre-line">{desc}</p>
                            </div>
                            <div className="flex justify-end mt-4">
                              <div className="bg-slate-50 rounded-lg p-4 max-w-xl w-full shadow">
                                <div className="flex items-center mb-2">
                                  <span className="w-3 h-3 rounded-full mr-2" style={{background: score < -1.25 ? '#ef4444' : score > 1.25 ? '#22c55e' : '#facc15'}}></span>
                                  <span className="font-semibold text-slate-800">
                                    {score < -1.25 ? 'Start Doing' : score > 1.25 ? 'Keep Doing' : 'Do More'}
                                  </span>
                        </div>
                      </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                    )
                  })}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Radar Chart */}
          <div>
            <Card className="bg-slate-800 border-slate-700 h-fit">
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#475569" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#cbd5e1", fontSize: 10 }} />
                      <Radar
                        name="Score"
                        dataKey="A"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

