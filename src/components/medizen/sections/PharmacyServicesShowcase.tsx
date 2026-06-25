"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ScrollStickyFeatureShowcase,
  type StickyFeatureItem,
} from "@/components/patterns/ScrollStickyFeatureShowcase";
import { pharmacyServices, type PharmacyService } from "@/data/pharmacy-services";
import {
  PHARMACY_PRIMARY_PHONE,
  pharmacyPrimaryTelHref,
} from "@/data/pharmacy-branches";

/**
 * Pharmacy services showcase — scroll-driven split layout on all screen sizes.
 */
export default function PharmacyServicesShowcase() {
  const [activeService, setActiveService] = useState<PharmacyService | null>(null);
  const closePanel = () => setActiveService(null);

  const features = useMemo<StickyFeatureItem[]>(
    () =>
      pharmacyServices.map((s) => ({
        id: s.id,
        title: s.panelTitle,
        stepLabel: s.title,
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
      <ScrollStickyFeatureShowcase
        features={features}
        eyebrow="Enviro Pharmacy · Services"
        scrollVhPerStep={120}
        mobileScrollVhPerStep={88}
      />

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
                      href={pharmacyPrimaryTelHref()}
                      className="common-btn box-style first-box d-inline-flex justify-content-center align-items-center gap-2 fw-semibold rounded100"
                    >
                      <i className="fas fa-phone" /> Call us — {PHARMACY_PRIMARY_PHONE}
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
