"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  PHARMACY_PRIMARY_PHONE,
  pharmacyPrimaryTelHref,
} from "@/data/pharmacy-branches";
import { CollapseBlock } from "@/components/medizen/CollapseBlock";

const pillars = [
  {
    icon: "fas fa-clock",
    title: "Monday – Saturday",
    text: "Walk in during branch opening hours — call ahead if you need to confirm today's times.",
  },
  {
    icon: "fas fa-map-marked-alt",
    title: "Branches near you",
    text: "Visit the contact page for branch details, hours, and directions.",
  },
  {
    icon: "fas fa-user-md",
    title: "Qualified pharmacists on site",
    text: "Private consultations, medication reviews, and clear counselling before you leave.",
  },
  {
    icon: "fas fa-shield-alt",
    title: "FDA-compliant supply chain",
    text: "Medicines sourced from approved suppliers, verified and dispensed with care.",
  },
];

export default function ServicesTrustSection() {
  return (
    <section className="svc-trust-section section-padding cmn-bg fix">
      <div className="container">
        <div className="row justify-content-center mb-4 mb-md-5">
          <div className="col-lg-8 text-center">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="svc-eyebrow mb-3 d-inline-block"
            >
              Why Enviro Pharmacy
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              viewport={{ once: true }}
              className="fw_800 black mb-3"
              style={{ fontSize: "clamp(1.55rem, 3vw, 2.2rem)", lineHeight: 1.15 }}
            >
              Real pharmacy care, close to home
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              viewport={{ once: true }}
              className="pra mx-auto mb-0"
              style={{ maxWidth: 560, lineHeight: 1.8 }}
            >
              We are not just a dispensary — we are your neighbourhood pharmacy team for
              prescriptions, walk-in health checks, delivery, and honest advice.
            </motion.p>
          </div>
        </div>

        <CollapseBlock
          title="Why Enviro Pharmacy"
          subtitle="Four reasons patients trust us"
          defaultOpen={false}
        >
        <div className="row g-3 g-md-4">
          {pillars.map((item, index) => (
            <div key={item.title} className="col-md-6">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.07 }}
                viewport={{ once: true }}
                className="svc-trust-item h-100"
              >
                <span className="svc-trust-icon" aria-hidden>
                  <i className={item.icon} />
                </span>
                <div>
                  <h3 className="svc-trust-title">{item.title}</h3>
                  <p className="svc-trust-text mb-0">{item.text}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
        </CollapseBlock>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="svc-trust-cta text-center mt-4 mt-md-5"
        >
          <p className="svc-trust-cta-lead mb-3">
            Need help choosing a service or finding your nearest branch?
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-2 gap-md-3">
            <a
              href={pharmacyPrimaryTelHref()}
              className="common-btn box-style first-box d-inline-flex justify-content-center align-items-center gap-2 fw-semibold rounded100"
            >
              <i className="fas fa-phone" /> Call us — {PHARMACY_PRIMARY_PHONE}
            </a>
            <Link
              href="/contact"
              className="common-btn box-style second-box d-inline-flex justify-content-center align-items-center gap-2 fw-semibold rounded100"
            >
              Find a branch
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
