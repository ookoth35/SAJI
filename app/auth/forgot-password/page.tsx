"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Phone, ArrowLeft, CheckCircle2, Lock, Eye, EyeOff, Shield, Clock } from "lucide-react"

function ForgotPasswordContent() {
  const router = useRouter()
  const [step, setStep] = useState<"method" | "identifier" | "code" | "reset" | "success">("method")
  const [method, setMethod] = useState<"email" | "phone">("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [codeKey, setCodeKey] = useState("")
  const [maskedIdentifier, setMaskedIdentifier] = useState("")
  const [resetToken, setResetToken] = useState("")

  const handleMethodSelect = (selectedMethod: "email" | "phone") => {
    setMethod(selectedMethod)
    setStep("identifier")
    setError("")
  }

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const identifier = method === "email" ? email : phone

    if (!identifier) {
      setError(`Please enter your ${method}`)
      return
    }

    if (method === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (method === "phone" && !/^\+?[1-9]\d{1,14}$/.test(phone.replace(/\D/g, ""))) {
      setError("Please enter a valid phone number")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: method === "email" ? email : undefined,
          phone: method === "phone" ? phone : undefined,
          method,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Failed to send code")
        setIsLoading(false)
        return
      }

      console.log("[v0] Code sent successfully:", data)

      setCodeKey(data.data.codeKey)
      setMaskedIdentifier(data.data.maskedIdentifier)
      setStep("code")
    } catch (err) {
      console.error("[v0] Error:", err)
      setError("Failed to send verification code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!verificationCode) {
      setError("Please enter the verification code")
      return
    }

    if (verificationCode.length !== 6) {
      setError("Verification code must be 6 digits")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codeKey,
          code: verificationCode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Invalid verification code")
        setIsLoading(false)
        return
      }

      console.log("[v0] Code verified:", data)

      setResetToken(data.data.resetToken)
      setStep("reset")
    } catch (err) {
      console.error("[v0] Error:", err)
      setError("Failed to verify code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codeKey,
          newPassword,
          confirmPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Failed to reset password")
        setIsLoading(false)
        return
      }

      console.log("[v0] Password reset successful")
      setStep("success")
    } catch (err) {
      console.error("[v0] Error:", err)
      setError("Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Password Reset Complete</h1>
            <p className="text-muted-foreground">Your password has been successfully reset.</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <p className="text-foreground text-center mb-4">You can now log in with your new password.</p>
          </div>

          <Link href="/auth/signin">
            <Button className="w-full h-11 rounded-lg">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Desktop Hero */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between relative overflow-hidden bg-primary text-primary-foreground p-10">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <span className="text-lg font-bold">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight">SAJI</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-3">Secure Your Account</h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">We'll help you reset your password securely with verification.</p>
        </div>

        <div className="relative z-10 space-y-5">
          {[
            { icon: Shield, title: "Secure Process", desc: "Your account is protected with verification" },
            { icon: Clock, title: "Quick Reset", desc: "Takes less than 5 minutes" },
            { icon: Mail, title: "Multiple Methods", desc: "Reset via email or phone" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-white/60 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-white/40 text-xs">&copy; {new Date().getFullYear()} SAJI. All rights reserved.</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-base font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-lg font-bold text-foreground">SAJI</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Reset Password</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {step === "method" && "Choose how you want to verify your identity"}
            {step === "identifier" && `Enter your ${method} address`}
            {step === "code" && "Enter the verification code we sent"}
            {step === "reset" && "Create your new password"}
          </p>

          {/* Progress Bar */}
          {step !== "method" && (
            <div className="flex gap-1.5 mb-6">
              <div className={`flex-1 h-1.5 rounded-full ${["method", "identifier"].includes(step) ? "bg-primary" : "bg-muted"}`} />
              <div className={`flex-1 h-1.5 rounded-full ${["code"].includes(step) ? "bg-primary" : "bg-muted"}`} />
              <div className={`flex-1 h-1.5 rounded-full ${step === "reset" ? "bg-primary" : "bg-muted"}`} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Method Selection */}
          {step === "method" && (
            <div className="space-y-4">
              <button
                onClick={() => handleMethodSelect("email")}
                className="w-full p-4 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Reset via Email</p>
                  <p className="text-xs text-muted-foreground">Get a code sent to your email</p>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect("phone")}
                className="w-full p-4 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Reset via Phone</p>
                  <p className="text-xs text-muted-foreground">Get a code sent via SMS</p>
                </div>
              </button>

              <Link href="/auth/signin" className="flex items-center justify-center gap-2 text-primary hover:underline font-medium text-sm mt-6">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          )}

          {/* Step 2: Enter Identifier */}
          {step === "identifier" && (
            <form onSubmit={handleIdentifierSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {method === "email" ? "Email Address" : "Phone Number"}
                </label>
                <div className="relative">
                  {method === "email" ? (
                    <>
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-10 rounded-xl border-border bg-card"
                        disabled={isLoading}
                      />
                    </>
                  ) : (
                    <>
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="+254700000000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 h-10 rounded-xl border-border bg-card"
                        disabled={isLoading}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep("method")}
                  variant="outline"
                  className="flex-1 h-10 rounded-xl"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Code"}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Verify Code */}
          {step === "code" && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Verification Code</label>
                <p className="text-xs text-muted-foreground mb-2">Code sent to {maskedIdentifier}</p>
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-10 rounded-xl border-border bg-card text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>

              <p className="text-xs text-muted-foreground">Code expires in 10 minutes</p>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep("identifier")}
                  variant="outline"
                  className="flex-1 h-10 rounded-xl"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </div>
            </form>
          )}

          {/* Step 4: Reset Password */}
          {step === "reset" && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 h-10 rounded-xl border-border bg-card"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-10 rounded-xl border-border bg-card"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep("code")}
                  variant="outline"
                  className="flex-1 h-10 rounded-xl"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />
}
