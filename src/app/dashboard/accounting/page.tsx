import {
  Calculator,
  Download,
  Inbox,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
  PackageSearch,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge"
import { AccountingFilters } from "@/components/dashboard/AccountingFilters"
import { RevenueTrendChart } from "@/components/dashboard/RevenueTrendChart"
import { CsvExportButton } from "@/components/dashboard/CsvExportButton"
import { getAccountingOverview } from "./actions"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { canManageStaff } from "@/lib/dashboard-rbac"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{
  from?: string
  to?: string
  branch?: string
  preset?: string
}>

const PRESETS: Array<{
  id: string
  label: string
  resolve: () => { from: Date; to: Date }
}> = [
  {
    id: "today",
    label: "Today",
    resolve: () => {
      const now = new Date()
      return { from: now, to: now }
    },
  },
  {
    id: "7d",
    label: "Last 7 days",
    resolve: () => {
      const to = new Date()
      const from = new Date(to)
      from.setDate(from.getDate() - 6)
      return { from, to }
    },
  },
  {
    id: "30d",
    label: "Last 30 days",
    resolve: () => {
      const to = new Date()
      const from = new Date(to)
      from.setDate(from.getDate() - 29)
      return { from, to }
    },
  },
  {
    id: "thisMonth",
    label: "This month",
    resolve: () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from, to: now }
    },
  },
  {
    id: "ytd",
    label: "Year to date",
    resolve: () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), 0, 1)
      return { from, to: now }
    },
  },
]

function toIso(d: Date) {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, "0")
  const day = d.getDate().toString().padStart(2, "0")
  return `${y}-${m}-${day}`
}

export default async function AccountingPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!canManageStaff(session?.user?.role)) redirect("/dashboard")

  const sp = await searchParams
  const preset = sp.preset ?? "30d"
  const branch = sp.branch?.trim() || null

  let from = sp.from?.trim()
  let to = sp.to?.trim()

  if (!from || !to) {
    const presetId = preset === "custom" ? "30d" : preset
    const found = PRESETS.find((p) => p.id === presetId) ?? PRESETS[2]
    const range = found.resolve()
    from = toIso(range.from)
    to = toIso(range.to)
  }

  const data = await getAccountingOverview({ from, to, branch })

  const summary = data.summary
  const hasOrders = summary.orderCount + summary.cancelledOrderCount > 0

  return (
    <div className="dashboard-page space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calculator className="h-7 w-7 text-primary" />
            Accounting
          </h1>
          <p className="text-muted-foreground mt-1">
            Revenue, profit, and payment breakdowns from your order ledger.
          </p>
        </div>
        <CsvExportButton from={from} to={to} branch={branch} />
      </div>

      <AccountingFilters
        presets={PRESETS.map((p) => ({ id: p.id, label: p.label }))}
        currentPreset={sp.from && sp.to ? (sp.preset ?? "custom") : preset}
        currentFrom={from}
        currentTo={to}
        currentBranch={branch}
        branches={data.branches}
      />

      {!hasOrders ? (
        <Card className="dashboard-card">
          <CardContent className="py-12">
            <EmptyState
              icon={Inbox}
              title="No orders in this period"
              description="Try a different date range or wait for new orders to come in."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="dashboard-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardDescription>Total revenue</CardDescription>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {summary.totalRevenueFormatted}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {summary.orderCount} active orders
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardDescription>Completed (delivered)</CardDescription>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-500">
                  {summary.completedRevenueFormatted}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {summary.completedOrderCount} orders fulfilled
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardDescription>Pending</CardDescription>
                <Receipt className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {summary.pendingRevenueFormatted}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Not yet completed
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardDescription>Cancelled</CardDescription>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {summary.cancelledRevenueFormatted}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {summary.cancelledOrderCount} cancelled
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="dashboard-card">
              <CardHeader className="pb-2">
                <CardDescription>Average order value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.averageOrderValueFormatted}
                </div>
              </CardContent>
            </Card>
            <Card className="dashboard-card">
              <CardHeader className="pb-2">
                <CardDescription>Estimated gross profit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {summary.grossProfitFormatted}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Based on cost prices in inventory
                </div>
              </CardContent>
            </Card>
            <Card className="dashboard-card">
              <CardHeader className="pb-2">
                <CardDescription>Gross margin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.grossMarginPct != null
                    ? `${summary.grossMarginPct}%`
                    : "—"}
                </div>
              </CardContent>
            </Card>
            <Card className="dashboard-card">
              <CardHeader className="pb-2">
                <CardDescription>Items sold</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.itemsSold}</div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue trend */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Revenue trend</CardTitle>
              <CardDescription>
                Daily revenue across the selected period.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <RevenueTrendChart data={data.revenueByDay} />
            </CardContent>
          </Card>

          {/* Payment + branch breakdown */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Payment methods</CardTitle>
                <CardDescription>Share of revenue by payment type.</CardDescription>
              </CardHeader>
              <CardContent>
                {data.paymentBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No payment data yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.paymentBreakdown.map((row) => (
                      <div key={row.method} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{row.method}</span>
                          <span className="text-muted-foreground">
                            {row.revenueFormatted} ·{" "}
                            <span className="font-mono">{row.percentage}%</span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${row.percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.orderCount} order{row.orderCount === 1 ? "" : "s"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Branches</CardTitle>
                <CardDescription>Revenue by pickup / delivery branch.</CardDescription>
              </CardHeader>
              <CardContent>
                {data.branchBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No branch data yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.branchBreakdown.map((row) => (
                      <div key={row.branch} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{row.branch}</span>
                          <span className="text-muted-foreground">
                            {row.revenueFormatted} ·{" "}
                            <span className="font-mono">{row.percentage}%</span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${row.percentage}%`,
                              background: "var(--p2-clr, #1157ee)",
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.orderCount} order{row.orderCount === 1 ? "" : "s"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top products */}
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <PackageSearch className="h-5 w-5 text-primary" />
              <CardTitle>Top products by revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No items sold in this period.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Est. profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topProducts.map((p, idx) => (
                      <TableRow key={(p.productId ?? p.productName) + idx}>
                        <TableCell className="font-medium">
                          {p.productName}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {p.qtySold}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {p.revenueFormatted}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {p.profit !== 0 ? (
                            <span
                              className={
                                p.profit > 0
                                  ? "text-emerald-500"
                                  : "text-red-500"
                              }
                            >
                              {p.profitFormatted}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Ledger */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Order ledger</CardTitle>
              <CardDescription>
                Last {data.ledger.length} orders in this period (most recent
                first).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.ledger.map((row) => (
                    <TableRow key={row.dbId}>
                      <TableCell className="font-mono text-xs font-medium">
                        {row.orderNumber}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {row.date}
                      </TableCell>
                      <TableCell>{row.customer}</TableCell>
                      <TableCell>
                        <OrderStatusBadge status={row.status} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {row.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{row.branch}</TableCell>
                      <TableCell className="text-right font-mono">
                        {row.itemsCount}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {row.revenueFormatted}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {row.profit !== 0 ? (
                          <span
                            className={
                              row.profit > 0
                                ? "text-emerald-500"
                                : "text-red-500"
                            }
                          >
                            {row.profitFormatted}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
