'use client'

import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, DollarSign, CheckCircle, Clock, Plus } from 'lucide-react'

export default function ProfessionalDashboardPage() {
  const { data: session } = useSession()

  const stats = [
    { label: 'This Month Earnings', value: 'KES 45,000', icon: DollarSign, color: 'bg-green-500/10 text-green-600' },
    { label: 'Completed Jobs', value: '28', icon: CheckCircle, color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Pending Jobs', value: '3', icon: Clock, color: 'bg-amber-500/10 text-amber-600' },
    { label: 'Rating', value: '4.8★', icon: TrendingUp, color: 'bg-purple-500/10 text-purple-600' },
  ]

  const activeJobs = [
    {
      id: 1,
      clientName: 'Alice Johnson',
      service: 'House Cleaning',
      date: '2024-02-25',
      status: 'in-progress',
      amount: 'KES 3,500',
    },
    {
      id: 2,
      clientName: 'Bob Smith',
      service: 'Plumbing Repair',
      date: '2024-02-28',
      status: 'pending',
      amount: 'KES 5,000',
    },
  ]

  const statusColor = {
    'in-progress': 'bg-blue-100 text-blue-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-green-100 text-green-800',
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Professional Dashboard</h1>
        <p className="text-muted-foreground">Manage your services and track your earnings</p>
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

      {/* Services Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Active Jobs</h2>
          <Button className="rounded-lg gap-2">
            <Plus className="w-4 h-4" />
            Add New Service
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Client</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Service</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeJobs.map((job) => (
                <tr key={job.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium">{job.clientName}</td>
                  <td className="py-3 px-4 text-sm">{job.service}</td>
                  <td className="py-3 px-4 text-sm">{job.date}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[job.status as keyof typeof statusColor]}`}>
                      {job.status.replace('-', ' ').charAt(0).toUpperCase() + job.status.replace('-', ' ').slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold">{job.amount}</td>
                  <td className="py-3 px-4 text-sm">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-12 rounded-lg font-semibold">View Services</Button>
          <Button variant="outline" className="h-12 rounded-lg font-semibold">Earnings Report</Button>
          <Button variant="outline" className="h-12 rounded-lg font-semibold">Manage Availability</Button>
          <Button variant="outline" className="h-12 rounded-lg font-semibold">View Profile</Button>
        </div>
      </Card>
    </div>
  )
}
