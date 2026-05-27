"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Loader2,
  MessageCircle,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react"

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
import { CheckInDialog } from "@/components/dashboard/CheckInDialog"
import {
  removeChronicCare,
  updateChronicCare,
} from "@/app/dashboard/chronic/actions"

const TEXTAREA_CLASS =
  "flex min-h-[90px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-[oklch(0.28_0.03_260)] dark:text-foreground"

type RecordSnapshot = {
  id: string
  patientName: string
  status: string
  condition: string
  currentMedications: string[]
  dosageSchedule: string | null
  nextCheckInAt: string | null
  notes: string | null
  customerId: string
}

export function ChronicPatientActions({ record }: { record: RecordSnapshot }) {
  const router = useRouter()
  const [checkInOpen, setCheckInOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [removing, setRemoving] = React.useState(false)

  const [form, setForm] = React.useState({
    condition: record.condition,
    medsRaw: record.currentMedications.join(", "),
    dosageSchedule: record.dosageSchedule ?? "",
    nextCheckInAt: record.nextCheckInAt
      ? new Date(record.nextCheckInAt).toISOString().slice(0, 10)
      : "",
    status: record.status,
    notes: record.notes ?? "",
  })
  const [savingEdit, setSavingEdit] = React.useState(false)

  const saveEdit = async () => {
    if (!form.condition.trim()) {
      toast.error("Condition can't be empty")
      return
    }
    setSavingEdit(true)
    try {
      await updateChronicCare(record.id, {
        condition: form.condition,
        currentMedications: form.medsRaw
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
        dosageSchedule: form.dosageSchedule || null,
        nextCheckInAt: form.nextCheckInAt || null,
        status: form.status,
        notes: form.notes || null,
      })
      toast.success("Chronic record updated")
      setEditOpen(false)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error(
        err instanceof Error ? err.message : "Could not update record"
      )
    } finally {
      setSavingEdit(false)
    }
  }

  const remove = async () => {
    if (
      !window.confirm(
        `Stop chronic care for ${record.patientName}? Their patient record stays, but they'll be reverted to a Regular client.`
      )
    ) {
      return
    }
    setRemoving(true)
    try {
      await removeChronicCare(record.id)
      toast.success("Removed from chronic care")
      router.push("/dashboard/chronic")
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error("Could not remove the chronic record")
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => setCheckInOpen(true)} className="gap-2">
        <MessageCircle size={14} />
        Log check-in
      </Button>
      <Button
        variant="outline"
        onClick={() => setEditOpen(true)}
        className="gap-2"
      >
        <Pencil size={14} />
        Edit
      </Button>
      <Button
        variant="ghost"
        onClick={remove}
        disabled={removing}
        className="gap-2 text-destructive hover:text-destructive"
      >
        {removing ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Trash2 size={14} />
        )}
        Stop care
      </Button>

      <CheckInDialog
        chronicPatientId={record.id}
        patientName={record.patientName}
        open={checkInOpen}
        onOpenChange={setCheckInOpen}
        onSuccess={() => router.refresh()}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit chronic record</DialogTitle>
            <DialogDescription>
              Update {record.patientName}&apos;s treatment plan and schedule.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="condition">Primary condition</Label>
              <Input
                id="condition"
                value={form.condition}
                onChange={(e) =>
                  setForm((p) => ({ ...p, condition: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meds">Current medications</Label>
              <Input
                id="meds"
                value={form.medsRaw}
                onChange={(e) =>
                  setForm((p) => ({ ...p, medsRaw: e.target.value }))
                }
                placeholder="Comma-separated"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="schedule">Dosage schedule</Label>
              <Input
                id="schedule"
                value={form.dosageSchedule}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dosageSchedule: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="next">Next check-in</Label>
                <Input
                  id="next"
                  type="date"
                  value={form.nextCheckInAt}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nextCheckInAt: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, status: v }))
                  }
                >
                  <SelectTrigger id="status">
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
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={3}
                className={TEXTAREA_CLASS}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditOpen(false)}
              disabled={savingEdit}
            >
              <X size={14} className="mr-1" />
              Cancel
            </Button>
            <Button
              onClick={saveEdit}
              disabled={savingEdit}
              className="gap-2"
            >
              {savingEdit ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
