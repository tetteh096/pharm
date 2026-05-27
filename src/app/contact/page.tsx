import type { Metadata } from "next";
import Header from "@/components/medizen/Header";
import Footer from "@/components/medizen/Footer";
import PageTitle from "@/components/medizen/PageTitle";

export const metadata: Metadata = {
  title: "Contact Us | Enviro Pharmacy",
  description: "Contact Enviro Pharmacy branches in Madina and Odorkor for directions, branch hours, and pharmacy support.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <PageTitle title="Contact Us" />
        <section className="contact-section section-padding fix">
          <div className="container">
            <div className="space-bottom mb-5">
              <div className="row g-xl-6 g-4 contact-info-area">
                <div className="col-lg-3 col-md-6 col-sm-6">
                  <div className="contact-info p-4 rounded-4 bg-white shadow-sm d-flex align-items-start gap-3 h-100">
                    <div className="icon p2-clr fs-three"><i className="fa-solid fa-location-dot"></i></div>
                    <div className="cont">
                      <h4 className="fw-bold black d-block mb-1">Branches</h4>
                      <p className="pra fs-seven mb-1">Madina, La-Nkwantanang-Madina</p>
                      <p className="pra fs-seven mb-1">Odorkor, Accra</p>
                      <p className="pra fs-seven mb-0">Sakumono NHTC Estate, Accra</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 col-sm-6">
                  <div className="contact-info p-4 rounded-4 bg-white shadow-sm d-flex align-items-start gap-3 h-100">
                    <div className="icon p2-clr fs-three"><i className="fa-solid fa-clock"></i></div>
                    <div className="cont">
                      <h4 className="fw-bold black d-block mb-1">Hours</h4>
                      <p className="pra fs-seven mb-1">Madina: Open 24 hours</p>
                      <p className="pra fs-seven mb-1">Odorkor: Mon – Sat</p>
                      <p className="pra fs-seven mb-0">Sakumono: Mon – Sat</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 col-sm-6">
                  <div className="contact-info p-4 rounded-4 bg-white shadow-sm d-flex align-items-start gap-3 h-100">
                    <div className="icon p2-clr fs-three"><i className="fa-solid fa-phone"></i></div>
                    <div className="cont">
                      <h4 className="fw-bold black d-block mb-1">Phone</h4>
                      <a href="tel:+233554612072" className="pra fs-seven d-block">Madina: 055 461 2072</a>
                      <a href="tel:+233599376675" className="pra fs-seven d-block">Odorkor: 059 937 6675</a>
                      <a href="tel:+233530883354" className="pra fs-seven d-block">Sakumono: 053 088 3354</a>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 col-sm-6">
                  <div className="contact-info p-4 rounded-4 bg-white shadow-sm d-flex align-items-start gap-3 h-100">
                    <div className="icon p2-clr fs-three"><i className="fa-solid fa-envelope"></i></div>
                    <div className="cont">
                      <h4 className="fw-bold black d-block mb-1">Email &amp; Social</h4>
                      <a href="mailto:enviropharmacyltd@gmail.com" className="pra fs-seven d-block">enviropharmacyltd@gmail.com</a>
                      <a href="https://www.instagram.com/enviropharmacygh" target="_blank" rel="noopener noreferrer" className="pra fs-seven d-block">@enviropharmacygh</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="contact-wrapper-anys white-bg rounded-4 shadow-sm overflow-hidden">
              <div className="row g-0 align-items-center">
                <div className="col-lg-7 p-xl-5 p-4">
                  <form action="#" className="appoentment-forms">
                    <div className="section-title mb-4">
                      <span className="black fw_700 fs-six d-block mb-2 heading-font">Contact Us</span>
                      <h2 className="black">
                        Contact the{" "}
                        <span className="position-relative z-1">
                          Pharmacy
                          <img src="/assets/img/element/title-badge1.png" alt="img" className="title-badge1 d-md-block d-none position-absolute start-0 bottom-0 w-100" style={{zIndex: -1}} />
                        </span>
                      </h2>
                      <p className="pra mt-3 mb-0">
                        Ask about stock availability, branch directions, prescription support, or delivery help.
                      </p>
                    </div>
                    <div className="row g-3">
                      <div className="col-lg-6">
                        <input type="text" placeholder="Your Name" className="form-control" />
                      </div>
                      <div className="col-lg-6">
                        <input type="email" placeholder="Your Email" className="form-control" />
                      </div>
                      <div className="col-lg-6">
                        <input type="text" placeholder="Phone Number" className="form-control" />
                      </div>
                      <div className="col-lg-6">
                        <input type="text" placeholder="Subject" className="form-control" />
                      </div>
                      <div className="col-lg-12">
                        <textarea name="message" placeholder="Message" rows={5} className="form-control"></textarea>
                      </div>
                      <div className="col-lg-12 mt-4">
                        <button type="button" className="common-btn box-style p2-bg text-white w-100 rounded-5 py-3 fw-bold">
                          Send Message
                          <img src="/assets/img/icon/arrow-right-white.png" alt="icon" className="ms-2" />
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="col-lg-5">
                  <div className="contact-thumb h-100">
                    <img
                      src="/assets/img/choose/contact-thumb.jpg"
                      alt="Pharmacist assisting a customer"
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="map-area mb-5">
          <div className="container">
            <div className="rounded-4 overflow-hidden shadow-sm" style={{height: '450px'}}>
              <iframe
                src="https://www.google.com/maps?q=Madina,+Accra,+Ghana&output=embed"
                width="100%"
                height="100%"
                style={{border: 0}}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
