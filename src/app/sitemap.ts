import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * Sitemap covering every public, indexable URL: marketing pages, the shop and
 * each active product, and every published blog post. Private routes
 * (dashboard, cart, checkout, auth) are intentionally excluded — see robots.ts.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/service`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/service-details`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/team`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ]

  let productRoutes: MetadataRoute.Sitemap = []
  let blogRoutes: MetadataRoute.Sitemap = []

  try {
    const [products, posts] = await Promise.all([
      prisma.product.findMany({
        where: { active: true },
        select: { id: true, updatedAt: true },
      }),
      prisma.blogPost.findMany({
        where: { status: "Published" },
        select: { id: true, updatedAt: true },
      }),
    ])

    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/shop/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }))

    blogRoutes = posts.map((post) => ({
      url: `${SITE_URL}/blog-details?id=${post.id}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }))
  } catch {
    // If the DB is unreachable at request time, still serve the static sitemap
    // rather than failing the whole route.
  }

  return [...staticRoutes, ...productRoutes, ...blogRoutes]
}
