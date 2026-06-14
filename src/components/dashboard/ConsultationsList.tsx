"use client"

import * as React from "react"
import { Inbox, MessageSquare, UserRound } from "lucide-react"

import { ConsultationActions } from "@/components/dashboard/ConsultationActions"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { EmptyState } from "@/components/dashboard/EmptyState"

export type ConsultationRow = {
  id: string
  fullName: string
  email: string
  phone: string
  medicationInterest: string | null
  message: string
  status: string
  handledById: string | null
  handledByName: string | null
  handledAt: string | null
  notes: string | null
  createdAt: string
}

export type StaffOption = {
  id: string
  name: string | null
  role: string
}

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  "In Progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  Done: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Dismissed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "New", label: "New" },
  { value: "In Progress", label: "In progress" },
  { value: "Done", label: "Done" },
  { value: "Dismissed", label: "Dismissed" },
] as const

function fmtDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString("en-GH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-GH", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

function stopRowClick(e: React.MouseEvent) {
  e.stopPropagation()
}

export function ConsultationsList({
  items,
  staffOptions,
}: {
  items: ConsultationRow[]
  staffOptions: StaffOption[]
}) {
  const columns = React.useMemo<DataTableColumn<ConsultationRow>[]>(
    () => [
      {
        id: "name",
        header: "Patient",
        cell: (row) => (
          <div>
            <div className="font-medium">{row.fullName}</div>
            <div className="text-xs text-muted-foreground">{row.email}</div>
          </div>
        ),
      },
      {
        id: "contact",
        header: "Phone",
        hideBelow: "md",
        cell: (row) => (
          <a
            href={`tel:${row.phone}`}
            onClick={stopRowClick}
            className="text-sm hover:text-foreground text-muted-foreground"
          >
            {row.phone}
          </a>
        ),
      },
      {
        id: "medication",
        header: "Medication interest",
        hideBelow: "lg",
        cell: (row) => (
          <span className="text-sm text-muted-foreground">
            {row.medicationInterest || "Not specified"}
          </span>
        ),
      },
      {
        id: "message",
        header: "Message",
        hideBelow: "xl",
        cell: (row) => (
          <p className="max-w-[240px] text-sm text-muted-foreground line-clamp-2">
            {row.message}
          </p>
        ),
      },
      {
        id: "pharmacist",
        header: "Pharmacist",
        cell: (row) =>
          row.handledByName ? (
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
                {row.handledByName}
              </div>
              {row.handledAt ? (
                <div className="text-xs text-muted-foreground">
                  {fmtDateTime(row.handledAt).date}
                </div>
              ) : null}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Unassigned</span>
          ),
      },
      {
        id: "status",
        header: "Status",
        cell: (row) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[row.status] ?? STATUS_COLORS.New}`}
          >
            {row.status}
          </span>
        ),
      },
      {
        id: "received",
        header: "Received",
        hideBelow: "md",
        cell: (row) => {
          const { date, time } = fmtDateTime(row.createdAt)
          return (
            <div className="whitespace-nowrap text-xs text-muted-foreground">
              <div>{date}</div>
              <div>{time}</div>
            </div>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "text-right",
        className: "text-right",
        cell: (row) => (
          <div onClick={stopRowClick}>
            <ConsultationActions
              id={row.id}
              currentStatus={row.status}
              fullName={row.fullName}
              email={row.email}
              phone={row.phone}
              medicationInterest={row.medicationInterest}
              message={row.message}
              notes={row.notes ?? ""}
              handledById={row.handledById}
              handledByName={row.handledByName}
              handledAt={row.handledAt}
              staffOptions={staffOptions}
            />
          </div>
        ),
      },
    ],
    [staffOptions]
  )

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <ConsultationsPageHeader total={0} />
        <div className="dashboard-card rounded-xl border border-border/70 bg-card">
          <EmptyState
            icon={Inbox}
            title="No consultation requests yet"
            description="When someone submits the Book a Free Consultation form on the website, their request will appear here."
          />
        </div>
      </div>
    )
  }

  const pharmacistFilterOptions = [
    { value: "all", label: "All pharmacists" },
    { value: "unassigned", label: "Unassigned" },
    ...staffOptions.map((s) => ({
      value: s.id,
      label: s.name ?? "Staff",
    })),
  ]

  return (
    <div className="space-y-6">
      <ConsultationsPageHeader total={items.length} />

      <DataTable
        data={items}
        columns={columns}
        getRowId={(row) => row.id}
        itemLabel="requests"
        searchPlaceholder="Search name, email, phone, message, pharmacist…"
        searchFn={(row, query) => {
          const haystack = [
            row.fullName,
            row.email,
            row.phone,
            row.medicationInterest,
            row.message,
            row.status,
            row.handledByName,
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
            options: [...STATUS_OPTIONS],
            predicate: (row, value) => row.status === value,
          },
          {
            id: "pharmacist",
            label: "Pharmacist",
            options: pharmacistFilterOptions,
            predicate: (row, value) => {
              if (value === "unassigned") return !row.handledById
              return row.handledById === value
            },
          },
        ]}
        stats={(filtered, all) => {
          const newCount = filtered.filter((r) => r.status === "New").length
          const inProgress = filtered.filter((r) => r.status === "In Progress").length
          const unassigned = filtered.filter((r) => !r.handledById).length
          return [
            {
              label: "Requests",
              value: filtered.length,
              hint: filtered.length !== all.length ? `${all.length} in total` : undefined,
            },
            {
              label: "New",
              value: newCount,
              hint: "Awaiting first contact",
            },
            {
              label: "In progress",
              value: inProgress,
              hint: "Being followed up",
            },
            {
              label: "Unassigned",
              value: unassigned,
              hint: "No pharmacist linked yet",
            },
          ]
        }}
        emptyFilteredMessage="No consultation requests match your search or filters."
      />
    </div>
  )
}

function ConsultationsPageHeader({ total }: { total: number }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Consultations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Website consultation requests. Assign a pharmacist when you start follow-up
          so the team knows who handled each case.
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageSquare size={16} />
        {total} total request{total !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
