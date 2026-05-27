"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Link from "next/link";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const teamMembers = [
  {
    id: 1,
    name: "Benjamin Owusu",
    role: "CEO & Founder",
    icon: "fas fa-crown",
    accent: "var(--p1-clr)",
    message: "At Enviro Pharmacy, we believe healthcare should be accessible, personal, and trustworthy. Our mission is to serve the Madina and Odorkor communities with the same care we'd give our own families. Every medication, every consultation, and every interaction reflects our commitment to your wellness.",
  },
  {
    id: 2,
    name: "Amara Boateng",
    role: "Lead Pharmacist",
    icon: "fas fa-mortar-pestle",
    accent: "var(--p2-clr)",
    message: "Prescription accuracy is paramount. With every order that passes through our pharmacy, we verify, double-check, and ensure safety. Our team's expertise means you can take your medications with complete confidence.",
  },
  {
    id: 3,
    name: "Kwame Mensah",
    role: "Health & Wellness Specialist",
    icon: "fas fa-leaf",
    accent: "var(--p1-clr)",
    message: "Beyond prescriptions, we help you build a healthier lifestyle. From vitamin recommendations to chronic disease management, our wellness program is designed with *you* in mind. Ask us about supplements, diet, and preventive care.",
  },
  {
    id: 4,
    name: "Isha Patel",
    role: "Customer Care Manager",
    icon: "fas fa-headset",
    accent: "var(--p2-clr)",
    message: "Your satisfaction is our success. Whether you're picking up a refill, asking about side effects, or need late-night help at our Madina 24-hour branch, our team is here to listen and support you every step of the way.",
  },
];

export default function Team() {
  const [activeTeamMember, setActiveTeamMember] = useState<(typeof teamMembers)[0] | null>(null);

  return (
    <section className="team-section body-bg space-bottom space-top">
      <div className="container">
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="cmn-tag p1-bg heading-font mb-3 d-inline-block px-4 py-2 rounded-5">Meet Our Team</span>
          <h2 className="black fw_800 mt-3" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}>
            Dedicated Professionals <br /> Committed to Your Health
          </h2>
          <p className="pra mx-auto mt-3" style={{ maxWidth: "520px", color: "rgba(0,0,0,0.68)" }}>
            Meet the pharmacists and specialists behind Enviro Pharmacy. Click on any team member to hear their message.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="row g-4 justify-content-center mb-5">
          {teamMembers.map((member, i) => (
            <div className="col-lg-3 col-md-6" key={member.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                onClick={() => setActiveTeamMember(member)}
                className="team-card h-100 p-4 rounded-4 bg-white cursor-pointer"
                style={{
                  border: `1.5px solid ${member.accent}22`,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Icon */}
                <div
                  className="team-icon mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: 72,
                    height: 72,
                    background: `linear-gradient(135deg, ${member.accent}22, ${member.accent}44)`,
                    border: `2px solid ${member.accent}44`,
                    fontSize: "1.8rem",
                    color: member.accent,
                  }}
                >
                  <i className={member.icon} />
                </div>

                {/* Name & Role */}
                <h5 className="black fw_700 text-center mb-2" style={{ fontSize: "1.05rem" }}>
                  {member.name}
                </h5>
                <p className="pra text-center mb-3" style={{ fontSize: "0.88rem", color: member.accent, fontWeight: 600 }}>
                  {member.role}
                </p>

                {/* Read Message CTA */}
                <div className="text-center">
                  <button
                    className="team-read-btn"
                    style={{
                      background: "transparent",
                      border: `1.5px solid ${member.accent}`,
                      color: member.accent,
                      padding: "0.5rem 1.2rem",
                      borderRadius: "999px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = member.accent;
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = member.accent;
                    }}
                  >
                    Read Message <i className="fas fa-arrow-right ms-1" style={{ fontSize: "0.7rem" }} />
                  </button>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal/Backdrop */}
      <AnimatePresence>
        {activeTeamMember && (
          <>
            {/* Backdrop */}
            <motion.div
              className="team-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setActiveTeamMember(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(5, 10, 18, 0.6)",
                zIndex: 1100,
                backdropFilter: "blur(4px)",
              }}
            />

            {/* Modal Card */}
            <motion.div
              className="team-modal"
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#fff",
                zIndex: 1200,
                maxWidth: "550px",
                width: "90%",
                padding: "2.5rem 2rem",
                borderRadius: "1.25rem",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setActiveTeamMember(null)}
                className="team-modal-close"
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  right: "1.5rem",
                  width: 40,
                  height: 40,
                  border: "1.5px solid rgba(0,0,0,0.12)",
                  background: "transparent",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <i className="fas fa-times" />
              </button>

              {/* Icon */}
              <div
                className="team-modal-icon mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: 80,
                  height: 80,
                  background: `linear-gradient(135deg, ${activeTeamMember.accent}22, ${activeTeamMember.accent}44)`,
                  border: `2px solid ${activeTeamMember.accent}55`,
                  fontSize: "2rem",
                  color: activeTeamMember.accent,
                }}
              >
                <i className={activeTeamMember.icon} />
              </div>

              {/* Name & Role */}
              <h3 className="black fw_800 text-center mb-2" style={{ fontSize: "1.6rem" }}>
                {activeTeamMember.name}
              </h3>
              <p
                className="text-center mb-4"
                style={{
                  color: activeTeamMember.accent,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                }}
              >
                {activeTeamMember.role}
              </p>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pra"
                style={{
                  lineHeight: 1.8,
                  fontSize: "0.95rem",
                  color: "rgba(0,0,0,0.72)",
                  marginBottom: "2rem",
                  textAlign: "left",
                }}
              >
                {activeTeamMember.message}
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  href="/contact"
                  className="w-100 d-flex justify-content-center align-items-center gap-2 fw_700 px-5 py-3 rounded-5 text-white"
                  style={{
                    background: activeTeamMember.accent,
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    color: "#fff",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Get in Touch <i className="fas fa-arrow-right" style={{ fontSize: "0.8rem" }} />
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
