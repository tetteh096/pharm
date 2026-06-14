import { notFound } from "next/navigation"
import Link from "next/link"
import Header from "@/components/medizen/Header"
import Footer from "@/components/medizen/Footer"
import PageTitle from "@/components/medizen/PageTitle"
import ProductCard from "@/components/medizen/ProductCard"
import ProductDetailsClient from "@/components/medizen/shop/ProductDetailsClient"
import { getShopProduct, getShopProducts } from "@/app/actions/storefront"
import type { Metadata } from "next"
import { OG_IMAGE } from "@/lib/seo"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getShopProduct(id)
  if (!product) {
    return { title: "Product not found", robots: { index: false, follow: false } }
  }

  const description = product.description?.trim()
    ? product.description.slice(0, 160)
    : `Buy ${product.name} (${product.category}) from Enviro Pharmacy — pickup or delivery across Madina, Odorkor, Sakumono and Santeo in Accra, Ghana.`

  // Only use the product image for OG if it's a real URL/path (skip data-URI fallbacks).
  const ogImage =
    product.image && /^(https?:|\/)/.test(product.image) ? product.image : OG_IMAGE

  return {
    title: product.name,
    description,
    alternates: { canonical: `/shop/${product.id}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/shop/${product.id}`,
      images: [{ url: ogImage, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [ogImage],
    },
  }
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getShopProduct(id)
  if (!product) notFound()

  const all = await getShopProducts()
  const related = all
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4)

  return (
    <>
      <Header />
      <main>
        <PageTitle title={product.name} />
        <section className="product-details-section section-padding">
          <div className="container">
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb mb-0" style={{ fontSize: "0.85rem" }}>
                <li className="breadcrumb-item">
                  <Link href="/" className="text-decoration-none">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href="/shop" className="text-decoration-none">Shop</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {product.name}
                </li>
              </ol>
            </nav>

            <ProductDetailsClient product={product} />

            {related.length > 0 && (
              <div className="related-products mt-60 pt-5 border-top">
                <h3 className="black mb-4 fw_800 text-center">You may also like</h3>
                <div className="row g-4">
                  {related.map((p) => (
                    <div key={p.id} className="col-6 col-sm-4 col-md-6 col-lg-3">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
