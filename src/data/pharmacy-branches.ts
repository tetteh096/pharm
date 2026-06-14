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
    id: "madina",
    name: "Madina Branch",
    location: "La-Nkwantanang-Madina, Accra",
    gps: "GM-000-2908",
    hours: "Open 24 hours · Every day",
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
    id: "santeo",
    name: "Santeo Branch",
    location: "Icgc Dominion Temple, Adjei Kojo Santeo Road, Santoe",
    gps: "GK-0566-4497",
    hours: "Monday – Saturday",
    phone: null,
    tel: null,
    maps: "https://www.google.com/maps/dir/?api=1&destination=Icgc+Dominion+Temple,+Adjei+Kojo+Santeo+Road,+Santoe,+Accra,+Ghana",
    mapEmbed:
      "https://maps.google.com/maps?q=Icgc+Dominion+Temple,+Adjei+Kojo+Santeo+Road,+Santoe,+Accra,+Ghana&hl=en&z=16&output=embed",
    accent: "#f59e0b",
    comingSoon: true,
  },
]

export const PHARMACY_EMAIL = "enviropharmacyltd@gmail.com"
export const PHARMACY_INSTAGRAM = "https://www.instagram.com/enviropharmacygh"
export const PHARMACY_INSTAGRAM_HANDLE = "@enviropharmacygh"
