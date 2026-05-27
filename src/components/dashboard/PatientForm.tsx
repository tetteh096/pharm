"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Calendar,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  StickyNote,
  User,
  UserPlus,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  createPatient,
  updatePatient,
  type PatientInput,
} from "@/app/dashboard/customers/actions"

const TEXTAREA_CLASS =
  "flex min-h-[90px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-[oklch(0.28_0.03_260)] dark:text-foreground"

export type ExistingPatient = {
  id: string
  name: string
  phone: string | null
  email: string | null
  dateOfBirth: string | null
  gender: string | null
  address: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  allergies: string[]
  medicalNotes: string | null
  clientType: string
  condition: string | null
  source: string | null
  notes: string | null
  status: string
  lastRefillAt: string | null
  nextRefillAt: string | null
}

const toDateInput = (iso: string | null) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : ""

export function PatientForm({
  existing,
}: {
  existing?: ExistingPatient | null
}) {
  const router = useRouter()
  const isEdit = Boolean(existing)

  const [form, setForm] = React.useState<PatientInput>({
    name: existing?.name ?? "",
    phone: existing?.phone ?? "",
    email: existing?.email ?? "",
    dateOfBirth: toDateInput(existing?.dateOfBirth ?? null),
    gender: existing?.gender ?? "",
    address: existing?.address ?? "",
    emergencyContactName: existing?.emergencyContactName ?? "",
    emergencyContactPhone: existing?.emergencyContactPhone ?? "",
    allergies: existing?.allergies ?? [],
    medicalNotes: existing?.medicalNotes ?? "",
    clientType: existing?.clientType ?? "Regular",
    condition: existing?.condition ?? "",
    source: existing?.source ?? "Manual entry",
    notes: existing?.notes ?? "",
    status: existing?.status ?? "Active",
    lastRefillAt: toDateInput(existing?.lastRefillAt ?? null),
    nextRefillAt: toDateInput(existing?.nextRefillAt ?? null),
  })

  const [allergyDraft, setAllergyDraft] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const setField = <K extends keyof PatientInput>(
    key: K,
    value: PatientInput[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  const addAllergy = () => {
    const v = allergyDraft.trim()
    if (!v) return
    if (form.allergies?.includes(v)) {
      setAllergyDraft("")
      return
    }
    setField("allergies", [...(form.allergies ?? []), v])
    setAllergyDraft("")
  }

  const removeAllergy = (idx: number) => {
    setField(
      "allergies",
      (form.allergies ?? []).filter((_, i) => i !== idx)
    )
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name?.trim()) {
      toast.error("Please enter the patient name")
      return
    }
    setSubmitting(true)
    try {
      let saved
      if (isEdit && existing) {
        saved = await updatePatient(existing.id, form)
        toast.success(`${saved.name} updated`)
      } else {
        saved = await createPatient(form)
        toast.success(`${saved.name} added`)
      }
      router.push(`/dashboard/customers/${saved.id}`)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Could not save patient")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={18} className="text-primary" /> Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Full name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                required
                placeholder="e.g. Akosua Boateng"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">
                <Phone size={12} className="inline mr-1" /> Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                value={form.phone ?? ""}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="024 123 4567"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">
                <Mail size={12} className="inline mr-1" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="patient@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dob">
                <Calendar size={12} className="inline mr-1" /> Date of birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={form.dateOfBirth ?? ""}
                onChange={(e) => setField("dateOfBirth", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={form.gender || "unset"}
                onValueChange={(v) =>
                  setField("gender", v === "unset" ? "" : v)
                }
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unset">Prefer not to say</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address">
                <MapPin size={12} className="inline mr-1" /> Address
              </Label>
              <textarea
                id="address"
                value={form.address ?? ""}
                onChange={(e) => setField("address", e.target.value)}
                rows={2}
                placeholder="House, street, area, city"
                className={TEXTAREA_CLASS}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus size={18} className="text-primary" /> Emergency contact
            </CardTitle>
            <CardDescription>
              Who to reach if we can&apos;t get the patient on the phone.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ecName">Contact name</Label>
              <Input
                id="ecName"
                value={form.emergencyContactName ?? ""}
                onChange={(e) =>
                  setField("emergencyContactName", e.target.value)
                }
                placeholder="Spouse, sibling, next of kin"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ecPhone">Contact phone</Label>
              <Input
                id="ecPhone"
                type="tel"
                inputMode="tel"
                value={form.emergencyContactPhone ?? ""}
                onChange={(e) =>
                  setField("emergencyContactPhone", e.target.value)
                }
                placeholder="024 555 1212"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart size={18} className="text-primary" /> Medical profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Allergies</Label>
              <div className="flex gap-2">
                <Input
                  value={allergyDraft}
                  onChange={(e) => setAllergyDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addAllergy()
                    }
                  }}
                  placeholder="e.g. Penicillin"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAllergy}
                  disabled={!allergyDraft.trim()}
                  className="gap-1"
                >
                  <Plus size={14} /> Add
                </Button>
              </div>
              {form.allergies && form.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {form.allergies.map((a, idx) => (
                    <span
                      key={a + idx}
                      className="inline-flex items-center gap-1 rounded-full bg-red-500/10 text-red-600 px-3 py-1 text-xs font-medium"
                    >
                      {a}
                      <button
                        type="button"
                        onClick={() => removeAllergy(idx)}
                        className="ml-0.5 hover:opacity-70"
                        aria-label={`Remove ${a}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="condition">Known conditions / diagnoses</Label>
              <Input
                id="condition"
                value={form.condition ?? ""}
                onChange={(e) => setField("condition", e.target.value)}
                placeholder="e.g. Hypertension, Type 2 Diabetes"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="medicalNotes">Medical notes</Label>
              <textarea
                id="medicalNotes"
                value={form.medicalNotes ?? ""}
                onChange={(e) => setField("medicalNotes", e.target.value)}
                rows={4}
                placeholder="Current medications, dosage notes, past reactions, anything the pharmacist should know."
                className={TEXTAREA_CLASS}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote size={18} className="text-primary" /> Internal notes
            </CardTitle>
            <CardDescription>
              Not shown to the patient. Useful for follow-up reminders or staff
              context.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => setField("notes", e.target.value)}
              rows={3}
              placeholder="Anything else relevant…"
              className={TEXTAREA_CLASS}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="dashboard-card sticky top-4">
          <CardHeader>
            <CardTitle>Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="clientType">Client type</Label>
              <Select
                value={form.clientType}
                onValueChange={(v) => setField("clientType", v)}
              >
                <SelectTrigger id="clientType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Walk-in">Walk-in</SelectItem>
                  <SelectItem value="Phone / Walk-in">
                    Phone / Walk-in
                  </SelectItem>
                  <SelectItem value="Chronic Client">
                    Chronic Client
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Set this to Chronic Client manually, or use &ldquo;Add to
                chronic care&rdquo; from the patient page for the full chronic
                workflow.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="source">Source</Label>
              <Select
                value={form.source || "Manual entry"}
                onValueChange={(v) => setField("source", v)}
              >
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual entry">Manual entry</SelectItem>
                  <SelectItem value="Online order">Online order</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Walk-in">Walk-in</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setField("status", v)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastRefill">Last refill</Label>
              <Input
                id="lastRefill"
                type="date"
                value={form.lastRefillAt ?? ""}
                onChange={(e) => setField("lastRefillAt", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nextRefill">Next refill date</Label>
              <Input
                id="nextRefill"
                type="date"
                value={form.nextRefillAt ?? ""}
                onChange={(e) => setField("nextRefillAt", e.target.value)}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isEdit ? "Save changes" : "Create patient"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
