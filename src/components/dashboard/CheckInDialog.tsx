"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, MessageCircle, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { logCheckIn } from "@/app/dashboard/chronic/actions"

const METHOD_OPTIONS = [
  { value: "PHONE", label: "Phone call" },
  { value: "IN_PERSON", label: "In person" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "SMS", label: "SMS" },
  { value: "EMAIL", label: "Email" },
]

const OUTCOME_OPTIONS = [
  { value: "REACHED", label: "Reached — patient is doing okay" },
  { value: "NEEDS_REFILL", label: "Needs a refill / pickup" },
  { value: "REFILLED", label: "Refill completed today" },
  { value: "NO_ANSWER", label: "No answer — will try again" },
  { value: "RESCHEDULED", label: "Rescheduled the check-in" },
  { value: "OTHER", label: "Other (see notes)" },
]

const TEXTAREA_CLASS =
  "flex min-h-[90px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-[oklch(0.28_0.03_260)] dark:text-foreground"

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
  const [nextCheckIn, setNextCheckIn] = React.useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })
  const [submitting, setSubmitting] = React.useState(false)

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
      setNotes("")
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle size={18} className="text-primary" />
            Log check-in for {patientName}
          </DialogTitle>
          <DialogDescription>
            Record how the contact went so the team has a full history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="method">Contact method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="method">
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
            <div className="space-y-1.5">
              <Label htmlFor="outcome">Outcome</Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger id="outcome">
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

          <label className="flex items-start gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={needsRefill}
              onChange={(e) => setNeedsRefill(e.target.checked)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">Patient needs a refill</div>
              <div className="text-xs text-muted-foreground">
                Flags this on the patient&apos;s history so any staff member
                can see it at a glance.
              </div>
            </div>
          </label>

          <div className="space-y-1.5">
            <Label htmlFor="notes">What happened?</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Patient mentioned shortness of breath, scheduled clinic visit for next Tuesday…"
              className={TEXTAREA_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="next">Schedule next check-in</Label>
            <Input
              id="next"
              type="date"
              value={nextCheckIn}
              onChange={(e) => setNextCheckIn(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Updates the patient&apos;s next contact date. Leave blank to
              clear it.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="gap-2"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            Save check-in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
