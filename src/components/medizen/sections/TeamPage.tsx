"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import type { PublicTeamProfile } from "@/app/actions/team";
import "swiper/css";
import "swiper/css/navigation";

const PLACEHOLDER_IMAGE = "/assets/img/team/teamThumb3_1.jpg";

function profileSocialLinks(profile: PublicTeamProfile) {
  return [
    { icon: "fab fa-facebook-f", href: profile.facebookUrl, label: "Facebook" },
    { icon: "fab fa-linkedin-in", href: profile.linkedinUrl, label: "LinkedIn" },
    { icon: "fab fa-instagram", href: profile.instagramUrl, label: "Instagram" },
  ].filter((link): link is { icon: string; href: string; label: string } => Boolean(link.href));
}
/* ─────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────── */
function TeamHero() {
  return (
    <section className="team-hero-section">
      <div className="team-hero-grid" aria-hidden="true" />
      <div className="team-hero-glow" aria-hidden="true" />
      <div className="team-hero-accent-bar" aria-hidden="true" />

      <div className="container position-relative">
        <div className="team-hero-inner">
          <div className="team-hero-badge d-inline-flex align-items-center gap-2 mb-4 px-4 py-2 rounded-5">
            <i className="fas fa-user-md" />
            <span>Meet Our Team</span>
          </div>

          <h1 className="team-hero-title fw_900 mb-4">
            Dedicated Professionals,{" "}
            <span className="team-hero-accent">Committed</span>{" "}
            to Your Health
          </h1>

          <p className="team-hero-lead mb-4">
            From our leadership to our pharmacy technicians, every member of the
            Enviro team is here with one purpose — to serve you with expertise
            and genuine care.
          </p>

          <div className="team-hero-locations d-flex flex-wrap gap-2">
            {["Madina", "Odorkor", "Sakumono", "Santeo"].map((branch) => (
              <span key={branch} className="team-hero-location-pill">
                {branch}
              </span>
            ))}
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
    <section className="team-ceo-section section-padding body-bg">
      <div className="container">
        <div className="row g-4 g-lg-5 align-items-stretch">
          <div className="col-lg-5">
            <div className="team-ceo-photo position-relative rounded-4 overflow-hidden h-100">
              <img
                src="/bb4a2a23-c20b-4859-b847-acd25a2395dc.png"
                alt="Mr George Ackah, CEO of Enviro Pharmacy Limited"
                className="team-ceo-img w-100 h-100"
              />
              <span className="team-ceo-img-eyebrow">Enviro Pharmacy · Leadership</span>
            </div>
          </div>

          <div className="col-lg-7 d-flex flex-column justify-content-center">
            <div className="team-ceo-badge d-inline-flex align-items-center gap-2 mb-4 px-4 py-2 rounded-5">
              <i className="fas fa-quote-left" style={{ color: "var(--p1-clr)", fontSize: "0.85rem" }} />
              <span style={{ color: "var(--p1-clr)", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                A Message from the CEO
              </span>
            </div>

            <h2 className="black fw_800 mb-4 team-ceo-heading" style={{ fontSize: "clamp(1.7rem, 3vw, 2.4rem)", lineHeight: 1.2 }}>
              Welcome to Enviro Pharmacy Limited
            </h2>

            <p className="pra mb-0 team-muted-text team-ceo-message">
              We are committed to providing quality healthcare products, trusted pharmaceutical services,
              and exceptional customer care. Thank you for choosing us as your healthcare partner.
              Your health and well-being inspire everything we do, and we look forward to serving you
              with professionalism, integrity, and compassion.
            </p>

            <div className="team-ceo-signature mt-5 pt-4 d-flex align-items-center gap-4">
              <div>
                <div className="fw_900 mb-1 team-ceo-sign-name">
                  Mr George Ackah
                </div>
                <div className="team-ceo-sign-title">
                  CEO, Enviro Pharmacy Limited
                </div>
              </div>
              <div className="team-ceo-sign-icon">
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
function StaffSlider({ profiles }: { profiles: PublicTeamProfile[] }) {
  const hasProfiles = profiles.length > 0;

  return (    <section className="team-staff-section section-padding">
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
          <p className="pra mx-auto team-muted-text" style={{ maxWidth: "520px", lineHeight: 1.8 }}>
            Meet the pharmacists and specialists behind Enviro Pharmacy — experienced, approachable,
            and here to support your health.
          </p>
        </div>

        {!hasProfiles ? (
          <div
            className="text-center py-5 px-4 rounded-4 mx-auto"
            style={{
              maxWidth: 480,
              background: "rgba(17,87,238,0.06)",
              border: "1px dashed rgba(17,87,238,0.2)",
            }}
          >
            <p className="black fw_700 mb-2">Team profiles coming soon</p>
            <p className="pra mb-0 team-muted-text" style={{ fontSize: "0.92rem" }}>
              Our pharmacist profiles will appear here shortly.
            </p>
          </div>
        ) : (
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
            loop={profiles.length > 3}
          >
            {profiles.map((p) => {
              const social = profileSocialLinks(p);
              return (
              <SwiperSlide key={p.id}>
                <article className="team-staff-card team-staff-card--simple h-100">
                  <div className="team-staff-photo">
                    <img src={p.image || PLACEHOLDER_IMAGE} alt={p.name} />
                  </div>
                  <div className="team-staff-info">
                    <h3 className="team-staff-name mb-0">{p.name}</h3>
                    <p className="team-staff-role mb-0">{p.role}</p>
                    {social.length > 0 && (
                    <div className="team-staff-social">
                      {social.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          aria-label={`${p.name} on ${link.label}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className={link.icon} />
                        </a>
                      ))}
                    </div>
                    )}
                  </div>
                </article>
              </SwiperSlide>
            );
            })}
          </Swiper>

          {/* Custom nav buttons */}
          <div className="d-flex align-items-center justify-content-center gap-3 mt-5">
            <button className="staff-prev team-slider-btn team-slider-btn--prev">
              <i className="fas fa-arrow-left" />
            </button>
            <button className="staff-next team-slider-btn team-slider-btn--next">
              <i className="fas fa-arrow-right" />
            </button>
          </div>
        </div>
        )}      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   PAGE ASSEMBLY
───────────────────────────────────────────────── */
export default function TeamPage({ profiles = [] }: { profiles?: PublicTeamProfile[] }) {
  return (
    <>
      <TeamHero />
      <CeoMessage />
      <StaffSlider profiles={profiles} />
    </>
  );
}