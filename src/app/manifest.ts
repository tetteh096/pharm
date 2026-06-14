import type { MetadataRoute } from "next"
import { BRAND_NAME } from "@/lib/brand"
import { SITE_DESCRIPTION } from "@/lib/seo"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_NAME,
    short_name: "Enviro",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0e7c5a",
    icons: [
      { src: "/logo/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/logo/favicon-48.png", sizes: "48x48", type: "image/png" },
      { src: "/logo/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  }
}
