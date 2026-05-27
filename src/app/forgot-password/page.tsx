"use client"

import { useState } from "react"
import Header from "@/components/medizen/Header"
import Footer from "@/components/medizen/Footer"
import PageTitle from "@/components/medizen/PageTitle"
import { motion } from "framer-motion"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? "sent" : "error")
    } catch {
      setStatus("error")
    }
  }

  return (
    <>
      <Header />
      <main className="position-relative overflow-hidden">
        <PageTitle title="Forgot Password" />
        <section className="section-padding position-relative" style={{ zIndex: 1 }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-5 col-md-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-lg-5 p-4 glass-card rounded-5 shadow-xl border-0 overflow-hidden position-relative"
                >
                  <div className="position-absolute top-0 start-0 w-100 p1-bg" style={{ height: '4px' }}></div>
                  <div className="text-center mb-4">
                    <div className="auth-icon mb-3 d-inline-flex p1-bg rounded-circle d-center shadow-lg"
                      style={{ width: '70px', height: '70px', fontSize: '1.5rem', color: '#fff' }}>
                      <i className="fas fa-envelope"></i>
                    </div>
                    <h2 className="black fw_800 mb-2">Reset Password</h2>
                    <p className="pra fs-seven">Enter your email and we'll send you a reset link.</p>
                  </div>

                  {status === "sent" ? (
                    <div className="text-center py-4">
                      <div style={{ fontSize: '3rem' }}>📧</div>
                      <h4 className="fw_800 mt-3 mb-2">Check your inbox!</h4>
                      <p className="pra fs-seven">If that email exists, a reset link has been sent. It expires in 1 hour.</p>
                      <Link href="/signin" className="p1-clr fw_700 fs-seven">← Back to Sign In</Link>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="row g-4">
                      {status === "error" && (
                        <div className="col-12">
                          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', color: '#dc2626' }}>
                            <i className="fas fa-exclamation-circle me-2"></i>
                            <span className="fs-eight">Something went wrong. Please try again.</span>
                          </div>
                        </div>
                      )}
                      <div className="col-12">
                        <label className="black mb-2 d-block fw_700 fs-seven">Email Address</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0 px-3 rounded-start-5">
                            <i className="far fa-envelope text-muted"></i>
                          </span>
                          <input type="email" className="form-control bg-light border-0 py-3 rounded-end-5"
                            placeholder="name@example.com" value={email}
                            onChange={e => setEmail(e.target.value)} required />
                        </div>
                      </div>
                      <div className="col-12">
                        <motion.button type="submit" disabled={status === "loading"}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="p1-bg text-white w-100 py-3 d-center gap-3 fs-six fw_800 rounded-5 shadow-lg border-0"
                          style={{ cursor: status === "loading" ? 'not-allowed' : 'pointer' }}>
                          {status === "loading" ? <><span className="spinner-border spinner-border-sm"></span> Sending...</> : "Send Reset Link"}
                        </motion.button>
                      </div>
                      <div className="col-12 text-center">
                        <Link href="/signin" className="p1-clr fs-eight fw_600">← Back to Sign In</Link>
                      </div>
                    </form>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
