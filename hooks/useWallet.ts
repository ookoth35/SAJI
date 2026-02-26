import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Wallet {
  id: number
  userId: number
  balance: string
  totalEarnings: string
  totalSpending: string
  currency: string
}

interface Transaction {
  id: number
  userId: number
  type: 'credit' | 'debit'
  amount: string
  description: string
  balanceAfter: string
  createdAt: string
}

export function useWallet() {
  const { data, error, isLoading, mutate } = useSWR<Wallet>(
    '/api/wallet/balance',
    fetcher,
    { revalidateOnFocus: false }
  )

  return {
    wallet: data,
    isLoading,
    error,
    mutate,
  }
}

export function useTransactions() {
  const { data, error, isLoading } = useSWR<{ transactions: Transaction[] }>(
    '/api/wallet/transactions',
    fetcher,
    { revalidateOnFocus: false }
  )

  return {
    transactions: data?.transactions || [],
    isLoading,
    error,
  }
}
