"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import AddToCartButton from "@/components/medizen/shop/AddToCartButton"
import { SafeProductImage } from "@/components/medizen/shop/SafeProductImage"
import type { ShopProduct } from "@/app/actions/storefront"

type ProductCardProps = {
  product: ShopProduct
}

export default function ProductCard({ product }: ProductCardProps) {
  const detailsHref = `/shop/${product.id}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="product-card-modern h-100"
    >
      <Link
        href={detailsHref}
        aria-label={`View ${product.name}`}
        className="product-card-link glass-card p-3 rounded-5 h-100 d-flex flex-column border-1 border-white/20 shadow-sm text-decoration-none group"
      >
        <div className="thumb rounded-4 overflow-hidden mb-3 position-relative aspect-square">
          <SafeProductImage
            src={product.image}
            alt={product.name}
            className="product-card-img w-100 h-100 object-fit-cover"
          />

          <div className="badges position-absolute top-0 start-0 m-3 d-flex flex-column gap-2">
            {product.hasDiscount && (
              <span
                className="text-white px-2 py-1 rounded-pill fw_800 d-inline-flex align-items-center gap-1"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  fontSize: "0.66rem",
                  letterSpacing: "0.04em",
                }}
              >
                −{product.discountPercent}%
              </span>
            )}
            {product.featured && (
              <span
                className="p2-bg text-white px-2 py-1 rounded-pill fw_800"
                style={{ fontSize: "0.62rem", letterSpacing: "0.05em" }}
              >
                FEATURED
              </span>
            )}
            {!product.inStock && (
              <span
                className="px-2 py-1 rounded-pill fw_800 text-white"
                style={{
                  background: "rgba(239, 68, 68, 0.92)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.05em",
                }}
              >
                OUT OF STOCK
              </span>
            )}
          </div>
        </div>

        <div className="content px-2 pb-2 d-flex flex-column flex-grow-1">
          <span
            className="p1-clr fs-ten fw_800 text-uppercase mb-1 d-block"
            style={{ letterSpacing: "0.12em" }}
          >
            {product.category}
          </span>
          <h5
            className="black fw_800 mb-1 hover-p1 transition-all"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.name}
          </h5>
          {product.branch && (
            <p className="pra mb-0 fs-ten" style={{ opacity: 0.7 }}>
              {product.branch}
            </p>
          )}

          <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-black/5">
            <div className="d-flex flex-column" style={{ minWidth: 0 }}>
              <div
                className={`fw_900 product-price${product.hasDiscount ? " product-price--discount" : ""}`}
                style={{
                  fontSize: "1.4rem",
                  color: product.hasDiscount ? "#dc2626" : "var(--text-prm)",
                  lineHeight: 1.1,
                }}
              >
                {product.priceLabel}
              </div>
              {product.hasDiscount && (
                <div
                  className="text-decoration-line-through tabular-nums product-price-original"
                  style={{ fontSize: "0.78rem", color: "rgba(0,0,0,0.45)", fontWeight: 600 }}
                >
                  {product.originalPriceLabel}
                </div>
              )}
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
              }}
              disabled={!product.inStock}
            />
          </div>
        </div>
      </Link>

    </motion.div>
  )
}
