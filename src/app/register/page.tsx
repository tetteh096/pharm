import { redirect } from "next/navigation"

// Staff registration is admin-only via the dashboard.
// Visiting /register redirects to sign in.
export default function RegisterPage() {
  redirect("/signin")
}
