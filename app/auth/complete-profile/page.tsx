"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function CompleteProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Read query params
  const emailFromQuery = searchParams.get("email") || ""
  const firstNameFromQuery = searchParams.get("firstName") || ""
  const lastNameFromQuery = searchParams.get("lastName") || ""
  const phoneFromQuery = searchParams.get("phone") || ""
  const roleFromQuery = searchParams.get("role") || "client"

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: firstNameFromQuery,
    lastName: lastNameFromQuery,
    phone: phoneFromQuery,
    role: roleFromQuery,
    bio: "",
    email: emailFromQuery,
  })

  useEffect(() => {
    setFormData({
      firstName: firstNameFromQuery,
      lastName: lastNameFromQuery,
      phone: phoneFromQuery,
      role: roleFromQuery,
      bio: "",
      email: emailFromQuery,
    })
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

const response = await fetch("/api/users/complete-profile", {
  method: "POST",
  headers: { 
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`  // <--- send JWT
  },
  body: JSON.stringify(formData),
})

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to complete profile")
      }

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
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
                  required
                />
              </div>
            </div>

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