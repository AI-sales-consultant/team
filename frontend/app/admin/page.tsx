"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Phone, Mail, User, Clock, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface CallRequest {
  name: string
  email: string
  phone: string
  message: string
  timestamp: string
}

export default function AdminPage() {
  const [callRequests, setCallRequests] = useState<CallRequest[]>([])
  const router = useRouter()

  useEffect(() => {
    // 从本地存储加载数据
    const stored = localStorage.getItem("callRequests")
    if (stored) {
      try {
        setCallRequests(JSON.parse(stored))
      } catch (error) {
        console.error("Error parsing stored requests:", error)
        setCallRequests([])
      }
    }
  }, [])

  const deleteRequest = (index: number) => {
    const updated = callRequests.filter((_, i) => i !== index)
    setCallRequests(updated)
    localStorage.setItem("callRequests", JSON.stringify(updated))
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const clearAllRequests = () => {
    if (confirm("Are you sure you want to delete all requests?")) {
      setCallRequests([])
      localStorage.removeItem("callRequests")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <Button variant="outline" onClick={() => router.push("/")} className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Call Requests Management</h1>
            <p className="text-slate-600 mt-2">
              Manage and review customer call requests ({callRequests.length} total)
            </p>
          </div>
          {callRequests.length > 0 && (
            <Button
              variant="outline"
              onClick={clearAllRequests}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
            >
              Clear All
            </Button>
          )}
        </div>

        <div className="grid gap-6">
          {callRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Phone className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No call requests yet</h3>
                <p className="text-slate-600">Call requests will appear here when customers submit them.</p>
              </CardContent>
            </Card>
          ) : (
            callRequests.map((request, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-slate-600" />
                      <span>{request.name}</span>
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{request.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>{request.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="flex items-center space-x-1 text-xs text-slate-300 bg-slate-100 px-2 py-1 rounded">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(request.timestamp)}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteRequest(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-900">Message:</h4>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-md whitespace-pre-wrap">{request.message}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
