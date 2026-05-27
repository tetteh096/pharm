"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";

const sponsorTexts = [
  { text: "Quality Care Service" },
  { icon: "/assets/img/icon/star-text.png" },
  { text: "Your Wellness Priority" },
  { icon: "/assets/img/icon/star-text.png" },
  { text: "Caring for You Always" },
  { icon: "/assets/img/icon/star-text.png" },
  { text: "Quality Care Service" },
  { icon: "/assets/img/icon/star-text.png" },
];

const Sponsor = () => {
  return (
    <div className="sponsor-text-slide white-bg swiper">
      <Swiper
        modules={[Autoplay]}
        speed={6000}
        loop={true}
        slidesPerView="auto"
        centeredSlides={true}
        autoplay={{
          delay: 1,
          disableOnInteraction: false,
        }}
        breakpoints={{
          991: { spaceBetween: 30 },
          600: { spaceBetween: 20 },
          400: { spaceBetween: 16 },
          0: { spaceBetween: 14 },
        }}
      >
        {sponsorTexts.concat(sponsorTexts).map((item, index) => (
          <SwiperSlide key={index} style={{ width: "auto" }}>
            <div className="text-slide-item">
              {item.text ? item.text : <img src={item.icon} alt="icon" />}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Sponsor;
