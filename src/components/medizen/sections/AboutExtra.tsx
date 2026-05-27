"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView, animate, useMotionValue } from "framer-motion";

/* ── Animated counter ───────────────────────────────────────── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  useEffect(() => {
    if (!isInView) return;
    const c = animate(count, target, {
      duration: 3.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return c.stop;
  }, [isInView, target]);

  return <span ref={ref}>{display}{suffix}+</span>;
}

/* ── Data ───────────────────────────────────────────────────── */
const stats = [
  { value: 50,  suffix: "",  label: "Expert Pharmacists",    icon: "fas fa-user-md" },
  { value: 150, suffix: "k", label: "Medicine Varieties",    icon: "fas fa-pills" },
  { value: 99,  suffix: "%", label: "Customer Satisfaction", icon: "fas fa-heart" },
  { value: 20,  suffix: "",  label: "Years of Service",      icon: "fas fa-certificate" },
];

const values = [
  { icon: "fas fa-shield-alt",    label: "Integrity" },
  { icon: "fas fa-handshake",     label: "Reliability" },
  { icon: "fas fa-hands-helping", label: "Compassion" },
  { icon: "fas fa-star",          label: "Excellence" },
];

const commitments = [
  { icon: "fas fa-clock",          label: "24-Hour Access",       text: "Our Madina branch never closes — because health needs don't follow office hours." },
  { icon: "fas fa-shield-alt",     label: "Genuine Medications",  text: "Every product on our shelves is sourced from verified, licensed suppliers only." },
  { icon: "fas fa-user-md",        label: "Expert Guidance",      text: "Our qualified pharmacists counsel every patient — not just dispense pills." },
  { icon: "fas fa-hands-helping",  label: "Community First",      text: "We serve Madina and Odorkor as neighbours, not just customers." },
];

export default function AboutExtra() {
  return (
    <>
      {/* ════════════════════════════════════════════════════════
          SECTION 1 — Mission / Vision / Values  ·  SOLID BLUE
      ════════════════════════════════════════════════════════ */}
      <section className="about-blue-section">
        <div className="about-blue-deco about-blue-deco--tl" />
        <div className="about-blue-deco about-blue-deco--br" />

        <div className="container position-relative" style={{ zIndex: 1 }}>

          <motion.div
            className="text-center mb-5 pb-2"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="about-blue-eyebrow">Who We Are</span>
            <h2 className="about-blue-title">Our Mission, Vision &amp; Values</h2>
            <p className="about-blue-sub">
              Built on trust, guided by care, and committed to the communities we serve.
            </p>
          </motion.div>

          <div className="row g-4">

            <motion.div className="col-lg-4"
              initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }} viewport={{ once: true }}
            >
              <div className="about-mv-card h-100">
                <div className="about-mv-icon"><i className="fas fa-bullseye" /></div>
                <h4 className="about-mv-card-title">Our Mission</h4>
                <p className="about-mv-card-body">
                  To alleviate the suffering of all who walk through our doors, impart life-saving knowledge through
                  information and counselling, and ensure measurable delivery of accountable healthcare to the
                  communities of Madina and Odorkor.
                </p>
              </div>
            </motion.div>

            <motion.div className="col-lg-4"
              initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }} viewport={{ once: true }}
            >
              <div className="about-mv-card about-mv-card--green h-100">
                <div className="about-mv-icon about-mv-icon--green"><i className="fas fa-eye" /></div>
                <h4 className="about-mv-card-title">Our Vision</h4>
                <p className="about-mv-card-body">
                  To become a trusted cornerstone of healthcare in Accra, delivering critical health solutions through
                  education, retail dispensing, and compassionate service — making quality pharmacy care accessible to
                  every family we serve.
                </p>
              </div>
            </motion.div>

            <motion.div className="col-lg-4"
              initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }} viewport={{ once: true }}
            >
              <div className="about-mv-card h-100">
                <div className="about-mv-icon"><i className="fas fa-heart" /></div>
                <h4 className="about-mv-card-title">Core Values</h4>
                <div className="about-values-grid">
                  {values.map((v, i) => (
                    <div key={i} className="about-value-chip">
                      <i className={v.icon} />
                      <span>{v.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 2 — Our Story  ·  WHITE SPLIT
      ════════════════════════════════════════════════════════ */}
      <section className="section-padding" style={{ background: "#fff" }}>
        <div className="container">
          <div className="row g-5 align-items-center">

            <motion.div className="col-lg-5"
              initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }} viewport={{ once: true }}
            >
              <div className="about-story-img-wrap">
                <img
                  src="/jhfhj.jpg"
                  alt="Enviro Pharmacy pharmacist at work"
                  className="about-story-img"
                />
                <div className="about-story-img-overlay" />
                <div className="about-story-accent-bar" />
              </div>
            </motion.div>

            <motion.div className="col-lg-7"
              initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }} viewport={{ once: true }}
            >
              <span className="about-story-eyebrow">Why We Do What We Do</span>
              <h2 className="black fw_800 mb-4" style={{ fontSize: "clamp(1.7rem, 3vw, 2.4rem)", lineHeight: 1.2 }}>
                A Pharmacy Built to <br /> Serve You Better
              </h2>
              <p className="pra mb-5" style={{ lineHeight: 1.9, color: "rgba(0,0,0,0.72)" }}>
                At Enviro Pharmacy, everything we do is driven by one purpose — making sure the people of Madina
                and Odorkor get the care they deserve. Genuine medications, real pharmacist guidance, and a team
                that shows up for you every single day.
              </p>
              <div className="about-timeline">
                {commitments.map((item, i) => (
                  <motion.div key={i} className="about-tl-row"
                    initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }} viewport={{ once: true }}
                  >
                    <span className="about-tl-icon"><i className={item.icon} /></span>
                    <div>
                      <span className="about-tl-tag">{item.label}</span>
                      <p className="about-tl-text">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 3 — Stats  ·  DARK NAVY
      ════════════════════════════════════════════════════════ */}
      <section className="about-stats-section">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {stats.map((stat, i) => (
              <motion.div key={i} className="col-lg-3 col-6"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.12 }} viewport={{ once: true }}
              >
                <div className="about-stat-card text-center">
                  <div className="about-stat-icon">
                    <i className={stat.icon} />
                  </div>
                  <h2 className="about-stat-num">
                    <Counter target={stat.value} suffix={stat.suffix} />
                  </h2>
                  <p className="about-stat-label">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
