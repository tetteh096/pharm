export function slugifyCategory(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export const slugify = slugifyCategory

export function deriveStockStatus(stock: number, lowStockAt: number): string {
  if (stock <= 0) return "Out of Stock"
  if (stock <= lowStockAt) return "Low Stock"
  return "In Stock"
}

/** Sentinel value used in the product form when a product is available everywhere. */
export const ALL_BRANCHES_VALUE = "All branches"
