'use client'

import type React from 'react'
import type { Metadata } from 'next'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LayoutGrid, MessageSquare, Wallet, Settings, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const navItems = [
    { label: 'Overview', icon: LayoutGrid, href: '/dashboard' },
    { label: 'Bookings', icon: LayoutGrid, href: '/dashboard/bookings' },
    { label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
    { label: 'Wallet', icon: Wallet, href: '/dashboard/wallet' },
    { label: 'Profile', icon: Settings, href: '/dashboard/profile' },
  ]

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} md:w-64 bg-card border-r border-border transition-all duration-300 overflow-hidden fixed md:relative h-full z-40`}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-bold text-white">S</span>
            </div>
            <span className="font-bold text-lg hidden md:inline">SAJI</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors text-foreground"
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-border">
          <Button variant="outline" className="w-full justify-start gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 md:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex-1 ml-4 md:ml-0">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden md:block">{session?.user?.email}</div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-medium">{session?.user?.name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
