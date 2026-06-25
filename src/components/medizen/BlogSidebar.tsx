"use client"

import React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Search, FolderOpen, Phone, Tag, Calendar, Mail } from "lucide-react"
import { SafeProductImage } from "@/components/medizen/shop/SafeProductImage"
import {
  PHARMACY_EMAIL,
  PHARMACY_HELP_EMAIL,
  PHARMACY_PRIMARY_PHONE,
  pharmacyPrimaryTelHref,
} from "@/data/pharmacy-branches"

type Category = {
  id: string
  name: string
  _count?: { posts: number }
}

type RecentPost = {
  id: string
  title: string
  coverImage: string | null
  createdAt: Date | string
  category?: { name: string } | null
}

type BlogSidebarProps = {
  categories?: Category[]
  recent?: RecentPost[]
  tags?: string[]
  currentCategoryId?: string
  currentQuery?: string
}

export default function BlogSidebar({
  categories = [],
  recent = [],
  tags = [],
  currentCategoryId,
  currentQuery,
}: BlogSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = React.useState(currentQuery ?? "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = search.trim()
    const params = new URLSearchParams()
    if (trimmed) params.set("q", trimmed)
    if (currentCategoryId) params.set("category", currentCategoryId)
    const qs = params.toString()
    // Always navigate to /blog even when search is triggered from the
    // details page sidebar.
    router.push(qs ? `/blog?${qs}` : "/blog")
  }

  const isBlogList = pathname === "/blog"

  return (
    <aside className="blog-details-right d-flex flex-column gap-4">
      <div className="blog-sidebar-panel details-common search-box rounded-4 p-4">
        <h5 className="black fw_800 mb-3 d-flex align-items-center gap-2">
          <Search size={18} style={{ color: "var(--p1-clr)" }} /> Search
        </h5>
        <form onSubmit={handleSearch} className="position-relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="form-control blog-search-input rounded-pill pe-5"
          />
          <button
            type="submit"
            className="position-absolute border-0 bg-transparent p-0 d-flex align-items-center"
            style={{
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--p1-clr)",
            }}
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </form>
        {!isBlogList && currentQuery && (
          <p className="pra mt-2 mb-0" style={{ fontSize: "0.78rem" }}>
            Currently filtering by: <strong>&ldquo;{currentQuery}&rdquo;</strong>
          </p>
        )}
      </div>

      {categories.length > 0 && (
        <div className="blog-sidebar-panel details-common category-blog rounded-4 p-4">
          <h5 className="black fw_800 mb-3 d-flex align-items-center gap-2">
            <FolderOpen size={18} style={{ color: "var(--p1-clr)" }} /> Categories
          </h5>
          <ul className="cates list-unstyled mb-0 d-flex flex-column gap-2">
            <li>
              <Link
                href={
                  currentQuery
                    ? `/blog?q=${encodeURIComponent(currentQuery)}`
                    : "/blog"
                }
                className={`blog-category-link d-flex align-items-center justify-content-between text-decoration-none fw_700 rounded-3 px-3 py-2${!currentCategoryId ? " blog-category-link--active" : ""}`}
              >
                All articles
              </Link>
            </li>
            {categories.map((c) => {
              const isActive = currentCategoryId === c.id
              const params = new URLSearchParams()
              params.set("category", c.id)
              if (currentQuery) params.set("q", currentQuery)
              return (
                <li key={c.id}>
                  <Link
                    href={`/blog?${params.toString()}`}
                    className={`blog-category-link d-flex align-items-center justify-content-between text-decoration-none fw_700 rounded-3 px-3 py-2${isActive ? " blog-category-link--active" : ""}`}
                  >
                    <span>{c.name}</span>
                    <span
                      className={`blog-category-count d-inline-flex align-items-center justify-content-center rounded-pill px-2${isActive ? " blog-category-count--active" : ""}`}
                    >
                      {c._count?.posts ?? 0}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {recent.length > 0 && (
        <div className="blog-sidebar-panel details-common rounded-4 p-4">
          <h5 className="black fw_800 mb-3 d-flex align-items-center gap-2">
            <Calendar size={18} style={{ color: "var(--p1-clr)" }} /> Recent posts
          </h5>
          <div className="d-flex flex-column gap-3">
            {recent.map((post) => (
              <Link
                key={post.id}
                href={`/blog-details?id=${post.id}`}
                className="d-flex gap-3 text-decoration-none align-items-center"
                style={{ color: "inherit" }}
              >
                <div className="blog-recent-thumb flex-shrink-0 rounded-3 overflow-hidden">
                  <SafeProductImage
                    src={post.coverImage}
                    alt={post.title}
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="flex-grow-1 min-w-0">
                  {post.category?.name && (
                    <div
                      className="d-flex align-items-center gap-1 mb-1"
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--p1-clr)",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      <FolderOpen size={11} />
                      {post.category.name}
                    </div>
                  )}
                  <p
                    className="black fw_700 mb-0"
                    style={{
                      fontSize: "0.88rem",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {post.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="blog-help-box details-common rounded-4 p-4 text-center">
        <h5 className="black fw_800 mb-2">Need help? Call us</h5>
        <div className="d-flex justify-content-center gap-3 mb-3">
          <a
            href={pharmacyPrimaryTelHref()}
            className="d-flex align-items-center justify-content-center rounded-circle p1-bg"
            style={{ width: 52, height: 52, color: "#fff" }}
            aria-label={`Call ${PHARMACY_PRIMARY_PHONE}`}
          >
            <Phone size={20} />
          </a>
          <a
            href={`mailto:${PHARMACY_HELP_EMAIL}`}
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 52, height: 52, color: "#fff", background: "var(--p2-clr)" }}
            aria-label={`Email ${PHARMACY_HELP_EMAIL}`}
          >
            <Mail size={20} />
          </a>
        </div>
        <p className="pra mb-3" style={{ fontSize: "0.82rem", lineHeight: 1.6 }}>
          Speak with a pharmacist for personalised health guidance.
        </p>
        <a
          href={pharmacyPrimaryTelHref()}
          className="fw_800 d-block text-decoration-none mb-2"
          style={{ color: "var(--p2-clr)" }}
        >
          {PHARMACY_PRIMARY_PHONE}
        </a>
        <a
          href={`mailto:${PHARMACY_EMAIL}`}
          className="fw_700 d-block text-decoration-none mb-1"
          style={{ color: "var(--p1-clr)", fontSize: "0.88rem", wordBreak: "break-all" }}
        >
          {PHARMACY_EMAIL}
        </a>
        <a
          href={`mailto:${PHARMACY_HELP_EMAIL}`}
          className="fw_700 d-block text-decoration-none"
          style={{ color: "var(--p1-clr)", fontSize: "0.88rem", wordBreak: "break-all" }}
        >
          {PHARMACY_HELP_EMAIL}
        </a>
      </div>

      {tags.length > 0 && (
        <div className="blog-sidebar-panel details-common rounded-4 p-4">
          <h5 className="black fw_800 mb-3 d-flex align-items-center gap-2">
            <Tag size={18} style={{ color: "var(--p1-clr)" }} /> Tags
          </h5>
          <ul className="list-unstyled d-flex flex-wrap gap-2 mb-0">
            {tags.map((tag) => {
              const params = new URLSearchParams()
              params.set("q", tag)
              return (
                <li key={tag}>
                  <Link
                    href={`/blog?${params.toString()}`}
                    className="blog-tag d-inline-flex align-items-center px-3 py-1 rounded-pill text-decoration-none fw_700"
                  >
                    {tag}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </aside>
  )
}
