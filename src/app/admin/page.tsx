'use client'

import { useEffect, useState } from 'react'

interface DashboardStats {
  totalUsers: number
  todayRegistrations: number
  totalOrders: number
  totalRevenue: number
  totalCreditsUsed: number
}

interface RecentUser {
  id: string
  email: string
  name: string
  credits: number
  created_at: string
}

interface RecentOrder {
  id: string
  order_number: string
  amount: number
  currency: string
  status: string
  payment_provider: string
  created_at: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setStats(res.data.stats)
          setRecentUsers(res.data.recentUsers)
          setRecentOrders(res.data.recentOrders)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-violet-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} />
        <StatCard label="Today Registrations" value={stats?.todayRegistrations ?? 0} />
        <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} />
        <StatCard
          label="Total Revenue"
          value={`$${((stats?.totalRevenue ?? 0) / 100).toFixed(2)}`}
        />
        <StatCard label="Credits Used" value={stats?.totalCreditsUsed ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Users</h2>
            <a href="/admin/users" className="text-sm text-violet-400 hover:text-violet-300">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-md bg-zinc-800/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">{user.name || user.email}</p>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-zinc-300">{user.credits} credits</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4">No users yet</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm text-violet-400 hover:text-violet-300">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-md bg-zinc-800/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">#{order.order_number}</p>
                  <p className="text-xs text-zinc-500">{order.payment_provider}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-zinc-300">
                    ${(order.amount / 100).toFixed(2)} {order.currency?.toUpperCase()}
                  </p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: 'bg-green-500/10 text-green-400',
    pending: 'bg-yellow-500/10 text-yellow-400',
    failed: 'bg-red-500/10 text-red-400',
    cancelled: 'bg-zinc-500/10 text-zinc-400',
  }

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        colors[status] || colors.pending
      }`}
    >
      {status}
    </span>
  )
}
