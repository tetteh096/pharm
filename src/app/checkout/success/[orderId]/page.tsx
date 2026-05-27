import Link from "next/link"
import { notFound } from "next/navigation"
import Header from "@/components/medizen/Header"
import Footer from "@/components/medizen/Footer"
import { getOrderForReceipt } from "@/app/actions/storefront"
import {
  CheckCircle2,
  Phone,
  Package,
  Clock3,
  Printer,
  MapPin,
  Navigation as NavigationIcon,
} from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Order confirmed | Enviro Pharmacy",
}

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const order = await getOrderForReceipt(orderId)
  if (!order) notFound()

  // Backwards-compat: older orders encoded fulfillment into paymentMethod as
  // "CASH_ON_DELIVERY|DELIVERY". New orders store it in its own column.
  const [paymentRaw, legacyFulfillment] = (order.paymentMethod ?? "").split("|")
  const payment = paymentRaw
  const fulfillment = order.fulfillmentType ?? legacyFulfillment ?? null
  const isPickup = fulfillment === "PICKUP"
  const hasGps =
    typeof order.deliveryLat === "number" && typeof order.deliveryLng === "number"
  const customerPhone = order.customer.phone ?? "Phone not provided"

  return (
    <>
      <Header />
      <main className="bg-light/30" style={{ minHeight: "70vh" }}>
        <section className="section-padding py-100">
          <div className="container" style={{ maxWidth: 820 }}>
            <div
              className="text-center mb-5 p-5 rounded-4"
              style={{
                background: "linear-gradient(135deg, rgba(19, 236, 138, 0.08), rgba(17, 87, 238, 0.05))",
                border: "1px solid rgba(19, 236, 138, 0.2)",
              }}
            >
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                style={{
                  width: 88,
                  height: 88,
                  background: "rgba(19, 236, 138, 0.15)",
                }}
              >
                <CheckCircle2 size={56} style={{ color: "var(--p1-clr)" }} />
              </div>
              <h1 className="black fw_800 mb-2">Thank you, {order.customer.name.split(" ")[0]}!</h1>
              <p className="pra mb-3" style={{ fontSize: "1rem" }}>
                Your order has been received. A pharmacist will contact you shortly to confirm.
              </p>
              <p className="black fw_800 mb-0" style={{ fontSize: "1.2rem" }}>
                Order number: <span style={{ color: "var(--p2-clr)" }}>{order.orderNumber}</span>
              </p>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <InfoCard
                  icon={<Package size={20} style={{ color: "var(--p1-clr)" }} />}
                  title="Order status"
                  value="Pending confirmation"
                />
              </div>
              <div className="col-md-4">
                <InfoCard
                  icon={<Clock3 size={20} style={{ color: "var(--p2-clr)" }} />}
                  title={isPickup ? "Ready for pickup" : "Delivery"}
                  value={isPickup ? "Within 30 minutes" : "We will call you"}
                />
              </div>
              <div className="col-md-4">
                <InfoCard
                  icon={<Phone size={20} style={{ color: "var(--p1-clr)" }} />}
                  title="We will call"
                  value={customerPhone}
                />
              </div>
            </div>

            <div
              className="p-4 rounded-4 mb-4"
              style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
                <h4 className="black fw_800 mb-0">Order summary</h4>
                <button
                  type="button"
                  className="d-none d-md-inline-flex align-items-center gap-2 border-0 bg-transparent fw_700"
                  style={{ color: "var(--p2-clr)" }}
                  // Print uses inline onClick; this page is a server component, so render as a plain button.
                >
                  <Printer size={16} />
                  <span style={{ fontSize: "0.85rem" }}>Print receipt</span>
                </button>
              </div>

              {order.items.map((item, i) => (
                <div key={i} className="d-flex justify-content-between mb-2">
                  <span className="pra">
                    {item.productName}{" "}
                    <span className="black fw_600">× {item.quantity}</span>
                  </span>
                  <span className="black fw_700">{item.lineLabel}</span>
                </div>
              ))}

              <div className="d-flex justify-content-between border-top pt-3 mt-3">
                <span className="black fw_800 fs-five">Total</span>
                <span className="fw_800 fs-four" style={{ color: "var(--p2-clr)" }}>
                  {order.totalLabel}
                </span>
              </div>

              {payment && (
                <p className="pra mb-0 mt-3" style={{ fontSize: "0.85rem" }}>
                  <strong className="black">Payment method:</strong>{" "}
                  {paymentLabel(payment)}
                </p>
              )}
            </div>

            {!isPickup && (order.deliveryAddress || hasGps) && (
              <div
                className="p-4 rounded-4 mb-4"
                style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.06)" }}
              >
                <div className="d-flex align-items-center gap-2 mb-3">
                  <MapPin size={18} style={{ color: "var(--p1-clr)" }} />
                  <h5 className="black fw_800 mb-0">Delivery location</h5>
                </div>

                {order.deliveryAddress && (
                  <p className="pra mb-2" style={{ lineHeight: 1.6 }}>
                    {order.deliveryAddress}
                  </p>
                )}

                {hasGps && (
                  <>
                    <div
                      className="rounded-3 overflow-hidden border mb-3"
                      style={{ height: 220, background: "#f4f6f8" }}
                    >
                      <iframe
                        title="Delivery location preview"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${(order.deliveryLng! - 0.005)},${(order.deliveryLat! - 0.0035)},${(order.deliveryLng! + 0.005)},${(order.deliveryLat! + 0.0035)}&layer=mapnik&marker=${order.deliveryLat},${order.deliveryLng}`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                      />
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLat},${order.deliveryLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2 text-decoration-none fw_700"
                        style={{
                          background: "var(--p2-clr)",
                          color: "#fff",
                          fontSize: "0.8rem",
                        }}
                      >
                        <NavigationIcon size={14} />
                        Open in Google Maps
                      </a>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${order.deliveryLat}&mlon=${order.deliveryLng}#map=17/${order.deliveryLat}/${order.deliveryLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2 text-decoration-none fw_700"
                        style={{
                          background: "rgba(0,0,0,0.06)",
                          color: "#09162a",
                          fontSize: "0.8rem",
                        }}
                      >
                        <MapPin size={14} />
                        OpenStreetMap
                      </a>
                      <span
                        className="pra align-self-center"
                        style={{ fontSize: "0.72rem", opacity: 0.7 }}
                      >
                        GPS: {order.deliveryLat!.toFixed(5)}, {order.deliveryLng!.toFixed(5)}
                      </span>
                    </div>
                  </>
                )}

                {order.deliveryNotes && (
                  <p className="pra mb-0 mt-3" style={{ fontSize: "0.82rem" }}>
                    <strong className="black">Notes:</strong> {order.deliveryNotes}
                  </p>
                )}
              </div>
            )}

            <div
              className="p-4 rounded-4 mb-4"
              style={{ background: "rgba(17, 87, 238, 0.04)", border: "1px solid rgba(17, 87, 238, 0.12)" }}
            >
              <h5 className="black fw_800 mb-2">What happens next?</h5>
              <ol className="pra mb-0 ps-3" style={{ lineHeight: 1.8 }}>
                <li>A pharmacist reviews your order and confirms availability.</li>
                <li>We call <span className="black fw_700">{customerPhone}</span> to confirm details.</li>
                <li>{isPickup ? "Come pick up your order at the branch you selected." : "We arrange delivery to your address."}</li>
                <li>Payment is collected on pickup / delivery (unless paid by mobile money).</li>
              </ol>
            </div>

            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link
                href="/shop"
                className="common-btn box-style first-box rounded-5 px-4 py-3 fw_800 border-0"
              >
                Continue shopping
              </Link>
              <a
                href="tel:+233554612072"
                className="common-btn box-style p1-bg text-white rounded-5 px-4 py-3 fw_800 border-0 d-inline-flex align-items-center gap-2 text-decoration-none"
              >
                <Phone size={16} />
                Call Madina branch
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function paymentLabel(method: string): string {
  switch (method) {
    case "CASH_ON_DELIVERY":
      return "Cash on delivery / on pickup"
    case "MOBILE_MONEY":
      return "Mobile money"
    default:
      return method
  }
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode
  title: string
  value: string
}) {
  return (
    <div
      className="rounded-4 p-3 h-100 d-flex align-items-start gap-3"
      style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.06)" }}
    >
      <div
        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
        style={{
          width: 40,
          height: 40,
          background: "rgba(19, 236, 138, 0.08)",
        }}
      >
        {icon}
      </div>
      <div>
        <p className="pra mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {title}
        </p>
        <p className="black fw_700 mb-0" style={{ fontSize: "0.95rem" }}>
          {value}
        </p>
      </div>
    </div>
  )
}
