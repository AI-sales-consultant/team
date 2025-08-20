"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"

interface AssessmentState {
  currentStep: number
  answers: Record<string, { selectedOption?: string; additionalText?: string; text?: string }>
  isCompleted: boolean
  reportData: Record<string, unknown> | null
  completedSteps: Set<number>
}

type AssessmentAction =
  | { type: "SET_ANSWER"; payload: { questionId: string; answer: { selectedOption?: string; additionalText?: string; text?: string } } }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_STEP"; payload: number }
  | { type: "COMPLETE_STEP"; payload: number }
  | { type: "COMPLETE_ASSESSMENT" }
  | { type: "GENERATE_REPORT"; payload: Record<string, unknown> }
  | { type: "LOAD_PROGRESS"; payload: Partial<AssessmentState> }

const initialState: AssessmentState = {
  currentStep: 0,
  answers: {},
  isCompleted: false,
  reportData: null,
  completedSteps: new Set(),
}

const assessmentReducer = (state: AssessmentState, action: AssessmentAction): AssessmentState => {
  switch (action.type) {
    case "SET_ANSWER":
      const newAnswers = {
        ...state.answers,
        [action.payload.questionId]: action.payload.answer,
      }

      // 保存到localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("assessment_answers", JSON.stringify(newAnswers))
      }

      return {
        ...state,
        answers: newAnswers,
      }
    case "NEXT_STEP":
      return {
        ...state,
        currentStep: state.currentStep + 1,
      }
    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1),
      }
    case "SET_STEP":
      return {
        ...state,
        currentStep: action.payload,
      }
    case "COMPLETE_STEP":
      const newCompletedSteps = new Set(state.completedSteps)
      newCompletedSteps.add(action.payload)
      return {
        ...state,
        completedSteps: newCompletedSteps,
      }
    case "COMPLETE_ASSESSMENT":
      return {
        ...state,
        isCompleted: true,
      }
    case "GENERATE_REPORT":
      return {
        ...state,
        reportData: action.payload,
      }
    case "LOAD_PROGRESS":
      return {
        ...state,
        ...action.payload,
        completedSteps: new Set(action.payload.completedSteps || []),
      }
    default:
      return state
  }
}

const AssessmentContext = createContext<{
  state: AssessmentState
  dispatch: React.Dispatch<AssessmentAction>
} | null>(null)

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState)

  // 加载保存的进度
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProgress = localStorage.getItem("assessment_progress")
      const savedAnswers = localStorage.getItem("assessment_answers")

      if (savedProgress || savedAnswers) {
        const progress = savedProgress ? JSON.parse(savedProgress) : {}
        const answers = savedAnswers ? JSON.parse(savedAnswers) : {}

        dispatch({
          type: "LOAD_PROGRESS",
          payload: {
            ...progress,
            answers: { ...progress.answers, ...answers },
          },
        })
      }
    }
  }, [])

  return <AssessmentContext.Provider value={{ state, dispatch }}>{children}</AssessmentContext.Provider>
}

export function useAssessment() {
  const context = useContext(AssessmentContext)
  if (!context) {
    throw new Error("useAssessment must be used within AssessmentProvider")
  }
  return context
}
