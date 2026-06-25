"use client"

import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { createUser, toggleUserActive } from "@/app/actions/users"
import { Role } from "@prisma/client"
import {
  Users, Plus, Shield, UserCheck, UserX,
  Eye, MoreHorizontal, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet"
import { DashboardSheetContent } from "@/components/dashboard/DashboardSheetContent"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { StaffDetailSheet, type StaffUser } from "@/components/dashboard/StaffDetailSheet"

type User = {
  id: string; name: string; email: string; role: Role
  department: string | null; phone: string | null
  active: boolean; createdAt: Date
}

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-700 border-red-200",
  PHARMACIST: "bg-teal-100 text-teal-700 border-teal-200",
  STAFF: "bg-slate-100 text-slate-600 border-slate-200",
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  PHARMACIST: "Pharmacist",
  STAFF: "Staff",
}

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

function CreateUserSheet({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "STAFF" as Role, department: "", phone: ""
  })

  const handleCreate = () => {
    startTransition(async () => {
      try {
        const email = form.email
        const { emailSent } = await createUser(form)
        setOpen(false)
        setForm({ name: "", email: "", password: "", role: "STAFF", department: "", phone: "" })
        if (emailSent) {
          toast.success(`Account created — welcome email sent to ${email}`)
        } else {
          toast.success("Account created", {
            description: "Could not send welcome email — check Resend / email settings.",
          })
        }
        onCreated()
      } catch (err) {
        console.error(err)
        toast.error(err instanceof Error ? err.message : "Could not create account")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} /> Add Staff Member
        </Button>
      </SheetTrigger>
      <DashboardSheetContent>
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base">New staff account</SheetTitle>
              <SheetDescription className="text-xs">
                A welcome email with sign-in details is sent to their inbox automatically.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-name">Full name *</Label>
              <Input id="new-name" placeholder="Dr. Jane Asante" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-role">Role</Label>
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v as Role })}>
                <SelectTrigger id="new-role" className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-email">Email *</Label>
            <Input id="new-email" type="email" placeholder="jane@medizen.gh" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-pw">Temporary password *</Label>
            <Input id="new-pw" type="password" placeholder="Min. 8 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="h-10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-dept">Department</Label>
              <Input id="new-dept" placeholder="e.g. Dispensary" value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
                className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-phone">Phone</Label>
              <Input id="new-phone" placeholder="+233..." value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="h-10" />
            </div>
          </div>
        </div>

        <div className="border-t bg-card px-5 py-3 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={pending || !form.name || !form.email || form.password.length < 8}
            className="gap-2"
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {pending ? "Creating..." : "Create account"}
          </Button>
        </div>
      </DashboardSheetContent>
    </Sheet>
  )
}

export function StaffManagementClient({ initialUsers }: { initialUsers: User[] }) {
  const { data: session } = useSession()
  const [users, setUsers] = useState(initialUsers)
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [activeUserId, setActiveUserId] = useState<string | null>(null)

  const refresh = () => window.location.reload()

  const activeUser = activeUserId
    ? users.find((u) => u.id === activeUserId) ?? null
    : null

  const handleUserUpdated = (u: StaffUser) => {
    setUsers((us) =>
      us.map((existing) =>
        existing.id === u.id
          ? {
              ...existing,
              ...u,
              createdAt: typeof u.createdAt === "string" ? new Date(u.createdAt) : u.createdAt,
            }
          : existing
      )
    )
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.department ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: users.length,
    active: users.filter(u => u.active).length,
    admins: users.filter(u => u.role === "ADMIN").length,
    pharmacists: users.filter(u => u.role === "PHARMACIST").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage team accounts, roles and access</p>
        </div>
        <CreateUserSheet onCreated={refresh} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: stats.total, icon: Users, color: "text-teal-500" },
          { label: "Active", value: stats.active, icon: UserCheck, color: "text-emerald-500" },
          { label: "Admins", value: stats.admins, icon: Shield, color: "text-red-500" },
          { label: "Pharmacists", value: stats.pharmacists, icon: Shield, color: "text-blue-500" },
        ].map(s => (
          <Card key={s.label} className="border-none shadow-md shadow-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${s.color}`}>
                <s.icon size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-none shadow-md shadow-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Staff</CardTitle>
            <Input
              placeholder="Search staff..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs h-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Staff Member</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Department</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const isSelf = user.email === session?.user?.email
                  return (
                    <tr
                      key={user.id}
                      onClick={() => setActiveUserId(user.id)}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={user.name} />
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[user.role]}`}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.department ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.active ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                          {user.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setActiveUserId(user.id)}>
                              <Eye size={14} className="mr-2" /> View &amp; edit
                            </DropdownMenuItem>
                            {!isSelf && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => startTransition(async () => {
                                    await toggleUserActive(user.id, !user.active)
                                    setUsers(us => us.map(u => u.id === user.id ? { ...u, active: !u.active } : u))
                                  })}
                                >
                                  {user.active
                                    ? <><UserX size={14} className="mr-2 text-orange-500" /> Deactivate</>
                                    : <><UserCheck size={14} className="mr-2 text-emerald-500" /> Reactivate</>
                                  }
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users size={32} className="mx-auto mb-3 opacity-30" />
                <p>No staff members found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <StaffDetailSheet
        user={activeUser}
        open={activeUserId !== null}
        onOpenChange={(o) => {
          if (!o) setActiveUserId(null)
        }}
        isSelf={activeUser?.email === session?.user?.email}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  )
}
