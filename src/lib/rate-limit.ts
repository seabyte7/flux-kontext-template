import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { rateLimitLogger } from '@/lib/logger'

// Check if Upstash Redis is configured
const isUpstashConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

// Create Redis client only if configured
const redis = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// --- Upstash distributed rate limiters (sliding window) ---

export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      prefix: 'rl:api',
      analytics: true,
    })
  : null

export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '300 s'),
      prefix: 'rl:auth',
      analytics: true,
    })
  : null

export const paymentRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '600 s'),
      prefix: 'rl:payment',
      analytics: true,
    })
  : null

// --- In-memory fallback (single-instance only) ---

const memoryMap = new Map<string, { count: number; lastReset: number }>()

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = memoryMap.get(key)

  if (!record || record.lastReset < now - windowMs) {
    memoryMap.set(key, { count: 1, lastReset: now })
    return { success: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: limit - record.count }
}

// --- Unified rate-limit function ---

export type RateLimitTier = 'api' | 'auth' | 'payment'

const TIER_CONFIG: Record<RateLimitTier, { limit: number; windowMs: number }> = {
  api: { limit: 10, windowMs: 60_000 },
  auth: { limit: 5, windowMs: 300_000 },
  payment: { limit: 3, windowMs: 600_000 },
}

const upstashLimiters: Record<RateLimitTier, Ratelimit | null> = {
  api: apiRateLimit,
  auth: authRateLimit,
  payment: paymentRateLimit,
}

export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier = 'api'
): Promise<{ success: boolean; remaining: number; source: 'upstash' | 'memory' }> {
  const limiter = upstashLimiters[tier]

  // Try Upstash first
  if (limiter) {
    try {
      const result = await limiter.limit(identifier)
      rateLimitLogger.debug({ identifier, tier, success: result.success, remaining: result.remaining, source: 'upstash' }, 'rate limit check')
      return { success: result.success, remaining: result.remaining, source: 'upstash' }
    } catch (err) {
      rateLimitLogger.warn({ err, identifier, tier }, 'Upstash rate limit failed, falling back to memory')
    }
  }

  // Fallback to in-memory
  const config = TIER_CONFIG[tier]
  const key = `${tier}:${identifier}`
  const result = memoryRateLimit(key, config.limit, config.windowMs)
  rateLimitLogger.debug({ identifier, tier, ...result, source: 'memory' }, 'rate limit check (memory fallback)')
  return { ...result, source: 'memory' }
}

if (isUpstashConfigured) {
  rateLimitLogger.info('Upstash Redis rate limiting enabled')
} else {
  rateLimitLogger.warn('Upstash Redis not configured, using in-memory rate limiting fallback')
}
