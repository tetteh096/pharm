"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Send, X, ChevronLeft, MapPin } from "lucide-react"
import { PHARMACY_BRANCHES } from "@/data/pharmacy-branches"
import { buildWhatsAppUrl } from "@/lib/whatsapp"
import type { PublicSiteSettings, PublicWhatsAppBranch } from "@/lib/site-settings-shared"
import { buildPublicSiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/site-settings-shared"

type Step = "closed" | "pick" | "compose"

const FALLBACK_BRANCHES = buildPublicSiteSettings(DEFAULT_SITE_SETTINGS).whatsappBranches

export function WhatsAppChatWidget() {
  const [step, setStep] = React.useState<Step>("closed")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState("")
  const [branches, setBranches] =
    React.useState<PublicWhatsAppBranch[]>(FALLBACK_BRANCHES)

  React.useEffect(() => {
    let cancelled = false
    fetch("/api/public/site-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PublicSiteSettings | null) => {
        if (!cancelled && data?.whatsappBranches?.length) {
          setBranches(data.whatsappBranches)
        }
      })
      .catch(() => {
        /* keep fallback */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const selected = branches.find((b) => b.id === selectedId) ?? null
  const branchMeta = (id: string) => PHARMACY_BRANCHES.find((b) => b.id === id)

  const closeAll = () => {
    setStep("closed")
    setSelectedId(null)
    setMessage("")
  }

  const openPicker = () => setStep("pick")

  const pickBranch = (id: string) => {
    const branch = branches.find((b) => b.id === id)
    if (!branch?.whatsapp) return
    setSelectedId(id)
    setStep("compose")
  }

  const sendToWhatsApp = () => {
    if (!selected?.whatsapp) return
    const url = buildWhatsAppUrl(
      selected.whatsapp,
      message.trim() ||
        `Hello ${selected.name.replace(" Branch", "")}, I would like some help from Enviro Pharmacy.`
    )
    window.open(url, "_blank", "noopener,noreferrer")
    closeAll()
  }

  return (
    <div className="whatsapp-widget-root" aria-live="polite">
      <AnimatePresence>
        {step === "compose" && selected ? (
          <motion.div
            key="compose-panel"
            className="whatsapp-compose-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            <div className="whatsapp-compose-header">
              <button
                type="button"
                className="whatsapp-icon-btn"
                onClick={() => {
                  setStep("pick")
                  setMessage("")
                }}
                aria-label="Back to branches"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="whatsapp-compose-title">{selected.name}</p>
                <p className="whatsapp-compose-sub">
                  <MapPin size={12} className="inline mr-1" />
                  {selected.location}
                </p>
              </div>
              <button
                type="button"
                className="whatsapp-icon-btn"
                onClick={closeAll}
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            <label className="whatsapp-compose-label" htmlFor="whatsapp-message">
              Your message
            </label>
            <textarea
              id="whatsapp-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${selected.name.replace(" Branch", "")}, I need help with…`}
              className="whatsapp-compose-input"
            />

            <button type="button" className="whatsapp-send-btn" onClick={sendToWhatsApp}>
              Send on WhatsApp
              <Send size={16} />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {step === "pick"
          ? branches.map((branch, index) => {
              const disabled = !branch.whatsapp
              const accent = branchMeta(branch.id)?.accent ?? "#13ec8a"
              return (
                <motion.button
                  key={branch.id}
                  type="button"
                  className={`whatsapp-branch-fab${disabled ? " is-disabled" : ""}`}
                  style={{ ["--branch-accent" as string]: accent }}
                  initial={{ opacity: 0, y: 16, scale: 0.6 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    bottom: `${92 + index * 68}px`,
                  }}
                  exit={{ opacity: 0, y: 10, scale: 0.6 }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 26,
                    delay: index * 0.05,
                  }}
                  onClick={() => pickBranch(branch.id)}
                  disabled={disabled}
                  aria-label={
                    disabled
                      ? `${branch.name} — coming soon`
                      : `Chat with ${branch.name} on WhatsApp`
                  }
                  title={branch.name}
                >
                  <span className="whatsapp-branch-fab-initial">
                    {branch.name.charAt(0)}
                  </span>
                  <span className="whatsapp-branch-fab-label">
                    {branch.name.replace(" Branch", "")}
                  </span>
                </motion.button>
              )
            })
          : null}
      </AnimatePresence>

      <motion.button
        type="button"
        className={`whatsapp-main-fab${step !== "closed" ? " is-open" : ""}`}
        onClick={() => {
          if (step === "closed") openPicker()
          else closeAll()
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-expanded={step !== "closed"}
        aria-label={step === "closed" ? "Open WhatsApp chat" : "Close WhatsApp chat"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {step === "closed" ? (
            <motion.span
              key="wa-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="d-flex align-items-center justify-content-center"
            >
              <i className="fab fa-whatsapp" style={{ fontSize: "1.65rem" }} aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="d-flex"
            >
              <X size={26} strokeWidth={2.2} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
