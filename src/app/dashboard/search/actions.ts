"use server"

import type { Role } from "@prisma/client"
import { auth } from "@/auth"
import { formatOrderNumber } from "@/lib/format"
import { hasOrderModels, prisma } from "@/lib/prisma"
import {
  canAccessAccountSettings,
  canManageStaff,
  canWriteInventory,
} from "@/lib/dashboard-rbac"

export type DashboardSearchHit = {
  id: string
  type: "page" | "product" | "patient" | "order" | "staff"
  title: string
  subtitle?: string
  href: string
}

const NAV_PAGES: {
  title: string
  href: string
  keywords: string[]
  roles?: Role[]
}[] = [
  { title: "Overview", href: "/dashboard", keywords: ["home", "dashboard", "overview"] },
  { title: "Orders", href: "/dashboard/orders", keywords: ["orders", "sales"] },
  { title: "New order", href: "/dashboard/orders/new", keywords: ["create order", "manual order"] },
  {
    title: "Accounting",
    href: "/dashboard/accounting",
    keywords: ["accounting", "finance", "revenue"],
    roles: ["ADMIN"],
  },
  {
    title: "Inventory",
    href: "/dashboard/products",
    keywords: ["products", "inventory", "stock", "medicine"],
  },
  {
    title: "Add product",
    href: "/dashboard/products/new",
    keywords: ["new product", "add product"],
    roles: ["ADMIN", "PHARMACIST"],
  },
  {
    title: "Categories",
    href: "/dashboard/products/categories",
    keywords: ["categories", "product categories"],
    roles: ["ADMIN", "PHARMACIST"],
  },
  { title: "Branches", href: "/dashboard/branches", keywords: ["branches", "locations"] },
  {
    title: "Patients",
    href: "/dashboard/customers",
    keywords: ["patients", "customers", "clients"],
  },
  {
    title: "New patient",
    href: "/dashboard/customers/new",
    keywords: ["register patient", "new patient"],
  },
  {
    title: "Chronic care",
    href: "/dashboard/chronic",
    keywords: ["chronic", "refill", "care"],
  },
  {
    title: "Consultations",
    href: "/dashboard/consultations",
    keywords: ["consultations", "requests", "messages"],
  },
  {
    title: "Contact messages",
    href: "/dashboard/contact-messages",
    keywords: ["contact", "messages", "website form", "inbox"],
  },
  {
    title: "Health blog",
    href: "/dashboard/blog",
    keywords: ["blog", "articles", "posts"],
    roles: ["ADMIN", "PHARMACIST"],
  },
  {
    title: "Team page",
    href: "/dashboard/team",
    keywords: ["team", "pharmacists", "staff profiles", "meet our team", "website team"],
    roles: ["ADMIN", "PHARMACIST"],
  },
  {
    title: "Staff",
    href: "/dashboard/users",
    keywords: ["staff", "users", "accounts", "login"],
    roles: ["ADMIN"],
  },
  {
    title: "Account settings",
    href: "/dashboard/account",
    keywords: ["account", "profile", "password", "settings"],
    roles: ["ADMIN", "PHARMACIST"],
  },
]

function matchesQuery(text: string, q: string) {
  return text.toLowerCase().includes(q)
}

export async function dashboardGlobalSearch(query: string): Promise<DashboardSearchHit[]> {
  const session = await auth()
  if (!session?.user) return []

  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  const role = session.user.role
  const hits: DashboardSearchHit[] = []

  for (const page of NAV_PAGES) {
    if (page.roles && !page.roles.includes(role)) continue
    if (page.href === "/dashboard/account" && !canAccessAccountSettings(role)) continue
    if (page.href === "/dashboard/accounting" && !canManageStaff(role)) continue
    if (
      (page.href === "/dashboard/products/new" ||
        page.href === "/dashboard/products/categories") &&
      !canWriteInventory(role)
    ) {
      continue
    }
    const matchTitle = matchesQuery(page.title, q)
    const matchKeyword = page.keywords.some((k) => matchesQuery(k, q))
    if (!matchTitle && !matchKeyword) continue
    hits.push({
      id: `page-${page.href}`,
      type: "page",
      title: page.title,
      subtitle: "Go to page",
      href: page.href,
    })
  }

  const [products, patients, orders, staff] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, sku: true },
      take: 5,
      orderBy: { name: "asc" },
    }),
    prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, phone: true },
      take: 5,
      orderBy: { name: "asc" },
    }),
    hasOrderModels()
      ? prisma.order
          .findMany({
            where: {
              OR: [
                { orderNumber: { contains: q, mode: "insensitive" } },
                { customer: { name: { contains: q, mode: "insensitive" } } },
                { customer: { phone: { contains: q, mode: "insensitive" } } },
              ],
            },
            select: {
              id: true,
              orderNumber: true,
              createdAt: true,
              customer: { select: { name: true } },
            },
            take: 5,
            orderBy: { createdAt: "desc" },
          })
          .catch(() => [])
      : Promise.resolve([]),
    role === "ADMIN"
      ? prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { department: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true, name: true, email: true, role: true },
          take: 4,
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ])

  for (const p of products) {
    hits.push({
      id: `product-${p.id}`,
      type: "product",
      title: p.name,
      subtitle: p.sku ? `SKU ${p.sku}` : "Product",
      href: `/dashboard/products/${p.id}/edit`,
    })
  }

  for (const c of patients) {
    hits.push({
      id: `patient-${c.id}`,
      type: "patient",
      title: c.name,
      subtitle: c.phone ?? "Patient",
      href: `/dashboard/customers/${c.id}`,
    })
  }

  for (const o of orders) {
    const label =
      o.orderNumber || formatOrderNumber(o.id, o.createdAt)
    hits.push({
      id: `order-${o.id}`,
      type: "order",
      title: label,
      subtitle: o.customer.name,
      href: "/dashboard/orders",
    })
  }

  for (const u of staff) {
    hits.push({
      id: `staff-${u.id}`,
      type: "staff",
      title: u.name,
      subtitle: `${u.role} · ${u.email}`,
      href: "/dashboard/users",
    })
  }

  return hits.slice(0, 14)
}
