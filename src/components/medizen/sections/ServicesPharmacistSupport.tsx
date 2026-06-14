"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Phone, ShoppingBag, MapPin } from "lucide-react";

const benefits = [
  {
    title: "Help when you need it",
    text: "Worried about a missed dose or a new prescription? Call or visit us — we're open 24 hours for urgent pharmacy support.",
  },
  {
    title: "Private & personal",
    text: "Discuss medications openly in a calm setting. Our pharmacists take time to explain doses, interactions, and what to expect — no rushed counter queue.",
  },
  {
    title: "Medicines you can trust",
    text: "Prescriptions and OTC products are sourced from approved suppliers, checked by licensed pharmacists, and dispensed with clear labelling every time.",
  },
  {
    title: "Care for family nearby",
    text: "Buying medicine for someone nearby? Order through our shop or call us — we confirm every order before dispatch.",
  },
];

const steps = [
  {
    num: "01",
    title: "Reach us your way",
    detail: "Walk into any branch, call us, or place an order through our online shop.",
  },
  {
    num: "02",
    title: "Tell us what you need",
    detail: "Prescription refill, blood pressure or glucose check, chronic-care support, delivery, or a general medication question.",
  },
  {
    num: "03",
    title: "We take care of the rest",
    detail: "Our team verifies, counsels, and prepares your order. Pick up in store or arrange delivery where available — you confirm before we deliver.",
  },
];

const channels = [
  {
    icon: Phone,
    label: "Call us",
    detail: "055 461 2072 · 059 937 6675",
    href: "tel:+233554612072",
    cta: "Call now",
  },
  {
    icon: MessageCircle,
    label: "Request a consultation",
    detail: "Medication reviews, side effects, and refill planning with a pharmacist.",
    href: "#book-consultation",
    cta: "Book free consult",
  },
  {
    icon: ShoppingBag,
    label: "Shop online",
    detail: "Browse medicines and wellness products with pharmacist-backed ordering.",
    href: "/shop",
    cta: "Browse shop",
  },
  {
    icon: MapPin,
    label: "Find a branch",
    detail: "Branch hours, directions, and the location nearest to you.",
    href: "/contact",
    cta: "View branches",
  },
];

export default function ServicesPharmacistSupport() {
  return (
    <section className="svc-support-section" aria-labelledby="svc-support-heading">
      {/* Intro — DrugNet-style value headline */}
      <div className="svc-support-hero">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="svc-support-eyebrow"
              >
                Pharmacist support
              </motion.span>
              <motion.h2
                id="svc-support-heading"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                viewport={{ once: true }}
                className="svc-support-title"
              >
                Ask a licensed pharmacist — not the internet
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.14 }}
                viewport={{ once: true }}
                className="svc-support-lead"
              >
                Side effects, drug interactions, prescription refills, chronic-care plans, and
                home delivery — talk to real pharmacists at Enviro Pharmacy in person, by phone,
                or when you order online.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="d-flex flex-wrap gap-2 gap-md-3"
              >
                <a
                  href="tel:+233554612072"
                  className="common-btn box-style first-box d-inline-flex align-items-center gap-2 fw-semibold rounded100"
                >
                  <Phone size={16} /> Call us — 24 hours
                </a>
                <Link
                  href="/team"
                  className="common-btn box-style second-box d-inline-flex align-items-center gap-2 fw-semibold rounded100"
                >
                  Meet our team
                </Link>
              </motion.div>
            </div>

            {/* Chat-style mockup — inspired by DrugNet, decorative only */}
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.12 }}
                viewport={{ once: true }}
                className="svc-support-chat"
                aria-hidden="true"
              >
                <div className="svc-support-chat-header">
                  <span className="svc-support-chat-dot svc-support-chat-dot--online" />
                  Enviro Pharmacy · Pharmacist
                </div>
                <div className="svc-support-chat-body">
                  <div className="svc-support-bubble svc-support-bubble--them">
                    Good afternoon — how can we help with your medication today?
                  </div>
                  <div className="svc-support-bubble svc-support-bubble--you">
                    I need a refill and I&apos;m not sure if I can take this with my blood pressure tablets.
                  </div>
                  <div className="svc-support-bubble svc-support-bubble--them">
                    No problem. Bring your prescription or call us — we&apos;ll review interactions and explain what to take safely.
                  </div>
                  <div className="svc-support-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits grid */}
      <div className="svc-support-benefits section-padding pt-100 pb-100">
        <div className="container">
          <div className="row justify-content-center mb-4 mb-md-5">
            <div className="col-lg-8 text-center">
              <span className="svc-eyebrow mb-3 d-inline-block">Why patients choose us</span>
              <h3 className="fw_800 black mb-3" style={{ fontSize: "clamp(1.45rem, 2.8vw, 2rem)" }}>
                Pharmacy care that feels reliable, local, and human
              </h3>
              <p className="pra mx-auto mb-0" style={{ maxWidth: 540, lineHeight: 1.8 }}>
                From prescription dispensing and walk-in health checks to ordering medicine for
                family — we focus on clear answers and safe supply.
              </p>
            </div>
          </div>
          <div className="row g-4">
            {benefits.map((item, i) => (
              <motion.div
                key={item.title}
                className="col-md-6"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <div className="svc-support-benefit h-100">
                  <h4 className="svc-support-benefit-title">{item.title}</h4>
                  <p className="svc-support-benefit-text mb-0">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works — solid overlay + background image */}
      <div className="svc-support-steps-wrap">
        <img
          src="/photo/d951d5c30f32900ee30d2b1af648eff8.jpg"
          alt=""
          className="svc-support-steps-bg"
          aria-hidden="true"
        />
        <div className="svc-support-steps-overlay" aria-hidden="true" />
        <div className="container svc-support-steps-inner">
          <div className="row justify-content-center mb-4 mb-md-5">
            <div className="col-lg-7 text-center">
              <span className="svc-support-steps-eyebrow">How it works</span>
              <h3 className="svc-support-steps-title">
                Get pharmacy help in three simple steps
              </h3>
            </div>
          </div>
          <div className="row g-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="col-lg-4"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="svc-support-step h-100">
                  <span className="svc-support-step-num">{step.num}</span>
                  <h4 className="svc-support-step-title">{step.title}</h4>
                  <p className="svc-support-step-detail mb-0">{step.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="svc-support-steps-note text-center mt-4 mb-0">
            You confirm every order yourself before we deliver. No hidden charges — clear pricing
            at the counter and in our shop.
          </p>
        </div>
      </div>

      {/* Contact channels */}
      <div className="svc-support-channels section-padding pb-100">
        <div className="container">
          <div className="row g-3 g-md-4">
            {channels.map((ch, i) => {
              const Icon = ch.icon;
              return (
                <motion.div
                  key={ch.label}
                  className="col-sm-6 col-lg-3"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  viewport={{ once: true }}
                >
                  <Link href={ch.href} className="svc-support-channel h-100 text-decoration-none">
                    <span className="svc-support-channel-icon">
                      <Icon size={20} />
                    </span>
                    <h4 className="svc-support-channel-label">{ch.label}</h4>
                    <p className="svc-support-channel-detail mb-2">{ch.detail}</p>
                    <span className="svc-support-channel-cta">{ch.cta} →</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
