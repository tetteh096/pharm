"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PHARMACY_BRANCHES } from "@/data/pharmacy-branches";

const branches = PHARMACY_BRANCHES.map((b) => ({
  name: b.name,
  location: b.location,
  gps: b.gps ?? "",
  hours: b.hours,
  phone: b.phone,
  tel: b.tel,
  maps: b.maps,
  accent: b.accent === "#13ec8a" ? "var(--p1-clr)" : b.accent === "#1157ee" ? "var(--p2-clr)" : b.accent,
  comingSoon: b.comingSoon,
}));

const Special = () => {
  return (
    <section className="special-care-section body-bg space-bottom">
      <div className="container custom-contaienr">
        <div className="special-care-wrap position-relative">
          <div className="row g-4 justify-content-lg-between">

            {/* ── Left ── */}
            <div className="col-lg-6">
              <div className="section-title">
                <span className="cmn-tag p1-bg heading-font">Pharmacy Care</span>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="black visible-slowly-right mb-xxl-4 mb-3"
                >
                  Expert Medication <br />
                  <span className="position-relative z-1">
                    {" "}Guidance{" "}
                    <img
                      src="/assets/img/element/title-badge1.png"
                      alt=""
                      className="title-badge1 d-md-block d-none"
                    />
                  </span>
                  for Wellness
                </motion.h2>
                <p className="pra mb-40" style={{ lineHeight: 1.9 }}>
                  We are more than just a pharmacy — we are your partners in health. From complex
                  prescription management to personalised supplement advice, our qualified pharmacists
                  are here to ensure you get exactly what you need, safely and confidently.
                </p>

                <div className="d-flex align-items-center gap-sm-4 gap-2 mb-xxl-5 mb-4 flex-wrap">
                  <Link
                    href="/shop"
                    className="common-btn box-style cmn-border d-inline-flex justify-content-center align-items-center gap-xxl-2 gap-2 fs18 fw-semibold black overflow-hidden rounded100"
                  >
                    Shop Now
                    <img src="/assets/img/icon/arrow-right-black.png" alt="" />
                  </Link>
                  <a
                    href="tel:0554612072"
                    className="header-help d-flex align-items-center gap-3 text-decoration-none"
                  >
                    <img src="/assets/img/icon/chat-icon.png" alt="" />
                    <span className="cont">
                      <span className="pra d-block">Ask a Pharmacist</span>
                      <span className="black fw_600">055 461 2072</span>
                    </span>
                  </a>
                </div>

                {/* Feature list — plain, no icon circles */}
                <div className="d-flex flex-column gap-3">
                  {[
                    "Accurate prescription filling, every time",
                    "Qualified & licensed pharmacists on site",
                    "Genuine medications — no substitutes",
                    "Personalised health consultations available",
                  ].map((text, i) => (
                    <motion.div
                      key={i}
                      className="d-flex align-items-start gap-3"
                      initial={{ opacity: 0, x: -14 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.07 }}
                      viewport={{ once: true }}
                    >
                      <span
                        className="fw_900 mt-1"
                        style={{ color: "var(--p1-clr)", fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}
                      >
                        ✓
                      </span>
                      <span className="pra" style={{ fontSize: "0.95rem", lineHeight: 1.7 }}>{text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right ── */}
            <div className="col-lg-5">
              <div className="special-tag-inner d-flex flex-column gap-xxl-4 gap-3">

                {/* Native template tags */}
                <Link
                  href="/shop"
                  className="special-tag d-flex align-items-center gap-3 rounded-3 heading-font cmn-border"
                >
                  <img src="/assets/img/icon/arrow-right-black.png" alt="" />
                  Same-day prescription dispensing
                </Link>
                <Link
                  href="/contact"
                  className="special-tag d-flex align-items-center gap-3 rounded-3 heading-font cmn-border"
                >
                  <img src="/assets/img/icon/arrow-right-black.png" alt="" />
                  Free pharmacist consultations
                </Link>

                {/* Consult box with image as background */}
                <div className="special-behaind text-center">
                  <div className="box position-relative" style={{
                    backgroundImage: "url('/jhfhj.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center top",
                  }}>
                    <div style={{ position: "absolute", inset: 0, background: "rgba(17,87,238,0.82)", borderRadius: "inherit" }} />
                    <div className="position-relative" style={{ zIndex: 1 }}>
                      <h4 className="white mb-2 visible-slowly-right">Supporting Your Health Daily</h4>
                      <p className="white mb-4" style={{ lineHeight: 1.8 }}>
                        Our pharmacists offer personalised consultations — ensuring you fully understand
                        your medications and the best path to better health.
                      </p>
                      <Link
                        href="/contact"
                        className="common-btn arrow-white-adding box-style white-border d-inline-flex justify-content-center align-items-center gap-xxl-2 gap-2 fs18 fw-semibold py-3 white overflow-hidden rounded100"
                      >
                        Consult Now
                        <img src="/assets/img/icon/arrow-right-white.png" alt="" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <img src="/assets/img/element/special-element.png" alt="" className="special-element" />
        </div>
      </div>

      {/* ── Branch locations ── */}
      <div className="special-branches-wrap mt-5 pt-5">
        <div className="container">
          <h2 className="black fw_800 mb-4" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}>
            Find Us
          </h2>

          <div className="row g-4 g-xl-5">
            {branches.map((branch, i) => (
              <motion.div
                key={branch.name}
                className="col-md-6 col-xl-3"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <div
                  style={{
                    paddingLeft: "1rem",
                    borderLeft: `3px solid ${branch.accent}`,
                  }}
                >
                  <h3 className="black fw_800 mb-1" style={{ fontSize: "1.1rem" }}>
                    {branch.name}
                    {branch.comingSoon && (
                      <span className="pra fw_500 ms-2" style={{ fontSize: "0.8rem" }}>
                        (Coming soon)
                      </span>
                    )}
                  </h3>
                  <p className="pra mb-1" style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                    {branch.location}
                  </p>
                  <p className="pra mb-1" style={{ fontSize: "0.78rem", opacity: 0.7 }}>
                    GhanaPostGPS: {branch.gps}
                  </p>
                  <p className="mb-2 fw_700" style={{ fontSize: "0.82rem", color: branch.accent }}>
                    {branch.hours}
                  </p>
                  <div className="d-flex flex-wrap align-items-center gap-3">
                    {branch.phone && branch.tel ? (
                      <a
                        href={`tel:${branch.tel}`}
                        className="fw_700 text-decoration-none"
                        style={{ color: branch.accent, fontSize: "0.9rem" }}
                      >
                        {branch.phone}
                      </a>
                    ) : (
                      <span className="pra" style={{ fontSize: "0.9rem" }}>
                        Phone coming soon
                      </span>
                    )}
                    <a
                      href={branch.maps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none pra"
                      style={{ fontSize: "0.82rem" }}
                    >
                      Get directions →
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Special;