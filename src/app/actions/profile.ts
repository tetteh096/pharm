"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

async function requireSelf() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  return session
}

/** Lightweight profile for header avatar (always fresh from DB). */
export async function getMyProfileSnapshot() {
  const session = await requireSelf()
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      role: true,
      department: true,
    },
  })
  if (!user) throw new Error("User not found")
  return user
}

export async function getMyProfile() {
  const session = await requireSelf()
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      phone: true,
      image: true,
      active: true,
      createdAt: true,
    },
  })
  if (!user) throw new Error("User not found")
  return user
}

export async function updateMyProfile(data: {
  name: string
  email: string
  phone?: string | null
  department?: string | null
}) {
  const session = await requireSelf()

  const name = data.name.trim()
  const email = data.email.trim().toLowerCase()
  if (!name) throw new Error("Name is required")
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing && existing.id !== session.user.id) {
    throw new Error("That email is already in use")
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      email,
      phone: data.phone?.trim() || null,
      department: data.department?.trim() || null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      phone: true,
      image: true,
      active: true,
      createdAt: true,
    },
  })
  revalidatePath("/dashboard/account")
  return updated
}

export async function updateMyAvatar(imageDataUrl: string | null) {
  const session = await requireSelf()

  if (imageDataUrl !== null) {
    if (!imageDataUrl.startsWith("data:image/")) {
      throw new Error("Invalid image format")
    }
    // Rough byte budget: a base64 string ~1.37x the original. Cap stored payload.
    if (imageDataUrl.length > 1_500_000) {
      throw new Error("Image is too large (max ~1 MB)")
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageDataUrl },
    select: { image: true },
  })
  revalidatePath("/dashboard/account")
  return updated
}

export async function changeMyPassword(data: {
  currentPassword: string
  newPassword: string
}) {
  const session = await requireSelf()

  if (!data.currentPassword || !data.newPassword) {
    throw new Error("Both passwords are required")
  }
  if (data.newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters")
  }
  if (data.currentPassword === data.newPassword) {
    throw new Error("New password must be different from the current one")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })
  if (!user) throw new Error("User not found")

  const ok = await bcrypt.compare(data.currentPassword, user.password)
  if (!ok) throw new Error("Current password is incorrect")

  const hashed = await bcrypt.hash(data.newPassword, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  })

  return { ok: true }
}
