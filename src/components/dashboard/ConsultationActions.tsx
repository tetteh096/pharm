"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateConsultationStatus } from "@/app/actions/consultation"
import type { StaffOption } from "@/components/dashboard/ConsultationsList"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  ChevronDown,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Save,
  UserRound,
} from "lucide-react"

const STATUSES = ["New", "In Progress", "Done", "Dismissed"] as const

const TEXTAREA_CLASS =
  "flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

interface Props {
  id: string
  currentStatus: string
  fullName: string
  email: string
  phone: string
  medicationInterest: string | null
  message: string
  notes: string
  handledById: string | null
  handledByName: string | null
  handledAt: string | null
  staffOptions: StaffOption[]
}

export function ConsultationActions({
  id,
  currentStatus,
  fullName,
  email,
  phone,
  medicationInterest,
  message,
  notes,
  handledById,
  handledByName,
  handledAt,
  staffOptions,
}: Props) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [internalNotes, setInternalNotes] = useState(notes)
  const [pharmacistId, setPharmacistId] = useState<string>(
    handledById ?? session?.user?.id ?? "unassigned"
  )
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setStatus(currentStatus)
      setInternalNotes(notes)
      setPharmacistId(handledById ?? session?.user?.id ?? "unassigned")
    }
  }, [open, currentStatus, notes, handledById, session?.user?.id])

  function save() {
    const resolvedId = pharmacistId === "unassigned" ? null : pharmacistId
    startTransition(async () => {
      const result = await updateConsultationStatus(id, status, resolvedId, internalNotes)
      if (result.success) {
        toast.success("Consultation updated")
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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
          <SheetHeader className="sticky top-0 z-10 border-b bg-background px-6 py-5">
            <div className="flex items-start gap-3 pr-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageSquare size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-lg leading-tight">
                  Consultation request
                </SheetTitle>
                <SheetDescription className="mt-1 text-sm">
                  From{" "}
                  <span className="font-medium text-foreground">{fullName}</span>.
                  Assign a pharmacist and update status for follow-up.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
              <section className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Patient contact
                </h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <a href={`mailto:${email}`} className="hover:text-foreground">
                      {email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <a href={`tel:${phone}`} className="hover:text-foreground">
                      {phone}
                    </a>
                  </div>
                  {medicationInterest ? (
                    <div className="text-muted-foreground">
                      <span className="font-medium text-foreground">Medication interest:</span>{" "}
                      {medicationInterest}
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="space-y-1.5">
                <Label>Their message</Label>
                <p className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5 text-sm leading-relaxed text-foreground">
                  {message}
                </p>
              </section>

              <section className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Assignment
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="consultation-pharmacist">Pharmacist handling this</Label>
                    <Select value={pharmacistId} onValueChange={setPharmacistId}>
                      <SelectTrigger id="consultation-pharmacist" className="h-10 w-full">
                        <SelectValue placeholder="Select pharmacist" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {staffOptions.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name ?? "Staff"}
                            {s.role ? ` (${s.role})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {handledByName && handledAt ? (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <UserRound className="h-3 w-3" />
                        Last updated by {handledByName} on{" "}
                        {new Date(handledAt).toLocaleDateString("en-GH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="consultation-status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="consultation-status" className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <section className="space-y-1.5">
                <Label htmlFor="consultation-notes">Internal notes (optional)</Label>
                <textarea
                  id="consultation-notes"
                  value={internalNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setInternalNotes(e.target.value)
                  }
                  placeholder="Add follow-up notes for the team…"
                  rows={5}
                  className={TEXTAREA_CLASS}
                />
              </section>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t bg-background px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={save}
              disabled={isPending}
              className="min-w-[140px] gap-2"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
