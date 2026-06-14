import { getOrdersList } from "../actions"
import { OrdersTable } from "@/components/dashboard/OrdersTable"
import { auth } from "@/auth"
import { canViewFinancials } from "@/lib/dashboard-rbac"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const session = await auth()
  const orders = await getOrdersList()
  const showFinancials = canViewFinancials(session?.user?.role)

  return (
    <div className="dashboard-page">
      <OrdersTable orders={orders} showFinancials={showFinancials} />
    </div>
  )
}
