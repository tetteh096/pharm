import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MessageSquare, Inbox } from "lucide-react"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { getConsultations } from "@/app/actions/consultation"
import { ConsultationActions } from "@/components/dashboard/ConsultationActions"

export const dynamic = "force-dynamic"

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  "In Progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  Done: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Dismissed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

export default async function ConsultationsPage() {
  const { items, total } = await getConsultations(1, 50)

  return (
    <div className="dashboard-page space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consultations</h1>
          <p className="text-muted-foreground mt-1">
            Requests submitted through the website&apos;s &ldquo;Book a Free Consultation&rdquo; form.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare size={16} />
          {total} total request{total !== 1 ? "s" : ""}
        </div>
      </div>

      <Card className="dashboard-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All requests</CardTitle>
          <CardDescription>Newest first. Update status to track follow-ups.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {items.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No consultation requests yet"
              description="When someone submits the 'Book a Free Consultation' form on the website, their request will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="hidden md:table-cell">Medication interest</TableHead>
                    <TableHead className="hidden lg:table-cell">Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Received</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.fullName}</TableCell>
                      <TableCell>
                        <div className="text-sm">{req.email}</div>
                        <div className="text-xs text-muted-foreground">{req.phone}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {req.medicationInterest || "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell max-w-[260px]">
                        <p className="text-sm text-muted-foreground line-clamp-2">{req.message}</p>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[req.status] ?? STATUS_COLORS["New"]}`}
                        >
                          {req.status}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground whitespace-nowrap">
                        {req.createdAt.toLocaleDateString("en-GH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        <br />
                        {req.createdAt.toLocaleTimeString("en-GH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <ConsultationActions id={req.id} currentStatus={req.status} fullName={req.fullName} message={req.message} notes={req.notes ?? ""} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
