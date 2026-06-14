"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "Do I need a prescription to buy medication?",
    a: "Prescription-only medicines require a valid prescription from a licensed doctor. Over-the-counter products, vitamins, and many wellness items can be purchased without one. Our pharmacists will guide you if you're unsure.",
  },
  {
    q: "Can I order online and get delivery?",
    a: "Yes — browse our shop, add items to your cart, and checkout with your delivery details. Prescription items are reviewed by a pharmacist before dispatch. Call any branch if you need same-day help.",
  },
  {
    q: "Is a pharmacist available for consultation?",
    a: "Absolutely. Walk in for free advice on medications, side effects, supplements, and chronic conditions. Private consultation is available at our branches — no appointment needed for quick questions.",
  },
  {
    q: "Which branch is open 24 hours?",
    a: "Our Madina branch operates 24 hours a day, every day — including weekends and public holidays. Other branches have regular hours; check our Contact page or call ahead.",
  },
  {
    q: "Are your medicines genuine and safe?",
    a: "Every product is sourced from FDA-Ghana approved suppliers. Our pharmacists verify prescriptions, check interactions, and counsel you before dispensing — especially for antibiotics and chronic medications.",
  },
];

export default function HomeFaq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="home-faq-inner">
      <div className="text-center mb-5">
        <span className="home-help-eyebrow">Questions & Answers</span>
        <h2 className="black fw_800 mb-3" style={{ fontSize: "clamp(1.7rem, 3.2vw, 2.4rem)" }}>
          Frequently Asked Questions
        </h2>
        <p className="pra mx-auto mb-0" style={{ maxWidth: 520, lineHeight: 1.75 }}>
          Quick answers about prescriptions, delivery, consultations, and how we serve you.
        </p>
      </div>

      <div className="home-faq-list mx-auto" style={{ maxWidth: 760 }}>
        {faqs.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <motion.div
              key={item.q}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              viewport={{ once: true }}
              className={`home-faq-item${isOpen ? " home-faq-item--open" : ""}`}
            >
              <button
                type="button"
                className="home-faq-trigger"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <i className={`fas fa-${isOpen ? "minus" : "plus"}`} aria-hidden />
              </button>
              <div className={`home-faq-body${isOpen ? " is-open" : ""}`}>
                <p>{item.a}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
