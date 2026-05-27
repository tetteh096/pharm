"use server"

import { prisma } from "@/lib/prisma"
import { slugifyCategory } from "@/lib/inventory"
import { revalidatePath } from "next/cache"

export async function getCategoriesWithCounts() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  })

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c._count.products,
  }))
}

export async function createCategoryWithSlug(name: string) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error("Category name is required")

  const existing = await prisma.category.findUnique({ where: { name: trimmed } })
  if (existing) throw new Error("A category with that name already exists")

  const category = await prisma.category.create({
    data: { name: trimmed, slug: slugifyCategory(trimmed) },
  })

  revalidatePath("/dashboard/products")
  revalidatePath("/dashboard/products/categories")
  return category
}

export async function renameCategory(id: string, name: string) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error("Category name is required")

  const category = await prisma.category.update({
    where: { id },
    data: { name: trimmed, slug: slugifyCategory(trimmed) },
  })

  revalidatePath("/dashboard/products")
  revalidatePath("/dashboard/products/categories")
  return category
}

export async function deleteCategory(id: string) {
  const count = await prisma.product.count({ where: { categoryId: id } })
  if (count > 0) {
    throw new Error(
      `This category has ${count} product${count === 1 ? "" : "s"}. Reassign them first.`
    )
  }

  await prisma.category.delete({ where: { id } })
  revalidatePath("/dashboard/products")
  revalidatePath("/dashboard/products/categories")
}
