"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock3, MapPin, Phone } from "lucide-react";

interface PageTitleProps {
  title: string;
}

const heroCopy: Record<string, { eyebrow: string; description: string }> = {
  "About Us": {
    eyebrow: "Trusted pharmacy care",
    description: "Learn how Enviro Pharmacy supports families in Madina and Odorkor with reliable care, real guidance, and genuine medications.",
  },
  "Health Insights & News": {
    eyebrow: "Pharmacy updates",
    description: "Practical health articles, wellness guidance, and updates from the Enviro Pharmacy team.",
  },
  "Blog Details": {
    eyebrow: "Article overview",
    description: "Read the full story, key takeaways, and pharmacy-backed guidance from Enviro Pharmacy.",
  },
  "Pharmacy Shop": {
    eyebrow: "Order essentials",
    description: "Browse trusted wellness products, everyday pharmacy items, and medical essentials in one place.",
  },
  "Contact Us": {
    eyebrow: "Two Accra branches",
    description: "Reach the branch nearest to you, ask about stock, and get help arranging pickup or delivery.",
  },
  Services: {
    eyebrow: "Pharmacy support",
    description:
      "Walk-in health checks, prescription dispensing, and pharmacist consultations at our Madina and Odorkor branches.",
  },
  Service: {
    eyebrow: "Pharmacy support",
    description:
      "Walk-in health checks, prescription dispensing, and pharmacist consultations at our Madina and Odorkor branches.",
  },
  "Service Details": {
    eyebrow: "Care details",
    description: "A closer look at how this service supports better access, safer medication use, and smoother follow-up care.",
  },
  "Product Details": {
    eyebrow: "Product overview",
    description: "Review product information, core benefits, and related items before you add it to your order.",
  },
  Cart: {
    eyebrow: "Review your order",
    description: "Check your selected items, update quantities, and continue to a smoother checkout flow.",
  },
  Checkout: {
    eyebrow: "Secure checkout",
    description: "Complete your order details and prepare your pharmacy request for pickup or delivery.",
  },
  "Forgot Password": {
    eyebrow: "Account recovery",
    description: "Request a reset link and regain access to your Enviro Pharmacy account securely.",
  },
  "Set New Password": {
    eyebrow: "Finish recovery",
    description: "Choose a new password to secure your account and get back into the pharmacy platform.",
  },
  "Account Login": {
    eyebrow: "Account access",
    description: "Sign in to manage your Enviro Pharmacy account, orders, and dashboard access.",
  },
};

const heroImages: Record<string, string> = {
  "About Us":               "/jhfhj.jpg",
  "Health Insights & News": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80",
  "Blog Details":           "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80",
  "Pharmacy Shop":          "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80",
  "Contact Us":             "/jhfhj.jpg",
  "Services":               "/jhfhj.jpg",
  "Service":                "/jhfhj.jpg",
  "Service Details":        "/jhfhj.jpg",
  "Product Details":        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80",
  "Our Team":               "/hero1.png",
  "Meet the Team":          "/hero1.png",
};

