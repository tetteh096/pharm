import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getMyProfile } from "@/app/actions/profile"
import { AccountSettingsClient } from "@/components/dashboard/AccountSettingsClient"

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const profile = await getMyProfile()

  return (
    <AccountSettingsClient
      initialProfile={{
        ...profile,
        createdAt: profile.createdAt.toISOString(),
      }}
    />
  )
}
