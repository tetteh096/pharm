"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateConsultationStatus } from "@/app/actions/consultation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { ChevronDown } from "lucide-react"

const STATUSES = ["New", "In Progress", "Done", "Dismissed"] as const

interface Props {
  id: string
  currentStatus: string
  fullName: string
  message: string
  notes: string
}

export function ConsultationActions({ id, currentStatus, fullName, message, notes }: Props) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [internalNotes, setInternalNotes] = useState(notes)
  const [isPending, startTransition] = useTransition()

  function save() {
    const staffName = session?.user?.name ?? "Staff"
    startTransition(async () => {
      const result = await updateConsultationStatus(id, status, staffName, internalNotes)
      if (result.success) {
        toast.success(`Consultation marked as "${status}"`)
        setOpen(false)
      } else {
        toast.error("Failed to update. Please try again.")
      }
    })
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        Manage <ChevronDown size={13} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Consultation — {fullName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Their message
              </p>
              <p className="text-sm text-foreground rounded-md bg-muted px-3 py-2 leading-relaxed">
                {message}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1">
                Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1">
                Internal notes (optional)
              </label>
              <textarea
                value={internalNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInternalNotes(e.target.value)}
                placeholder="Add any follow-up notes for the team…"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={save} disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
