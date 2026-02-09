import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

interface HealthCheck {
  name: string
  status: 'ok' | 'error'
  latency?: number
  message?: string
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error'
  checks: Record<string, HealthCheck>
  timestamp: string
  version: string
  uptime: number
  system: {
    nodeVersion: string
    platform: string
    memoryUsage: {
      rss: string
      heapUsed: string
      heapTotal: string
    }
  }
}

// 检查 Supabase 数据库连通性
async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return { name: 'database', status: 'error', message: 'Supabase not configured' }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    // 执行简单查询测试连通性
    const { error } = await supabase.from('users').select('id').limit(1)

    const latency = Date.now() - start

    if (error) {
      return { name: 'database', status: 'error', latency, message: error.message }
    }

    return { name: 'database', status: 'ok', latency }
  } catch (err) {
    return {
      name: 'database',
      status: 'error',
      latency: Date.now() - start,
      message: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

// 检查 Fal.ai API 可用性（可选）
async function checkFalAi(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const falKey = env.FAL_KEY
    if (!falKey) {
      return { name: 'fal_ai', status: 'error', message: 'FAL_KEY not configured' }
    }

    // 只检查 API 是否可达，不执行实际生成
    const response = await fetch('https://rest.fal.run', {
      method: 'HEAD',
      headers: { Authorization: `Key ${falKey}` },
      signal: AbortSignal.timeout(5000),
    })

    const latency = Date.now() - start
    return {
      name: 'fal_ai',
      status: response.ok || response.status === 404 ? 'ok' : 'error',
      latency,
    }
  } catch (err) {
    return {
      name: 'fal_ai',
      status: 'error',
      latency: Date.now() - start,
      message: err instanceof Error ? err.message : 'Unreachable',
    }
  }
}

// 检查 R2 存储连通性（可选）
async function checkR2Storage(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const r2AccountId = env.R2_ACCOUNT_ID
    const r2AccessKey = env.R2_ACCESS_KEY_ID

    if (!r2AccountId || !r2AccessKey) {
      return { name: 'r2_storage', status: 'error', message: 'R2 not configured' }
    }

    // 检查公共 URL 是否可达
    const publicUrl = env.R2_PUBLIC_URL
    if (publicUrl) {
      const response = await fetch(publicUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      })
      const latency = Date.now() - start
      return { name: 'r2_storage', status: response.ok ? 'ok' : 'error', latency }
    }

    return { name: 'r2_storage', status: 'ok', latency: Date.now() - start }
  } catch (err) {
    return {
      name: 'r2_storage',
      status: 'error',
      latency: Date.now() - start,
      message: err instanceof Error ? err.message : 'Unreachable',
    }
  }
}

function formatBytes(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024)}MB`
}

export async function GET() {
  const startTime = Date.now()

  // 并行执行所有检查
  const [dbCheck, falCheck, r2Check] = await Promise.all([
    checkDatabase(),
    checkFalAi(),
    checkR2Storage(),
  ])

  const checks: Record<string, HealthCheck> = {
    database: dbCheck,
    fal_ai: falCheck,
    r2_storage: r2Check,
  }

  // 判断总体状态
  const allChecks = Object.values(checks)
  const hasError = allChecks.some((c) => c.status === 'error')
  // 数据库是核心依赖
  const coreDown = dbCheck.status === 'error'

  let overallStatus: 'ok' | 'degraded' | 'error'
  if (coreDown) {
    overallStatus = 'error'
  } else if (hasError) {
    overallStatus = 'degraded'
  } else {
    overallStatus = 'ok'
  }

  const memoryUsage = process.memoryUsage()

  const response: HealthResponse = {
    status: overallStatus,
    checks,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptime: process.uptime(),
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: {
        rss: formatBytes(memoryUsage.rss),
        heapUsed: formatBytes(memoryUsage.heapUsed),
        heapTotal: formatBytes(memoryUsage.heapTotal),
      },
    },
  }

  const statusCode = overallStatus === 'error' ? 503 : 200

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
