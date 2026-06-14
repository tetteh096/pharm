import Header from "@/components/medizen/Header"
import Footer from "@/components/medizen/Footer"
import PageTitle from "@/components/medizen/PageTitle"
import Link from "next/link"
import { BRAND_NAME } from "@/lib/brand"
import { CONTACT } from "@/lib/seo"

const LAST_UPDATED = "14 June 2026"

export const metadata = {
  title: "Terms & Conditions",
  description: `The terms and conditions governing your use of the ${BRAND_NAME} website, online ordering, and pharmacy services in Accra, Ghana.`,
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main>
        <PageTitle title="Terms & Conditions" />
        <section className="section-padding">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="legal-content">
                  <p className="pra fs-seven mb-4">
                    <strong>Last updated:</strong> {LAST_UPDATED}
                  </p>

                  <p className="pra mb-4">
                    These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your use of the{" "}
                    {BRAND_NAME} website and services. By using our website or placing an order,
                    you agree to these Terms. If you do not agree, please do not use the site.
                  </p>

                  <h2 className="black mb-3 mt-5">1. About us</h2>
                  <p className="pra mb-4">
                    {BRAND_NAME} is a community pharmacy operating in Accra, Ghana, with branches in
                    Madina, Odorkor, Sakumono and Santeo. You can reach us at{" "}
                    <a href={`mailto:${CONTACT.email}`} className="p1-clr fw_600">
                      {CONTACT.email}
                    </a>{" "}
                    or{" "}
                    <a href={`tel:${CONTACT.phone}`} className="p1-clr fw_600">
                      {CONTACT.phone}
                    </a>
                    .
                  </p>

                  <h2 className="black mb-3 mt-5">2. Use of the website</h2>
                  <p className="pra mb-4">
                    You agree to use the website lawfully and not to misuse it, attempt to disrupt
                    it, or access areas you are not authorised to use. The staff dashboard is
                    restricted to authorised personnel only.
                  </p>

                  <h2 className="black mb-3 mt-5">3. Products, orders &amp; pricing</h2>
                  <ul className="d-grid gap-2 mb-4">
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>
                        Product listings, prices and availability may change at any time and are
                        subject to confirmation by the pharmacy.
                      </span>
                    </li>
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>
                        Placing an order is an offer to buy; we may accept or decline it (for
                        example, if an item is out of stock or a prescription is required).
                      </span>
                    </li>
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>
                        We make reasonable efforts to display information accurately, but errors
                        may occur; where a clear pricing error exists we may cancel the affected
                        order.
                      </span>
                    </li>
                  </ul>

                  <h2 className="black mb-3 mt-5">4. Medicines, prescriptions &amp; advice</h2>
                  <p className="pra mb-4">
                    Some products require a valid prescription and may only be dispensed by a
                    qualified pharmacist. Information on this website is for general information and
                    does not replace professional medical advice. Always follow the guidance of
                    your pharmacist or doctor, and read product labels and leaflets. In an
                    emergency, contact a medical professional immediately.
                  </p>

                  <h2 className="black mb-3 mt-5">5. Delivery &amp; pickup</h2>
                  <p className="pra mb-4">
                    We offer pickup at our branches and delivery within our service areas. Delivery
                    times are estimates and may vary. Please provide accurate contact and address
                    details so we can fulfil your order.
                  </p>

                  <h2 className="black mb-3 mt-5">6. Payment</h2>
                  <p className="pra mb-4">
                    Accepted payment methods are shown at checkout. You agree to provide valid
                    payment details and that you are authorised to use the chosen payment method.
                  </p>

                  <h2 className="black mb-3 mt-5">7. Returns</h2>
                  <p className="pra mb-4">
                    For health and safety reasons, certain medicines and perishable items cannot be
                    returned once dispensed, except where they are faulty or supplied in error. If
                    there is a problem with your order, contact us promptly and we will work to put
                    it right.
                  </p>

                  <h2 className="black mb-3 mt-5">8. Intellectual property</h2>
                  <p className="pra mb-4">
                    All content on this website — including text, logos, images and design — is
                    owned by or licensed to {BRAND_NAME} and may not be copied or reused without our
                    permission.
                  </p>

                  <h2 className="black mb-3 mt-5">9. Limitation of liability</h2>
                  <p className="pra mb-4">
                    To the extent permitted by law, {BRAND_NAME} is not liable for indirect or
                    consequential loss arising from use of the website. Nothing in these Terms
                    excludes liability that cannot be excluded under applicable Ghanaian law.
                  </p>

                  <h2 className="black mb-3 mt-5">10. Privacy</h2>
                  <p className="pra mb-4">
                    Your use of the website is also governed by our{" "}
                    <Link href="/privacy-policy" className="p1-clr fw_600">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/cookie-policy" className="p1-clr fw_600">
                      Cookie Policy
                    </Link>
                    .
                  </p>

                  <h2 className="black mb-3 mt-5">11. Changes &amp; governing law</h2>
                  <p className="pra mb-4">
                    We may update these Terms from time to time; the &ldquo;Last updated&rdquo; date
                    above shows when. These Terms are governed by the laws of the Republic of Ghana.
                  </p>

                  <h2 className="black mb-3 mt-5">12. Contact us</h2>
                  <p className="pra mb-4">
                    Questions about these Terms? Email{" "}
                    <a href={`mailto:${CONTACT.email}`} className="p1-clr fw_600">
                      {CONTACT.email}
                    </a>{" "}
                    or call{" "}
                    <a href={`tel:${CONTACT.phone}`} className="p1-clr fw_600">
                      {CONTACT.phone}
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
