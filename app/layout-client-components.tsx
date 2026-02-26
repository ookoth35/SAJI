"use client"

import dynamic from "next/dynamic"

// Client component wrapper for EmailSubscriptionPopup with SSR disabled
const EmailSubscriptionPopup = dynamic(
  () => import("@/components/email-subscription-popup").then(mod => ({ default: mod.EmailSubscriptionPopup })),
  { ssr: false }
)

export function LayoutClientComponents({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <EmailSubscriptionPopup />
    </>
  )
}
