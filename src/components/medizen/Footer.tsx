import React from "react"
import Link from "next/link"
import { getPublicSiteSettings } from "@/lib/site-settings"
import { FooterWidgets } from "@/components/medizen/FooterWidgets"

const Footer = async () => {
  const { socialLinks } = await getPublicSiteSettings()

  return (
    <footer className="footer-section z-1 position-relative blackbg fix">
        <div className="container">
            <div className="footer-newsletter">
                <h2 className="fw_600 white visible-slowly-right position-relative mb-40 footer-newsletter__title">
                    Stay close to Enviro Pharmacy for branch updates, wellness tips, and pharmacy news
                    <img src="/assets/img/element/newsletter-element.png" alt="" className="newsletter-element" />
                </h2>
                <form action="#" className="form-cmn-style1 footer-newsletter__form">
                    <input type="text" placeholder="Enter your email" aria-label="Email for newsletter" />
                    <button type="button"
                        className="common-btn text-nowrap box-style py-3 first-box d-inline-flex justify-content-center align-items-center fs-seven fw_600 gap-xxl-2 gap-2 fs18 fw-semibold black overflow-hidden p1-bg rounded-5">
                        Subscribe Now
                        <img src="/assets/img/icon/arrow-right-black.png" alt="" />
                    </button>
                </form>
            </div>
            <div className="footer-space">
                <FooterWidgets socialLinks={socialLinks} />
            </div>
        </div>
        <div className="footer-bottom text-center">
            <div className="container">
                <p className="body-font text-center pt-4 pb-2 mb-0">
                    &copy; {new Date().getFullYear()} Enviro Pharmacy &middot; All Rights Reserved
                </p>
                <p className="body-font text-center pb-4 mb-0 fs-seven footer-bottom__links">
                    <Link href="/privacy-policy" className="white">Privacy Policy</Link>
                    {" · "}
                    <Link href="/terms" className="white">Terms &amp; Conditions</Link>
                    {" · "}
                    <Link href="/cookie-policy" className="white">Cookie Policy</Link>
                </p>
            </div>
        </div>
        <img src="/assets/img/element/footer-element.png" alt="" className="footer-element" />
    </footer>
  )
}

export default Footer
