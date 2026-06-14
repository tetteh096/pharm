import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SiteSettingsForm } from "@/components/dashboard/SiteSettingsForm"
import { getSiteSettingsFormData } from "@/lib/site-settings"

export const dynamic = "force-dynamic"

export default async function SiteSettingsPage() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const settings = await getSiteSettingsFormData()

  return <SiteSettingsForm initialSettings={settings} />
}
