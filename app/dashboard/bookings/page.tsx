'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, MapPin, User, DollarSign, X, Loader2 } from 'lucide-react'
import { useBookings } from '@/hooks/useBookings'

export default function BookingsPage() {
  const { bookings, isLoading, error } = useBookings()

  const activeBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed')
  const completedBookings = bookings.filter((b) => b.status === 'completed')
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled')

  const statusColor = {
    confirmed: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const BookingCard = ({ booking, showRating }: any) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Service #{booking.serviceId}</h3>
          <p className="text-sm text-muted-foreground">Professional #{booking.professionalId}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[booking.status as keyof typeof statusColor]}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {new Date(booking.scheduledDate).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <DollarSign className="w-4 h-4" />
          KES {booking.amount}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-lg font-bold text-foreground">KES {booking.amount}</div>
        <div className="flex gap-2">
          {showRating && (
            <Button variant="outline" size="sm" className="rounded-lg">
              Leave Review
            </Button>
          )}
          {(booking.status === 'confirmed' || booking.status === 'pending') && (
            <>
              <Button size="sm" className="rounded-lg">Message</Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg gap-2 text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <p className="text-red-700">Failed to load bookings. Please try again later.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
        <Button className="rounded-lg">Book New Service</Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full max-w-xs grid-cols-3">
          <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeBookings.length > 0 ? (
            activeBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No active bookings</p>
              <Button className="rounded-lg">Browse Services</Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedBookings.length > 0 ? (
            completedBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} showRating={true} />
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No completed bookings</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledBookings.length > 0 ? (
            cancelledBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No cancelled bookings</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
