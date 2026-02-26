"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, ArrowUpRight, ArrowDownLeft, Plus, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useWallet, useTransactions } from '@/hooks/useWallet'

export default function WalletPage() {
  const [showTopup, setShowTopup] = useState(false)
  const [topupAmount, setTopupAmount] = useState('')
  const { wallet, isLoading: walletLoading } = useWallet()
  const { transactions, isLoading: transLoading } = useTransactions()

  const totalIn = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  const totalOut = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Wallet</h1>
        <p className="text-muted-foreground">Manage your funds and track transactions</p>
      </div>

      {/* Balance Card */}
      <Card className="p-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 mb-2">Available Balance</p>
            {walletLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <h2 className="text-4xl font-bold">KES {wallet?.balance || 0}</h2>
            )}
          </div>
          <div className="p-4 bg-primary-foreground/10 rounded-lg backdrop-blur-sm">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            className="rounded-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-2"
            onClick={() => setShowTopup(true)}
          >
            <Plus className="w-4 h-4" />
            Add Funds
          </Button>
          <Button variant="outline" className="rounded-lg border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
            Withdraw
          </Button>
        </div>
      </Card>

      {/* Add Funds Modal */}
      {showTopup && (
        <Card className="p-6 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Add Funds to Wallet</h3>
            <button onClick={() => setShowTopup(false)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Amount (KES)</label>
              <Input 
                type="number"
                placeholder="Enter amount"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Payment Method</label>
              <select className="w-full rounded-lg border border-border px-3 py-2">
                <option>M-Pesa</option>
                <option>Airtel Money</option>
                <option>Bank Transfer</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 rounded-lg">Continue to Payment</Button>
              <Button 
                variant="outline" 
                onClick={() => setShowTopup(false)}
                className="flex-1 rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total In</p>
              <p className="text-2xl font-bold text-green-600">+KES {totalIn}</p>
            </div>
            <ArrowDownLeft className="w-8 h-8 text-green-600/20" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Out</p>
              <p className="text-2xl font-bold text-red-600">-KES {totalOut}</p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-red-600/20" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Earned</p>
              <p className="text-2xl font-bold text-foreground">KES {wallet?.totalEarnings || 0}</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary/20" />
          </div>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Recent Transactions</h2>
        </div>

        {transLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {transaction.type === 'credit' ? (
                      <ArrowDownLeft className="text-green-600" />
                    ) : (
                      <ArrowUpRight className="text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.createdAt}</p>
                  </div>
                </div>
                <p className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'credit' ? '+' : '-'}KES {transaction.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
