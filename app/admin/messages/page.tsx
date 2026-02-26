"use client"

import { useState } from "react"
import { Send, Paperclip, Smile, Reply, Trash2, Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const messagesData = [
  { id: 1, from: "Sarah K.", message: "New job request for Web Development project", time: "2 mins ago", unread: true, replies: 2, category: "Jobs" },
  { id: 2, from: "John D.", message: "Dispute raised on UI Design job - Quality issues", time: "15 mins ago", unread: true, replies: 1, category: "Disputes" },
  { id: 3, from: "Alice T.", message: "Payment confirmation for completed task", time: "1 hour ago", unread: false, replies: 0, category: "Payments" },
  { id: 4, from: "Mark L.", message: "Request for job deadline extension", time: "3 hours ago", unread: false, replies: 3, category: "Jobs" },
  { id: 5, from: "Emma B.", message: "Verification documents submitted", time: "Yesterday", unread: false, replies: 1, category: "Verifications" },
  { id: 6, from: "Tom C.", message: "System notification: Maintenance scheduled", time: "2 days ago", unread: false, replies: 0, category: "System" },
]

const messageThreads: Record<number, Array<{ sender: string; text: string; time: string; type: "sent" | "received" }>> = {
  1: [
    { sender: "Sarah K.", text: "Hi, I have a new web development project. Can we discuss the timeline?", time: "2:30 PM", type: "received" },
    { sender: "Admin", text: "Sure! Tell me more about the project scope.", time: "2:35 PM", type: "sent" },
    { sender: "Sarah K.", text: "Budget is KES 150,000 and deadline is Feb 15", time: "2:40 PM", type: "received" },
  ],
  2: [
    { sender: "John D.", text: "The design doesn't match our specifications", time: "1:20 PM", type: "received" },
    { sender: "Admin", text: "We'll review this and contact the designer", time: "1:25 PM", type: "sent" },
  ],
  3: [
    { sender: "Alice T.", text: "Payment of KES 50,000 has been processed", time: "12:00 PM", type: "received" },
  ],
  4: [
    { sender: "Mark L.", text: "Can we extend the deadline by 5 days?", time: "9:15 AM", type: "received" },
    { sender: "Admin", text: "Let me check with the client", time: "9:20 AM", type: "sent" },
    { sender: "Admin", text: "Extension approved until Feb 25", time: "10:00 AM", type: "sent" },
  ],
  5: [
    { sender: "Emma B.", text: "I've submitted all required documents", time: "3:45 PM", type: "received" },
    { sender: "Admin", text: "Documents received. Under review", time: "4:00 PM", type: "sent" },
  ],
  6: [
    { sender: "System", text: "Scheduled maintenance on Feb 10, 2-4 AM UTC", time: "10:00 AM", type: "received" },
  ],
}

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(1)
  const [replyText, setReplyText] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [messages, setMessages] = useState(messagesData)
  const [showMobileChat, setShowMobileChat] = useState(false)

  const currentThread = selectedMessage ? messageThreads[selectedMessage] : []
  const selectedMessageData = messages.find(m => m.id === selectedMessage)

  const filteredMessages = messages.filter(m =>
    m.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendReply = () => {
    if (replyText.trim() && selectedMessage) {
      if (!messageThreads[selectedMessage]) {
        messageThreads[selectedMessage] = []
      }
      messageThreads[selectedMessage].push({
        sender: "Admin",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "sent",
      })
      setReplyText("")
      // Mark as read
      setMessages(messages.map(m => m.id === selectedMessage ? { ...m, unread: false } : m))
    }
  }

  const handleDeleteChat = (messageId: number) => {
    setMessages(messages.filter(m => m.id !== messageId))
    if (selectedMessage === messageId) {
      setSelectedMessage(null)
      setShowMobileChat(false)
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View and respond to platform notifications and messages</p>
      </div>

      {/* Mobile and Desktop Layout */}
      <div className={`${showMobileChat ? 'hidden' : 'block'} lg:block`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
          {/* Messages List */}
          <Card className="lg:col-span-1 border-0 shadow-lg p-0 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg.id)
                    setShowMobileChat(true)
                  }}
                  className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedMessage === msg.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  } ${msg.unread ? "bg-yellow-50 dark:bg-yellow-900/10" : ""}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0" />
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{msg.from}</h3>
                    </div>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 ml-5">{msg.message}</p>
                  <div className="flex items-center gap-2 mt-2 ml-5">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      msg.category === "Jobs" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" :
                      msg.category === "Disputes" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                      msg.category === "Payments" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" :
                      msg.category === "Verifications" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" :
                      "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}>
                      {msg.category}
                    </span>
                    {msg.replies > 0 && (
                      <span className="text-xs text-gray-500">+{msg.replies} replies</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Message Thread */}
          <Card className="lg:col-span-2 border-0 shadow-lg p-0 overflow-hidden flex flex-col">
            {selectedMessageData ? (
              <>
                {/* Thread Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-800">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button 
                        onClick={() => setShowMobileChat(false)}
                        className="lg:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 flex-shrink-0"
                      >
                        ←
                      </button>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{selectedMessageData.from}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">{selectedMessageData.message}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button className="p-2 hover:bg-blue-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
                        <Reply size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteChat(selectedMessage)}
                        className="p-2 hover:bg-red-200 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages Thread */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {currentThread.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        msg.type === "sent"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none"
                      }`}>
                        <p className="text-sm font-medium mb-1">{msg.sender}</p>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-2 ${msg.type === "sent" ? "text-blue-200" : "text-gray-500"}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Box */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex gap-2 items-end">
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
                      <Paperclip size={20} />
                    </button>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          handleSendReply()
                        }
                      }}
                      placeholder="Type your reply... (Ctrl+Enter to send)"
                      rows={3}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className="p-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white rounded-lg transition-colors flex-shrink-0"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">Select a message to view thread</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Mobile Chat View */}
      {showMobileChat && selectedMessageData && (
        <Card className="fixed inset-0 lg:hidden border-0 shadow-lg p-0 overflow-hidden flex flex-col rounded-none z-50">
          {/* Thread Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-800 flex items-center justify-between">
            <button 
              onClick={() => setShowMobileChat(false)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
            >
              ←
            </button>
            <div className="flex-1 px-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{selectedMessageData.from}</h2>
            </div>
            <button 
              onClick={() => handleDeleteChat(selectedMessage)}
              className="p-2 hover:bg-red-200 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentThread.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-3 rounded-lg ${
                  msg.type === "sent"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none"
                }`}>
                  <p className="text-sm font-medium mb-1">{msg.sender}</p>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-2 ${msg.type === "sent" ? "text-blue-200" : "text-gray-500"}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Box */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex gap-2 items-end">
              <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
                <Paperclip size={20} />
              </button>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleSendReply()
                  }
                }}
                placeholder="Type your reply..."
                rows={2}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="p-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white rounded-lg transition-colors flex-shrink-0"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
