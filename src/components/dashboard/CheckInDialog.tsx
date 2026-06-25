"use client"

import * as React from "react"
import { toast } from "sonner"
import { CalendarClock, Loader2, MessageCircle, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DashboardSheetContent } from "@/components/dashboard/DashboardSheetContent"
import { cn } from "@/lib/utils"
import { logCheckIn } from "@/app/dashboard/chronic/actions"

const METHOD_OPTIONS = [
  { value: "PHONE", label: "Phone call" },
  { value: "IN_PERSON", label: "In person" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "SMS", label: "SMS" },
  { value: "EMAIL", label: "Email" },
]

const OUTCOME_OPTIONS = [
  { value: "REACHED", label: "Reached: patient is doing okay" },
  { value: "NEEDS_REFILL", label: "Needs a refill / pickup" },
  { value: "REFILLED", label: "Refill completed today" },
  { value: "NO_ANSWER", label: "No answer: will try again" },
  { value: "RESCHEDULED", label: "Rescheduled the check-in" },
  { value: "OTHER", label: "Other (see notes)" },
]

const TEXTAREA_CLASS =
  "flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function defaultNextCheckIn() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

export function CheckInDialog({
  chronicPatientId,
  patientName,
  open,
  onOpenChange,
  onSuccess,
}: {
  chronicPatientId: string
  patientName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const [method, setMethod] = React.useState("PHONE")
  const [outcome, setOutcome] = React.useState("REACHED")
  const [needsRefill, setNeedsRefill] = React.useState(false)
  const [notes, setNotes] = React.useState("")
  const [nextCheckIn, setNextCheckIn] = React.useState(defaultNextCheckIn)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setMethod("PHONE")
      setOutcome("REACHED")
      setNeedsRefill(false)
      setNotes("")
      setNextCheckIn(defaultNextCheckIn())
    }
  }, [open])

  React.useEffect(() => {
    if (outcome === "NEEDS_REFILL") setNeedsRefill(true)
    if (outcome === "REFILLED") setNeedsRefill(false)
  }, [outcome])

  const submit = async () => {
    setSubmitting(true)
    try {
      await logCheckIn(chronicPatientId, {
        method,
        outcome,
        needsRefill,
        notes: notes || null,
        nextCheckInAt: nextCheckIn || null,
      })
      toast.success(`Check-in logged for ${patientName}`)
      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error(
        err instanceof Error ? err.message : "Could not log the check-in"
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <DashboardSheetContent>
        <SheetHeader className="sticky top-0 z-10 border-b bg-background px-6 py-5">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageCircle size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-xl leading-tight">
                Log check-in
              </SheetTitle>
              <SheetDescription className="mt-1 text-base">
                Record how the contact went for{" "}
                <span className="font-medium text-foreground">{patientName}</span>.
                This is saved to the patient history for the whole team.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex w-full flex-col gap-5 min-w-0">
            <section className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Contact details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="method">Contact method</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger id="method" className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {METHOD_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="outcome">Outcome</Label>
                  <Select value={outcome} onValueChange={setOutcome}>
                    <SelectTrigger id="outcome" className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OUTCOME_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                needsRefill
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/70 bg-card hover:bg-muted/30"
              )}
            >
              <input
                type="checkbox"
                checked={needsRefill}
                onChange={(e) => setNeedsRefill(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
              />
              <div>
                <div className="text-sm font-medium">Patient needs a refill</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Flags this on the patient history so any staff member can see
                  it at a glance.
                </div>
              </div>
            </label>

            <section className="space-y-1.5">
              <Label htmlFor="notes">What happened?</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="Patient mentioned shortness of breath, scheduled clinic visit for next Tuesday…"
                className={TEXTAREA_CLASS}
              />
            </section>

            <section className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <CalendarClock className="h-4 w-4 text-primary" />
                Follow-up
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="next">Schedule next check-in</Label>
                <Input
                  id="next"
                  type="date"
                  value={nextCheckIn}
                  onChange={(e) => setNextCheckIn(e.target.value)}
                  className="h-10 max-w-xs bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Updates the patient&apos;s next contact date. Leave blank to
                  clear it.
                </p>
              </div>
            </section>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-background px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="min-w-[140px] gap-2"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Save check-in
          </Button>
        </div>
      </DashboardSheetContent>
    </Sheet>
  )
}
