import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string
  role: 'admin' | 'professional' | 'client'
  status: 'active' | 'suspended' | 'banned'
  profileImage?: string
  bio?: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
}

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<User>(
    '/api/auth/profile',
    fetcher,
    { revalidateOnFocus: false }
  )

  return {
    user: data,
    isLoading,
    error,
    mutate,
  }
}

export function useUserById(userId: number) {
  const { data, error, isLoading } = useSWR<User>(
    `/api/users/${userId}`,
    fetcher
  )

  return { user: data, isLoading, error }
}
