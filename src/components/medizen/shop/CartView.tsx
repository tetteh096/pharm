"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useCart } from "@/context/CartContext"
import { formatGhs } from "@/lib/format"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { getCartProductSnapshots, type CartSnapshot } from "@/app/actions/storefront"
import { SafeProductImage } from "@/components/medizen/shop/SafeProductImage"

export default function CartView() {
  const { items, subtotal: localSubtotal, isHydrated, updateQuantity, removeItem, clear, count } = useCart()
  const [snapshots, setSnapshots] = useState<Record<string, CartSnapshot>>({})
  const [snapshotsLoading, setSnapshotsLoading] = useState(false)

  // Use live prices for the total whenever we have snapshots; otherwise fall back.
  const subtotal = items.reduce((sum, i) => {
    const snap = snapshots[i.id]
    const price = snap?.price ?? i.price
    return sum + price * i.quantity
  }, 0) || localSubtotal

  // Pull fresh product data (image, price, stock) every time the cart changes
  // so we never rely on stale base64 images stored in localStorage.
  useEffect(() => {
    if (!isHydrated) return
    if (items.length === 0) {
      setSnapshots({})
      return
    }
    let active = true
    setSnapshotsLoading(true)
    getCartProductSnapshots(items.map((i) => i.id))
      .then((data) => {
        if (active) setSnapshots(data)
      })
      .catch(() => {
        // Silent fail — we'll fall back to the cart's local snapshot.
      })
      .finally(() => {
        if (active) setSnapshotsLoading(false)
      })
    return () => {
      active = false
    }
  }, [isHydrated, items])

  if (!isHydrated) {
    return (
      <div className="text-center py-5">
        <p className="pra">Loading cart…</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-5 rounded-4"
        style={{
          background: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(0,0,0,0.06)",
          maxWidth: 540,
          margin: "0 auto",
        }}
      >
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
          style={{ width: 80, height: 80, background: "rgba(19, 236, 138, 0.1)" }}
        >
          <ShoppingBag size={36} style={{ color: "var(--p1-clr)" }} />
        </div>
        <h4 className="black fw_800 mb-2">Your cart is empty</h4>
        <p className="pra mb-4">Browse our pharmacy products and add what you need.</p>
        <Link
          href="/shop"
          className="common-btn box-style first-box rounded-5 px-5 py-3 fw_800 border-0 d-inline-flex align-items-center gap-2"
        >
          Continue shopping
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    )
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <p className="black fw_700 mb-0">
          {count} item{count === 1 ? "" : "s"} in your cart
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm("Clear all items from your cart?")) {
              clear()
              toast.success("Cart cleared")
            }
          }}
          className="border-0 bg-transparent text-decoration-underline"
          style={{ color: "#dc2626", fontSize: "0.85rem", fontWeight: 600 }}
        >
          Clear cart
        </button>
      </div>

      <div className="cart-table-wrapper mb-5 rounded-4 border overflow-hidden shadow-sm bg-white">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light border-bottom">
            <tr>
              <th className="px-4 py-4 black fw_700 fs-six">Product</th>
              <th className="px-4 py-4 black fw_700 text-center fs-six">Price</th>
              <th className="px-4 py-4 black fw_700 text-center fs-six">Quantity</th>
              <th className="px-4 py-4 black fw_700 text-center fs-six">Subtotal</th>
              <th className="px-4 py-4 black fw_700 text-end fs-six">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const snap = snapshots[item.id]
              // Prefer live data when available; fall back to whatever the cart stored.
              const displayImage = snap?.image ?? item.image
              const displayPrice = snap?.price ?? item.price
              const displayCategory = snap?.category ?? item.category
              const displayBranch = snap?.branch ?? item.branch
              const maxStock = snap?.stock ?? item.maxStock
              const isUnavailable = snap && !snap.available
              const isOutOfStock = snap && !snap.inStock

              return (
                <tr key={item.id} className="border-top-0">
                  <td className="px-4 py-4">
                    <div className="d-flex align-items-center gap-3">
                      <CartThumb src={displayImage} alt={item.name} />
                      <div className="min-w-0">
                        <h6 className="black fw_700 mb-1">
                          <Link href={`/shop/${item.id}`} className="text-decoration-none hover-p1">
                            {item.name}
                          </Link>
                        </h6>
                        <p className="pra fs-eight mb-0">{displayCategory}</p>
                        {displayBranch && displayBranch !== "All branches" && (
                          <p className="pra fs-ten mb-0" style={{ opacity: 0.7 }}>
                            {displayBranch}
                          </p>
                        )}
                        {(isUnavailable || isOutOfStock) && (
                          <span
                            className="d-inline-flex align-items-center gap-1 mt-1 px-2 py-1 rounded-pill"
                            style={{
                              background: "rgba(220, 38, 38, 0.08)",
                              color: "#b91c1c",
                              fontSize: "0.68rem",
                              fontWeight: 700,
                            }}
                          >
                            <AlertTriangle size={11} />
                            {isUnavailable ? "No longer available" : "Out of stock"}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="pra fw_600">{formatGhs(displayPrice)}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div
                      className="quantity-box d-inline-flex align-items-center border rounded-5 px-2 py-1"
                      style={{ background: "#f8f9fa" }}
                    >
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="border-0 bg-transparent px-2 d-flex align-items-center"
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={maxStock || 99}
                        value={item.quantity}
                        onChange={(e) => {
                          const v = Number(e.target.value)
                          if (!Number.isNaN(v)) updateQuantity(item.id, v)
                        }}
                        className="border-0 bg-transparent text-center fw_700 black outline-none"
                        style={{ width: 44 }}
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="border-0 bg-transparent px-2 d-flex align-items-center"
                        aria-label="Increase"
                        disabled={maxStock > 0 && item.quantity >= maxStock}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    {maxStock > 0 && item.quantity >= maxStock && (
                      <p className="mb-0 mt-1" style={{ color: "#d97706", fontSize: "0.7rem" }}>
                        Max stock
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="black fw_800 fs-six">
                      {formatGhs(displayPrice * item.quantity)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-end">
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.id)
                        toast.success(`${item.name} removed`)
                      }}
                      className="btn btn-sm border-0 rounded-circle p-2 d-inline-flex align-items-center justify-content-center"
                      style={{
                        background: "rgba(220, 38, 38, 0.08)",
                        color: "#dc2626",
                        width: 36,
                        height: 36,
                      }}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {snapshotsLoading && (
        <p className="pra mb-3" style={{ fontSize: "0.78rem", opacity: 0.7 }}>
          Syncing latest prices and stock…
        </p>
      )}

      <div className="row g-4 justify-content-between">
        <div className="col-lg-5">
          <Link
            href="/shop"
            className="common-btn box-style first-box rounded-5 px-4 py-3 fw_700 border-0 d-inline-flex align-items-center gap-2"
          >
            ← Continue shopping
          </Link>
        </div>
        <div className="col-lg-5">
          <div className="cart-totals p-4 rounded-4 bg-light border">
            <h4 className="black mb-4 fw_800 border-bottom pb-3">Cart totals</h4>
            <div className="d-flex justify-content-between mb-3">
              <span className="pra">Subtotal</span>
              <span className="black fw_600">{formatGhs(subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="pra">Delivery</span>
              <span className="black fw_600">Calculated at checkout</span>
            </div>
            <div className="d-flex justify-content-between mb-4 border-top pt-3">
              <span className="black fw_800">Total</span>
              <span className="black fw_800 fs-four">{formatGhs(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="common-btn box-style p2-bg text-white w-100 rounded-5 py-3 text-center d-flex justify-content-center align-items-center gap-2 fw_800 text-decoration-none"
            >
              Proceed to checkout
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

function CartThumb({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="product-img-box rounded-3 overflow-hidden border flex-shrink-0"
      style={{ width: 76, height: 76, background: "#f4f6f8" }}
    >
      <SafeProductImage
        src={src}
        alt={alt}
        className="w-100 h-100"
        style={{ objectFit: "cover" }}
      />
    </div>
  )
}
