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
  scrollToNextQuestion: (currentQuestionId: string, questions: any[]) => void
}

export function ServiceOfferingQuestions({ answers, onAnswer, scrollToNextQuestion }: ServiceOfferingQuestionsProps) {
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
    const currentIndex = serviceOfferingQuestions.findIndex((q) => q.id === questionId)
    if (currentIndex < serviceOfferingQuestions.length - 1) {
      const nextQuestionId = serviceOfferingQuestions[currentIndex + 1].id
      setTimeout(() => {
        setExpandedQuestions(new Set([nextQuestionId]))
        // Auto scroll to next question
        scrollToNextQuestion(questionId, serviceOfferingQuestions)
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
    } else if (question.type === "multiple-choice") {
      return answer.selectedOption && answer.selectedOption.trim() !== ""
    }
    return false
  }

  const handleNext = (questionId: string) => {
    const currentIndex = serviceOfferingQuestions.findIndex((q) => q.id === questionId)
    if (currentIndex < serviceOfferingQuestions.length - 1) {
      const nextQuestionId = serviceOfferingQuestions[currentIndex + 1].id
      setExpandedQuestions(new Set([nextQuestionId]))
      // Auto scroll to next question
      scrollToNextQuestion(questionId, serviceOfferingQuestions)
    }
  }

  return (
    <div className="space-y-6">
      {serviceOfferingQuestions.map((question) => {
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
                  {currentAnswer.additionalText && question.additionalInfo && (
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
