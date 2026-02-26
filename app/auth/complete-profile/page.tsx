"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2 } from "lucide-react"

export default function CompleteProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Read query params - both from signup and OAuth
  const emailFromQuery = searchParams.get("email") || ""
  const firstNameFromQuery = searchParams.get("firstName") || ""
  const lastNameFromQuery = searchParams.get("lastName") || ""
  const phoneFromQuery = searchParams.get("phone") || ""
  const roleFromQuery = searchParams.get("role") || "client"
  const oauthMethod = searchParams.get("method") || null
  const googleId = searchParams.get("googleId") || null
  const appleId = searchParams.get("appleId") || null
  const accessToken = searchParams.get("accessToken") || null

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    firstName: firstNameFromQuery,
    lastName: lastNameFromQuery,
    phone: phoneFromQuery,
    role: roleFromQuery,
    bio: "",
    email: emailFromQuery,
    oauthMethod,
    googleId,
    appleId,
    accessToken,
  })

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      firstName: firstNameFromQuery,
      lastName: lastNameFromQuery,
      phone: phoneFromQuery,
      role: roleFromQuery,
      email: emailFromQuery,
    }))
  }, [emailFromQuery, firstNameFromQuery, lastNameFromQuery, phoneFromQuery, roleFromQuery])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")

      console.log("[v0] Submitting profile completion:", {
        ...formData,
        accessToken: formData.accessToken ? "***" : null,
      })

      const response = await fetch("/api/users/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("[v0] Profile completion error:", data)
        throw new Error(data.error || data.message || "Failed to complete profile")
      }

      console.log("[v0] Profile completed successfully")

      // Save token and user if provided
      if (data.token) {
        localStorage.setItem("token", data.token)
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user))
      }

      setSuccess(true)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred"
      console.error("[v0] Error completing profile:", err)
      setError(errorMsg)
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Profile Complete!</h1>
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          {oauthMethod && (
            <CardDescription>
              Great! We've pre-filled your info from {oauthMethod === "google" ? "Google" : "Apple"}. Just add your phone number.
            </CardDescription>
          )}
          <CardDescription>Email: {formData.email || "(optional)"}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="John"
                  disabled={oauthMethod ? true : false}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Doe"
                  disabled={oauthMethod ? true : false}
                  required
                />
              </div>
            </div>

            {/* Email (read-only if from OAuth) */}
            {formData.email && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled={true}
                  className="bg-muted"
                />
              </div>
            )}

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <span className="flex items-center text-sm text-muted-foreground">+254</span>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="712345678"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label>What's your role?</Label>
              <RadioGroup value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                <div className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client" className="flex-1 cursor-pointer">
                    <span className="font-medium">Client</span>
                    <span className="text-xs text-muted-foreground block">Looking for services</span>
                  </Label>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="professional" id="professional" />
                  <Label htmlFor="professional" className="flex-1 cursor-pointer">
                    <span className="font-medium">Professional</span>
                    <span className="text-xs text-muted-foreground block">Providing services</span>
                  </Label>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="shopkeeper" id="shopkeeper" />
                  <Label htmlFor="shopkeeper" className="flex-1 cursor-pointer">
                    <span className="font-medium">Shopkeeper</span>
                    <span className="text-xs text-muted-foreground block">Selling products</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Completing Profile..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
