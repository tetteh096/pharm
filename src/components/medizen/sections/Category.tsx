"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const services = [
  {
    id: 1,
    icon: "fas fa-prescription-bottle-alt",
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
    icon: "fas fa-clock",
    title: "24-Hour Pharmacy",
    summary: "Our Madina branch is open round the clock so help is always there when you need it.",
    accent: "var(--p2-clr)",
    details: {
      tagline: "Always open. Always ready.",
      body: "Health emergencies don't keep office hours. Our Madina branch operates 24 hours a day, 7 days a week — so whether it's 2am or a public holiday, a qualified pharmacist is on hand to assist you with medications, advice, and urgent care needs.",
      points: [
        "Open 24/7 at Madina branch",
        "Night-time emergency dispensing",
        "On-call pharmacist consultations",
        "Urgent medication availability",
        "Safe, well-lit and accessible location",
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
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
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
        <div className="row g-4 justify-content-center">
          {services.map((svc, i) => (
            <div className="col-lg-3 col-md-6" key={svc.id}>
              <motion.div
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="svc-card h-100 d-flex flex-column p-4 rounded-4 bg-white text-center"
              >
                <div
                  className="svc-icon mx-auto mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${svc.accent}22, ${svc.accent}44)`,
                    border: `2px solid ${svc.accent}44`,
                  }}
                >
                  <i className={svc.icon} style={{ color: svc.accent }} />
                </div>

                <h5 className="fw_700 black mb-2">{svc.title}</h5>
                <p className="pra fs-seven mb-4 flex-grow-1">{svc.summary}</p>

                <button
                  onClick={() => setActive(svc)}
                  className="svc-btn mt-auto"
                  style={{ borderColor: svc.accent, color: svc.accent }}
                >
                  Learn More <i className="fas fa-arrow-right ms-1" />
                </button>
              </motion.div>
            </div>
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          className="text-center mt-5"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
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

              {/* Icon */}
              <div
                className="svc-drawer-icon mb-4"
                style={{
                  background: `linear-gradient(135deg, ${active.accent}22, ${active.accent}44)`,
                  border: `2px solid ${active.accent}55`,
                }}
              >
                <i className={active.icon} style={{ color: active.accent, fontSize: "2rem" }} />
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

