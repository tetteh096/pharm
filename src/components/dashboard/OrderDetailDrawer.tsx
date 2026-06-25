"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Calendar,
  ChevronDown,
  ClipboardList,
  Loader2,
  Mail,
  Navigation,
  Package,
  Phone,
  Store,
  StickyNote,
  Truck,
  User,
  History,
} from "lucide-react"

import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { DashboardSheetContent } from "@/components/dashboard/DashboardSheetContent"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge"
import {
  getOrderDetail,
  updateOrderStatus,
  type OrderDetail,
  type OrderStatusValue,
} from "@/app/dashboard/actions"

const STATUSES: { value: OrderStatusValue; label: string; hint?: string }[] = [
  { value: "PENDING", label: "Pending", hint: "Awaiting pharmacist review" },
  { value: "PROCESSING", label: "Processing", hint: "Items being prepared" },
  { value: "SHIPPED", label: "Shipped", hint: "Out for delivery" },
  {
    value: "DELIVERED",
    label: "Delivered",
    hint: "Marks payment as completed · sends email",
  },
  { value: "CANCELLED", label: "Cancelled" },
]

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

type Props = {
  orderDbId: string
  orderNumber: string
  open: boolean
  onOpenChange: (open: boolean) => void
  showFinancials?: boolean
}

