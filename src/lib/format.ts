export function formatGhs(amount: number): string {
  return `GH₵${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatOrderNumber(id: string, createdAt: Date): string {
  const y = createdAt.getFullYear().toString().slice(-2)
  const tail = id.slice(-6).toUpperCase()
  return `ORD-${y}${tail}`
}
