"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

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

      {/* ── Branch locations strip ── */}
      <div
        className="mt-5 pt-5"
        style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
      >
        <div className="container">
          <p
            className="mb-4 fw_700"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.4)",
            }}
          >
            Find Us
          </p>
          <div className="row g-4">

            {/* Madina */}
            <motion.div
              className="col-md-3"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div
                style={{
                  paddingLeft: "1.25rem",
                  borderLeft: "3px solid var(--p1-clr)",
                }}
              >
                <h5 className="black fw_800 mb-1" style={{ fontSize: "1.05rem" }}>Madina Branch</h5>
                <p className="pra mb-1" style={{ fontSize: "0.85rem" }}>La-Nkwantanang-Madina, Accra</p>
                <p className="mb-2" style={{ fontSize: "0.8rem", color: "var(--p1-clr)", fontWeight: 700 }}>
                  Open 24 hours · Every day
                </p>
                <div className="d-flex align-items-center gap-3">
                  <a
                    href="tel:0554612072"
                    className="fw_700 text-decoration-none"
                    style={{ color: "var(--p1-clr)", fontSize: "0.85rem" }}
                  >
                    055 461 2072
                  </a>
                  <a
                    href="https://maps.google.com/?q=La-Nkwantanang-Madina,Accra,Ghana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none pra"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Get directions →
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Odorkor */}
            <motion.div
              className="col-md-3"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              viewport={{ once: true }}
            >
              <div
                style={{
                  paddingLeft: "1.25rem",
                  borderLeft: "3px solid var(--p2-clr)",
                }}
              >
                <h5 className="black fw_800 mb-1" style={{ fontSize: "1.05rem" }}>Odorkor Branch</h5>
                <p className="pra mb-1" style={{ fontSize: "0.85rem" }}>Odorkor, Accra</p>
                <p className="mb-2" style={{ fontSize: "0.8rem", color: "var(--p2-clr)", fontWeight: 700 }}>
                  Monday – Saturday
                </p>
                <div className="d-flex align-items-center gap-3">
                  <a
                    href="tel:0599376675"
                    className="fw_700 text-decoration-none"
                    style={{ color: "var(--p2-clr)", fontSize: "0.85rem" }}
                  >
                    059 937 6675
                  </a>
                  <a
                    href="https://maps.google.com/?q=Odorkor,Accra,Ghana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none pra"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Get directions →
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Sakumono */}
            <motion.div
              className="col-md-3"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              viewport={{ once: true }}
            >
              <div
                style={{
                  paddingLeft: "1.25rem",
                  borderLeft: "3px solid #8b5cf6",
                }}
              >
                <h5 className="black fw_800 mb-1" style={{ fontSize: "1.05rem" }}>Sakumono Branch</h5>
                <p className="pra mb-1" style={{ fontSize: "0.85rem" }}>NHTC Estate, Sakumono, Accra</p>
                <p className="mb-2" style={{ fontSize: "0.8rem", color: "#8b5cf6", fontWeight: 700 }}>
                  Monday – Saturday
                </p>
                <div className="d-flex align-items-center gap-3">
                  <a
                    href="tel:0530883354"
                    className="fw_700 text-decoration-none"
                    style={{ color: "#8b5cf6", fontSize: "0.85rem" }}
                  >
                    053 088 3354
                  </a>
                  <a
                    href="https://maps.google.com/?q=Sakumono+NHTC+Estate,Accra,Ghana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none pra"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Get directions →
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Santeo */}
            <motion.div
              className="col-md-3"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.36 }}
              viewport={{ once: true }}
            >
              <div
                style={{
                  paddingLeft: "1.25rem",
                  borderLeft: "3px solid #f59e0b",
                }}
              >
                <h5 className="black fw_800 mb-1" style={{ fontSize: "1.05rem" }}>Santeo Branch</h5>
                <p className="pra mb-1" style={{ fontSize: "0.85rem" }}>Santeo, Accra</p>
                <p className="mb-2" style={{ fontSize: "0.8rem", color: "#f59e0b", fontWeight: 700 }}>
                  Coming Soon · Monday – Saturday
                </p>
                <div className="d-flex align-items-center gap-3">
                  <span
                    className="fw_700"
                    style={{ color: "#f59e0b", fontSize: "0.85rem" }}
                  >
                    Phone coming soon
                  </span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Special;