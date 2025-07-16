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

const scalingEssentialsQuestions: Question[] = [
  {
    id: "objections-techniques",
    title:
      "We know all of the objections prospects or clients may come up with, and have clear techniques to overcome them",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "commercial-model",
    title: "Our commercial model is easy to understand and makes it easy for clients to buy from us",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "pricing-testing",
    title:
      "We've tested our pricing to ensure it is competitive whilst at the same time allows us to achieve our targets",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "terms-conditions",
    title: "We have terms & conditions and an SoW which can be agreed quickly and promote a win-win relationship",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
]

interface ScalingEssentialsQuestionsProps {
  answers: Record<string, any>
  onAnswer: (questionId: string, answer: any) => void
}

export function ScalingEssentialsQuestions({ answers, onAnswer }: ScalingEssentialsQuestionsProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set([scalingEssentialsQuestions[0].id]))

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
    const currentIndex = scalingEssentialsQuestions.findIndex((q) => q.id === questionId)
    if (currentIndex < scalingEssentialsQuestions.length - 1) {
      const nextQuestionId = scalingEssentialsQuestions[currentIndex + 1].id
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
      {scalingEssentialsQuestions.map((question, index) => {
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
