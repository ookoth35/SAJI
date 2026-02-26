"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function SupportAgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(false)
  const [isAgent, setIsAgent] = useState(false)

  // Only check agent status on protected pages (not login or public pages)
  const isLoginPage = pathname === "/support-agent/login"
  const isProtectedPage = !isLoginPage

  useEffect(() => {
    if (!isProtectedPage) {
      setIsChecking(false)
      return
    }

    const checkAgentStatus = async () => {
      try {
        const token = localStorage.getItem("token")
        const user = localStorage.getItem("user")

        if (!token || !user) {
          router.push("/support-agent/login")
          return
        }

        const userData = JSON.parse(user)

        // Check if user is registered as a support agent
        const res = await fetch("/api/support-agent/check-status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          if (data.isAgent) {
            setIsAgent(true)
            setIsChecking(false)
          } else {
            router.push("/support-agent/login")
          }
        } else {
          router.push("/support-agent/login")
        }
      } catch (error) {
        console.error("[v0] Error checking agent status:", error)
        router.push("/support-agent/login")
      }
    }

    setIsChecking(true)
    checkAgentStatus()
  }, [router, isProtectedPage])

  // On login page, don't show verification screen
  if (isLoginPage) {
    return <>{children}</>
  }

  // On protected pages, show verification screen while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying agent access...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
