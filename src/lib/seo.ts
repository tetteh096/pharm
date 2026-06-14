/**
 * Central SEO / site configuration.
 *
 * The canonical production origin is read from NEXT_PUBLIC_SITE_URL so it can be
 * overridden per-environment (preview deploys, staging) without code changes.
 * Falls back to the production domain.
 */
import { BRAND_NAME } from "@/lib/brand"

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://enviropharmacy.com"
).replace(/\/$/, "")

export const SITE_NAME = BRAND_NAME

/** Areas served — used across titles, descriptions and structured data. */
export const SERVICE_AREAS = ["Madina", "Odorkor", "Sakumono", "Santeo"] as const

/** Default share image (1200×630 recommended; logo is an acceptable fallback). */
export const OG_IMAGE = "/logo/logo.png"

export const SITE_DESCRIPTION =
  "Enviro Pharmacy serves Madina, Odorkor, Sakumono and Santeo in Accra, Ghana with trusted medications, pharmacist consultations, chronic-care support and dependable branch access."

/** Local-intent keywords for a Ghanaian community pharmacy. */
export const SITE_KEYWORDS = [
  "Enviro Pharmacy",
  "pharmacy in Madina",
  "pharmacy in Odorkor",
  "pharmacy in Sakumono",
  "pharmacy in Santeo",
  "pharmacy near me Accra",
  "pharmacy Accra Ghana",
  "24 hour pharmacy Madina",
  "buy medicine online Ghana",
  "chronic care pharmacy Accra",
  "prescription refill Ghana",
  "pharmacist consultation Accra",
]

/** Public branch directory (kept in sync with the footer / contact page). */
export const BRANCHES = [
  {
    name: "Enviro Pharmacy — Madina",
    area: "Madina",
    phone: "+233554612072",
    hours: "24 hours",
    city: "Accra",
    region: "Greater Accra",
    country: "GH",
  },
  {
    name: "Enviro Pharmacy — Odorkor",
    area: "Odorkor",
    phone: "+233599376675",
    hours: "Mon–Sat 8am–9pm",
    city: "Accra",
    region: "Greater Accra",
    country: "GH",
  },
  {
    name: "Enviro Pharmacy — Sakumono",
    area: "Sakumono",
    phone: "+233530883354",
    hours: "Mon–Sat 8am–9pm",
    city: "Accra",
    region: "Greater Accra",
    country: "GH",
  },
] as const

export const CONTACT = {
  email: "enviropharmacyltd@gmail.com",
  phone: "+233554612072",
}

export const SOCIAL_PROFILES = [
  "https://www.facebook.com/enviropharmacygh",
  "https://www.instagram.com/enviropharmacygh",
  "https://www.linkedin.com/company/enviropharmacygh",
  "https://twitter.com/enviropharmacygh",
  "https://www.tiktok.com/@enviropharmacygh",
]

/** Build an absolute URL from a path, for canonical / OG tags. */
export function absoluteUrl(path = ""): string {
  if (!path) return SITE_URL
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}
