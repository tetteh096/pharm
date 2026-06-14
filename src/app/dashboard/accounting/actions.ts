"use server"

import { auth } from "@/auth"
import { prisma, hasOrderModels } from "@/lib/prisma"
import { formatGhs } from "@/lib/format"
import { canManageStaff } from "@/lib/dashboard-rbac"

async function requireAdmin() {
  const session = await auth()
  if (!canManageStaff(session?.user?.role)) {
    throw new Error("Unauthorized")
  }
  return session!
}

const REVENUE_STATUSES = ["PROCESSING", "SHIPPED", "DELIVERED"] as const
const COMPLETED_STATUSES = ["DELIVERED"] as const

export type AccountingFilters = {
  /** ISO date string, inclusive. */
  from?: string
  /** ISO date string, inclusive. */
  to?: string
  branch?: string | null
}

export type AccountingSummary = {
  totalRevenue: number
  totalRevenueFormatted: string
  completedRevenue: number
  completedRevenueFormatted: string
  pendingRevenue: number
  pendingRevenueFormatted: string
  cancelledRevenue: number
  cancelledRevenueFormatted: string
  orderCount: number
  completedOrderCount: number
  cancelledOrderCount: number
  averageOrderValue: number
  averageOrderValueFormatted: string
  grossProfit: number
  grossProfitFormatted: string
  grossMarginPct: number | null
  itemsSold: number
}

export type RevenueDayPoint = {
  date: string
  revenue: number
  orders: number
}

export type PaymentBreakdownRow = {
  method: string
  orderCount: number
  revenue: number
  revenueFormatted: string
  percentage: number
}

export type BranchBreakdownRow = {
  branch: string
  orderCount: number
  revenue: number
  revenueFormatted: string
  percentage: number
}

export type TopProductRow = {
  productId: string | null
  productName: string
  qtySold: number
  revenue: number
  revenueFormatted: string
  profit: number
  profitFormatted: string
}

export type LedgerRow = {
  dbId: string
  orderNumber: string
  customer: string
  date: string
  isoDate: string
  status: string
  paymentMethod: string
  branch: string
  itemsCount: number
  revenue: number
  revenueFormatted: string
  profit: number
  profitFormatted: string
}

