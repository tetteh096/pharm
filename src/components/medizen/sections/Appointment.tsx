"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import CommonButton from "../CommonButton";
import { submitConsultationRequest } from "@/app/actions/consultation";
import { useIdempotentFormSubmit } from "@/hooks/useIdempotentFormSubmit";

const trusts = [
  { icon: "fas fa-user-md",        label: "Expert Staff",       sub: "Qualified Pharmacists"   },
  { icon: "fas fa-clock",          label: "Available 24 / 7",   sub: "Madina Branch Always Open" },
  { icon: "fas fa-shield-alt",     label: "Safe & Reliable",    sub: "FDA-Compliant Dispensing"  },
  { icon: "fas fa-map-marker-alt", label: "Four Branches", sub: "Madina · Odorkor · Sakumono · Santeo" },
];

const Appointment = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    medicationInterest: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { beginSubmit, endSubmit, resetForNewSubmission } = useIdempotentFormSubmit();

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const idempotencyKey = beginSubmit();
    if (!idempotencyKey) return;

    setStatus("submitting");
    setErrorMsg("");
    try {
      const result = await submitConsultationRequest({ ...form, idempotencyKey });
      if (result.success) {
        setStatus("success");
        setForm({ fullName: "", email: "", phone: "", medicationInterest: "", message: "" });
        resetForNewSubmission();
      } else {
        setStatus("error");
        setErrorMsg(result.error);
        endSubmit();
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
      endSubmit();
    }
  }
  return (
    <section
      id="book-consultation"
      className="appt-parallax position-relative"
      style={{
        backgroundImage: "url('/this.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark wash overlay — sits on top of the fixed photo */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ background: "rgba(4,10,18,0.72)", zIndex: 1 }}
      />

      {/* Content */}
      <div className="container position-relative py-4" style={{ zIndex: 2 }}>
        <div className="row g-4 align-items-center">

          {/* ── LEFT: headline + trust badges ── */}
          <div className="col-lg-6">
            {/* Eyebrow */}
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="d-inline-block fw_700 mb-3 px-4 py-2 rounded-5 text-white"
              style={{ background: "var(--p1-clr)", fontSize: "0.8rem", letterSpacing: "0.07em" }}
            >
              CONTACT OUR EXPERTS
            </motion.span>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              viewport={{ once: true }}
              className="fw_800 text-white mb-3"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.2 }}
            >
              Request a{" "}
              <span style={{ color: "var(--p1-clr)" }}>Consultation</span>
              <br />with Our Team
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="mb-5"
              style={{ color: "rgba(255,255,255,0.72)", fontSize: "1rem", lineHeight: 1.8, maxWidth: "460px" }}
            >
              Fill in the form and one of our certified pharmacists will reach
              out to help you with medication advice, prescription queries, or
              general health guidance.
            </motion.p>

            {/* Trust grid */}
            <div className="row g-3">
              {trusts.map((t, i) => (
                <div className="col-6" key={i}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
                    viewport={{ once: true }}
                    className="d-flex align-items-center gap-3 p-3 rounded-4"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.13)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{ width: 44, height: 44, background: "rgba(19,236,138,0.18)" }}
                    >
                      <i className={t.icon} style={{ color: "var(--p1-clr)", fontSize: "1.1rem" }} />
                    </div>
                    <div>
                      <p className="mb-0 fw_700 text-white" style={{ fontSize: "0.88rem" }}>{t.label}</p>
                      <p className="mb-0" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)" }}>{t.sub}</p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: glassmorphism form ── */}
          <div className="col-lg-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="p-5 rounded-4"
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(18px)",
                border: "1.5px solid rgba(255,255,255,0.18)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
              }}
            >
              <h4 className="fw_800 text-white mb-4" style={{ fontSize: "1.35rem" }}>
                Book a Free Consultation
              </h4>

              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: 64, height: 64, background: "rgba(19,236,138,0.18)" }}
                  >
                    <i className="fas fa-check" style={{ color: "var(--p1-clr)", fontSize: "1.6rem" }} />
                  </div>
                  <h5 className="fw_800 text-white mb-2">Request Received!</h5>
                  <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                    Thank you! A confirmation has been sent to your email.
                    One of our pharmacists will reach out to you shortly.
                  </p>
                  <button
                    onClick={() => {
                      resetForNewSubmission();
                      setStatus("idle");
                    }}
                    className="btn mt-3 px-4 py-2 rounded-4 fw_700"
                    style={{ background: "var(--p1-clr)", color: "#0a0a0a", border: "none", fontSize: "0.85rem" }}
                  >
                    Submit another request
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-3">
                    {[
                      { placeholder: "Your Full Name",      type: "text",  icon: "fas fa-user",     field: "fullName"           },
                      { placeholder: "Email Address",       type: "email", icon: "fas fa-envelope", field: "email"              },
                      { placeholder: "Phone Number",        type: "text",  icon: "fas fa-phone",    field: "phone"              },
                      { placeholder: "Medication Interest", type: "text",  icon: "fas fa-pills",    field: "medicationInterest" },
                    ].map((inp, idx) => (
                      <div className="col-6" key={idx}>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + idx * 0.08 }}
                          viewport={{ once: true }}
                          className="position-relative"
                        >
                          <i
                            className={inp.icon}
                            style={{
                              position: "absolute",
                              left: "14px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "var(--p1-clr)",
                              fontSize: "0.85rem",
                              zIndex: 2,
                            }}
                          />
                          <input
                            type={inp.type}
                            placeholder={inp.placeholder}
                            value={form[inp.field as keyof typeof form]}
                            onChange={set(inp.field as keyof typeof form)}
                            required={inp.field !== "medicationInterest"}
                            className="appt-input w-100 rounded-3 py-3 pe-3"
                            style={{ paddingLeft: "38px" }}
                          />
                        </motion.div>
                      </div>
                    ))}

                    <div className="col-12">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        viewport={{ once: true }}
                        className="position-relative"
                      >
                        <i
                          className="fas fa-comment-dots"
                          style={{
                            position: "absolute",
                            left: "14px",
                            top: "16px",
                            color: "var(--p1-clr)",
                            fontSize: "0.85rem",
                            zIndex: 2,
                          }}
                        />
                        <textarea
                          placeholder="How can we help you? (Message or Instructions)"
                          rows={4}
                          value={form.message}
                          onChange={set("message")}
                          required
                          className="appt-input w-100 rounded-3 py-3 pe-3"
                          style={{ paddingLeft: "38px", resize: "none" }}
                        />
                      </motion.div>
                    </div>

                    {status === "error" && errorMsg && (
                      <div className="col-12">
                        <div
                          className="rounded-3 px-3 py-2"
                          style={{ background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", fontSize: "0.85rem" }}
                        >
                          <i className="fas fa-exclamation-circle me-2" />
                          {errorMsg}
                        </div>
                      </div>
                    )}

                    <div className="col-12">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.75 }}
                        viewport={{ once: true }}
                      >
                        <CommonButton
                          type="submit"
                          disabled={status === "submitting"}
                          className="first-box w-100 py-3 d-center gap-3 fs-six fw_700 rounded-4 appt-submit"
                        >
                          {status === "submitting" ? (
                            <>Sending…&nbsp;<i className="fas fa-spinner fa-spin" /></>
                          ) : (
                            <>Submit Your Request&nbsp;<i className="fas fa-paper-plane" /></>
                          )}
                        </CommonButton>
                      </motion.div>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </div>

        </div>
      </div>

    </section>
  );
};

export default Appointment;
