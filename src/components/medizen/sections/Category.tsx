"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const services = [
  {
    id: 1,
    icon: "fas fa-prescription-bottle-alt",
    image: "/photo/presciptionmg.jpg",
    title: "Prescription Management",
    summary: "Expert prescription handling and fast, accurate dispensing with full pharmacist consultation.",
    accent: "var(--p1-clr)",
    details: {
      tagline: "Safe. Accurate. Fast.",
      body: "Our licensed pharmacists review every prescription with care, ensuring accuracy, checking for interactions, and dispensing medications safely. We work closely with your doctor to manage refills, dosage changes, and long-term therapy plans. You’ll also receive Medication Counseling and Medication Therapy Management (MTM) to help you use every medicine safely and effectively.",
      points: [
        "Prescription verification and dispensing",
        "Pharmacist consultation included",
        "Medication Counseling",
        "Medication Therapy Management (MTM)",
      ],
    },
  },
  {
    id: 2,
    icon: "fas fa-heartbeat",
    image: "/photo/healthandwellness.jpg",
    title: "Wellness & Health",
    summary: "High-quality medications, vitamins, and health supplements to keep you at your best.",
    accent: "var(--p2-clr)",
    details: {
      tagline: "Your health, every day.",
      body: "We stock a carefully curated range of vitamins, supplements, and wellness products sourced from trusted brands. Our team can guide you to the right products for your specific health goals — from immunity boosters to chronic condition support.",
      points: [
        "Vitamins, minerals and supplements",
        "Chronic disease medication",
        "Blood pressure and diabetes support",
        "Paediatric and maternal health products",
        "Expert product guidance on request",
      ],
    },
  },
  {
    id: 3,
    icon: "fas fa-mortar-pestle",
    image: "/photo/Personalcare.jpg",
    title: "Personal Care",
    summary: "A wide range of personal care and wellness essentials for your everyday routine.",
    accent: "var(--p1-clr)",
    details: {
      tagline: "Look and feel your best.",
      body: "From skincare to hygiene essentials, we carry a broad selection of personal care products for the whole family. Our team can recommend dermatologist-approved skincare for Ghana's climate and your skin type.",
      points: [
        "Skincare and sun protection",
        "Hair and nail health products",
        "Baby and maternal care essentials",
        "Hygiene and sanitisation products",
        "Cosmetic-grade supplements",
      ],
    },
  },
  {
    id: 4,
    icon: "fas fa-truck",
    image: "/delviery.jpg",
    title: "Medication Delivery",
    boxedIllus: true,
    summary: "Order from our shop with pharmacist support when you need it.",
    accent: "var(--p2-clr)",
    details: {
      tagline: "Delivered when you need it.",
      body: "Can't make it to the branch? Order through our online shop and we'll arrange delivery for eligible items in our branch delivery areas. Our team confirms your order and counsels you on safe use before dispatch.",
      points: [
        "Browse and order from our online shop",
        "Pharmacist review before dispatch",
        "Home and office delivery options",
        "Call any branch for same-day availability",
        "WhatsApp support after your order",
      ],
    },
  },
];

export default function Category() {
  const [active, setActive] = useState<(typeof services)[0] | null>(null);

  return (
    <section className="category-section section-padding position-relative">
      <div className="container">

        {/* Section header */}
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.2, margin: "0px 0px 160px 0px" }}
        >
          <span className="svc-eyebrow">WHAT WE OFFER</span>
          <h2 className="fw_800 black mt-2" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}>
            Our Core Services
          </h2>
          <p className="pra mx-auto mt-2" style={{ maxWidth: "520px" }}>
            From prescriptions to personal care — everything your family needs, under one roof.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="row g-3 g-md-4 justify-content-center category-services-grid">
          {services.map((svc, i) => (
            <div className="col-6 col-md-6 col-lg-3" key={svc.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                viewport={{ once: true, amount: 0.15, margin: "0px 0px 160px 0px" }}
                className="svc-card h-100 d-flex flex-column rounded-4 bg-white text-center overflow-hidden"
              >
                <div
                  className={`svc-card-illus${svc.boxedIllus ? " svc-card-illus--boxed" : ""}`}
                >
                  <img src={svc.image} alt={svc.title} />
                </div>

                <div
                  className={`svc-card-inner d-flex flex-column flex-grow-1 px-3 px-md-4 pb-3 pb-md-4${svc.boxedIllus ? " pt-2 pt-md-3" : ""}`}
                >
                <h5 className="svc-card-title fw_700 black mb-2">{svc.title}</h5>
                <p className="svc-card-summary pra fs-seven mb-3 mb-md-4 flex-grow-1">{svc.summary}</p>

                <button
                  onClick={() => setActive(svc)}
                  className="svc-btn svc-btn--compact mt-auto mx-auto"
                  style={{ borderColor: svc.accent, color: svc.accent }}
                >
                  Learn More <i className="fas fa-arrow-right ms-1" />
                </button>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          className="text-center mt-5"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true, amount: 0.4, margin: "0px 0px 120px 0px" }}
        >
          <Link href="/service" className="svc-cta-btn">
            View All Services <i className="fas fa-arrow-right ms-2" />
          </Link>
        </motion.div>
      </div>

      {/* ── SLIDE-IN PANEL ─────────────────────────────── */}
      <AnimatePresence>
        {active && (
          <>
            {/* Backdrop */}
            <motion.div
              className="svc-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setActive(null)}
            />

            {/* Drawer */}
            <motion.div
              className="svc-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              {/* Close */}
              <button className="svc-drawer-close" onClick={() => setActive(null)}>
                <i className="fas fa-times" />
              </button>

              {/* Illustration */}
              <div
                className={`svc-drawer-illus mb-4${active.boxedIllus ? " svc-drawer-illus--boxed" : ""}`}
              >
                <img src={active.image} alt={active.title} />
              </div>

              {/* Tagline */}
              <span className="svc-eyebrow mb-2 d-inline-block">{active.details.tagline}</span>

              {/* Title */}
              <h3 className="fw_800 black mb-3" style={{ fontSize: "1.6rem", lineHeight: 1.2 }}>
                {active.title}
              </h3>

              {/* Body */}
              <p className="pra mb-4" style={{ lineHeight: 1.8 }}>
                {active.details.body}
              </p>

              {/* Points */}
              <ul className="svc-points list-unstyled mb-5">
                {active.details.points.map((pt, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                    className="d-flex align-items-start gap-3 mb-3"
                  >
                    <span
                      className="svc-check d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{ background: active.accent }}
                    >
                      <i className="fas fa-check text-white" style={{ fontSize: "0.6rem" }} />
                    </span>
                    <span className="pra fs-seven">{pt}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/service"
                className="svc-cta-btn w-100 d-flex justify-content-center"
                onClick={() => setActive(null)}
              >
                Visit Services Page <i className="fas fa-arrow-right ms-2" />
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

