"use server"

import { prisma } from "@/lib/prisma"
import { deriveStockStatus, slugifyCategory, ALL_BRANCHES_VALUE } from "@/lib/inventory"
import { revalidatePath } from "next/cache"

export type ProductInput = {
  name: string
  description?: string
  sku?: string
  categoryId: string
  costPrice: number
  price: number
  discountPercent?: number
  stock: number
  lowStockAt?: number
  active?: boolean
  featured?: boolean
  branch?: string
  tags?: string[]
  image?: string
  images?: string[]
  expiryDate?: string | null
}

function normalizeProductInput(data: ProductInput) {
  const lowStockAt = data.lowStockAt ?? 10
  const stock = Math.max(0, Math.floor(data.stock))
  const images = data.images?.length ? data.images : data.image ? [data.image] : []
  const primaryImage = images[0] ?? data.image ?? null
  const tags = (data.tags ?? []).map((t) => t.trim()).filter(Boolean)
  const discountPercent = Math.max(
    0,
    Math.min(99, Math.floor(data.discountPercent ?? 0))
  )

  let expiryDate: Date | null = null
  if (data.expiryDate) {
    const parsed = new Date(data.expiryDate)
    if (!Number.isNaN(parsed.getTime())) expiryDate = parsed
  }

  return {
    name: data.name.trim(),
    description: data.description?.trim() || null,
    sku: data.sku?.trim() || null,
    costPrice: data.costPrice,
    price: data.price,
    discountPercent,
    stock,
    lowStockAt,
    status: deriveStockStatus(stock, lowStockAt),
    active: data.active ?? true,
    featured: data.featured ?? false,
    branch: data.branch?.trim() || ALL_BRANCHES_VALUE,
    tags,
    image: primaryImage,
    images,
    expiryDate,
    categoryId: data.categoryId,
  }
}

export async function getProducts() {
  return await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getProductById(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  })
}

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  })
}

export async function createCategory(name: string) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error("Category name is required")

  const category = await prisma.category.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed, slug: slugifyCategory(trimmed) },
  })

  revalidatePath("/dashboard/products")
  return category
}

export async function createProduct(data: ProductInput) {
  const normalized = normalizeProductInput(data)
  const { categoryId, ...productData } = normalized

  const product = await prisma.product.create({
    data: {
      ...productData,
      category: { connect: { id: categoryId } },
    },
    include: { category: true },
  })

  revalidatePath("/dashboard/products")
  revalidatePath("/")
  return product
}

export async function updateProduct(id: string, data: ProductInput) {
  const normalized = normalizeProductInput(data)

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: normalized.name,
      description: normalized.description,
      sku: normalized.sku,
      costPrice: normalized.costPrice,
      price: normalized.price,
      discountPercent: normalized.discountPercent,
      stock: normalized.stock,
      lowStockAt: normalized.lowStockAt,
      status: normalized.status,
      active: normalized.active,
      featured: normalized.featured,
      branch: normalized.branch,
      tags: normalized.tags,
      image: normalized.image,
      images: normalized.images,
      expiryDate: normalized.expiryDate,
      category: { connect: { id: normalized.categoryId } },
    },
    include: { category: true },
  })

  revalidatePath("/dashboard/products")
  revalidatePath(`/dashboard/products/${id}/edit`)
  revalidatePath("/")
  return product
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } })
  revalidatePath("/dashboard/products")
  revalidatePath("/")
}

export async function toggleProductActive(id: string, active: boolean) {
  await prisma.product.update({
    where: { id },
    data: { active },
  })
  revalidatePath("/dashboard/products")
  revalidatePath("/")
}

export async function toggleProductFeatured(id: string, featured: boolean) {
  await prisma.product.update({
    where: { id },
    data: { featured },
  })
  revalidatePath("/dashboard/products")
  revalidatePath("/")
}
