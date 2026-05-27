import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  HeartPulse,
  Mail,
  MessageCircle,
  Phone,
  Pill,
  StickyNote,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChronicPatientActions } from "@/components/dashboard/ChronicPatientActions"
import { getChronicPatient } from "../actions"

export const dynamic = "force-dynamic"

type Params = Promise<{ id: string }>

function fmt(date: Date | null) {
  if (!date) return "—"
  return date.toLocaleDateString("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function fmtTime(date: Date | null) {
  if (!date) return "—"
  return date.toLocaleString("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

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
  emerald: "bg-emerald-400/10 text-emerald-500 ring-emerald-400/20",
  yellow: "bg-yellow-400/10 text-yellow-600 ring-yellow-400/20",
  red: "bg-red-400/10 text-red-500 ring-red-400/20",
  blue: "bg-blue-400/10 text-blue-500 ring-blue-400/20",
  slate: "bg-slate-400/10 text-slate-500 ring-slate-400/20",
}

export default async function ChronicPatientDetailPage({
  params,
}: {
  params: Params
}) {
  const { id } = await params
  const record = await getChronicPatient(id)
  if (!record) notFound()

  const initials =
    record.customer.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"

  return (
    <div className="dashboard-page space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/chronic">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
              style={{
                width: 56,
                height: 56,
                background:
                  "linear-gradient(135deg, var(--p1-clr, #13ec8a), var(--p2-clr, #1157ee))",
              }}
            >
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" />
                {record.customer.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                <Badge variant="default" className="gap-1">
                  <HeartPulse size={11} />
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
                {record.assignedToName && (
                  <span className="text-xs">
                    Managed by {record.assignedToName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <ChronicPatientActions
          record={{
            id: record.id,
            patientName: record.customer.name,
            status: record.status,
            condition: record.condition,
            currentMedications: record.currentMedications,
            dosageSchedule: record.dosageSchedule,
            nextCheckInAt: record.nextCheckInAt
              ? record.nextCheckInAt.toISOString()
              : null,
            notes: record.notes,
            customerId: record.customerId,
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill size={16} className="text-primary" />
                Treatment plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                  Current medications
                </div>
                {record.currentMedications.length === 0 ? (
                  <span className="text-muted-foreground">None recorded</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {record.currentMedications.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
                      >
                        <Pill size={10} />
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                  Dosage schedule
                </div>
                <div>{record.dosageSchedule ?? "—"}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                  Notes
                </div>
                <div className="whitespace-pre-wrap">
                  {record.notes ?? "—"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle size={16} className="text-primary" />
                Contact history ({record.checkIns.length})
              </CardTitle>
              <CardDescription>
                Every check-in logged for this patient.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {record.checkIns.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No check-ins yet. Use &ldquo;Log check-in&rdquo; above to
                  record your first contact.
                </div>
              ) : (
                <ol className="relative border-l border-border pl-4 space-y-4">
                  {record.checkIns.map((log) => {
                    const outcome =
                      OUTCOME_LABELS[log.outcome] ??
                      OUTCOME_LABELS.OTHER
                    return (
                      <li key={log.id} className="relative">
                        <span
                          className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background"
                          aria-hidden
                        />
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                              TONE_CLASSES[outcome.tone] ?? TONE_CLASSES.slate
                            }`}
                          >
                            {outcome.label}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {METHOD_LABELS[log.method] ?? log.method}
                          </Badge>
                          {log.needsRefill && (
                            <Badge
                              variant="outline"
                              className="text-xs border-yellow-300 text-yellow-600"
                            >
                              Refill flagged
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {fmtTime(log.contactedAt)}
                          </span>
                          {log.contactedByName && (
                            <span className="flex items-center gap-1">
                              <User size={11} />
                              {log.contactedByName}
                            </span>
                          )}
                          {log.nextCheckInAt && (
                            <span className="flex items-center gap-1">
                              Next: {fmt(log.nextCheckInAt)}
                            </span>
                          )}
                        </div>
                        {log.notes && (
                          <p className="mt-1 text-sm text-foreground bg-muted/50 rounded px-2 py-1.5 whitespace-pre-wrap">
                            {log.notes}
                          </p>
                        )}
                      </li>
                    )
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={16} className="text-primary" />
                Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {record.customer.phone && (
                <a
                  href={`tel:${record.customer.phone}`}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <Phone size={13} className="text-muted-foreground" />
                  {record.customer.phone}
                </a>
              )}
              {record.customer.email && (
                <a
                  href={`mailto:${record.customer.email}`}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <Mail size={13} className="text-muted-foreground" />
                  {record.customer.email}
                </a>
              )}
              {record.customer.allergies.length > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    Allergies
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {record.customer.allergies.map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center rounded-full bg-red-500/10 text-red-600 px-2 py-0.5 text-xs font-medium"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <Button asChild variant="outline" className="w-full gap-2 mt-2">
                <Link
                  href={`/dashboard/customers/${record.customer.id}`}
                >
                  <ExternalLink size={14} />
                  Full patient file
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Last contact
                </span>
                <span>{fmt(record.lastContactAt)}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Next check-in
                </span>
                <span>{fmt(record.nextCheckInAt)}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Started
                </span>
                <span>{fmt(record.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
