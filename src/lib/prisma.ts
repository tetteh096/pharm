import "server-only"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | PrismaSingleton
  // eslint-disable-next-line no-var
  var prismaPgPool: undefined | Pool
}

type PrismaSingleton = ReturnType<typeof prismaClientSingleton>

/**
 * Core delegates — used to detect a truly broken/stale client.
 * Newer models are checked separately via `getDelegate()` with safe fallbacks.
 */
const CORE_DELEGATES = ["user", "product", "order", "customer"] as const

/**
 * All delegates we expect after a fresh `prisma generate`.
 * Add new model delegate names here when the schema grows.
 */
const EXPECTED_DELEGATES = [
  ...CORE_DELEGATES,
  "branch",
  "blogPost",
  "blogCategory",
  "blogComment",
  "orderStatusLog",
  "chronicPatient",
  "chronicCheckIn",
  "consultationRequest",
  "contactMessage",
  "teamProfile",
  "siteSettings",
] as const

function createPool(): Pool {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
  })

  pool.on("error", (error) => {
    console.error("[prisma] pool idle client error — resetting connection", error)
    void resetPrismaConnection()
  })

  return pool
}

function getPool(): Pool {
  if (!globalThis.prismaPgPool) {
    globalThis.prismaPgPool = createPool()
  }
  return globalThis.prismaPgPool
}

const prismaClientSingleton = () => {
  const adapter = new PrismaPg(getPool())
  return new PrismaClient({ adapter })
}

export async function resetPrismaConnection(): Promise<void> {
  const oldClient = globalThis.prisma
  globalThis.prisma = undefined

  if (oldClient) {
    try {
      await oldClient.$disconnect()
    } catch {
      /* ignore */
    }
  }

  const pool = globalThis.prismaPgPool
  globalThis.prismaPgPool = undefined

  if (pool) {
    try {
      await pool.end()
    } catch {
      /* ignore */
    }
  }
}

function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false

  const code = "code" in error ? String((error as { code: unknown }).code) : ""
  if (code === "P1017" || code === "P1001" || code === "P1008" || code === "P2024") {
    return true
  }

  const message =
    "message" in error ? String((error as { message: unknown }).message) : String(error)

  return (
    message.includes("closed the connection") ||
    message.includes("Connection terminated") ||
    message.includes("ECONNRESET") ||
    message.includes("Connection refused") ||
    message.includes("TooManyConnections")
  )
}

/** Run a Prisma query; on a dropped DB connection, reset the pool and retry once. */
export async function prismaQuery<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (!isConnectionError(error)) throw error
    console.warn("[prisma] connection lost — reconnecting and retrying query")
    await resetPrismaConnection()
    return await operation()
  }
}

function isStaleClient(client: PrismaSingleton | undefined): boolean {
  if (!client) return true
  for (const key of CORE_DELEGATES) {
    if (!(key in client) || !(client as unknown as Record<string, unknown>)[key]) {
      return true
    }
  }
  return false
}

function getPrisma(): PrismaSingleton {
  const cached = globalThis.prisma
  if (!isStaleClient(cached)) {
    return cached as PrismaSingleton
  }
  const client = prismaClientSingleton()
  globalThis.prisma = client
  return client
}

// Drop a stale dev singleton when this module loads (e.g. after `prisma generate`).
if (process.env.NODE_ENV !== "production") {
  if (isStaleClient(globalThis.prisma)) {
    globalThis.prisma = undefined
  } else if (globalThis.prisma) {
    const client = globalThis.prisma as unknown as Record<string, unknown>
    if (!client.contactMessage || !client.consultationRequest || !client.siteSettings) {
      globalThis.prisma = undefined
    }
  }
}

function getDelegate<K extends (typeof EXPECTED_DELEGATES)[number]>(
  key: K
): PrismaSingleton[K] | undefined {
  const client = getPrisma()
  const delegate = (client as unknown as Record<string, unknown>)[key]
  return delegate ? (delegate as PrismaSingleton[K]) : undefined
}

export function getSiteSettingsDelegate() {
  return getDelegate("siteSettings")
}

export const prisma = new Proxy({} as PrismaSingleton, {
  get(_target, prop) {
    if (typeof prop === "string" && (EXPECTED_DELEGATES as readonly string[]).includes(prop)) {
      const delegate = getDelegate(prop as (typeof EXPECTED_DELEGATES)[number])
      if (delegate) return delegate
    }
    const client = getPrisma()
    return Reflect.get(client, prop)
  },
})

/** True when Prisma client includes Order/Customer models (schema migrated + generated). */
export function hasOrderModels(): boolean {
  const client = getPrisma()
  return Boolean(client.order && client.customer)
}

export async function countNewContactMessages(): Promise<number> {
  const delegate = getDelegate("contactMessage")
  if (!delegate) return 0
  try {
    return await prismaQuery(() => delegate.count({ where: { status: "New" } }))
  } catch {
    return 0
  }
}

export async function countNewConsultations(): Promise<number> {
  const delegate = getDelegate("consultationRequest")
  if (!delegate) return 0
  try {
    return await prismaQuery(() => delegate.count({ where: { status: "New" } }))
  } catch {
    return 0
  }
}

type InboxConsultation = {
  id: string
  fullName: string
  medicationInterest: string | null
  message: string
  createdAt: Date
}

type InboxContactMessage = {
  id: string
  fullName: string
  subject: string
  branchName: string
  createdAt: Date
}

export async function findNewConsultationsForInbox(
  take = 4
): Promise<InboxConsultation[]> {
  const delegate = getDelegate("consultationRequest")
  if (!delegate) return []
  try {
    return await prismaQuery(() =>
      delegate.findMany({
        where: { status: "New" },
        orderBy: { createdAt: "desc" },
        take,
        select: {
          id: true,
          fullName: true,
          medicationInterest: true,
          message: true,
          createdAt: true,
        },
      })
    )
  } catch {
    return []
  }
}

export async function findNewContactMessagesForInbox(
  take = 4
): Promise<InboxContactMessage[]> {
  const delegate = getDelegate("contactMessage")
  if (!delegate) return []
  try {
    return await prismaQuery(() =>
      delegate.findMany({
        where: { status: "New" },
        orderBy: { createdAt: "desc" },
        take,
        select: {
          id: true,
          fullName: true,
          subject: true,
          branchName: true,
          createdAt: true,
        },
      })
    )
  } catch {
    return []
  }
}
