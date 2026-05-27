"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Header from "@/components/medizen/Header"
import Footer from "@/components/medizen/Footer"
import PageTitle from "@/components/medizen/PageTitle"
import { motion } from "framer-motion"
import Link from "next/link"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  )
}

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!token) router.replace("/signin")
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setErrorMsg("Passwords do not match."); return }
    if (password.length < 8) { setErrorMsg("Password must be at least 8 characters."); return }

    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus("success")
        setTimeout(() => router.push("/signin"), 2500)
      } else {
        setErrorMsg(data.error || "Reset failed.")
        setStatus("error")
      }
    } catch {
      setStatus("error")
      setErrorMsg("Something went wrong. Please try again.")
    }
  }

  return (
    <>
      <Header />
      <main className="position-relative overflow-hidden">
        <PageTitle title="Set New Password" />
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
                      <i className="fas fa-lock"></i>
                    </div>
                    <h2 className="black fw_800 mb-2">New Password</h2>
                    <p className="pra fs-seven">Choose a strong password for your account.</p>
                  </div>

                  {status === "success" ? (
                    <div className="text-center py-4">
                      <div style={{ fontSize: '3rem' }}>✅</div>
                      <h4 className="fw_800 mt-3 mb-2">Password Updated!</h4>
                      <p className="pra fs-seven">Redirecting you to sign in...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="row g-4">
                      {errorMsg && (
                        <div className="col-12">
                          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', color: '#dc2626' }}>
                            <i className="fas fa-exclamation-circle me-2"></i>
                            <span className="fs-eight">{errorMsg}</span>
                          </div>
                        </div>
                      )}
                      <div className="col-12">
                        <label className="black mb-2 d-block fw_700 fs-seven">New Password</label>
                        <input type="password" className="form-control bg-light border-0 py-3 rounded-5"
                          placeholder="Min. 8 characters" value={password}
                          onChange={e => setPassword(e.target.value)} required minLength={8} />
                      </div>
                      <div className="col-12">
                        <label className="black mb-2 d-block fw_700 fs-seven">Confirm Password</label>
                        <input type="password" className="form-control bg-light border-0 py-3 rounded-5"
                          placeholder="Re-enter your password" value={confirm}
                          onChange={e => setConfirm(e.target.value)} required />
                      </div>
                      <div className="col-12">
                        <motion.button type="submit" disabled={status === "loading"}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="p1-bg text-white w-100 py-3 d-center gap-3 fs-six fw_800 rounded-5 shadow-lg border-0"
                          style={{ cursor: status === "loading" ? 'not-allowed' : 'pointer' }}>
                          {status === "loading"
                            ? <><span className="spinner-border spinner-border-sm"></span> Updating...</>
                            : "Set New Password"}
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
