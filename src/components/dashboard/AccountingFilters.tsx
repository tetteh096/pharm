"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CalendarDays, Filter } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  presets: Array<{ id: string; label: string }>
  currentPreset: string
  currentFrom: string
  currentTo: string
  currentBranch: string | null
  branches: string[]
}

const ALL_BRANCHES = "__all__"

export function AccountingFilters({
  presets,
  currentPreset,
  currentFrom,
  currentTo,
  currentBranch,
  branches,
}: Props) {
  const pathname = usePathname()
  const params = useSearchParams()
  const router = useRouter()

  const [from, setFrom] = React.useState(currentFrom)
  const [to, setTo] = React.useState(currentTo)

  React.useEffect(() => setFrom(currentFrom), [currentFrom])
  React.useEffect(() => setTo(currentTo), [currentTo])

  const navigate = (next: URLSearchParams) => {
    const qs = next.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const setPreset = (id: string) => {
    const next = new URLSearchParams(params.toString())
    next.set("preset", id)
    next.delete("from")
    next.delete("to")
    navigate(next)
  }

  const setBranch = (value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value === ALL_BRANCHES) next.delete("branch")
    else next.set("branch", value)
    navigate(next)
  }

  const applyCustomRange = () => {
    if (!from || !to) return
    const next = new URLSearchParams(params.toString())
    next.set("from", from)
    next.set("to", to)
    next.set("preset", "custom")
    navigate(next)
  }

  return (
    <div className="dashboard-card rounded-lg border bg-card p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Filters
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {presets.map((p) => (
          <Link
            key={p.id}
            href={`${pathname}?${(() => {
              const next = new URLSearchParams(params.toString())
              next.set("preset", p.id)
              next.delete("from")
              next.delete("to")
              return next.toString()
            })()}`}
            scroll={false}
            className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition-colors ${
              currentPreset === p.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-input hover:bg-muted"
            }`}
            onClick={(e) => {
              e.preventDefault()
              setPreset(p.id)
            }}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            From
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-md border border-input bg-white pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-[oklch(0.28_0.03_260)] dark:text-foreground"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            To
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-md border border-input bg-white pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-[oklch(0.28_0.03_260)] dark:text-foreground"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Branch
          </label>
          <Select
            value={currentBranch ?? ALL_BRANCHES}
            onValueChange={setBranch}
          >
            <SelectTrigger>
              <SelectValue placeholder="All branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_BRANCHES}>All branches</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground opacity-0">
            Apply
          </label>
          <button
            type="button"
            onClick={applyCustomRange}
            disabled={!from || !to}
            className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition"
          >
            Apply custom range
          </button>
        </div>
      </div>
    </div>
  )
}
