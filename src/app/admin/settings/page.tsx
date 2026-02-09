'use client'

import { useEffect, useState } from 'react'

interface PaymentStatus {
  stripeEnabled: boolean
  creemEnabled: boolean
  defaultProvider: string
  maintenanceMode: boolean
}

interface HealthStatus {
  status: string
  checks: Record<string, { name: string; status: string; latency?: number; message?: string }>
  uptime: number
  system: {
    nodeVersion: string
    platform: string
    memoryUsage: { rss: string; heapUsed: string; heapTotal: string }
  }
}

export default function AdminSettingsPage() {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/payment-config')
        .then((r) => r.json())
        .then((r) => {
          if (r.success) {
            setPaymentStatus(r.data.status)
          }
        })
        .catch(console.error),
      fetch('/api/health')
        .then((r) => r.json())
        .then((data) => setHealthStatus(data))
        .catch(console.error),
    ]).finally(() => setLoading(false))
  }, [])

  const handlePaymentAction = async (action: string, params?: Record<string, string>) => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/payment-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params }),
      })
      const result = await res.json()
      if (result.success) {
        setPaymentStatus(result.data.status)
      }
    } catch (err) {
      console.error('Action failed:', err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-violet-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">System Settings</h1>

      {/* Health Status */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-lg font-semibold">System Health</h2>
        {healthStatus ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">Overall Status:</span>
              <HealthBadge status={healthStatus.status} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {Object.values(healthStatus.checks).map((check) => (
                <div
                  key={check.name}
                  className="rounded-md border border-zinc-700 bg-zinc-800/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-300">{check.name}</span>
                    <HealthBadge status={check.status} />
                  </div>
                  {check.latency !== undefined && (
                    <p className="mt-1 text-xs text-zinc-500">{check.latency}ms</p>
                  )}
                  {check.message && (
                    <p className="mt-1 text-xs text-red-400">{check.message}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
              <div>
                <span className="text-zinc-500">Uptime</span>
                <p className="text-zinc-300">{formatUptime(healthStatus.uptime)}</p>
              </div>
              <div>
                <span className="text-zinc-500">Node</span>
                <p className="text-zinc-300">{healthStatus.system.nodeVersion}</p>
              </div>
              <div>
                <span className="text-zinc-500">Heap Used</span>
                <p className="text-zinc-300">{healthStatus.system.memoryUsage.heapUsed}</p>
              </div>
              <div>
                <span className="text-zinc-500">RSS</span>
                <p className="text-zinc-300">{healthStatus.system.memoryUsage.rss}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Failed to load health status</p>
        )}
      </div>

      {/* Payment Settings */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-lg font-semibold">Payment Configuration</h2>
        {paymentStatus ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ToggleItem
                label="Stripe"
                enabled={paymentStatus.stripeEnabled}
                onToggle={() =>
                  handlePaymentAction('update', {
                    stripeEnabled: String(!paymentStatus.stripeEnabled),
                  })
                }
                disabled={actionLoading}
              />
              <ToggleItem
                label="Creem"
                enabled={paymentStatus.creemEnabled}
                onToggle={() =>
                  handlePaymentAction('update', {
                    creemEnabled: String(!paymentStatus.creemEnabled),
                  })
                }
                disabled={actionLoading}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">Default Provider:</span>
              <span className="text-sm font-medium text-zinc-200">
                {paymentStatus.defaultProvider}
              </span>
            </div>
            <div className="border-t border-zinc-800 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-200">Maintenance Mode</p>
                  <p className="text-xs text-zinc-500">
                    When enabled, all payment processing will be paused
                  </p>
                </div>
                <button
                  onClick={() =>
                    handlePaymentAction(
                      paymentStatus.maintenanceMode ? 'maintenance_off' : 'maintenance_on',
                      { reason: 'Admin toggle' }
                    )
                  }
                  disabled={actionLoading}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    paymentStatus.maintenanceMode
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {paymentStatus.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                </button>
              </div>
              {paymentStatus.maintenanceMode && (
                <div className="mt-3 rounded-md bg-yellow-500/10 border border-yellow-500/20 px-4 py-2">
                  <p className="text-sm text-yellow-400">
                    Maintenance mode is active. Payments are paused.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Failed to load payment configuration</p>
        )}
      </div>
    </div>
  )
}

function HealthBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ok: 'bg-green-500/10 text-green-400',
    degraded: 'bg-yellow-500/10 text-yellow-400',
    error: 'bg-red-500/10 text-red-400',
  }
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        colors[status] || colors.error
      }`}
    >
      {status}
    </span>
  )
}

function ToggleItem({
  label,
  enabled,
  onToggle,
  disabled,
}: {
  label: string
  enabled: boolean
  onToggle: () => void
  disabled: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-800/50 p-4">
      <span className="text-sm font-medium text-zinc-200">{label}</span>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          enabled ? 'bg-violet-600' : 'bg-zinc-600'
        } disabled:opacity-50`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            enabled ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}
