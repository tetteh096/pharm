import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Package, ShoppingBag, Users, AlertTriangle, FileText, Inbox, MessageSquare } from "lucide-react"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge"
import { getDashboardOverview } from "./actions"
import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()
  const data = await getDashboardOverview()
  const firstName = session?.user?.name?.split(" ")[0] ?? "there"

  const stats = [
    {
      title: "Total Revenue",
      value: data.stats.totalRevenue,
      description:
        data.stats.revenueChange !== null
          ? `${data.stats.revenueChange >= 0 ? "+" : ""}${data.stats.revenueChange.toFixed(1)}% vs last month`
          : "No revenue data yet",
      icon: ShoppingBag,
    },
    {
      title: "Active Orders",
      value: String(data.stats.activeOrders),
      description: "Pending, processing, or shipped",
      icon: Package,
    },
    {
      title: "Patients",
      value: String(data.stats.customerCount),
      description:
        data.stats.newCustomersThisMonth > 0
          ? `+${data.stats.newCustomersThisMonth} this month`
          : "Registered in your system",
      icon: Users,
    },
    {
      title: "Low Stock Items",
      value: String(data.stats.lowStockCount),
      description: "Products below 10 units",
      icon: AlertTriangle,
    },
    {
      title: "New Consultations",
      value: String(data.stats.newConsultations),
      description: "Unread website requests",
      icon: MessageSquare,
      href: "/dashboard/consultations",
    },
  ]

  return (
    <div className="dashboard-page space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {firstName}. Here is your pharmacy at a glance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/">View website</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/products">Manage inventory</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title} className={`dashboard-card${"href" in stat ? " cursor-pointer hover:border-primary/50 transition-colors" : ""}`}>
            {"href" in stat ? (
              <Link href={(stat as { href: string }).href} className="block">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Link>
            ) : (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="dashboard-card lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue overview</CardTitle>
            <CardDescription>Delivered orders — last 7 months (GH₵)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart data={data.revenueChart} />
          </CardContent>
        </Card>

        <Card className="dashboard-card lg:col-span-3">
          <CardHeader>
            <CardTitle>Inventory by category</CardTitle>
            <CardDescription>Product count per category</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topCategories.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No products yet"
                description="Add inventory to see category breakdown."
              />
            ) : (
              <div className="space-y-4">
                {data.topCategories.map((category) => (
                  <div key={category.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-muted-foreground">{category.count} items</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${category.percentage}%`,
                          background: "linear-gradient(90deg, #13ec8a, #1157ee)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.stats.productCount}</p>
            <p className="text-sm text-muted-foreground">products in catalog</p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Health blog
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.stats.publishedPosts}</p>
            <p className="text-sm text-muted-foreground">published articles</p>
          </CardContent>
        </Card>
      </div>

      <Card className="dashboard-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>
              {data.stats.activeOrders > 0
                ? `${data.stats.activeOrders} active order${data.stats.activeOrders === 1 ? "" : "s"} right now`
                : "Orders from your database"}
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!data.hasOrders ? (
            <EmptyState
              icon={Inbox}
              title="No orders yet"
              description="When customers place orders, they will appear here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.id}</TableCell>
                    <TableCell className="font-medium">{order.customer}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {order.product}
                    </TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
