"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  id: string
  title: string
  completed: boolean
}

interface AssessmentSidebarProps {
  steps: Step[]
  currentStep: number
  onStepClick: (step: number) => void
}

export function AssessmentSidebar({ steps, currentStep, onStepClick }: AssessmentSidebarProps) {
  return (
    <div className="w-80 bg-slate-800 p-6">
      {/* Logo */}
      <div className="flex items-center justify-center mb-12">
        <img src="/images/ascent-logo.png" alt="logo" className="h-16 w-auto" />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => onStepClick(index)}
            className={cn(
              "w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors",
              index === currentStep
                ? "bg-slate-700 text-white"
                : index < currentStep
                  ? "text-slate-300 hover:bg-slate-700"
                  : "text-slate-500",
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                index === currentStep
                  ? "bg-white text-slate-900"
                  : step.completed
                    ? "bg-green-600 text-white"
                    : "bg-slate-600 text-slate-400",
              )}
            >
              {step.completed ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <span className="text-sm">{step.title}</span>
          </button>
        ))}

        {/* Complete Assessment */}
        <button className="w-full flex items-center space-x-3 p-3 rounded-lg text-left text-slate-300 hover:bg-slate-700 transition-colors">
          <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center">
            <span className="text-white text-xs">🎯</span>
          </div>
          <span className="text-sm">Complete Assessment</span>
        </button>
      </div>
    </div>
  )
}
