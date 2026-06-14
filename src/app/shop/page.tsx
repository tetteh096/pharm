import Header from "@/components/medizen/Header"
import Footer from "@/components/medizen/Footer"
import PageTitle from "@/components/medizen/PageTitle"
import ShopBrowser from "@/components/medizen/shop/ShopBrowser"
import FeaturedCarousel from "@/components/medizen/shop/FeaturedCarousel"
import Link from "next/link"
import { Suspense } from "react"
import {
  getShopFilterMeta,
  searchShopProducts,
} from "@/app/actions/storefront"
import { SHOP_PAGE_SIZE } from "@/lib/shop-constants"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Shop Medicines & Health Products Online",
  description:
    "Buy medicines, supplements and health products online from Enviro Pharmacy with pickup or delivery across Madina, Odorkor, Sakumono and Santeo in Accra, Ghana.",
  alternates: { canonical: "/shop" },
}

type ShopSearchParams = Promise<{ q?: string | string[]; page?: string | string[] }>

function parsePageParam(raw: string | string[] | undefined): number {
  const value = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined
  const parsed = Number.parseInt(value ?? "1", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: ShopSearchParams
}) {
  const sp = await searchParams
  const rawQ = sp.q
  const initialQuery =
    typeof rawQ === "string" ? rawQ.trim() : Array.isArray(rawQ) ? rawQ[0]?.trim() ?? "" : ""
  const initialPage = parsePageParam(sp.page)

  const [initialResult, meta, featured] = await Promise.all([
    searchShopProducts({
      sort: "latest",
      page: initialPage,
      pageSize: SHOP_PAGE_SIZE,
      ...(initialQuery ? { query: initialQuery } : {}),
    }),
    getShopFilterMeta(),
    searchShopProducts({ featuredOnly: true, sort: "featured", page: 1, pageSize: 12 }),
  ])

  return (
    <>
      <Header />
      <main className="bg-light/30">
        <PageTitle title="Pharmacy Shop" />
        <section className="shop-section section-padding py-100">
          <div className="container">
            {meta.totalActive === 0 ? (
              <div
                className="shop-empty-state text-center py-5 rounded-4"
                style={{ maxWidth: 560, margin: "0 auto" }}
              >
                <h4 className="black fw_800 mb-2">No products in the shop yet</h4>
                <p className="pra mb-4">
                  Once products are added in the staff dashboard they will appear here.
                </p>
                <Link
                  href="/contact"
                  className="common-btn box-style first-box rounded-5 px-4 py-2 fw_800 border-0"
                >
                  Contact a branch
                </Link>
              </div>
            ) : (
              <>
                {featured.products.length > 0 && (
                  <FeaturedCarousel products={featured.products} />
                )}
                <div id="all-products" style={{ scrollMarginTop: 100 }}>
                  <Suspense
                    fallback={
                      <div className="text-center py-5 pra">Loading products…</div>
                    }
                  >
                    <ShopBrowser
                      initialResult={initialResult}
                      meta={meta}
                      initialQuery={initialQuery}
                      initialPage={initialPage}
                    />
                  </Suspense>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
