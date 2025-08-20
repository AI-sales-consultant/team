"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // 登录成功，写入localStorage
      if (data.user) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
      }

      // 登录成功，跳转到评估页面
      router.push("/assessment")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVisitorLogin = () => {
    setIsSubmitting(true)
    
    // 创建游客用户信息
    const visitorUser = {
      id: `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      firstName: "Visitor",
      lastName: "User",
      email: `visitor_${Date.now()}@visitor.local`,
      lastLogin: new Date().toISOString(),
      isVisitor: true
    }

    // 保存到localStorage
    localStorage.setItem("currentUser", JSON.stringify(visitorUser))
    
    // 跳转到评估页面
    router.push("/assessment")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Logo */}
      <div className="absolute top-8 left-8">
        <div className="flex items-center">
          <Image src="/images/ascent-logo-home.png" alt="logo" width={160} height={64} className="h-16 w-auto" />
        </div>
      </div>

      {/* Main Content */}
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome to Ascent</h1>
            <p className="text-muted-foreground">Select an option to continue</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {isLogin ? (
            <div className="space-y-4">
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                onClick={handleVisitorLogin}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login as Visitor"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700">
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
              <div className="text-center">
                <Button variant="link" onClick={() => setIsLogin(true)} className="text-sm">
                  Back to options
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
