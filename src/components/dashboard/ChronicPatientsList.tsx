"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
  AlertTriangle,
  CalendarClock,
  Eye,
  HeartPulse,
  MessageCircle,
  Phone,
  Pill,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckInDialog } from "@/components/dashboard/CheckInDialog"
import { ChronicPatientDetailDrawer } from "@/components/dashboard/ChronicPatientDetailDrawer"
import { AddChronicPatientDialog } from "@/components/dashboard/AddChronicPatientDialog"
import { ChronicCsvTools } from "@/components/dashboard/ChronicCsvTools"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"

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

function fmtDate(iso: string | null) {
  if (!iso) return "None"
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
  if (!iso) return { text: "Not scheduled", tone: "none" }
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const next = new Date(iso)
  const diffMs = next.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { text: `Overdue ${Math.abs(diffDays)}d`, tone: "overdue" }
  if (diffDays === 0) return { text: "Due today", tone: "soon" }
  if (diffDays <= 7) return { text: `Due in ${diffDays}d`, tone: "soon" }
  return { text: fmtDate(iso), tone: "ok" }
}

function dueMatchesFilter(iso: string | null, filter: string) {
  if (filter === "all") return true
  if (!iso) return false
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const next = new Date(iso)
  const diffDays = Math.round((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (filter === "overdue") return diffDays < 0
  if (filter === "thisWeek") return diffDays >= 0 && diffDays <= 7
  return true
}

function stopRowClick(e: React.MouseEvent) {
  e.stopPropagation()
}

export function ChronicPatientsList({
  initial,
  currentScope,
}: {
  initial: ChronicListItem[]
  currentScope: "mine" | "all"
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [checkInTarget, setCheckInTarget] = React.useState<ChronicListItem | null>(
    null
  )
  const [viewTargetId, setViewTargetId] = React.useState<string | null>(null)

  const openView = React.useCallback((row: ChronicListItem) => {
    setViewTargetId(row.id)
  }, [])

  const openCheckInForRow = React.useCallback((row: ChronicListItem) => {
    if (!row.customer.phone) {
      toast.info("No phone number on file. Open the patient and add one first.")
      return
    }
    setCheckInTarget(row)
  }, [])

  const openCheckInFromDrawer = React.useCallback(
    (id: string, _name: string) => {
      const row = initial.find((r) => r.id === id)
      if (row) openCheckInForRow(row)
    },
    [initial, openCheckInForRow]
  )

  const setScope = (scope: "mine" | "all") => {
    const next = new URLSearchParams(params.toString())
    next.set("scope", scope)
    next.delete("status")
    next.delete("due")
    next.delete("search")
    const qs = next.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
    router.refresh()
  }

  const columns = React.useMemo<DataTableColumn<ChronicListItem>[]>(
    () => [
      {
        id: "patient",
        header: "Patient",
        cell: (row) => {
          const age = ageFromDob(row.customer.dateOfBirth)
          return (
            <div className="min-w-[140px]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  openView(row)
                }}
                className="font-medium hover:text-primary text-left"
              >
                {row.customer.name}
              </button>
              {age != null ? (
                <p className="text-xs text-muted-foreground">
                  {age}y{row.customer.gender ? ` · ${row.customer.gender}` : ""}
                </p>
              ) : null}
            </div>
          )
        },
      },
      {
        id: "contact",
        header: "Contact",
        hideBelow: "md",
        cell: (row) =>
          row.customer.phone ? (
            <a
              href={`tel:${row.customer.phone}`}
              onClick={stopRowClick}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Phone className="h-3 w-3" />
              {row.customer.phone}
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">No phone</span>
          ),
      },
      {
        id: "condition",
        header: "Condition",
        cell: (row) => (
          <div className="flex items-center gap-1.5 text-sm">
            <HeartPulse className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span>{row.condition}</span>
          </div>
        ),
      },
      {
        id: "medications",
        header: "Medications",
        hideBelow: "lg",
        cell: (row) =>
          row.currentMedications.length > 0 ? (
            <div className="flex max-w-[220px] flex-wrap gap-1">
              {row.currentMedications.slice(0, 2).map((med) => (
                <Badge key={med} variant="outline" className="gap-1 text-[10px] font-normal">
                  <Pill className="h-2.5 w-2.5" />
                  {med}
                </Badge>
              ))}
              {row.currentMedications.length > 2 ? (
                <span className="text-[10px] text-muted-foreground">
                  +{row.currentMedications.length - 2}
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">None listed</span>
          ),
      },
      {
        id: "checkin",
        header: "Next check-in",
        cell: (row) => {
          const due = dueLabel(row.nextCheckInAt)
          return (
            <Badge
              variant="outline"
              className={
                due.tone === "overdue"
                  ? "border-red-500/30 bg-red-500/10 text-red-600"
                  : due.tone === "soon"
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-700"
                    : due.tone === "ok"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                      : ""
              }
            >
              {due.tone === "overdue" ? (
                <AlertTriangle className="mr-1 h-3 w-3" />
              ) : (
                <CalendarClock className="mr-1 h-3 w-3" />
              )}
              {due.text}
            </Badge>
          )
        },
      },
      {
        id: "lastContact",
        header: "Last contact",
        hideBelow: "xl",
        className: "text-xs text-muted-foreground",
        cell: (row) => (
          <div>
            <div>{fmtDate(row.lastContactAt)}</div>
            <div>
              {row.checkInCount} log{row.checkInCount === 1 ? "" : "s"}
            </div>
          </div>
        ),
      },
      {
        id: "assigned",
        header: "Assigned to",
        hideBelow: "lg",
        className: "text-xs text-muted-foreground",
        cell: (row) => row.assignedToName ?? "Unassigned",
      },
      {
        id: "status",
        header: "Status",
        cell: (row) => (
          <Badge
            variant="outline"
            className={
              row.status === "Active"
                ? "border-emerald-500/30 text-emerald-700"
                : row.status === "Inactive"
                  ? "border-yellow-500/30 text-yellow-700"
                  : "border-red-500/30 text-red-600"
            }
          >
            {row.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "text-right",
        className: "text-right",
        cell: (row) => (
          <div className="flex justify-end gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 px-2"
              onClick={(e) => {
                e.stopPropagation()
                openCheckInForRow(row)
              }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Log</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1 px-2"
              onClick={(e) => {
                e.stopPropagation()
                openView(row)
              }}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View log</span>
            </Button>
          </div>
        ),
      },
    ],
    [openCheckInForRow, openView]
  )

  if (initial.length === 0) {
    return (
      <div className="space-y-4">
        <ScopeToggle currentScope={currentScope} onScopeChange={setScope} />
        <div className="dashboard-card rounded-xl border border-border/70 bg-card p-10 text-center">
          <div
            className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "rgba(19, 236, 138, 0.1)" }}
          >
            <HeartPulse className="h-6 w-6 text-primary" />
          </div>
          <p className="font-semibold">No chronic patients yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentScope === "mine"
              ? "No patients are assigned to you. Switch to all chronic or add a new patient."
              : "Pick an existing patient and start their chronic care plan."}
          </p>
          <div className="mt-4 flex flex-col items-center gap-3">
            <ChronicCsvTools scope={currentScope} />
            <AddChronicPatientDialog />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ScopeToggle currentScope={currentScope} onScopeChange={setScope} />

      <DataTable
        data={initial}
        columns={columns}
        getRowId={(row) => row.id}
        itemLabel="patients"
        pageSize={10}
        searchPlaceholder="Search name, phone, condition, medications…"
        searchFn={(row, query) => {
          const haystack = [
            row.customer.name,
            row.customer.phone,
            row.customer.email,
            row.condition,
            row.assignedToName,
            ...row.currentMedications,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
          return haystack.includes(query)
        }}
        filters={[
          {
            id: "status",
            label: "Status",
            options: [
              { value: "all", label: "All statuses" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
              { value: "Lost", label: "Lost" },
            ],
            predicate: (row, value) => row.status === value,
          },
          {
            id: "due",
            label: "Check-in",
            options: [
              { value: "all", label: "All check-ins" },
              { value: "overdue", label: "Overdue" },
              { value: "thisWeek", label: "Due this week" },
            ],
            predicate: (row, value) => dueMatchesFilter(row.nextCheckInAt, value),
          },
        ]}
        onRowClick={openView}
        emptyFilteredMessage="No chronic patients match your search or filters."
      />

      <ChronicPatientDetailDrawer
        chronicPatientId={viewTargetId}
        open={Boolean(viewTargetId)}
        onOpenChange={(open) => {
          if (!open) setViewTargetId(null)
        }}
        onLogCheckIn={openCheckInFromDrawer}
      />

      {checkInTarget ? (
        <CheckInDialog
          chronicPatientId={checkInTarget.id}
          patientName={checkInTarget.customer.name}
          open={Boolean(checkInTarget)}
          onOpenChange={(open) => {
            if (!open) setCheckInTarget(null)
          }}
          onSuccess={() => router.refresh()}
        />
      ) : null}
    </div>
  )
}

function ScopeToggle({
  currentScope,
  onScopeChange,
}: {
  currentScope: "mine" | "all"
  onScopeChange: (scope: "mine" | "all") => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-md border bg-muted/40 p-0.5">
        {(["mine", "all"] as const).map((scope) => (
          <button
            key={scope}
            type="button"
            onClick={() => onScopeChange(scope)}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
              currentScope === scope
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {scope === "mine" ? "My patients" : "All chronic"}
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {currentScope === "mine"
          ? "Patients assigned to you"
          : "Every chronic patient across staff"}
      </span>
    </div>
  )
}
