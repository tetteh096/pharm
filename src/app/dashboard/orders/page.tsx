import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Inbox, Plus } from "lucide-react"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { OrdersTableBody } from "@/components/dashboard/OrdersTableBody"
import { getOrdersList } from "../actions"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const orders = await getOrdersList()

  return (
    <div className="dashboard-page space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track pharmacy orders from your database — click any row to open
            the full order panel with delivery details, items, and audit trail.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/orders/new">
            <Plus size={16} />
            New order
          </Link>
        </Button>
      </div>

      <Card className="dashboard-card">
        <CardHeader className="pb-0" />
        <CardContent className="pt-4">
          {orders.length === 0 ? (
            <div className="space-y-4">
              <EmptyState
                icon={Inbox}
                title="No orders yet"
                description="Orders will show here once they are created in the system, or you can enter one manually for a phone/walk-in customer."
              />
              <div className="flex justify-center">
                <Button asChild className="gap-2">
                  <Link href="/dashboard/orders/new">
                    <Plus size={16} /> Create the first order
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Fulfillment
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Delivery
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <OrdersTableBody orders={orders} />
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
