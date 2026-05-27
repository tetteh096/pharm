"use client"

import * as React from "react"
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, MapPin, Navigation, Phone, Truck, Store } from "lucide-react"

import { OrderStatusUpdater } from "@/components/dashboard/OrderStatusUpdater"
import { OrderDetailDrawer } from "@/components/dashboard/OrderDetailDrawer"
import type { OrderStatusValue } from "@/app/dashboard/actions"

export type OrderRow = {
  dbId: string
  id: string
  customer: string
  customerEmail: string | null
  phone: string | null
  email: string
  date: string
  total: string
  status: string
  method: string
  fulfillmentType: string | null
  branchName: string | null
  deliveryAddress: string | null
  deliveryLat: number | null
  deliveryLng: number | null
}

export function OrdersTableBody({ orders }: { orders: OrderRow[] }) {
  const [activeOrder, setActiveOrder] = React.useState<{
    dbId: string
    orderNumber: string
  } | null>(null)

  return (
    <>
      <TableBody>
        {orders.map((order) => {
          const isDelivery = order.fulfillmentType === "DELIVERY"
          const hasGps =
            typeof order.deliveryLat === "number" &&
            typeof order.deliveryLng === "number"

          return (
            <TableRow
              key={order.id}
              className="cursor-pointer hover:bg-muted/40"
              onClick={() =>
                setActiveOrder({ dbId: order.dbId, orderNumber: order.id })
              }
            >
              <TableCell className="font-mono text-sm font-medium">
                {order.id}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{order.customer}</span>
                  {order.phone && (
                    <a
                      href={`tel:${order.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      {order.phone}
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {order.date}
              </TableCell>
              <TableCell>{order.total}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <OrderStatusUpdater
                  orderDbId={order.dbId}
                  orderNumber={order.id}
                  currentStatus={order.status as OrderStatusValue}
                  customerEmail={order.customerEmail}
                />
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground">
                <div className="flex items-center gap-2">
                  {isDelivery ? (
                    <Badge variant="outline" className="gap-1">
                      <Truck className="h-3 w-3" /> Delivery
                    </Badge>
                  ) : order.fulfillmentType === "PICKUP" ? (
                    <Badge variant="outline" className="gap-1">
                      <Store className="h-3 w-3" /> Pickup
                    </Badge>
                  ) : (
                    <span className="text-xs">—</span>
                  )}
                  {order.branchName && (
                    <span className="text-xs">{order.branchName}</span>
                  )}
                </div>
              </TableCell>
              <TableCell
                className="hidden xl:table-cell"
                onClick={(e) => e.stopPropagation()}
              >
                {isDelivery && hasGps ? (
                  <div className="flex flex-col gap-1">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLat},${order.deliveryLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition w-fit"
                    >
                      <Navigation className="h-3 w-3" />
                      Navigate
                    </a>
                    {order.deliveryAddress && (
                      <span
                        className="text-[10px] text-muted-foreground max-w-[220px] truncate"
                        title={order.deliveryAddress}
                      >
                        {order.deliveryAddress}
                      </span>
                    )}
                  </div>
                ) : isDelivery && order.deliveryAddress ? (
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant="outline"
                      className="gap-1 text-amber-700 border-amber-300 bg-amber-50 w-fit"
                    >
                      <MapPin className="h-3 w-3" /> Address only
                    </Badge>
                    <span
                      className="text-[10px] text-muted-foreground max-w-[220px] truncate"
                      title={order.deliveryAddress}
                    >
                      {order.deliveryAddress}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell
                className="text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    setActiveOrder({
                      dbId: order.dbId,
                      orderNumber: order.id,
                    })
                  }
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>

      {activeOrder && (
        <OrderDetailDrawer
          orderDbId={activeOrder.dbId}
          orderNumber={activeOrder.orderNumber}
          open={Boolean(activeOrder)}
          onOpenChange={(open) => {
            if (!open) setActiveOrder(null)
          }}
        />
      )}
    </>
  )
}
