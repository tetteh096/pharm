"use client"

import React, { Suspense, useState } from "react"
import Header from "@/components/medizen/Header"
import Footer from "@/components/medizen/Footer"
import PageTitle from "@/components/medizen/PageTitle"
import Link from "next/link"
import { motion } from "framer-motion"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

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
  // Strip any absolute origin so a localhost callbackUrl from next-auth never
  // redirects a production user back to localhost.
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
    <>
      <Header />
      <main className="position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none" style={{
          background: 'radial-gradient(circle at 5% 5%, rgba(19, 236, 138, 0.06) 0%, transparent 40%), radial-gradient(circle at 95% 95%, rgba(17, 87, 238, 0.06) 0%, transparent 40%)',
          zIndex: 0
        }}></div>

        <PageTitle title="Account Login" />

        <section className="signin-section section-padding position-relative" style={{ zIndex: 1 }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-5 col-md-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="auth-form-wrapper p-lg-5 p-4 glass-card rounded-5 shadow-xl border-0 overflow-hidden position-relative"
                >
                  <div className="position-absolute top-0 start-0 w-100 p1-bg" style={{ height: '4px' }}></div>

                  <div className="text-center mb-40">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 100 }}
                      className="auth-icon mb-3 d-inline-flex p1-bg rounded-circle d-center shadow-lg"
                      style={{ width: '70px', height: '70px', fontSize: '1.5rem', color: '#fff' }}
                    >
                      <i className="fas fa-lock"></i>
                    </motion.div>
                    <h2 className="black fw_800 mb-2">Welcome Back</h2>
                    <p className="pra fs-seven">Enter your credentials to access your Enviro Pharmacy account</p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="alert d-flex align-items-center gap-2 mb-4"
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', color: '#dc2626' }}
                    >
                      <i className="fas fa-exclamation-circle"></i>
                      <span className="fs-eight">{error}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="row g-4">
                    <div className="col-lg-12">
                      <label className="black mb-2 d-block fw_700 fs-seven">Email Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-0 px-3 rounded-start-5">
                          <i className="far fa-envelope text-muted"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control bg-light border-0 py-3 rounded-end-5"
                          placeholder="name@example.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="black mb-0 fw_700 fs-seven">Password</label>
                        <Link href="/forgot-password" className="p1-clr fs-eight fw_600">Forgot Password?</Link>
                      </div>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-0 px-3 rounded-start-5">
                          <i className="fas fa-key text-muted"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control bg-light border-0 py-3 rounded-end-5"
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="first-box p1-bg text-white w-100 py-3 d-center gap-3 fs-six fw_800 rounded-5 shadow-lg border-0"
                        style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            Signing in...
                          </>
                        ) : (
                          <>Sign In Now <i className="fas fa-sign-in-alt"></i></>
                        )}
                      </motion.button>
                    </div>
                  </form>
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
