import "server-only"

import { getSiteSettingsDelegate, prismaQuery } from "@/lib/prisma"
import { getPublicBranches } from "@/lib/branches"
import {
  SITE_SETTINGS_ID,
  DEFAULT_SITE_SETTINGS,
  buildPublicSiteSettings,
  type SiteSettingsFormData,
} from "@/lib/site-settings-shared"

// Re-export all client-safe types/constants/helpers so existing server-side
// imports of "@/lib/site-settings" keep working unchanged. Client components
// must import these from "@/lib/site-settings-shared" instead (this module is
// server-only because of the Prisma import below).
export * from "@/lib/site-settings-shared"

type SiteSettingsRow = {
  contactEmail: string | null
  facebookUrl: string | null
  linkedinUrl: string | null
  instagramUrl: string | null
  twitterUrl: string | null
  tiktokUrl: string | null
  whatsappMadina: string | null
  whatsappOdorkor: string | null
  whatsappSakumono: string | null
  whatsappSanteo: string | null
}

function rowToFormData(row: SiteSettingsRow | null): SiteSettingsFormData {
  return {
    contactEmail: row?.contactEmail ?? DEFAULT_SITE_SETTINGS.contactEmail,
    facebookUrl: row?.facebookUrl ?? DEFAULT_SITE_SETTINGS.facebookUrl,
    linkedinUrl: row?.linkedinUrl ?? DEFAULT_SITE_SETTINGS.linkedinUrl,
    instagramUrl: row?.instagramUrl ?? DEFAULT_SITE_SETTINGS.instagramUrl,
    twitterUrl: row?.twitterUrl ?? DEFAULT_SITE_SETTINGS.twitterUrl,
    tiktokUrl: row?.tiktokUrl ?? DEFAULT_SITE_SETTINGS.tiktokUrl,
    whatsappMadina: row?.whatsappMadina ?? DEFAULT_SITE_SETTINGS.whatsappMadina,
    whatsappOdorkor: row?.whatsappOdorkor ?? DEFAULT_SITE_SETTINGS.whatsappOdorkor,
    whatsappSakumono: row?.whatsappSakumono ?? DEFAULT_SITE_SETTINGS.whatsappSakumono,
    whatsappSanteo: row?.whatsappSanteo ?? DEFAULT_SITE_SETTINGS.whatsappSanteo,
  }
}

export async function getSiteSettingsRow(): Promise<SiteSettingsRow | null> {
  const delegate = getSiteSettingsDelegate()
  if (!delegate) return null

  try {
    const existing = await prismaQuery(() =>
      delegate.findUnique({
        where: { id: SITE_SETTINGS_ID },
      })
    )
    if (existing) return existing

    return await prismaQuery(() =>
      delegate.create({
        data: {
          id: SITE_SETTINGS_ID,
          ...DEFAULT_SITE_SETTINGS,
          whatsappSanteo: null,
        },
      })
    )
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return prismaQuery(() =>
        delegate.findUnique({ where: { id: SITE_SETTINGS_ID } })
      )
    }
    console.error("[site-settings] failed to load row", error)
    return null
  }
}

export async function getSiteSettingsFormData(): Promise<SiteSettingsFormData> {
  const row = await getSiteSettingsRow()
  return rowToFormData(row)
}

export async function getPublicSiteSettings() {
  const [form, branches] = await Promise.all([
    getSiteSettingsFormData(),
    getPublicBranches(),
  ])
  return buildPublicSiteSettings(form, branches)
}