export function OrderDetailDrawer({
  orderDbId,
  orderNumber,
  open,
  onOpenChange,
  showFinancials = true,
}: Props) {
  const [detail, setDetail] = React.useState<OrderDetail | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [savingStatus, setSavingStatus] = React.useState(false)
  const [noteDraft, setNoteDraft] = React.useState("")

  const refresh = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await getOrderDetail(orderDbId)
      setDetail(data)
    } catch (err) {
      console.error(err)
      toast.error("Could not load order details")
    } finally {
      setLoading(false)
    }
  }, [orderDbId])

  React.useEffect(() => {
    if (open) {
      refresh()
    } else {
      setDetail(null)
      setNoteDraft("")
    }
  }, [open, refresh])

  const handleStatusChange = async (next: OrderStatusValue) => {
    if (!detail) return
    if (next === detail.status) return
    setSavingStatus(true)
    const result = await updateOrderStatus(
      orderDbId,
      next,
      noteDraft.trim() || undefined
    )
    setSavingStatus(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setNoteDraft("")
    if (next === "DELIVERED" && result.emailSent) {
      toast.success(`${orderNumber} marked delivered · email sent`)
    } else if (next === "DELIVERED") {
      toast.success(`${orderNumber} marked delivered`, {
        description: detail.customer.email
          ? "We couldn't email the customer — check Resend / email settings."
          : "Customer has no email on file.",
      })
    } else {
      toast.success(`${orderNumber} → ${next.toLowerCase()}`)
    }
    await refresh()
  }

  const isDelivery = detail?.fulfillmentType === "DELIVERY"
  const hasGps =
    detail &&
    typeof detail.deliveryLat === "number" &&
    typeof detail.deliveryLng === "number"

  const mapUrl =
    hasGps && detail
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${
          detail.deliveryLng! - 0.005
        }%2C${detail.deliveryLat! - 0.003}%2C${detail.deliveryLng! + 0.005}%2C${
          detail.deliveryLat! + 0.003
        }&marker=${detail.deliveryLat}%2C${detail.deliveryLng}&layer=mapnik`
      : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <DashboardSheetContent className="overflow-y-auto">
        <SheetHeader className="border-b px-6 py-5 sticky top-0 bg-background z-10">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Package size={22} className="text-primary" />
            Order {orderNumber}
          </SheetTitle>
          <SheetDescription className="text-base">
            {detail
              ? `Placed ${formatDateTime(detail.createdAt)}`
              : "Loading order details…"}
          </SheetDescription>
        </SheetHeader>

        {loading || !detail ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="animate-spin" />
            <span className="text-sm">Loading order…</span>
          </div>
        ) : (
          <div className="px-6 py-6 space-y-7 text-base">
            {/* Status + change dropdown */}
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <OrderStatusBadge status={detail.status} />
                  <span className="text-sm text-muted-foreground">
                    Last updated {formatDateTime(detail.updatedAt)}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingStatus}
                      className="gap-2"
                    >
                      {savingStatus ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                      Change status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="text-xs">
                      Set status for {detail.orderNumber}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {STATUSES.map((s) => (
                      <DropdownMenuItem
                        key={s.value}
                        disabled={s.value === detail.status}
                        onSelect={() => handleStatusChange(s.value)}
                        className="flex flex-col items-start gap-0.5 py-2 cursor-pointer"
                      >
                        <span className="font-medium">{s.label}</span>
                        {s.hint && (
                          <span className="text-xs text-muted-foreground">
                            {s.hint}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4 space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Optional note for this status change
                </label>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={3}
                  placeholder="e.g. Rider dispatched at 2:15 PM, customer notified by phone."
                  className="w-full rounded-md border border-input bg-white px-3 py-2.5 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-[oklch(0.28_0.03_260)] dark:text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  The note + your staff account will be saved on the audit log
                  when you change the status.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Customer block */}
              <Section icon={<User size={16} />} title="Customer">
                <div className="rounded-xl border bg-card p-4 space-y-2">
                  <div className="text-lg font-semibold text-foreground">
                    {detail.customer.name}
                  </div>
                  {detail.customer.phone && (
                    <a
                      href={`tel:${detail.customer.phone}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Phone size={16} />
                      {detail.customer.phone}
                    </a>
                  )}
                  {detail.customer.email && (
                    <a
                      href={`mailto:${detail.customer.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground break-all"
                    >
                      <Mail size={16} />
                      {detail.customer.email}
                    </a>
                  )}
                </div>
              </Section>

              {/* Fulfillment / delivery */}
              <Section
                icon={isDelivery ? <Truck size={16} /> : <Store size={16} />}
                title={isDelivery ? "Delivery" : "Pickup"}
              >
                <div className="rounded-xl border bg-card p-4 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {isDelivery ? (
                      <Badge variant="outline" className="gap-1 text-sm px-3 py-1">
                        <Truck className="h-3.5 w-3.5" /> Delivery
                      </Badge>
                    ) : detail.fulfillmentType === "PICKUP" ? (
                      <Badge variant="outline" className="gap-1 text-sm px-3 py-1">
                        <Store className="h-3.5 w-3.5" /> Store pickup
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not specified</Badge>
                    )}
                  </div>

                  {detail.deliveryAddress && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Address
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {detail.deliveryAddress}
                      </p>
                    </div>
                  )}

                  {hasGps && (
                    <div className="space-y-3">
                      <div className="rounded-lg overflow-hidden border bg-muted/40 min-h-[220px] aspect-[16/10]">
                        {mapUrl && (
                          <iframe
                            src={mapUrl}
                            title="Delivery location"
                            className="w-full h-full min-h-[220px]"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${detail.deliveryLat},${detail.deliveryLng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                        >
                          <Navigation className="h-4 w-4" />
                          Google Maps
                        </a>
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${detail.deliveryLat}&mlon=${detail.deliveryLng}#map=17/${detail.deliveryLat}/${detail.deliveryLng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold border border-input hover:bg-muted transition"
                        >
                          OpenStreetMap
                        </a>
                        <span className="text-xs text-muted-foreground self-center">
                          {detail.deliveryLat!.toFixed(5)},{" "}
                          {detail.deliveryLng!.toFixed(5)}
                        </span>
                      </div>
                    </div>
                  )}

                  {detail.deliveryNotes && (
                    <div className="space-y-1.5 rounded-lg border border-amber-300/40 bg-amber-50/60 dark:bg-amber-500/5 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <StickyNote size={14} /> Delivery notes from customer
                      </div>
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {detail.deliveryNotes}
                      </p>
                    </div>
                  )}
                </div>
              </Section>
            </div>

            {/* Items */}
            <Section
              icon={<ClipboardList size={16} />}
              title={`Items (${detail.items.length})`}
            >
              <div className="rounded-xl border bg-card p-4 space-y-3">
                {detail.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-foreground text-base">
                        {item.productName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {showFinancials
                          ? `${item.unitPriceFormatted} × ${item.quantity}`
                          : `Qty ${item.quantity}`}
                      </div>
                    </div>
                    {showFinancials ? (
                      <div className="font-semibold text-foreground text-base">
                        {item.lineTotalFormatted}
                      </div>
                    ) : null}
                  </div>
                ))}
                <div className="flex justify-between items-center border-t pt-4">
                  <span className="text-sm text-muted-foreground">
                    Payment method:{" "}
                    <span className="font-medium text-foreground">
                      {detail.paymentMethod ?? "—"}
                    </span>
                  </span>
                  {showFinancials ? (
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total</div>
                      <div className="text-2xl font-bold">
                        {detail.totalFormatted}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </Section>

            {/* Audit trail */}
            <Section
              icon={<History size={16} />}
              title={`Audit trail (${detail.statusLogs.length})`}
            >
              <div className="rounded-xl border bg-card p-4">
              {detail.statusLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No status changes have been logged yet. The next change will
                  appear here with the staff name and timestamp.
                </p>
              ) : (
                <ol className="relative border-l border-border pl-4 space-y-4">
                  {detail.statusLogs.map((log) => (
                    <li key={log.id} className="relative">
                      <span
                        className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background"
                        aria-hidden
                      />
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {log.fromStatus && (
                          <>
                            <OrderStatusBadge status={log.fromStatus} />
                            <span className="text-muted-foreground">→</span>
                          </>
                        )}
                        <OrderStatusBadge status={log.toStatus} />
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDateTime(log.createdAt)}
                        </span>
                        {log.changedByName && (
                          <span className="flex items-center gap-1">
                            <User size={11} />
                            {log.changedByName}
                          </span>
                        )}
                        {log.changedByEmail && !log.changedByName && (
                          <span className="flex items-center gap-1">
                            <Mail size={11} />
                            {log.changedByEmail}
                          </span>
                        )}
                      </div>
                      {log.note && (
                        <p className="mt-1 text-sm text-foreground bg-muted/50 rounded px-2 py-1.5">
                          {log.note}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
              </div>
            </Section>
          </div>
        )}
      </DashboardSheetContent>
    </Sheet>
  )
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div>{children}</div>
    </div>
  )
}
