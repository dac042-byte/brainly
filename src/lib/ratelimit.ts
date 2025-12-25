// Simple in-memory rate limiter for MVP
// For production, consider using Upstash Redis or Vercel KV

interface RateLimitRecord {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  rateLimitStore.forEach((record, key) => {
    if (record.resetAt < now) {
      rateLimitStore.delete(key)
    }
  })
}, 10 * 60 * 1000)

export interface RateLimitConfig {
  maxRequests: number  // Maximum number of requests
  windowMs: number     // Time window in milliseconds
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  // No record or expired record - allow and create new
  if (!record || record.resetAt < now) {
    const resetAt = now + config.windowMs
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt
    })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt
    }
  }

  // Record exists and not expired
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt
    }
  }

  // Increment count
  record.count++
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt
  }
}

// Preset configurations for common actions
export const RATE_LIMITS = {
  // Password reset: 3 requests per hour
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000 // 1 hour
  },
  // Signup: 5 accounts per hour per IP
  SIGNUP: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000 // 1 hour
  },
  // Login attempts: 10 per 15 minutes
  LOGIN: {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000 // 15 minutes
  },
  // Session creation: 10 sessions per hour
  SESSION_CREATE: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000 // 1 hour
  }
}
