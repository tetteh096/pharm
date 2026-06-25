/**
 * Client-safe site-settings types, constants and pure helpers.
 *
 * This module deliberately contains NO database / server-only imports so it can
 * be imported from both Server Components and "use client" components. The
 * Prisma-backed loaders live in `@/lib/site-settings` (server-only) and
 * re-export everything here for server callers.
 */
import {
  PHARMACY_BRANCHES,
  PHARMACY_EMAIL,
  type PharmacyBranch,
} from "@/data/pharmacy-branches"
import { toWhatsAppPhone } from "@/lib/whatsapp"

export type SocialLinkKey =
  | "facebook"
  | "linkedin"
  | "instagram"
  | "twitter"
  | "tiktok"

export type SocialLink = {
  key: SocialLinkKey
  url: string
  icon: string
  label: string
}

export type PublicWhatsAppBranch = {
  id: string
  name: string
  location: string
  accent: string
  comingSoon: boolean
  phone: string | null
  whatsapp: string | null
}

export type PublicSiteSettings = {
  contactEmail: string
  socialLinks: SocialLink[]
  whatsappBranches: PublicWhatsAppBranch[]
}

export type SiteSettingsFormData = {
  contactEmail: string
  facebookUrl: string
  linkedinUrl: string
  instagramUrl: string
  twitterUrl: string
  tiktokUrl: string
  whatsappMadina: string
  whatsappOdorkor: string
  whatsappSakumono: string
  whatsappSanteo: string
}

export const SITE_SETTINGS_ID = "site"

export const DEFAULT_SITE_SETTINGS: SiteSettingsFormData = {
  contactEmail: PHARMACY_EMAIL,
  facebookUrl: "https://www.facebook.com/enviropharmacygh",
  linkedinUrl: "https://www.linkedin.com/company/enviropharmacygh",
  instagramUrl: "https://www.instagram.com/enviropharmacygh",
  twitterUrl: "https://twitter.com/enviropharmacygh",
  tiktokUrl: "https://www.tiktok.com/@enviropharmacygh",
  whatsappMadina: "0554612072",
  whatsappOdorkor: "0599376675",
  whatsappSakumono: "0530883354",
  whatsappSanteo: "",
}

export const SOCIAL_META: Record<
  SocialLinkKey,
  { field: keyof SiteSettingsFormData; icon: string; label: string }
> = {
  facebook: { field: "facebookUrl", icon: "fab fa-facebook-f", label: "Facebook" },
  linkedin: { field: "linkedinUrl", icon: "fa-brands fa-linkedin-in", label: "LinkedIn" },
  instagram: { field: "instagramUrl", icon: "fab fa-instagram", label: "Instagram" },
  twitter: { field: "twitterUrl", icon: "fa-brands fa-x-twitter", label: "X (Twitter)" },
  tiktok: { field: "tiktokUrl", icon: "fa-brands fa-tiktok", label: "TikTok" },
}

export const WHATSAPP_BY_BRANCH: Record<string, keyof SiteSettingsFormData> = {
  madina: "whatsappMadina",
  odorkor: "whatsappOdorkor",
  sakumono: "whatsappSakumono",
  santeo: "whatsappSanteo",
}

function normalizePhoneInput(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function normalizeUrlInput(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function buildPublicSiteSettings(
  form: SiteSettingsFormData,
  branches: PharmacyBranch[] = PHARMACY_BRANCHES
): PublicSiteSettings {
  const socialLinks: SocialLink[] = (
    Object.entries(SOCIAL_META) as [SocialLinkKey, (typeof SOCIAL_META)[SocialLinkKey]][]
  )
    .map(([key, meta]) => ({
      key,
      url: form[meta.field].trim(),
      icon: meta.icon,
      label: meta.label,
    }))
    .filter((link) => link.url.length > 0)

  const whatsappById: Record<string, string | null> = {
    madina: normalizePhoneInput(form.whatsappMadina),
    odorkor: normalizePhoneInput(form.whatsappOdorkor),
    sakumono: normalizePhoneInput(form.whatsappSakumono),
    santeo: normalizePhoneInput(form.whatsappSanteo),
  }

  const whatsappBranches: PublicWhatsAppBranch[] = branches.map((branch) => {
    const overridePhone = whatsappById[branch.id]
    const phone = overridePhone ?? branch.phone
    const tel = overridePhone ?? branch.tel
    return {
      id: branch.id,
      name: branch.name,
      location: branch.location,
      accent: branch.accent,
      comingSoon: branch.comingSoon,
      phone,
      whatsapp: toWhatsAppPhone(tel),
    }
  })

  const contactEmail = form.contactEmail.trim() || PHARMACY_EMAIL

  return { contactEmail, socialLinks, whatsappBranches }
}

export function sanitizeSiteSettingsInput(
  input: SiteSettingsFormData
): SiteSettingsFormData {
  return {
    contactEmail: input.contactEmail?.trim() ?? "",
    facebookUrl: normalizeUrlInput(input.facebookUrl) ?? "",
    linkedinUrl: normalizeUrlInput(input.linkedinUrl) ?? "",
    instagramUrl: normalizeUrlInput(input.instagramUrl) ?? "",
    twitterUrl: normalizeUrlInput(input.twitterUrl) ?? "",
    tiktokUrl: normalizeUrlInput(input.tiktokUrl) ?? "",
    whatsappMadina: normalizePhoneInput(input.whatsappMadina) ?? "",
    whatsappOdorkor: normalizePhoneInput(input.whatsappOdorkor) ?? "",
    whatsappSakumono: normalizePhoneInput(input.whatsappSakumono) ?? "",
    whatsappSanteo: normalizePhoneInput(input.whatsappSanteo) ?? "",
  }
}
