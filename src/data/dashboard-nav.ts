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
  FileText,
  Contact,
  UserCog,
} from "lucide-react"

export type DashboardNavItem = {
  title: string
  url: string
  icon: LucideIcon
  keywords?: string
}

export type DashboardNavGroup = {
  label: string
  items: DashboardNavItem[]
}

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    label: "Operations",
    items: [
      { title: "Overview", url: "/dashboard", icon: LayoutDashboard, keywords: "home stats" },
      { title: "Orders", url: "/dashboard/orders", icon: ShoppingBag, keywords: "sales fulfillment" },
      { title: "Accounting", url: "/dashboard/accounting", icon: Calculator, keywords: "revenue finance" },
      { title: "Inventory", url: "/dashboard/products", icon: Pill, keywords: "products stock" },
      { title: "Branches", url: "/dashboard/branches", icon: Building2, keywords: "locations stores" },
    ],
  },
  {
    label: "Clinical",
    items: [
      { title: "Patients", url: "/dashboard/customers", icon: Users, keywords: "customers records" },
      { title: "Chronic care", url: "/dashboard/chronic", icon: HeartPulse, keywords: "refills follow-up" },
      { title: "Consultations", url: "/dashboard/consultations", icon: MessageSquare, keywords: "requests messages" },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Health blog", url: "/dashboard/blog", icon: FileText, keywords: "articles posts" },
      { title: "Website team", url: "/dashboard/team", icon: Contact, keywords: "team pharmacists meet our team profiles" },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Staff", url: "/dashboard/users", icon: UserCog, keywords: "users roles accounts" },
    ],
  },
]

export const dashboardNavFlat = dashboardNavGroups.flatMap((group) => group.items)

const EXTRA_TITLES: Record<string, string> = {
  "/dashboard/products/new": "Add product",
  "/dashboard/products/categories": "Categories",
  "/dashboard/customers/new": "New patient",
  "/dashboard/account": "Account settings",
  "/dashboard/orders/new": "New order",
  "/dashboard/blog/comments": "Blog comments",
  "/dashboard/blog/editor": "Blog editor",
}

export function isDashboardNavActive(pathname: string, url: string) {
  return pathname === url || (url !== "/dashboard" && pathname.startsWith(url))
}

export function resolveDashboardPage(pathname: string): {
  title: string
  icon: LucideIcon
  section: string | null
} {
  if (EXTRA_TITLES[pathname]) {
    const parent = dashboardNavFlat
      .filter((item) => item.url !== "/dashboard")
      .sort((a, b) => b.url.length - a.url.length)
      .find((item) => pathname.startsWith(item.url))
    return {
      title: EXTRA_TITLES[pathname],
      icon: parent?.icon ?? LayoutDashboard,
      section: parent?.title ?? null,
    }
  }

  if (pathname.endsWith("/edit") && pathname.startsWith("/dashboard/products/")) {
    return { title: "Edit product", icon: Pill, section: "Inventory" }
  }

  if (pathname.startsWith("/dashboard/customers/") && pathname !== "/dashboard/customers/new") {
    return { title: "Patient profile", icon: Users, section: "Patients" }
  }

  if (pathname.startsWith("/dashboard/chronic/")) {
    return { title: "Chronic patient", icon: HeartPulse, section: "Chronic care" }
  }

  const match = dashboardNavFlat.find((item) => isDashboardNavActive(pathname, item.url))
  if (match) {
    const group = dashboardNavGroups.find((g) => g.items.some((i) => i.url === match.url))
    return {
      title: match.title,
      icon: match.icon,
      section: group?.label ?? null,
    }
  }

  return { title: "Dashboard", icon: LayoutDashboard, section: null }
}
