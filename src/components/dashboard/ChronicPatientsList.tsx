"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
  AlertTriangle,
  Calendar,
  CalendarClock,
  Eye,
  HeartPulse,
  MessageCircle,
  Phone,
  Pill,
  Search,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckInDialog } from "@/components/dashboard/CheckInDialog"
import { AddChronicPatientDialog } from "@/components/dashboard/AddChronicPatientDialog"

export type ChronicListItem = {
  id: string
  condition: string
  status: string
  nextCheckInAt: string | null
  lastContactAt: string | null
  assignedToName: string | null
  currentMedications: string[]
  checkInCount: number
  customer: {
    id: string
    name: string
    phone: string | null
    email: string | null
    dateOfBirth: string | null
    gender: string | null
  }
}

function ageFromDob(iso: string | null): number | null {
  if (!iso) return null
  const dob = new Date(iso)
  if (isNaN(dob.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const m = now.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1
  return age
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  )
}

function fmt(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function dueLabel(iso: string | null): {
  text: string
  tone: "ok" | "soon" | "overdue" | "none"
} {
  if (!iso) return { text: "No check-in scheduled", tone: "none" }
  const now = new Date()
  const next = new Date(iso)
  const diffMs = next.getTime() - now.setHours(0, 0, 0, 0)
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)}d`, tone: "overdue" }
  if (diffDays === 0) return { text: "Due today", tone: "soon" }
  if (diffDays <= 7) return { text: `Due in ${diffDays}d`, tone: "soon" }
  return { text: `Due ${fmt(iso)}`, tone: "ok" }
}

export function ChronicPatientsList({
  initial,
  currentScope,
  currentStatus,
  currentDue,
  currentSearch,
}: {
  initial: ChronicListItem[]
  currentScope: "mine" | "all"
  currentStatus: string
  currentDue: "overdue" | "thisWeek" | "all"
  currentSearch: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [searchDraft, setSearchDraft] = React.useState(currentSearch)
  const [checkInTarget, setCheckInTarget] = React.useState<
    ChronicListItem | null
  >(null)

  const navigate = (next: URLSearchParams) => {
    const qs = next.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const setScope = (scope: "mine" | "all") => {
    const next = new URLSearchParams(params.toString())
    next.set("scope", scope)
    navigate(next)
  }

  const setStatus = (status: string) => {
    const next = new URLSearchParams(params.toString())
    if (status === "all") next.delete("status")
    else next.set("status", status)
    navigate(next)
  }

  const setDue = (due: string) => {
    const next = new URLSearchParams(params.toString())
    if (due === "all") next.delete("due")
    else next.set("due", due)
    navigate(next)
  }

  const applySearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const next = new URLSearchParams(params.toString())
    if (searchDraft.trim()) next.set("search", searchDraft.trim())
    else next.delete("search")
    navigate(next)
  }

  return (
    <div className="space-y-4">
      <div className="dashboard-card rounded-lg border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-md border bg-muted/40 p-0.5 flex">
            {(["mine", "all"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                  currentScope === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {s === "mine" ? "My patients" : "All chronic"}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {currentScope === "mine"
              ? "Patients assigned to you"
              : "Every chronic patient across staff"}
          </span>
        </div>

        <div className="grid gap-3 grid-cols-1 lg:grid-cols-[1fr_auto_auto] items-end">
          <form onSubmit={applySearch} className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Search
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                onBlur={applySearch}
                placeholder="Name, phone, or condition…"
                className="pl-9"
              />
            </div>
          </form>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </label>
            <Select value={currentStatus} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Check-in
            </label>
            <Select value={currentDue} onValueChange={setDue}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="thisWeek">Due this week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {initial.length === 0 ? (
        <div className="dashboard-card rounded-lg border bg-card p-10 text-center">
          <div
            className="mx-auto mb-3 inline-flex items-center justify-center rounded-full"
            style={{
              width: 56,
              height: 56,
              background: "rgba(19, 236, 138, 0.1)",
            }}
          >
            <HeartPulse className="h-6 w-6 text-primary" />
          </div>
          <p className="font-semibold">No chronic patients match these filters</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Pick an existing patient and start their chronic care plan.
          </p>
          <div className="flex justify-center">
            <AddChronicPatientDialog />
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {initial.map((c) => {
            const due = dueLabel(c.nextCheckInAt)
            const age = ageFromDob(c.customer.dateOfBirth)
            return (
              <div
                key={c.id}
                className="dashboard-card rounded-lg border bg-card p-4 flex flex-col lg:flex-row gap-4"
              >
                <div className="flex items-start gap-3 flex-grow min-w-0">
                  <div
                    className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                    style={{
                      width: 44,
                      height: 44,
                      background:
                        "linear-gradient(135deg, var(--p1-clr, #13ec8a), var(--p2-clr, #1157ee))",
                    }}
                  >
                    {initials(c.customer.name)}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Link
                        href={`/dashboard/chronic/${c.id}`}
                        className="font-semibold hover:text-primary"
                      >
                        {c.customer.name}
                      </Link>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${
                          c.status === "Active"
                            ? "bg-emerald-400/10 text-emerald-500 ring-emerald-400/20"
                            : c.status === "Inactive"
                              ? "bg-yellow-400/10 text-yellow-600 ring-yellow-400/20"
                              : "bg-red-400/10 text-red-500 ring-red-400/20"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <div className="text-sm text-foreground font-medium flex items-center gap-2">
                      <HeartPulse size={13} className="text-primary" />
                      {c.condition}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1.5">
                      {c.customer.phone && (
                        <a
                          href={`tel:${c.customer.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <Phone size={11} />
                          {c.customer.phone}
                        </a>
                      )}
                      {age != null && (
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          {age}y
                          {c.customer.gender ? ` · ${c.customer.gender}` : ""}
                        </span>
                      )}
                      {c.assignedToName && (
                        <span className="flex items-center gap-1">
                          Managed by {c.assignedToName}
                        </span>
                      )}
                    </div>
                    {c.currentMedications.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {c.currentMedications.slice(0, 4).map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-medium"
                          >
                            <Pill size={10} />
                            {m}
                          </span>
                        ))}
                        {c.currentMedications.length > 4 && (
                          <span className="text-[11px] text-muted-foreground">
                            +{c.currentMedications.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0 lg:items-end lg:min-w-[220px]">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold w-fit ${
                      due.tone === "overdue"
                        ? "bg-red-500/10 text-red-500"
                        : due.tone === "soon"
                          ? "bg-yellow-500/10 text-yellow-600"
                          : due.tone === "ok"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {due.tone === "overdue" ? (
                      <AlertTriangle size={12} />
                    ) : (
                      <CalendarClock size={12} />
                    )}
                    {due.text}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    <Calendar size={10} className="inline mr-1" />
                    Last contact: {fmt(c.lastContactAt)}
                    {" · "}
                    {c.checkInCount} log{c.checkInCount === 1 ? "" : "s"}
                  </div>
                  <div className="flex gap-2 w-full lg:justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (!c.customer.phone) {
                          toast.info(
                            "No phone number on file — open the patient and add one first."
                          )
                          return
                        }
                        setCheckInTarget(c)
                      }}
                      className="gap-1"
                    >
                      <MessageCircle size={12} />
                      Log check-in
                    </Button>
                    <Button size="sm" asChild className="gap-1">
                      <Link href={`/dashboard/chronic/${c.id}`}>
                        <Eye size={12} />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {checkInTarget && (
        <CheckInDialog
          chronicPatientId={checkInTarget.id}
          patientName={checkInTarget.customer.name}
          open={Boolean(checkInTarget)}
          onOpenChange={(open) => {
            if (!open) setCheckInTarget(null)
          }}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
