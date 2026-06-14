"use server"

import { prisma } from "@/lib/prisma"
import {
  sendContactConfirmationEmail,
  sendContactNotificationEmail,
} from "@/lib/email"
import { PHARMACY_BRANCHES } from "@/data/pharmacy-branches"
import {
  isUniqueConstraintError,
  normalizeIdempotencyKey,
} from "@/lib/server-idempotency"
import { revalidatePath } from "next/cache"

export type ContactFormData = {
  fullName: string
  email: string
  phone: string
  branchId: string
  subject: string
  message: string
  idempotencyKey?: string
}

export type ContactFormResult =
  | { success: true }
  | { success: false; error: string }

export async function submitContactForm(
  data: ContactFormData
): Promise<ContactFormResult> {
  if (!data.fullName?.trim()) return { success: false, error: "Please enter your name." }
  if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { success: false, error: "Please enter a valid email address." }
  }
  if (!data.phone?.trim()) return { success: false, error: "Please enter your phone number." }
  if (!data.subject?.trim()) return { success: false, error: "Please add a subject." }
  if (!data.message?.trim()) return { success: false, error: "Please write your message." }

  const idempotencyKey = normalizeIdempotencyKey(data.idempotencyKey)
  if (!idempotencyKey) {
    return { success: false, error: "Invalid submission. Please refresh and try again." }
  }

  const branch =
    PHARMACY_BRANCHES.find((b) => b.id === data.branchId) ?? PHARMACY_BRANCHES[0]

  const normalized = {
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    branchId: branch.id,
    branchName: branch.name,
    subject: data.subject.trim(),
    message: data.message.trim(),
  }

  try {
    const existing = await prisma.contactMessage.findUnique({
      where: { idempotencyKey },
    })
    if (existing) {
      return { success: true }
    }

    const record = await prisma.contactMessage.create({
      data: {
        ...normalized,
        idempotencyKey,
        status: "New",
      },
    })

    const emailPayload = {
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      branch: record.branchName,
      subject: record.subject,
      message: record.message,
      submittedAt: record.createdAt,
    }

    // Email is optional — saved to dashboard either way
    await Promise.allSettled([
      sendContactConfirmationEmail(emailPayload),
      sendContactNotificationEmail(emailPayload),
    ])

    revalidatePath("/dashboard/contact-messages")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { success: true }
    }
    console.error("[contact] failed to save message", err)
    return {
      success: false,
      error: "Something went wrong. Please call us directly or try again.",
    }
  }
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getContactMessages(page = 1, pageSize = 500) {
  const skip = (page - 1) * pageSize
  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.contactMessage.count(),
  ])
  return { items, total, page, pageSize }
}

export async function getContactMessageStaffOptions() {
  return prisma.user.findMany({
    where: { active: true },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  })
}

export async function updateContactMessageStatus(
  id: string,
  status: string,
  handledById: string | null,
  notes?: string
): Promise<{ success: boolean }> {
  try {
    let handledByName: string | null = null
    if (handledById) {
      const user = await prisma.user.findUnique({
        where: { id: handledById },
        select: { name: true },
      })
      handledByName = user?.name ?? null
    }

    await prisma.contactMessage.update({
      where: { id },
      data: {
        status,
        handledById,
        handledByName,
        handledAt: handledById ? new Date() : null,
        notes: notes ?? null,
      },
    })
    revalidatePath("/dashboard/contact-messages")
    return { success: true }
  } catch {
    return { success: false }
  }
}
