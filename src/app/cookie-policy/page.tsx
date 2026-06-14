import Header from "@/components/medizen/Header"
import Footer from "@/components/medizen/Footer"
import PageTitle from "@/components/medizen/PageTitle"
import Link from "next/link"
import { BRAND_NAME } from "@/lib/brand"
import { CONTACT } from "@/lib/seo"

const LAST_UPDATED = "14 June 2026"

export const metadata = {
  title: "Cookie Policy",
  description: `How ${BRAND_NAME} uses cookies and local storage to keep the website working and remember your preferences, and how you can manage your choices.`,
  alternates: { canonical: "/cookie-policy" },
}

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <main>
        <PageTitle title="Cookie Policy" />
        <section className="section-padding">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="legal-content">
                  <p className="pra fs-seven mb-4">
                    <strong>Last updated:</strong> {LAST_UPDATED}
                  </p>

                  <p className="pra mb-4">
                    This Cookie Policy explains how {BRAND_NAME} uses cookies and similar browser
                    storage on our website. It should be read together with our{" "}
                    <Link href="/privacy-policy" className="p1-clr fw_600">
                      Privacy Policy
                    </Link>
                    .
                  </p>

                  <h2 className="black mb-3 mt-5">1. What are cookies?</h2>
                  <p className="pra mb-4">
                    Cookies are small text files stored on your device by your browser. We also use
                    related technologies such as <em>local storage</em> to keep the site working
                    and to remember your preferences. We refer to all of these as
                    &ldquo;cookies&rdquo; below.
                  </p>

                  <h2 className="black mb-3 mt-5">2. Cookies we use</h2>

                  <h3 className="black mb-2 mt-4">Strictly necessary</h3>
                  <p className="pra mb-3">
                    These are required for the site to function and cannot be switched off.
                  </p>
                  <ul className="d-grid gap-2 mb-4">
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>
                        <strong>Sign-in session</strong> — when staff log in to the dashboard, a
                        secure session cookie keeps them signed in.
                      </span>
                    </li>
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>
                        <strong>Cookie consent</strong> — we store your consent choice (for one
                        year) so we don&rsquo;t ask you on every visit.
                      </span>
                    </li>
                  </ul>

                  <h3 className="black mb-2 mt-4">Preferences</h3>
                  <p className="pra mb-3">
                    These remember your choices to improve your experience.
                  </p>
                  <ul className="d-grid gap-2 mb-4">
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>
                        <strong>Theme</strong> — remembers whether you prefer light or dark mode.
                      </span>
                    </li>
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>
                        <strong>Shopping cart</strong> — keeps the items in your cart available in
                        your browser between visits.
                      </span>
                    </li>
                  </ul>

                  <p className="pra mb-4">
                    We do <strong>not</strong> use advertising or third-party tracking cookies to
                    profile you.
                  </p>

                  <h2 className="black mb-3 mt-5">3. Managing cookies</h2>
                  <p className="pra mb-4">
                    When you first visit, our cookie banner lets you choose
                    &ldquo;Essential only&rdquo; or &ldquo;Accept all&rdquo;. You can also clear or
                    block cookies at any time through your browser settings — though disabling
                    strictly necessary cookies may stop parts of the site (such as the cart or
                    staff sign-in) from working.
                  </p>

                  <h2 className="black mb-3 mt-5">4. Changes to this policy</h2>
                  <p className="pra mb-4">
                    We may update this policy from time to time. Material changes will be reflected
                    by the &ldquo;Last updated&rdquo; date above.
                  </p>

                  <h2 className="black mb-3 mt-5">5. Contact us</h2>
                  <p className="pra mb-4">
                    Questions about cookies? Email{" "}
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
