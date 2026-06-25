"use client"

import * as React from "react"
import Link from "next/link"
import {
  Eye,
  Inbox,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Store,
  Truck,
} from "lucide-react"

import type { OrderStatusValue } from "@/app/dashboard/actions"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { OrderDetailDrawer } from "@/components/dashboard/OrderDetailDrawer"
import { OrderStatusUpdater } from "@/components/dashboard/OrderStatusUpdater"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type OrderRow = {
  dbId: string
  id: string
  customer: string
  customerEmail: string | null
  phone: string | null
  email: string
  date: string
  total: string
  totalValue: number
  status: string
  method: string
  fulfillmentType: string | null
  branchName: string | null
  deliveryAddress: string | null
  deliveryLat: number | null
  deliveryLng: number | null
}

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
] as const

const FULFILLMENT_OPTIONS = [
  { value: "all", label: "All fulfillment" },
  { value: "DELIVERY", label: "Delivery" },
  { value: "PICKUP", label: "Pickup" },
] as const

function formatGhsTotal(value: number) {
  return `GH₵${value.toFixed(2)}`
}

function stopRowClick(e: React.MouseEvent) {
  e.stopPropagation()
}

export function OrdersTable({
  orders,
  showFinancials = true,
}: {
  orders: OrderRow[]
  showFinancials?: boolean
}) {
  const [activeOrder, setActiveOrder] = React.useState<{
    dbId: string
    orderNumber: string
  } | null>(null)

  const openOrder = React.useCallback((order: OrderRow) => {
    setActiveOrder({ dbId: order.dbId, orderNumber: order.id })
  }, [])

  const columns = React.useMemo<DataTableColumn<OrderRow>[]>(() => {
    const cols: DataTableColumn<OrderRow>[] = [
      {
        id: "id",
        header: "Order ID",
        cell: (order) => (
          <span className="font-mono text-sm font-medium">{order.id}</span>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        cell: (order) => (
          <div className="flex flex-col">
            <span className="font-medium">{order.customer}</span>
            {order.phone ? (
              <a
                href={`tel:${order.phone}`}
                onClick={stopRowClick}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Phone className="h-3 w-3" />
                {order.phone}
              </a>
            ) : null}
          </div>
        ),
      },
      {
        id: "date",
        header: "Date",
        hideBelow: "md",
        className: "text-muted-foreground",
        cell: (order) => order.date,
      },
    ]

    if (showFinancials) {
      cols.push({
        id: "total",
        header: "Total",
        cell: (order) => order.total,
      })
    }

    cols.push(
      {
        id: "status",
        header: "Status",
        cell: (order) => (
          <div onClick={stopRowClick}>
            <OrderStatusUpdater
              orderDbId={order.dbId}
              orderNumber={order.id}
              currentStatus={order.status as OrderStatusValue}
              customerEmail={order.customerEmail}
            />
          </div>
        ),
      },
      {
        id: "fulfillment",
        header: "Fulfillment",
        hideBelow: "lg",
        cell: (order) => {
          const isDelivery = order.fulfillmentType === "DELIVERY"
          const isPickup = order.fulfillmentType === "PICKUP"
          if (!isDelivery && !isPickup) {
            return <span className="text-xs text-muted-foreground">Not set</span>
          }
          return (
            <div className="flex items-center gap-2">
              {isDelivery ? (
                <Badge variant="outline" className="gap-1">
                  <Truck className="h-3 w-3" />
                  Delivery
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <Store className="h-3 w-3" />
                  Pickup
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        id: "delivery",
        header: "Delivery",
        hideBelow: "xl",
        cell: (order) => {
          const isDelivery = order.fulfillmentType === "DELIVERY"
          const hasGps =
            typeof order.deliveryLat === "number" &&
            typeof order.deliveryLng === "number"

          if (!isDelivery) {
            return <span className="text-xs text-muted-foreground">N/A</span>
          }

          if (hasGps) {
            return (
              <div className="flex flex-col gap-1" onClick={stopRowClick}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLat},${order.deliveryLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  <Navigation className="h-3 w-3" />
                  Navigate
                </a>
                {order.deliveryAddress ? (
                  <span
                    className="max-w-[320px] text-xs leading-snug text-muted-foreground line-clamp-2"
                    title={order.deliveryAddress}
                  >
                    {order.deliveryAddress}
                  </span>
                ) : null}
              </div>
            )
          }

          if (order.deliveryAddress) {
            return (
              <div className="flex flex-col gap-1" onClick={stopRowClick}>
                <Badge
                  variant="outline"
                  className="w-fit gap-1 border-amber-300 bg-amber-50 text-amber-700"
                >
                  <MapPin className="h-3 w-3" />
                  Address only
                </Badge>
                <span
                  className="max-w-[220px] truncate text-[10px] text-muted-foreground"
                  title={order.deliveryAddress}
                >
                  {order.deliveryAddress}
                </span>
              </div>
            )
          }

          return <span className="text-xs text-muted-foreground">No address</span>
        },
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "text-right",
        className: "text-right",
        cell: (order) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={(e) => {
              e.stopPropagation()
              openOrder(order)
            }}
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
        ),
      }
    )

    return cols
  }, [openOrder, showFinancials])

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <OrdersPageHeader />
        <div className="dashboard-card rounded-xl border border-border/70 bg-card">
          <EmptyState
            icon={Inbox}
            title="No orders yet"
            description="Orders appear here once they are created in the system, or you can enter one manually for a phone or walk-in customer."
          />
          <div className="flex justify-center pb-8">
            <Button asChild className="gap-2">
              <Link href="/dashboard/orders/new">
                <Plus size={16} />
                Create the first order
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <OrdersPageHeader />

      <DataTable
        data={orders}
        columns={columns}
        getRowId={(order) => order.dbId}
        itemLabel="orders"
        searchPlaceholder="Search order ID, customer, phone, address…"
        searchFn={(order, query) => {
          const haystack = [
            order.id,
            order.customer,
            order.phone,
            order.email,
            order.deliveryAddress,
            order.status,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
          return haystack.includes(query)
        }}
        filters={[
          {
            id: "status",
            label: "Status",
            options: [...STATUS_OPTIONS],
            predicate: (order, value) => order.status === value,
          },
          {
            id: "fulfillment",
            label: "Fulfillment",
            options: [...FULFILLMENT_OPTIONS],
            predicate: (order, value) => order.fulfillmentType === value,
          },
        ]}
        stats={(filtered, all) => {
          const processing = filtered.filter((o) => o.status === "PROCESSING").length
          const delivery = filtered.filter((o) => o.fulfillmentType === "DELIVERY").length
          const base = [
            {
              label: "Orders",
              value: filtered.length,
              hint: filtered.length !== all.length ? `${all.length} in total` : undefined,
            },
            {
              label: "Processing",
              value: processing,
              hint: "Awaiting fulfillment",
            },
            {
              label: "Delivery",
              value: delivery,
              hint: "Delivery orders in view",
            },
          ]
          if (!showFinancials) return base
          const revenue = filtered.reduce((sum, order) => sum + order.totalValue, 0)
          return [
            ...base,
            {
              label: "Revenue",
              value: formatGhsTotal(revenue),
              hint: "From filtered orders",
            },
          ]
        }}
        onRowClick={openOrder}
        emptyFilteredMessage="No orders match your search or filters."
      />

      {activeOrder ? (
        <OrderDetailDrawer
          orderDbId={activeOrder.dbId}
          orderNumber={activeOrder.orderNumber}
          open={Boolean(activeOrder)}
          showFinancials={showFinancials}
          onOpenChange={(open) => {
            if (!open) setActiveOrder(null)
          }}
        />
      ) : null}
    </div>
  )
}

function OrdersPageHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track pharmacy orders. Click a row to open delivery details, items, and
          the audit trail.
        </p>
      </div>
      <Button asChild className="gap-2">
        <Link href="/dashboard/orders/new">
          <Plus size={16} />
          New order
        </Link>
      </Button>
    </div>
  )
}
