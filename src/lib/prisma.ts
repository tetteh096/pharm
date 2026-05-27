import "server-only"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

type PrismaSingleton = ReturnType<typeof prismaClientSingleton>

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | PrismaSingleton
}

/**
 * Expected delegates on a fresh client. When the schema gains a new model,
 * add its delegate name here so the dev HMR cache invalidates correctly.
 */
const EXPECTED_DELEGATES = [
  "order",
  "customer",
  "branch",
  "blogPost",
  "blogCategory",
  "blogComment",
  "orderStatusLog",
  "chronicPatient",
  "chronicCheckIn",
] as const

function isStaleClient(client: PrismaSingleton | undefined): boolean {
  if (!client) return true
  for (const key of EXPECTED_DELEGATES) {
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
  if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = client
  }
  return client
}

/**
 * Lazy proxy so every property access goes through `getPrisma()`, which
 * means dev HMR can never serve a stale client (the singleton is re-evaluated
 * on every call after a schema change).
 */
export const prisma = new Proxy({} as PrismaSingleton, {
  get(_target, prop, receiver) {
    const client = getPrisma()
    return Reflect.get(client, prop, receiver)
  },
})

/** True when Prisma client includes Order/Customer models (schema migrated + generated). */
export function hasOrderModels(): boolean {
  const client = getPrisma()
  return Boolean(client.order && client.customer)
}
