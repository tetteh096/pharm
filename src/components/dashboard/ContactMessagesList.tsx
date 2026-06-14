"use client"

import * as React from "react"
import { Inbox, Mail, MapPin, UserRound } from "lucide-react"

import { ContactMessageActions } from "@/components/dashboard/ContactMessageActions"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { EmptyState } from "@/components/dashboard/EmptyState"
import type { StaffOption } from "@/components/dashboard/ConsultationsList"

export type ContactMessageRow = {
  id: string
  fullName: string
  email: string
  phone: string
  branchId: string
  branchName: string
  subject: string
  message: string
  status: string
  handledById: string | null
  handledByName: string | null
  handledAt: string | null
  notes: string | null
  createdAt: string
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

export function ContactMessagesList({
  items,
  staffOptions,
}: {
  items: ContactMessageRow[]
  staffOptions: StaffOption[]
}) {
  const branchFilterOptions = [
    { value: "all", label: "All branches" },
    ...Array.from(new Set(items.map((i) => i.branchName))).map((name) => ({
      value: name,
      label: name.replace(" Branch", ""),
    })),
  ]

  const columns = React.useMemo<DataTableColumn<ContactMessageRow>[]>(
    () => [
      {
        id: "name",
        header: "From",
        cell: (row) => (
          <div>
            <div className="font-medium">{row.fullName}</div>
            <div className="text-xs text-muted-foreground">{row.email}</div>
          </div>
        ),
      },
      {
        id: "subject",
        header: "Subject",
        cell: (row) => (
          <div>
            <div className="text-sm font-medium">{row.subject}</div>
            <p className="max-w-[220px] text-xs text-muted-foreground line-clamp-1">
              {row.message}
            </p>
          </div>
        ),
      },
      {
        id: "branch",
        header: "Branch",
        hideBelow: "md",
        cell: (row) => (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {row.branchName.replace(" Branch", "")}
          </div>
        ),
      },
      {
        id: "phone",
        header: "Phone",
        hideBelow: "lg",
        cell: (row) => (
          <a
            href={`tel:${row.phone}`}
            onClick={stopRowClick}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {row.phone}
          </a>
        ),
      },
      {
        id: "handler",
        header: "Handled by",
        hideBelow: "xl",
        cell: (row) =>
          row.handledByName ? (
            <div className="flex items-center gap-1.5 text-sm">
              <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
              {row.handledByName}
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
            <ContactMessageActions
              id={row.id}
              currentStatus={row.status}
              fullName={row.fullName}
              email={row.email}
              phone={row.phone}
              branchName={row.branchName}
              subject={row.subject}
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
        <ContactMessagesPageHeader total={0} />
        <div className="dashboard-card rounded-xl border border-border/70 bg-card">
          <EmptyState
            icon={Inbox}
            title="No contact messages yet"
            description="When someone submits the contact form on the website, their message will appear here."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ContactMessagesPageHeader total={items.length} />

      <DataTable
        data={items}
        columns={columns}
        getRowId={(row) => row.id}
        itemLabel="messages"
        searchPlaceholder="Search name, email, subject, branch, message…"
        searchFn={(row, query) => {
          const haystack = [
            row.fullName,
            row.email,
            row.phone,
            row.subject,
            row.message,
            row.branchName,
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
            id: "branch",
            label: "Branch",
            options: branchFilterOptions,
            predicate: (row, value) => row.branchName === value,
          },
        ]}
        stats={(filtered, all) => {
          const newCount = filtered.filter((r) => r.status === "New").length
          const inProgress = filtered.filter((r) => r.status === "In Progress").length
          return [
            {
              label: "Messages",
              value: filtered.length,
              hint: filtered.length !== all.length ? `${all.length} in total` : undefined,
            },
            {
              label: "New",
              value: newCount,
              hint: "Awaiting reply",
            },
            {
              label: "In progress",
              value: inProgress,
              hint: "Being handled",
            },
            {
              label: "Branches",
              value: new Set(filtered.map((r) => r.branchName)).size,
              hint: "In current view",
            },
          ]
        }}
        emptyFilteredMessage="No messages match your search or filters."
      />
    </div>
  )
}

function ContactMessagesPageHeader({ total }: { total: number }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contact messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Messages from the website contact form. Assign a staff member and update
          status when you follow up.
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Mail size={16} />
        {total} total message{total !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
