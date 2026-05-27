"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { toast } from "sonner"
import {
  Download,
  Eye,
  HeartPulse,
  Loader2,
  Phone,
  Search,
  Trash2,
  Users,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { deletePatient, exportPatientsCsv } from "@/app/dashboard/customers/actions"

type ChronicRecord = {
  id: string
  condition: string
  status: string
  nextCheckInAt: string | null
  assignedToName: string | null
}

export type PatientRow = {
  id: string
  name: string
  phone: string | null
  email: string | null
  clientType: string
  condition: string | null
  source: string | null
  gender: string | null
  dateOfBirth: string | null
  status: string
  nextRefillAt: string | null
  lastRefillAt: string | null
  allergies: string[]
  createdAt: string
  ordersCount: number
  chronicRecord: ChronicRecord | null
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
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function PatientList({
  initialPatients,
  currentSearch,
  currentType,
  currentStatus,
}: {
  initialPatients: PatientRow[]
  currentSearch: string
  currentType: string
  currentStatus: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [patients, setPatients] = React.useState(initialPatients)
  const [searchDraft, setSearchDraft] = React.useState(currentSearch)
  const [exporting, setExporting] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  React.useEffect(() => setPatients(initialPatients), [initialPatients])

  const navigate = (next: URLSearchParams) => {
    const qs = next.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const applySearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const next = new URLSearchParams(params.toString())
    if (searchDraft.trim()) next.set("search", searchDraft.trim())
    else next.delete("search")
    navigate(next)
  }

  const setType = (value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value === "all") next.delete("type")
    else next.set("type", value)
    navigate(next)
  }

  const setStatus = (value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value === "all") next.delete("status")
    else next.set("status", value)
    navigate(next)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const csv = await exportPatientsCsv({
        search: currentSearch || undefined,
        clientType: currentType,
        status: currentStatus,
      })
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `enviro-patients_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success("Patient list exported")
    } catch (err) {
      console.error(err)
      toast.error("Could not export the patient list")
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async (p: PatientRow) => {
    if (
      !window.confirm(
        `Delete ${p.name}? This cannot be undone, and is only possible if they have no orders.`
      )
    ) {
      return
    }
    setDeletingId(p.id)
    try {
      const result = await deletePatient(p.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setPatients((prev) => prev.filter((x) => x.id !== p.id))
      toast.success(`Removed ${p.name}`)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error("Could not delete patient")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="dashboard-card rounded-lg border bg-card p-4 space-y-3">
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-[1fr_auto_auto_auto] items-end">
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
                placeholder="Name, phone, email, or condition…"
                className="pl-9"
                onBlur={applySearch}
              />
            </div>
          </form>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Client type
            </label>
            <Select value={currentType} onValueChange={setType}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Walk-in">Walk-in</SelectItem>
                <SelectItem value="Phone / Walk-in">Phone / Walk-in</SelectItem>
                <SelectItem value="Chronic Client">Chronic Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </label>
            <Select value={currentStatus} onValueChange={setStatus}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            disabled={exporting || patients.length === 0}
            className="gap-2"
          >
            {exporting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            Export CSV
          </Button>
        </div>
      </div>

      <div className="dashboard-card rounded-lg border bg-card overflow-hidden">
        {patients.length === 0 ? (
          <div className="p-10 text-center">
            <div
              className="mx-auto mb-3 inline-flex items-center justify-center rounded-full"
              style={{
                width: 56,
                height: 56,
                background: "rgba(19, 236, 138, 0.1)",
              }}
            >
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="font-semibold">No patients match your filters</p>
            <p className="text-sm text-muted-foreground mt-1">
              Adjust the filters above or add a new patient manually.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/customers/new">Create a patient</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden lg:table-cell">Demographics</TableHead>
                <TableHead className="hidden xl:table-cell">Refills</TableHead>
                <TableHead className="hidden lg:table-cell">Orders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => {
                const age = ageFromDob(p.dateOfBirth)
                return (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() =>
                      router.push(`/dashboard/customers/${p.id}`)
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
                          style={{
                            width: 36,
                            height: 36,
                            background:
                              "linear-gradient(135deg, var(--p1-clr, #13ec8a), var(--p2-clr, #1157ee))",
                          }}
                        >
                          {initials(p.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{p.name}</div>
                          {p.chronicRecord && (
                            <div className="flex items-center gap-1 text-[11px] text-primary font-semibold">
                              <HeartPulse size={11} />
                              {p.chronicRecord.condition}
                            </div>
                          )}
                          {!p.chronicRecord && p.condition && (
                            <div className="text-[11px] text-muted-foreground truncate">
                              {p.condition}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {p.phone ? (
                        <a
                          href={`tel:${p.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          {p.phone}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                      {p.email && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {p.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.clientType === "Chronic Client"
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {p.clientType}
                      </Badge>
                      {p.source && (
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {p.source}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {age != null ? `${age}y` : "—"}
                      {p.gender ? ` · ${p.gender}` : ""}
                      {p.allergies.length > 0 && (
                        <div className="text-[10px] text-red-500 mt-1">
                          Allergies: {p.allergies.slice(0, 2).join(", ")}
                          {p.allergies.length > 2 ? "…" : ""}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-xs">
                      <div>Last: {fmtDate(p.lastRefillAt)}</div>
                      <div className="text-muted-foreground">
                        Next: {fmtDate(p.nextRefillAt)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs font-mono">
                      {p.ordersCount}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          p.status === "Active"
                            ? "bg-emerald-400/10 text-emerald-500 ring-emerald-400/20"
                            : p.status === "Inactive"
                              ? "bg-yellow-400/10 text-yellow-600 ring-yellow-400/20"
                              : "bg-slate-400/10 text-slate-500 ring-slate-400/20"
                        }`}
                      >
                        <span
                          className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                            p.status === "Active"
                              ? "bg-emerald-500"
                              : p.status === "Inactive"
                                ? "bg-yellow-500"
                                : "bg-slate-500"
                          }`}
                        />
                        {p.status}
                      </span>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="View patient"
                        >
                          <Link href={`/dashboard/customers/${p.id}`}>
                            <Eye size={14} />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                          title="Delete patient"
                        >
                          {deletingId === p.id ? (
                            <Loader2
                              size={14}
                              className="animate-spin text-destructive"
                            />
                          ) : (
                            <Trash2
                              size={14}
                              className="text-muted-foreground hover:text-destructive"
                            />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
