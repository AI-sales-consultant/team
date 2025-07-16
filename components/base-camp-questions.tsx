"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronUp } from "lucide-react"

interface Question {
  id: string
  title: string
  type: "likert-scale"
  options: string[]
  additionalInfo: boolean
  required: boolean
}

const baseCampQuestions: Question[] = [
  {
    id: "target-niche",
    title: "We know exactly which niche sector(s), and in which geographies, to target",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "pinpoint-clients",
    title: "We could pinpoint specific clients right now who need our offering",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "targeted-pipeline",
    title: "We've purposely targeted the clients in our pipeline because they all share the same characteristics",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "know-buyers",
    title: "We know exactly who the typical buyers, influencers & decision-makers are for our offering",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "clear-problems",
    title: "We are clear on the specific problems we solve and can articulate that to everyone we speak to",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "proven-approach",
    title: "We have a proven approach to secure new clients who we've never even spoken to before",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "partners-resellers",
    title: "We use partners or resellers effectively to help achieve our revenue goals",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "account-management",
    title: "We're in control of our biggest accounts and have a structured approach to account management",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "global-growth",
    title: "We want to, and have a clear plan for how to, grow our service offering globally",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "know-competitors",
    title: "We know who all of our competitors are and can articulate how our offering differs to theirs",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
]

interface BaseCampQuestionsProps {
  answers: Record<string, any>
  onAnswer: (questionId: string, answer: any) => void
}

export function BaseCampQuestions({ answers, onAnswer }: BaseCampQuestionsProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set([baseCampQuestions[0].id]))

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
    const currentIndex = baseCampQuestions.findIndex((q) => q.id === questionId)
    if (currentIndex < baseCampQuestions.length - 1) {
      const nextQuestionId = baseCampQuestions[currentIndex + 1].id
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

    return answer.selectedOption && answer.selectedOption.trim() !== ""
  }

  return (
    <div className="space-y-4">
      {baseCampQuestions.map((question, index) => {
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
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-3">
                      {question.options.map((option) => (
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
                  Selected: {currentAnswer.selectedOption}
                  {currentAnswer.additionalText && (
                    <div className="mt-1 text-xs">
                      Additional info: {currentAnswer.additionalText.substring(0, 100)}
                      {currentAnswer.additionalText.length > 100 && "..."}
                    </div>
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
