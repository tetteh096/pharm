"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useCart } from "@/context/CartContext"
import { formatGhs } from "@/lib/format"
import {
  placeOrder,
  getCartProductSnapshots,
  type PlaceOrderInput,
  type CartSnapshot,
} from "@/app/actions/storefront"
import type { DeliveryLocation } from "@/components/medizen/shop/DeliveryMapPicker"
import { SafeProductImage } from "@/components/medizen/shop/SafeProductImage"
import { toast } from "sonner"
import { Loader2, Phone, MapPin, ShoppingBag, Truck, Building2 } from "lucide-react"

// Leaflet is browser-only, so we lazy-load the map.
const DeliveryMapPicker = dynamic(
  () => import("@/components/medizen/shop/DeliveryMapPicker"),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-4 d-flex align-items-center justify-content-center border"
        style={{ height: 320, background: "#f4f6f8" }}
      >
        <Loader2 className="animate-spin" size={20} />
      </div>
    ),
  }
)

type Branch = {
  id: string
  name: string
  location: string | null
  phone: string | null
  hours: string | null
}

type Fulfillment = "pickup" | "delivery"
type Payment = "CASH_ON_DELIVERY" | "MOBILE_MONEY"

const PAYMENT_LABELS: Record<Payment, string> = {
  CASH_ON_DELIVERY: "Cash on delivery / on pickup",
  MOBILE_MONEY: "Mobile money",
}

const PAYMENT_DESCRIPTIONS: Record<Payment, string> = {
  CASH_ON_DELIVERY: "Pay when you collect or when we deliver.",
  MOBILE_MONEY: "Coming soon",
}

/** Payment methods shown but not yet available at checkout. */
const PAYMENT_COMING_SOON = new Set<Payment>(["MOBILE_MONEY"])

