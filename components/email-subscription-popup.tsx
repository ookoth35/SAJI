"use client"

import { useState, useEffect } from "react"
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface SubscriberData {
  email: string
  subscribedAt: string
  deviceId: string
}

export function EmailSubscriptionPopup() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  // Generate stable device fingerprint
  const generateDeviceId = () => {
    const base = `${navigator.userAgent}-${navigator.language}-${navigator.platform}`
    return btoa(base).substring(0, 32)
  }

  useEffect(() => {
    const deviceId = generateDeviceId()
    const subscribers: SubscriberData[] = JSON.parse(
      localStorage.getItem("saji_subscribers") || "[]"
    )

    const alreadySubscribed = subscribers.some(
      (sub) => sub.deviceId === deviceId
    )

    if (!alreadySubscribed) {
      const timer = setTimeout(() => {
        setOpen(true)
      }, 2500)

      return () => clearTimeout(timer)
    }
  }, [])

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      setFeedback({
        type: "error",
        message: "Please enter a valid email address.",
      })
      return
    }

    setIsLoading(true)
    setFeedback({ type: null, message: "" })

    try {
      const deviceId = generateDeviceId()
      
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          deviceId,
          subscribedAt: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: data.message || "Subscription failed. Please try again.",
        })
        setIsLoading(false)
        return
      }

      console.log("[v0] Newsletter subscription successful:", data)

      // Store in localStorage for duplicate prevention
      const subscribers: SubscriberData[] = JSON.parse(
        localStorage.getItem("saji_subscribers") || "[]"
      )
      
      const newSubscriber: SubscriberData = {
        email,
        subscribedAt: new Date().toISOString(),
        deviceId,
      }
      
      subscribers.push(newSubscriber)
      localStorage.setItem("saji_subscribers", JSON.stringify(subscribers))

      setFeedback({
        type: "success",
        message: data.message || "You're subscribed! Check your inbox soon.",
      })

      setEmail("")

      setTimeout(() => {
        setOpen(false)
        setFeedback({ type: null, message: "" })
      }, 2000)
    } catch (error) {
      console.error("[v0] Subscription error:", error)
      setFeedback({
        type: "error",
        message: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-md rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-md">
            <Mail className="h-6 w-6 text-white" />
          </div>

          <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
            Stay in the Loop
          </DialogTitle>

          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Get product updates, exclusive offers, and important announcements.
            No spam. Unsubscribe anytime.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubscribe} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-11 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus-visible:ring-2 focus-visible:ring-blue-600"
            />
          </div>

          {feedback.type && (
            <div
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {feedback.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all duration-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Subscribing...
              </span>
            ) : (
              "Subscribe"
            )}
          </Button>

          <p className="text-center text-xs text-gray-400">
            We respect your privacy. Your email is safe with us.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