export type AccountingOverview = {
  filters: { from: string; to: string; branch: string | null }
  branches: string[]
  summary: AccountingSummary
  revenueByDay: RevenueDayPoint[]
  paymentBreakdown: PaymentBreakdownRow[]
  branchBreakdown: BranchBreakdownRow[]
  topProducts: TopProductRow[]
  ledger: LedgerRow[]
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function parseRangeWithDefault(filters: AccountingFilters): { from: Date; to: Date } {
  const to = filters.to ? parseLocalDate(filters.to) : new Date()
  to.setHours(23, 59, 59, 999)
  let from: Date
  if (filters.from) {
    from = parseLocalDate(filters.from)
  } else {
    from = new Date(to)
    from.setDate(from.getDate() - 29)
  }
  from.setHours(0, 0, 0, 0)
  return { from, to }
}

function isoDay(date: Date): string {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  const d = date.getDate().toString().padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatPct(value: number): number {
  return Math.round(value * 10) / 10
}

export async function getAccountingOverview(
  filters: AccountingFilters = {}
): Promise<AccountingOverview> {
  await requireAdmin()
  const empty: AccountingOverview = {
    filters: {
      from: filters.from ?? "",
      to: filters.to ?? "",
      branch: filters.branch ?? null,
    },
    branches: [],
    summary: {
      totalRevenue: 0,
      totalRevenueFormatted: formatGhs(0),
      completedRevenue: 0,
      completedRevenueFormatted: formatGhs(0),
      pendingRevenue: 0,
      pendingRevenueFormatted: formatGhs(0),
      cancelledRevenue: 0,
      cancelledRevenueFormatted: formatGhs(0),
      orderCount: 0,
      completedOrderCount: 0,
      cancelledOrderCount: 0,
      averageOrderValue: 0,
      averageOrderValueFormatted: formatGhs(0),
      grossProfit: 0,
      grossProfitFormatted: formatGhs(0),
      grossMarginPct: null,
      itemsSold: 0,
    },
    revenueByDay: [],
    paymentBreakdown: [],
    branchBreakdown: [],
    topProducts: [],
    ledger: [],
  }

  if (!hasOrderModels()) return empty

  try {
    const { from, to } = parseRangeWithDefault(filters)

    const branchWhere = filters.branch ? { branchName: filters.branch } : {}

    const ordersRaw = await prisma.order.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        ...branchWhere,
      },
      include: {
        customer: { select: { name: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // For OrderItems missing unitCost (legacy orders), fall back to current
    // product.costPrice using a bulk lookup.
    const missingCostProductIds = new Set<string>()
    for (const o of ordersRaw) {
      for (const it of o.items) {
        if (it.unitCost == null && it.productId) {
          missingCostProductIds.add(it.productId)
        }
      }
    }
    const fallbackCosts = new Map<string, number | null>()
    if (missingCostProductIds.size > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: Array.from(missingCostProductIds) } },
        select: { id: true, costPrice: true },
      })
      for (const p of products) {
        fallbackCosts.set(p.id, p.costPrice ?? null)
      }
    }

    const costFor = (item: { unitCost: number | null; productId: string | null }) => {
      if (item.unitCost != null) return item.unitCost
      if (item.productId) return fallbackCosts.get(item.productId) ?? null
      return null
    }

    // Distinct branches for the filter dropdown — span entire dataset, not
    // just the filtered window, so the dropdown stays consistent.
    const allBranches = await prisma.order.findMany({
      where: { branchName: { not: null } },
      distinct: ["branchName"],
      select: { branchName: true },
    })
    const branches = allBranches
      .map((b) => b.branchName)
      .filter((b): b is string => Boolean(b))
      .sort()

    // ── Summary aggregates ──
    let totalRevenue = 0
    let completedRevenue = 0
    let pendingRevenue = 0
    let cancelledRevenue = 0
    let completedOrderCount = 0
    let cancelledOrderCount = 0
    let grossProfit = 0
    let itemsSold = 0

    const revenueByDayMap = new Map<string, RevenueDayPoint>()
    const paymentMap = new Map<string, { count: number; revenue: number }>()
    const branchMap = new Map<string, { count: number; revenue: number }>()
    const productMap = new Map<
      string,
      { productId: string | null; productName: string; qty: number; revenue: number; profit: number }
    >()

    for (const order of ordersRaw) {
      const isCancelled = order.status === "CANCELLED"
      const isCompleted = (COMPLETED_STATUSES as readonly string[]).includes(
        order.status
      )
      const isRevenueable = (REVENUE_STATUSES as readonly string[]).includes(
        order.status
      )

      if (isCancelled) {
        cancelledRevenue += order.total
        cancelledOrderCount += 1
        continue
      }
      if (isCompleted) {
        completedRevenue += order.total
        completedOrderCount += 1
      } else if (isRevenueable) {
        pendingRevenue += order.total
      } else {
        // PENDING — count as pending revenue (not yet completed, not cancelled)
        pendingRevenue += order.total
      }

      totalRevenue += order.total

      // Daily trend
      const day = isoDay(order.createdAt)
      const dayEntry = revenueByDayMap.get(day) ?? {
        date: day,
        revenue: 0,
        orders: 0,
      }
      dayEntry.revenue += order.total
      dayEntry.orders += 1
      revenueByDayMap.set(day, dayEntry)

      // Payment breakdown
      const method = (order.paymentMethod || "UNSPECIFIED").toUpperCase()
      const payEntry = paymentMap.get(method) ?? { count: 0, revenue: 0 }
      payEntry.count += 1
      payEntry.revenue += order.total
      paymentMap.set(method, payEntry)

      // Branch breakdown
      const branchKey = order.branchName?.trim() || "Unspecified"
      const branchEntry = branchMap.get(branchKey) ?? { count: 0, revenue: 0 }
      branchEntry.count += 1
      branchEntry.revenue += order.total
      branchMap.set(branchKey, branchEntry)

      // Items + product profit (only for completed/processing orders)
      for (const item of order.items) {
        itemsSold += item.quantity
        const unitCost = costFor(item)
        const lineProfit =
          unitCost != null ? (item.unitPrice - unitCost) * item.quantity : 0
        grossProfit += lineProfit

        const key = item.productId ?? `name:${item.productName}`
        const entry = productMap.get(key) ?? {
          productId: item.productId,
          productName: item.productName,
          qty: 0,
          revenue: 0,
          profit: 0,
        }
        entry.qty += item.quantity
        entry.revenue += item.unitPrice * item.quantity
        entry.profit += lineProfit
        productMap.set(key, entry)
      }
    }

    const orderCount = ordersRaw.length - cancelledOrderCount
    const averageOrderValue =
      orderCount > 0 ? totalRevenue / orderCount : 0

    // Fill missing days with 0 so the chart has continuous bars.
    const filledDays: RevenueDayPoint[] = []
    const cursor = new Date(from)
    while (cursor <= to) {
      const key = isoDay(cursor)
      filledDays.push(
        revenueByDayMap.get(key) ?? { date: key, revenue: 0, orders: 0 }
      )
      cursor.setDate(cursor.getDate() + 1)
    }

    const paymentBreakdown: PaymentBreakdownRow[] = Array.from(
      paymentMap.entries()
    )
      .map(([method, v]) => ({
        method,
        orderCount: v.count,
        revenue: v.revenue,
        revenueFormatted: formatGhs(v.revenue),
        percentage:
          totalRevenue > 0 ? formatPct((v.revenue / totalRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    const branchBreakdown: BranchBreakdownRow[] = Array.from(
      branchMap.entries()
    )
      .map(([branch, v]) => ({
        branch,
        orderCount: v.count,
        revenue: v.revenue,
        revenueFormatted: formatGhs(v.revenue),
        percentage:
          totalRevenue > 0 ? formatPct((v.revenue / totalRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    const topProducts: TopProductRow[] = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((p) => ({
        productId: p.productId,
        productName: p.productName,
        qtySold: p.qty,
        revenue: p.revenue,
        revenueFormatted: formatGhs(p.revenue),
        profit: p.profit,
        profitFormatted: formatGhs(p.profit),
      }))

    const ledger: LedgerRow[] = ordersRaw.slice(0, 100).map((order) => {
      let orderProfit = 0
      for (const it of order.items) {
        const unitCost = costFor(it)
        if (unitCost != null) {
          orderProfit += (it.unitPrice - unitCost) * it.quantity
        }
      }
      return {
        dbId: order.id,
        orderNumber: order.orderNumber || order.id.slice(-8).toUpperCase(),
        customer: order.customer.name,
        date: order.createdAt.toLocaleDateString("en-GH", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        isoDate: order.createdAt.toISOString(),
        status: order.status,
        paymentMethod: order.paymentMethod || "—",
        branch: order.branchName || "—",
        itemsCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
        revenue: order.total,
        revenueFormatted: formatGhs(order.total),
        profit: orderProfit,
        profitFormatted: formatGhs(orderProfit),
      }
    })

    const summary: AccountingSummary = {
      totalRevenue,
      totalRevenueFormatted: formatGhs(totalRevenue),
      completedRevenue,
      completedRevenueFormatted: formatGhs(completedRevenue),
      pendingRevenue,
      pendingRevenueFormatted: formatGhs(pendingRevenue),
      cancelledRevenue,
      cancelledRevenueFormatted: formatGhs(cancelledRevenue),
      orderCount,
      completedOrderCount,
      cancelledOrderCount,
      averageOrderValue,
      averageOrderValueFormatted: formatGhs(averageOrderValue),
      grossProfit,
      grossProfitFormatted: formatGhs(grossProfit),
      grossMarginPct:
        totalRevenue > 0 ? formatPct((grossProfit / totalRevenue) * 100) : null,
      itemsSold,
    }

    return {
      filters: {
        from: isoDay(from),
        to: isoDay(to),
        branch: filters.branch ?? null,
      },
      branches,
      summary,
      revenueByDay: filledDays,
      paymentBreakdown,
      branchBreakdown,
      topProducts,
      ledger,
    }
  } catch (err) {
    console.error("getAccountingOverview failed", err)
    return empty
  }
}

export async function exportAccountingCsv(
  filters: AccountingFilters = {}
): Promise<string> {
  await requireAdmin()
  const data = await getAccountingOverview(filters)
  const header = [
    "Order Number",
    "Date",
    "Customer",
    "Status",
    "Payment Method",
    "Branch",
    "Items",
    "Revenue (GHS)",
    "Estimated Profit (GHS)",
  ]
  const escape = (val: string | number) => {
    const s = String(val ?? "")
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }
  const rows = data.ledger.map((row) =>
    [
      row.orderNumber,
      row.date,
      row.customer,
      row.status,
      row.paymentMethod,
      row.branch,
      row.itemsCount,
      row.revenue.toFixed(2),
      row.profit.toFixed(2),
    ]
      .map(escape)
      .join(",")
  )
  return [header.join(","), ...rows].join("\n")
}
