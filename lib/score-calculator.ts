// 分数映射表
export const SCORE_MAPPING = {
  "Strongly Disagree": -2,
  "Disagree": -1,
  "N/A": 0,
  "Agree": 1,
  "Strongly Agree": 2,
} as const

// 六大类名称映射
export const PILLAR_NAMES = {
  "base-camp": "Go to Market",
  "tracking-climb": "Performance Metrics", 
  "scaling-essentials": "Commercial Essentials",
  "streamlining-climb": "Optimal Processes",
  "assembling-team": "People, Structure & Culture",
  "toolbox-success": "Systems & Tools",
} as const

// 能力分类映射
export const CATEGORY_MAPPING: Record<string, "Profitable" | "Repeatable" | "Scalable"> = {
  // base-camp
  "target-niche": "Profitable",
  "pinpoint-clients": "Profitable",
  "targeted-pipeline": "Repeatable",
  "know-buyers": "Profitable",
  "clear-problems": "Profitable",
  "proven-approach": "Profitable",
  "partners-resellers": "Scalable",
  "account-management": "Scalable",
  "global-growth": "Scalable",
  "know-competitors": "Profitable",
  // tracking-climb
  "commercial-performance": "Profitable",
  "revenue-profit-targets": "Profitable",
  "pipeline-management": "Profitable",
  "great-sale-recognition": "Profitable",
  "three-year-targets": "Repeatable",
  "kpis-metrics": "Repeatable",
  // scaling-essentials
  "objections-techniques": "Profitable",
  "commercial-model": "Scalable",
  "pricing-testing": "Repeatable",
  "terms-conditions": "Scalable",
  // streamlining-climb
  "outbound-sales-approach": "Repeatable",
  "marketing-brand-awareness": "Repeatable",
  "lead-qualification": "Repeatable",
  "delivery-handoff": "Scalable",
  // assembling-team
  "team-structure": "Repeatable",
  "right-people-roles": "Repeatable",
  "compensation-plans": "Profitable",
  "sales-culture": "Scalable",
  "performance-management": "Scalable",
  // toolbox-success
  "central-shared-drive": "Scalable",
  "client-collateral": "Profitable",
  "capability-demonstration": "Repeatable",
  "digital-tools": "Scalable",
  "crm-implementation": "Scalable",
};

// 计算单个问卷的平均分
export function calculatePillarScore(answers: Record<string, any>, pillarQuestions: string[]): number {
  const scores: number[] = []
  
  pillarQuestions.forEach(questionId => {
    const answer = answers[questionId]
    if (answer && answer.selectedOption) {
      const score = SCORE_MAPPING[answer.selectedOption as keyof typeof SCORE_MAPPING]
      if (score !== undefined) {
        scores.push(score)
      }
    }
  })
  
  if (scores.length === 0) return 0
  
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
  return Number(average.toFixed(2))
}

// 计算所有六大类的分数
export function calculateAllPillarScores(answers: Record<string, any>): Record<string, number> {
  // 定义每个pillar对应的问题ID
  const pillarQuestions = {
    "base-camp": [
      "target-niche", "pinpoint-clients", "targeted-pipeline", "know-buyers", 
      "clear-problems", "proven-approach", "partners-resellers", "account-management", 
      "global-growth", "know-competitors"
    ],
    "tracking-climb": [
      "commercial-performance", "revenue-profit-targets", "pipeline-management", 
      "great-sale-recognition", "three-year-targets", "kpis-metrics"
    ],
    "scaling-essentials": [
      "objections-techniques", "commercial-model", "pricing-testing", "terms-conditions"
    ],
    "streamlining-climb": [
      "outbound-sales-approach", "marketing-brand-awareness", "lead-qualification", "delivery-handoff"
    ],
    "assembling-team": [
      "team-structure", "right-people-roles", "compensation-plans", "sales-culture", "performance-management"
    ],
    "toolbox-success": [
      "central-shared-drive", "client-collateral", "capability-demonstration", "digital-tools", "crm-implementation"
    ]
  }

  const results: Record<string, number> = {}
  
  Object.entries(pillarQuestions).forEach(([pillarKey, questions]) => {
    const score = calculatePillarScore(answers, questions)
    const pillarName = PILLAR_NAMES[pillarKey as keyof typeof PILLAR_NAMES]
    results[pillarName] = score
  })
  
  return results
}

