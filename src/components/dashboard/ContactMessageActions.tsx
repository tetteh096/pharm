"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { DashboardSheetContent } from "@/components/dashboard/DashboardSheetContent"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateContactMessageStatus } from "@/app/actions/contact"
import type { StaffOption } from "@/components/dashboard/ConsultationsList"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  ChevronDown,
  Loader2,
  Mail,
  MapPin,
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
  branchName: string
  subject: string
  message: string
  notes: string
  handledById: string | null
  handledByName: string | null
  handledAt: string | null
  staffOptions: StaffOption[]
}

export function ContactMessageActions({
  id,
  currentStatus,
  fullName,
  email,
  phone,
  branchName,
  subject,
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
  const [handlerId, setHandlerId] = useState<string>(
    handledById ?? session?.user?.id ?? "unassigned"
  )
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setStatus(currentStatus)
      setInternalNotes(notes)
      setHandlerId(handledById ?? session?.user?.id ?? "unassigned")
    }
  }, [open, currentStatus, notes, handledById, session?.user?.id])

  function save() {
    const resolvedId = handlerId === "unassigned" ? null : handlerId
    startTransition(async () => {
      const result = await updateContactMessageStatus(id, status, resolvedId, internalNotes)
      if (result.success) {
        toast.success("Message updated")
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
        <DashboardSheetContent>
          <SheetHeader className="sticky top-0 z-10 border-b bg-background px-6 py-5">
            <div className="flex items-start gap-3 pr-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-lg leading-tight">{subject}</SheetTitle>
                <SheetDescription className="mt-1 text-sm">
                  From{" "}
                  <span className="font-medium text-foreground">{fullName}</span> ·{" "}
                  {branchName.replace(" Branch", "")}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
              <section className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Contact details
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
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {branchName}
                  </div>
                </div>
              </section>

              <section className="space-y-1.5">
                <Label>Message</Label>
                <p className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5 text-sm leading-relaxed text-foreground">
                  {message}
                </p>
              </section>

              <section className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Follow-up
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-handler">Handled by</Label>
                    <Select value={handlerId} onValueChange={setHandlerId}>
                      <SelectTrigger id="contact-handler" className="h-10 w-full">
                        <SelectValue placeholder="Select staff" />
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
                    <Label htmlFor="contact-status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="contact-status" className="h-10 w-full">
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
                <Label htmlFor="contact-notes">Internal notes (optional)</Label>
                <textarea
                  id="contact-notes"
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
        </DashboardSheetContent>
      </Sheet>
    </>
  )
}
