"use client"

import { usePathname } from "next/navigation"
import { WhatsAppChatWidget } from "./WhatsAppChatWidget"
import { CookieConsentBanner } from "./CookieConsentBanner"

/** Public-site floating widgets — hidden on dashboard and auth pages. */
export function SiteWidgets() {
  const pathname = usePathname()

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return null
  }

  return (
    <>
      <WhatsAppChatWidget />
      <CookieConsentBanner />
    </>
  )
}