// 计算三大能力分类的分数
export function calculateCategoryScores(answers: Record<string, any>): Record<string, number> {
  const categories = ["Profitable", "Repeatable", "Scalable"];
  const scores: Record<string, number[]> = {
    Profitable: [],
    Repeatable: [],
    Scalable: [],
  };

  Object.entries(answers).forEach(([questionId, answer]) => {
    const category = CATEGORY_MAPPING[questionId];
    if (category && answer && answer.selectedOption) {
      const score = SCORE_MAPPING[answer.selectedOption as keyof typeof SCORE_MAPPING];
      if (score !== undefined) {
        scores[category].push(score);
      }
    }
  });

  const result: Record<string, number> = {};
  categories.forEach((cat) => {
    const arr = scores[cat];
    result[cat] = arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : 0;
  });
  return result;
}

import pillarAdvice from "./pillar-advice.json"

// 更强的字符串hash算法，确保分散性
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // 保证32位
  }
  return Math.abs(hash);
}

// 六大类与pillar-advice.json的key映射
const PILLAR_ADVICE_KEY_MAP: Record<string, string> = {
  "Go to Market": "GTM Tips",
  "Performance Metrics": "PM Tips",
  "Commercial Essentials": "CE Tips",
  "Optimal Processes": "OP Tips",
  "People, Structure & Culture": "PSC Tips",
  "Systems & Tools": "S&T Tips"
}

// 根据分数区间获取建议列名
function getAdviceCol(score: number): "Top Tips" | "Unnamed: 2" | "Unnamed: 3" {
  if (score < -1.25) return "Top Tips"
  if (score > 1.25) return "Unnamed: 3"
  return "Unnamed: 2"
}

// 获取单个pillar的建议文本（同一userId每次都一样）
export function getAdviceByScore(pillar: string, score: number, userId: string): string {
  const adviceKey = PILLAR_ADVICE_KEY_MAP[pillar]
  const arr = (pillarAdvice as any)[adviceKey] as any[]
  if (!arr || arr.length === 0) return ""
  const col = getAdviceCol(score)
  // 用userId和pillar做hash，保证同一用户同一pillar每次都一样
  const idx = arr.length === 1 ? 0 : hashString(userId + pillar) % arr.length
  return arr[idx][col] || ""
}

// 获取所有pillar的建议文本
export function getAllPillarReports(pillarScores: Record<string, number>, userId: string): Record<string, string> {
  const result: Record<string, string> = {}
  Object.entries(pillarScores).forEach(([pillar, score]) => {
    result[pillar] = getAdviceByScore(pillar, score, userId)
  })
  return result
}

// 保存分数到文件（pillar和category一起）
export async function saveScoresToFile(userId: string, pillarScores: Record<string, number>, categoryScores: Record<string, number>): Promise<void> {
  const pillarReports = getAllPillarReports(pillarScores, userId)
  const scoreData = {
    userId,
    timestamp: new Date().toISOString(),
    pillarScores,
    categoryScores,
    pillarReports,
    summary: {
      pillarAverage: Number((Object.values(pillarScores).reduce((sum, score) => sum + score, 0) / Object.values(pillarScores).length).toFixed(2)),
      categoryAverage: Number((Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.values(categoryScores).length).toFixed(2)),
    }
  }
  
  // 在浏览器环境中保存到localStorage
  if (typeof window !== "undefined") {
    const existingData = JSON.parse(localStorage.getItem("pillar_scores") || "[]")
    existingData.push(scoreData)
    localStorage.setItem("pillar_scores", JSON.stringify(existingData))
  }
  
  // 在服务器环境中保存到文件
  if (typeof window === "undefined") {
    const fs = require('fs')
    const path = require('path')
    
    const scoresDir = path.join(process.cwd(), 'data', 'scores')
    if (!fs.existsSync(scoresDir)) {
      fs.mkdirSync(scoresDir, { recursive: true })
    }
    
    const filename = `pillar_scores_${userId}_${Date.now()}.json`
    const filepath = path.join(scoresDir, filename)
    
    fs.writeFileSync(filepath, JSON.stringify(scoreData, null, 2))
  }
}

// 获取用户的分数历史
export function getUserScoreHistory(userId: string): any[] {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("pillar_scores")
    if (data) {
      const allScores = JSON.parse(data)
      return allScores.filter((item: any) => item.userId === userId)
    }
  }
  return []
} 