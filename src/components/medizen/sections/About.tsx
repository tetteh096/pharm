"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const About = () => {
  return (
    <section className="about-section fix section-padding position-relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ 
        background: 'radial-gradient(circle at 10% 20%, rgba(19, 236, 138, 0.05) 0%, transparent 50%)',
        zIndex: 0 
      }}></div>

      <div className="container position-relative" style={{ zIndex: 1 }}>
        <div className="row g-5 align-items-center justify-content-between">
          <div className="col-lg-6">
            <div className="about-content">
              <div className="section-title mb-40">
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="cmn-tag p1-bg heading-font mb-3 px-4 py-2 rounded-5 text-white"
                >
                  About Our Mission
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="black display-5 fw_800 mb-4"
                >
                  Your Health Is <br /> Our Top
                  <span className="position-relative z-1">
                    {" "}Priority{" "}
                    <motion.img 
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                      src="/assets/img/element/title-badge1.png" 
                      alt="img"
                      className="title-badge1 d-md-block d-none" 
                      style={{ bottom: '-5px' }}
                    />
                  </span>
                </motion.h2>
                <p className="pra fs-five mb-5">
                  As your dedicated community pharmacy, we provide expert care, 
                  reliable medication management, and a wide selection of wellness 
                  products to help you feel your best every day.
                </p>
              </div>
              
              <div className="about-steps d-flex flex-column gap-4">
                {[
                  {
                    num: "01",
                    title: "Safe Prescription Handling",
                    desc: "Our certified pharmacists ensure your medications are dispensed accurately and safely with personalized care.",
                    icon: "fas fa-shield-alt",
                    accent: "var(--p1-clr)",
                    bg: "rgba(19,236,138,0.10)",
                  },
                  {
                    num: "02",
                    title: "Wellness & Supplements",
                    desc: "Discover a curated range of high-quality vitamins and health essentials tailored to your unique goals.",
                    icon: "fas fa-leaf",
                    accent: "var(--p2-clr)",
                    bg: "rgba(17,87,238,0.09)",
                  },
                ].map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + idx * 0.2 }}
                    viewport={{ once: true }}
                    className="about-step-card p-4 rounded-4 d-flex gap-4 align-items-start"
                    style={{
                      background: "#fff",
                      border: `1.5px solid ${step.accent}33`,
                      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Icon circle */}
                    <div
                      className="step-icon flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle"
                      style={{ width: 56, height: 56, background: step.bg, border: `2px solid ${step.accent}44` }}
                    >
                      <i className={step.icon} style={{ fontSize: "1.3rem", color: step.accent }} />
                    </div>

                    <div className="cont flex-grow-1">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <h5 className="black fw_700 mb-0" style={{ fontSize: "1rem" }}>{step.title}</h5>
                        <span
                          className="fw_800 ms-2"
                          style={{ fontSize: "1.6rem", color: step.accent, opacity: 0.18, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
                        >
                          {step.num}
                        </span>
                      </div>
                      <p className="pra mb-0" style={{ fontSize: "0.88rem", lineHeight: 1.7 }}>{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA row */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                viewport={{ once: true }}
                className="d-flex align-items-center gap-4 mt-5 flex-wrap"
              >
                <Link
                  href="/about"
                  className="d-inline-flex align-items-center gap-2 fw_700 px-5 py-3 rounded-5 text-white"
                  style={{ background: "var(--p1-clr)", textDecoration: "none", fontSize: "0.95rem", color: "#0a0a0a !important" }}
                >
                  About Us <i className="fas fa-arrow-right" style={{ fontSize: "0.8rem" }} />
                </Link>
                <Link
                  href="/contact"
                  className="d-inline-flex align-items-center gap-2 fw_700 px-4 py-3 rounded-5"
                  style={{
                    border: "1.5px solid var(--p2-clr)",
                    color: "var(--p2-clr)",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    background: "transparent",
                  }}
                >
                  Contact Us <i className="fas fa-phone" style={{ fontSize: "0.8rem" }} />
                </Link>
              </motion.div>
            </div>
          </div>
          
          <div className="col-lg-5">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="about-img-wrapper position-relative"
            >
              {/* Main image */}
              <div className="about-photo-frame rounded-4 overflow-hidden shadow-xl position-relative">
                <img
                  src="/img2.jpg"
                  alt="Enviro Pharmacy team serving customers"
                  className="w-100 h-100"
                  style={{ objectFit: "cover", display: "block", maxHeight: "520px" }}
                />
                {/* subtle dark-to-transparent gradient at bottom */}
                <div
                  className="position-absolute bottom-0 start-0 w-100"
                  style={{
                    height: "45%",
                    background: "linear-gradient(to top, rgba(4,10,18,0.55) 0%, transparent 100%)",
                    zIndex: 1,
                  }}
                />

                {/* Bottom-left inline badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  viewport={{ once: true }}
                  className="position-absolute bottom-0 start-0 m-4 d-flex align-items-center gap-3 px-4 py-3 rounded-4"
                  style={{
                    zIndex: 2,
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <i className="fas fa-star" style={{ color: "var(--p1-clr)", fontSize: "1.4rem" }} />
                  <div>
                    <p className="mb-0 fw_800 text-white" style={{ fontSize: "1.1rem", lineHeight: 1 }}>4.9 / 5.0</p>
                    <p className="mb-0 text-white opacity-75" style={{ fontSize: "0.76rem" }}>Customer Rating</p>
                  </div>
                </motion.div>
              </div>

              {/* Floating top-right stats card */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="position-absolute bg-white rounded-4 shadow-lg p-3 text-center"
                style={{ top: "-24px", right: "-20px", minWidth: "130px", border: "1.5px solid rgba(19,236,138,0.25)", zIndex: 3 }}
              >
                <div
                  className="mx-auto mb-2 d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 44, height: 44, background: "rgba(19,236,138,0.15)" }}
                >
                  <i className="fas fa-users" style={{ color: "var(--p1-clr)", fontSize: "1.1rem" }} />
                </div>
                <p className="fw_800 black mb-0" style={{ fontSize: "1.25rem" }}>10K+</p>
                <p className="pra mb-0" style={{ fontSize: "0.72rem" }}>Happy Patients</p>
              </motion.div>

              {/* Green accent ring behind image */}
              <div
                className="position-absolute rounded-4"
                style={{
                  inset: "-10px",
                  background: "linear-gradient(135deg, var(--p1-clr) 0%, var(--p2-clr) 100%)",
                  zIndex: -1,
                  opacity: 0.18,
                  filter: "blur(18px)",
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
