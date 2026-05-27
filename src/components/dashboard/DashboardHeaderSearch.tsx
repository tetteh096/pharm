"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  LayoutGrid,
  Pill,
  Users,
  ShoppingBag,
  UserCog,
  Loader2,
  X,
} from "lucide-react"

import {
  dashboardGlobalSearch,
  type DashboardSearchHit,
} from "@/app/dashboard/search/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TYPE_META: Record<
  DashboardSearchHit["type"],
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  page: { label: "Pages", icon: LayoutGrid },
  product: { label: "Products", icon: Pill },
  patient: { label: "Patients", icon: Users },
  order: { label: "Orders", icon: ShoppingBag },
  staff: { label: "Staff", icon: UserCog },
}

function groupHits(hits: DashboardSearchHit[]) {
  const groups = new Map<DashboardSearchHit["type"], DashboardSearchHit[]>()
  for (const hit of hits) {
    const list = groups.get(hit.type) ?? []
    list.push(hit)
    groups.set(hit.type, list)
  }
  return groups
}

type DashboardHeaderSearchProps = {
  compact?: boolean
}

export function DashboardHeaderSearch({ compact = false }: DashboardHeaderSearchProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [hits, setHits] = React.useState<DashboardSearchHit[]>([])
  const [loading, setLoading] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setHits([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const results = await dashboardGlobalSearch(q)
        setHits(results)
        setActiveIndex(-1)
      } catch {
        setHits([])
      } finally {
        setLoading(false)
      }
    }, 280)

    return () => window.clearTimeout(timer)
  }, [query])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(true)
        window.setTimeout(() => inputRef.current?.focus(), 0)
      }
      if (e.key === "Escape") {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  React.useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  const flatHits = hits
  const showPanel = open && (query.trim().length >= 2 || loading)

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flatHits.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter" && activeIndex >= 0 && flatHits[activeIndex]) {
      e.preventDefault()
      router.push(flatHits[activeIndex].href)
      setOpen(false)
      setQuery("")
    }
  }

  const searchField = (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={compact ? "Search…" : "Search pages, products, patients…"}
        className={cn(
          "h-10 rounded-full border-border/80 bg-muted/40 pl-9 pr-10 text-sm shadow-sm focus-visible:bg-background",
          !compact && "pr-20"
        )}
        aria-label="Search dashboard"
        aria-expanded={showPanel}
        aria-controls="dashboard-search-results"
        autoComplete="off"
      />
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {query ? (
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
            onClick={() => {
              setQuery("")
              setHits([])
              inputRef.current?.focus()
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : !compact ? (
          <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
            Ctrl K
          </kbd>
        ) : null}
      </div>
    </div>
  )

  const resultsPanel = showPanel ? (
    <div
      id="dashboard-search-results"
      className={cn(
        "z-50 max-h-[min(24rem,60vh)] overflow-auto rounded-xl border border-border bg-popover p-1 shadow-lg",
        compact
          ? "mt-2"
          : "absolute left-0 right-0 top-[calc(100%+0.35rem)]"
      )}
    >
      {loading && hits.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching…
        </div>
      ) : hits.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No results for &ldquo;{query.trim()}&rdquo;
        </p>
      ) : (
        Array.from(groupHits(hits).entries()).map(([type, group]) => {
          const meta = TYPE_META[type]
          const Icon = meta.icon
          return (
            <div key={type} className="py-1">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {meta.label}
              </p>
              <ul>
                {group.map((hit) => {
                  const idx = flatHits.indexOf(hit)
                  return (
                    <li key={hit.id}>
                      <Link
                        href={hit.href}
                        className={cn(
                          "flex items-start gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted",
                          idx === activeIndex && "bg-muted"
                        )}
                        onClick={() => {
                          setOpen(false)
                          setQuery("")
                        }}
                      >
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0">
                          <span className="block font-medium leading-snug">{hit.title}</span>
                          {hit.subtitle ? (
                            <span className="block truncate text-xs text-muted-foreground">
                              {hit.subtitle}
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })
      )}
    </div>
  ) : null

  if (compact) {
    return (
      <div ref={containerRef} className="relative">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          aria-label="Search dashboard"
          onClick={() => {
            setOpen((v) => !v)
            if (!open) window.setTimeout(() => inputRef.current?.focus(), 0)
          }}
        >
          <Search className="h-4 w-4" />
        </Button>
        {open && (
          <div className="fixed inset-x-3 top-[4.25rem] z-50 rounded-xl border border-border bg-background p-2 shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-0 sm:w-[min(100vw-1.5rem,22rem)]">
            {searchField}
            {resultsPanel}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {searchField}
      {resultsPanel}
    </div>
  )
}
