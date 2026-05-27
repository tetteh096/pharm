"use server"

import { prisma, hasOrderModels } from "@/lib/prisma"
import { formatGhs, formatOrderNumber } from "@/lib/format"
import { sendOrderDeliveredEmail, sendOrderConfirmationEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

function randomOrderToken(length = 6): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
  let out = ""
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

const ORDER_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const

const ACTIVE_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
]

function isMissingTableError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2021"
  )
}

type OrderWithCustomer = {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: Date
  customer: { name: string; email: string | null }
  items: { productName: string }[]
}

export async function getDashboardOverview() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  let revenueAgg = { _sum: { total: null as number | null } }
  let thisMonthRevenueAgg = { _sum: { total: null as number | null } }
  let lastMonthRevenueAgg = { _sum: { total: null as number | null } }
  let activeOrders = 0
  let customerCount = 0
  let newCustomersThisMonth = 0
  let recentOrdersRaw: OrderWithCustomer[] = []
  let monthlyOrders: { total: number; createdAt: Date }[] = []

  if (hasOrderModels()) {
    try {
      const orderResults = await Promise.all([
        prisma.order.aggregate({
          _sum: { total: true },
          where: { status: ORDER_STATUS.DELIVERED },
        }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: {
            status: ORDER_STATUS.DELIVERED,
            createdAt: { gte: startOfMonth },
          },
        }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: {
            status: ORDER_STATUS.DELIVERED,
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
        }),
        prisma.order.count({ where: { status: { in: ACTIVE_STATUSES } } }),
        prisma.customer.count(),
        prisma.customer.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.order.findMany({
          take: 8,
          orderBy: { createdAt: "desc" },
          include: {
            customer: true,
            items: { take: 1 },
          },
        }),
        prisma.order.findMany({
          where: {
            status: ORDER_STATUS.DELIVERED,
            createdAt: {
              gte: new Date(now.getFullYear(), now.getMonth() - 6, 1),
            },
          },
          select: { total: true, createdAt: true },
        }),
      ])

      revenueAgg = orderResults[0]
      thisMonthRevenueAgg = orderResults[1]
      lastMonthRevenueAgg = orderResults[2]
      activeOrders = orderResults[3]
      customerCount = orderResults[4]
      newCustomersThisMonth = orderResults[5]
      recentOrdersRaw = orderResults[6] as OrderWithCustomer[]
      monthlyOrders = orderResults[7]
    } catch (error) {
      if (!isMissingTableError(error)) throw error
    }
  }

  const [lowStockCount, productCount, publishedPosts, categoryGroups, newConsultations] =
    await Promise.all([
      prisma.product.count({ where: { stock: { lt: 10 } } }),
      prisma.product.count(),
      prisma.blogPost.count({ where: { status: "Published" } }),
      prisma.product.groupBy({
        by: ["categoryId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
      prisma.consultationRequest.count({ where: { status: "New" } }),
    ])

  const totalRevenue = revenueAgg._sum.total ?? 0
  const thisMonthRevenue = thisMonthRevenueAgg._sum.total ?? 0
  const lastMonthRevenue = lastMonthRevenueAgg._sum.total ?? 0
  const revenueChange =
    lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : null

  const categoryIds = categoryGroups.map((g) => g.categoryId)
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  })
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))
  const maxCategoryCount = Math.max(...categoryGroups.map((g) => g._count.id), 1)

  const topCategories = categoryGroups.map((g) => ({
    name: categoryMap[g.categoryId] ?? "Uncategorized",
    count: g._count.id,
    percentage: Math.round((g._count.id / maxCategoryCount) * 100),
  }))

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const revenueByMonth = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    return {
      month: monthLabels[d.getMonth()],
      revenue: 0,
      key,
    }
  })

  for (const order of monthlyOrders) {
    const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`
    const bucket = revenueByMonth.find((b) => b.key === key)
    if (bucket) bucket.revenue += order.total
  }

  const revenueChart = revenueByMonth.map(({ month, revenue }) => ({
    month,
    revenue: Math.round(revenue * 100) / 100,
  }))

  const recentOrders = recentOrdersRaw.map((order) => ({
    id: order.orderNumber || formatOrderNumber(order.id, order.createdAt),
    customer: order.customer.name,
    product: order.items[0]?.productName ?? "—",
    amount: formatGhs(order.total),
    status: order.status,
    date: order.createdAt.toISOString(),
  }))

  return {
    stats: {
      totalRevenue: formatGhs(totalRevenue),
      revenueChange,
      activeOrders,
      customerCount,
      newCustomersThisMonth,
      lowStockCount,
      productCount,
      publishedPosts,
      newConsultations,
    },
    recentOrders,
    topCategories,
    revenueChart,
    hasOrders: recentOrdersRaw.length > 0,
    ordersReady: hasOrderModels(),
  }
}

export async function getOrdersList() {
  if (!hasOrderModels()) return []

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    })

    return orders.map((order) => ({
      dbId: order.id,
      id: order.orderNumber || formatOrderNumber(order.id, order.createdAt),
      customer: order.customer.name,
      customerEmail: order.customer.email ?? null,
      phone: order.customer.phone ?? null,
      email: order.customer.email ?? "—",
      date: order.createdAt.toLocaleDateString("en-GH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      total: formatGhs(order.total),
      status: order.status,
      method: order.paymentMethod ?? "—",
      fulfillmentType: order.fulfillmentType ?? null,
      branchName: order.branchName ?? null,
      deliveryAddress: order.deliveryAddress ?? null,
      deliveryLat: order.deliveryLat ?? null,
      deliveryLng: order.deliveryLng ?? null,
    }))
  } catch (error) {
    if (isMissingTableError(error)) return []
    throw error
  }
}

export async function getCustomersList() {
  let customers: Awaited<ReturnType<typeof prisma.customer.findMany>> = []

  if (hasOrderModels()) {
    try {
      customers = await prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
      })
    } catch (error) {
      if (!isMissingTableError(error)) throw error
    }
  }

  const now = new Date()
  const inSevenDays = new Date(now)
  inSevenDays.setDate(inSevenDays.getDate() + 7)

  const chronicCount = customers.filter((c) => c.clientType === "Chronic Client").length
  const refillsDue = customers.filter(
    (c) => c.nextRefillAt && c.nextRefillAt >= now && c.nextRefillAt <= inSevenDays
  ).length
  const lapsedRefills = customers.filter(
    (c) => c.nextRefillAt && c.nextRefillAt < now
  ).length

  return {
    summary: { chronicCount, refillsDue, lapsedRefills },
    customers: customers.map((c) => ({
      id: c.id.slice(-8).toUpperCase(),
      name: c.name,
      type: c.clientType,
      condition: c.condition ?? "—",
      lastRefill: c.lastRefillAt
        ? c.lastRefillAt.toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" })
        : "—",
      nextRefill: c.nextRefillAt
        ? c.nextRefillAt.toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" })
        : "—",
      status: c.status,
    })),
  }
}

export type OrderStatusValue =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"

export type UpdateOrderStatusResult =
  | { ok: true; emailSent: boolean }
  | { ok: false; error: string }

/**
 * Update an order's status. When transitioning to DELIVERED we also send the
 * customer a "completed / payment confirmed" email with their receipt.
 *
 * Every status change is appended to OrderStatusLog so we keep a per-order
 * audit trail of who changed what, when, and why.
 */
export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatusValue,
  note?: string
): Promise<UpdateOrderStatusResult> {
  if (!hasOrderModels()) {
    return { ok: false, error: "Orders are not available in this environment." }
  }

  const allowed: OrderStatusValue[] = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]
  if (!allowed.includes(nextStatus)) {
    return { ok: false, error: "Invalid status." }
  }

  const session = await auth()
  const actor = session?.user

  try {
    const previous = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, items: true },
    })

    if (!previous) return { ok: false, error: "Order not found." }

    if (previous.status === nextStatus) {
      return { ok: true, emailSent: false }
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
      include: { customer: true, items: true },
    })

    // Audit trail — best effort, never block the status change.
    void prisma.orderStatusLog
      .create({
        data: {
          orderId,
          fromStatus: previous.status,
          toStatus: nextStatus,
          changedById: actor?.id ?? null,
          changedByName: actor?.name ?? null,
          changedByEmail: actor?.email ?? null,
          note: note?.trim() ? note.trim() : null,
        },
      })
      .catch((err) => {
        console.error("Failed to write OrderStatusLog", err)
      })

    revalidatePath("/dashboard/orders")
    revalidatePath("/dashboard")

    // Send the completion email only on the transition into DELIVERED.
    let emailSent = false
    if (
      nextStatus === "DELIVERED" &&
      previous.status !== "DELIVERED" &&
      updated.customer.email
    ) {
      const result = await sendOrderDeliveredEmail({
        to: updated.customer.email,
        customerName: updated.customer.name,
        orderNumber:
          updated.orderNumber || formatOrderNumber(updated.id, updated.createdAt),
        total: updated.total,
        paymentMethod: updated.paymentMethod ?? null,
        fulfillmentType: updated.fulfillmentType ?? null,
        branchName: updated.branchName ?? null,
        deliveryAddress: updated.deliveryAddress ?? null,
        deliveryNotes: updated.deliveryNotes ?? null,
        deliveryLat: updated.deliveryLat ?? null,
        deliveryLng: updated.deliveryLng ?? null,
        items: updated.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        placedAt: updated.createdAt,
      })
      emailSent = result.ok
    }

    return { ok: true, emailSent }
  } catch (error) {
    if (isMissingTableError(error)) {
      return { ok: false, error: "Orders table missing." }
    }
    console.error("updateOrderStatus failed", error)
    return { ok: false, error: "Could not update the order status." }
  }
}

// ─── Order detail (slide-over panel) ────────────────────────────────────────

export type OrderDetail = {
  dbId: string
  orderNumber: string
  status: string
  paymentMethod: string | null
  total: number
  totalFormatted: string
  fulfillmentType: string | null
  branchName: string | null
  deliveryAddress: string | null
  deliveryNotes: string | null
  deliveryLat: number | null
  deliveryLng: number | null
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    name: string
    email: string | null
    phone: string | null
  }
  items: Array<{
    id: string
    productName: string
    quantity: number
    unitPrice: number
    unitPriceFormatted: string
    lineTotal: number
    lineTotalFormatted: string
  }>
  statusLogs: Array<{
    id: string
    fromStatus: string | null
    toStatus: string
    changedByName: string | null
    changedByEmail: string | null
    note: string | null
    createdAt: string
  }>
}

export async function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  if (!hasOrderModels()) return null

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: true,
        statusLogs: { orderBy: { createdAt: "desc" } },
      },
    })

    if (!order) return null

    return {
      dbId: order.id,
      orderNumber:
        order.orderNumber || formatOrderNumber(order.id, order.createdAt),
      status: order.status,
      paymentMethod: order.paymentMethod ?? null,
      total: order.total,
      totalFormatted: formatGhs(order.total),
      fulfillmentType: order.fulfillmentType ?? null,
      branchName: order.branchName ?? null,
      deliveryAddress: order.deliveryAddress ?? null,
      deliveryNotes: order.deliveryNotes ?? null,
      deliveryLat: order.deliveryLat ?? null,
      deliveryLng: order.deliveryLng ?? null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      customer: {
        id: order.customer.id,
        name: order.customer.name,
        email: order.customer.email ?? null,
        phone: order.customer.phone ?? null,
      },
      items: order.items.map((i) => {
        const lineTotal = i.unitPrice * i.quantity
        return {
          id: i.id,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          unitPriceFormatted: formatGhs(i.unitPrice),
          lineTotal,
          lineTotalFormatted: formatGhs(lineTotal),
        }
      }),
      statusLogs: order.statusLogs.map((log) => ({
        id: log.id,
        fromStatus: log.fromStatus,
        toStatus: log.toStatus,
        changedByName: log.changedByName,
        changedByEmail: log.changedByEmail,
        note: log.note,
        createdAt: log.createdAt.toISOString(),
      })),
    }
  } catch (error) {
    if (isMissingTableError(error)) return null
    throw error
  }
}

// ─── Manual (phone / walk-in) order creation ────────────────────────────────

export type InventorySearchHit = {
  id: string
  name: string
  sku: string | null
  price: number
  priceFormatted: string
  costPrice: number | null
  stock: number
  lowStockAt: number | null
  category: string | null
  image: string | null
}

export async function searchInventoryForOrder(
  query: string,
  limit = 12
): Promise<InventorySearchHit[]> {
  const q = query.trim()
  if (!q) {
    const recent = await prisma.product.findMany({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: { category: true },
    })
    return recent.map(mapInventoryHit)
  }

  const hits = await prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ],
    },
    orderBy: { stock: "desc" },
    take: limit,
    include: { category: true },
  })
  return hits.map(mapInventoryHit)
}

function mapInventoryHit(p: {
  id: string
  name: string
  sku: string | null
  price: number
  costPrice: number | null
  stock: number
  lowStockAt: number | null
  image: string | null
  category: { name: string } | null
}): InventorySearchHit {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku ?? null,
    price: p.price,
    priceFormatted: formatGhs(p.price),
    costPrice: p.costPrice ?? null,
    stock: p.stock,
    lowStockAt: p.lowStockAt ?? null,
    category: p.category?.name ?? null,
    image: p.image ?? null,
  }
}

export type ManualOrderInput = {
  customer: {
    name: string
    phone: string
    email?: string
  }
  fulfillmentType: "PICKUP" | "DELIVERY"
  branchName: string
  deliveryAddress?: string
  deliveryNotes?: string
  deliveryLat?: number | null
  deliveryLng?: number | null
  paymentMethod: string
  initialStatus?: OrderStatusValue
  items: Array<{
    productId: string
    quantity: number
    /** Optional override of the catalog price (e.g. negotiated). */
    unitPrice?: number
  }>
  /** Optional note for the audit log (e.g. "Called in by patient at 2:15 PM"). */
  note?: string
  /** When true, email the customer the confirmation receipt. */
  sendConfirmationEmail?: boolean
}

export type CreateManualOrderResult =
  | { ok: true; orderId: string; orderNumber: string; emailSent: boolean }
  | { ok: false; error: string }

export async function createManualOrder(
  input: ManualOrderInput
): Promise<CreateManualOrderResult> {
  if (!hasOrderModels()) {
    return { ok: false, error: "Orders are not available in this environment." }
  }

  if (!input.customer.name?.trim()) {
    return { ok: false, error: "Customer name is required." }
  }
  if (!input.customer.phone?.trim()) {
    return { ok: false, error: "Customer phone number is required." }
  }
  if (!input.items?.length) {
    return { ok: false, error: "Please add at least one product." }
  }
  if (!input.branchName?.trim()) {
    return { ok: false, error: "Please pick a branch." }
  }
  if (input.fulfillmentType === "DELIVERY" && !input.deliveryAddress?.trim()) {
    return { ok: false, error: "Delivery address is required for delivery orders." }
  }

  const session = await auth()
  const actor = session?.user

  // Load all products in one query so we can validate, set names + prices +
  // snapshot the cost.
  const productIds = Array.from(new Set(input.items.map((i) => i.productId)))
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      price: true,
      costPrice: true,
      stock: true,
      active: true,
    },
  })
  const productMap = new Map(products.map((p) => [p.id, p]))

  // Build the items array with snapshots + validate stock.
  const lineItems: {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    unitCost: number | null
  }[] = []

  for (const it of input.items) {
    const p = productMap.get(it.productId)
    if (!p) {
      return {
        ok: false,
        error: `One of the selected products is no longer available.`,
      }
    }
    if (!p.active) {
      return {
        ok: false,
        error: `${p.name} is currently disabled in inventory.`,
      }
    }
    if (it.quantity <= 0) {
      return { ok: false, error: `Quantity for ${p.name} must be at least 1.` }
    }
    if (p.stock < it.quantity) {
      return {
        ok: false,
        error: `Only ${p.stock} of ${p.name} available — please reduce the quantity.`,
      }
    }
    const unitPrice =
      typeof it.unitPrice === "number" && it.unitPrice >= 0
        ? it.unitPrice
        : p.price
    lineItems.push({
      productId: p.id,
      productName: p.name,
      quantity: it.quantity,
      unitPrice,
      unitCost: p.costPrice ?? null,
    })
  }

  const total = lineItems.reduce((s, l) => s + l.unitPrice * l.quantity, 0)
  const initialStatus = input.initialStatus ?? "PENDING"
  const now = new Date()
  const orderNumber = `ORD-${now.getFullYear().toString().slice(-2)}${randomOrderToken(6)}`

  try {
    const customer = await prisma.customer.create({
      data: {
        name: input.customer.name.trim(),
        email: input.customer.email?.trim() || null,
        phone: input.customer.phone.trim(),
        clientType: "Phone / Walk-in",
        orders: {
          create: {
            orderNumber,
            status: initialStatus,
            paymentMethod: input.paymentMethod,
            total,
            fulfillmentType: input.fulfillmentType,
            branchName: input.branchName,
            deliveryAddress: input.deliveryAddress?.trim() || null,
            deliveryNotes: input.deliveryNotes?.trim() || null,
            deliveryLat:
              typeof input.deliveryLat === "number" &&
              Number.isFinite(input.deliveryLat)
                ? input.deliveryLat
                : null,
            deliveryLng:
              typeof input.deliveryLng === "number" &&
              Number.isFinite(input.deliveryLng)
                ? input.deliveryLng
                : null,
            items: { create: lineItems },
          },
        },
      },
      include: { orders: { take: 1, orderBy: { createdAt: "desc" } } },
    })

    const order = customer.orders[0]

    // Audit log — "created" entry tied to the staff member.
    void prisma.orderStatusLog
      .create({
        data: {
          orderId: order.id,
          fromStatus: null,
          toStatus: initialStatus,
          changedById: actor?.id ?? null,
          changedByName: actor?.name ?? "Staff",
          changedByEmail: actor?.email ?? null,
          note:
            (input.note?.trim() || "Order created manually from the dashboard"),
        },
      })
      .catch((err) => console.error("Failed to write OrderStatusLog", err))

    // Decrement stock — fire-and-forget so a stock blip never breaks the
    // order creation (we already validated quantities above).
    for (const item of lineItems) {
      void prisma.product
        .update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
        .catch((err) =>
          console.error(`Failed to decrement stock for ${item.productId}`, err)
        )
    }

    revalidatePath("/dashboard/orders")
    revalidatePath("/dashboard")

    // Optional confirmation email — only sent if requested + email present.
    let emailSent = false
    if (input.sendConfirmationEmail && customer.email) {
      const result = await sendOrderConfirmationEmail({
        to: customer.email,
        customerName: customer.name,
        orderNumber,
        total,
        paymentMethod: input.paymentMethod,
        fulfillmentType: input.fulfillmentType,
        branchName: input.branchName,
        deliveryAddress: input.deliveryAddress ?? null,
        deliveryNotes: input.deliveryNotes ?? null,
        deliveryLat: input.deliveryLat ?? null,
        deliveryLng: input.deliveryLng ?? null,
        items: lineItems.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        placedAt: now,
      })
      emailSent = result.ok
    }

    return { ok: true, orderId: order.id, orderNumber, emailSent }
  } catch (error) {
    console.error("createManualOrder failed", error)
    return { ok: false, error: "Could not create the order. Please try again." }
  }
}
