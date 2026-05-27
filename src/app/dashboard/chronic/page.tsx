import { HeartPulse, AlertTriangle, CalendarClock, ListChecks } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChronicPatientsList } from "@/components/dashboard/ChronicPatientsList"
import { AddChronicPatientDialog } from "@/components/dashboard/AddChronicPatientDialog"
import {
  getChronicPatients,
  getChronicSummary,
} from "./actions"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{
  scope?: "mine" | "all"
  status?: string
  due?: "overdue" | "thisWeek" | "all"
  search?: string
}>

export default async function ChronicCarePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const scope = sp.scope ?? "mine"
  const status = sp.status ?? "all"
  const due = sp.due ?? "all"
  const search = sp.search?.trim() || undefined

  const [list, summary] = await Promise.all([
    getChronicPatients({ scope, status, due, search }),
    getChronicSummary(),
  ])

  return (
    <div className="dashboard-page space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <HeartPulse className="h-7 w-7 text-primary" />
            Chronic care
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay close to your chronic patients — monthly check-ins, refill
            reminders, and contact logs.
          </p>
        </div>
        <AddChronicPatientDialog />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardDescription>My patients</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {summary.mine.total}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Total assigned to you
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription>My overdue</CardDescription>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-red-500">
              {summary.mine.overdue}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Past their check-in date
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription>My due this week</CardDescription>
            <CalendarClock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-yellow-600">
              {summary.mine.dueThisWeek}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Reach out before they slip
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription>All chronic patients</CardDescription>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold">{summary.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {summary.active} active across all staff
            </div>
          </CardContent>
        </Card>
      </div>

      <ChronicPatientsList
        initial={list.map((c) => ({
          id: c.id,
          condition: c.condition,
          status: c.status,
          nextCheckInAt: c.nextCheckInAt
            ? c.nextCheckInAt.toISOString()
            : null,
          lastContactAt: c.lastContactAt
            ? c.lastContactAt.toISOString()
            : null,
          assignedToName: c.assignedToName,
          currentMedications: c.currentMedications,
          checkInCount: c._count.checkIns,
          customer: {
            id: c.customer.id,
            name: c.customer.name,
            phone: c.customer.phone,
            email: c.customer.email,
            dateOfBirth: c.customer.dateOfBirth
              ? c.customer.dateOfBirth.toISOString()
              : null,
            gender: c.customer.gender,
          },
        }))}
        currentScope={scope}
        currentStatus={status}
        currentDue={due}
        currentSearch={search ?? ""}
      />
    </div>
  )
}
