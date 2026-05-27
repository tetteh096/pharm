import Header from "@/components/medizen/Header"
import Footer from "@/components/medizen/Footer"
import PageTitle from "@/components/medizen/PageTitle"
import Link from "next/link"
import BlogSidebar from "@/components/medizen/BlogSidebar"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import {
  getPublicBlogPosts,
  getBlogCategories,
  getRecentPublicPosts,
  getPublicBlogTags,
} from "@/app/actions/blog"
import { BlogPostList } from "@/components/medizen/BlogPostList"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{
  q?: string
  category?: string
  page?: string
}>

export default async function BlogPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const query = sp.q?.trim() || undefined
  const categoryId = sp.category?.trim() || undefined
  const page = Math.max(1, Number(sp.page) || 1)

  const [result, categories, recent, tags] = await Promise.all([
    getPublicBlogPosts({ query, categoryId, page, pageSize: 5 }),
    getBlogCategories(),
    getRecentPublicPosts(3),
    getPublicBlogTags(10),
  ])

  const activeCategory =
    categoryId ? categories.find((c) => c.id === categoryId) ?? null : null

  // Build a URL helper that preserves existing filters when changing page.
  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    if (query && overrides.q === undefined) params.set("q", query)
    if (categoryId && overrides.category === undefined)
      params.set("category", categoryId)
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v)
    }
    const qs = params.toString()
    return qs ? `/blog?${qs}` : "/blog"
  }

  return (
    <>
      <Header />
      <main className="bg-light/30">
        <PageTitle title="Health Insights & News" />
        <section className="blog-section section-padding py-100">
          <div className="container">
            {(query || activeCategory) && (
              <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
                <span className="pra fw_700">Filters:</span>
                {query && (
                  <Link
                    href={buildHref({ q: undefined, page: undefined })}
                    className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill text-decoration-none fw_700"
                    style={{
                      background: "rgba(17, 87, 238, 0.08)",
                      color: "var(--p2-clr)",
                      fontSize: "0.78rem",
                    }}
                  >
                    Search: &ldquo;{query}&rdquo; ×
                  </Link>
                )}
                {activeCategory && (
                  <Link
                    href={buildHref({ category: undefined, page: undefined })}
                    className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill text-decoration-none fw_700"
                    style={{
                      background: "rgba(19, 236, 138, 0.1)",
                      color: "var(--p1-clr)",
                      fontSize: "0.78rem",
                    }}
                  >
                    {activeCategory.name} ×
                  </Link>
                )}
              </div>
            )}

            <p className="pra mb-4">
              {result.total === 0
                ? "No articles match your filters yet."
                : `Showing ${(result.page - 1) * result.pageSize + 1}–${Math.min(
                    result.page * result.pageSize,
                    result.total
                  )} of ${result.total} article${result.total === 1 ? "" : "s"}.`}
            </p>

            <div className="row g-5">
              <div className="col-lg-8">
                <BlogPostList posts={result.posts} />

                {result.totalPages > 1 && (
                  <div className="pagination-wrapper mt-60">
                    <ul className="blog-pagination d-flex gap-2 list-unstyled justify-content-center mb-0">
                      <li>
                        <Link
                          href={buildHref({
                            page: result.page > 1 ? String(result.page - 1) : "1",
                          })}
                          aria-disabled={result.page <= 1}
                          tabIndex={result.page <= 1 ? -1 : undefined}
                          className={`glass-card d-center rounded-circle hover-p1 ${
                            result.page <= 1
                              ? "text-muted-foreground pointer-events-none opacity-50"
                              : "black"
                          }`}
                          style={{ width: 46, height: 46 }}
                        >
                          <ChevronLeft size={18} />
                        </Link>
                      </li>
                      {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
                        (p) => (
                          <li key={p} className={p === result.page ? "active" : ""}>
                            <Link
                              href={buildHref({ page: String(p) })}
                              className={`d-center rounded-circle ${
                                p === result.page
                                  ? "p1-bg text-white"
                                  : "glass-card black hover-p1"
                              }`}
                              style={{ width: 46, height: 46, fontWeight: 700 }}
                            >
                              {p}
                            </Link>
                          </li>
                        )
                      )}
                      <li>
                        <Link
                          href={buildHref({
                            page:
                              result.page < result.totalPages
                                ? String(result.page + 1)
                                : String(result.totalPages),
                          })}
                          aria-disabled={result.page >= result.totalPages}
                          tabIndex={
                            result.page >= result.totalPages ? -1 : undefined
                          }
                          className={`glass-card d-center rounded-circle hover-p1 ${
                            result.page >= result.totalPages
                              ? "text-muted-foreground pointer-events-none opacity-50"
                              : "black"
                          }`}
                          style={{ width: 46, height: 46 }}
                        >
                          <ChevronRight size={18} />
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="col-lg-4">
                <BlogSidebar
                  categories={categories}
                  recent={recent}
                  tags={tags}
                  currentCategoryId={categoryId}
                  currentQuery={query}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
