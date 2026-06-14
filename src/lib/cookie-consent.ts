const STORAGE_KEY = "enviro-cookie-consent-v1"
const COOKIE_NAME = "enviro_cookie_consent"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365 // 1 year

export type CookieConsentValue = "accepted" | "essential"

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax`
}

export function getStoredConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null

  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY)
    if (fromStorage === "accepted" || fromStorage === "essential") {
      return fromStorage
    }
  } catch {
    /* ignore */
  }

  const fromCookie = readCookie(COOKIE_NAME)
  if (fromCookie === "accepted" || fromCookie === "essential") {
    return fromCookie
  }

  return null
}

export function storeConsent(value: CookieConsentValue) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
  writeCookie(COOKIE_NAME, value)
}

export function hasConsentChoice(): boolean {
  return getStoredConsent() !== null
}
