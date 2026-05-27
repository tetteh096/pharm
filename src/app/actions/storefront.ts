"use server"

import { prisma } from "@/lib/prisma"
import { formatGhs } from "@/lib/format"
import { sendOrderConfirmationEmail } from "@/lib/email"
import type { Prisma } from "@prisma/client"

/** Crockford-style alphanumeric token (no 0/O/I/1 confusion) for order numbers. */
function randomToken(length: number): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
  let out = ""
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

export type StorefrontProduct = {
  id: string
  name: string
  price: string
  category: string
  image: string
  hasDiscount: boolean
  discountPercent: number
  originalPriceLabel: string | null
}

export type ShopProduct = {
  id: string
  name: string
  description: string | null
  /** Effective price the customer actually pays. */
  price: number
  /** Regular price before discount (used for strikethrough). */
  originalPrice: number
  priceLabel: string
  originalPriceLabel: string
  hasDiscount: boolean
  discountPercent: number
  category: string
  categorySlug: string | null
  stock: number
  inStock: boolean
  branch: string | null
  image: string
  images: string[]
  tags: string[]
  featured: boolean
}

// Inline SVG placeholder used when a product has no image. Encoded as a data
// URI so it always loads (no extra HTTP request, no missing-file 404).
const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">` +
      `<rect width="200" height="200" fill="#f1f5f9"/>` +
      `<g fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">` +
      `<text x="100" y="92" font-size="14" font-weight="700">Enviro</text>` +
      `<text x="100" y="112" font-size="11">Pharmacy</text>` +
      `</g>` +
      `<circle cx="100" cy="142" r="14" fill="none" stroke="#94a3b8" stroke-width="2"/>` +
      `<path d="M93 142h14M100 135v14" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>` +
      `</svg>`
  )

function pickImage(image: string | null, images: string[]): string {
  if (image) return image
  if (images.length > 0) return images[0]
  return FALLBACK_IMAGE
}

type ProductWithCategory = {
  id: string
  name: string
  description: string | null
  price: number
  discountPercent: number
  status: string
  stock: number
  branch: string | null
  image: string | null
  images: string[]
  tags: string[]
  featured: boolean
  category: { name: string; slug: string | null } | null
}

function toShopProduct(p: ProductWithCategory): ShopProduct {
  const discountPercent = Math.max(0, Math.min(99, p.discountPercent ?? 0))
  const hasDiscount = discountPercent > 0
  const originalPrice = p.price
  const effectivePrice = hasDiscount
    ? Math.round(originalPrice * (100 - discountPercent)) / 100
    : originalPrice

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: effectivePrice,
    originalPrice,
    priceLabel: formatGhs(effectivePrice),
    originalPriceLabel: formatGhs(originalPrice),
    hasDiscount,
    discountPercent,
    category: p.category?.name ?? "Pharmacy",
    categorySlug: p.category?.slug ?? null,
    stock: p.stock,
    inStock: p.stock > 0 && p.status !== "Out of Stock",
    branch: p.branch,
    image: pickImage(p.image, p.images),
    images: p.images.length > 0 ? p.images : p.image ? [p.image] : [],
    tags: p.tags,
    featured: p.featured,
  }
}

export async function getFeaturedProducts(limit = 12): Promise<StorefrontProduct[]> {
  const products = await prisma.product.findMany({
    where: { featured: true, active: true },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
  })

  return products.map((p) => {
    const shop = toShopProduct(p)
    return {
      id: shop.id,
      name: shop.name,
      price: shop.priceLabel,
      category: shop.category,
      image: shop.image,
      hasDiscount: shop.hasDiscount,
      discountPercent: shop.discountPercent,
      originalPriceLabel: shop.hasDiscount ? shop.originalPriceLabel : null,
    }
  })
}

/** Catalog list for the public shop page. Only active products. */
export async function getShopProducts(): Promise<ShopProduct[]> {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  })

  return products.map(toShopProduct)
}

export async function getShopProduct(id: string): Promise<ShopProduct | null> {
  const p = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  })
  if (!p || !p.active) return null
  return toShopProduct(p)
}

export type CartSnapshot = {
  id: string
  name: string
  price: number
  priceLabel: string
  originalPriceLabel: string
  hasDiscount: boolean
  discountPercent: number
  image: string
  category: string
  branch: string | null
  stock: number
  inStock: boolean
  available: boolean
}

/**
 * Bulk-fetch fresh product info for items already in the user's cart.
 * Used to hydrate the cart with live data (image, price, stock) so we never
 * have to rely on stale base64 payloads stuck in localStorage.
 */
export async function getCartProductSnapshots(
  ids: string[]
): Promise<Record<string, CartSnapshot>> {
  if (!ids || ids.length === 0) return {}

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { category: true },
  })

  const map: Record<string, CartSnapshot> = {}
  for (const p of products) {
    const shop = toShopProduct(p)
    map[p.id] = {
      id: shop.id,
      name: shop.name,
      price: shop.price,
      priceLabel: shop.priceLabel,
      originalPriceLabel: shop.originalPriceLabel,
      hasDiscount: shop.hasDiscount,
      discountPercent: shop.discountPercent,
      image: shop.image,
      category: shop.category,
      branch: shop.branch,
      stock: shop.stock,
      inStock: shop.inStock,
      available: p.active,
    }
  }
  return map
}

