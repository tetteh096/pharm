"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

export async function getUsers() {
  await requireAdmin()
  return prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      department: true, phone: true, active: true, createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: Role
  department?: string
  phone?: string
}) {
  await requireAdmin()
  const hashed = await bcrypt.hash(data.password, 12)
  const user = await prisma.user.create({
    data: { ...data, password: hashed },
  })
  revalidatePath("/dashboard/users")
  return user
}

export async function updateUserRole(userId: string, role: Role) {
  await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath("/dashboard/users")
}

export async function updateUser(
  userId: string,
  data: {
    name: string
    email: string
    role: Role
    department?: string | null
    phone?: string | null
  }
) {
  await requireAdmin()
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department ?? null,
      phone: data.phone ?? null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      phone: true,
      active: true,
      createdAt: true,
    },
  })
  revalidatePath("/dashboard/users")
  return updated
}

export async function toggleUserActive(userId: string, active: boolean) {
  await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { active } })
  revalidatePath("/dashboard/users")
}

export async function adminResetPassword(userId: string, newPassword: string) {
  await requireAdmin()
  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
  revalidatePath("/dashboard/users")
}
