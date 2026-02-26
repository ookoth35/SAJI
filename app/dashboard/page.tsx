'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Calendar, MessageSquare, Wallet, Loader2 } from 'lucide-react'
import { useBookings } from '@/hooks/useBookings'
import { useWallet } from '@/hooks/useWallet'
import { useAuthContext } from '@/lib/auth-context'

export default function DashboardPage() {
  const { user } = useAuthContext()
  const { bookings, isLoading: bookingsLoading } = useBookings()
  const { wallet, isLoading: walletLoading } = useWallet()

  const activeBookings = bookings.filter((b) => b.status === 'confirmed').length
  const totalSpending = bookings.reduce((sum, b) => sum + (b.amount || 0), 0)

  const stats = [
    { 
      label: 'Active Bookings', 
      value: activeBookings.toString(), 
      icon: Calendar, 
      color: 'bg-blue-500/10 text-blue-600',
      loading: bookingsLoading 
    },
    { 
      label: 'Unread Messages', 
      value: '5', 
      icon: MessageSquare, 
      color: 'bg-green-500/10 text-green-600',
      loading: false 
    },
    { 
      label: 'Wallet Balance', 
      value: wallet ? `KES ${wallet.balance}` : 'KES 0', 
      icon: Wallet, 
      color: 'bg-purple-500/10 text-purple-600',
      loading: walletLoading 
    },
    { 
      label: 'Total Spending', 
      value: `KES ${totalSpending}`, 
      icon: TrendingUp, 
      color: 'bg-amber-500/10 text-amber-600',
      loading: bookingsLoading 
    },
  ]

  const statusColor = {
    confirmed: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.fullName?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">Here's what's happening with your services today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                {stat.loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Recent Bookings</h2>
          <Button variant="outline" size="sm" className="rounded-lg">
            View All
          </Button>
        </div>

        {bookingsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No bookings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Service
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium">Service #{booking.serviceId}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(booking.scheduledDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusColor[booking.status as keyof typeof statusColor]
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold">KES {booking.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button className="h-12 rounded-lg font-semibold gap-2">Browse Services</Button>
          <Button variant="outline" className="h-12 rounded-lg font-semibold gap-2">
            View Messages
          </Button>
          <Button variant="outline" className="h-12 rounded-lg font-semibold gap-2">
            Manage Wallet
          </Button>
        </div>
      </Card>
    </div>
  )
}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                {stat.loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Recent Bookings</h2>
          <Button variant="outline" size="sm" className="rounded-lg">
            View All
          </Button>
        </div>

        {bookingsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No bookings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Service
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium">Service #{booking.serviceId}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(booking.scheduledDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusColor[booking.status as keyof typeof statusColor]
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold">KES {booking.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button className="h-12 rounded-lg font-semibold gap-2">Browse Services</Button>
          <Button variant="outline" className="h-12 rounded-lg font-semibold gap-2">
            View Messages
          </Button>
          <Button variant="outline" className="h-12 rounded-lg font-semibold gap-2">
            Manage Wallet
          </Button>
        </div>
      </Card>
    </div>
  )
}
