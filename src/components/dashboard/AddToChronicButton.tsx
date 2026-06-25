"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HeartPulse, Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { DashboardSheetContent } from "@/components/dashboard/DashboardSheetContent"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addChronicCare } from "@/app/dashboard/chronic/actions"

const TEXTAREA_CLASS =
  "flex min-h-[72px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function AddToChronicButton({
  customerId,
  defaultCondition,
}: {
  customerId: string
  defaultCondition: string
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const [condition, setCondition] = React.useState(defaultCondition)
  const [medsRaw, setMedsRaw] = React.useState("")
  const [schedule, setSchedule] = React.useState("")
  const [nextCheckIn, setNextCheckIn] = React.useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })
  const [status, setStatus] = React.useState("Active")
  const [notes, setNotes] = React.useState("")

  const submit = async () => {
    if (!condition.trim()) {
      toast.error("Please add a condition")
      return
    }
    setSubmitting(true)
    try {
      await addChronicCare({
        customerId,
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
      toast.success("Added to chronic care")
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
          Add to chronic care
        </Button>
      </SheetTrigger>
      <DashboardSheetContent>
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <HeartPulse size={18} />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base">Start chronic care</SheetTitle>
              <SheetDescription className="text-xs">
                You&apos;ll be assigned as the staff member responsible for
                this patient&apos;s monthly check-ins.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="condition">Primary condition *</Label>
            <Input
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g. Hypertension"
              className="h-10"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meds">Current medications</Label>
            <Input
              id="meds"
              value={medsRaw}
              onChange={(e) => setMedsRaw(e.target.value)}
              placeholder="e.g. Lisinopril 10mg, Metformin 500mg"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="schedule">Dosage schedule</Label>
            <Input
              id="schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="e.g. 1 tablet daily after breakfast"
              className="h-10"
            />
          </div>
          <div className="grid gap-3 grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nextCheckIn">Next check-in</Label>
              <Input
                id="nextCheckIn"
                type="date"
                value={nextCheckIn}
                onChange={(e) => setNextCheckIn(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="h-10">
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
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Anything the next person calling them should know."
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>

        <div className="border-t bg-card px-5 py-3 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
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
              <Plus size={14} />
            )}
            Add to chronic care
          </Button>
        </div>
      </DashboardSheetContent>
    </Sheet>
  )
}
