"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown } from "lucide-react"

interface Question {
  id: string
  title: string
  type: "multiple-choice" | "text"
  options?: string[]
  additionalInfo?: boolean
}

interface QuestionCardProps {
  question: Question
  answer: any
  onAnswer: (answer: any) => void
}

export function QuestionCard({ question, answer, onAnswer }: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedOptions, setSelectedOptions] = useState<string[]>(answer?.options || [])
  const [additionalText, setAdditionalText] = useState(answer?.additionalText || "")

  const handleOptionToggle = (option: string) => {
    const newOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((o) => o !== option)
      : [...selectedOptions, option]

    setSelectedOptions(newOptions)
    onAnswer({
      options: newOptions,
      additionalText,
    })
  }

  const handleTextChange = (text: string) => {
    setAdditionalText(text)
    onAnswer({
      options: selectedOptions,
      additionalText: text,
    })
  }

  if (!isExpanded) {
    return (
      <div className="border-b border-slate-700 pb-4">
        <button onClick={() => setIsExpanded(true)} className="flex items-center justify-between w-full text-left">
          <span className="text-white font-medium">{question.title}</span>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <button
          onClick={() => setIsExpanded(false)}
          className="flex items-center justify-between w-full text-left mb-6"
        >
          <h3 className="text-xl font-semibold text-white">{question.title}</h3>
          <ChevronDown className="w-5 h-5 text-slate-400 rotate-180" />
        </button>

        {question.type === "multiple-choice" && question.options && (
          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap gap-3">
              {question.options.map((option) => (
                <Button
                  key={option}
                  variant={selectedOptions.includes(option) ? "default" : "outline"}
                  onClick={() => handleOptionToggle(option)}
                  className={
                    selectedOptions.includes(option)
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

        {(question.additionalInfo || question.type === "text") && (
          <div className="space-y-2">
            <label className="text-sm text-slate-300">
              {question.type === "text" ? "Your answer:" : "Please provide additional information (optional)"}
            </label>
            <Textarea
              value={additionalText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={
                question.type === "text" ? "Type your answer here..." : "Please provide additional information"
              }
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
