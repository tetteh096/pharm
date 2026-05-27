"use client"

import Link from "next/link"
import { useState } from "react"
import { Minus, Plus, Tag, Truck, Phone, MapPin } from "lucide-react"
import AddToCartButton from "@/components/medizen/shop/AddToCartButton"
import ProductGallery from "@/components/medizen/shop/ProductGallery"
import type { ShopProduct } from "@/app/actions/storefront"

export default function ProductDetailsClient({ product }: { product: ShopProduct }) {
  const [quantity, setQuantity] = useState(1)

  const dec = () => setQuantity((q) => Math.max(1, q - 1))
  const inc = () =>
    setQuantity((q) => Math.min(product.stock > 0 ? product.stock : 99, q + 1))

  // Ensure the primary image is first so it's the slide that opens by default.
  const galleryImages = (() => {
    if (product.images.length === 0) return product.image ? [product.image] : []
    if (!product.image) return product.images
    return [product.image, ...product.images.filter((i) => i !== product.image)]
  })()

  return (
    <div className="row g-5 align-items-start mb-5">
      <div className="col-lg-6">
        <ProductGallery
          images={galleryImages}
          name={product.name}
          badges={
            <div className="d-flex flex-column gap-2">
              {product.hasDiscount && (
                <span
                  className="text-white px-3 py-1 rounded-pill fw_800"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  −{product.discountPercent}% OFF
                </span>
              )}
              {product.featured && (
                <span
                  className="px-3 py-1 rounded-pill text-white fw_800"
                  style={{
                    background: "var(--p2-clr)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  FEATURED
                </span>
              )}
              {!product.inStock && (
                <span
                  className="px-3 py-1 rounded-pill text-white fw_800"
                  style={{
                    background: "rgba(239, 68, 68, 0.92)",
                    fontSize: "0.7rem",
                  }}
                >
                  OUT OF STOCK
                </span>
              )}
            </div>
          }
        />
      </div>

      <div className="col-lg-6">
        <span className="p2-clr fw_700 fs-seven mb-2 d-block" style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {product.category}
        </span>
        <h2 className="black mb-3 fw_800">{product.name}</h2>
        <div className="d-flex align-items-end gap-3 mb-3 flex-wrap">
          <h3
            className="fw_800 mb-0"
            style={{
              fontSize: "2rem",
              color: product.hasDiscount ? "#dc2626" : "var(--p2-clr)",
              lineHeight: 1,
            }}
          >
            {product.priceLabel}
          </h3>
          {product.hasDiscount && (
            <>
              <span
                className="text-decoration-line-through"
                style={{
                  fontSize: "1.1rem",
                  color: "rgba(0,0,0,0.45)",
                  fontWeight: 600,
                  paddingBottom: "0.2rem",
                }}
              >
                {product.originalPriceLabel}
              </span>
              <span
                className="text-white px-3 py-1 rounded-pill fw_800"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  fontSize: "0.78rem",
                  letterSpacing: "0.04em",
                }}
              >
                Save {product.discountPercent}%
              </span>
            </>
          )}
        </div>

        {product.description && (
          <p className="pra mb-4" style={{ lineHeight: 1.7 }}>
            {product.description}
          </p>
        )}

        {product.tags.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mb-4">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill"
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  background: "rgba(19, 236, 138, 0.1)",
                  color: "var(--p1-clr)",
                }}
              >
                <Tag size={11} />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
          <div
            className="quantity-box d-flex align-items-center border rounded-5 px-3 py-2"
            style={{ background: "#f8f9fa" }}
          >
            <button
              type="button"
              onClick={dec}
              className="border-0 bg-transparent px-2 d-flex align-items-center"
              aria-label="Decrease quantity"
              disabled={!product.inStock}
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (!Number.isNaN(v)) {
                  setQuantity(Math.max(1, Math.min(product.stock || 99, Math.floor(v))))
                }
              }}
              className="border-0 bg-transparent text-center fw_700 black outline-none"
              style={{ width: 50 }}
              disabled={!product.inStock}
            />
            <button
              type="button"
              onClick={inc}
              className="border-0 bg-transparent px-2 d-flex align-items-center"
              aria-label="Increase quantity"
              disabled={!product.inStock}
            >
              <Plus size={16} />
            </button>
          </div>

          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              category: product.category,
              branch: product.branch,
              maxStock: product.stock,
              quantity,
            }}
            disabled={!product.inStock}
            variant="full"
          />

          <Link
            href="/cart"
            className="common-btn box-style first-box rounded-5 px-4 py-3 fw_700 border-0 d-inline-flex align-items-center"
          >
            View cart
          </Link>
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <p className="mb-4" style={{ color: "#d97706", fontSize: "0.85rem", fontWeight: 600 }}>
            Hurry — only {product.stock} left in stock.
          </p>
        )}

        <div
          className="rounded-4 p-3 mb-4"
          style={{ background: "rgba(17, 87, 238, 0.04)", border: "1px solid rgba(17, 87, 238, 0.1)" }}
        >
          <div className="d-flex align-items-start gap-2 mb-2">
            <Truck size={16} className="mt-1" style={{ color: "var(--p2-clr)" }} />
            <div>
              <p className="black fw_700 mb-0" style={{ fontSize: "0.85rem" }}>
                Pickup or local delivery
              </p>
              <p className="pra mb-0" style={{ fontSize: "0.78rem" }}>
                Pickup ready in 30 minutes at our branches.
              </p>
            </div>
          </div>
          {product.branch && product.branch !== "All branches" && (
            <div className="d-flex align-items-start gap-2 mb-2">
              <MapPin size={16} className="mt-1" style={{ color: "var(--p1-clr)" }} />
              <div>
                <p className="black fw_700 mb-0" style={{ fontSize: "0.85rem" }}>
                  Available at: {product.branch}
                </p>
              </div>
            </div>
          )}
          <div className="d-flex align-items-start gap-2">
            <Phone size={16} className="mt-1" style={{ color: "var(--p1-clr)" }} />
            <div>
              <p className="black fw_700 mb-0" style={{ fontSize: "0.85rem" }}>
                Need help? Call us
              </p>
              <p className="pra mb-0" style={{ fontSize: "0.78rem" }}>
                Madina: <a href="tel:+233554612072" className="black">055 461 2072</a> · Odorkor: <a href="tel:+233599376675" className="black">059 937 6675</a>
              </p>
            </div>
          </div>
        </div>

        <div className="meta-info pt-3 border-top">
          <p className="black mb-1 fw_700" style={{ fontSize: "0.85rem" }}>
            Category: <span className="pra fw_500">{product.category}</span>
          </p>
          <p className="black mb-0 fw_700" style={{ fontSize: "0.85rem" }}>
            Availability:{" "}
            <span className="fw_500" style={{ color: product.inStock ? "var(--p1-clr)" : "#dc2626" }}>
              {product.inStock ? `In stock (${product.stock} available)` : "Out of stock"}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
