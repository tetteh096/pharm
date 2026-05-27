const styles: Record<string, string> = {
  DELIVERED: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-700 ring-blue-500/20",
  SHIPPED: "bg-violet-500/10 text-violet-700 ring-violet-500/20",
  PENDING: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 ring-red-500/20",
}

const dots: Record<string, string> = {
  DELIVERED: "bg-emerald-500",
  PROCESSING: "bg-blue-500",
  SHIPPED: "bg-violet-500",
  PENDING: "bg-amber-500",
  CANCELLED: "bg-red-500",
}

export function OrderStatusBadge({ status }: { status: string }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase()

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        styles[status] ?? styles.PENDING
      }`}
    >
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dots[status] ?? dots.PENDING}`} />
      {label}
    </span>
  )
}
