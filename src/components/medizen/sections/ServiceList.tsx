"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  pharmacyServices,
  type PharmacyService,
} from "@/data/pharmacy-services";

const ServiceList = () => {
  const [activeService, setActiveService] = useState<PharmacyService | null>(null);

  const openPanel = (svc: PharmacyService) => setActiveService(svc);
  const closePanel = () => setActiveService(null);

  return (
    <>
      <section id="pharmacy-services" className="services-section main-style cmn-bg fix section-padding">
        <div className="container">

          {/* Section header */}
          <div className="row justify-content-center mb-4">
            <div className="col-lg-7 text-center">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="svc-eyebrow mb-3 d-inline-block"
              >
                All Services
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                viewport={{ once: true }}
                className="fw_800 black mb-2"
                style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.1rem)", lineHeight: 1.2 }}
              >
                What We Offer at <span style={{ color: "var(--p1-clr)" }}>Enviro Pharmacy</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="pra"
                style={{ maxWidth: "520px", margin: "0 auto" }}
              >
                Walk-in health checks, prescription dispensing, and pharmacist consultations at our branches.
              </motion.p>
            </div>
          </div>

          <div className="row g-2 g-md-3">
            {pharmacyServices.map((item, index) => (
              <div className="col-6 col-lg-4 d-flex" key={item.id}>
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="svc-card-v2 w-100"
                >
                  {/* Image thumbnail */}
                  <div className="svc-card-v2-thumb">
                    <img src={item.image} alt={item.title} />
                    <div className="svc-card-v2-thumb-overlay" />
                    <span className="svc-card-v2-icon-badge">
                      <i className={item.iconClass} aria-hidden="true" />
                    </span>
                  </div>

                  {/* Body */}
                  <div className="svc-card-v2-body">
                    <h4 className="svc-card-v2-title">{item.title}</h4>
                    <p className="svc-card-v2-desc">{item.desc}</p>
                    <button
                      type="button"
                      onClick={() => openPanel(item)}
                      className="svc-card-v2-btn"
                    >
                      <span>Learn more</span>
                      <span className="svc-card-v2-btn-icon">
                        <i className="fas fa-arrow-right" aria-hidden="true" />
                      </span>
                    </button>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Backdrop */}
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

      {/* Slide-in panel */}
      <AnimatePresence>
        {activeService && (
          <motion.aside
            key="svc-panel"
            className="svc-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35 }}
          >
            {/* Header */}
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
              {/* Intro */}
              <p className="svc-panel-intro">{activeService.panelIntro}</p>

              {/* Steps */}
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

              {/* Note */}
              {activeService.note && (
                <div className="svc-panel-note">
                  <i className="fas fa-info-circle" style={{ color: "var(--p1-clr)", marginRight: 8 }} />
                  {activeService.note}
                </div>
              )}

              {/* CTA */}
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
};

export default ServiceList;