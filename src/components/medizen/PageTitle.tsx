"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PageTitleProps {
  title: string;
  /** Use a preset hero image/copy key while keeping a custom page title (e.g. product name). */
  heroKey?: string;
}

const heroCopy: Record<string, { eyebrow: string; description: string }> = {
  "About Us": {
    eyebrow: "Trusted pharmacy care",
    description:
      "Learn how Enviro Pharmacy supports families with reliable care, real guidance, and genuine medications.",
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
    eyebrow: "Get in touch",
    description: "Call, email, or visit us for stock checks, directions, and help with pickup or delivery.",
  },
  Services: {
    eyebrow: "Pharmacy support",
    description:
      "Walk-in health checks, prescription dispensing, and pharmacist consultations at our branches.",
  },
  Service: {
    eyebrow: "Pharmacy support",
    description:
      "Walk-in health checks, prescription dispensing, and pharmacist consultations at our branches.",
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
  "Your Cart": {
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
  "Blog Details":           "/pharmacy-img-1.jpg",
  "Pharmacy Shop":          "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80",
  "Contact Us":             "/photo/43b0ac4ca1cba7ec8ce5b1d878f89a45.jpg",
  "Services":               "/photo/15e95618a2a142e412902a71f1419cca.jpg",
  "Service":                "/photo/15e95618a2a142e412902a71f1419cca.jpg",
  "Service Details":        "/photo/15e95618a2a142e412902a71f1419cca.jpg",
  "Product Details":        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80",
  Cart:                       "/photo/e056638a5edb1bb8196ec842a2f0361a.jpg",
  "Your Cart":                "/photo/e056638a5edb1bb8196ec842a2f0361a.jpg",
  Checkout:                   "/photo/0b26056a910e18ee87790705e40f79df.jpg",
  "Our Team":               "/hero1.png",
  "Meet the Team":          "/hero1.png",
};

const PageTitle: React.FC<PageTitleProps> = ({ title, heroKey }) => {
  const lookupKey = heroKey ?? title;
  const bgImage = heroImages[lookupKey] ?? null;
  const content = heroCopy[lookupKey] ?? {
    eyebrow: "Enviro Pharmacy",
    description: "Clear information and a better pharmacy experience on every page.",
  };

  return (
    <section
      className={`page-title-section fix position-relative overflow-hidden${bgImage ? " page-title-section--image" : " page-title-section--plain"}`}
      style={{ padding: "150px 0 72px", ...(bgImage ? { background: "#09162a" } : {}) }}
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

      {!bgImage && <div className="page-title-plain-scrim" aria-hidden="true" />}

      <div className="container position-relative" style={{ zIndex: 2 }}>
        <div className="row g-4 align-items-center">
          <div className="col-lg-10">
            <div className="page-title-content">
              <span
                className={`page-title-eyebrow d-inline-flex align-items-center gap-2 mb-4${bgImage ? " page-title-eyebrow--image" : ""}`}
              >
                <span className="page-title-eyebrow-dot" />
                {content.eyebrow}
              </span>

              <h1 className={`page-title-h1 mb-3${bgImage ? " page-title-h1--image" : ""}`}>
                {title}
              </h1>
              <p className={`page-title-desc mb-4${bgImage ? " page-title-desc--image" : ""}`}>
                {content.description}
              </p>

              <ul className="breadcrumb-area d-flex align-items-center flex-wrap gap-2 mb-0 list-unstyled">
                <li>
                  <Link
                    href="/"
                    className={`page-title-crumb-link text-decoration-none${bgImage ? " page-title-crumb-link--image" : ""}`}
                  >
                    Home
                  </Link>
                </li>
                <li
                  aria-hidden="true"
                  className={`page-title-crumb-sep${bgImage ? " page-title-crumb-sep--image" : ""}`}
                >
                  <ArrowRight className="h-4 w-4" />
                </li>
                <li className={`page-title-crumb-current${bgImage ? " page-title-crumb-current--image" : ""}`}>
                  {title}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageTitle;
