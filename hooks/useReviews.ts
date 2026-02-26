import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Review {
  id: number
  bookingId: number
  reviewerId: number
  professionalId: number
  rating: number
  comment: string
  createdAt: string
}

export function useReviews(professionalId?: number) {
  const url = professionalId 
    ? `/api/reviews?professionalId=${professionalId}`
    : '/api/reviews'
    
  const { data, error, isLoading } = useSWR<{ reviews: Review[] }>(
    url,
    fetcher,
    { revalidateOnFocus: false }
  )

  return {
    reviews: data?.reviews || [],
    isLoading,
    error,
  }
}

export function useReviewById(id: number) {
  const { data, error, isLoading } = useSWR<Review>(
    `/api/reviews/${id}`,
    fetcher
  )

  return { review: data, isLoading, error }
}
