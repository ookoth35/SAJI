"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

interface PaymentFormProps {
  paymentMethod: string
  onSubmit: () => void
}

export function PaymentForm({ paymentMethod, onSubmit }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    phone: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCVC: "",
    email: "",
  })

  const [isProcessing, setIsProcessing] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      onSubmit()
    }, 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {paymentMethod === "mpesa" && (
        <div className="space-y-4">
          <Card className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Enter your M-Pesa registered phone number. You'll receive a prompt to authorize the payment.
            </p>
          </Card>

          <div className="space-y-2">
            <Label>M-Pesa Phone Number</Label>
            <Input
              placeholder="+254 700 000 000"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="h-11 rounded-lg border-2 border-border focus-visible:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>Email (for receipt)</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-11 rounded-lg border-2 border-border focus-visible:border-primary"
            />
          </div>
        </div>
      )}

      {paymentMethod === "card" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Cardholder Name</Label>
            <Input
              placeholder="John Doe"
              value={formData.cardName}
              onChange={(e) => handleChange("cardName", e.target.value)}
              className="h-11 rounded-lg border-2 border-border focus-visible:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>Card Number</Label>
            <Input
              placeholder="4532 1234 5678 9010"
              value={formData.cardNumber}
              onChange={(e) => handleChange("cardNumber", e.target.value)}
              className="h-11 rounded-lg border-2 border-border focus-visible:border-primary font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input
                placeholder="MM/YY"
                value={formData.cardExpiry}
                onChange={(e) => handleChange("cardExpiry", e.target.value)}
                className="h-11 rounded-lg border-2 border-border focus-visible:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label>CVC</Label>
              <Input
                placeholder="123"
                value={formData.cardCVC}
                onChange={(e) => handleChange("cardCVC", e.target.value)}
                className="h-11 rounded-lg border-2 border-border focus-visible:border-primary font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-11 rounded-lg border-2 border-border focus-visible:border-primary"
            />
          </div>
        </div>
      )}

      {paymentMethod === "paypal" && (
        <div className="space-y-4">
          <Card className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              You'll be redirected to PayPal to complete your payment securely.
            </p>
          </Card>

          <div className="space-y-2">
            <Label>PayPal Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-11 rounded-lg border-2 border-border focus-visible:border-primary"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-2 bg-transparent rounded-lg h-11"
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isProcessing}
          className="flex-1 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold h-11"
        >
          {isProcessing ? "Processing..." : "Continue to Confirmation"}
        </Button>
      </div>
    </form>
  )
}
