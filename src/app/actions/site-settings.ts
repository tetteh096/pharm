"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import {
  getSiteSettingsFormData,
} from "@/lib/site-settings"
import {
  sanitizeSiteSettingsInput,
  type SiteSettingsFormData,
} from "@/lib/site-settings-shared"
import { getSiteSettingsDelegate, prismaQuery } from "@/lib/prisma"

export async function getAdminSiteSettings(): Promise<SiteSettingsFormData> {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return getSiteSettingsFormData()
}

export type UpdateSiteSettingsResult =
  | { ok: true }
  | { ok: false; error: string }

export async function updateSiteSettings(
  input: SiteSettingsFormData
): Promise<UpdateSiteSettingsResult> {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return { ok: false, error: "Only administrators can change site settings." }
  }

  const data = sanitizeSiteSettingsInput(input)
  const delegate = getSiteSettingsDelegate()
  if (!delegate) {
    return {
      ok: false,
      error: "Site settings are unavailable. Restart the server after running prisma generate.",
    }
  }

  try {
    await prismaQuery(() =>
      delegate.upsert({
      where: { id: "site" },
      create: {
        id: "site",
        facebookUrl: data.facebookUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        instagramUrl: data.instagramUrl || null,
        twitterUrl: data.twitterUrl || null,
        tiktokUrl: data.tiktokUrl || null,
        whatsappMadina: data.whatsappMadina || null,
        whatsappOdorkor: data.whatsappOdorkor || null,
        whatsappSakumono: data.whatsappSakumono || null,
        whatsappSanteo: data.whatsappSanteo || null,
      },
      update: {
        facebookUrl: data.facebookUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        instagramUrl: data.instagramUrl || null,
        twitterUrl: data.twitterUrl || null,
        tiktokUrl: data.tiktokUrl || null,
        whatsappMadina: data.whatsappMadina || null,
        whatsappOdorkor: data.whatsappOdorkor || null,
        whatsappSakumono: data.whatsappSakumono || null,
        whatsappSanteo: data.whatsappSanteo || null,
      },
    })
    )

    revalidatePath("/")
    revalidatePath("/contact")
    revalidatePath("/api/public/site-settings")

    return { ok: true }
  } catch (error) {
    console.error("[site-settings] update failed", error)
    return { ok: false, error: "Could not save settings. Please try again." }
  }
}
