import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  ShoppingBag,
  Calculator,
  Pill,
  Building2,
  Users,
  HeartPulse,
  MessageSquare,
  Mail,
  FileText,
  Contact,
  UserCog,
  Settings,
} from "lucide-react"
import type { Role } from "@prisma/client"

export type DashboardNavItem = {
  title: string
  url: string
  icon: LucideIcon
  /** Roles allowed to see this in nav and open the route. */
  roles: Role[]
}

/** Main sidebar navigation with role gates. */
export const dashboardNavItems: DashboardNavItem[] = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "PHARMACIST", "STAFF"] },
  { title: "Orders", url: "/dashboard/orders", icon: ShoppingBag, roles: ["ADMIN", "PHARMACIST", "STAFF"] },
  { title: "Accounting", url: "/dashboard/accounting", icon: Calculator, roles: ["ADMIN"] },
  { title: "Inventory", url: "/dashboard/products", icon: Pill, roles: ["ADMIN", "PHARMACIST", "STAFF"] },
  { title: "Branches", url: "/dashboard/branches", icon: Building2, roles: ["ADMIN", "PHARMACIST", "STAFF"] },
  { title: "Patients", url: "/dashboard/customers", icon: Users, roles: ["ADMIN", "PHARMACIST", "STAFF"] },
  { title: "Chronic care", url: "/dashboard/chronic", icon: HeartPulse, roles: ["ADMIN", "PHARMACIST", "STAFF"] },
  { title: "Consultations", url: "/dashboard/consultations", icon: MessageSquare, roles: ["ADMIN", "PHARMACIST", "STAFF"] },
  { title: "Contact messages", url: "/dashboard/contact-messages", icon: Mail, roles: ["ADMIN", "PHARMACIST", "STAFF"] },
  { title: "Health blog", url: "/dashboard/blog", icon: FileText, roles: ["ADMIN", "PHARMACIST"] },
  { title: "Team page", url: "/dashboard/team", icon: Contact, roles: ["ADMIN", "PHARMACIST"] },
  { title: "Staff", url: "/dashboard/users", icon: UserCog, roles: ["ADMIN"] },
  { title: "Site settings", url: "/dashboard/settings", icon: Settings, roles: ["ADMIN"] },
]

export function navItemsForRole(role: Role | undefined) {
  if (!role) return []
  return dashboardNavItems.filter((item) => item.roles.includes(role))
}

/** Revenue, totals, accounting exports — hidden from front-desk staff. */
export function canViewFinancials(role: Role | undefined): boolean {
  return role === "ADMIN" || role === "PHARMACIST"
}

export function canManageStaff(role: Role | undefined): boolean {
  return role === "ADMIN"
}

export function canAccessAccountSettings(role: Role | undefined): boolean {
  return role === "ADMIN" || role === "PHARMACIST"
}

export function canWriteInventory(role: Role | undefined): boolean {
  return role === "ADMIN" || role === "PHARMACIST"
}

export function canAccessDashboardRoute(
  role: Role | undefined,
  pathname: string
): boolean {
  if (!role) return false

  // Admin-only areas
  if (pathname.startsWith("/dashboard/users")) return role === "ADMIN"
  if (pathname.startsWith("/dashboard/accounting")) return role === "ADMIN"
  if (pathname.startsWith("/dashboard/settings")) return role === "ADMIN"

  // Account settings — not for front-desk staff
  if (pathname.startsWith("/dashboard/account")) {
    return canAccessAccountSettings(role)
  }

  // Content — not for staff
  if (pathname.startsWith("/dashboard/blog")) {
    return role === "ADMIN" || role === "PHARMACIST"
  }
  if (pathname.startsWith("/dashboard/team")) {
    return role === "ADMIN" || role === "PHARMACIST"
  }

  // Inventory write routes — staff can browse stock only
  if (role === "STAFF") {
    if (pathname.startsWith("/dashboard/products/new")) return false
    if (pathname.startsWith("/dashboard/products/categories")) return false
    if (/^\/dashboard\/products\/[^/]+\/edit/.test(pathname)) return false
  }

  return true
}
