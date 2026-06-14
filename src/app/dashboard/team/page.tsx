import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { TeamProfilesManager } from "@/components/dashboard/TeamProfilesManager"
import { getTeamProfiles } from "./actions"
import { canAccessDashboardRoute } from "@/lib/dashboard-rbac"

export default async function DashboardTeamPage() {
  const session = await auth()
  if (!canAccessDashboardRoute(session?.user?.role, "/dashboard/team")) {
    redirect("/dashboard")
  }

  const profiles = await getTeamProfiles()

  return <TeamProfilesManager initialProfiles={profiles} />
}
