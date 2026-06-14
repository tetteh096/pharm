import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Edit,
  Heart,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  StickyNote,
  User,
  UserPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { getPatientTypeLabel } from "@/lib/patient-labels"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge"
import { AddToChronicButton } from "@/components/dashboard/AddToChronicButton"
import { getPatient } from "../actions"
import { formatGhs } from "@/lib/format"

export const dynamic = "force-dynamic"

type Params = Promise<{ id: string }>

function ageFrom(date: Date | null) {
  if (!date) return null
  const now = new Date()
  let age = now.getFullYear() - date.getFullYear()
  const m = now.getMonth() - date.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < date.getDate())) age -= 1
  return age
}

function fmt(date: Date | null) {
  if (!date) return "—"
  return date.toLocaleDateString("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default async function PatientDetailPage({
  params,
}: {
  params: Params
}) {
  const { id } = await params
  const patient = await getPatient(id)
  if (!patient) notFound()

  const age = ageFrom(patient.dateOfBirth)
  const initials =
    patient.name
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
            <Link href="/dashboard/customers">
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
              <h1 className="text-2xl font-bold tracking-tight">
                {patient.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                <Badge variant="outline">{getPatientTypeLabel(patient.clientType, patient.source)}</Badge>
                {patient.source && patient.source !== "Online order" ? (
                  <span className="text-xs">via {patient.source}</span>
                ) : null}
                <span>·</span>
                <span>Registered {fmt(patient.createdAt)}</span>
                {patient.createdByName && (
                  <span>· by {patient.createdByName}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!patient.chronicRecord && (
            <AddToChronicButton
              customerId={patient.id}
              defaultCondition={patient.condition ?? ""}
            />
          )}
          {patient.chronicRecord && (
            <Button asChild variant="outline" className="gap-2">
              <Link
                href={`/dashboard/chronic/${patient.chronicRecord.id}`}
              >
                <HeartPulse size={14} className="text-primary" /> Chronic file
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/dashboard/customers/${patient.id}/edit`}>
              <Edit size={14} /> Edit
            </Link>
          </Button>
        </div>
      </div>

      {patient.chronicRecord && (
        <Card
          className="dashboard-card border-primary/40"
          style={{ background: "rgba(19, 236, 138, 0.05)" }}
        >
          <CardContent className="flex items-start gap-3 p-4">
            <HeartPulse className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-grow text-sm">
              <span className="font-semibold">Chronic care active:</span>{" "}
              {patient.chronicRecord.condition}
              {patient.chronicRecord.assignedToName && (
                <span className="text-muted-foreground">
                  {" "}
                  · managed by {patient.chronicRecord.assignedToName}
                </span>
              )}
              {patient.chronicRecord.nextCheckInAt && (
                <span className="text-muted-foreground">
                  {" "}
                  · next check-in {fmt(patient.chronicRecord.nextCheckInAt)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={16} className="text-primary" />
                  Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <DetailRow label="Date of birth" value={fmt(patient.dateOfBirth)} />
                <DetailRow label="Age" value={age != null ? `${age} years` : "—"} />
                <DetailRow label="Gender" value={patient.gender ?? "—"} />
                <DetailRow label="Status" value={patient.status} />
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone size={16} className="text-primary" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <DetailRow
                  label="Phone"
                  value={
                    patient.phone ? (
                      <a
                        href={`tel:${patient.phone}`}
                        className="hover:text-primary"
                      >
                        {patient.phone}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <DetailRow
                  label="Email"
                  value={
                    patient.email ? (
                      <a
                        href={`mailto:${patient.email}`}
                        className="hover:text-primary"
                      >
                        {patient.email}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <DetailRow
                  label="Address"
                  value={
                    patient.address ? (
                      <span className="whitespace-pre-wrap">
                        {patient.address}
                      </span>
                    ) : (
                      "—"
                    )
                  }
                />
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus size={16} className="text-primary" />
                  Emergency contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <DetailRow
                  label="Name"
                  value={patient.emergencyContactName ?? "—"}
                />
                <DetailRow
                  label="Phone"
                  value={
                    patient.emergencyContactPhone ? (
                      <a
                        href={`tel:${patient.emergencyContactPhone}`}
                        className="hover:text-primary"
                      >
                        {patient.emergencyContactPhone}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart size={16} className="text-primary" />
                  Medical
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    Allergies
                  </div>
                  {patient.allergies.length === 0 ? (
                    <span className="text-muted-foreground">None recorded</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {patient.allergies.map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center rounded-full bg-red-500/10 text-red-600 px-2 py-0.5 text-xs font-medium"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    Known conditions
                  </div>
                  <div>{patient.condition ?? "—"}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    Notes
                  </div>
                  <div className="whitespace-pre-wrap">
                    {patient.medicalNotes ?? "—"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {patient.notes && (
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StickyNote size={16} className="text-primary" />
                  Internal notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{patient.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-primary" />
                Order history
              </CardTitle>
              <CardDescription>
                Last {patient.orders.length} orders for this patient.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patient.orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No orders yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {patient.orders.map((o) => (
                    <Link
                      key={o.id}
                      href={`/dashboard/orders`}
                      className="flex items-center justify-between gap-3 rounded-md border bg-card p-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs font-medium">
                          {o.orderNumber}
                        </span>
                        <OrderStatusBadge status={o.status} />
                        <span className="text-xs text-muted-foreground">
                          {fmt(o.createdAt)}
                        </span>
                        {o.branchName && (
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            · {o.branchName}
                          </span>
                        )}
                      </div>
                      <div className="font-mono font-semibold text-sm">
                        {formatGhs(o.total)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                Refill schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <DetailRow label="Last refill" value={fmt(patient.lastRefillAt)} />
              <DetailRow label="Next refill" value={fmt(patient.nextRefillAt)} />
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Quick info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <DetailRow label="Total orders" value={patient.orders.length} />
              <DetailRow
                label="Member since"
                value={fmt(patient.createdAt)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
        {label}
      </span>
      <span className="text-sm text-foreground text-right">{value}</span>
    </div>
  )
}