export default function CheckoutForm({ branches }: { branches: Branch[] }) {
  const router = useRouter()
  const { items, subtotal, isHydrated, clear, count } = useCart()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup")
  const [branchId, setBranchId] = useState<string>(branches[0]?.id ?? "")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [payment, setPayment] = useState<Payment>("CASH_ON_DELIVERY")
  const [submitting, setSubmitting] = useState(false)
  // Optional GPS pin chosen on the embedded map. The address textarea
  // auto-fills when the user drops a pin, but they can edit it freely.
  const [pinnedLocation, setPinnedLocation] = useState<DeliveryLocation | null>(null)
  // Fresh product data fetched from the server so we always have a working
  // image, even if the version stored in localStorage is broken or stale.
  const [snapshots, setSnapshots] = useState<Record<string, CartSnapshot>>({})

  useEffect(() => {
    if (!isHydrated || items.length === 0) return
    let active = true
    getCartProductSnapshots(items.map((i) => i.id))
      .then((data) => {
        if (active) setSnapshots(data)
      })
      .catch(() => {
        // Silently fall back to whatever the cart already has.
      })
    return () => {
      active = false
    }
  }, [isHydrated, items])

  useEffect(() => {
    if (isHydrated && items.length === 0 && !submitting) {
      // Empty cart — bounce back. Small delay so the user can see the page briefly.
      const t = setTimeout(() => router.push("/cart"), 50)
      return () => clearTimeout(t)
    }
  }, [isHydrated, items.length, router, submitting])

  if (!isHydrated) {
    return (
      <div className="text-center py-5">
        <Loader2 className="animate-spin" size={32} />
        <p className="pra mt-3">Loading checkout…</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-5 rounded-4" style={{ background: "rgba(255,255,255,0.6)" }}>
        <ShoppingBag size={48} className="opacity-30 mb-3" />
        <h4 className="black fw_800 mb-2">Your cart is empty</h4>
        <p className="pra mb-3">Add products to your cart before checking out.</p>
        <Link
          href="/shop"
          className="common-btn box-style first-box rounded-5 px-4 py-2 fw_800 border-0"
        >
          Browse shop
        </Link>
      </div>
    )
  }

  const selectedBranch = branches.find((b) => b.id === branchId) ?? null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error("Please enter your name")
    if (!phone.trim()) return toast.error("A phone number is required")
    if (fulfillment === "delivery" && !address.trim()) {
      return toast.error("Please enter a delivery address")
    }

    const payload: PlaceOrderInput = {
      customer: {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
      },
      delivery: {
        branch: selectedBranch?.name ?? null,
        address: fulfillment === "delivery" ? address.trim() : undefined,
        notes: notes.trim() || undefined,
        lat: fulfillment === "delivery" ? pinnedLocation?.lat ?? null : null,
        lng: fulfillment === "delivery" ? pinnedLocation?.lng ?? null : null,
      },
      fulfillmentType: fulfillment === "delivery" ? "DELIVERY" : "PICKUP",
      paymentMethod: payment,
      items: items.map((i) => ({
        productId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    }

    setSubmitting(true)
    const result = await placeOrder(payload)

    if (result.ok) {
      clear()
      toast.success("Order placed!")
      router.push(`/checkout/success/${result.orderId}`)
    } else {
      toast.error(result.error)
      setSubmitting(false)
    }
  }

  const total = subtotal

  return (
    <form onSubmit={handleSubmit} className="row g-5">
      <div className="col-lg-7">
        <div className="checkout-block p-4 rounded-4 mb-4" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h4 className="black mb-4 fw_800">Your details</h4>
          <div className="row g-3">
            <div className="col-md-12">
              <label className="black mb-2 d-block fw_700">Full name *</label>
              <input
                type="text"
                className="form-control rounded-5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kwame Mensah"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="black mb-2 d-block fw_700">Phone number *</label>
              <input
                type="tel"
                className="form-control rounded-5"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="055 461 2072"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="black mb-2 d-block fw_700">Email (optional)</label>
              <input
                type="email"
                className="form-control rounded-5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>
        </div>

        <div className="checkout-block p-4 rounded-4 mb-4" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h4 className="black mb-4 fw_800">How would you like to receive your order?</h4>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <FulfillmentOption
                active={fulfillment === "pickup"}
                onClick={() => setFulfillment("pickup")}
                icon={<Building2 size={20} />}
                label="Pickup at branch"
                desc="Collect within 30 minutes"
              />
            </div>
            <div className="col-md-6">
              <FulfillmentOption
                active={fulfillment === "delivery"}
                onClick={() => setFulfillment("delivery")}
                icon={<Truck size={20} />}
                label="Local delivery"
                desc="We will call you for delivery details"
              />
            </div>
          </div>

          {/* Branch selector hidden for now */}

          {fulfillment === "delivery" && (
            <div className="mb-3">
              <label className="black mb-2 d-block fw_700">
                Pin your delivery location
              </label>
              <p className="pra mb-2" style={{ fontSize: "0.78rem" }}>
                Tap the map, search a place, or use your GPS so the rider can navigate to you.
              </p>
              <DeliveryMapPicker
                initial={pinnedLocation}
                onChange={(loc) => {
                  setPinnedLocation(loc)
                  if (loc && !address.trim()) {
                    // Auto-fill the address if the customer hasn't typed one yet.
                    setAddress(loc.address)
                  }
                }}
              />

              <label className="black mt-3 mb-2 d-block fw_700">
                Delivery address *
              </label>
              <textarea
                className="form-control rounded-4"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House number, street, area, landmarks…"
                required
              />
              {!pinnedLocation && address.trim() && (
                <p className="pra mb-0 mt-1" style={{ fontSize: "0.72rem", opacity: 0.7 }}>
                  Tip: dropping a pin on the map above helps our rider arrive faster.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="black mb-2 d-block fw_700">Order notes (optional)</label>
            <textarea
              className="form-control rounded-4"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything we should know about your order…"
            />
          </div>
        </div>

        <div className="checkout-block p-4 rounded-4" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h4 className="black mb-4 fw_800">Payment</h4>
          <div className="d-flex flex-column gap-2">
            {(["CASH_ON_DELIVERY", "MOBILE_MONEY"] as Payment[]).map((option) => {
              const comingSoon = PAYMENT_COMING_SOON.has(option)
              const isSelected = payment === option && !comingSoon

              return (
              <label
                key={option}
                className="d-flex align-items-start gap-3 px-3 py-3 rounded-3"
                style={{
                  border: isSelected ? "2px solid var(--p1-clr)" : "1px solid rgba(0,0,0,0.08)",
                  background: isSelected ? "rgba(19, 236, 138, 0.06)" : comingSoon ? "rgba(0,0,0,0.02)" : "transparent",
                  cursor: comingSoon ? "not-allowed" : "pointer",
                  opacity: comingSoon ? 0.65 : 1,
                }}
              >
                <input
                  type="radio"
                  className="form-check-input mt-1"
                  name="payment"
                  checked={isSelected}
                  disabled={comingSoon}
                  onChange={() => {
                    if (!comingSoon) setPayment(option)
                  }}
                />
                <div>
                  <p className="black fw_700 mb-0 d-flex align-items-center gap-2 flex-wrap">
                    {PAYMENT_LABELS[option]}
                    {comingSoon && (
                      <span
                        className="rounded-pill px-2 py-1"
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          background: "rgba(0,0,0,0.06)",
                          color: "#64748b",
                        }}
                      >
                        Coming soon
                      </span>
                    )}
                  </p>
                  <p className="pra mb-0" style={{ fontSize: "0.78rem" }}>
                    {PAYMENT_DESCRIPTIONS[option]}
                  </p>
                </div>
              </label>
              )
            })}
          </div>
        </div>
      </div>

      <div className="col-lg-5">
        <div
          className="order-summary p-4 rounded-4 sticky-top"
          style={{ top: 100, background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <h4 className="black mb-4 fw_800 border-bottom pb-3">Your order</h4>

          <div className="order-items mb-3" style={{ maxHeight: 280, overflowY: "auto" }}>
            {items.map((item) => {
              const snap = snapshots[item.id]
              const displayImage = snap?.image ?? item.image
              const displayPrice = snap?.price ?? item.price
              return (
                <div key={item.id} className="d-flex gap-3 mb-3 align-items-center">
                  <div
                    className="rounded-3 overflow-hidden border flex-shrink-0"
                    style={{ width: 52, height: 52, background: "#f4f6f8" }}
                  >
                    <SafeProductImage
                      src={displayImage}
                      alt={item.name}
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <p className="black fw_700 mb-0" style={{ fontSize: "0.85rem", lineHeight: 1.3 }}>
                      {item.name}
                    </p>
                    <p className="pra mb-0" style={{ fontSize: "0.72rem" }}>
                      {formatGhs(displayPrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="black fw_700 mb-0" style={{ fontSize: "0.85rem" }}>
                    {formatGhs(displayPrice * item.quantity)}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="d-flex justify-content-between mb-2 border-top pt-3">
            <span className="pra">Subtotal ({count} item{count === 1 ? "" : "s"})</span>
            <span className="black fw_700">{formatGhs(subtotal)}</span>
          </div>
          <div className="d-flex justify-content-between mb-3">
            <span className="pra">{fulfillment === "pickup" ? "Pickup" : "Delivery"}</span>
            <span className="black fw_700">
              {fulfillment === "pickup" ? "Free" : "On collection"}
            </span>
          </div>
          <div className="d-flex justify-content-between mb-4 border-top pt-3">
            <span className="black fw_800 fs-five">Total</span>
            <span className="fw_800 fs-four" style={{ color: "var(--p2-clr)" }}>
              {formatGhs(total)}
            </span>
          </div>

          {selectedBranch?.phone && (
            <div className="d-flex align-items-center gap-2 mb-3 rounded-3 p-2" style={{ background: "rgba(17, 87, 238, 0.04)" }}>
              <Phone size={14} style={{ color: "var(--p2-clr)" }} />
              <span style={{ fontSize: "0.75rem" }} className="pra">
                Branch: <a href={`tel:${selectedBranch.phone}`} className="black fw_600 text-decoration-none">{selectedBranch.phone}</a>
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="common-btn box-style p1-bg text-white w-100 rounded-5 py-3 fw_800 border-0 d-flex justify-content-center align-items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Placing order…
              </>
            ) : (
              <>Place order · {formatGhs(total)}</>
            )}
          </button>

          <p className="pra mb-0 mt-3 text-center" style={{ fontSize: "0.72rem", lineHeight: 1.5 }}>
            <MapPin size={11} className="me-1" />
            By placing this order you agree to our terms. A pharmacist will confirm prescription items by phone.
          </p>
        </div>
      </div>
    </form>
  )
}

function FulfillmentOption({
  active,
  onClick,
  icon,
  label,
  desc,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-100 text-start rounded-4 p-3 border-0"
      style={{
        border: active ? "2px solid var(--p1-clr)" : "1px solid rgba(0,0,0,0.08)",
        background: active ? "rgba(19, 236, 138, 0.06)" : "transparent",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <div className="d-flex align-items-center gap-2 mb-1">
        <span style={{ color: active ? "var(--p1-clr)" : "rgba(0,0,0,0.6)" }}>{icon}</span>
        <p className="black fw_800 mb-0" style={{ fontSize: "0.95rem" }}>{label}</p>
      </div>
      <p className="pra mb-0" style={{ fontSize: "0.78rem" }}>{desc}</p>
    </button>
  )
}
