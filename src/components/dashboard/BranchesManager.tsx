"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Clock3,
  X,
  Building2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  createBranch,
  updateBranch,
  deleteBranch,
  toggleBranchActive,
  type BranchInput,
} from "@/app/dashboard/branches/actions"

type BranchRow = {
  id: string
  name: string
  slug: string | null
  location: string | null
  phone: string | null
  hours: string | null
  notes: string | null
  active: boolean
}

type FormState = BranchInput & { id?: string }

const emptyForm: FormState = {
  name: "",
  location: "",
  phone: "",
  hours: "",
  notes: "",
  active: true,
}

export function BranchesManager({ initialBranches }: { initialBranches: BranchRow[] }) {
  const router = useRouter()
  const [branches, setBranches] = React.useState(initialBranches)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const isEdit = Boolean(form.id)

  const openNew = () => {
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (branch: BranchRow) => {
    setForm({
      id: branch.id,
      name: branch.name,
      location: branch.location ?? "",
      phone: branch.phone ?? "",
      hours: branch.hours ?? "",
      notes: branch.notes ?? "",
      active: branch.active,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload: BranchInput = {
      name: form.name,
      location: form.location,
      phone: form.phone,
      hours: form.hours,
      notes: form.notes,
      active: form.active,
    }

    try {
      if (isEdit && form.id) {
        const updated = await updateBranch(form.id, payload)
        setBranches((prev) =>
          prev
            .map((b) =>
              b.id === updated.id
                ? {
                    id: updated.id,
                    name: updated.name,
                    slug: updated.slug,
                    location: updated.location,
                    phone: updated.phone,
                    hours: updated.hours,
                    notes: updated.notes,
                    active: updated.active,
                  }
                : b
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        )
        toast.success("Branch updated")
      } else {
        const created = await createBranch(payload)
        setBranches((prev) =>
          [
            ...prev,
            {
              id: created.id,
              name: created.name,
              slug: created.slug,
              location: created.location,
              phone: created.phone,
              hours: created.hours,
              notes: created.notes,
              active: created.active,
            },
          ].sort((a, b) => a.name.localeCompare(b.name))
        )
        toast.success(`Added "${created.name}"`)
      }
      setDialogOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save branch")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (branch: BranchRow) => {
    if (!confirm(`Delete branch "${branch.name}"?`)) return
    setDeletingId(branch.id)
    try {
      await deleteBranch(branch.id)
      setBranches((prev) => prev.filter((b) => b.id !== branch.id))
      toast.success("Branch deleted")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete")
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (branch: BranchRow) => {
    try {
      await toggleBranchActive(branch.id, !branch.active)
      setBranches((prev) =>
        prev.map((b) => (b.id === branch.id ? { ...b, active: !branch.active } : b))
      )
      toast.success(branch.active ? "Branch hidden" : "Branch active")
    } catch {
      toast.error("Could not update status")
    }
  }

  const activeCount = branches.filter((b) => b.active).length

  return (
    <div className="dashboard-page space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">
            {branches.length} branch{branches.length === 1 ? "" : "es"} · {activeCount} active
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/products">Inventory</Link>
          </Button>
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add branch
          </Button>
        </div>
      </div>

      {branches.length === 0 ? (
        <Card className="dashboard-card">
          <CardContent className="py-12 text-center">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold mb-1">No branches yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add your pharmacy branches so products can be assigned to them.
            </p>
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add your first branch
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {branches.map((branch) => (
            <Card key={branch.id} className="dashboard-card">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4" style={{ color: "#1157ee" }} />
                      {branch.name}
                    </CardTitle>
                    <CardDescription>
                      {branch.active ? (
                        <Badge
                          variant="outline"
                          className="mt-1 text-[10px] border-emerald-500/40 text-emerald-700 bg-emerald-500/5"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-1 text-[10px] text-muted-foreground">
                          Inactive
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(branch)}
                      aria-label="Edit branch"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(branch)}
                      disabled={deletingId === branch.id}
                      className="text-destructive hover:text-destructive"
                      aria-label="Delete branch"
                    >
                      {deletingId === branch.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {branch.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span>{branch.location}</span>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <a href={`tel:${branch.phone}`} className="hover:underline">
                      {branch.phone}
                    </a>
                  </div>
                )}
                {branch.hours && (
                  <div className="flex items-start gap-2">
                    <Clock3 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span>{branch.hours}</span>
                  </div>
                )}
                {branch.notes && (
                  <p className="text-xs text-muted-foreground pt-1 border-t">{branch.notes}</p>
                )}
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(branch)}
                  >
                    {branch.active ? "Set inactive" : "Set active"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit branch" : "Add new branch"}</DialogTitle>
            <DialogDescription>
              Branch details show in the product form and on the public website.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Branch name *</label>
              <Input
                placeholder="e.g. Madina, Odorkor, East Legon"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location / address</label>
              <Input
                placeholder="e.g. Madina Old Road, Accra"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  placeholder="055 461 2072"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hours</label>
                <Input
                  placeholder="24 hours / Mon-Sat 8am-8pm"
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-[#09162a] placeholder:text-[#6b7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-[oklch(0.28_0.03_260)] dark:text-[#f1f5f9] dark:placeholder:text-[#94a3b8]"
                placeholder="Optional — landmarks, services, etc."
                value={form.notes ?? ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active ?? true}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 rounded border-input"
              />
              <span>Active — show in product form & website</span>
            </label>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Add branch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
