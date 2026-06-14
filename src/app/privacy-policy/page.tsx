import Header from "@/components/medizen/Header"
import Footer from "@/components/medizen/Footer"
import PageTitle from "@/components/medizen/PageTitle"
import Link from "next/link"
import { BRAND_NAME } from "@/lib/brand"
import { CONTACT } from "@/lib/seo"

const LAST_UPDATED = "14 June 2026"

export const metadata = {
  title: "Privacy Policy",
  description: `How ${BRAND_NAME} collects, uses, protects and shares your personal information across our pharmacy branches in Accra, Ghana, and the rights you have under the Data Protection Act, 2012 (Act 843).`,
  alternates: { canonical: "/privacy-policy" },
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main>
        <PageTitle title="Privacy Policy" />
        <section className="section-padding">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="legal-content">
                  <p className="pra fs-seven mb-4">
                    <strong>Last updated:</strong> {LAST_UPDATED}
                  </p>

                  <p className="pra mb-4">
                    {BRAND_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting
                    your privacy. This policy explains what personal information we collect when
                    you use our website and pharmacy services across our branches in Madina,
                    Odorkor, Sakumono and Santeo (Accra, Ghana), how we use it, and the choices
                    you have. We process personal data in line with Ghana&rsquo;s Data Protection
                    Act, 2012 (Act 843).
                  </p>

                  <h2 className="black mb-3 mt-5">1. Who we are</h2>
                  <p className="pra mb-4">
                    {BRAND_NAME} is a community pharmacy operating in Accra, Ghana. For any
                    privacy-related question or request, contact us at{" "}
                    <a href={`mailto:${CONTACT.email}`} className="p1-clr fw_600">
                      {CONTACT.email}
                    </a>{" "}
                    or by phone at{" "}
                    <a href={`tel:${CONTACT.phone}`} className="p1-clr fw_600">
                      {CONTACT.phone}
                    </a>
                    .
                  </p>

                  <h2 className="black mb-3 mt-5">2. Information we collect</h2>
                  <p className="pra mb-3">
                    We only collect information you provide to us or that is necessary to deliver
                    our services:
                  </p>
                  <ul className="d-grid gap-2 mb-4">
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>
                        <strong>Order &amp; delivery details</strong> — your name, phone number,
                        email (optional), delivery address and any GPS location you pin on the
                        map, the branch you choose, and the items in your order.
                      </span>
                    </li>
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>
                        <strong>Consultation &amp; chronic-care requests</strong> — health-related
                        details you choose to share so our pharmacists can advise or manage
                        ongoing care.
                      </span>
                    </li>
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>
                        <strong>Contact &amp; enquiry messages</strong> — the name, phone, email
                        and message you submit through our contact form.
                      </span>
                    </li>
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>
                        <strong>Blog comments</strong> — the name and phone number you provide
                        when commenting on an article.
                      </span>
                    </li>
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>
                        <strong>Technical &amp; cookie data</strong> — limited information stored
                        in your browser to keep the site working (see our{" "}
                        <Link href="/cookie-policy" className="p1-clr fw_600">
                          Cookie Policy
                        </Link>
                        ).
                      </span>
                    </li>
                  </ul>

                  <h2 className="black mb-3 mt-5">3. How we use your information</h2>
                  <p className="pra mb-3">We use your information to:</p>
                  <ul className="d-grid gap-2 mb-4">
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>Process, fulfil and deliver your orders and send order updates.</span>
                    </li>
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>Respond to consultations, enquiries and chronic-care needs.</span>
                    </li>
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>Provide pharmacist support and improve our services.</span>
                    </li>
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>Meet our legal, regulatory and pharmacy record-keeping obligations.</span>
                    </li>
                  </ul>
                  <p className="pra mb-4">
                    We do <strong>not</strong> sell your personal information, and we do not use it
                    for advertising profiling.
                  </p>

                  <h2 className="black mb-3 mt-5">4. Health information</h2>
                  <p className="pra mb-4">
                    Information about your health is sensitive. We only collect it when you choose
                    to share it for a consultation, prescription or chronic-care service, handle it
                    with strict confidentiality, and limit access to the pharmacy staff who need it
                    to care for you.
                  </p>

                  <h2 className="black mb-3 mt-5">5. Sharing your information</h2>
                  <p className="pra mb-4">
                    We share personal data only where necessary: with our pharmacy staff and
                    branches serving you; with trusted service providers who help us operate (for
                    example, hosting and email delivery) under confidentiality obligations; and
                    where required by law or by a competent regulatory authority.
                  </p>

                  <h2 className="black mb-3 mt-5">6. How long we keep it</h2>
                  <p className="pra mb-4">
                    We keep personal data only for as long as needed to provide our services and to
                    satisfy legal, pharmacy and accounting record-keeping requirements, after which
                    it is securely deleted or anonymised.
                  </p>

                  <h2 className="black mb-3 mt-5">7. How we protect it</h2>
                  <p className="pra mb-4">
                    We use appropriate technical and organisational measures — including encrypted
                    connections, access controls and security headers — to protect your information
                    against unauthorised access, loss or misuse.
                  </p>

                  <h2 className="black mb-3 mt-5">8. Your rights</h2>
                  <p className="pra mb-3">
                    Under the Data Protection Act, 2012 (Act 843) you have the right to:
                  </p>
                  <ul className="d-grid gap-2 mb-4">
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>Access the personal information we hold about you.</span>
                    </li>
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>Ask us to correct information that is inaccurate or incomplete.</span>
                    </li>
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>Ask us to delete information where we are not required to keep it.</span>
                    </li>
                    <li className="d-flex gap-2 pra fs-seven">
                      <i className="fa-solid fa-angles-right p1-clr mt-1" />
                      <span>Object to or restrict certain uses of your information.</span>
                    </li>
                  </ul>
                  <p className="pra mb-4">
                    To exercise any of these rights, contact us at{" "}
                    <a href={`mailto:${CONTACT.email}`} className="p1-clr fw_600">
                      {CONTACT.email}
                    </a>
                    .
                  </p>

                  <h2 className="black mb-3 mt-5">9. Changes to this policy</h2>
                  <p className="pra mb-4">
                    We may update this policy from time to time. Material changes will be reflected
                    by the &ldquo;Last updated&rdquo; date at the top of this page.
                  </p>

                  <h2 className="black mb-3 mt-5">10. Contact us</h2>
                  <p className="pra mb-2">
                    Questions about this policy or your data? Reach us at:
                  </p>
                  <p className="pra mb-1">
                    Email:{" "}
                    <a href={`mailto:${CONTACT.email}`} className="p1-clr fw_600">
                      {CONTACT.email}
                    </a>
                  </p>
                  <p className="pra mb-4">
                    Phone:{" "}
                    <a href={`tel:${CONTACT.phone}`} className="p1-clr fw_600">
                      {CONTACT.phone}
                    </a>{" "}
                    · Branches in Madina, Odorkor, Sakumono &amp; Santeo, Accra.
                  </p>

                  <p className="pra fs-seven mt-5">
                    See also our{" "}
                    <Link href="/cookie-policy" className="p1-clr fw_600">
                      Cookie Policy
                    </Link>
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
