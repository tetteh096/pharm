"use client"

import React, { Suspense, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { BrandLogo } from "@/components/brand/BrandLogo"

const LOGIN_IMAGE = "/photo/9b7fa25193e0b7efed42c0dc3f97061d.jpg"

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  )
}

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallback = searchParams.get("callbackUrl") || "/dashboard"
  const callbackUrl = (() => {
    try {
      return new URL(rawCallback).pathname || "/dashboard"
    } catch {
      return rawCallback.startsWith("/") ? rawCallback : "/dashboard"
    }
  })()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password. Please try again.")
      setLoading(false)
    } else {
      router.push(callbackUrl)
    }
  }

  return (
    <div
      className="signin-page d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        padding: "clamp(16px, 4vw, 40px)",
        background:
          "linear-gradient(135deg, #dbeafe 0%, #e0f2fe 45%, #ecfdf5 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="signin-card w-100 overflow-hidden bg-white"
        style={{
          maxWidth: 980,
          borderRadius: 28,
          boxShadow: "0 24px 64px rgba(9, 22, 42, 0.12)",
        }}
      >
        <div className="row g-0">
          {/* Image panel */}
          <div className="col-lg-5 d-none d-lg-block">
            <div
              className="position-relative h-100"
              style={{ minHeight: 580 }}
            >
              <Image
                src={LOGIN_IMAGE}
                alt="Enviro Pharmacy team"
                fill
                priority
                sizes="(min-width: 992px) 420px, 0px"
                style={{ objectFit: "cover", objectPosition: "center top" }}
              />
              <div
                className="position-absolute bottom-0 start-0 w-100 p-4"
                style={{
                  background:
                    "linear-gradient(to top, rgba(4,10,18,0.72) 0%, transparent 100%)",
                }}
              >
                <p
                  className="mb-1 text-white fw_700"
                  style={{ fontSize: "1.05rem" }}
                >
                  Enviro Pharmacy
                </p>
                <p
                  className="mb-0 text-white"
                  style={{ fontSize: "0.88rem", opacity: 0.85 }}
                >
                  Staff dashboard access
                </p>
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="col-lg-7">
            <div
              className="position-relative h-100 d-flex flex-column justify-content-center"
              style={{ padding: "clamp(28px, 5vw, 52px)" }}
            >
              <Link
                href="/"
                aria-label="Back to website"
                className="position-absolute d-flex align-items-center justify-content-center rounded-circle text-decoration-none"
                style={{
                  top: 20,
                  right: 20,
                  width: 36,
                  height: 36,
                  background: "#f1f5f9",
                  color: "#64748b",
                }}
              >
                <X size={18} />
              </Link>

              <div className="mb-4">
                <Link href="/" aria-label="Enviro Pharmacy home">
                  <BrandLogo variant="full" className="h-10 w-36 mb-4" />
                </Link>
                <h1
                  className="mb-2 fw_800 black"
                  style={{
                    fontSize: "clamp(1.75rem, 3vw, 2.15rem)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  Staff login
                </h1>
                <p className="mb-0 pra" style={{ fontSize: "0.95rem" }}>
                  Sign in to manage orders, inventory, and pharmacy operations.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#dc2626",
                    fontSize: "0.88rem",
                  }}
                >
                  <i className="fas fa-exclamation-circle" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                <div>
                  <label
                    htmlFor="signin-email"
                    className="d-block mb-2 fw_700 black"
                    style={{ fontSize: "0.88rem" }}
                  >
                    Email address
                  </label>
                  <input
                    id="signin-email"
                    type="email"
                    className="form-control w-100"
                    placeholder="name@enviropharmacy.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: "14px 16px",
                      fontSize: "0.95rem",
                      background: "#fff",
                    }}
                  />
                </div>

                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label
                      htmlFor="signin-password"
                      className="fw_700 black mb-0"
                      style={{ fontSize: "0.88rem" }}
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-decoration-none fw_600"
                      style={{ fontSize: "0.82rem", color: "var(--p2-clr)" }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="signin-password"
                    type="password"
                    className="form-control w-100"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: "14px 16px",
                      fontSize: "0.95rem",
                      background: "#fff",
                    }}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-100 border-0 fw_800 text-white"
                  style={{
                    borderRadius: 12,
                    padding: "15px 20px",
                    fontSize: "1rem",
                    background: loading
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #0d9488 0%, #13ec8a 100%)",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 10px 28px rgba(13, 148, 136, 0.28)",
                  }}
                >
                  {loading ? "Signing in…" : "Sign in"}
                </motion.button>
              </form>

              <p
                className="mb-0 mt-4 text-center"
                style={{ fontSize: "0.82rem", color: "#94a3b8" }}
              >
                For authorised staff only.{" "}
                <Link href="/" style={{ color: "var(--p2-clr)" }}>
                  Back to website
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
