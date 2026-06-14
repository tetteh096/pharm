import Link from "next/link"
import type { Role } from "@prisma/client"
import {
  Package,
  Users,
  AlertTriangle,
  FileText,
  Inbox,
  MessageSquare,
  Mail,
  HeartPulse,
  ShoppingBag,
  ArrowRight,
  CalendarClock,
} from "lucide-react"
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
import { EmptyState } from "@/components/dashboard/EmptyState"
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge"
import { navItemsForRole } from "@/lib/dashboard-rbac"
import type { DashboardOverviewData } from "@/app/dashboard/actions"

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatRelativeDay(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round(
    (startOfDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (diffDays === 0) return "Today"
  if (diffDays === -1) return "Yesterday"
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} day${diffDays === 1 ? "" : "s"}`
  return formatShortDate(iso)
}

type StatCard = {
  title: string
  value: string
  description: string
  icon: typeof Package
  href: string
}

export function DashboardOverview({
  data,
  firstName,
  role,
}: {
  data: DashboardOverviewData
  firstName: string
  role: Role | undefined
}) {
  const showBlogStats = role === "ADMIN" || role === "PHARMACIST"
  const allowedUrls = new Set(navItemsForRole(role).map((item) => item.url))

  const stats: StatCard[] = [
    {
      title: "Active Orders",
      value: String(data.stats.activeOrders),
      description: "Pending, processing, or shipped",
      icon: Package,
      href: "/dashboard/orders",
    },
    {
      title: "Patients",
      value: String(data.stats.customerCount),
      description:
        data.stats.newCustomersThisMonth > 0
          ? `+${data.stats.newCustomersThisMonth} this month`
          : "Registered in your system",
      icon: Users,
      href: "/dashboard/customers",
    },
    {
      title: "Low Stock Items",
      value: String(data.stats.lowStockCount),
      description: "Products below 10 units",
      icon: AlertTriangle,
      href: "/dashboard/products",
    },
    {
      title: "New Consultations",
      value: String(data.stats.newConsultations),
      description: "Unread website requests",
      icon: MessageSquare,
      href: "/dashboard/consultations",
    },
    {
      title: "Contact messages",
      value: String(data.stats.newContactMessages),
      description: "New contact form submissions",
      icon: Mail,
      href: "/dashboard/contact-messages",
    },
  ]

  const quickActions = [
    { label: "New order", href: "/dashboard/orders", icon: ShoppingBag },
    { label: "Consultations", href: "/dashboard/consultations", icon: MessageSquare },
    { label: "Contact inbox", href: "/dashboard/contact-messages", icon: Mail },
    { label: "Chronic care", href: "/dashboard/chronic", icon: HeartPulse },
  ].filter((action) => allowedUrls.has(action.href))

  const statusTotal = data.ordersByStatus.reduce((sum, row) => sum + row.count, 0)

  return (
    <div className="dashboard-page space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {firstName}. Here is your pharmacy at a glance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">View website</Link>
          </Button>
          {quickActions.map((action) => (
            <Button key={action.href} variant="secondary" size="sm" asChild>
              <Link href={action.href}>
                <action.icon className="mr-1.5 h-3.5 w-3.5" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href} className="group block">
            <Card className="dashboard-card h-full transition-colors hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Website inbox</CardTitle>
              <CardDescription>New consultations and contact messages</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/consultations">
                Open
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.inbox.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Inbox is clear"
                description="New website requests will show up here."
              />
            ) : (
              <ul className="divide-y divide-border">
                {data.inbox.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    <Link
                      href={item.href}
                      className="flex items-start gap-3 py-3 -mx-1 px-1 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          item.type === "consultation"
                            ? "bg-blue-500/10 text-blue-700"
                            : "bg-violet-500/10 text-violet-700"
                        }`}
                      >
                        {item.type === "consultation" ? (
                          <MessageSquare className="h-4 w-4" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatRelativeDay(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {item.type === "consultation" ? "Consultation" : "Contact"} · {item.summary}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Low stock alerts
              </CardTitle>
              <CardDescription>Products that need restocking soon</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/products">
                Inventory
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.lowStockProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Stock levels look good"
                description="No products are below the low-stock threshold."
              />
            ) : (
              <ul className="space-y-2">
                {data.lowStockProducts.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      {product.sku ? (
                        <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                      ) : null}
                    </div>
                    <span
                      className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                        product.stock === 0
                          ? "bg-red-500/10 text-red-700 ring-red-500/20"
                          : "bg-amber-500/10 text-amber-700 ring-amber-500/20"
                      }`}
                    >
                      {product.stock} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {data.chronicDue.length > 0 ? (
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Chronic care check-ins
              </CardTitle>
              <CardDescription>
                {data.stats.chronicDueCount} patient
                {data.stats.chronicDueCount === 1 ? "" : "s"} due within the next 7 days
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/chronic">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.chronicDue.map((patient) => (
                <li
                  key={patient.id}
                  className="rounded-lg border border-border/60 px-3 py-2.5"
                >
                  <p className="text-sm font-medium truncate">{patient.patientName}</p>
                  <p className="text-xs text-muted-foreground truncate">{patient.condition}</p>
                  <p
                    className={`text-xs font-medium mt-1 ${
                      patient.isOverdue ? "text-red-600" : "text-amber-600"
                    }`}
                  >
                    {patient.isOverdue ? "Overdue · " : "Due · "}
                    {patient.nextCheckInAt ? formatShortDate(patient.nextCheckInAt) : "—"}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div className={`grid gap-4 ${showBlogStats ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {data.ordersReady && data.ordersByStatus.length > 0 ? (
          <Card className={`dashboard-card ${showBlogStats ? "" : "md:col-span-1"}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Order pipeline</CardTitle>
              <CardDescription>{statusTotal} orders across all statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.ordersByStatus.map((row) => (
                  <Link
                    key={row.status}
                    href="/dashboard/orders"
                    className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <OrderStatusBadge status={row.status} />
                    <span className="text-sm font-semibold tabular-nums">{row.count}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Link href="/dashboard/products" className="group block">
          <Card className="dashboard-card h-full transition-colors hover:border-primary/50">
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
        </Link>

        {showBlogStats ? (
          <Link href="/dashboard/blog" className="group block">
            <Card className="dashboard-card h-full transition-colors hover:border-primary/50">
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
          </Link>
        ) : null}
      </div>

      <Card className="dashboard-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>
              {data.stats.activeOrders > 0
                ? `${data.stats.activeOrders} active order${data.stats.activeOrders === 1 ? "" : "s"} right now`
                : "Latest orders from your database"}
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
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
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
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {formatShortDate(order.date)}
                    </TableCell>
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
