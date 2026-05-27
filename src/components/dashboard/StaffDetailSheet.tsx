"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Building2,
  Calendar,
  Key,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Save,
  Shield,
  UserCheck,
  UserX,
  X,
} from "lucide-react"
import { Role } from "@prisma/client"

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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  adminResetPassword,
  toggleUserActive,
  updateUser,
} from "@/app/actions/users"

export type StaffUser = {
  id: string
  name: string
  email: string
  role: Role
  department: string | null
  phone: string | null
  active: boolean
  createdAt: Date | string
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  PHARMACIST: "Pharmacist",
  STAFF: "Staff",
}

const ROLE_PILLS: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-700 border-red-200",
  PHARMACIST: "bg-teal-100 text-teal-700 border-teal-200",
  STAFF: "bg-slate-100 text-slate-600 border-slate-200",
}

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  )
}

function formatDate(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

type Props = {
  user: StaffUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isSelf: boolean
  onUserUpdated: (u: StaffUser) => void
}

export function StaffDetailSheet({
  user,
  open,
  onOpenChange,
  isSelf,
  onUserUpdated,
}: Props) {
  const [editing, setEditing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [working, setWorking] = React.useState(false)
  const [resetting, setResetting] = React.useState(false)
  const [showReset, setShowReset] = React.useState(false)
  const [newPassword, setNewPassword] = React.useState("")

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    role: "STAFF" as Role,
    department: "",
    phone: "",
  })

  React.useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department ?? "",
        phone: user.phone ?? "",
      })
    }
    setEditing(false)
    setShowReset(false)
    setNewPassword("")
  }, [user])

  if (!user) return null

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required")
      return
    }
    setSaving(true)
    try {
      const updated = await updateUser(user.id, {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        department: form.department.trim() || null,
        phone: form.phone.trim() || null,
      })
      onUserUpdated(updated)
      toast.success("Staff updated")
      setEditing(false)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Update failed")
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async () => {
    setWorking(true)
    try {
      await toggleUserActive(user.id, !user.active)
      onUserUpdated({ ...user, active: !user.active })
      toast.success(user.active ? "Account deactivated" : "Account reactivated")
    } catch (err) {
      console.error(err)
      toast.error("Could not update status")
    } finally {
      setWorking(false)
    }
  }

  const submitReset = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setResetting(true)
    try {
      await adminResetPassword(user.id, newPassword)
      toast.success("Password reset")
      setShowReset(false)
      setNewPassword("")
    } catch (err) {
      console.error(err)
      toast.error("Could not reset password")
    } finally {
      setResetting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 gap-0">
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {initialsOf(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-base truncate">
                {user.name}
              </SheetTitle>
              <SheetDescription className="text-xs flex items-center gap-2 mt-0.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${ROLE_PILLS[user.role]}`}
                >
                  {ROLE_LABELS[user.role]}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    user.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <span
                    className={`w-1 h-1 rounded-full ${user.active ? "bg-emerald-500" : "bg-slate-400"}`}
                  />
                  {user.active ? "Active" : "Inactive"}
                </span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {!editing ? (
            <div className="space-y-3">
              <DetailRow
                icon={<Mail size={14} />}
                label="Email"
                value={user.email}
              />
              <DetailRow
                icon={<Phone size={14} />}
                label="Phone"
                value={user.phone || "—"}
              />
              <DetailRow
                icon={<Building2 size={14} />}
                label="Department"
                value={user.department || "—"}
              />
              <DetailRow
                icon={<Shield size={14} />}
                label="Role"
                value={ROLE_LABELS[user.role]}
              />
              <DetailRow
                icon={<Calendar size={14} />}
                label="Joined"
                value={formatDate(user.createdAt)}
              />

              <div className="pt-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Account actions
                </div>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => setShowReset((s) => !s)}
                    disabled={isSelf}
                  >
                    <Key size={14} />
                    Reset password
                  </Button>
                  {showReset && !isSelf && (
                    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                      <Label htmlFor="newPw" className="text-xs">
                        New temporary password
                      </Label>
                      <Input
                        id="newPw"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="h-9"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowReset(false)
                            setNewPassword("")
                          }}
                          disabled={resetting}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={submitReset}
                          disabled={resetting || newPassword.length < 8}
                          className="gap-1.5"
                        >
                          {resetting ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Key size={12} />
                          )}
                          Set password
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={toggleActive}
                    disabled={working || isSelf}
                  >
                    {working ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : user.active ? (
                      <UserX size={14} className="text-orange-500" />
                    ) : (
                      <UserCheck size={14} className="text-emerald-500" />
                    )}
                    {user.active ? "Deactivate account" : "Reactivate account"}
                  </Button>
                </div>
                {isSelf && (
                  <p className="text-[11px] text-muted-foreground mt-2">
                    You can&apos;t manage your own account from this panel.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name">Full name</Label>
                  <Input
                    id="edit-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, role: v as Role }))
                    }
                    disabled={isSelf}
                  >
                    <SelectTrigger id="edit-role" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-dept">Department</Label>
                  <Input
                    id="edit-dept"
                    value={form.department}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, department: e.target.value }))
                    }
                    placeholder="e.g. Dispensary"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="+233…"
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t bg-card px-5 py-3 flex items-center justify-end gap-2">
          {editing ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="gap-2"
              >
                <X size={14} />
                Cancel
              </Button>
              <Button onClick={save} disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Save changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => setEditing(true)} className="gap-2">
                <Pencil size={14} />
                Edit
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card px-3 py-2.5">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="text-sm text-foreground truncate">{value}</div>
      </div>
    </div>
  )
}
