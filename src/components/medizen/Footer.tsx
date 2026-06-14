import React from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/brand/BrandLogo"
import { getPublicSiteSettings } from "@/lib/site-settings"
import { PHARMACY_EMAIL, PHARMACY_BRANCHES } from "@/data/pharmacy-branches"

const Footer = async () => {
  const { socialLinks } = await getPublicSiteSettings()

  return (
    <footer className="footer-section z-1 position-relative blackbg fix">
        <div className="container">
            <div className="footer-newsletter">
                <h2 className="fw_600 white visible-slowly-right position-relative mb-40">
                    Stay close to Enviro Pharmacy for branch updates, wellness tips, and pharmacy news
                    <img src="/assets/img/element/newsletter-element.png" alt="element" className="newsletter-element" />
                </h2>
                <form action="#" className="form-cmn-style1">
                    <input type="text" placeholder="Enter your email" />
                    <button type="button"
                        className="common-btn text-nowrap box-style py-3 first-box d-inline-flex justify-content-center align-items-center fs-seven fw_600 gap-xxl-2 gap-2 fs18 fw-semibold black overflow-hidden p1-bg rounded-5">
                        Subscribe Now
                        <img src="/assets/img/icon/arrow-right-black.png" alt="icon" />
                    </button>
                </form>
            </div>
            <div className="footer-space">
                <div className="footer-widgets-wrapper">
                    <div className="row g-4 justify-content-between">
                        <div className="col-lg-3 col-md-6 col-sm-7">
                            <div className="single-footer-widget wow fadeInUp" data-wow-delay="0.4s">
                                <div className="widget-head">
                                    <Link href="/" aria-label="Enviro Pharmacy home">
                                        <BrandLogo variant="full" className="h-16 w-44" />
                                    </Link>
                                </div>
                                <div className="footer-content">
                                    <p className="pra2">
                                        Serving Madina, Odorkor, Sakumono and Santeo with trusted medications, pharmacist support,
                                        and 24-hour pharmacy service.
                                    </p>
                                    {socialLinks.length > 0 ? (
                                      <div className="social-wrapper d-flex align-items-center">
                                        {socialLinks.map((link) => (
                                          <a
                                            key={link.key}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="black"
                                            aria-label={link.label}
                                          >
                                            <i className={link.icon} />
                                          </a>
                                        ))}
                                      </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-5 d-flex justify-content-lg-center">
                            <div className="single-footer-widget wow fadeInUp" data-wow-delay="0.6s">
                                <div className="widget-head">
                                    <h4 className="white fw_600">Page</h4>
                                </div>
                                <ul className="list-area">
                                    <li>
                                        <Link href="/about">About Us</Link>
                                    </li>
                                    <li>
                                        <Link href="/service">Services</Link>
                                    </li>
                                    <li>
                                        <Link href="/contact">Why Choose Us</Link>
                                    </li>
                                    <li>
                                        <Link href="/doctor">Doctors</Link>
                                    </li>
                                    <li>
                                        <Link href="/blog">Blog & News</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-6 d-flex justify-content-lg-center">
                            <div className="single-footer-widget wow fadeInUp" data-wow-delay="0.6s">
                                <div className="widget-head">
                                    <h4 className="white fw_600">Link</h4>
                                </div>
                                <ul className="list-area">
                                    <li>
                                        <Link href="/contact">Terms & Conditions</Link>
                                    </li>
                                    <li>
                                        <Link href="/contact">Privacy Policy</Link>
                                    </li>
                                    <li>
                                        <Link href="/contact">Contact Us</Link>
                                    </li>
                                    <li>
                                        <Link href="/contact">Terms of Use</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-5 d-flex justify-content-lg-center">
                            <div className="single-footer-widget wow fadeInUp" data-wow-delay="0.7s">
                                <div className="widget-head">
                                    <h4 className="white">Contact</h4>
                                </div>
                                <ul className="footer-info d-flex flex-column gpa-xxl-4 gap-3">
                                    <li className="d-flex align-items-center gap-xl-3 gap-2">
                                        <span className="icon d-center"><i className="fa-solid fa-location-dot"></i></span>
                                        <div className="cont">
                                            <span className="pra fs-seven d-block">Branches</span>
                                            <a href="#" className="fs-six fw_500 white sub-font">Madina, Odorkor, Sakumono &amp; Santeo, Accra</a>
                                        </div>
                                    </li>
                                    {PHARMACY_BRANCHES.map((branch) => (
                                      <li key={branch.id} className="d-flex align-items-center gap-xl-3 gap-2">
                                        <span className="icon d-center"><i className="fa-solid fa-phone"></i></span>
                                        <div className="cont">
                                          <span className="pra fs-seven d-block">{branch.name}</span>
                                          {branch.tel ? (
                                            <a
                                              href={`tel:+233${branch.tel.replace(/^0/, "")}`}
                                              className="fs-six fw_500 white sub-font"
                                            >
                                              {branch.phone}
                                            </a>
                                          ) : (
                                            <span className="fs-six fw_500 white sub-font">Coming soon</span>
                                          )}
                                        </div>
                                      </li>
                                    ))}
                                    <li className="d-flex align-items-center gap-xl-3 gap-2">
                                        <span className="icon d-center"><i className="fa-solid fa-envelope"></i></span>
                                        <div className="cont">
                                            <span className="pra fs-seven d-block">Email</span>
                                            <a href={`mailto:${PHARMACY_EMAIL}`} className="fs-six fw_500 white sub-font">{PHARMACY_EMAIL}</a>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="footer-bottom text-center">
            <div className="container">
                <p className="body-font text-center py-4">
                    &copy; {new Date().getFullYear()} Enviro Pharmacy &middot; All Rights Reserved
                </p>
            </div>
        </div>
        <img src="/assets/img/element/footer-element.png" alt="element" className="footer-element" />
    </footer>
  )
}

export default Footer
