"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  SlidersHorizontal,
  Package,
  X,
  Loader2,
  Filter as FilterIcon,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ProductCard from "@/components/medizen/ProductCard"
import PriceRangeSlider from "@/components/medizen/shop/PriceRangeSlider"
import {
  searchShopProducts,
  type ShopFilterMeta,
  type ShopFilters,
  type ShopProduct,
  type ShopSearchResult,
  type ShopSort,
} from "@/app/actions/storefront"
import { SHOP_PAGE_SIZE } from "@/lib/shop-constants"
import { formatGhs } from "@/lib/format"

type Props = {
  initialResult: ShopSearchResult
  meta: ShopFilterMeta
  /** From URL `?q=` (e.g. header search) */
  initialQuery?: string
  /** From URL `?page=` */
  initialPage?: number
}

type FilterState = {
  query: string
  categories: string[]
  branches: string[]
  price: [number, number]
  inStockOnly: boolean
  featuredOnly: boolean
  sort: ShopSort
  page: number
}

const PAGE_SIZE = SHOP_PAGE_SIZE
const SEARCH_DEBOUNCE_MS = 350

export default function ShopBrowser({
  initialResult,
  meta,
  initialQuery = "",
  initialPage = 1,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initialFilters: FilterState = {
    query: initialQuery,
    categories: [],
    branches: [],
    price: [meta.priceBounds.min, meta.priceBounds.max],
    inStockOnly: false,
    featuredOnly: false,
    sort: "latest",
    page: initialPage,
  }

  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [result, setResult] = useState<ShopSearchResult>(initialResult)
  const [isPending, startTransition] = useTransition()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestSeq = useRef(0)

  const fetchProducts = useCallback(
    (next: FilterState) => {
      const payload: ShopFilters = {
        query: next.query.trim() || undefined,
        categories: next.categories.length ? next.categories : undefined,
        branches: next.branches.length ? next.branches : undefined,
        minPrice: next.price[0] !== meta.priceBounds.min ? next.price[0] : undefined,
        maxPrice: next.price[1] !== meta.priceBounds.max ? next.price[1] : undefined,
        inStockOnly: next.inStockOnly || undefined,
        featuredOnly: next.featuredOnly || undefined,
        sort: next.sort,
        page: next.page,
        pageSize: PAGE_SIZE,
      }

      const seq = ++requestSeq.current
      startTransition(async () => {
        const res = await searchShopProducts(payload)
        if (seq === requestSeq.current) {
          setResult(res)
        }
      })
    },
    [meta.priceBounds.min, meta.priceBounds.max]
  )

  // Latest filter state is captured in a ref so handlers can read it
  // without depending on stale closures.
  const filtersRef = useRef(filters)
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  // Debounce text query, fire immediately for other filters.
  const applyFilter = useCallback(
    (patch: Partial<FilterState>, opts: { debounce?: boolean } = {}) => {
      const next: FilterState = {
        ...filtersRef.current,
        ...patch,
        // Reset to page 1 unless the patch explicitly sets a page.
        page: patch.page ?? 1,
      }
      filtersRef.current = next
      setFilters(next)

      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (opts.debounce) {
        debounceRef.current = setTimeout(() => fetchProducts(next), SEARCH_DEBOUNCE_MS)
      } else {
        fetchProducts(next)
      }
    },
    [fetchProducts]
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const toggleArrayValue = useCallback(
    (key: "categories" | "branches", value: string) => {
      const prev = filtersRef.current
      const list = prev[key]
      const nextList = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value]
      const next: FilterState = { ...prev, [key]: nextList, page: 1 }
      filtersRef.current = next
      setFilters(next)
      fetchProducts(next)
    },
    [fetchProducts]
  )

  const syncPageToUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (page <= 1) params.delete("page")
      else params.set("page", String(page))
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const resetFilters = useCallback(() => {
    const reset: FilterState = { ...initialFilters, page: 1 }
    filtersRef.current = reset
    setFilters(reset)
    fetchProducts(reset)
    syncPageToUrl(1)
  }, [fetchProducts, initialFilters, syncPageToUrl])

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ label: string; clear: () => void }> = []
    if (filters.query)
      chips.push({
        label: `“${filters.query}”`,
        clear: () => applyFilter({ query: "" }),
      })
    filters.categories.forEach((cat) =>
      chips.push({
        label: cat,
        clear: () => toggleArrayValue("categories", cat),
      })
    )
    filters.branches.forEach((br) =>
      chips.push({
        label: br,
        clear: () => toggleArrayValue("branches", br),
      })
    )
    if (
      filters.price[0] !== meta.priceBounds.min ||
      filters.price[1] !== meta.priceBounds.max
    ) {
      chips.push({
        label: `${formatGhs(filters.price[0])} – ${formatGhs(filters.price[1])}`,
        clear: () =>
          applyFilter({
            price: [meta.priceBounds.min, meta.priceBounds.max],
          }),
      })
    }
    if (filters.inStockOnly)
      chips.push({
        label: "In stock only",
        clear: () => applyFilter({ inStockOnly: false }),
      })
    if (filters.featuredOnly)
      chips.push({
        label: "Featured only",
        clear: () => applyFilter({ featuredOnly: false }),
      })
    return chips
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, meta.priceBounds.min, meta.priceBounds.max])

  const showingFrom =
    result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1
  const showingTo = Math.min(result.page * result.pageSize, result.total)

  const goToPage = useCallback(
    (page: number) => {
      const nextPage = Math.max(1, Math.min(page, result.totalPages))
      applyFilter({ page: nextPage })
      syncPageToUrl(nextPage)
      requestAnimationFrame(() => {
        document.getElementById("all-products")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      })
    },
    [applyFilter, result.totalPages, syncPageToUrl]
  )

  const paginationProps = {
    page: result.page,
    totalPages: result.totalPages,
    total: result.total,
    onPage: goToPage,
  }

  const SidebarContent = (
    <FilterSidebar
      filters={filters}
      meta={meta}
      applyFilter={applyFilter}
      toggleArrayValue={toggleArrayValue}
      resetFilters={resetFilters}
      hasActiveFilters={activeFilterChips.length > 0}
    />
  )

  return (
    <>
      <div className="row g-5">
        <div className="col-lg-3 d-none d-lg-block">{SidebarContent}</div>

        <div className="col-lg-9">
          <div className="shop-toolbar glass-card p-3 rounded-pill mb-3 d-flex justify-content-between align-items-center px-4 shadow-sm flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="d-lg-none border-0 bg-transparent d-inline-flex align-items-center gap-2 fw_700 black"
              style={{ fontSize: "0.85rem" }}
            >
              <FilterIcon size={16} />
              Filters
              {activeFilterChips.length > 0 && (
                <span
                  className="p1-bg text-white rounded-pill px-2"
                  style={{ fontSize: "0.65rem" }}
                >
                  {activeFilterChips.length}
                </span>
              )}
            </button>

            <div className="fs-eight fw_600 black opacity-60 d-flex align-items-center gap-2">
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Searching…
                </>
              ) : result.total === 0 ? (
                "No products found"
              ) : (
                `Showing ${showingFrom}–${showingTo} of ${result.total}`
              )}
            </div>

            <div className="d-flex align-items-center gap-2">
              <SlidersHorizontal size={16} className="opacity-40" />
              <select
                className="shop-sort-select bg-transparent border-0 fs-eight fw_700 black outline-none cursor-pointer"
                value={filters.sort}
                onChange={(e) => applyFilter({ sort: e.target.value as ShopSort })}
              >
                <option value="latest">Latest</option>
                <option value="featured">Featured first</option>
                <option value="priceAsc">Price: low → high</option>
                <option value="priceDesc">Price: high → low</option>
                <option value="name">Name: A → Z</option>
              </select>
            </div>
          </div>

          {activeFilterChips.length > 0 && (
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <span className="black fw_700" style={{ fontSize: "0.78rem" }}>
                Filters:
              </span>
              {activeFilterChips.map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={chip.clear}
                  className="shop-filter-chip d-inline-flex align-items-center gap-1 rounded-pill px-3 py-1 border-0"
                >
                  {chip.label}
                  <X size={12} />
                </button>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="border-0 bg-transparent text-decoration-underline"
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "rgba(0,0,0,0.55)",
                }}
              >
                Clear all
              </button>
            </div>
          )}

          {result.total === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <>
              {result.totalPages > 1 && (
                <Pagination key="shop-pagination-top" {...paginationProps} />
              )}

              <div
                className="row shop-product-grid g-2 g-sm-3 g-md-4"
                style={{ opacity: isPending ? 0.55 : 1, transition: "opacity 0.15s" }}
              >
                {result.products.map((product, idx) => (
                  <motion.div
                    className="col-6 col-sm-4 col-md-6 col-lg-6 col-xl-4"
                    key={product.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.2) }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              {result.totalPages > 1 && (
                <Pagination key="shop-pagination-bottom" {...paginationProps} />
              )}
            </>
          )}
        </div>
      </div>

      <MobileFilterDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
      >
        {SidebarContent}
      </MobileFilterDrawer>
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FilterSidebar({
  filters,
  meta,
  applyFilter,
  toggleArrayValue,
  resetFilters,
  hasActiveFilters,
}: {
  filters: FilterState
  meta: ShopFilterMeta
  applyFilter: (patch: Partial<FilterState>, opts?: { debounce?: boolean }) => void
  toggleArrayValue: (key: "categories" | "branches", value: string) => void
  resetFilters: () => void
  hasActiveFilters: boolean
}) {
  return (
    <div className="shop-sidebar glass-card p-4 rounded-5 shadow-sm border-1 border-white/20">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw_800 black mb-0">Filter products</h5>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="border-0 bg-transparent text-decoration-underline"
            style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--p2-clr)" }}
          >
            Reset
          </button>
        )}
      </div>

      <div className="mb-4">
        <div className="position-relative">
          <input
            type="search"
            value={filters.query}
            onChange={(e) => applyFilter({ query: e.target.value }, { debounce: true })}
            placeholder="Search medicines…"
            className="shop-search-input w-100 rounded-pill px-4 py-2 outline-none"
            style={{ paddingRight: "2.5rem", fontSize: "0.85rem" }}
          />
          <Search
            size={16}
            className="position-absolute end-0 top-50 translate-middle-y me-3"
            style={{ color: "rgba(0,0,0,0.35)", pointerEvents: "none" }}
          />
        </div>
      </div>

      <div className="mb-4">
        <h6 className="fw_800 black mb-3" style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Price range
        </h6>
        <PriceRangeSlider
          min={meta.priceBounds.min}
          max={meta.priceBounds.max}
          value={filters.price}
          onChange={(next) => applyFilter({ price: next })}
        />
      </div>

      <div className="mb-4">
        <h6 className="fw_800 black mb-3" style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Quick filters
        </h6>
        <div className="d-flex flex-column gap-2">
          <ToggleRow
            label="In stock only"
            active={filters.inStockOnly}
            icon={<CheckCircle2 size={14} />}
            onChange={(v) => applyFilter({ inStockOnly: v })}
          />
          <ToggleRow
            label="Featured products"
            active={filters.featuredOnly}
            icon={<Sparkles size={14} />}
            onChange={(v) => applyFilter({ featuredOnly: v })}
          />
        </div>
      </div>

      {meta.categories.length > 0 && (
        <div className="mb-4">
          <h6 className="fw_800 black mb-3" style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Categories
          </h6>
          <ul
            className="list-unstyled d-flex flex-column gap-1 mb-0"
            style={{ maxHeight: 280, overflowY: "auto" }}
          >
            {meta.categories.map((cat) => (
              <li key={cat.name}>
                <CheckRow
                  label={cat.name}
                  count={cat.count}
                  checked={filters.categories.includes(cat.name)}
                  onChange={() => toggleArrayValue("categories", cat.name)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="shop-help-box rounded-4 p-3 mt-2">
        <p className="black fw_700 mb-1" style={{ fontSize: "0.82rem" }}>
          Need help?
        </p>
        <p className="pra mb-2" style={{ fontSize: "0.76rem", lineHeight: 1.5 }}>
          Call our Madina branch on 055 461 2072 — open 24 hours.
        </p>
        <a
          href="tel:+233554612072"
          className="fw_800 text-decoration-none"
          style={{ color: "var(--p1-clr)", fontSize: "0.82rem" }}
        >
          Call now →
        </a>
      </div>

    </div>
  )
}

function ToggleRow({
  label,
  active,
  icon,
  onChange,
}: {
  label: string
  active: boolean
  icon: React.ReactNode
  onChange: (v: boolean) => void
}) {
  return (
    <label
      className={`shop-toggle-row d-flex align-items-center justify-content-between gap-2 rounded-3 px-3 py-2${active ? " shop-toggle-row--active" : ""}`}
      style={{ cursor: "pointer" }}
    >
      <span className="d-flex align-items-center gap-2 black fw_600 shop-toggle-label" style={{ fontSize: "0.82rem" }}>
        <span className="shop-toggle-icon">{icon}</span>
        {label}
      </span>
      <span className="shop-toggle-track position-relative d-inline-block">
        <input
          type="checkbox"
          className="visually-hidden"
          checked={active}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={label}
        />
        <span className="shop-toggle-knob" />
      </span>
    </label>
  )
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string
  count: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="check-row d-flex align-items-center justify-content-between gap-2 rounded-2 px-2 py-2 border-0 w-100 text-start"
      style={{
        background: checked ? "rgba(19, 236, 138, 0.1)" : "transparent",
        transition: "background 0.12s",
        cursor: "pointer",
      }}
      aria-pressed={checked}
    >
      <span className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
        <span
          className={`shop-check-box d-inline-flex align-items-center justify-content-center flex-shrink-0${checked ? " shop-check-box--checked" : ""}`}
        >
          {checked && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6.5L4.5 8.5L9.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="shop-check-label">
          {label}
        </span>
      </span>
      <span className={`shop-check-count rounded-pill px-2 flex-shrink-0${checked ? " shop-check-count--checked" : ""}`}>
        {count}
      </span>
    </button>
  )
}

function MobileFilterDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(9, 22, 42, 0.5)",
              zIndex: 1090,
            }}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.22 }}
            className="shop-mobile-drawer"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "min(360px, 90vw)",
              zIndex: 1100,
              overflowY: "auto",
              padding: "1rem",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="black fw_800 mb-0">Filter products</h5>
              <button
                type="button"
                onClick={onClose}
                className="shop-mobile-drawer-close border-0 d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 36, height: 36 }}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
            {children}
            <button
              type="button"
              onClick={onClose}
              className="common-btn box-style p1-bg text-white w-100 rounded-5 py-3 fw_800 border-0 mt-3"
            >
              See results
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="shop-empty-state text-center py-5 rounded-4"
    >
      <Package size={48} className="opacity-30 mb-3" />
      <h5 className="black fw_800 mb-2">No products match your filters</h5>
      <p className="pra mb-4" style={{ maxWidth: 400, margin: "0 auto 1rem" }}>
        Try a different search term, widen the price range, or clear a category.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="common-btn box-style first-box rounded-5 px-4 py-2 fw_800 border-0"
      >
        Reset filters
      </button>
    </motion.div>
  )
}

function Pagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number
  totalPages: number
  total: number
  onPage: (n: number) => void
}) {
  const pageItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1) as Array<number | "ellipsis">
    }

    const items: Array<number | "ellipsis"> = [1]
    const left = Math.max(2, page - 1)
    const right = Math.min(totalPages - 1, page + 1)

    if (left > 2) items.push("ellipsis")
    for (let i = left; i <= right; i++) items.push(i)
    if (right < totalPages - 1) items.push("ellipsis")
    items.push(totalPages)
    return items
  }, [page, totalPages])

  return (
    <div className="shop-pagination mt-4 mb-2">
      <p
        className="text-center pra"
        style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.75rem" }}
      >
        Page {page} of {totalPages} · {total} product{total === 1 ? "" : "s"}
      </p>
      <div className="pagination-wrapper">
        <ul className="blog-pagination d-flex gap-2 list-unstyled justify-content-center mb-0 flex-wrap align-items-center">
          <li>
            <button
              type="button"
              onClick={() => onPage(page - 1)}
              disabled={page <= 1}
              className="d-center rounded-circle border-0 fw_700 glass-card black"
              style={{ width: 45, height: 45, opacity: page <= 1 ? 0.4 : 1 }}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
          </li>
          {pageItems.map((item, idx) =>
            item === "ellipsis" ? (
              <li key={`ellipsis-${idx}`} className="px-1 pra" style={{ fontWeight: 700 }}>
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => onPage(item)}
                  className={`d-center rounded-circle border-0 fw_700 ${item === page ? "p1-bg text-white" : "glass-card black"}`}
                  style={{ width: 45, height: 45 }}
                  aria-current={item === page ? "page" : undefined}
                >
                  {item}
                </button>
              </li>
            )
          )}
          <li>
            <button
              type="button"
              onClick={() => onPage(page + 1)}
              disabled={page >= totalPages}
              className="d-center rounded-circle border-0 fw_700 glass-card black"
              style={{ width: 45, height: 45, opacity: page >= totalPages ? 0.4 : 1 }}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
