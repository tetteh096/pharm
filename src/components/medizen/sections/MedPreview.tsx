"use client";

import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
} from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import type { StorefrontProduct } from "@/app/actions/storefront";
import { SafeProductImage } from "@/components/medizen/shop/SafeProductImage";

export default function MedPreview({
  products = [],
}: {
  products?: StorefrontProduct[];
}) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const hasProducts = products.length > 0;

  return (
    <section className="med-preview-section">
      <div className="container">
        <div className="med-preview-header d-flex align-items-end justify-content-between gap-3 mb-4 mb-xxl-5 flex-wrap">
          <div className="med-preview-header-copy">
            <span className="med-preview-eyebrow d-inline-flex align-items-center gap-2 mb-3">
              <Sparkles size={13} aria-hidden />
              Easy Find Meds
            </span>
            <h2 className="med-preview-title mb-2">Popular Products</h2>
            <p className="med-preview-subtitle mb-0">
              Trusted essentials and customer favourites — order online in minutes.
            </p>
          </div>

          {hasProducts && (
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                aria-label="Previous products"
                disabled={isBeginning}
                className={`med-preview-nav-btn${isBeginning ? " med-preview-nav-btn--disabled" : ""}`}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                aria-label="Next products"
                disabled={isEnd}
                className={`med-preview-nav-btn${isEnd ? " med-preview-nav-btn--disabled" : ""}`}
              >
                <ChevronRight size={18} />
              </button>
              <Link href="/shop" className="med-preview-view-all d-none d-sm-inline-flex">
                View all
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>

        {!hasProducts ? (
          <div className="med-preview-empty text-center py-5 px-4 rounded-4">
            <p className="fw_800 mb-2">Featured products coming soon</p>
            <p className="mb-4 mx-auto" style={{ maxWidth: 420 }}>
              Mark products as <strong>Featured on home page</strong> in the dashboard to show them here.
            </p>
            <Link
              href="/shop"
              className="med-preview-view-all med-preview-view-all--solid"
            >
              Browse pharmacy shop
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <Swiper
            onSwiper={(s) => {
              swiperRef.current = s;
              setIsBeginning(s.isBeginning);
              setIsEnd(s.isEnd);
            }}
            onSlideChange={(s) => {
              setIsBeginning(s.isBeginning);
              setIsEnd(s.isEnd);
            }}
            modules={[Navigation, Autoplay]}
            spaceBetween={12}
            slidesPerView={2}
            speed={650}
            breakpoints={{
              768: { slidesPerView: 3, spaceBetween: 18 },
              1200: { slidesPerView: 4, spaceBetween: 20 },
            }}
            loop={products.length > 4}
            rewind={products.length > 2 && products.length <= 4}
            autoplay={
              products.length > 2
                ? {
                    delay: 4200,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
          >
            {products.map((med) => (
              <SwiperSlide key={med.id}>
                <MedPreviewCard product={med} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {hasProducts && (
          <div className="text-center mt-4 d-sm-none">
            <Link href="/shop" className="med-preview-view-all med-preview-view-all--outline">
              View all products
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function MedPreviewCard({ product }: { product: StorefrontProduct }) {
  return (
    <Link
      href={`/shop/${product.id}`}
      className="med-preview-card text-decoration-none d-flex flex-column h-100"
    >
      <div className="med-preview-thumb position-relative overflow-hidden">
        <SafeProductImage
          src={product.image}
          alt={product.name}
          className="med-preview-thumb-img w-100 h-100"
        />
        {product.hasDiscount && (
          <span className="med-preview-discount-badge">
            −{product.discountPercent}%
          </span>
        )}
        <span className="med-preview-eye" aria-hidden>
          <Eye size={15} />
        </span>
      </div>

      <div className="med-preview-card-body d-flex flex-column flex-grow-1">
        <span className="med-preview-category">{product.category}</span>
        <h3 className="med-preview-name">{product.name}</h3>

        <div className="med-preview-footer">
          <div className="med-preview-prices">
            <span
              className={`med-preview-price${product.hasDiscount ? " med-preview-price--discount" : ""}`}
            >
              {product.price}
            </span>
            {product.hasDiscount && product.originalPriceLabel && (
              <span className="med-preview-price-original">
                {product.originalPriceLabel}
              </span>
            )}
          </div>
          <span className="med-preview-shop-hint" aria-hidden>
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
