import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Booking {
  id: number
  serviceId: number
  clientId: number
  professionalId: number
  scheduledDate: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  amount: number
  createdAt: string
}

export function useBookings() {
  const { data, error, isLoading, mutate } = useSWR<{ bookings: Booking[] }>(
    '/api/bookings',
    fetcher,
    { revalidateOnFocus: false }
  )

  return {
    bookings: data?.bookings || [],
    isLoading,
    error,
    mutate,
  }
}

export function useBookingById(id: number) {
  const { data, error, isLoading } = useSWR<Booking>(
    `/api/bookings/${id}`,
    fetcher
  )

  return { booking: data, isLoading, error }
}
