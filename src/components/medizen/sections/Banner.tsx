"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import Link from "next/link";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const slides = [
  {
    bg: "/hero1.png",
    tag: "Trusted Pharmacy Care",
    heading: "Your wellness is our priority",
    sub: "Get expert prescription guidance, reliable medication support, and trusted pharmacy care tailored for your family.",
  },
  {
    bg: "/hero2.webp",
    tag: "Friendly Local Support",
    heading: "Care that feels close to home",
    sub: "From everyday medicine needs to urgent refill questions, Enviro Pharmacy keeps dependable support within easy reach.",
  },
  {
    bg: "/hero6.png",
    tag: "Genuine Medications",
    heading: "Confident care every single day",
    sub: "Shop medications and wellness products with confidence, backed by guidance from your local pharmacy team.",
  },
];

export default function Banner() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="eh-section">

        {/* Layer 1 – background image slider */}
        <Swiper
          className="eh-slider"
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop
          speed={1800}
          autoplay={{ delay: 8000, disableOnInteraction: false }}
          pagination={{ clickable: true, el: ".eh-dots" }}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.bg}>
              {/* photo */}
              <div
                className="eh-photo"
                style={{ backgroundImage: `url(${slide.bg})` }}
              />
              {/* dark wash — sits on top of photo, below text */}
              <div className="eh-wash" />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Layer 2 – text content */}
        <div className="eh-body">
          <div className="container">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <span className="eh-tag">
                  <i className="fas fa-heartbeat" />&nbsp;
                  {slides[activeIndex].tag}
                </span>

                <h1 className="eh-heading">
                  {slides[activeIndex].heading}
                </h1>

                <p className="eh-sub">
                  {slides[activeIndex].sub}
                </p>

                <div className="eh-actions">
                  <Link href="/shop" className="eh-btn eh-btn--solid">
                    Shop Medications &nbsp;<i className="fas fa-arrow-right" />
                  </Link>
                  <Link href="/contact" className="eh-btn eh-btn--outline">
                    Contact Us &nbsp;<i className="fas fa-phone" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* slide dots */}
            <div className="eh-dots" />
          </div>
        </div>
      </section>
    </>
  );
}
