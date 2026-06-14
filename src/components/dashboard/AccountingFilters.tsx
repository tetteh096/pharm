"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CalendarDays, Filter } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  const [rangeError, setRangeError] = React.useState<string | null>(null)

  const isCustomActive =
    currentPreset === "custom" ||
    (Boolean(params.get("from")) && Boolean(params.get("to")))

  const navigate = (next: URLSearchParams) => {
    const qs = next.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
    router.refresh()
  }

  const setPreset = (id: string) => {
    const next = new URLSearchParams(params.toString())
    next.set("preset", id)
    next.delete("from")
    next.delete("to")
    setRangeError(null)
    navigate(next)
  }

  const setBranch = (value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value === ALL_BRANCHES) next.delete("branch")
    else next.set("branch", value)
    navigate(next)
  }

  const applyCustomRange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRangeError(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    let from = String(formData.get("from") ?? "").trim()
    let to = String(formData.get("to") ?? "").trim()

    if (!from || !to) {
      setRangeError("Pick both a start and end date.")
      return
    }

    if (from > to) {
      ;[from, to] = [to, from]
    }

    const next = new URLSearchParams(params.toString())
    next.set("preset", "custom")
    next.set("from", from)
    next.set("to", to)
    navigate(next)
  }

  return (
    <div className="dashboard-card space-y-4 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Filters
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              currentPreset === p.id && !isCustomActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-card text-foreground hover:bg-muted"
            )}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params.toString())
            next.set("preset", "custom")
            if (!next.get("from")) next.set("from", currentFrom)
            if (!next.get("to")) next.set("to", currentTo)
            navigate(next)
          }}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
            isCustomActive
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-card text-foreground hover:bg-muted"
          )}
        >
          Custom range
        </button>
      </div>

      <form
        onSubmit={applyCustomRange}
        className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        {currentBranch ? (
          <input type="hidden" name="branch" value={currentBranch} />
        ) : null}

        <div className="space-y-1">
          <label htmlFor="accounting-from" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            From
          </label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="accounting-from"
              name="from"
              type="date"
              key={`from-${currentFrom}`}
              defaultValue={currentFrom}
              required
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="accounting-to" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            To
          </label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="accounting-to"
              name="to"
              type="date"
              key={`to-${currentTo}`}
              defaultValue={currentTo}
              required
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

        <div className="flex flex-col justify-end gap-1">
          <Button type="submit" className="w-full">
            Apply custom range
          </Button>
          {rangeError ? (
            <p className="text-xs text-destructive">{rangeError}</p>
          ) : isCustomActive ? (
            <p className="text-xs text-muted-foreground">
              {currentFrom} to {currentTo}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  )
}
