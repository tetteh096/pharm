"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  Building2,
  Camera,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  Save,
  Shield,
  Trash2,
  User as UserIcon,
} from "lucide-react"
import { Role } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  changeMyPassword,
  updateMyAvatar,
  updateMyProfile,
} from "@/app/actions/profile"

type Profile = {
  id: string
  name: string
  email: string
  role: Role
  department: string | null
  phone: string | null
  image: string | null
  active: boolean
  createdAt: string
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
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

const MAX_AVATAR_BYTES = 1024 * 1024 // 1 MB

export function AccountSettingsClient({
  initialProfile,
}: {
  initialProfile: Profile
}) {
  const { update } = useSession()
  const [profile, setProfile] = React.useState<Profile>(initialProfile)

  // Profile form
  const [name, setName] = React.useState(profile.name)
  const [email, setEmail] = React.useState(profile.email)
  const [phone, setPhone] = React.useState(profile.phone ?? "")
  const [department, setDepartment] = React.useState(profile.department ?? "")
  const [savingProfile, setSavingProfile] = React.useState(false)

  // Avatar
  const [avatarBusy, setAvatarBusy] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  // Password
  const [currentPw, setCurrentPw] = React.useState("")
  const [newPw, setNewPw] = React.useState("")
  const [confirmPw, setConfirmPw] = React.useState("")
  const [showCurrent, setShowCurrent] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)
  const [changingPw, setChangingPw] = React.useState(false)

  const dirty =
    name.trim() !== profile.name ||
    email.trim().toLowerCase() !== profile.email.toLowerCase() ||
    (phone || "") !== (profile.phone || "") ||
    (department || "") !== (profile.department || "")

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      const updated = await updateMyProfile({
        name,
        email,
        phone: phone || null,
        department: department || null,
      })
      setProfile({ ...updated, createdAt: updated.createdAt.toISOString() })
      setName(updated.name)
      setEmail(updated.email)
      setPhone(updated.phone ?? "")
      setDepartment(updated.department ?? "")
      await update({
        user: {
          name: updated.name,
          email: updated.email,
          department: updated.department ?? undefined,
        },
      })
      toast.success("Profile updated")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed")
    } finally {
      setSavingProfile(false)
    }
  }

  const onPickAvatar = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file")
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image must be 1 MB or less")
      return
    }
    setAvatarBusy(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const dataUrl = reader.result as string
        const res = await updateMyAvatar(dataUrl)
        setProfile((p) => ({ ...p, image: res.image }))
        await update({ user: { image: res.image } })
        toast.success("Profile picture updated")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setAvatarBusy(false)
      }
    }
    reader.onerror = () => {
      setAvatarBusy(false)
      toast.error("Could not read the image")
    }
    reader.readAsDataURL(file)
  }

  const removeAvatar = async () => {
    setAvatarBusy(true)
    try {
      const res = await updateMyAvatar(null)
      setProfile((p) => ({ ...p, image: res.image }))
      await update({ user: { image: null } })
      toast.success("Profile picture removed")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove image")
    } finally {
      setAvatarBusy(false)
    }
  }

  const submitPassword = async () => {
    if (newPw !== confirmPw) {
      toast.error("New passwords don't match")
      return
    }
    if (newPw.length < 8) {
      toast.error("New password must be at least 8 characters")
      return
    }
    setChangingPw(true)
    try {
      await changeMyPassword({ currentPassword: currentPw, newPassword: newPw })
      toast.success("Password changed")
      setCurrentPw("")
      setNewPw("")
      setConfirmPw("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change password")
    } finally {
      setChangingPw(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your profile, picture, and password.
        </p>
      </div>

      {/* Header card with avatar */}
      <Card className="border-none shadow-md shadow-primary/5">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative flex-shrink-0">
            <div
              className="h-24 w-24 rounded-full overflow-hidden flex items-center justify-center text-white text-xl font-bold ring-2 ring-background shadow-sm"
              style={{
                background: profile.image
                  ? undefined
                  : "linear-gradient(135deg, #13ec8a, #1157ee)",
              }}
            >
              {profile.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initialsOf(profile.name)
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarBusy}
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow ring-2 ring-background disabled:opacity-60"
              aria-label="Change profile picture"
            >
              {avatarBusy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Camera size={14} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPickAvatar(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold truncate">{profile.name}</div>
            <div className="text-sm text-muted-foreground truncate">
              {profile.email}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${ROLE_PILLS[profile.role]}`}
              >
                <Shield size={10} />
                {ROLE_LABELS[profile.role]}
              </span>
              {profile.department && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
                  <Building2 size={10} />
                  {profile.department}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">
                Member since{" "}
                {new Date(profile.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarBusy}
              >
                <Camera size={14} />
                {profile.image ? "Change picture" : "Upload picture"}
              </Button>
              {profile.image && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={removeAvatar}
                  disabled={avatarBusy}
                >
                  <Trash2 size={14} />
                  Remove
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              PNG or JPG, max 1 MB. Stored privately on your account.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile details */}
        <Card className="border-none shadow-md shadow-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserIcon size={16} className="text-primary" />
              Profile details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail size={12} className="text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone size={12} className="text-muted-foreground" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233…"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="department"
                  className="flex items-center gap-1.5"
                >
                  <Building2 size={12} className="text-muted-foreground" />
                  Department
                </Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Dispensary"
                  className="h-10"
                />
              </div>
            </div>
            <div className="pt-1 flex items-center justify-end gap-2">
              {dirty && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setName(profile.name)
                    setEmail(profile.email)
                    setPhone(profile.phone ?? "")
                    setDepartment(profile.department ?? "")
                  }}
                  disabled={savingProfile}
                >
                  Reset
                </Button>
              )}
              <Button
                onClick={saveProfile}
                disabled={savingProfile || !dirty}
                className="gap-2"
                size="sm"
              >
                {savingProfile ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password */}
        <Card className="border-none shadow-md shadow-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound size={16} className="text-primary" />
              Change password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPw">Current password</Label>
              <div className="relative">
                <Input
                  id="currentPw"
                  type={showCurrent ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="h-10 pr-9"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showCurrent ? "Hide password" : "Show password"}
                >
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPw">New password</Label>
              <div className="relative">
                <Input
                  id="newPw"
                  type={showNew ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="h-10 pr-9"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPw">Confirm new password</Label>
              <Input
                id="confirmPw"
                type={showNew ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="h-10"
                autoComplete="new-password"
              />
              {confirmPw && (
                <p
                  className={`text-[11px] flex items-center gap-1 ${newPw === confirmPw ? "text-emerald-600" : "text-destructive"}`}
                >
                  {newPw === confirmPw ? (
                    <>
                      <Check size={11} /> Passwords match
                    </>
                  ) : (
                    "Passwords don't match"
                  )}
                </p>
              )}
            </div>
            <div className="pt-1 flex items-center justify-end">
              <Button
                onClick={submitPassword}
                disabled={
                  changingPw ||
                  !currentPw ||
                  newPw.length < 8 ||
                  newPw !== confirmPw
                }
                className="gap-2"
                size="sm"
              >
                {changingPw ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <KeyRound size={14} />
                )}
                Update password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