const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  const bgImage = heroImages[title] ?? null;
  const content = heroCopy[title] ?? {
    eyebrow: "Enviro Pharmacy",
    description: "Clear information, fast branch access, and a better pharmacy experience across every page.",
  };

  return (
    <section
      className="page-title-section fix position-relative overflow-hidden"
      style={{
        padding: "150px 0 72px",
        background: bgImage
          ? "#09162a"
          : "radial-gradient(circle at top left, rgba(19, 236, 138, 0.10), transparent 26%), radial-gradient(circle at top right, rgba(17, 87, 238, 0.10), transparent 28%), linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)",
        borderBottom: "1px solid rgba(9, 22, 42, 0.08)",
      }}
    >
      {bgImage && (
        <>
          <img
            src={bgImage}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              zIndex: 0,
            }}
          />
          {/* Dark overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(4,10,24,0.62)",
              zIndex: 1,
            }}
          />
        </>
      )}

      {!bgImage && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.22) 100%)",
          }}
        />
      )}

      <div className="container position-relative" style={{ zIndex: 2 }}>
        <div className="row g-4 align-items-center">
          <div className="col-lg-8">
            <div className="page-title-content">
              <span
                className="d-inline-flex align-items-center gap-2 mb-4"
                style={{
                  border: bgImage ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(17, 87, 238, 0.12)",
                  background: bgImage ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.88)",
                  color: bgImage ? "#fff" : "#2559a7",
                  borderRadius: "999px",
                  padding: "10px 16px",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  boxShadow: "0 12px 32px rgba(6, 16, 29, 0.06)",
                  backdropFilter: bgImage ? "blur(8px)" : undefined,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: "#13ec8a",
                    boxShadow: "0 0 0 6px rgba(19, 236, 138, 0.14)",
                  }}
                />
                {content.eyebrow}
              </span>

              <h1
                className="mb-3"
                style={{
                  color: bgImage ? "#ffffff" : "#09162a",
                  fontSize: "clamp(2.7rem, 5vw, 4.8rem)",
                  lineHeight: 0.98,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  marginTop: 0,
                }}
              >
                {title}
              </h1>
              <p
                className="mb-4"
                style={{
                  maxWidth: 760,
                  color: bgImage ? "rgba(255,255,255,0.78)" : "#4b5563",
                  fontSize: "clamp(1rem, 1.5vw, 1.14rem)",
                  lineHeight: 1.8,
                }}
              >
                {content.description}
              </p>

              <ul className="breadcrumb-area d-flex align-items-center flex-wrap gap-2 mb-0 list-unstyled">
                <li>
                  <Link href="/" style={{ color: bgImage ? "#13ec8a" : "#09162a", fontWeight: 700 }}>
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" style={{ color: bgImage ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                  <ArrowRight className="h-4 w-4" />
                </li>
                <li style={{ color: bgImage ? "rgba(255,255,255,0.85)" : "#4b5563", fontWeight: 600 }}>{title}</li>
              </ul>
            </div>
          </div>

          <div className="col-lg-4">
            <div
              className="ms-lg-auto"
              style={{
                maxWidth: 360,
                borderRadius: 24,
                border: bgImage ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(9, 22, 42, 0.08)",
                background: bgImage ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.82)",
                boxShadow: "0 18px 45px rgba(6, 16, 29, 0.08)",
                backdropFilter: "blur(12px)",
                padding: 22,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  paddingBottom: 14,
                  marginBottom: 14,
                  borderBottom: bgImage ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(9, 22, 42, 0.08)",
                }}
              >
                <Clock3 className="h-[18px] w-[18px]" style={{ color: "#1157ee", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <span style={{ display: "block", color: bgImage ? "rgba(255,255,255,0.55)" : "#6b7280", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Madina branch</span>
                  <p className="mb-0" style={{ color: bgImage ? "#fff" : "#09162a", fontSize: 17, fontWeight: 700, lineHeight: 1.45, marginTop: 4 }}>Open 24 hours</p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  paddingBottom: 14,
                  marginBottom: 14,
                  borderBottom: bgImage ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(9, 22, 42, 0.08)",
                }}
              >
                <MapPin className="h-[18px] w-[18px]" style={{ color: "#13ec8a", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <span style={{ display: "block", color: bgImage ? "rgba(255,255,255,0.55)" : "#6b7280", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Locations</span>
                  <p className="mb-0" style={{ color: bgImage ? "#fff" : "#09162a", fontSize: 17, fontWeight: 700, lineHeight: 1.45, marginTop: 4 }}>Madina · Odorkor · Sakumono</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <Phone className="h-[18px] w-[18px]" style={{ color: "#1157ee", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <span style={{ display: "block", color: bgImage ? "rgba(255,255,255,0.55)" : "#6b7280", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Quick contact</span>
                  <p className="mb-0" style={{ color: bgImage ? "#fff" : "#09162a", fontSize: 17, fontWeight: 700, lineHeight: 1.45, marginTop: 4 }}>055 461 2072</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageTitle;
