"use server"

import { prisma } from "@/lib/prisma"
import {
  sendConsultationConfirmationEmail,
  sendConsultationNotificationEmail,
} from "@/lib/email"
import { revalidatePath } from "next/cache"

export type ConsultationFormData = {
  fullName: string
  email: string
  phone: string
  medicationInterest?: string
  message: string
}

export type ConsultationResult =
  | { success: true }
  | { success: false; error: string }

export async function submitConsultationRequest(
  data: ConsultationFormData
): Promise<ConsultationResult> {
  // Basic server-side validation
  if (!data.fullName?.trim()) return { success: false, error: "Full name is required." }
  if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return { success: false, error: "A valid email address is required." }
  if (!data.phone?.trim()) return { success: false, error: "Phone number is required." }
  if (!data.message?.trim()) return { success: false, error: "Please include a message." }

  try {
    const record = await prisma.consultationRequest.create({
      data: {
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        medicationInterest: data.medicationInterest?.trim() || null,
        message: data.message.trim(),
        status: "New",
      },
    })

    const emailPayload = {
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      medicationInterest: record.medicationInterest,
      message: record.message,
      submittedAt: record.createdAt,
    }

    // Fire both emails concurrently — failures are non-fatal
    await Promise.allSettled([
      sendConsultationConfirmationEmail(emailPayload),
      sendConsultationNotificationEmail(emailPayload),
    ])

    revalidatePath("/dashboard/consultations")

    return { success: true }
  } catch (err) {
    console.error("[consultation] failed to save request", err)
    return {
      success: false,
      error: "Something went wrong. Please try again or call us directly.",
    }
  }
}

// ─── Dashboard actions ────────────────────────────────────────────────────────

export async function getConsultations(page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize
  const [items, total] = await Promise.all([
    prisma.consultationRequest.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.consultationRequest.count(),
  ])
  return { items, total, page, pageSize }
}

export async function updateConsultationStatus(
  id: string,
  status: string,
  handledByName: string,
  notes?: string
): Promise<{ success: boolean }> {
  try {
    await prisma.consultationRequest.update({
      where: { id },
      data: {
        status,
        handledByName,
        handledAt: new Date(),
        notes: notes ?? null,
      },
    })
    revalidatePath("/dashboard/consultations")
    return { success: true }
  } catch {
    return { success: false }
  }
}
