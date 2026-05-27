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
        "Refill online or in-store at both branches",
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
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(4,10,18,0.55)",
                backdropFilter: "blur(4px)",
                zIndex: 1200,
              }}
            />

            {/* Drawer panel */}
            <motion.div
              key="feat-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                height: "100%",
                width: "min(520px, 100vw)",
                background: "#fff",
                zIndex: 1300,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Drawer header — coloured bar, no image */}
              <div
                style={{
                  position: "relative",
                  flexShrink: 0,
                  background: "linear-gradient(135deg, #040a12 0%, #0a1628 100%)",
                  padding: "32px 28px 28px",
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setActive(null)}
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "#fff",
                    fontSize: "1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
                  <div
                    style={{
                      width: 48, height: 48,
                      borderRadius: "50%",
                      background: "var(--p1-clr)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <img src={active.icon} alt="" style={{ width: 24, height: 24 }} />
                  </div>
                  <h5 style={{ color: "#fff", fontWeight: 800, margin: 0, fontSize: "1.1rem", lineHeight: 1.3 }}>
                    {active.title.replace("\n", " ")}
                  </h5>
                </div>
              </div>

              {/* Drawer body */}
              <div style={{ padding: "28px 28px 40px" }}>
                <span
                  style={{
                    display: "inline-block",
                    background: "rgba(19,236,138,0.12)",
                    color: "var(--p1-clr)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    padding: "4px 14px",
                    borderRadius: 999,
                    marginBottom: 12,
                  }}
                >
                  {active.details.tagline}
                </span>
                <p style={{ color: "#4a5568", fontSize: "0.95rem", lineHeight: 1.8, marginBottom: 24 }}>
                  {active.details.body}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {active.details.points.map((pt, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.9rem", color: "#2d3748" }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          marginTop: 3,
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "rgba(19,236,138,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.65rem",
                          color: "var(--p1-clr)",
                        }}
                      >
                        ✓
                      </span>
                      {pt}
                    </motion.li>
                  ))}
                </ul>
                <Link
                  href="/service"
                  onClick={() => setActive(null)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "var(--p1-clr)",
                    color: "#0a0a0a",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    padding: "12px 28px",
                    borderRadius: 999,
                    textDecoration: "none",
                  }}
                >
                  Visit Services Page <span style={{ fontSize: "0.8rem" }}>→</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .feat-row {
          display: grid;
          grid-template-columns: 1fr 220px auto;
          align-items: center;
          gap: 24px;
          padding: 28px 0;
          transition: padding-left 0.25s ease;
        }
        .feat-row:hover {
          padding-left: 6px;
        }
        .feat-col-title {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .feat-num {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--p1-clr);
          letter-spacing: 0.06em;
          opacity: 0.7;
          flex-shrink: 0;
          min-width: 24px;
        }
        .feat-title {
          font-size: clamp(0.95rem, 1.5vw, 1.15rem);
          line-height: 1.35;
        }
        .feat-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .feat-li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: rgba(0,0,0,0.72);
          font-weight: 500;
        }
        .feat-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--p1-clr);
          flex-shrink: 0;
        }
        .feat-readmore {
          background: transparent;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
        }
        @media (max-width: 991px) {
          .feat-row {
            grid-template-columns: 1fr auto;
            grid-template-rows: auto auto;
          }
          .feat-list {
            grid-column: 1 / 2;
            padding-left: 44px;
          }
          .feat-readmore {
            grid-column: 2 / 3;
            grid-row: 1 / 3;
            align-self: center;
          }
        }
        @media (max-width: 575px) {
          .feat-row {
            grid-template-columns: 1fr;
          }
          .feat-list {
            padding-left: 0;
          }
          .feat-readmore {
            grid-column: 1 / 2;
            grid-row: unset;
            justify-self: start;
          }
          .feature-element {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default Features;
