'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Search } from 'lucide-react'
import { useState } from 'react'

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(1)
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const conversations = [
    {
      id: 1,
      name: 'John Mwangi',
      avatar: 'J',
      lastMessage: 'Thanks for the great service!',
      time: '2 mins ago',
      unread: 0,
      online: true,
    },
    {
      id: 2,
      name: 'Sarah Kipchoge',
      avatar: 'S',
      lastMessage: 'Can you start earlier tomorrow?',
      time: '1 hour ago',
      unread: 2,
      online: false,
    },
    {
      id: 3,
      name: 'Alice Johnson',
      avatar: 'A',
      lastMessage: 'Perfect, see you then!',
      time: '5 hours ago',
      unread: 0,
      online: true,
    },
  ]

  const messages = [
    { id: 1, sender: 'John Mwangi', text: 'Hi, I need house cleaning service', time: '10:00 AM', isOwn: false },
    { id: 2, sender: 'You', text: 'Sure! I can help. What date works for you?', time: '10:05 AM', isOwn: true },
    { id: 3, sender: 'John Mwangi', text: 'This Saturday would be perfect', time: '10:10 AM', isOwn: false },
    { id: 4, sender: 'You', text: 'Great! I am available. Booking confirmed.', time: '10:12 AM', isOwn: true },
    { id: 5, sender: 'John Mwangi', text: 'Thanks for the great service!', time: '10:15 AM', isOwn: false },
  ]

  const currentConversation = conversations.find(c => c.id === selectedConversation)

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessageText('')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground">Stay connected with professionals and clients</p>
      </div>

      {/* Messages Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="p-4 flex flex-col">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-lg"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedConversation === conv.id ? 'bg-primary/10 border border-primary' : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-sm">{conv.avatar}</span>
                    </div>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{conv.name}</p>
                      <p className="text-xs text-muted-foreground">{conv.time}</p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {conv.unread}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 p-6 flex flex-col">
          {currentConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-sm">{currentConversation.avatar}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{currentConversation.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {currentConversation.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg">Call</Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="rounded-lg"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="rounded-lg gap-2"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
