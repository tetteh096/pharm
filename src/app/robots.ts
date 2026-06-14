import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

/** When true, this deployment is not on the final domain — keep it fully out of search. */
const BLOCK_INDEX =
  process.env.SEO_BLOCK_INDEX === "1" || process.env.SEO_BLOCK_INDEX === "true"

/**
 * Allow crawlers across all public marketing/shop/blog pages, but keep private
 * surfaces (dashboard, cart, checkout, auth, API) out of the index.
 *
 * While SEO_BLOCK_INDEX is set (e.g. on the temporary *.vercel.app URL before
 * the real domain is live) we disallow everything so the wrong host never gets
 * indexed. Remove the env var once enviropharmacy.com is the production domain.
 */
export default function robots(): MetadataRoute.Robots {
  if (BLOCK_INDEX) {
    return { rules: [{ userAgent: "*", disallow: "/" }] }
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/cart",
          "/checkout",
          "/signin",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
