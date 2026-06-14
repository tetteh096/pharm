import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getMyProfile } from "@/app/actions/profile"
import { AccountSettingsClient } from "@/components/dashboard/AccountSettingsClient"
import { canAccessAccountSettings } from "@/lib/dashboard-rbac"

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")
  if (!canAccessAccountSettings(session.user.role)) redirect("/dashboard")

  const profile = await getMyProfile()

  return (
    <div className="dashboard-page">
      <AccountSettingsClient
        initialProfile={{
          ...profile,
          createdAt: profile.createdAt.toISOString(),
        }}
      />
    </div>
  )
}
