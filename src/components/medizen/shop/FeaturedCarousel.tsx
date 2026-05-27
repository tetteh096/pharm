"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Autoplay } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import "swiper/css"
import "swiper/css/navigation"
import { ChevronLeft, ChevronRight, Eye, Sparkles, ShoppingCart } from "lucide-react"
import AddToCartButton from "@/components/medizen/shop/AddToCartButton"
import { SafeProductImage } from "@/components/medizen/shop/SafeProductImage"
import type { ShopProduct } from "@/app/actions/storefront"

type Props = {
  products: ShopProduct[]
  title?: string
  subtitle?: string
}

export default function FeaturedCarousel({
  products,
  title = "Featured this week",
  subtitle = "Hand-picked pharmacy essentials with the best value",
}: Props) {
  const swiperRef = useRef<SwiperType | null>(null)
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)

  if (products.length === 0) return null

  return (
    <section className="featured-carousel mb-5">
      <div
        className="rounded-4 p-4 p-md-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(19, 236, 138, 0.06), rgba(17, 87, 238, 0.04))",
          border: "1px solid rgba(19, 236, 138, 0.18)",
        }}
      >
        <div className="d-flex justify-content-between align-items-end gap-3 mb-3 flex-wrap">
          <div>
            <span
              className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2"
              style={{
                background: "var(--p1-clr)",
                color: "#fff",
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              <Sparkles size={12} />
              Featured
            </span>
            <h3 className="black fw_800 mb-1" style={{ fontSize: "clamp(1.25rem, 2.4vw, 1.6rem)" }}>
              {title}
            </h3>
            <p className="pra mb-0" style={{ fontSize: "0.85rem", maxWidth: 480 }}>
              {subtitle}
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              aria-label="Previous featured product"
              onClick={() => swiperRef.current?.slidePrev()}
              disabled={isBeginning}
              className="d-flex align-items-center justify-content-center rounded-circle border-0"
              style={{
                width: 40,
                height: 40,
                background: isBeginning ? "rgba(0,0,0,0.04)" : "#ffffff",
                color: isBeginning ? "rgba(0,0,0,0.3)" : "#09162a",
                boxShadow: isBeginning ? "none" : "0 4px 12px rgba(0,0,0,0.08)",
                cursor: isBeginning ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next featured product"
              onClick={() => swiperRef.current?.slideNext()}
              disabled={isEnd}
              className="d-flex align-items-center justify-content-center rounded-circle border-0"
              style={{
                width: 40,
                height: 40,
                background: isEnd ? "rgba(0,0,0,0.04)" : "#ffffff",
                color: isEnd ? "rgba(0,0,0,0.3)" : "#09162a",
                boxShadow: isEnd ? "none" : "0 4px 12px rgba(0,0,0,0.08)",
                cursor: isEnd ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              <ChevronRight size={18} />
            </button>
            <Link
              href="#all-products"
              className="d-none d-sm-inline-flex align-items-center gap-2 fw_800 text-decoration-none rounded-pill px-3 py-2"
              style={{
                background: "var(--p1-clr)",
                color: "#fff",
                fontSize: "0.8rem",
              }}
            >
              View all
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        <Swiper
          onSwiper={(s) => {
            swiperRef.current = s
            setIsBeginning(s.isBeginning)
            setIsEnd(s.isEnd)
          }}
          onSlideChange={(s) => {
            setIsBeginning(s.isBeginning)
            setIsEnd(s.isEnd)
          }}
          modules={[Navigation, Autoplay]}
          spaceBetween={16}
          slidesPerView={1.2}
          breakpoints={{
            520: { slidesPerView: 2.2 },
            768: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
          autoplay={products.length > 4 ? { delay: 4500, disableOnInteraction: true } : false}
          loop={false}
        >
          {products.map((p) => (
            <SwiperSlide key={p.id}>
              <FeaturedSlide product={p} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="text-center mt-3 d-sm-none">
          <Link
            href="#all-products"
            className="d-inline-flex align-items-center gap-2 fw_800 text-decoration-none rounded-pill px-4 py-2"
            style={{ background: "var(--p1-clr)", color: "#fff", fontSize: "0.82rem" }}
          >
            View all products
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function FeaturedSlide({ product }: { product: ShopProduct }) {
  return (
    <Link
      href={`/shop/${product.id}`}
      className="featured-slide d-block rounded-4 text-decoration-none overflow-hidden h-100"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.04)",
        boxShadow: "0 6px 20px rgba(9, 22, 42, 0.05)",
        transition: "all 0.3s",
      }}
    >
      <div
        className="position-relative overflow-hidden"
        style={{ aspectRatio: "1 / 1", background: "#f4f6f8" }}
      >
        <SafeProductImage
          src={product.image}
          alt={product.name}
          className="w-100 h-100"
          style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
        />
        <div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-1">
          {product.hasDiscount && (
            <span
              className="text-white px-3 py-1 rounded-pill fw_800"
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                fontSize: "0.66rem",
              }}
            >
              −{product.discountPercent}%
            </span>
          )}
          {!product.inStock && (
            <span
              className="text-white px-3 py-1 rounded-pill fw_800"
              style={{ background: "rgba(239, 68, 68, 0.92)", fontSize: "0.62rem" }}
            >
              OUT OF STOCK
            </span>
          )}
        </div>
        <span
          className="position-absolute top-0 end-0 m-3 d-flex align-items-center justify-content-center rounded-circle"
          style={{
            width: 34,
            height: 34,
            background: "rgba(255,255,255,0.95)",
            color: "#09162a",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          }}
        >
          <Eye size={14} />
        </span>
      </div>

      <div className="p-3 d-flex flex-column" style={{ minHeight: 156 }}>
        <p
          className="mb-1 fw_800"
          style={{
            fontSize: "0.66rem",
            color: "var(--p1-clr)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {product.category}
        </p>
        <h6
          className="black fw_800 mb-2"
          style={{
            fontSize: "0.92rem",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.5rem",
          }}
        >
          {product.name}
        </h6>
        <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top border-black/5 gap-2">
          <div className="d-flex flex-column" style={{ minWidth: 0 }}>
            <span
              className="fw_900"
              style={{
                fontSize: "1.05rem",
                color: product.hasDiscount ? "#dc2626" : "#09162a",
                lineHeight: 1.1,
              }}
            >
              {product.priceLabel}
            </span>
            {product.hasDiscount && (
              <span
                className="text-decoration-line-through"
                style={{ fontSize: "0.7rem", color: "rgba(0,0,0,0.45)", fontWeight: 600 }}
              >
                {product.originalPriceLabel}
              </span>
            )}
          </div>
          <span
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            style={{ display: "inline-flex" }}
          >
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                branch: product.branch,
                maxStock: product.stock,
              }}
              disabled={!product.inStock}
              className="border-0 d-flex align-items-center justify-content-center rounded-circle"
              variant="icon"
            />
          </span>
        </div>
      </div>

      <style jsx>{`
        :global(.featured-slide:hover) {
          transform: translateY(-4px);
          border-color: var(--p1-clr) !important;
          box-shadow: 0 14px 30px rgba(9, 22, 42, 0.1) !important;
        }
        :global(.featured-slide:hover img) {
          transform: scale(1.06);
        }
      `}</style>
    </Link>
  )
}
