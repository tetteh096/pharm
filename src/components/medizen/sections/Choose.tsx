"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Choose = () => {
  return (
    <section
      className="choose-section space-bottom space-top position-relative overflow-hidden"
      style={{
        backgroundImage: "url('/back.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay */}
      <div
        className="position-absolute top-0 inset-s-0 w-100 h-100"
        style={{ background: "rgba(4,10,18,0.75)", zIndex: 1 }}
      />

      <div className="container position-relative" style={{ zIndex: 2 }}>
        <div className="row g-4 align-items-stretch">

          {/* Left col: heading + hero image */}
          <motion.div
            className="col-lg-7"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="choose-left">
              <div className="section-title mb-4">
                <span
                  className="cmn-tag heading-font d-inline-block mb-3"
                  style={{
                    background: "var(--p1-clr)",
                    color: "#000",
                    padding: "6px 18px",
                    borderRadius: "50px",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Why Chose Us
                </span>
                <h2 className="visible-slowly-right" style={{ color: "#fff" }}>
                  Empower Health <br />
                  Lives{" "}
                  <span className="position-relative z-1">
                    Expert
                    <img
                      src="/assets/img/element/title-badge1.png"
                      alt=""
                      className="title-badge1 d-md-block d-none w-100"
                    />
                  </span>{" "}
                  Care
                </h2>
                <p className="choose-lead mb-0">
                  Genuine medications, pharmacist guidance, and dependable care for families across Madina,
                  Odorkor, and Sakumono.
                </p>
              </div>
              <div className="choose-feature-row">
                <span className="choose-feature-pill">Licensed pharmacists</span>
                <span className="choose-feature-pill">Trusted medications</span>
                <span className="choose-feature-pill">Daily support</span>
              </div>
              <Link href="/doctor" className="choose-photo-card d-block text-decoration-none">
                <img
                  src="/youy.jpg"
                  alt="Enviro Pharmacy"
                  className="w-100"
                  style={{ objectFit: "cover", height: "360px" }}
                />
                <div className="choose-photo-copy">
                  <span className="choose-photo-kicker">Enviro Pharmacy</span>
                  <h4 className="mb-1">Care that feels local, personal, and reliable</h4>
                  <p className="mb-0">Our team supports walk-ins, refills, and everyday health questions with real pharmacist attention.</p>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Right col: supporting image + content */}
          <motion.div
            className="col-lg-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="choose-side-stack">
              <Link href="/service" className="choose-side-image d-block text-decoration-none">
                <img
                  src="/hero4.webp"
                  alt="Expert Care"
                  className="w-100"
                  style={{ objectFit: "cover", height: "248px" }}
                />
                <div className="choose-side-badge">Our Pharmacy</div>
              </Link>
              <div className="choose-copy-card">
                <h4 className="mb-3">Enhancing Lives Through Expert Care</h4>
                <p className="mb-4">
                  We focus on practical, everyday pharmacy care: clear guidance, dependable stock,
                  and a team that helps patients make informed choices with confidence.
                </p>
                <div className="choose-mini-grid">
                  <div className="choose-mini-item">
                    <strong>3</strong>
                    <span>Branches</span>
                  </div>
                  <div className="choose-mini-item">
                    <strong>24/7</strong>
                    <span>Madina access</span>
                  </div>
                  <div className="choose-mini-item">
                    <strong>Real</strong>
                    <span>Pharmacist support</span>
                  </div>
                </div>
                <Link href="/service" className="choose-inline-link">
                  Explore our services
                  <i className="fa-solid fa-arrow-right" />
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Choose;