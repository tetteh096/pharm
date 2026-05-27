"use server"

import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/inventory"
import { revalidatePath } from "next/cache"

export type BranchInput = {
  name: string
  location?: string
  phone?: string
  hours?: string
  notes?: string
  active?: boolean
}

export async function getBranches() {
  return await prisma.branch.findMany({ orderBy: { name: "asc" } })
}

export async function getActiveBranches() {
  return await prisma.branch.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  })
}

function clean(input: BranchInput) {
  return {
    name: input.name.trim(),
    slug: slugify(input.name),
    location: input.location?.trim() || null,
    phone: input.phone?.trim() || null,
    hours: input.hours?.trim() || null,
    notes: input.notes?.trim() || null,
    active: input.active ?? true,
  }
}

function revalidate() {
  revalidatePath("/dashboard/branches")
  revalidatePath("/dashboard/products")
  revalidatePath("/dashboard/products/new")
}

export async function createBranch(data: BranchInput) {
  if (!data.name.trim()) throw new Error("Branch name is required")

  const cleaned = clean(data)
  const existing = await prisma.branch.findUnique({ where: { name: cleaned.name } })
  if (existing) throw new Error("A branch with that name already exists")

  const branch = await prisma.branch.create({ data: cleaned })
  revalidate()
  return branch
}

export async function updateBranch(id: string, data: BranchInput) {
  if (!data.name.trim()) throw new Error("Branch name is required")

  const branch = await prisma.branch.update({
    where: { id },
    data: clean(data),
  })
  revalidate()
  return branch
}

export async function deleteBranch(id: string) {
  const branch = await prisma.branch.findUnique({ where: { id } })
  if (!branch) throw new Error("Branch not found")

  const inUse = await prisma.product.count({ where: { branch: branch.name } })
  if (inUse > 0) {
    throw new Error(
      `Cannot delete — ${inUse} product${inUse === 1 ? "" : "s"} use this branch. Reassign them first.`
    )
  }

  await prisma.branch.delete({ where: { id } })
  revalidate()
}

export async function toggleBranchActive(id: string, active: boolean) {
  await prisma.branch.update({ where: { id }, data: { active } })
  revalidate()
}
