"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Headphones, LogOut, Clock, CheckCircle, AlertCircle, MessageSquare, Phone } from "lucide-react"
import { useRouter } from "next/navigation"

interface Escalation {
  id: string
  conversationId: string
  status: "pending" | "assigned" | "in_progress" | "resolved" | "closed"
  priority: "low" | "normal" | "high" | "urgent"
  escalationReason: string
  escalatedAt: string
  messages: any[]
}

export default function SupportAgentDashboard() {
  const router = useRouter()
  const [agentStatus, setAgentStatus] = useState<"online" | "offline" | "busy" | "on_break">("offline")
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [selectedChat, setSelectedChat] = useState<Escalation | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    activeChats: 0,
    pendingEscalations: 0,
    resolvedToday: 0,
  })

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/support-agent/login")
        return
      }

      // Fetch escalations
      const res = await fetch("/api/support-agent/escalations", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setEscalations(data.escalations || [])
        setStats(data.stats || { activeChats: 0, pendingEscalations: 0, resolvedToday: 0 })
      } else if (res.status === 401) {
        router.push("/support-agent/login")
      }
    } catch (error) {
      console.error("[v0] Error loading dashboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/support-agent/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setAgentStatus(newStatus as any)
        console.log("[v0] Agent status updated to:", newStatus)
      }
    } catch (error) {
      console.error("[v0] Error updating status:", error)
    }
  }

  const sendReply = async () => {
    if (!selectedChat || !replyMessage.trim()) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/chat/agent-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          escalationId: selectedChat.id,
          message: replyMessage,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSelectedChat((prev) => (prev ? { ...prev, messages: [...prev.messages, data.message] } : null))
        setReplyMessage("")
        console.log("[v0] Reply sent")
      }
    } catch (error) {
      console.error("[v0] Error sending reply:", error)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/support-agent/login")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">Support Agent Dashboard</h1>
              <p className="text-xs text-gray-500">Manage customer escalations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {(["online", "busy", "on_break", "offline"] as const).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={agentStatus === status ? "default" : "outline"}
                  onClick={() => updateStatus(status)}
                  className="capitalize"
                >
                  {status === "online" && <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />}
                  {status === "busy" && <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />}
                  {status === "on_break" && <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />}
                  {status === "offline" && <div className="w-2 h-2 bg-gray-500 rounded-full mr-2" />}
                  {status.replace("_", " ")}
                </Button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Chats</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeChats}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingEscalations}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Resolved Today</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.resolvedToday}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-4 min-h-96">
          {/* Escalations List */}
          <div className="col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Escalations</CardTitle>
                <CardDescription>{escalations.length} total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {escalations.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No escalations yet</p>
                  ) : (
                    escalations.map((escalation) => (
                      <button
                        key={escalation.id}
                        onClick={() => setSelectedChat(escalation)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedChat?.id === escalation.id
                            ? "bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-600"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getPriorityColor(escalation.priority)}>
                            {escalation.priority}
                          </Badge>
                          <Badge className={getStatusColor(escalation.status)}>
                            {escalation.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {escalation.escalationReason}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(escalation.escalatedAt).toLocaleString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="col-span-2">
            {selectedChat ? (
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedChat.escalationReason}</CardTitle>
                      <CardDescription>ID: {selectedChat.conversationId}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(selectedChat.status)}>
                      {selectedChat.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto border-t border-gray-200 dark:border-gray-700 mb-4">
                  <div className="space-y-4">
                    {selectedChat.messages?.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.sender === "agent"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">{new Date(msg.sentAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm resize-none"
                    rows={3}
                  />
                  <Button onClick={sendReply} className="w-full bg-blue-600 hover:bg-blue-700">
                    Send Reply
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select an escalation to view conversation</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
