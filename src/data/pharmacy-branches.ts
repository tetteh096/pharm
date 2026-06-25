export type PharmacyBranch = {
  id: string
  name: string
  location: string
  gps: string | null
  hours: string
  phone: string | null
  tel: string | null
  maps: string
  mapEmbed: string
  accent: string
  comingSoon: boolean
}

export const PHARMACY_BRANCHES: PharmacyBranch[] = [
  {
    id: "sakumono",
    name: "Sakumono Branch",
    location: "Icam Studios Ghana, Community 18, Sakumono",
    gps: "GQ-360-4215",
    hours: "Monday – Saturday",
    phone: "053 088 3354",
    tel: "0530883354",
    maps: "https://www.google.com/maps/dir/?api=1&destination=Icam+Studios+Ghana,+Community+18,+Sakumono,+Tema,+Ghana",
    mapEmbed:
      "https://maps.google.com/maps?q=Icam+Studios+Ghana,+Community+18,+Sakumono,+Tema,+Ghana&hl=en&z=16&output=embed",
    accent: "#8b5cf6",
    comingSoon: false,
  },
  {
    id: "madina",
    name: "Madina Branch",
    location: "La-Nkwantanang-Madina, Accra",
    gps: "GM-000-2908",
    hours: "Monday – Saturday",
    phone: "055 461 2072",
    tel: "0554612072",
    maps: "https://www.google.com/maps/dir/?api=1&destination=La-Nkwantanang-Madina,+Accra,+Ghana",
    mapEmbed:
      "https://maps.google.com/maps?q=La-Nkwantanang-Madina,+Accra,+Ghana&hl=en&z=15&output=embed",
    accent: "#13ec8a",
    comingSoon: false,
  },
  {
    id: "odorkor",
    name: "Odorkor Branch",
    location: "Mummy's Table Restaurant, Korley Kojo Avenue, Odorkor",
    gps: "GF-558-4017",
    hours: "Monday – Saturday",
    phone: "059 937 6675",
    tel: "0599376675",
    maps: "https://www.google.com/maps/dir/?api=1&destination=Mummy%27s+Table+Restaurant,+Korley+Kojo+Avenue,+Odorkor,+Accra,+Ghana",
    mapEmbed:
      "https://maps.google.com/maps?q=Mummy%27s+Table+Restaurant,+Korley+Kojo+Avenue,+Odorkor,+Accra,+Ghana&hl=en&z=16&output=embed",
    accent: "#1157ee",
    comingSoon: false,
  },
  {
    id: "santeo",
    name: "Santeo Branch",
    location: "Icgc Dominion Temple, Adjei Kojo Santeo Road, Santoe",
    gps: "GK-0566-4497",
    hours: "Monday – Saturday",
    phone: "053 118 3617",
    tel: "0531183617",
    maps: "https://www.google.com/maps/dir/?api=1&destination=Icgc+Dominion+Temple,+Adjei+Kojo+Santeo+Road,+Santoe,+Accra,+Ghana",
    mapEmbed:
      "https://maps.google.com/maps?q=Icgc+Dominion+Temple,+Adjei+Kojo+Santeo+Road,+Santoe,+Accra,+Ghana&hl=en&z=16&output=embed",
    accent: "#f59e0b",
    comingSoon: false,
  },
]

export const PHARMACY_EMAIL = "info@enviropharmacy.com"
/** Public help line email shown on product pages, blog sidebar, footer, etc. */
export const PHARMACY_HELP_EMAIL = "enviropharmilyltd@gmail.com"
export const PHARMACY_INSTAGRAM = "https://www.instagram.com/enviropharmacygh"
export const PHARMACY_INSTAGRAM_HANDLE = "@enviropharmacygh"

/** Primary public hotline for site-wide CTAs (Sakumono — not branch-specific copy). */
export const PHARMACY_PRIMARY_PHONE =
  PHARMACY_BRANCHES.find((b) => b.id === "sakumono")?.phone ?? "053 088 3354"
export const PHARMACY_PRIMARY_TEL =
  PHARMACY_BRANCHES.find((b) => b.id === "sakumono")?.tel ?? "0530883354"

export function pharmacyPrimaryTelHref(): string {
  const digits = PHARMACY_PRIMARY_TEL.replace(/\D/g, "")
  const local = digits.startsWith("233") ? digits : `233${digits.replace(/^0/, "")}`
  return `tel:+${local}`
}