export async function getShopCategories(): Promise<{ name: string; count: number }[]> {
  const cats = await prisma.category.findMany({
    include: {
      _count: { select: { products: { where: { active: true } } } },
    },
    orderBy: { name: "asc" },
  })
  return cats
    .filter((c) => c._count.products > 0)
    .map((c) => ({ name: c.name, count: c._count.products }))
}

// ─── Search API ──────────────────────────────────────────────────────────────

export type ShopSort =
  | "latest"
  | "priceAsc"
  | "priceDesc"
  | "name"
  | "featured"

export type ShopFilters = {
  query?: string
  categories?: string[]
  branches?: string[]
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  featuredOnly?: boolean
  sort?: ShopSort
  page?: number
  pageSize?: number
}

export type ShopFilterMeta = {
  categories: { name: string; count: number }[]
  branches: { name: string; count: number }[]
  priceBounds: { min: number; max: number }
  totalActive: number
}

export type ShopSearchResult = {
  products: ShopProduct[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** All the data the shop filter sidebar needs in one round-trip. */
export async function getShopFilterMeta(): Promise<ShopFilterMeta> {
  const baseWhere: Prisma.ProductWhereInput = { active: true }

  const [cats, branches, priceAgg, total] = await Promise.all([
    prisma.category.findMany({
      include: {
        _count: { select: { products: { where: { active: true } } } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.branch.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { name: true },
    }),
    prisma.product.aggregate({
      where: baseWhere,
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.product.count({ where: baseWhere }),
  ])

  // Count products per branch (incl. "All branches" sentinel that applies to every branch).
  const branchCountsByName = await Promise.all(
    branches.map((b) =>
      prisma.product.count({
        where: {
          ...baseWhere,
          OR: [{ branch: b.name }, { branch: "All branches" }, { branch: null }],
        },
      })
    )
  )

  const minPrice = Math.floor(priceAgg._min.price ?? 0)
  const maxPrice = Math.ceil(priceAgg._max.price ?? 0)

  return {
    categories: cats
      .filter((c) => c._count.products > 0)
      .map((c) => ({ name: c.name, count: c._count.products })),
    branches: branches.map((b, i) => ({
      name: b.name,
      count: branchCountsByName[i],
    })),
    priceBounds: {
      min: minPrice,
      max: maxPrice > minPrice ? maxPrice : minPrice + 1,
    },
    totalActive: total,
  }
}

/** Server-side product search with filters, sorting, and pagination. */
export async function searchShopProducts(
  filters: ShopFilters = {}
): Promise<ShopSearchResult> {
  const page = Math.max(1, Math.floor(filters.page ?? 1))
  const pageSize = Math.max(1, Math.min(48, Math.floor(filters.pageSize ?? 9)))

  const conditions: Prisma.ProductWhereInput[] = [{ active: true }]

  if (filters.inStockOnly) {
    conditions.push({ stock: { gt: 0 } })
  }
  if (filters.featuredOnly) {
    conditions.push({ featured: true })
  }
  if (typeof filters.minPrice === "number" && Number.isFinite(filters.minPrice)) {
    conditions.push({ price: { gte: filters.minPrice } })
  }
  if (typeof filters.maxPrice === "number" && Number.isFinite(filters.maxPrice)) {
    conditions.push({ price: { lte: filters.maxPrice } })
  }
  if (filters.categories?.length) {
    conditions.push({ category: { name: { in: filters.categories } } })
  }
  if (filters.branches?.length) {
    // Products tagged with any of the selected branches OR the "All branches" sentinel.
    conditions.push({
      OR: [
        { branch: { in: filters.branches } },
        { branch: "All branches" },
        { branch: null },
      ],
    })
  }
  const q = filters.query?.trim()
  if (q) {
    conditions.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
        { tags: { has: q } },
        { sku: { contains: q, mode: "insensitive" } },
      ],
    })
  }

  const where: Prisma.ProductWhereInput =
    conditions.length === 1 ? conditions[0] : { AND: conditions }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] = (() => {
    switch (filters.sort) {
      case "priceAsc":
        return [{ price: "asc" }]
      case "priceDesc":
        return [{ price: "desc" }]
      case "name":
        return [{ name: "asc" }]
      case "featured":
        return [{ featured: "desc" }, { createdAt: "desc" }]
      case "latest":
      default:
        return [{ featured: "desc" }, { createdAt: "desc" }]
    }
  })()

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return {
    products: products.map(toShopProduct),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

/** Branches that customers can pick up from / have orders delivered from. */
export async function getStoreBranches() {
  return await prisma.branch.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, location: true, phone: true, hours: true },
  })
}

// ─── Order placement ────────────────────────────────────────────────────────

export type PlaceOrderInput = {
  customer: {
    name: string
    email?: string
    phone: string
  }
  delivery: {
    branch: string | null
    address?: string
    notes?: string
    /** Optional GPS coordinates pinned by the customer on the map. */
    lat?: number | null
    lng?: number | null
  }
  fulfillmentType: "PICKUP" | "DELIVERY"
  paymentMethod: string
  items: Array<{
    productId: string
    name: string
    price: number
    quantity: number
  }>
}

export type PlaceOrderResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; error: string }

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (!input.items?.length) {
    return { ok: false, error: "Your cart is empty." }
  }
  if (!input.customer?.name?.trim()) {
    return { ok: false, error: "Please provide your name." }
  }
  if (!input.customer?.phone?.trim()) {
    return { ok: false, error: "A phone number is required so we can contact you." }
  }

  const total = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  // Pre-generate a unique order number so we don't need a second write inside
  // the transaction just to fix it up. Format: ORD-<YY><6-char random>
  const now = new Date()
  const orderNumber = `ORD-${now.getFullYear().toString().slice(-2)}${randomToken(6)}`

  // Snapshot cost prices at sale time — used by the accounting module to
  // compute gross profit even if the product cost changes later.
  const productCosts = new Map<string, number | null>()
  try {
    const productIds = Array.from(
      new Set(input.items.map((i) => i.productId).filter(Boolean))
    )
    if (productIds.length) {
      const costs = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, costPrice: true },
      })
      for (const c of costs) {
        productCosts.set(c.id, c.costPrice ?? null)
      }
    }
  } catch (err) {
    console.warn("Could not load product cost prices for order snapshot", err)
  }

  try {
    // One single nested create. Postgres makes this atomic; we save 3 round
    // trips compared to the previous customer→order→update flow which was
    // tripping the serverless `maxWait` budget (P2028).
    const customer = await prisma.customer.create({
      data: {
        name: input.customer.name.trim(),
        email: input.customer.email?.trim() || null,
        phone: input.customer.phone.trim(),
        clientType: "Walk-in",
        orders: {
          create: {
            orderNumber,
            status: "PENDING",
            paymentMethod: input.paymentMethod,
            total,
            fulfillmentType: input.fulfillmentType,
            branchName: input.delivery.branch,
            deliveryAddress: input.delivery.address?.trim() || null,
            deliveryNotes: input.delivery.notes?.trim() || null,
            deliveryLat:
              typeof input.delivery.lat === "number" &&
              Number.isFinite(input.delivery.lat)
                ? input.delivery.lat
                : null,
            deliveryLng:
              typeof input.delivery.lng === "number" &&
              Number.isFinite(input.delivery.lng)
                ? input.delivery.lng
                : null,
            items: {
              create: input.items.map((item) => ({
                productId: item.productId,
                productName: item.name,
                quantity: item.quantity,
                unitPrice: item.price,
                unitCost: productCosts.get(item.productId) ?? null,
              })),
            },
          },
        },
      },
      include: { orders: { take: 1, orderBy: { createdAt: "desc" } } },
    })

    const order = customer.orders[0]
    const result = { id: order.id, orderNumber }

    // Decrement stock outside the order transaction. If any product update
    // fails (e.g. it was deleted mid-flight), we still keep the order so the
    // pharmacist can reconcile manually — far better UX than rolling back.
    void Promise.all(
      input.items.map((item) =>
        prisma.product
          .update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
          .catch((err) => {
            console.warn(
              `[placeOrder] stock decrement failed for ${item.productId}`,
              err
            )
          })
      )
    )

    // Fire-and-forget order confirmation email. We don't fail the order if
    // mail dispatch fails — the order is already saved.
    if (input.customer.email?.trim()) {
      void sendOrderConfirmationEmail({
        to: input.customer.email.trim(),
        customerName: input.customer.name.trim(),
        orderNumber: result.orderNumber,
        total,
        items: input.items.map((i) => ({
          productName: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        paymentMethod: input.paymentMethod,
        fulfillmentType: input.fulfillmentType,
        branchName: input.delivery.branch,
        deliveryAddress: input.delivery.address ?? null,
        deliveryNotes: input.delivery.notes ?? null,
        deliveryLat: input.delivery.lat ?? null,
        deliveryLng: input.delivery.lng ?? null,
        placedAt: new Date(),
      }).catch((err) => {
        console.error("Failed to send order confirmation email", err)
      })
    }

    return { ok: true, orderId: result.id, orderNumber: result.orderNumber }
  } catch (err) {
    console.error("placeOrder failed", err)
    return {
      ok: false,
      error: "We could not place your order. Please try again or call us directly.",
    }
  }
}

export async function getOrderForReceipt(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      customer: true,
    },
  })
  if (!order) return null
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    fulfillmentType: order.fulfillmentType,
    branchName: order.branchName,
    deliveryAddress: order.deliveryAddress,
    deliveryNotes: order.deliveryNotes,
    deliveryLat: order.deliveryLat,
    deliveryLng: order.deliveryLng,
    total: order.total,
    totalLabel: formatGhs(order.total),
    createdAt: order.createdAt.toISOString(),
    customer: {
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
    },
    items: order.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      unitPriceLabel: formatGhs(i.unitPrice),
      lineLabel: formatGhs(i.unitPrice * i.quantity),
    })),
  }
}
