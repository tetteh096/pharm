"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Calendar,
  ChevronDown,
  ClipboardList,
  Loader2,
  Mail,
  MapPin,
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
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
}

export function OrderDetailDrawer({
  orderDbId,
  orderNumber,
  open,
  onOpenChange,
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
          ? "We couldn't email the customer — check SMTP settings."
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
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0"
      >
        <SheetHeader className="border-b px-6 py-4 sticky top-0 bg-background z-10">
          <SheetTitle className="flex items-center gap-2">
            <Package size={18} className="text-primary" />
            Order {orderNumber}
          </SheetTitle>
          <SheetDescription>
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
          <div className="px-6 py-5 space-y-6">
            {/* Status + change dropdown */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={detail.status} />
                  <span className="text-sm text-muted-foreground">
                    · Last updated {formatDateTime(detail.updatedAt)}
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
              <div className="mt-3 space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Optional note for this status change
                </label>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={2}
                  placeholder="e.g. Rider dispatched at 2:15 PM, customer notified by phone."
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-[oklch(0.28_0.03_260)] dark:text-foreground"
                />
                <p className="text-[11px] text-muted-foreground">
                  The note + your staff account will be saved on the audit log
                  when you change the status.
                </p>
              </div>
            </div>

            {/* Customer block */}
            <Section icon={<User size={14} />} title="Customer">
              <div className="space-y-1.5 text-sm">
                <div className="font-semibold text-foreground">
                  {detail.customer.name}
                </div>
                {detail.customer.phone && (
                  <a
                    href={`tel:${detail.customer.phone}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Phone size={13} />
                    {detail.customer.phone}
                  </a>
                )}
                {detail.customer.email && (
                  <a
                    href={`mailto:${detail.customer.email}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Mail size={13} />
                    {detail.customer.email}
                  </a>
                )}
              </div>
            </Section>

            {/* Fulfillment / delivery */}
            <Section
              icon={isDelivery ? <Truck size={14} /> : <Store size={14} />}
              title={isDelivery ? "Delivery" : "Pickup"}
            >
              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {isDelivery ? (
                    <Badge variant="outline" className="gap-1">
                      <Truck className="h-3 w-3" /> Delivery
                    </Badge>
                  ) : detail.fulfillmentType === "PICKUP" ? (
                    <Badge variant="outline" className="gap-1">
                      <Store className="h-3 w-3" /> Pickup
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not specified</Badge>
                  )}
                  {detail.branchName && (
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {detail.branchName}
                    </Badge>
                  )}
                </div>

                {detail.deliveryAddress && (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Address
                    </div>
                    <p className="text-foreground leading-relaxed">
                      {detail.deliveryAddress}
                    </p>
                  </div>
                )}

                {hasGps && (
                  <div className="space-y-2">
                    <div className="rounded-md overflow-hidden border bg-muted/40 aspect-video">
                      {mapUrl && (
                        <iframe
                          src={mapUrl}
                          title="Delivery location"
                          className="w-full h-full"
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
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        <Navigation className="h-3 w-3" />
                        Google Maps
                      </a>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${detail.deliveryLat}&mlon=${detail.deliveryLng}#map=17/${detail.deliveryLat}/${detail.deliveryLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-input hover:bg-muted transition"
                      >
                        OpenStreetMap
                      </a>
                      <span className="text-[11px] text-muted-foreground self-center">
                        {detail.deliveryLat!.toFixed(5)},{" "}
                        {detail.deliveryLng!.toFixed(5)}
                      </span>
                    </div>
                  </div>
                )}

                {detail.deliveryNotes && (
                  <div className="space-y-1 rounded-md border border-amber-300/40 bg-amber-50/60 dark:bg-amber-500/5 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <StickyNote size={12} /> Delivery notes from customer
                    </div>
                    <p className="text-foreground leading-relaxed text-sm whitespace-pre-wrap">
                      {detail.deliveryNotes}
                    </p>
                  </div>
                )}
              </div>
            </Section>

            {/* Items */}
            <Section
              icon={<ClipboardList size={14} />}
              title={`Items (${detail.items.length})`}
            >
              <div className="space-y-2">
                {detail.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {item.productName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.unitPriceFormatted} × {item.quantity}
                      </div>
                    </div>
                    <div className="font-semibold text-foreground">
                      {item.lineTotalFormatted}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center border-t pt-3">
                <span className="text-sm text-muted-foreground">
                  Payment method:{" "}
                  <span className="font-medium text-foreground">
                    {detail.paymentMethod ?? "—"}
                  </span>
                </span>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-xl font-bold">
                    {detail.totalFormatted}
                  </div>
                </div>
              </div>
            </Section>

            {/* Audit trail */}
            <Section
              icon={<History size={14} />}
              title={`Audit trail (${detail.statusLogs.length})`}
            >
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
            </Section>
          </div>
        )}
      </SheetContent>
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
    <div className="space-y-2">
      <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
        {icon}
        {title}
      </h3>
      <div>{children}</div>
    </div>
  )
}
