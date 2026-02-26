'use client'

import { useState, useEffect } from 'react'
import { Mail, Send, Trash2, Download, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface Subscriber {
  email: string
  subscribedAt: string
  deviceId: string
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [selectedRecipients, setSelectedRecipients] = useState<'all' | 'individual'>('all')
  const [selectedEmail, setSelectedEmail] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailContent, setEmailContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendMessage, setSendMessage] = useState('')

  useEffect(() => {
    loadSubscribers()
  }, [])

  useEffect(() => {
    const filtered = subscribers.filter((sub) =>
      sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredSubscribers(filtered)
  }, [searchTerm, subscribers])

  const loadSubscribers = () => {
    try {
      const data = JSON.parse(localStorage.getItem('saji_subscribers') || '[]')
      setSubscribers(data)
      setFilteredSubscribers(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load subscribers:', error)
      setIsLoading(false)
    }
  }

  const deleteSubscriber = (email: string) => {
    if (confirm(`Remove ${email} from subscribers?`)) {
      const updated = subscribers.filter((sub) => sub.email !== email)
      setSubscribers(updated)
      localStorage.setItem('saji_subscribers', JSON.stringify(updated))
      setFilteredSubscribers(updated.filter((sub) =>
        sub.email.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    }
  }

  const handleSendEmail = async () => {
    if (!emailSubject || !emailContent) {
      setSendMessage('Please fill in subject and content')
      return
    }

    setIsSending(true)
    setSendMessage('')

    try {
      const recipients =
        selectedRecipients === 'all'
          ? subscribers.map((s) => s.email)
          : [selectedEmail]

      const response = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          subject: emailSubject,
          content: emailContent,
        }),
      })

      if (!response.ok) throw new Error('Failed to send emails')

      setSendMessage(`Email sent to ${recipients.length} recipient(s)`)
      setTimeout(() => {
        setShowEmailDialog(false)
        setEmailSubject('')
        setEmailContent('')
        setSendMessage('')
      }, 2000)
    } catch (error) {
      setSendMessage('Failed to send email. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const exportSubscribers = () => {
    const csv = [
      ['Email', 'Subscribed At'].join(','),
      ...subscribers.map((s) => [s.email, s.subscribedAt].join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Email Subscribers
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage your newsletter subscribers and send campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportSubscribers}
            variant="outline"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => setShowEmailDialog(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Mail className="w-4 h-4" />
            Send Email
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Subscribers
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {subscribers.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This Month
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {subscribers.filter(
                  (s) =>
                    new Date(s.subscribedAt).getMonth() ===
                    new Date().getMonth()
                ).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
              <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Today
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {subscribers.filter(
                  (s) =>
                    new Date(s.subscribedAt).toDateString() ===
                    new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Subscribers Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Subscribed
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center">
                    <div className="inline-block animate-spin">Loading...</div>
                  </td>
                </tr>
              ) : filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No subscribers found
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.email}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {subscriber.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedEmail(subscriber.email)
                            setSelectedRecipients('individual')
                            setShowEmailDialog(true)
                          }}
                          className="gap-1"
                        >
                          <Send className="w-4 h-4" />
                          Send
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSubscriber(subscriber.email)}
                          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email Campaign</DialogTitle>
            <DialogDescription>
              Send a professional email to your subscribers
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Recipient Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Recipients
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recipients"
                    value="all"
                    checked={selectedRecipients === 'all'}
                    onChange={(e) =>
                      setSelectedRecipients(e.target.value as 'all' | 'individual')
                    }
                  />
                  <span className="text-sm">All Subscribers ({subscribers.length})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recipients"
                    value="individual"
                    checked={selectedRecipients === 'individual'}
                    onChange={(e) =>
                      setSelectedRecipients(e.target.value as 'all' | 'individual')
                    }
                  />
                  <span className="text-sm">Individual</span>
                </label>
              </div>

              {selectedRecipients === 'individual' && (
                <select
                  value={selectedEmail}
                  onChange={(e) => setSelectedEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select an email...</option>
                  {subscribers.map((s) => (
                    <option key={s.email} value={s.email}>
                      {s.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Subject
              </label>
              <Input
                placeholder="Email subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Message
              </label>
              <textarea
                placeholder="Write your email content here..."
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {sendMessage && (
              <div
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  sendMessage.includes('sent')
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                }`}
              >
                {sendMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEmailDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={isSending}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
