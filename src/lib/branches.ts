import "server-only"

import { prisma, prismaQuery } from "@/lib/prisma"
import { slugify } from "@/lib/inventory"
import { PHARMACY_BRANCHES, type PharmacyBranch } from "@/data/pharmacy-branches"

type BranchRecord = {
  name: string
  slug: string | null
  location: string | null
  phone: string | null
  tel: string | null
  gps: string | null
  hours: string | null
  maps: string | null
  mapEmbed: string | null
  accent: string | null
  comingSoon: boolean
}

function mapsLinks(location: string) {
  const q = encodeURIComponent(`${location}, Ghana`)
  return {
    maps: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
    mapEmbed: `https://maps.google.com/maps?q=${q}&hl=en&z=16&output=embed`,
  }
}

function toPharmacyBranch(row: BranchRecord): PharmacyBranch {
  const location = row.location ?? ""
  const derived = location ? mapsLinks(location) : { maps: "", mapEmbed: "" }
  const tel = row.tel || (row.phone ? row.phone.replace(/[^\d]/g, "") : null)
  return {
    id: row.slug || slugify(row.name),
    name: row.name,
    location,
    gps: row.gps,
    hours: row.hours ?? "",
    phone: row.phone,
    tel,
    maps: row.maps || derived.maps,
    mapEmbed: row.mapEmbed || derived.mapEmbed,
    accent: row.accent || "#13ec8a",
    comingSoon: row.comingSoon,
  }
}

/**
 * Public-site branch list, sourced from the CMS (Branch table) with the static
 * `PHARMACY_BRANCHES` as a fallback when the DB is empty or the new columns
 * haven't been migrated yet. Keeps the same shape the website already expects.
 */
export async function getPublicBranches(): Promise<PharmacyBranch[]> {
  try {
    const rows = await prismaQuery(() =>
      prisma.branch.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      })
    )
    if (!rows.length) return PHARMACY_BRANCHES
    return rows.map(toPharmacyBranch)
  } catch (error) {
    console.error("[branches] falling back to static list", error)
    return PHARMACY_BRANCHES
  }
}
