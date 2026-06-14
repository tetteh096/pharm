"use client"

import * as React from "react"
import Link from "next/link"
import { Cookie, X } from "lucide-react"
import { hasConsentChoice, storeConsent } from "@/lib/cookie-consent"

export function CookieConsentBanner() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    setVisible(!hasConsentChoice())
  }, [])

  const saveChoice = (choice: "accepted" | "essential") => {
    storeConsent(choice)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-consent-root" role="dialog" aria-label="Cookie consent">
      <div className="cookie-consent-panel">
        <div className="cookie-consent-icon" aria-hidden="true">
          <Cookie size={22} />
        </div>
        <div className="cookie-consent-copy">
          <p className="cookie-consent-title">We use cookies</p>
          <p className="cookie-consent-text">
            Enviro Pharmacy uses cookies to remember your preferences and keep the site
            working. See our{" "}
            <Link href="/contact" className="cookie-consent-link">
              privacy information
            </Link>
            .
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button
            type="button"
            className="cookie-consent-btn cookie-consent-btn--ghost"
            onClick={() => saveChoice("essential")}
          >
            Essential only
          </button>
          <button
            type="button"
            className="cookie-consent-btn cookie-consent-btn--primary"
            onClick={() => saveChoice("accepted")}
          >
            Accept all
          </button>
        </div>
        <button
          type="button"
          className="cookie-consent-close"
          onClick={() => saveChoice("essential")}
          aria-label="Dismiss cookie notice"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
