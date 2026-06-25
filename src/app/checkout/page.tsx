import Header from "@/components/medizen/Header"
import Footer from "@/components/medizen/Footer"
import PageTitle from "@/components/medizen/PageTitle"
import CheckoutForm from "@/components/medizen/shop/CheckoutForm"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
}

export default async function CheckoutPage() {
  return (
    <>
      <Header />
      <main>
        <PageTitle title="Checkout" />
        <section className="checkout-section section-padding">
          <div className="container">
            <CheckoutForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
