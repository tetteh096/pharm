"use client"

import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Navigation, Thumbs, Zoom } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/thumbs"
import "swiper/css/free-mode"
import "swiper/css/zoom"

type ProductGalleryProps = {
  images: string[]
  name: string
  badges?: React.ReactNode
}

export default function ProductGallery({ images, name, badges }: ProductGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)
  // Track broken images so we can swap them for a fallback.
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set())

  const safeImages = images.length > 0 ? images : []
  const hasMultiple = safeImages.length > 1

  if (safeImages.length === 0) {
    return (
      <div
        className="rounded-4 overflow-hidden border d-flex align-items-center justify-content-center"
        style={{ background: "#f4f6f8", aspectRatio: "1 / 1" }}
      >
        <div className="text-center pra">
          <ImageOff size={48} style={{ opacity: 0.3 }} />
          <p className="mb-0 mt-2" style={{ fontSize: "0.85rem" }}>
            No images available
          </p>
        </div>
      </div>
    )
  }

  const markBroken = (i: number) =>
    setBrokenImages((prev) => {
      if (prev.has(i)) return prev
      const next = new Set(prev)
      next.add(i)
      return next
    })

  return (
    <div className="product-gallery">
      <div className="product-gallery-main position-relative rounded-4 overflow-hidden border">
        <Swiper
          modules={[FreeMode, Navigation, Thumbs, Zoom]}
          spaceBetween={0}
          navigation={
            hasMultiple
              ? {
                  prevEl: ".pg-prev",
                  nextEl: ".pg-next",
                }
              : false
          }
          thumbs={hasMultiple && thumbsSwiper ? { swiper: thumbsSwiper } : undefined}
          zoom={{ maxRatio: 2.5 }}
          className="pg-main-swiper"
        >
          {safeImages.map((img, i) => (
            <SwiperSlide key={i}>
              <div
                className="swiper-zoom-container d-flex align-items-center justify-content-center"
                style={{ background: "#f4f6f8", aspectRatio: "1 / 1" }}
              >
                {brokenImages.has(i) ? (
                  <div className="text-center pra">
                    <ImageOff size={48} style={{ opacity: 0.3 }} />
                    <p className="mb-0 mt-2" style={{ fontSize: "0.78rem" }}>
                      Image unavailable
                    </p>
                  </div>
                ) : (
                  <img
                    src={img}
                    alt={`${name} — view ${i + 1}`}
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                    onError={() => markBroken(i)}
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {badges && (
          <div className="position-absolute top-0 start-0 end-0 d-flex justify-content-between align-items-start p-3 pe-none">
            <div className="pe-auto">{badges}</div>
          </div>
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              className="pg-prev d-flex align-items-center justify-content-center rounded-circle border-0 position-absolute top-50 translate-middle-y"
              style={{
                left: 12,
                width: 38,
                height: 38,
                background: "rgba(255,255,255,0.92)",
                color: "#09162a",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                zIndex: 10,
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              className="pg-next d-flex align-items-center justify-content-center rounded-circle border-0 position-absolute top-50 translate-middle-y"
              style={{
                right: 12,
                width: 38,
                height: 38,
                background: "rgba(255,255,255,0.92)",
                color: "#09162a",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                zIndex: 10,
                cursor: "pointer",
              }}
            >
              <ChevronRight size={18} />
            </button>

            <span
              className="position-absolute bottom-0 end-0 m-3 px-3 py-1 rounded-pill text-white"
              style={{
                background: "rgba(9,22,42,0.7)",
                fontSize: "0.72rem",
                fontWeight: 700,
                backdropFilter: "blur(4px)",
              }}
            >
              {safeImages.length} photos
            </span>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="product-gallery-thumbs mt-3">
          <Swiper
            modules={[FreeMode, Thumbs]}
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            freeMode
            watchSlidesProgress
            breakpoints={{
              480: { slidesPerView: 5 },
              768: { slidesPerView: 6 },
            }}
            className="pg-thumbs-swiper"
          >
            {safeImages.map((img, i) => (
              <SwiperSlide key={i} className="pg-thumb-slide">
                <button
                  type="button"
                  className="rounded-3 overflow-hidden border-0 p-0 w-100 d-flex align-items-center justify-content-center"
                  style={{
                    aspectRatio: "1 / 1",
                    background: "#f4f6f8",
                    cursor: "pointer",
                  }}
                  aria-label={`View image ${i + 1}`}
                >
                  {brokenImages.has(i) ? (
                    <ImageOff size={20} style={{ opacity: 0.4 }} />
                  ) : (
                    <img
                      src={img}
                      alt={`${name} thumbnail ${i + 1}`}
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                      onError={() => markBroken(i)}
                    />
                  )}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      <style jsx>{`
        :global(.product-gallery .pg-main-swiper) {
          aspect-ratio: 1 / 1;
        }
        :global(.product-gallery .pg-thumbs-swiper .swiper-slide) {
          opacity: 0.55;
          transition: opacity 0.2s ease, outline-color 0.2s ease;
          border-radius: 12px;
          outline: 2px solid transparent;
        }
        :global(.product-gallery .pg-thumbs-swiper .swiper-slide:hover) {
          opacity: 0.9;
        }
        :global(
            .product-gallery
              .pg-thumbs-swiper
              .swiper-slide-thumb-active
          ) {
          opacity: 1;
          outline-color: var(--p1-clr);
        }
        :global(.product-gallery .pg-prev),
        :global(.product-gallery .pg-next) {
          transition: transform 0.18s ease, background 0.18s ease;
        }
        :global(.product-gallery .pg-prev:hover),
        :global(.product-gallery .pg-next:hover) {
          background: #ffffff !important;
          transform: translateY(-50%) scale(1.06);
        }
        :global(.product-gallery .pg-prev.swiper-button-disabled),
        :global(.product-gallery .pg-next.swiper-button-disabled) {
          opacity: 0.45;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
