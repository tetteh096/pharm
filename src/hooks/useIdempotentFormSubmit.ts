"use client"

import { useCallback, useRef } from "react"

function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/**
 * Prevents double-submit: one idempotency key per form attempt until reset.
 */
export function useIdempotentFormSubmit() {
  const locked = useRef(false)
  const idempotencyKey = useRef<string | null>(null)

  const beginSubmit = useCallback((): string | null => {
    if (locked.current) return null
    locked.current = true
    if (!idempotencyKey.current) {
      idempotencyKey.current = newIdempotencyKey()
    }
    return idempotencyKey.current
  }, [])

  const endSubmit = useCallback(() => {
    locked.current = false
  }, [])

  const resetForNewSubmission = useCallback(() => {
    locked.current = false
    idempotencyKey.current = null
  }, [])

  return { beginSubmit, endSubmit, resetForNewSubmission }
}
