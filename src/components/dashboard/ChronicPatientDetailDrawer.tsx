"use client"

import * as React from "react"
import Link from "next/link"
import {
  Calendar,
  CalendarClock,
  ExternalLink,
  HeartPulse,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Pill,
  User,
} from "lucide-react"

import { Sheet, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DashboardSheetContent } from "@/components/dashboard/DashboardSheetContent"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getChronicPatient } from "@/app/dashboard/chronic/actions"

type ChronicDetail = NonNullable<Awaited<ReturnType<typeof getChronicPatient>>>

const METHOD_LABELS: Record<string, string> = {
  PHONE: "Phone call",
  IN_PERSON: "In person",
  WHATSAPP: "WhatsApp",
  SMS: "SMS",
  EMAIL: "Email",
}

const OUTCOME_LABELS: Record<string, { label: string; tone: string }> = {
  REACHED: { label: "Reached", tone: "emerald" },
  NEEDS_REFILL: { label: "Needs refill", tone: "yellow" },
  REFILLED: { label: "Refill completed", tone: "emerald" },
  NO_ANSWER: { label: "No answer", tone: "red" },
  RESCHEDULED: { label: "Rescheduled", tone: "blue" },
  OTHER: { label: "Other", tone: "slate" },
}

const TONE_CLASSES: Record<string, string> = {
  emerald: "bg-emerald-400/10 text-emerald-600 ring-emerald-400/20",
  yellow: "bg-yellow-400/10 text-yellow-700 ring-yellow-400/20",
  red: "bg-red-400/10 text-red-600 ring-red-400/20",
  blue: "bg-blue-400/10 text-blue-600 ring-blue-400/20",
  slate: "bg-slate-400/10 text-slate-600 ring-slate-400/20",
}

