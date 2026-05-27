"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ScrollStickyFeatureShowcase,
  type StickyFeatureItem,
} from "@/components/patterns/ScrollStickyFeatureShowcase";
import { pharmacyServices, type PharmacyService } from "@/data/pharmacy-services";

/**
 * Pharmacy services showcase.
 * Desktop: scroll-driven sticky split-screen.
 * Mobile (≤860px): 3×2 tap grid — no scroll hijacking.
 */
export default function PharmacyServicesShowcase() {
  const [activeService, setActiveService] = useState<PharmacyService | null>(null);
  const closePanel = () => setActiveService(null);

  const features = useMemo<StickyFeatureItem[]>(
    () =>
      pharmacyServices.map((s) => ({
        id: s.id,
        title: s.panelTitle,
        description: s.panelIntro,
        image: s.image,
        imageAlt: s.title,
        iconClass: s.iconClass,
        ctaLabel: "View service details",
        ctaHref: "#",
        onCtaClick: () => setActiveService(s),
      })),
    [],
  );

  return (
    <>
      {/* ── Desktop: sticky scroll showcase ── */}
      <div className="ssfs-desktop-only">
        <ScrollStickyFeatureShowcase
          features={features}
          eyebrow="Enviro Pharmacy · Services"
          scrollVhPerStep={120}
        />
      </div>

      {/* ── Mobile: 3×2 tap grid ── */}
      <section className="ssfs-mobile-grid-section">
        <div className="ssfs-mobile-eyebrow">Enviro Pharmacy · Services</div>
        <div className="ssfs-mobile-grid">
          {pharmacyServices.map((s, i) => (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => setActiveService(s)}
              className="ssfs-mg-card"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="ssfs-mg-img-wrap">
                <img src={s.image} alt={s.title} className="ssfs-mg-img" />
                <div className="ssfs-mg-overlay" />
                <span className="ssfs-mg-icon">
                  <i className={s.iconClass} aria-hidden />
                </span>
              </div>
              <div className="ssfs-mg-label">{s.title}</div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── Shared slide-in panel ── */}
      <AnimatePresence>
        {activeService && (
          <motion.div
            key="svc-backdrop"
            className="svc-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeService && (
          <motion.aside
            key="showcase-panel"
            className="svc-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35 }}
          >
            <div className="svc-panel-header">
              <div className="svc-panel-icon d-center">
                <i className={activeService.iconClass} aria-hidden="true" />
              </div>
              <div>
                <p className="svc-panel-tag">Enviro Pharmacy · Service</p>
                <h3 className="svc-panel-title">{activeService.panelTitle}</h3>
              </div>
              <button className="svc-panel-close" onClick={closePanel} aria-label="Close">
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="svc-panel-body">
              <p className="svc-panel-intro">{activeService.panelIntro}</p>

              <h5 className="svc-panel-steps-heading">How it works</h5>
              <ol className="svc-panel-steps">
                {activeService.steps.map((step, i) => (
                  <li key={i} className="svc-panel-step">
                    <span className="svc-step-num">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <strong className="svc-step-label">{step.label}</strong>
                      <p className="svc-step-detail">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {activeService.note && (
                <div className="svc-panel-note">
                  <i className="fas fa-info-circle" style={{ color: "var(--p1-clr)", marginRight: 8 }} />
                  {activeService.note}
                </div>
              )}

              <div className="svc-panel-cta">
                {activeService.title === "Home & Office Delivery" ? (
                  <Link
                    href="/shop"
                    className="common-btn box-style first-box d-inline-flex justify-content-center align-items-center gap-2 fw-semibold rounded100"
                    onClick={closePanel}
                  >
                    <i className="fas fa-shopping-bag" /> Order from shop
                  </Link>
                ) : (
                  <>
                    <a
                      href="tel:0554612072"
                      className="common-btn box-style first-box d-inline-flex justify-content-center align-items-center gap-2 fw-semibold rounded100"
                    >
                      <i className="fas fa-phone" /> Call Madina Branch
                    </a>
                    <a
                      href="/contact"
                      className="common-btn box-style second-box d-inline-flex justify-content-center align-items-center gap-2 fw-semibold rounded100"
                    >
                      Book Consultation
                    </a>
                  </>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
