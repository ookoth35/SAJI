"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Clock, AlertCircle, CheckCircle, Users, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ActiveChat {
  id: string
  userId: string
  userName: string
  userEmail: string
  escalatedAt: string
  status: "pending" | "assigned" | "in_progress"
  priority: "low" | "normal" | "high" | "urgent"
  messages: number
  lastMessage: string
}

interface AgentStats {
  activeChats: number
  totalHandled: number
  averageResolutionTime: string
  satisfactionRate: number
}

export default function AgentSupportDashboard() {
  const [agentStatus, setAgentStatus] = useState<"online" | "offline" | "busy" | "on_break">("offline")
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([])
  const [selectedChat, setSelectedChat] = useState<ActiveChat | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [replyMessage, setReplyMessage] = useState("")
  const [stats, setStats] = useState<AgentStats>({
    activeChats: 0,
    totalHandled: 0,
    averageResolutionTime: "0h",
    satisfactionRate: 0,
  })

  // Fetch active escalations
  useEffect(() => {
    const fetchActiveChats = async () => {
      try {
        setIsLoading(true)
        // In a real system, this would fetch from the API
        // For now, we'll load sample data
        console.log("[v0] Fetching active support chats")
        
        // Simulate API call
        setTimeout(() => {
          setActiveChats([
            {
              id: "esc-001",
              userId: "user-123",
              userName: "John Doe",
              userEmail: "john@example.com",
              escalatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
              status: "in_progress",
              priority: "high",
              messages: 5,
              lastMessage: "Can you help me with my payment issue?",
            },
            {
              id: "esc-002",
              userId: "user-456",
              userName: "Jane Smith",
              userEmail: "jane@example.com",
              escalatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
              status: "assigned",
              priority: "normal",
              messages: 2,
              lastMessage: "I need to cancel my order",
            },
          ])
          setStats({
            activeChats: 2,
            totalHandled: 24,
            averageResolutionTime: "2.3h",
            satisfactionRate: 4.8,
          })
        }, 500)
      } catch (error) {
        console.error("[v0] Error fetching chats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (agentStatus === "online") {
      fetchActiveChats()
    }
  }, [agentStatus])

  const handleStatusChange = (status: typeof agentStatus) => {
    setAgentStatus(status)
    console.log("[v0] Agent status changed to:", status)
  }

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedChat) return

    try {
      console.log("[v0] Sending reply to chat:", selectedChat.id)
      // Save reply to database
      const res = await fetch("/api/chat/agent-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escalationId: selectedChat.id,
          message: replyMessage,
          agentId: "current-agent-id",
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to send reply")
      }

      setReplyMessage("")
      console.log("[v0] Reply sent successfully")
    } catch (error) {
      console.error("[v0] Error sending reply:", error)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "assigned":
        return <AlertCircle className="w-4 h-4 text-blue-600" />
      case "in_progress":
        return <MessageCircle className="w-4 h-4 text-green-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Support Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage customer support chats and escalations</p>
        </div>
        <div className="flex gap-2">
          {(["online", "busy", "on_break", "offline"] as const).map((status) => (
            <Button
              key={status}
              onClick={() => handleStatusChange(status)}
              variant={agentStatus === status ? "default" : "outline"}
              size="sm"
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Chats</p>
              <p className="text-2xl font-bold">{stats.activeChats}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Handled</p>
              <p className="text-2xl font-bold">{stats.totalHandled}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Resolution</p>
              <p className="text-2xl font-bold">{stats.averageResolutionTime}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Satisfaction</p>
              <p className="text-2xl font-bold">{stats.satisfactionRate}/5</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      {agentStatus !== "online" ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600">You are currently {agentStatus}. Set your status to "online" to see active chats.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Queue */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Active Queue ({activeChats.length})
              </h2>
              <div className="space-y-3">
                {isLoading ? (
                  <p className="text-sm text-gray-600">Loading chats...</p>
                ) : activeChats.length === 0 ? (
                  <p className="text-sm text-gray-600">No active chats</p>
                ) : (
                  activeChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-3 rounded-lg cursor-pointer border-2 transition ${
                        selectedChat?.id === chat.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{chat.userName}</p>
                          <p className="text-xs text-gray-600">{chat.userEmail}</p>
                        </div>
                        {getStatusIcon(chat.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={getPriorityColor(chat.priority)}>
                          {chat.priority}
                        </Badge>
                        <span className="text-xs text-gray-600">{chat.messages} msgs</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-1">{chat.lastMessage}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Chat Interface */}
          {selectedChat ? (
            <div className="lg:col-span-2">
              <Card className="p-4 h-full flex flex-col">
                <div className="border-b pb-4 mb-4">
                  <h2 className="font-bold">{selectedChat.userName}</h2>
                  <p className="text-sm text-gray-600">{selectedChat.userEmail}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getPriorityColor(selectedChat.priority)}>
                      {selectedChat.priority}
                    </Badge>
                    <Badge variant="outline">{selectedChat.status}</Badge>
                  </div>
                </div>

                {/* Message Area */}
                <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm">{selectedChat.lastMessage}</p>
                    <p className="text-xs text-gray-600 mt-1">Customer • just now</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg ml-auto max-w-xs">
                    <p className="text-sm">I'm here to help! What specific issue are you facing?</p>
                    <p className="text-xs text-gray-600 mt-1">You • 2 min ago</p>
                  </div>
                </div>

                {/* Reply Input */}
                <div className="space-y-3 pt-4 border-t">
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your response..."
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleReply}
                      disabled={!replyMessage.trim()}
                      className="flex-1"
                    >
                      Send Reply
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log("[v0] Resolving chat:", selectedChat.id)
                      }}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="lg:col-span-2 p-12 text-center flex items-center justify-center">
              <p className="text-gray-600">Select a chat to start responding</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
