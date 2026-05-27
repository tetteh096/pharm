"use client"

import * as React from "react"
import { toast } from "sonner"
import { Check, ChevronDown, Loader2 } from "lucide-react"

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
  updateOrderStatus,
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

type Props = {
  orderDbId: string
  orderNumber: string
  currentStatus: OrderStatusValue | string
  customerEmail: string | null
}

export function OrderStatusUpdater({
  orderDbId,
  orderNumber,
  currentStatus,
  customerEmail,
}: Props) {
  const [status, setStatus] = React.useState<string>(currentStatus)
  const [isPending, startTransition] = React.useTransition()

  const handleChange = (next: OrderStatusValue) => {
    if (next === status) return

    const isCompleting = next === "DELIVERED" && status !== "DELIVERED"
    const previousStatus = status

    setStatus(next)

    startTransition(async () => {
      const result = await updateOrderStatus(orderDbId, next)
      if (!result.ok) {
        setStatus(previousStatus)
        toast.error(result.error)
        return
      }

      if (isCompleting) {
        if (customerEmail && result.emailSent) {
          toast.success(`Order ${orderNumber} marked delivered · receipt emailed to ${customerEmail}`)
        } else if (customerEmail && !result.emailSent) {
          toast.success(`Order ${orderNumber} marked delivered`, {
            description: "We couldn't email the customer — check SMTP settings.",
          })
        } else {
          toast.success(`Order ${orderNumber} marked delivered`, {
            description: "Customer has no email on file.",
          })
        }
      } else {
        toast.success(`Order ${orderNumber} → ${next.toLowerCase()}`)
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 cursor-pointer disabled:cursor-wait"
          aria-label={`Change status for order ${orderNumber}`}
        >
          <OrderStatusBadge status={status} />
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs">
          Set status for {orderNumber}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STATUSES.map((s) => (
          <DropdownMenuItem
            key={s.value}
            onSelect={() => handleChange(s.value)}
            className="flex items-start gap-2 py-2 cursor-pointer"
          >
            <Check
              className={`h-4 w-4 mt-0.5 ${
                s.value === status ? "opacity-100" : "opacity-0"
              }`}
            />
            <div className="flex flex-col">
              <span className="font-medium">{s.label}</span>
              {s.hint && (
                <span className="text-xs text-muted-foreground">{s.hint}</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
