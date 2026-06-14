import Header from "@/components/medizen/Header"
import Footer from "@/components/medizen/Footer"
import PageTitle from "@/components/medizen/PageTitle"
import CheckoutForm from "@/components/medizen/shop/CheckoutForm"
import { getStoreBranches } from "@/app/actions/storefront"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
}

export default async function CheckoutPage() {
  const branches = await getStoreBranches()

  return (
    <>
      <Header />
      <main>
        <PageTitle title="Checkout" />
        <section className="checkout-section section-padding">
          <div className="container">
            <CheckoutForm branches={branches} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