function fmt(date: Date | null | undefined) {
  if (!date) return "—"
  return date.toLocaleDateString("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function fmtTime(date: Date | null | undefined) {
  if (!date) return "—"
  return date.toLocaleString("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

type Props = {
  chronicPatientId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogCheckIn?: (patientId: string, patientName: string) => void
}

export function ChronicPatientDetailDrawer({
  chronicPatientId,
  open,
  onOpenChange,
  onLogCheckIn,
}: Props) {
  const [record, setRecord] = React.useState<ChronicDetail | null>(null)
  const [loading, setLoading] = React.useState(false)

  const refresh = React.useCallback(async () => {
    if (!chronicPatientId) return
    setLoading(true)
    try {
      const data = await getChronicPatient(chronicPatientId)
      setRecord(data)
    } catch (err) {
      console.error(err)
      setRecord(null)
    } finally {
      setLoading(false)
    }
  }, [chronicPatientId])

  React.useEffect(() => {
    if (open && chronicPatientId) {
      refresh()
    } else if (!open) {
      setRecord(null)
    }
  }, [open, chronicPatientId, refresh])

  const patientName = record?.customer.name ?? "Patient"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <DashboardSheetContent>
        <SheetHeader className="shrink-0 border-b px-6 py-5 bg-background">
          <SheetTitle className="flex items-start gap-3 text-2xl pr-10">
            <HeartPulse size={24} className="text-primary shrink-0 mt-1" />
            <span className="leading-snug break-words">{patientName}</span>
          </SheetTitle>
          <SheetDescription className="text-base mt-1">
            {loading
              ? "Loading chronic care record…"
              : record
                ? `${record.condition} · ${record.checkIns.length} contact log${record.checkIns.length === 1 ? "" : "s"}`
                : "Could not load patient"}
          </SheetDescription>
        </SheetHeader>

        {loading || !record ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <Loader2 className="animate-spin" />
            <span className="text-sm">Loading patient log…</span>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 min-w-0 text-base">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="gap-1">
                  <HeartPulse size={12} />
                  {record.condition}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    record.status === "Active"
                      ? "border-emerald-300 text-emerald-600"
                      : record.status === "Inactive"
                        ? "border-yellow-300 text-yellow-600"
                        : "border-red-300 text-red-600"
                  }
                >
                  {record.status}
                </Badge>
                {record.assignedToName ? (
                  <Badge variant="outline">Managed by {record.assignedToName}</Badge>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
                <InfoTile label="Next check-in" value={fmt(record.nextCheckInAt)} />
                <InfoTile label="Last contact" value={fmt(record.lastContactAt)} />
                <InfoTile label="Started" value={fmt(record.createdAt)} />
                <InfoTile
                  label="Contact"
                  value={
                    record.customer.phone ? (
                      <a
                        href={`tel:${record.customer.phone}`}
                        className="inline-flex items-center gap-1.5 hover:text-primary"
                      >
                        <Phone size={14} />
                        {record.customer.phone}
                      </a>
                    ) : (
                      "No phone"
                    )
                  }
                />
              </div>

              <section className="rounded-xl border bg-card p-5 space-y-3 min-w-0">
                <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <Pill size={16} className="text-primary" />
                  Treatment plan
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground mb-1.5">Medications</p>
                    {record.currentMedications.length === 0 ? (
                      <span className="text-muted-foreground">None recorded</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {record.currentMedications.map((m) => (
                          <Badge key={m} variant="secondary" className="gap-1">
                            <Pill size={10} />
                            {m}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground mb-1.5">Dosage schedule</p>
                    <p className="break-words">{record.dosageSchedule ?? "—"}</p>
                  </div>
                </div>
                {record.notes ? (
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground mb-1.5">Notes</p>
                    <p className="whitespace-pre-wrap break-words rounded-lg bg-muted/40 p-3">
                      {record.notes}
                    </p>
                  </div>
                ) : null}
              </section>

              <section className="rounded-xl border bg-card p-5 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <MessageCircle size={16} className="text-primary" />
                    Contact log ({record.checkIns.length})
                  </h3>
                </div>

                {record.checkIns.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    No check-ins yet. Log the first contact using the button below.
                  </div>
                ) : (
                  <ol className="relative border-l border-border pl-5 space-y-5 min-w-0">
                    {record.checkIns.map((log) => {
                      const outcome =
                        OUTCOME_LABELS[log.outcome] ?? OUTCOME_LABELS.OTHER
                      return (
                        <li key={log.id} className="relative min-w-0">
                          <span
                            className="absolute -left-[22px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background"
                            aria-hidden
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                                TONE_CLASSES[outcome.tone] ?? TONE_CLASSES.slate
                              }`}
                            >
                              {outcome.label}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {METHOD_LABELS[log.method] ?? log.method}
                            </Badge>
                            {log.needsRefill ? (
                              <Badge
                                variant="outline"
                                className="text-xs border-yellow-300 text-yellow-700"
                              >
                                Refill flagged
                              </Badge>
                            ) : null}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar size={14} />
                              {fmtTime(log.contactedAt)}
                            </span>
                            {log.contactedByName ? (
                              <span className="inline-flex items-center gap-1.5">
                                <User size={14} />
                                {log.contactedByName}
                              </span>
                            ) : null}
                            {log.nextCheckInAt ? (
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarClock size={14} />
                                Next: {fmt(log.nextCheckInAt)}
                              </span>
                            ) : null}
                          </div>
                          {log.notes ? (
                            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap break-words rounded-lg bg-muted/50 px-3 py-2.5">
                              {log.notes}
                            </p>
                          ) : null}
                        </li>
                      )
                    })}
                  </ol>
                )}
              </section>

              {record.customer.email ? (
                <a
                  href={`mailto:${record.customer.email}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Mail size={14} />
                  {record.customer.email}
                </a>
              ) : null}
            </div>

            <div className="shrink-0 flex flex-wrap items-center justify-end gap-2 border-t bg-background px-6 py-4">
              <Button variant="outline" asChild className="gap-2">
                <Link href={`/dashboard/chronic/${record.id}`}>
                  <ExternalLink size={16} />
                  Full page
                </Link>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <Link href={`/dashboard/customers/${record.customerId}`}>
                  Patient file
                </Link>
              </Button>
              {onLogCheckIn ? (
                <Button
                  className="gap-2"
                  onClick={() => {
                    onOpenChange(false)
                    onLogCheckIn(record.id, record.customer.name)
                  }}
                >
                  <MessageCircle size={16} />
                  Log check-in
                </Button>
              ) : null}
            </div>
          </>
        )}
      </DashboardSheetContent>
    </Sheet>
  )
}

function InfoTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4 min-w-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-1 font-semibold break-words">{value}</div>
    </div>
  )
}
