"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const featureItems = [
  {
    icon: "/assets/img/icon/f-icon1.png",
    title: "Fast & Reliable \n Prescription Refills",
    list: ["Refill online or in-store", "Automated reminders"],
    delay: 0.4,
    details: {
      tagline: "PRESCRIPTIONS",
      body: "Skip the queue — refill your repeat prescriptions online through our portal or drop in at either branch. Our system sends automated reminders so you never run out of essential medication.",
      points: [
        "Refill online or in-store at all four branches",
        "Automated SMS & email reminders",
        "Express collection — ready in under 30 minutes",
        "Secure digital prescription records",
      ],
    },
  },
  {
    icon: "/assets/img/icon/f-icon2.png",
    title: "Expert Pharmacist \n Consultations",
    list: ["Personalized health advice", "Medication reviews"],
    delay: 0.6,
    details: {
      tagline: "CONSULTATIONS",
      body: "Our qualified pharmacists are here to provide one-on-one health guidance — from medication interactions to chronic disease management. No appointment needed.",
      points: [
        "Private consultation room available",
        "Medication interaction reviews",
        "Chronic disease management support",
        "Free — no appointment required",
      ],
    },
  },
  {
    icon: "/assets/img/icon/f-icon3.png",
    title: "Wide Range Of \n Health Products",
    list: ["Vitamins & Supplements", "Over-the-counter meds"],
    delay: 0.8,
    details: {
      tagline: "HEALTH PRODUCTS",
      body: "From vitamins and supplements to baby care and skincare, we stock a comprehensive range of trusted health products to cover every member of your family.",
      points: [
        "Vitamins, minerals & dietary supplements",
        "Over-the-counter medications",
        "Baby care & maternal health",
        "Skincare & personal hygiene essentials",
      ],
    },
  },
];

const Features = () => {
  const [active, setActive] = useState<typeof featureItems[0] | null>(null);

  return (
    <section className="feature-section fix section-padding">
      <div className="container">
        <div className="featue-wrapper position-relative">

          <div>
            {/* Section title */}
            <div className="row align-items-end mb-xxl-5 mb-4">
              <div className="col-lg-7">
                <div className="section-title">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="black visible-slowly-right"
                  >
                    Expert Care <br /> Healthy
                    <span className="position-relative z-1">
                      {" "}Pharmacy{" "}
                      <img
                        src="/assets/img/element/title-badge1.png"
                        alt=""
                        className="title-badge1 d-md-block d-none w-100"
                      />
                    </span>
                    Solutions
                  </motion.h2>
                </div>
              </div>
            </div>

            <div className="feature-inner">
              {featureItems.map((item, index) => (
                <React.Fragment key={index}>
                  <motion.div
                    className="feature-items feat-row"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.12 }}
                    viewport={{ once: true }}
                  >
                    {/* Col 1 — number + icon + title */}
                    <div className="feat-col-title">
                      <span className="feat-num">{String(index + 1).padStart(2, "0")}</span>
                      <div className="d-flex align-items-center gap-3">
                        <div className="icons d-center rounded-circle p1-bg">
                          <img src={item.icon} alt="" />
                        </div>
                        <h4 className="mb-0">
                          <span className="black fw_700 feat-title">
                            {item.title.split("\n").map((line, i) => (
                              <React.Fragment key={i}>
                                {line}
                                {i < item.title.split("\n").length - 1 && <br />}
                              </React.Fragment>
                            ))}
                          </span>
                        </h4>
                      </div>
                    </div>

                    {/* Col 2 — bullet points */}
                    <ul className="feat-list mb-0">
                      {item.list.map((li, i) => (
                        <li key={i} className="feat-li">
                          <span className="feat-dot" />
                          {li}
                        </li>
                      ))}
                    </ul>

                    {/* Col 3 — button */}
                    <button
                      onClick={() => setActive(item)}
                      className="common-btn cmn-border feat-readmore text-nowrap d-inline-flex justify-content-center align-items-center gap-2 fs18 fw-semibold black overflow-hidden rounded100"
                    >
                      Read More
                      <img src="/assets/img/icon/arrow-right-black.png" alt="" />
                    </button>
                  </motion.div>
                  <div className="line" />
                </React.Fragment>
              ))}
            </div>

            <Link href="/service" className="feature-element">
              <img src="/assets/img/element/feature-element.png" alt="" className="rounded-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Slide-in drawer ── */}
      <AnimatePresence>
        {active && (
          <>
            {/* Backdrop */}
            <motion.div
              key="feat-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActive(null)}
              className="feat-drawer-backdrop"
            />

            <motion.div
              key="feat-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="feat-drawer"
            >
              <div className="feat-drawer-header">
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="feat-drawer-close"
                  aria-label="Close panel"
                >
                  ✕
                </button>
                <div className="feat-drawer-header-inner">
                  <div className="feat-drawer-header-icon">
                    <img src={active.icon} alt="" />
                  </div>
                  <h5 className="feat-drawer-header-title">
                    {active.title.replace("\n", " ")}
                  </h5>
                </div>
              </div>

              <div className="feat-drawer-body">
                <span className="feat-drawer-tag">{active.details.tagline}</span>
                <p className="feat-drawer-desc">{active.details.body}</p>
                <ul className="feat-drawer-points">
                  {active.details.points.map((pt, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      className="feat-drawer-point"
                    >
                      <span className="feat-drawer-check">✓</span>
                      {pt}
                    </motion.li>
                  ))}
                </ul>
                <Link
                  href="/service"
                  onClick={() => setActive(null)}
                  className="feat-drawer-cta"
                >
                  Visit Services Page <span>→</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Features;
