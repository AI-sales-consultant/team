import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, assessmentData } = body

    // 验证请求数据
    if (!userId || !assessmentData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // 调用后端FastAPI服务
    try {
      const backendResponse = await fetch("http://127.0.0.1:8000/api/llm-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          assessmentData: assessmentData
        })
      })

      if (!backendResponse.ok) {
        throw new Error(`Backend API error: ${backendResponse.status}`)
      }

      const backendData = await backendResponse.json()
      
      // 返回后端的数据
      return NextResponse.json(backendData)

    } catch (backendError) {
      console.error("Backend API call failed:", backendError)
      
      // 如果后端调用失败，返回错误信息
      return NextResponse.json(
        { 
          error: "Failed to get AI advice from backend service",
          details: backendError instanceof Error ? backendError.message : "Unknown error"
        },
        { status: 503 }
      )
    }

  } catch (error) {
    console.error("LLM Advice API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 