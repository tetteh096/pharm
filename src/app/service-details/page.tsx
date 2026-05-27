import Header from "@/components/medizen/Header";
import Footer from "@/components/medizen/Footer";
import PageTitle from "@/components/medizen/PageTitle";
import Link from "next/link";

export default function ServiceDetailsPage() {
  return (
    <>
      <Header />
      <main>
        <PageTitle title="Service Details" />
        <section className="service-details-section section-padding">
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="service-details-wraping">
                  <div className="mb-4">
                    <h2 className="black mb-xxl-3 mb-2">A healthy tomorrow starts today</h2>
                    <p className="pra">
                      Medical services are an essential part of our lives, offering care and
                      treatment for various health conditions. These services encompass a wide range of specialties, 
                      including primary care, pediatrics, cardiology.
                    </p>
                  </div>
                  <div className="thumb rounded-4 mb-4 w-100">
                    <img src="/assets/img/service/service-details-big.jpg" alt="img" className="rounded-4 w-100" />
                  </div>
                  <div className="mb-4">
                    <h4 className="black mb-3">Senior Care Coordination</h4>
                    <ul className="d-grid gap-xxl-3 gap-2">
                      <li className="d-flex align-items-center gap-2 pra fs-seven">
                        <i className="fa-solid fa-angles-right pra"></i>
                        Dental operations involve various procedures performed by dentists
                      </li>
                      <li className="d-flex align-items-center gap-2 pra fs-seven">
                        <i className="fa-solid fa-angles-right pra"></i>
                        Medical services are an essential part of our lives, offering care
                      </li>
                      <li className="d-flex align-items-center gap-2 pra fs-seven">
                        <i className="fa-solid fa-angles-right pra"></i>
                        These services encompass a wide range of specialties, including primary care, pediatrics, cardiology
                      </li>
                    </ul>
                  </div>
                  <div className="mb-4">
                    <h4 className="black mb-3">Holistic Health Consultations</h4>
                    <p className="pra mb-xxl-3 mb-2">
                      Medical services are an essential part of our lives, offering care and treatment for
                      various health conditions. These services encompass a wide range of specialties, 
                      including primary care, pediatrics, cardiology.
                    </p>
                  </div>
                  <div className="row g-4 mb-4">
                    <div className="col-lg-6 col-md-6">
                      <div className="service-dorp-out">
                        <img src="/assets/img/icon/flask.png" alt="img" className="mb-xxl-3 mb-2" />
                        <h6 className="fw_500 mb-xxl-3 mb-2 black">
                          Wellness Oasis CarePoint Health the Institute Thrive Wellness Hub
                        </h6>
                        <p className="pra">
                          Health care is a vital aspect maintaining overall well-being, encompassing a range
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6">
                      <div className="service-dorp-out">
                        <img src="/assets/img/icon/serum.png" alt="img" className="mb-xxl-3 mb-2" />
                        <h6 className="fw_500 mb-xxl-3 mb-2 black">
                          Where health meets hope Your the a partner in wellness
                        </h6>
                        <p className="pra">
                          Health care is a vital aspect maintaining overall well-being, encompassing a range
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-4">
                <div className="blog-details-right">
                  <div className="details-common category-service">
                    <h4 className="black d-flex align-items-center gap-2 mb-4 fw_700"> Services </h4>
                    <ul className="cates">
                      <li>
                        <Link href="/service-details" className="d-flex align-items-center justify-content-between fs-five black">
                          <span className="pra fs-seven">
                            <i className="fa-solid fa-angles-right p2-clr"></i> A Tradition of Healing
                          </span>
                          <span className="just-serial">(02)</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/service-details" className="d-flex align-items-center justify-content-between fs-five black">
                          <span className="pra fs-seven">
                            <i className="fa-solid fa-angles-right p2-clr"></i> Harmony Holistic Health
                          </span>
                          <span className="just-serial">(05)</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="details-common quick-call text-center">
                    <h4 className="black">Need Help? Call Us</h4>
                    <Link href="tel:+888178456765" className="d-center call rounded-circle p2-bg m-auto">
                      <i className="fa-solid fa-phone text-white"></i>
                    </Link>
                    <p className="pra mb-xxl-4 mb-3">Health care is a vital aspect of maintaining overall well-being.</p>
                    <Link href="tel:+888178456765" className="numbs heading-font">(+888) 178 456 765</Link>
                  </div>

                  <div className="details-common download-area">
                    <div className="thumb rounded-circle m-auto w-100 mb-3" style={{maxWidth: '150px'}}>
                      <img src="/assets/img/service/service-detail-devid.jpg" alt="img" className="rounded-circle w-100" />
                    </div>
                    <div className="cont text-center mb-3">
                      <h4 className="black mb-1">Dr. Chris Bekham</h4>
                      <span className="pra">Cardiac Surgeon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
