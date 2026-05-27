"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

/* ─────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────── */

const pharmacists = [
  {
    id: 1,
    name: "Amara Boateng",
    role: "Lead Pharmacist",
    qualification: "B.Pharm, MRPharmS",
    branch: "Madina Branch",
    icon: "fas fa-mortar-pestle",
    accent: "var(--p1-clr)",
    bio: "With over 12 years of dispensing excellence, Amara leads our pharmacy operations and ensures every prescription meets the highest safety standards before it reaches your hands.",
    specialties: ["Drug Interactions", "Paediatric Dosing", "Prescription Review"],
  },
  {
    id: 2,
    name: "Kwame Mensah",
    role: "Health & Wellness Specialist",
    qualification: "B.Pharm, Dip. Nutrition",
    branch: "Odorkor Branch",
    icon: "fas fa-leaf",
    accent: "var(--p2-clr)",
    bio: "Kwame bridges pharmacy and lifestyle medicine, guiding patients on supplements, chronic disease management, and preventive health — turning your pharmacy visit into a wellness consultation.",
    specialties: ["Supplements", "Chronic Disease", "Preventive Care"],
  },
  {
    id: 3,
    name: "Isha Patel",
    role: "Clinical Pharmacist",
    qualification: "PharmD, BCPS",
    branch: "Madina Branch",
    icon: "fas fa-stethoscope",
    accent: "var(--p1-clr)",
    bio: "Isha specialises in clinical pharmacy and patient counselling. She works closely with physicians to optimise drug therapies and reduce adverse effects for high-risk patients.",
    specialties: ["Patient Counselling", "Drug Therapy", "Hospital Liaison"],
  },
  {
    id: 4,
    name: "Nana Asante",
    role: "Pharmacy Technician",
    qualification: "Dip. Pharmacy Tech",
    branch: "Madina Branch",
    icon: "fas fa-pills",
    accent: "var(--p2-clr)",
    bio: "Nana is the backbone of our dispensing floor. Fast, meticulous, and friendly — she ensures your orders are ready accurately and on time, every time.",
    specialties: ["Dispensing", "Inventory", "Patient Service"],
  },
  {
    id: 5,
    name: "Comfort Darko",
    role: "Pharmacy Technician",
    qualification: "Dip. Pharmacy Tech",
    branch: "Odorkor Branch",
    icon: "fas fa-hand-holding-medical",
    accent: "var(--p1-clr)",
    bio: "Comfort brings warmth and professionalism to the Odorkor branch. She is especially skilled at supporting elderly patients with medication routines and refill reminders.",
    specialties: ["Elder Care", "Refill Management", "OTC Advisory"],
  },
];

