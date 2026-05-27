import Header from "@/components/medizen/Header"
import Footer from "@/components/medizen/Footer"
import PageTitle from "@/components/medizen/PageTitle"
import CartView from "@/components/medizen/shop/CartView"
import FeaturedCarousel from "@/components/medizen/shop/FeaturedCarousel"
import { searchShopProducts } from "@/app/actions/storefront"

export const metadata = {
  title: "Cart | Enviro Pharmacy",
}

export default async function CartPage() {
  // Show a "You might also like" carousel below the cart for upsell.
  // Pull featured + in-stock products from the live catalog.
  const upsell = await searchShopProducts({
    sort: "featured",
    pageSize: 12,
    inStockOnly: true,
  }).catch(() => null)

  return (
    <>
      <Header />
      <main>
        <PageTitle title="Your Cart" />
        <section className="cart-section section-padding">
          <div className="container">
            <CartView />
          </div>
        </section>

        {upsell && upsell.products.length > 0 && (
          <section className="pb-5">
            <div className="container">
              <FeaturedCarousel
                products={upsell.products}
                title="You might also like"
                subtitle="Customer favourites and trusted pharmacy picks."
              />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
