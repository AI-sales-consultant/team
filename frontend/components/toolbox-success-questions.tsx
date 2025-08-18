"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronUp } from "lucide-react"

interface Question {
  id: string
  title: string
  type: "likert-scale" | "text" | "multiple-choice"
  options: string[]
  additionalInfo: boolean
  required: boolean
}

const toolboxSuccessQuestions: Question[] = [
  {
    id: "central-shared-drive",
    title:
      "Anyone involved in sales has access to a central shared drive, where they can easily access any information they might need",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "client-collateral",
    title:
      "Our collateral to share with clients paints us in the best possible light and sets us apart from the competition",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "capability-demonstration",
    title: "We have a repeatable way to demonstrate our full capability, in a way which is engaging and effective",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "digital-tools",
    title: "Our team have access to the digital & online tools they need to run effective outbound activity",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
  {
    id: "crm-implementation",
    title:
      "We have a CRM implemented which allows us to run an efficient sales organisation, including pipeline management",
    type: "likert-scale",
    options: ["Strongly Disagree", "Disagree", "N/A", "Agree", "Strongly Agree"],
    additionalInfo: true,
    required: true,
  },
]

interface ToolboxSuccessQuestionsProps {
  answers: Record<string, { selectedOption?: string; additionalText?: string }>
  onAnswer: (questionId: string, answer: { selectedOption?: string; additionalText?: string }) => void
  scrollToNextQuestion: (currentQuestionId: string, questions: Array<{ id: string }>) => void
}

export function ToolboxSuccessQuestions({ answers, onAnswer, scrollToNextQuestion }: ToolboxSuccessQuestionsProps) {
  // State to manage which questions are expanded
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(questionId)) {
        newExpanded.delete(questionId)
      } else {
        newExpanded.add(questionId)
      }
      return newExpanded
    })
  }

  const handleOptionSelect = (questionId: string, option: string) => {
    const currentAnswer = answers[questionId] || { selectedOption: "", additionalText: "" }

    onAnswer(questionId, {
      ...currentAnswer,
      selectedOption: option,
    })

    // Auto-expand next question with enhanced animation
    const currentIndex = toolboxSuccessQuestions.findIndex((q) => q.id === questionId)
    if (currentIndex < toolboxSuccessQuestions.length - 1) {
      const nextQuestionId = toolboxSuccessQuestions[currentIndex + 1].id
      setTimeout(() => {
        setExpandedQuestions(new Set([nextQuestionId]))
        // Auto scroll to next question
        scrollToNextQuestion(questionId, toolboxSuccessQuestions)
      }, 500) // Increased delay for better UX
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
      return answer.additionalText && answer.additionalText.trim() !== ""
    } else if (question.type === "multiple-choice" || question.type === "likert-scale") {
      return answer.selectedOption && answer.selectedOption.trim() !== ""
    }
    return false
  }

  return (
    <div className="space-y-6">
      {toolboxSuccessQuestions.map((question) => {
        const isExpanded = expandedQuestions.has(question.id)
        const isCompleted = isQuestionCompleted(question)
        const currentAnswer = answers[question.id] || { selectedOption: "", additionalText: "" }

        return (
          <Card 
            key={question.id} 
            id={`question-${question.id}`}
            className={`bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] ${
              isCompleted ? 'bg-green-50 border-green-200' : ''
            }`}
          >
            <CardContent className="p-6">
              <button
                onClick={() => toggleQuestion(question.id)}
                className="flex items-center justify-between w-full text-left mb-4 group"
              >
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{question.title}</h3>
                </div>
                <div className="transition-transform duration-300 ease-in-out">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-all duration-200 transform rotate-180" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-all duration-200" />
                  )}
                </div>
              </button>

              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className={`space-y-4 transform transition-all duration-500 ${
                  isExpanded ? 'translate-y-0' : '-translate-y-4'
                }`}>
                  {question.type === "text" ? (
                    <div className="space-y-2">
                      <Textarea
                        value={currentAnswer.additionalText || ""}
                        onChange={(e) => handleTextChange(question.id, e.target.value)}
                        placeholder="Please provide your answer"
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-600 min-h-[80px] focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        {question.options?.map((option, optionIndex) => (
                          <Button
                            key={option}
                            variant={currentAnswer.selectedOption === option ? "default" : "outline"}
                            onClick={() => handleOptionSelect(question.id, option)}
                            className={`transition-all duration-300 transform hover:scale-105 ${
                              currentAnswer.selectedOption === option
                                ? "bg-blue-600 text-white border-blue-500 hover:bg-blue-700 shadow-lg"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                            }`}
                            style={{
                              animationDelay: `${optionIndex * 100}ms`
                            }}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.additionalInfo && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Additional Information (Optional)
                      </label>
                      <Textarea
                        value={currentAnswer.additionalText || ""}
                        onChange={(e) => handleTextChange(question.id, e.target.value)}
                        placeholder="Please provide additional information"
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-600 min-h-[80px] focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              {!isExpanded && isCompleted && (
                <div className="text-sm text-gray-600 animate-fade-in">
                  {question.type === "text" ? (
                    <span>Answered: {currentAnswer.additionalText?.substring(0, 50)}...</span>
                  ) : (
                    <span>Selected: {currentAnswer.selectedOption}</span>
                  )}
                  {currentAnswer.additionalText && (
                    <div className="mt-1 text-xs text-gray-500">
                      Additional info provided
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
