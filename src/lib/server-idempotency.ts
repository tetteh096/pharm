/** Prisma P2002 — unique constraint failed */
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  )
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function normalizeIdempotencyKey(key: string | undefined): string | null {
  const trimmed = key?.trim()
  if (!trimmed || !UUID_RE.test(trimmed)) return null
  return trimmed.toLowerCase()
}
