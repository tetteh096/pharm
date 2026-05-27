"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export type ChronicCareInput = {
  customerId: string
  condition: string
  currentMedications?: string[]
  dosageSchedule?: string | null
  status?: string
  nextCheckInAt?: string | null
  assignedToId?: string | null
  notes?: string | null
}

export type ChronicCareUpdateInput = {
  condition?: string
  currentMedications?: string[]
  dosageSchedule?: string | null
  status?: string
  nextCheckInAt?: string | null
  assignedToId?: string | null
  notes?: string | null
}

export type ChronicFilters = {
  scope?: "mine" | "all"
  status?: string
  due?: "overdue" | "thisWeek" | "all"
  search?: string
}

export type CheckInInput = {
  method: string
  outcome: string
  needsRefill?: boolean
  notes?: string | null
  nextCheckInAt?: string | null
}

// ─── Read ───────────────────────────────────────────────────────────────────

export async function getChronicPatients(filters: ChronicFilters = {}) {
  const session = await auth()
  const actor = session?.user

  const where: Record<string, unknown> = {}
  if (filters.scope === "mine" && actor?.id) {
    where.assignedToId = actor.id
  }
  if (filters.status && filters.status !== "all") {
    where.status = filters.status
  }
  if (filters.due === "overdue") {
    where.nextCheckInAt = { lt: new Date() }
  } else if (filters.due === "thisWeek") {
    const now = new Date()
    const in7 = new Date(now)
    in7.setDate(in7.getDate() + 7)
    where.nextCheckInAt = { gte: now, lte: in7 }
  }

  let list = await prisma.chronicPatient.findMany({
    where,
    orderBy: [{ nextCheckInAt: "asc" }, { createdAt: "desc" }],
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          dateOfBirth: true,
          gender: true,
        },
      },
      _count: { select: { checkIns: true } },
    },
  })

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    list = list.filter(
      (c) =>
        c.customer.name.toLowerCase().includes(q) ||
        (c.customer.phone ?? "").toLowerCase().includes(q) ||
        c.condition.toLowerCase().includes(q)
    )
  }

  return list
}

export async function getChronicPatient(id: string) {
  return prisma.chronicPatient.findUnique({
    where: { id },
    include: {
      customer: true,
      checkIns: {
        orderBy: { contactedAt: "desc" },
      },
    },
  })
}

