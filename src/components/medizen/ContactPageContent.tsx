"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Navigation,
  Phone,
  Send,
} from "lucide-react"
import { buildWhatsAppUrl } from "@/lib/whatsapp"
import type { PublicWhatsAppBranch } from "@/lib/site-settings-shared"

import { submitContactForm } from "@/app/actions/contact"
import { useIdempotentFormSubmit } from "@/hooks/useIdempotentFormSubmit"
import {
  PHARMACY_BRANCHES,
  PHARMACY_EMAIL,
  PHARMACY_INSTAGRAM,
  PHARMACY_INSTAGRAM_HANDLE,
  PHARMACY_PRIMARY_PHONE,
  pharmacyPrimaryTelHref,
  type PharmacyBranch,
} from "@/data/pharmacy-branches"

const SUBJECT_OPTIONS = [
  "Stock availability",
  "Prescription support",
  "Delivery or pickup",
  "Branch directions",
  "General enquiry",
]

export function ContactPageContent({
  branches = PHARMACY_BRANCHES,
  contactEmail = PHARMACY_EMAIL,
  whatsappBranches = [],
}: {
  branches?: PharmacyBranch[]
  contactEmail?: string
  whatsappBranches?: PublicWhatsAppBranch[]
}) {
  const defaultBranchId = branches[0]?.id ?? "madina"
  const [selectedId, setSelectedId] = React.useState<string>(defaultBranchId)
  const selected =
    branches.find((b) => b.id === selectedId) ?? branches[0]
  const selectedWhatsApp =
    whatsappBranches.find((b) => b.id === selectedId && b.whatsapp) ?? null

  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    branchId: defaultBranchId,
    subject: SUBJECT_OPTIONS[0],
    message: "",
  })
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  )
  const [errorMsg, setErrorMsg] = React.useState("")
  const { beginSubmit, endSubmit, resetForNewSubmission } = useIdempotentFormSubmit()

  React.useEffect(() => {
    setForm((prev) => ({ ...prev, branchId: selectedId }))
  }, [selectedId])

  const setField =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const idempotencyKey = beginSubmit()
    if (!idempotencyKey) return

    setStatus("submitting")
    setErrorMsg("")
    try {
      const result = await submitContactForm({ ...form, idempotencyKey })
      if (result.success) {
        setStatus("success")
        setForm({
          fullName: "",
          email: "",
          phone: "",
          branchId: selectedId,
          subject: SUBJECT_OPTIONS[0],
          message: "",
        })
        resetForNewSubmission()
      } else {
        setStatus("error")
        setErrorMsg(result.error)
        endSubmit()
      }
    } catch {
      setStatus("error")
      setErrorMsg("Something went wrong. Please try again.")
      endSubmit()
    }
  }

  return (
    <>
      <section className="contact-section section-padding fix">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center">
              <span className="contact-eyebrow d-inline-block mb-3 px-4 py-2 rounded-pill fw_700">
                Get in touch
              </span>
              <h2 className="black fw_800 mb-3" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
                Pick a branch, then send us a message
              </h2>
              <p className="pra mb-0 mx-auto" style={{ maxWidth: 620, lineHeight: 1.75 }}>
                Call for urgent help, get directions, or use the form below for stock checks,
                prescription questions, and delivery support.
              </p>
            </div>
          </div>

          <div className="row g-4 mb-5">
            {branches.map((branch, index) => (
              <div key={branch.id} className="col-md-6 col-xl-3">
                <BranchCard
                  branch={branch}
                  active={branch.id === selectedId}
                  delay={index * 0.05}
                  onSelect={() => setSelectedId(branch.id)}
                />
              </div>
            ))}
          </div>

          <div className="row g-4 g-xl-5 align-items-stretch">
            <div className="col-lg-6">
              <div className="contact-surface h-100 rounded-4 overflow-hidden shadow-sm">
                <div className="p-4 p-md-5">
                  <div className="d-flex align-items-start gap-3 mb-4">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                      style={{
                        width: 48,
                        height: 48,
                        background: `${selected.accent}18`,
                        color: selected.accent,
                      }}
                    >
                      <MessageSquare size={22} />
                    </div>
                    <div>
                      <h3 className="black fw_800 mb-1">Send a message</h3>
                      <p className="pra mb-0" style={{ fontSize: "0.92rem" }}>
                        We usually reply within a few minutes.
                        {selectedWhatsApp ? (
                          <>
                            {" "}
                            For the fastest response,{" "}
                            <a
                              href={buildWhatsAppUrl(
                                selectedWhatsApp.whatsapp!,
                                `Hello ${selected.name.replace(" Branch", "")}, I have a question for Enviro Pharmacy.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="fw_700"
                              style={{ color: "var(--p2-clr)" }}
                            >
                              message us on WhatsApp
                            </a>
                            .
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>

                  {status === "success" ? (
                    <div
                      className="rounded-4 p-4 text-center"
                      style={{
                        background: "rgba(19, 236, 138, 0.08)",
                        border: "1px solid rgba(19, 236, 138, 0.25)",
                      }}
                    >
                      <p className="black fw_700 mb-2">Message sent</p>
                      <p className="pra mb-4" style={{ fontSize: "0.92rem" }}>
                        Thank you. Our team at {selected.name.replace(" Branch", "")} will
                        follow up within a few minutes.
                        {selectedWhatsApp ? (
                          <>
                            {" "}
                            You can also{" "}
                            <a
                              href={buildWhatsAppUrl(
                                selectedWhatsApp.whatsapp!,
                                `Hello ${selected.name.replace(" Branch", "")}, I just sent a message via your contact form.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="fw_700"
                              style={{ color: "var(--p2-clr)" }}
                            >
                              chat on WhatsApp
                            </a>{" "}
                            or call us for urgent help.
                          </>
                        ) : (
                          <> You can also call us directly for urgent help.</>
                        )}
                      </p>
                      <button
                        type="button"
                        className="common-btn box-style p2-bg text-white rounded-5 px-4 py-2 fw-bold border-0"
                        onClick={() => {
                          resetForNewSubmission()
                          setStatus("idle")
                        }}
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="contact-forms">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold text-muted mb-1">
                            Your name
                          </label>
                          <input
                            type="text"
                            required
                            value={form.fullName}
                            onChange={setField("fullName")}
                            placeholder="Full name"
                            className="form-control"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold text-muted mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            required
                            value={form.email}
                            onChange={setField("email")}
                            placeholder="you@email.com"
                            className="form-control"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold text-muted mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={setField("phone")}
                            placeholder="055…"
                            className="form-control"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold text-muted mb-1">
                            Branch
                          </label>
                          <select
                            value={form.branchId}
                            onChange={setField("branchId")}
                            className="form-select"
                          >
                            {branches.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                                {b.comingSoon ? " (Coming soon)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-semibold text-muted mb-1">
                            Subject
                          </label>
                          <select
                            value={form.subject}
                            onChange={setField("subject")}
                            className="form-select"
                          >
                            {SUBJECT_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-semibold text-muted mb-1">
                            Message
                          </label>
                          <textarea
                            required
                            rows={5}
                            value={form.message}
                            onChange={setField("message")}
                            placeholder="Tell us how we can help…"
                            className="form-control"
                          />
                        </div>
                        {status === "error" && errorMsg ? (
                          <div className="col-12">
                            <p className="text-danger small mb-0">{errorMsg}</p>
                          </div>
                        ) : null}
                        <div className="col-12 mt-2">
                          <button
                            type="submit"
                            disabled={status === "submitting"}
                            className="common-btn box-style p2-bg text-white w-100 rounded-5 py-3 fw-bold border-0 d-inline-flex align-items-center justify-content-center gap-2"
                          >
                            {status === "submitting" ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                Sending…
                              </>
                            ) : (
                              <>
                                Send message
                                <Send size={16} />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  <p className="pra mt-4 mb-0 text-center" style={{ fontSize: "0.82rem" }}>
                    Need a pharmacist consultation?{" "}
                    <Link href="/#book-consultation" className="fw_700" style={{ color: "var(--p2-clr)" }}>
                      Book a free consultation
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <BranchDetailPanel branch={selected} whatsapp={selectedWhatsApp} />
            </div>
          </div>

          <div className="row g-3 mt-5 pt-4 contact-divider">
            <div className="col-md-4">
              <ContactStrip
                icon={<Mail size={18} />}
                label="Email"
                href={`mailto:${contactEmail}`}
                value={contactEmail}
              />
            </div>
            <div className="col-md-4">
              <ContactStrip
                icon={<MessageSquare size={18} />}
                label="Instagram"
                href={PHARMACY_INSTAGRAM}
                value={PHARMACY_INSTAGRAM_HANDLE}
                external
              />
            </div>
            <div className="col-md-4">
              <ContactStrip
                icon={<Phone size={18} />}
                label="Call us"
                href={pharmacyPrimaryTelHref()}
                value={PHARMACY_PRIMARY_PHONE}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function BranchCard({
  branch,
  active,
  delay,
  onSelect,
}: {
  branch: PharmacyBranch
  active: boolean
  delay: number
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      viewport={{ once: true }}
      onClick={onSelect}
      className={`contact-branch-card w-100 h-100 text-start rounded-4 p-4 border-0${active ? " contact-branch-card--active" : ""}`}
      style={{
        border: active
          ? `2px solid ${branch.accent}`
          : undefined,
        boxShadow: active
          ? `0 18px 40px ${branch.accent}22`
          : undefined,
        cursor: "pointer",
      }}
    >
      <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
        <span
          className="d-inline-block px-2 py-1 rounded-pill fw_700"
          style={{
            background: `${branch.accent}18`,
            color: branch.accent,
            fontSize: "0.68rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {branch.comingSoon ? "Coming soon" : "Open"}
        </span>
        {active ? (
          <span className="small fw_700" style={{ color: branch.accent }}>
            Selected
          </span>
        ) : null}
      </div>
      <h4 className="black fw_800 mb-2" style={{ fontSize: "1.05rem" }}>
        {branch.name}
      </h4>
      <p className="pra mb-3" style={{ fontSize: "0.85rem", lineHeight: 1.55 }}>
        {branch.location}
      </p>
      <div className="d-flex align-items-center gap-2 mb-2 text-muted" style={{ fontSize: "0.82rem" }}>
        <Clock3 size={14} style={{ color: branch.accent }} />
        {branch.hours}
      </div>
      {branch.phone ? (
        <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: "0.82rem" }}>
          <Phone size={14} style={{ color: branch.accent }} />
          {branch.phone}
        </div>
      ) : (
        <span className="pra" style={{ fontSize: "0.82rem" }}>
          Phone coming soon
        </span>
      )}
    </motion.button>
  )
}

function BranchDetailPanel({
  branch,
  whatsapp,
}: {
  branch: PharmacyBranch
  whatsapp: PublicWhatsAppBranch | null
}) {
  return (
    <div className="contact-surface h-100 rounded-4 overflow-hidden shadow-sm d-flex flex-column">
      <div className="p-4 p-md-5 flex-grow-1">
        <span
          className="d-inline-block mb-2 px-3 py-1 rounded-pill fw_700"
          style={{
            background: `${branch.accent}14`,
            color: branch.accent,
            fontSize: "0.72rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Branch details
        </span>
        <h3 className="black fw_800 mb-2">{branch.name}</h3>
        <p className="pra mb-4" style={{ lineHeight: 1.7 }}>
          {branch.location}
        </p>

        <div className="d-flex flex-column gap-3 mb-4">
          <DetailRow icon={<Clock3 size={16} />} label="Hours" value={branch.hours} />
          {branch.gps ? (
            <DetailRow icon={<MapPin size={16} />} label="GhanaPost GPS" value={branch.gps} />
          ) : null}
          {branch.phone ? (
            <DetailRow icon={<Phone size={16} />} label="Phone" value={branch.phone} />
          ) : null}
          {whatsapp?.phone ? (
            <DetailRow icon={<MessageCircle size={16} />} label="WhatsApp" value={whatsapp.phone} />
          ) : null}
        </div>

        <div className="d-flex flex-wrap gap-2">
          {whatsapp?.whatsapp ? (
            <a
              href={buildWhatsAppUrl(
                whatsapp.whatsapp,
                `Hello ${branch.name.replace(" Branch", "")}, I would like some help from Enviro Pharmacy.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="common-btn box-style p2-bg text-white rounded-5 px-4 py-2 fw-bold text-decoration-none d-inline-flex align-items-center gap-2"
              style={{ fontSize: "0.88rem" }}
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>
          ) : null}
          {branch.phone ? (
            <a
              href={`tel:+233${branch.tel!.replace(/^0/, "")}`}
              className="common-btn box-style p1-bg text-white rounded-5 px-4 py-2 fw-bold text-decoration-none d-inline-flex align-items-center gap-2"
              style={{ fontSize: "0.88rem" }}
            >
              <Phone size={15} />
              Call branch
            </a>
          ) : null}
          <a
            href={branch.maps}
            target="_blank"
            rel="noopener noreferrer"
            className="common-btn box-style contact-directions-btn rounded-5 px-4 py-2 fw-bold text-decoration-none d-inline-flex align-items-center gap-2"
            style={{ fontSize: "0.88rem" }}
          >
            <Navigation size={15} />
            Get directions
          </a>
        </div>
      </div>

      <div className="contact-map-embed" style={{ height: 280, minHeight: 280 }}>
        <iframe
          title={`${branch.name} on Google Maps`}
          src={branch.mapEmbed}
          width="100%"
          height="100%"
          style={{ border: 0, display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="d-flex align-items-start gap-3">
      <div className="contact-detail-icon d-flex align-items-center justify-content-center rounded-2 flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: "0.06em" }}>
          {label}
        </div>
        <div className="black fw_700">{value}</div>
      </div>
    </div>
  )
}

function ContactStrip({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href: string
  external?: boolean
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="contact-strip contact-surface d-flex align-items-center gap-3 rounded-4 p-4 text-decoration-none h-100"
      style={{ color: "inherit" }}
    >
      <div className="contact-strip-icon d-flex align-items-center justify-content-center rounded-3 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="small text-muted fw-semibold">{label}</div>
        <div className="black fw_700 text-truncate">{value}</div>
      </div>
      <ArrowRight size={16} className="ms-auto text-muted flex-shrink-0" />
    </a>
  )
}
