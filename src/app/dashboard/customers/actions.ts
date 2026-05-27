"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// ─── Types ──────────────────────────────────────────────────────────────────

export type PatientInput = {
  name: string
  phone?: string
  email?: string
  dateOfBirth?: string | null
  gender?: string | null
  address?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  allergies?: string[]
  medicalNotes?: string | null
  clientType?: string
  condition?: string | null
  source?: string | null
  notes?: string | null
  status?: string
  lastRefillAt?: string | null
  nextRefillAt?: string | null
}

export type PatientFilters = {
  search?: string
  clientType?: string
  status?: string
}

// ─── Read ───────────────────────────────────────────────────────────────────

export async function getPatients(filters: PatientFilters = {}) {
  const where: Record<string, unknown> = {}

  if (filters.search?.trim()) {
    const q = filters.search.trim()
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { condition: { contains: q, mode: "insensitive" } },
    ]
  }
  if (filters.clientType && filters.clientType !== "all") {
    where.clientType = filters.clientType
  }
  if (filters.status && filters.status !== "all") {
    where.status = filters.status
  }

  const patients = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      chronicRecord: {
        select: {
          id: true,
          condition: true,
          status: true,
          nextCheckInAt: true,
          assignedToName: true,
        },
      },
      _count: { select: { orders: true } },
    },
  })

  return patients
}

export async function getPatient(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          fulfillmentType: true,
          branchName: true,
        },
      },
      chronicRecord: {
        include: {
          checkIns: {
            orderBy: { contactedAt: "desc" },
            take: 5,
          },
        },
      },
    },
  })
}

export async function getPatientSummary() {
  const now = new Date()
  const inSevenDays = new Date(now)
  inSevenDays.setDate(inSevenDays.getDate() + 7)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    total,
    chronicCount,
    newThisMonth,
    refillsDueCount,
    overdueRefillsCount,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { clientType: "Chronic Client" } }),
    prisma.customer.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.customer.count({
      where: {
        nextRefillAt: { gte: now, lte: inSevenDays },
      },
    }),
    prisma.customer.count({
      where: { nextRefillAt: { lt: now } },
    }),
  ])

  return {
    total,
    chronicCount,
    newThisMonth,
    refillsDueCount,
    overdueRefillsCount,
  }
}

// ─── Mutations ──────────────────────────────────────────────────────────────

function normalizePatient(input: PatientInput) {
  const parseDate = (v?: string | null) =>
    v && v.trim() ? new Date(v) : null

  return {
    name: input.name.trim(),
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    dateOfBirth: parseDate(input.dateOfBirth),
    gender: input.gender?.trim() || null,
    address: input.address?.trim() || null,
    emergencyContactName: input.emergencyContactName?.trim() || null,
    emergencyContactPhone: input.emergencyContactPhone?.trim() || null,
    allergies: (input.allergies ?? []).map((a) => a.trim()).filter(Boolean),
    medicalNotes: input.medicalNotes?.trim() || null,
    clientType: input.clientType?.trim() || "Regular",
    condition: input.condition?.trim() || null,
    source: input.source?.trim() || null,
    notes: input.notes?.trim() || null,
    status: input.status?.trim() || "Active",
    lastRefillAt: parseDate(input.lastRefillAt),
    nextRefillAt: parseDate(input.nextRefillAt),
  }
}

export async function createPatient(input: PatientInput) {
  if (!input.name?.trim()) throw new Error("Patient name is required.")

  const session = await auth()
  const actor = session?.user

  const data = normalizePatient(input)
  const patient = await prisma.customer.create({
    data: {
      ...data,
      source: data.source ?? "Manual entry",
      createdById: actor?.id ?? null,
      createdByName: actor?.name ?? null,
    },
  })

  revalidatePath("/dashboard/customers")
  return patient
}

export async function updatePatient(id: string, input: PatientInput) {
  if (!input.name?.trim()) throw new Error("Patient name is required.")
  const data = normalizePatient(input)
  const patient = await prisma.customer.update({
    where: { id },
    data,
  })
  revalidatePath("/dashboard/customers")
  revalidatePath(`/dashboard/customers/${id}`)
  revalidatePath("/dashboard/chronic")
  return patient
}

export async function deletePatient(id: string) {
  const orderCount = await prisma.order.count({ where: { customerId: id } })
  if (orderCount > 0) {
    return {
      ok: false as const,
      error: `This patient has ${orderCount} order${
        orderCount === 1 ? "" : "s"
      } on file and can't be deleted.`,
    }
  }
  await prisma.customer.delete({ where: { id } })
  revalidatePath("/dashboard/customers")
  return { ok: true as const }
}

// ─── CSV export ─────────────────────────────────────────────────────────────

export async function exportPatientsCsv(
  filters: PatientFilters = {}
): Promise<string> {
  const patients = await getPatients(filters)
  const header = [
    "Name",
    "Phone",
    "Email",
    "Date of Birth",
    "Gender",
    "Address",
    "Emergency Contact",
    "Emergency Phone",
    "Allergies",
    "Client Type",
    "Condition",
    "Source",
    "Status",
    "Last Refill",
    "Next Refill",
    "Orders",
    "Registered",
  ]
  const escape = (val: unknown) => {
    const s = String(val ?? "")
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }
  const rows = patients.map((p) =>
    [
      p.name,
      p.phone ?? "",
      p.email ?? "",
      p.dateOfBirth ? p.dateOfBirth.toISOString().slice(0, 10) : "",
      p.gender ?? "",
      p.address ?? "",
      p.emergencyContactName ?? "",
      p.emergencyContactPhone ?? "",
      p.allergies.join("; "),
      p.clientType,
      p.condition ?? "",
      p.source ?? "",
      p.status,
      p.lastRefillAt ? p.lastRefillAt.toISOString().slice(0, 10) : "",
      p.nextRefillAt ? p.nextRefillAt.toISOString().slice(0, 10) : "",
      p._count.orders,
      p.createdAt.toISOString().slice(0, 10),
    ]
      .map(escape)
      .join(",")
  )
  return [header.join(","), ...rows].join("\n")
}