/* ─────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────── */
function TeamHero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "420px",
        background: "linear-gradient(135deg, #040a12 0%, #0a1628 60%, #091320 100%)",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        paddingTop: "120px",
        paddingBottom: "80px",
      }}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(19,236,138,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(19,236,138,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />
      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "4px",
          height: "100%",
          background: "linear-gradient(to bottom, var(--p1-clr), var(--p2-clr))",
        }}
      />

      <div className="container position-relative">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <div
              className="d-inline-flex align-items-center gap-2 mb-4 px-4 py-2 rounded-5"
              style={{
                background: "rgba(19,236,138,0.12)",
                border: "1px solid rgba(19,236,138,0.25)",
              }}
            >
              <i className="fas fa-user-md" style={{ color: "var(--p1-clr)", fontSize: "0.85rem" }} />
              <span
                style={{
                  color: "var(--p1-clr)",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Meet Our Team
              </span>
            </div>
            <h1
              className="fw_900 mb-4"
              style={{
                color: "#fff",
                fontSize: "clamp(2rem, 4.5vw, 3.4rem)",
                lineHeight: 1.15,
              }}
            >
              Dedicated Professionals,{" "}
              <span style={{ color: "var(--p1-clr)" }}>Committed</span>{" "}
              to Your Health
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "1.05rem",
                lineHeight: 1.8,
                maxWidth: "520px",
              }}
            >
              From our founder to our pharmacy technicians, every member of the
              Enviro team is here with one purpose — to serve you with expertise
              and genuine care.
            </p>
          </div>

          {/* Stats strip */}
          <div className="col-lg-5">
            <div className="row g-3">
              {[
                { num: "2", label: "Branches", icon: "fas fa-map-marker-alt", accent: "var(--p1-clr)" },
                { num: "24/7", label: "Madina Open", icon: "fas fa-clock", accent: "var(--p2-clr)" },
                { num: "50+", label: "Staff", icon: "fas fa-users", accent: "var(--p1-clr)" },
                { num: "20+", label: "Yrs Experience", icon: "fas fa-award", accent: "var(--p2-clr)" },
              ].map((s, i) => (
                <div className="col-6" key={i}>
                  <div
                    className="p-3 rounded-4 text-center"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${s.accent}25`,
                    }}
                  >
                    <i className={s.icon} style={{ color: s.accent, fontSize: "1.3rem", marginBottom: "8px", display: "block" }} />
                    <div className="fw_900" style={{ color: "#fff", fontSize: "1.5rem", lineHeight: 1 }}>{s.num}</div>
                    <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.78rem", marginTop: "4px" }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   CEO MESSAGE
───────────────────────────────────────────────── */
function CeoMessage() {
  return (
    <section className="section-padding body-bg" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
      <div className="container">
        <div className="row g-5 align-items-center">
          {/* Image */}
          <div className="col-lg-5">
            <div
              className="position-relative rounded-4 overflow-hidden"
              style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.14)" }}
            >
              <img
                src="/youy.jpg"
                alt="Benjamin Owusu – CEO & Founder"
                className="w-100 rounded-4"
                style={{ objectFit: "cover", maxHeight: "480px", display: "block" }}
              />
              {/* Name card overlay */}
              <div
                className="position-absolute bottom-0 start-0 w-100 px-4 py-3"
                style={{
                  background: "linear-gradient(to top, rgba(4,10,18,0.88) 0%, transparent 100%)",
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{
                      width: 44, height: 44,
                      background: "var(--p1-clr)",
                      fontSize: "1.1rem", color: "#000",
                    }}
                  >
                    <i className="fas fa-crown" />
                  </div>
                  <div>
                    <div className="fw_800" style={{ color: "#fff", fontSize: "1rem" }}>Benjamin Owusu</div>
                    <div style={{ color: "var(--p1-clr)", fontSize: "0.78rem", fontWeight: 700 }}>CEO & Founder</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="col-lg-7">
            <div
              className="d-inline-flex align-items-center gap-2 mb-4 px-4 py-2 rounded-5"
              style={{
                background: "rgba(19,236,138,0.10)",
                border: "1px solid rgba(19,236,138,0.22)",
              }}
            >
              <i className="fas fa-quote-left" style={{ color: "var(--p1-clr)", fontSize: "0.85rem" }} />
              <span style={{ color: "var(--p1-clr)", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                A Word From Our CEO
              </span>
            </div>

            <h2 className="black fw_800 mb-4" style={{ fontSize: "clamp(1.7rem, 3vw, 2.4rem)", lineHeight: 1.2 }}>
              "Healthcare should be accessible, personal, and trustworthy."
            </h2>

            <div className="d-flex flex-column gap-4">
              <p className="pra mb-0" style={{ lineHeight: 1.9, color: "rgba(0,0,0,0.72)", fontSize: "1.02rem" }}>
                At Enviro Pharmacy, we were built on a conviction — that every person in our community deserves
                genuine medications, honest counsel, and a pharmacy that genuinely cares. From our very first
                customer in Madina to the thousands of families we now serve across Accra, that conviction has
                never changed.
              </p>
              <p className="pra mb-0" style={{ lineHeight: 1.9, color: "rgba(0,0,0,0.72)", fontSize: "1.02rem" }}>
                We operate two branches so you are never far from quality care. Our Madina branch is open{" "}
                <strong>24 hours a day</strong> because illness does not wait for morning. Every interaction you
                have with our team reflects our mission: to serve you the same way we would serve our own family.
              </p>
              <p className="pra mb-0" style={{ lineHeight: 1.9, color: "rgba(0,0,0,0.72)", fontSize: "1.02rem" }}>
                Thank you for trusting Enviro Pharmacy. We do not take that trust lightly.
              </p>
            </div>

            {/* Signature block */}
            <div
              className="mt-5 pt-4 d-flex align-items-center gap-4"
              style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
            >
              <div>
                <div
                  className="fw_900 mb-1"
                  style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "1.6rem",
                    color: "var(--p2-clr)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Benjamin Owusu
                </div>
                <div style={{ color: "rgba(0,0,0,0.5)", fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  CEO & Founder — Enviro Pharmacy
                </div>
              </div>
              <div
                style={{
                  width: 48, height: 48,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--p1-clr), var(--p2-clr))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i className="fas fa-crown" style={{ color: "#fff", fontSize: "1.1rem" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   STAFF SLIDER
───────────────────────────────────────────────── */
function StaffSlider() {
  return (
    <section
      className="section-padding"
      style={{ background: "linear-gradient(135deg, #f8fffe 0%, #f4f8ff 100%)" }}
    >
      <div className="container">
        {/* Section heading */}
        <div className="text-center mb-5">
          <div
            className="d-inline-flex align-items-center gap-2 mb-4 px-4 py-2 rounded-5"
            style={{
              background: "rgba(17,87,238,0.08)",
              border: "1px solid rgba(17,87,238,0.18)",
            }}
          >
            <i className="fas fa-user-md" style={{ color: "var(--p2-clr)", fontSize: "0.85rem" }} />
            <span style={{ color: "var(--p2-clr)", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Our Pharmacists
            </span>
          </div>
          <h2 className="black fw_800 mb-3" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}>
            Serving You With Expertise
          </h2>
          <p className="pra mx-auto" style={{ maxWidth: "520px", color: "rgba(0,0,0,0.65)", lineHeight: 1.8 }}>
            Our qualified team across both branches brings decades of combined experience, professional
            certifications, and a personal commitment to your health.
          </p>
        </div>

        {/* Swiper */}
        <div className="position-relative staff-slider-wrap">
          <Swiper
            modules={[Navigation, A11y]}
            navigation={{
              prevEl: ".staff-prev",
              nextEl: ".staff-next",
            }}
            spaceBetween={28}
            slidesPerView={1}
            breakpoints={{
              640:  { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            loop={pharmacists.length > 3}
          >
            {pharmacists.map((p) => (
              <SwiperSlide key={p.id}>
                <div
                  className="rounded-4 overflow-hidden h-100"
                  style={{
                    background: "#fff",
                    border: `1.5px solid ${p.accent}20`,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                  }}
                >
                  {/* Top accent bar */}
                  <div style={{ height: "4px", background: `linear-gradient(90deg, ${p.accent}, ${p.accent}88)` }} />

                  <div className="p-4 pb-5 d-flex flex-column gap-3">
                    {/* Icon + name */}
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{
                          width: 56, height: 56,
                          background: `${p.accent}12`,
                          border: `2px solid ${p.accent}30`,
                          fontSize: "1.4rem",
                          color: p.accent,
                        }}
                      >
                        <i className={p.icon} />
                      </div>
                      <div>
                        <div className="black fw_800" style={{ fontSize: "1rem", lineHeight: 1.2 }}>{p.name}</div>
                        <div style={{ color: p.accent, fontSize: "0.78rem", fontWeight: 700, marginTop: "2px" }}>{p.role}</div>
                      </div>
                    </div>

                    {/* Qualification & branch */}
                    <div className="d-flex flex-wrap gap-2">
                      <span
                        className="px-3 py-1 rounded-5"
                        style={{
                          background: `${p.accent}10`,
                          border: `1px solid ${p.accent}25`,
                          color: p.accent,
                          fontSize: "0.73rem",
                          fontWeight: 700,
                        }}
                      >
                        {p.qualification}
                      </span>
                      <span
                        className="px-3 py-1 rounded-5"
                        style={{
                          background: "rgba(0,0,0,0.04)",
                          border: "1px solid rgba(0,0,0,0.08)",
                          color: "rgba(0,0,0,0.55)",
                          fontSize: "0.73rem",
                          fontWeight: 600,
                        }}
                      >
                        <i className="fas fa-map-marker-alt me-1" style={{ fontSize: "0.65rem" }} />
                        {p.branch}
                      </span>
                    </div>

                    {/* Bio */}
                    <p
                      className="pra mb-0"
                      style={{ color: "rgba(0,0,0,0.66)", fontSize: "0.88rem", lineHeight: 1.8 }}
                    >
                      {p.bio}
                    </p>

                    {/* Specialties */}
                    <div>
                      <div
                        className="mb-2 fw_700"
                        style={{ fontSize: "0.75rem", color: "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: "0.06em" }}
                      >
                        Specialties
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {p.specialties.map((sp, si) => (
                          <span
                            key={si}
                            className="px-3 py-1 rounded-5"
                            style={{
                              background: "rgba(0,0,0,0.04)",
                              border: "1px solid rgba(0,0,0,0.08)",
                              color: "rgba(0,0,0,0.6)",
                              fontSize: "0.72rem",
                              fontWeight: 600,
                            }}
                          >
                            {sp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom nav buttons */}
          <div className="d-flex align-items-center justify-content-center gap-3 mt-5">
            <button
              className="staff-prev"
              style={{
                width: 52, height: 52, borderRadius: "50%",
                border: "2px solid rgba(17,87,238,0.25)",
                background: "#fff",
                color: "var(--p2-clr)",
                fontSize: "1rem",
                cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--p2-clr)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--p2-clr)";
              }}
            >
              <i className="fas fa-arrow-left" />
            </button>
            <button
              className="staff-next"
              style={{
                width: 52, height: 52, borderRadius: "50%",
                border: "2px solid rgba(19,236,138,0.3)",
                background: "var(--p1-clr)",
                color: "#000",
                fontSize: "1rem",
                cursor: "pointer",
                boxShadow: "0 2px 12px rgba(19,236,138,0.25)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--p2-clr)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--p1-clr)";
                (e.currentTarget as HTMLButtonElement).style.color = "#000";
              }}
            >
              <i className="fas fa-arrow-right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   PAGE ASSEMBLY
───────────────────────────────────────────────── */
export default function TeamPage() {
  return (
    <>
      <TeamHero />
      <CeoMessage />
      <StaffSlider />
    </>
  );
}
