import { DashboardOverview } from "@/components/dashboard/DashboardOverview"
import { getDashboardOverview } from "./actions"
import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()
  const data = await getDashboardOverview()
  const firstName = session?.user?.name?.split(" ")[0] ?? "there"

  return (
    <DashboardOverview
      data={data}
      firstName={firstName}
      role={session?.user?.role}
    />
  )
}