export async function getChronicSummary() {
  const session = await auth()
  const actor = session?.user
  const now = new Date()
  const in7 = new Date(now)
  in7.setDate(in7.getDate() + 7)

  const mineWhere = actor?.id ? { assignedToId: actor.id } : {}

  const [
    total,
    active,
    overdue,
    dueThisWeek,
    mineTotal,
    mineOverdue,
    mineDueThisWeek,
  ] = await Promise.all([
    prisma.chronicPatient.count(),
    prisma.chronicPatient.count({ where: { status: "Active" } }),
    prisma.chronicPatient.count({
      where: { status: "Active", nextCheckInAt: { lt: now } },
    }),
    prisma.chronicPatient.count({
      where: {
        status: "Active",
        nextCheckInAt: { gte: now, lte: in7 },
      },
    }),
    prisma.chronicPatient.count({ where: mineWhere }),
    prisma.chronicPatient.count({
      where: { ...mineWhere, status: "Active", nextCheckInAt: { lt: now } },
    }),
    prisma.chronicPatient.count({
      where: {
        ...mineWhere,
        status: "Active",
        nextCheckInAt: { gte: now, lte: in7 },
      },
    }),
  ])

  return {
    total,
    active,
    overdue,
    dueThisWeek,
    mine: {
      total: mineTotal,
      overdue: mineOverdue,
      dueThisWeek: mineDueThisWeek,
    },
  }
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export async function addChronicCare(input: ChronicCareInput) {
  if (!input.customerId) throw new Error("customerId is required")
  if (!input.condition?.trim()) throw new Error("Condition is required")

  const session = await auth()
  const actor = session?.user

  const existing = await prisma.chronicPatient.findUnique({
    where: { customerId: input.customerId },
  })
  if (existing) {
    throw new Error("This patient already has a chronic care record.")
  }

  const assignedToId = input.assignedToId ?? actor?.id ?? null
  let assignedToName: string | null = null
  if (assignedToId) {
    if (assignedToId === actor?.id) {
      assignedToName = actor?.name ?? null
    } else {
      const user = await prisma.user.findUnique({
        where: { id: assignedToId },
        select: { name: true },
      })
      assignedToName = user?.name ?? null
    }
  }

  const record = await prisma.chronicPatient.create({
    data: {
      customerId: input.customerId,
      condition: input.condition.trim(),
      currentMedications: (input.currentMedications ?? [])
        .map((m) => m.trim())
        .filter(Boolean),
      dosageSchedule: input.dosageSchedule?.trim() || null,
      status: input.status?.trim() || "Active",
      assignedToId,
      assignedToName,
      nextCheckInAt: input.nextCheckInAt ? new Date(input.nextCheckInAt) : null,
      notes: input.notes?.trim() || null,
    },
  })

  // Tag the customer as a Chronic Client so they show up in the right filters.
  await prisma.customer.update({
    where: { id: input.customerId },
    data: { clientType: "Chronic Client", condition: input.condition.trim() },
  })

  revalidatePath("/dashboard/chronic")
  revalidatePath("/dashboard/customers")
  revalidatePath(`/dashboard/customers/${input.customerId}`)
  return record
}

export async function updateChronicCare(id: string, input: ChronicCareUpdateInput) {
  let assignedToName: string | null | undefined = undefined
  if (input.assignedToId !== undefined) {
    if (input.assignedToId) {
      const user = await prisma.user.findUnique({
        where: { id: input.assignedToId },
        select: { name: true },
      })
      assignedToName = user?.name ?? null
    } else {
      assignedToName = null
    }
  }

  const record = await prisma.chronicPatient.update({
    where: { id },
    data: {
      ...(input.condition !== undefined
        ? { condition: input.condition.trim() }
        : {}),
      ...(input.currentMedications !== undefined
        ? {
            currentMedications: input.currentMedications
              .map((m) => m.trim())
              .filter(Boolean),
          }
        : {}),
      ...(input.dosageSchedule !== undefined
        ? { dosageSchedule: input.dosageSchedule?.trim() || null }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.nextCheckInAt !== undefined
        ? {
            nextCheckInAt: input.nextCheckInAt
              ? new Date(input.nextCheckInAt)
              : null,
          }
        : {}),
      ...(input.assignedToId !== undefined
        ? { assignedToId: input.assignedToId }
        : {}),
      ...(assignedToName !== undefined ? { assignedToName } : {}),
      ...(input.notes !== undefined
        ? { notes: input.notes?.trim() || null }
        : {}),
    },
    include: { customer: { select: { id: true } } },
  })

  revalidatePath("/dashboard/chronic")
  revalidatePath(`/dashboard/chronic/${id}`)
  if (record.customer) revalidatePath(`/dashboard/customers/${record.customer.id}`)
  return record
}

export async function removeChronicCare(id: string) {
  const record = await prisma.chronicPatient.findUnique({
    where: { id },
    select: { customerId: true },
  })
  await prisma.chronicPatient.delete({ where: { id } })

  if (record) {
    await prisma.customer.update({
      where: { id: record.customerId },
      data: { clientType: "Regular" },
    })
  }

  revalidatePath("/dashboard/chronic")
  revalidatePath("/dashboard/customers")
  if (record) revalidatePath(`/dashboard/customers/${record.customerId}`)
  return { ok: true as const }
}

export async function logCheckIn(
  chronicPatientId: string,
  input: CheckInInput
) {
  if (!input.method?.trim()) throw new Error("Contact method is required")
  if (!input.outcome?.trim()) throw new Error("Outcome is required")

  const session = await auth()
  const actor = session?.user

  const contactedAt = new Date()
  const nextCheckInAt = input.nextCheckInAt
    ? new Date(input.nextCheckInAt)
    : null

  await prisma.$transaction([
    prisma.chronicCheckIn.create({
      data: {
        chronicPatientId,
        contactedAt,
        contactedById: actor?.id ?? null,
        contactedByName: actor?.name ?? null,
        method: input.method.trim().toUpperCase(),
        outcome: input.outcome.trim().toUpperCase(),
        needsRefill: Boolean(input.needsRefill),
        notes: input.notes?.trim() || null,
        nextCheckInAt,
      },
    }),
    prisma.chronicPatient.update({
      where: { id: chronicPatientId },
      data: {
        lastContactAt: contactedAt,
        nextCheckInAt,
      },
    }),
  ])

  revalidatePath("/dashboard/chronic")
  revalidatePath(`/dashboard/chronic/${chronicPatientId}`)
  return { ok: true as const }
}

// ─── Patient search (chronic-eligible) ──────────────────────────────────────

export type ChronicEligiblePatient = {
  id: string
  name: string
  phone: string | null
  email: string | null
  condition: string | null
  clientType: string
  gender: string | null
  dateOfBirth: string | null
}

export async function searchPatientsForChronic(
  query: string,
  limit = 10
): Promise<ChronicEligiblePatient[]> {
  const q = query.trim()
  const where: Record<string, unknown> = {
    chronicRecord: { is: null },
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { condition: { contains: q, mode: "insensitive" } },
    ]
  }

  const list = await prisma.customer.findMany({
    where,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      condition: true,
      clientType: true,
      gender: true,
      dateOfBirth: true,
    },
  })

  return list.map((p) => ({
    ...p,
    dateOfBirth: p.dateOfBirth ? p.dateOfBirth.toISOString() : null,
  }))
}

// ─── Staff list for the assignee dropdown ───────────────────────────────────

export async function getStaffOptions() {
  const users = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  })
  return users
}
