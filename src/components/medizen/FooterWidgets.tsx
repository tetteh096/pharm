"use client"

import React from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { BrandLogo } from "@/components/brand/BrandLogo"
import type { SocialLink } from "@/lib/site-settings-shared"
import {
  PHARMACY_EMAIL,
  PHARMACY_HELP_EMAIL,
  PHARMACY_PRIMARY_PHONE,
  pharmacyPrimaryTelHref,
} from "@/data/pharmacy-branches"

type Props = {
  socialLinks: SocialLink[]
}

function FooterAccordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <div className="footer-accordion d-lg-none">
      <button
        type="button"
        className="footer-accordion__trigger"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <ChevronDown
          size={18}
          className={`footer-accordion__chevron${open ? " is-open" : ""}`}
          aria-hidden
        />
      </button>
      <div className={`footer-accordion__panel${open ? " is-open" : ""}`}>
        {children}
      </div>
    </div>
  )
}

export function FooterWidgets({ socialLinks }: Props) {
  const pageLinks = (
    <ul className="list-area">
      <li><Link href="/about">About Us</Link></li>
      <li><Link href="/service">Services</Link></li>
      <li><Link href="/contact">Why Choose Us</Link></li>
      <li><Link href="/doctor">Doctors</Link></li>
      <li><Link href="/blog">Blog &amp; News</Link></li>
    </ul>
  )

  const policyLinks = (
    <ul className="list-area">
      <li><Link href="/terms">Terms &amp; Conditions</Link></li>
      <li><Link href="/privacy-policy">Privacy Policy</Link></li>
      <li><Link href="/cookie-policy">Cookie Policy</Link></li>
      <li><Link href="/contact">Contact Us</Link></li>
    </ul>
  )

  const contactList = (
    <ul className="footer-info d-flex flex-column gap-3 mb-0">
      <li className="d-flex align-items-center gap-2">
        <span className="icon d-center"><i className="fa-solid fa-phone" /></span>
        <div className="cont">
          <span className="pra fs-seven d-block">Call us</span>
          <a href={pharmacyPrimaryTelHref()} className="fs-six fw_500 white sub-font">
            {PHARMACY_PRIMARY_PHONE}
          </a>
        </div>
      </li>
      <li className="d-flex align-items-center gap-2">
        <span className="icon d-center"><i className="fa-solid fa-envelope" /></span>
        <div className="cont">
          <span className="pra fs-seven d-block">Info email</span>
          <a href={`mailto:${PHARMACY_EMAIL}`} className="fs-six fw_500 white sub-font">
            {PHARMACY_EMAIL}
          </a>
        </div>
      </li>
      <li className="d-flex align-items-center gap-2">
        <span className="icon d-center"><i className="fa-solid fa-envelope" /></span>
        <div className="cont">
          <span className="pra fs-seven d-block">Support email</span>
          <a href={`mailto:${PHARMACY_HELP_EMAIL}`} className="fs-six fw_500 white sub-font">
            {PHARMACY_HELP_EMAIL}
          </a>
        </div>
      </li>
    </ul>
  )

  return (
    <div className="footer-widgets-wrapper">
      <div className="row g-4 justify-content-between">
        <div className="col-lg-3 col-md-6 col-12">
          <div className="single-footer-widget wow fadeInUp" data-wow-delay="0.4s">
            <div className="widget-head">
              <Link href="/" aria-label="Enviro Pharmacy home">
                <BrandLogo variant="full" className="h-16 w-44" />
              </Link>
            </div>
            <div className="footer-content">
              <p className="pra2 footer-tagline">
                Trusted medications, pharmacist support, and dependable care across our branches.
              </p>
              {socialLinks.length > 0 ? (
                <div className="social-wrapper d-flex align-items-center">
                  {socialLinks.map((link) => (
                    <a
                      key={link.key}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
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

        {/* Desktop columns */}
        <div className="col-lg-3 col-md-6 d-none d-lg-flex justify-content-lg-center">
          <div className="single-footer-widget wow fadeInUp" data-wow-delay="0.6s">
            <div className="widget-head"><h4 className="white fw_600">Page</h4></div>
            {pageLinks}
          </div>
        </div>
        <div className="col-lg-3 col-md-6 d-none d-lg-flex justify-content-lg-center">
          <div className="single-footer-widget wow fadeInUp" data-wow-delay="0.6s">
            <div className="widget-head"><h4 className="white fw_600">Link</h4></div>
            {policyLinks}
          </div>
        </div>
        <div className="col-lg-3 col-md-6 d-none d-lg-flex justify-content-lg-center">
          <div className="single-footer-widget wow fadeInUp" data-wow-delay="0.7s">
            <div className="widget-head"><h4 className="white">Contact</h4></div>
            {contactList}
          </div>
        </div>

        {/* Mobile accordions */}
        <div className="col-12 d-lg-none">
          <FooterAccordion title="Explore">
            <div className="footer-accordion__grid">
              <div>
                <p className="footer-accordion__label">Page</p>
                {pageLinks}
              </div>
              <div>
                <p className="footer-accordion__label">Policies</p>
                {policyLinks}
              </div>
            </div>
          </FooterAccordion>
          <FooterAccordion title="Contact">
            {contactList}
          </FooterAccordion>
        </div>
      </div>
    </div>
  )
}
