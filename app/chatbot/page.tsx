"use client"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  X,
  Sparkles,
  Phone,
  Loader2,
  ShieldCheck,
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const escalationKeywords = [
    "real agent",
    "human agent",
    "talk to human",
    "human support",
    "real person",
    "speak to human",
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const checkEscalation = (text: string) => {
    const lower = text.toLowerCase()
    return escalationKeywords.some((k) => lower.includes(k))
  }

  const generateResponse = (text: string) => {
    const lower = text.toLowerCase()

    if (lower.includes("order") || lower.includes("delivery"))
      return "I can help track your order. Please share your order number."

    if (lower.includes("payment") || lower.includes("refund"))
      return "Let me assist with your payment concern. Could you provide more details?"

    if (lower.includes("account") || lower.includes("password"))
      return "For account-related issues, please confirm your registered email address."

    return "Thank you for reaching out. Could you provide a little more detail so I can assist better?"
  }

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    if (checkEscalation(inputValue)) {
      setIsEscalated(true)
      setIsTyping(true)

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "Connecting you with a human support specialist. Please wait...",
            sender: "ai",
            timestamp: new Date(),
            escalated: true,
          },
        ])
        setIsTyping(false)
      }, 1200)

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "Hello 👋 I'm Sarah from SAJI Support. I’ll personally assist you from here.",
            sender: "human",
            timestamp: new Date(),
          },
        ])
      }, 2500)

      return
    }

    setIsTyping(true)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: generateResponse(inputValue),
          sender: "ai",
          timestamp: new Date(),
        },
      ])
      setIsTyping(false)
    }, 1000)
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white text-lg">
                SAJI Support
              </h1>
              <p className="text-xs text-gray-500">
                Secure AI & Human Assistance
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
              <span>Typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ESCALATION STATUS */}
      {isEscalated && (
        <div className="bg-blue-50 border-t border-blue-200 text-blue-700 text-xs text-center py-2">
          You are now connected to a human support specialist.
        </div>
      )}

      {/* INPUT AREA */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            disabled={isTyping}
            className="flex-1 rounded-full px-5 py-2 bg-gray-100 dark:bg-gray-800 border-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="rounded-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}