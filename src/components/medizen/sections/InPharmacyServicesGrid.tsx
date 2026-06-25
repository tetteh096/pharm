"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CollapseBlock } from "@/components/medizen/CollapseBlock"
import {
  inPharmacyServiceCategories,
  inPharmacyServices,
} from "@/data/in-pharmacy-services"
import {
  PHARMACY_PRIMARY_PHONE,
  pharmacyPrimaryTelHref,
} from "@/data/pharmacy-branches"

export default function InPharmacyServicesGrid() {
  return (
    <section
      id="in-pharmacy-services"
      className="svc-clinical-section section-padding fix"
      aria-labelledby="in-pharmacy-services-heading"
    >
      <div className="container">
        <div className="row justify-content-center mb-3 mb-md-5">
          <div className="col-lg-8 text-center">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="svc-eyebrow mb-3 d-inline-block"
            >
              In-pharmacy services
            </motion.span>
            <motion.h2
              id="in-pharmacy-services-heading"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              viewport={{ once: true }}
              className="fw_800 black mb-3"
              style={{ fontSize: "clamp(1.55rem, 3vw, 2.2rem)", lineHeight: 1.15 }}
            >
              Counselling, monitoring &amp;{" "}
              <span style={{ color: "var(--p1-clr)" }}>diagnostic testing</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              viewport={{ once: true }}
              className="pra mx-auto mb-0 svc-clinical-intro"
            >
              Walk in at any branch for pharmacist-led checks — tap a category below to
              see what we offer in store.
            </motion.p>
          </div>
        </div>

        <div className="svc-clinical-groups d-flex flex-column gap-3 gap-md-5">
          {inPharmacyServiceCategories.map((category, catIndex) => {
            const items = inPharmacyServices.filter(
              (s) => s.categoryId === category.id
            )
            if (!items.length) return null

            return (
              <CollapseBlock
                key={category.id}
                title={category.label}
                subtitle={category.intro}
                defaultOpen={catIndex === 0}
                className="svc-clinical-group"
              >
                <div className="d-none d-lg-block svc-clinical-group-head mb-3 mb-md-4">
                  <h3 className="svc-clinical-group-title">{category.label}</h3>
                  <p className="svc-clinical-group-intro mb-0">{category.intro}</p>
                </div>

                <div className="row g-3 g-md-4">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="col-12 col-sm-6 col-lg-4 d-flex"
                    >
                      <motion.article
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: index * 0.04,
                        }}
                        viewport={{ once: true }}
                        className="svc-clinical-card w-100"
                      >
                        <span className="svc-clinical-icon" aria-hidden>
                          <i className={item.iconClass} />
                        </span>
                        <h4 className="svc-clinical-title">{item.title}</h4>
                        <p className="svc-clinical-desc">{item.desc}</p>
                        <span className="svc-clinical-badge">Walk-in · All branches</span>
                      </motion.article>
                    </div>
                  ))}
                </div>
              </CollapseBlock>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          viewport={{ once: true }}
          className="svc-clinical-footer text-center mt-4 mt-md-5 pt-2"
        >
          <p className="svc-clinical-footer-lead mb-3">
            Not sure which service you need? Our pharmacists will point you in the
            right direction.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-2 gap-md-3">
            <Link
              href={pharmacyPrimaryTelHref()}
              className="common-btn box-style py-3 first-box d-inline-flex justify-content-center align-items-center fs-seven fw_600 gap-2 black overflow-hidden p1-bg rounded-5 px-4"
            >
              <i className="fas fa-phone" aria-hidden />
              Call us — {PHARMACY_PRIMARY_PHONE}
            </Link>
            <Link
              href="/contact"
              className="common-btn box-style py-3 d-inline-flex justify-content-center align-items-center fs-seven fw_600 gap-2 black overflow-hidden rounded-5 px-4"
              style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.1)" }}
            >
              <i className="fas fa-map-marker-alt" aria-hidden />
              Find a branch
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
