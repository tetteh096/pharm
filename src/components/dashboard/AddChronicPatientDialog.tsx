"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  Check,
  HeartPulse,
  Loader2,
  Phone,
  Plus,
  Search,
  UserPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  addChronicCare,
  searchPatientsForChronic,
  type ChronicEligiblePatient,
} from "@/app/dashboard/chronic/actions"

const TEXTAREA_CLASS =
  "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

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

export function AddChronicPatientDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [stage, setStage] = React.useState<"search" | "form">("search")

  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<ChronicEligiblePatient[]>([])
  const [searching, setSearching] = React.useState(false)

  const [selected, setSelected] =
    React.useState<ChronicEligiblePatient | null>(null)

  const [condition, setCondition] = React.useState("")
  const [medsRaw, setMedsRaw] = React.useState("")
  const [schedule, setSchedule] = React.useState("")
  const [status, setStatus] = React.useState("Active")
  const [nextCheckIn, setNextCheckIn] = React.useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })
  const [notes, setNotes] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setStage("search")
      setQuery("")
      setResults([])
      setSelected(null)
      setCondition("")
      setMedsRaw("")
      setSchedule("")
      setStatus("Active")
      setNotes("")
    }
  }, [open])

  React.useEffect(() => {
    if (!open || stage !== "search") return
    let cancelled = false
    setSearching(true)
    const handle = setTimeout(async () => {
      try {
        const hits = await searchPatientsForChronic(query, 12)
        if (!cancelled) setResults(hits)
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [query, open, stage])

  const pickPatient = (p: ChronicEligiblePatient) => {
    setSelected(p)
    setCondition(p.condition ?? "")
    setStage("form")
  }

  const submit = async () => {
    if (!selected) return
    if (!condition.trim()) {
      toast.error("Please add a condition")
      return
    }
    setSubmitting(true)
    try {
      await addChronicCare({
        customerId: selected.id,
        condition,
        currentMedications: medsRaw
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
        dosageSchedule: schedule || null,
        nextCheckInAt: nextCheckIn || null,
        status,
        notes: notes || null,
      })
      toast.success(`${selected.name} added to chronic care`)
      setOpen(false)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error(
        err instanceof Error ? err.message : "Could not add to chronic care"
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <HeartPulse size={14} />
          Add chronic patient
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 gap-0"
      >
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-center gap-2.5">
            {stage === "form" && (
              <button
                type="button"
                onClick={() => setStage("search")}
                className="rounded-md p-1 -ml-1 hover:bg-muted transition-colors"
                aria-label="Back to patient search"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <HeartPulse size={18} />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base">
                {stage === "search"
                  ? "Choose a patient"
                  : `Start chronic care`}
              </SheetTitle>
              <SheetDescription className="text-xs">
                {stage === "search"
                  ? "Only patients without an existing chronic record appear here."
                  : selected
                    ? `For ${selected.name}. You'll be assigned as their staff contact.`
                    : "You'll be assigned as the staff contact."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {stage === "search" ? (
            <div className="space-y-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name, phone, email, or known condition…"
                  className="pl-9 h-10"
                  autoFocus
                />
              </div>

              <div className="rounded-lg border bg-card overflow-hidden">
                {searching && results.length === 0 ? (
                  <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" />
                    Searching…
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                    {query
                      ? `No eligible patients match "${query}".`
                      : "No patients available yet. Create one first."}
                  </div>
                ) : (
                  results.map((p) => {
                    const age = ageFromDob(p.dateOfBirth)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => pickPatient(p)}
                        className="group flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors border-b last:border-b-0"
                      >
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
                        <div className="flex-grow min-w-0">
                          <div className="font-medium text-sm truncate text-foreground">
                            {p.name}
                          </div>
                          <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2">
                            {p.phone && (
                              <span className="flex items-center gap-1">
                                <Phone size={10} />
                                {p.phone}
                              </span>
                            )}
                            {age != null && (
                              <span>
                                {age}y
                                {p.gender ? ` · ${p.gender}` : ""}
                              </span>
                            )}
                            {p.condition && (
                              <span className="truncate max-w-[180px]">
                                · {p.condition}
                              </span>
                            )}
                          </div>
                        </div>
                        <Check
                          size={14}
                          className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </button>
                    )
                  })
                )}
              </div>

              <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserPlus size={14} />
                  Patient not in the system yet?
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link href="/dashboard/customers/new">Create</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-3">
                <div
                  className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
                  style={{
                    width: 40,
                    height: 40,
                    background:
                      "linear-gradient(135deg, var(--p1-clr, #13ec8a), var(--p2-clr, #1157ee))",
                  }}
                >
                  {selected ? initials(selected.name) : "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-foreground">
                    {selected?.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selected?.phone ?? "No phone"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStage("search")}
                  className="text-xs text-primary hover:underline"
                >
                  Change
                </button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="condition2">Primary condition *</Label>
                <Input
                  id="condition2"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="e.g. Hypertension"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meds2">Current medications</Label>
                <Input
                  id="meds2"
                  value={medsRaw}
                  onChange={(e) => setMedsRaw(e.target.value)}
                  placeholder="e.g. Lisinopril 10mg, Metformin 500mg"
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="schedule2">Dosage schedule</Label>
                <Input
                  id="schedule2"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="e.g. 1 tablet daily after breakfast"
                  className="h-10"
                />
              </div>
              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="nextCheck2">Next check-in</Label>
                  <Input
                    id="nextCheck2"
                    type="date"
                    value={nextCheckIn}
                    onChange={(e) => setNextCheckIn(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="status2">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status2" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes2">Notes</Label>
                <textarea
                  id="notes2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Anything the next person calling them should know."
                  className={TEXTAREA_CLASS}
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t bg-card px-5 py-3 flex items-center justify-end gap-2">
          {stage === "form" ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setStage("search")}
                disabled={submitting}
              >
                Back
              </Button>
              <Button
                onClick={submit}
                disabled={submitting}
                className="gap-2"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                Start chronic care
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
