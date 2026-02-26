"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Headphones, AlertCircle } from "lucide-react"

export default function SupportAgentLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // First, authenticate with regular signin
      const signInRes = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!signInRes.ok) {
        const data = await signInRes.json()
        throw new Error(data.message || "Invalid email or password")
      }

      const signInData = await signInRes.json()
      const token = signInData.token
      const user = signInData.user

      // Save auth data
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      // Check if user is a support agent
      const agentRes = await fetch("/api/support-agent/check-status", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const agentData = await agentRes.json()

      if (!agentData.isAgent) {
        setError("You are not registered as a support agent. Please contact your administrator.")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setIsLoading(false)
        return
      }

      console.log("[v0] Support agent logged in:", user.email)
      router.push("/support-agent/dashboard")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed"
      console.error("[v0] Login error:", err)
      setError(errorMsg)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-blue-950 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-xl shadow-lg">
              <Headphones className="w-6 h-6" />
            </div>
          </div>
          <CardTitle className="text-2xl">Support Agent Portal</CardTitle>
          <CardDescription>Access your customer support dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@saji.dev"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Logging in..." : "Log In as Support Agent"}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-900">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <p>Email: professional@saji.dev</p>
            <p>Password: password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
