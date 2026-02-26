'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, TrendingUp, DollarSign, AlertCircle } from 'lucide-react'
import { useAuthContext } from '@/lib/auth-context'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user } = useAuthContext()

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, router])

  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Monthly Revenue', value: 'KES 2.4M', icon: DollarSign, color: 'bg-green-500/10 text-green-600' },
    { label: 'Active Bookings', value: '456', icon: TrendingUp, color: 'bg-purple-500/10 text-purple-600' },
    { label: 'Pending Verification', value: '23', icon: AlertCircle, color: 'bg-amber-500/10 text-amber-600' },
  ]

  const recentUsers = [
    { id: 1, name: 'John Mwangi', email: 'john@example.com', role: 'professional', status: 'pending' },
    { id: 2, name: 'Alice Johnson', email: 'alice@example.com', role: 'client', status: 'verified' },
    { id: 3, name: 'Bob Smith', email: 'bob@example.com', role: 'professional', status: 'verified' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform management and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Users Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Recent Users</h2>
          <Button variant="outline" size="sm" className="rounded-lg">View All Users</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium">{user.name}</td>
                  <td className="py-3 px-4 text-sm">{user.email}</td>
                  <td className="py-3 px-4 text-sm capitalize">{user.role}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Admin Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-12 rounded-lg font-semibold">Manage Users</Button>
          <Button variant="outline" className="h-12 rounded-lg font-semibold">View Disputes</Button>
          <Button variant="outline" className="h-12 rounded-lg font-semibold">Settings</Button>
          <Button variant="outline" className="h-12 rounded-lg font-semibold">Reports</Button>
        </div>
      </Card>
    </div>
  )
}

  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Monthly Revenue', value: 'KES 2.4M', icon: DollarSign, color: 'bg-green-500/10 text-green-600' },
    { label: 'Active Bookings', value: '456', icon: TrendingUp, color: 'bg-purple-500/10 text-purple-600' },
    { label: 'Pending Verification', value: '23', icon: AlertCircle, color: 'bg-amber-500/10 text-amber-600' },
  ]

  const recentUsers = [
    { id: 1, name: 'John Mwangi', email: 'john@example.com', role: 'professional', status: 'pending' },
    { id: 2, name: 'Alice Johnson', email: 'alice@example.com', role: 'client', status: 'verified' },
    { id: 3, name: 'Bob Smith', email: 'bob@example.com', role: 'professional', status: 'verified' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform management and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Users Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Recent Users</h2>
          <Button variant="outline" size="sm" className="rounded-lg">View All Users</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium">{user.name}</td>
                  <td className="py-3 px-4 text-sm">{user.email}</td>
                  <td className="py-3 px-4 text-sm capitalize">{user.role}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Admin Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-12 rounded-lg font-semibold">Manage Users</Button>
          <Button variant="outline" className="h-12 rounded-lg font-semibold">View Disputes</Button>
          <Button variant="outline" className="h-12 rounded-lg font-semibold">Settings</Button>
          <Button variant="outline" className="h-12 rounded-lg font-semibold">Reports</Button>
        </div>
      </Card>
    </div>
  )
}
