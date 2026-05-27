import Link from "next/link"
import { Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PatientList } from "@/components/dashboard/PatientList"
import { getPatients, getPatientSummary } from "./actions"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{
  search?: string
  type?: string
  status?: string
}>

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const filters = {
    search: sp.search?.trim() || undefined,
    clientType: sp.type ?? "all",
    status: sp.status ?? "all",
  }

  const [patients, summary] = await Promise.all([
    getPatients(filters),
    getPatientSummary(),
  ])

  return (
    <div className="dashboard-page space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Patients
          </h1>
          <p className="text-muted-foreground mt-1">
            All registered patients — online orders, walk-ins, and manual
            entries. Chronic patients show their care record here too.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/customers/new">
            <Plus size={16} /> New patient
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardDescription>Total patients</CardDescription>
            <CardTitle className="text-3xl">{summary.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardDescription>Chronic care</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {summary.chronicCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardDescription>New this month</CardDescription>
            <CardTitle className="text-3xl">{summary.newThisMonth}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardDescription>Refills due / overdue</CardDescription>
            <CardTitle className="text-3xl">
              <span className="text-yellow-600">{summary.refillsDueCount}</span>
              <span className="text-muted-foreground text-lg"> / </span>
              <span className="text-red-500">{summary.overdueRefillsCount}</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <PatientList
        initialPatients={patients.map((p) => ({
          id: p.id,
          name: p.name,
          phone: p.phone,
          email: p.email,
          clientType: p.clientType,
          condition: p.condition,
          source: p.source,
          gender: p.gender,
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.toISOString() : null,
          status: p.status,
          nextRefillAt: p.nextRefillAt ? p.nextRefillAt.toISOString() : null,
          lastRefillAt: p.lastRefillAt ? p.lastRefillAt.toISOString() : null,
          allergies: p.allergies,
          createdAt: p.createdAt.toISOString(),
          ordersCount: p._count.orders,
          chronicRecord: p.chronicRecord
            ? {
                id: p.chronicRecord.id,
                condition: p.chronicRecord.condition,
                status: p.chronicRecord.status,
                nextCheckInAt: p.chronicRecord.nextCheckInAt
                  ? p.chronicRecord.nextCheckInAt.toISOString()
                  : null,
                assignedToName: p.chronicRecord.assignedToName,
              }
            : null,
        }))}
        currentSearch={filters.search ?? ""}
        currentType={filters.clientType}
        currentStatus={filters.status}
      />
    </div>
  )
}
