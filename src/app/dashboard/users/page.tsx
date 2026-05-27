import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getUsers } from "@/app/actions/users"
import { StaffManagementClient } from "@/components/dashboard/StaffManagement"

export default async function UsersPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

  const users = await getUsers()

  return <StaffManagementClient initialUsers={users} />
}
