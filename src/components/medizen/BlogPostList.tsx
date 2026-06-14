"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Calendar, User, FolderOpen, ArrowRight, BookOpen } from "lucide-react"
import { SafeProductImage } from "@/components/medizen/shop/SafeProductImage"

type BlogPost = {
  id: string
  title: string
  excerpt: string | null
  coverImage: string | null
  authorName: string
  status: string
  createdAt: Date | string
  category?: { name: string } | null
}

export function BlogPostList({ posts }: { posts: BlogPost[] }) {
  if (!posts || posts.length === 0) {
    return (
      <div
        className="blog-empty-state text-center rounded-4 p-5"
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
        <h4 className="black fw_800 mb-2">No articles yet</h4>
        <p className="pra mb-0">
          Health articles will appear here once our team publishes them.
        </p>
      </div>
    )
  }

  return (
    <div className="blog-list d-flex flex-column gap-4">
      {posts.map((post, index) => (
        <motion.article
          key={post.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          viewport={{ once: true }}
          className="blog-card blog-surface rounded-5 overflow-hidden shadow-sm"
        >
          <Link
            href={`/blog-details?id=${post.id}`}
            className="d-block text-decoration-none"
            style={{ color: "inherit" }}
          >
            <div className="blog-thumb position-relative overflow-hidden">
              <SafeProductImage
                src={post.coverImage}
                alt={post.title}
                className="w-100 h-100"
                style={{
                  objectFit: "cover",
                  transition: "transform 0.5s ease",
                }}
              />
              <span
                className="position-absolute m-3 px-3 py-1 rounded-pill text-white fw_800"
                style={{
                  top: 0,
                  left: 0,
                  background: "var(--p1-clr)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {post.category?.name || "Health"}
              </span>
            </div>
          </Link>

          <div className="p-4 p-md-5">
            <div className="blog-meta d-flex gap-4 mb-3">
              <span className="d-flex align-items-center gap-2">
                <Calendar size={14} style={{ color: "var(--p1-clr)" }} />
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="d-flex align-items-center gap-2">
                <User size={14} style={{ color: "var(--p1-clr)" }} />
                {post.authorName}
              </span>
              {post.category?.name && (
                <span className="d-flex align-items-center gap-2 d-none d-md-flex">
                  <FolderOpen size={14} style={{ color: "var(--p1-clr)" }} />
                  {post.category.name}
                </span>
              )}
            </div>

            <h3 className="fw_900 black mb-3" style={{ lineHeight: 1.3 }}>
              <Link
                href={`/blog-details?id=${post.id}`}
                className="text-decoration-none black hover-p1"
              >
                {post.title}
              </Link>
            </h3>

            {post.excerpt && (
              <p className="blog-excerpt pra mb-4">
                {post.excerpt}
              </p>
            )}

            <Link
              href={`/blog-details?id=${post.id}`}
              className="d-inline-flex align-items-center gap-2 fw_800 text-decoration-none"
              style={{ color: "var(--p2-clr)", fontSize: "0.88rem" }}
            >
              Read full article
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.article>
      ))}
    </div>
  )
}
