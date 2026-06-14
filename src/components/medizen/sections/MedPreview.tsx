"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import Link from "next/link";
import "swiper/css";
import "swiper/css/navigation";
import type { StorefrontProduct } from "@/app/actions/storefront";

export default function MedPreview({
  products = [],
}: {
  products?: StorefrontProduct[];
}) {
  const swiperRef = useRef<SwiperType | null>(null);
  const hasProducts = products.length > 0;

  return (
    <section className="med-preview-section">
      <div className="container">
        <div className="d-flex align-items-end justify-content-between gap-3 mb-xxl-5 mb-4 flex-wrap">
          <div>
            <span className="cmn-tag p1-bg heading-font d-inline-block mb-3">Easy Find Meds</span>
            <h2 className="black fw_800 mb-0" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.2 }}>
              Popular Products
            </h2>
          </div>

          {hasProducts && (
            <div className="d-flex align-items-center gap-3">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                aria-label="Previous"
                className="med-preview-nav-btn"
              >
                <img src="/assets/img/icon/arrow-left-black.png" alt="" style={{ width: 16 }} />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                aria-label="Next"
                className="med-preview-nav-btn"
              >
                <img src="/assets/img/icon/arrow-right-black.png" alt="" style={{ width: 16 }} />
              </button>

              <Link
                href="/shop"
                className="d-none d-sm-inline-flex align-items-center gap-2 fw_700 text-decoration-none"
                style={{ color: "var(--p1-clr)", fontSize: "0.88rem" }}
              >
                View all
                <img src="/assets/img/icon/arrow-right-black.png" alt="" style={{ width: 14, filter: "invert(57%) sepia(93%) saturate(409%) hue-rotate(102deg) brightness(98%) contrast(98%)" }} />
              </Link>
            </div>
          )}
        </div>

        {!hasProducts ? (
          <div
            className="text-center py-5 px-4 rounded-4 med-preview-card"
            style={{ borderStyle: "dashed", borderColor: "rgba(19, 236, 138, 0.25)" }}
          >
            <p className="black fw_700 mb-2">Featured products coming soon</p>
            <p className="pra mb-4" style={{ maxWidth: 420, margin: "0 auto 1rem" }}>
              Mark products as <strong>Featured on home page</strong> in the dashboard to show them here.
            </p>
            <Link
              href="/shop"
              className="common-btn box-style first-box d-inline-flex justify-content-center align-items-center gap-2 fs-eight fw_800 rounded-5 px-4 py-2"
            >
              Browse pharmacy shop
            </Link>
          </div>
        ) : (
          <Swiper
            onSwiper={s => { swiperRef.current = s; }}
            modules={[Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              480:  { slidesPerView: 2 },
              768:  { slidesPerView: 3 },
              1200: { slidesPerView: 4 },
            }}
            loop={products.length > 4}
          >
            {products.map(med => (
              <SwiperSlide key={med.id}>
                <Link href={`/shop/${med.id}`} className="text-decoration-none d-block h-100">
                  <div className="product-item med-preview-card">
                    <div
                      className="overflow-hidden rounded-3 mb-3 position-relative"
                      style={{ aspectRatio: "1 / 1", background: "#f4f6f8" }}
                    >
                      <img
                        src={med.image}
                        alt={med.name}
                        className="w-100 h-100"
                        style={{ objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                      />
                      <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1">
                        {med.hasDiscount && (
                          <span
                            className="px-2 py-1 rounded-pill fw_800 text-white"
                            style={{
                              fontSize: "0.65rem",
                              background: "linear-gradient(135deg, #ef4444, #dc2626)",
                            }}
                          >
                            −{med.discountPercent}%
                          </span>
                        )}
                        <span
                          className="px-2 py-1 rounded-pill fw_800"
                          style={{ fontSize: "0.65rem", background: "var(--p1-clr)", color: "#fff" }}
                        >
                          Featured
                        </span>
                      </div>
                    </div>
                    <p className="mb-1" style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--p1-clr)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {med.category}
                    </p>
                    <h6 className="black fw_700 mb-1" style={{ fontSize: "0.92rem", lineHeight: 1.4 }}>
                      {med.name}
                    </h6>
                    <div className="d-flex align-items-baseline gap-2">
                      <p
                        className="mb-0 fw_800"
                        style={{
                          color: med.hasDiscount ? "#dc2626" : "var(--p2-clr)",
                          fontSize: "0.95rem",
                        }}
                      >
                        {med.price}
                      </p>
                      {med.hasDiscount && med.originalPriceLabel && (
                        <span
                          className="text-decoration-line-through"
                          style={{ fontSize: "0.72rem", color: "rgba(0,0,0,0.45)", fontWeight: 600 }}
                        >
                          {med.originalPriceLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        <div className="text-center mt-4 d-sm-none">
          <Link
            href="/shop"
            className="common-btn box-style cmn-border d-inline-flex justify-content-center align-items-center gap-2 fs18 fw-semibold black overflow-hidden rounded100"
          >
            View All Products
            <img src="/assets/img/icon/arrow-right-black.png" alt="" />
          </Link>
        </div>
      </div>
    </section>
  );
}
