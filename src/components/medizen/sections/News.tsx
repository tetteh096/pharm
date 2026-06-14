"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, User, BookOpen } from "lucide-react";
import { SafeProductImage } from "@/components/medizen/shop/SafeProductImage";

export type NewsPost = {
  id: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  authorName: string;
  createdAt: Date | string;
  category?: { name: string } | null;
};

const formatDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const News = ({ posts = [] }: { posts?: NewsPost[] }) => {
  const featured = posts[0];
  const rest = posts.slice(1, 4);

  return (
    <section className="news-section space-top space-bottom fix position-relative">
      <div className="container">
        <div className="row justify-content-center mb-60">
          <div className="col-lg-8 text-center">
            <div className="section-title">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="cmn-tag p1-bg text-white px-3 py-1 rounded-pill fs-nine mb-3 d-inline-block"
              >
                Health Insights
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="black fw_900 mb-3"
              >
                Caring for Your <span className="p1-clr">Vitality</span>{" "}
                <br /> Through Expert Knowledge
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="text-muted"
              >
                Stay updated with the latest medical advice, wellness trends,
                and pharmacy innovations curated by our expert team.
              </motion.p>
            </div>
          </div>
        </div>

        {!featured ? (
          <div
            className="text-center rounded-4 p-5 mx-auto"
            style={{
              maxWidth: 560,
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: 64,
                height: 64,
                background: "rgba(19, 236, 138, 0.1)",
              }}
            >
              <BookOpen size={26} style={{ color: "var(--p1-clr)" }} />
            </div>
            <h4 className="black fw_800 mb-2">Articles coming soon</h4>
            <p className="pra mb-3">
              Our pharmacy team is preparing the first set of health articles.
              Check back shortly.
            </p>
            <Link
              href="/blog"
              className="common-btn px-4 py-2 p1-bg text-white rounded-pill fs-eight fw_700 d-inline-flex align-items-center gap-2"
            >
              Visit blog <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-xl-7 col-lg-7">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="featured-news-card h-100 position-relative overflow-hidden rounded-5 group shadow-lg"
              >
                <div
                  className="news-image h-100"
                  style={{ minHeight: 450, background: "#f4f6f8" }}
                >
                  <SafeProductImage
                    src={featured.coverImage}
                    alt={featured.title}
                    className="w-100 h-100 transition-all duration-700 group-hover:scale-110"
                    style={{
                      objectFit: "cover",
                      minHeight: 450,
                    }}
                  />
                  <div
                    className="image-overlay"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 60%)",
                      position: "absolute",
                      inset: 0,
                    }}
                  ></div>
                </div>
                <div className="news-content p-4 p-md-5 position-absolute bottom-0 w-100 text-white">
                  {featured.category?.name && (
                    <span
                      className="d-inline-block mb-3 px-3 py-1 rounded-pill fw_800 text-white"
                      style={{
                        background: "var(--p1-clr)",
                        fontSize: "0.7rem",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {featured.category.name}
                    </span>
                  )}
                  <div className="d-flex gap-4 mb-3 opacity-75 fs-nine flex-wrap">
                    <span className="d-flex align-items-center gap-2">
                      <Calendar size={14} /> {formatDate(featured.createdAt)}
                    </span>
                    <span className="d-flex align-items-center gap-2">
                      <User size={14} /> {featured.authorName}
                    </span>
                  </div>
                  <h3 className="fw_800 mb-3 featured-title">
                    <Link
                      href={`/blog-details?id=${featured.id}`}
                      className="text-white hover-p1"
                    >
                      {featured.title}
                    </Link>
                  </h3>
                  {featured.excerpt && (
                    <p className="mb-4 d-none d-md-block opacity-75">
                      {featured.excerpt}
                    </p>
                  )}
                  <Link
                    href={`/blog-details?id=${featured.id}`}
                    className="common-btn px-4 py-2 p1-bg text-white rounded-pill fs-eight fw_700 d-inline-flex align-items-center gap-2"
                  >
                    Read Article <ArrowRight size={18} />
                  </Link>
                </div>
              </motion.div>
            </div>

            <div className="col-xl-5 col-lg-5">
              <div className="d-flex flex-column gap-4">
                {rest.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    viewport={{ once: true }}
                    className="news-list-card glass-card p-3 rounded-4 d-flex gap-3 align-items-center group border-1 border-white/10"
                  >
                    <div
                      className="news-thumb overflow-hidden rounded-4"
                      style={{
                        width: 120,
                        height: 120,
                        flexShrink: 0,
                        background: "#f4f6f8",
                      }}
                    >
                      <SafeProductImage
                        src={item.coverImage}
                        alt={item.title}
                        className="w-100 h-100 transition-all duration-500 group-hover:scale-110"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="news-info min-w-0">
                      <div className="d-flex gap-3 mb-2 opacity-50 fs-ten">
                        <span className="d-flex align-items-center gap-1">
                          <Calendar size={12} /> {formatDate(item.createdAt)}
                        </span>
                        {item.category?.name && (
                          <span className="d-flex align-items-center gap-1">
                            {item.category.name}
                          </span>
                        )}
                      </div>
                      <h5 className="fs-six fw_800 mb-2">
                        <Link
                          href={`/blog-details?id=${item.id}`}
                          className="black hover-p1 line-clamp-2"
                        >
                          {item.title}
                        </Link>
                      </h5>
                      <Link
                        href={`/blog-details?id=${item.id}`}
                        className="p1-clr fs-nine fw_700 d-inline-flex align-items-center gap-1"
                      >
                        Full Story <ArrowRight size={12} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              {posts.length >= 1 && (
                <div className="text-center mt-4">
                  <Link
                    href="/blog"
                    className="d-inline-flex align-items-center gap-2 fw_800 text-decoration-none"
                    style={{ color: "var(--p2-clr)" }}
                  >
                    View all articles <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </section>
  );
};

export default News;
