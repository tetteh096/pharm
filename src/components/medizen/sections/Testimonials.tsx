"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const testimonials = [
  {
    id: 1,
    name: "Ama Serwaa",
    area: "Madina, Accra",
    text: "Enviro Pharmacy always takes time to explain my blood pressure medication. I never leave confused — and refills are ready quickly.",
    rating: 5,
  },
  {
    id: 2,
    name: "Kofi Adom",
    area: "Odorkor",
    text: "Ordered from the online shop and the team called to confirm everything. Genuine products and friendly service every time.",
    rating: 5,
  },
  {
    id: 3,
    name: "Efua Mensah",
    area: "Sakumono",
    text: "My children’s prescriptions are handled with care. The pharmacists are patient, professional, and genuinely helpful.",
    rating: 5,
  },
  {
    id: 4,
    name: "Yaw Owusu",
    area: "Tema",
    text: "Madina branch at night saved us when we needed urgent medication. Real 24-hour support — not just a sign on the door.",
    rating: 5,
  },
  {
    id: 5,
    name: "Akosua Darko",
    area: "East Legon",
    text: "Best pharmacy experience in Accra. Clear pricing, honest advice on supplements, and they remember regular customers.",
    rating: 5,
  },
  {
    id: 6,
    name: "Kwabena Osei",
    area: "Santeo",
    text: "From malaria test to the right treatment, everything was done in one visit. Fast, clean, and trustworthy.",
    rating: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="home-testimonial-stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <i key={i} className="fas fa-star" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <div className="home-testimonials-inner">
      <div className="text-center mb-5">
        <span className="home-help-eyebrow home-help-eyebrow--green">What Customers Say</span>
        <h2 className="black fw_800 mb-3" style={{ fontSize: "clamp(1.7rem, 3.2vw, 2.4rem)" }}>
          Trusted by Families Across Accra
        </h2>
        <p className="pra mx-auto mb-0" style={{ maxWidth: 520, lineHeight: 1.75 }}>
          Real feedback from people who rely on Enviro Pharmacy for everyday care.
        </p>
      </div>

      <Swiper
        className="home-testimonials-slider"
        modules={[Autoplay, Pagination, A11y]}
        slidesPerView={1}
        spaceBetween={24}
        loop
        speed={900}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {testimonials.map((t) => (
          <SwiperSlide key={t.id}>
            <article className="home-testimonial-card h-100">
              <Stars count={t.rating} />
              <p className="home-testimonial-quote">&ldquo;{t.text}&rdquo;</p>
              <div className="home-testimonial-author">
                <div className="home-testimonial-avatar" aria-hidden>
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="home-testimonial-name mb-0">{t.name}</p>
                  <p className="home-testimonial-area mb-0">{t.area}</p>
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
