"use client"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  X,
  Sparkles,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  text: string
  sender: "user" | "ai" | "human"
  timestamp: Date
  escalated?: boolean
}

export default function ChatbotPage() {
  const [conversationId, setConversationId] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome to SAJI Support. I'm your AI assistant. I can help with orders, payments, accounts and more. If you'd prefer a human agent, just type 'talk to human support'.",
      sender: "ai",
      timestamp: new Date(),
    },
  ])

  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isEscalated, setIsEscalated] = useState(false)
  const [escalationId, setEscalationId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const escalationKeywords = [
    "real agent",
    "human agent",
    "talk to human",
    "human support",
    "real person",
    "speak to human",
    "escalate",
    "help me",
  ]

  // Initialize conversation on mount
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        const id = Math.random().toString(36).substring(7)
        setConversationId(id)
      } catch (error) {
        console.error("[v0] Error initializing conversation:", error)
      }
    }

    initializeConversation()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const checkEscalation = (text: string) => {
    const lower = text.toLowerCase()
    return escalationKeywords.some((k) => lower.includes(k))
  }

  const escalateChat = async () => {
    try {
      const res = await fetch("/api/chat/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          escalationReason: "User requested human support",
          priority: "normal",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to escalate")
      }

      setEscalationId(data.escalation.id)
      setIsEscalated(true)

      // Add escalation message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: data.assignedAgent
            ? "Connecting you with support agent..."
            : "Your request has been queued. A support specialist will join soon.",
          sender: "ai",
          timestamp: new Date(),
          escalated: true,
        },
      ])

      // Simulate agent joining
      if (data.assignedAgent) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text: `Hello! I'm here to help. I've received your previous conversation. How can I assist you today?`,
              sender: "human",
              timestamp: new Date(),
            },
          ])
        }, 1500)
      }
    } catch (error) {
      console.error("[v0] Escalation error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "I'm having trouble connecting you with an agent. Please try again.",
          sender: "ai",
          timestamp: new Date(),
        },
      ])
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || !conversationId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const userInput = inputValue
    setInputValue("")

    // Check if user wants to escalate
    if (checkEscalation(userInput)) {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        escalateChat()
      }, 800)
      return
    }

    // If already escalated, send to agent
    if (isEscalated) {
      return
    }

    setIsTyping(true)

    try {
      // First, save the message
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: userInput,
          userId: "user-id",
        }),
      })

      // Get AI response
      const res = await fetch("/api/chat/ai-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: userInput,
          userId: "user-id",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: data.response,
          sender: "ai",
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      const errorMessage = error instanceof Error ? error.message : "Unable to process your message"
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `Sorry, I encountered an error: ${errorMessage}. Please try again or ask to speak with an agent.`,
          sender: "ai",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white text-lg">
                SAJI Support
              </h1>
              <p className="text-xs text-gray-500">
                {isEscalated ? "Connected to Support Agent" : "AI Assistant"}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-md px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-md"
                    : msg.sender === "human"
                    ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-md"
                    : msg.escalated
                    ? "bg-yellow-50 border border-yellow-300 text-yellow-900 rounded-bl-md"
                    : "bg-gray-100 dark:bg-gray-800 rounded-bl-md"
                }`}
              >
                <p>{msg.text}</p>
                <span className="block mt-2 text-[11px] opacity-60">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ESCALATION STATUS */}
      {isEscalated && (
        <div className="bg-blue-50 border-t border-blue-200 text-blue-700 text-xs text-center py-2">
          Connected to a human support specialist
        </div>
      )}

      {/* INPUT AREA */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              isEscalated
                ? "Message the support agent..."
                : "Type your message..."
            }
            disabled={isTyping || !conversationId}
            className="flex-1 rounded-full px-5 py-2 bg-gray-100 dark:bg-gray-800 border-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping || !conversationId}
            className="rounded-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
