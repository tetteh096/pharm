/**
 * Simple in-memory rate limiter — no external dependencies required.
 *
 * Works well for single-process deployments (local dev, single server).
 * For multi-instance / serverless production, swap the Map for a Redis/Upstash store.
 *
 * Usage:
 *   const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 })
 *   const result  = limiter.check(ip)
 *   if (!result.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 })
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitOptions {
  /** Max requests allowed within the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function createRateLimiter(options: RateLimitOptions) {
  const store = new Map<string, RateLimitEntry>()

  // Prune stale entries every 5 minutes to prevent memory leaks
  const pruneInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 5 * 60 * 1000)

  // Allow GC to collect the interval in serverless environments
  if (pruneInterval.unref) pruneInterval.unref()

  return {
    check(key: string): RateLimitResult {
      const now = Date.now()
      const existing = store.get(key)

      if (!existing || existing.resetAt < now) {
        // Fresh window
        const entry: RateLimitEntry = { count: 1, resetAt: now + options.windowMs }
        store.set(key, entry)
        return { allowed: true, remaining: options.limit - 1, resetAt: entry.resetAt }
      }

      existing.count += 1
      const remaining = Math.max(0, options.limit - existing.count)
      return {
        allowed: existing.count <= options.limit,
        remaining,
        resetAt: existing.resetAt,
      }
    },

    /** Manually reset a key (e.g. after successful login) */
    reset(key: string) {
      store.delete(key)
    },
  }
}

/** Extract a best-effort IP from a Next.js request. */
export function getClientIp(request: Request): string {
  const headers = new Headers((request as unknown as { headers: Headers }).headers ?? {})
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  )
}
