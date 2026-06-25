"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  MoreHorizontal,
  Package,
  Edit,
  Trash2,
  RefreshCcw,
  Filter,
  FolderTree,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getProducts,
  deleteProduct,
  getCategories,
  toggleProductActive,
  toggleProductFeatured,
} from "@/app/dashboard/products/actions"
import { ALL_BRANCHES_VALUE } from "@/lib/inventory"
import { toast } from "sonner"
import { ProductDetailDrawer } from "@/components/dashboard/ProductDetailDrawer"

type ProductRow = Awaited<ReturnType<typeof getProducts>>[number]
type CategoryRow = Awaited<ReturnType<typeof getCategories>>[number]
type BranchRow = { id: string; name: string }

const STATUS_OPTIONS = ["all", "In Stock", "Low Stock", "Out of Stock"] as const
const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const

function formatExpiryDate(value: Date | string | null | undefined) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function expiryTone(value: Date | string | null | undefined): "none" | "ok" | "soon" | "expired" {
  if (!value) return "none"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "none"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(date)
  expiry.setHours(0, 0, 0, 0)
  const diffDays = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return "expired"
  if (diffDays <= 30) return "soon"
  return "ok"
}

const EXPIRY_TONE_CLASS: Record<Exclude<ReturnType<typeof expiryTone>, "none">, string> = {
  ok: "text-foreground",
  soon: "text-amber-700 font-medium",
  expired: "text-red-600 font-medium",
}

export function ProductsTable({
  initialProducts,
  initialCategories,
  branches,
  readOnly = false,
}: {
  initialProducts: ProductRow[]
  initialCategories: CategoryRow[]
  branches: BranchRow[]
  readOnly?: boolean
}) {
  const [products, setProducts] = React.useState(initialProducts)
  const [categories] = React.useState(initialCategories)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [categorySearch, setCategorySearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [branchFilter, setBranchFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE)
  const [viewProduct, setViewProduct] = React.useState<ProductRow | null>(null)

  const fetchData = React.useCallback(async () => {
    setIsRefreshing(true)
    try {
      const productsData = await getProducts()
      setProducts(productsData)
    } catch {
      toast.error("Failed to refresh inventory")
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product from inventory?")) return
    try {
      await deleteProduct(id)
      toast.success("Product deleted")
      fetchData()
    } catch {
      toast.error("Failed to delete product")
    }
  }

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      await toggleProductFeatured(id, featured)
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, featured } : p))
      )
      toast.success(featured ? "Featured on home page" : "Removed from home page")
    } catch {
      toast.error("Could not update featured status")
    }
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await toggleProductActive(id, active)
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active } : p))
      )
      toast.success(active ? "Product visible on shop" : "Product hidden")
    } catch {
      toast.error("Could not update visibility")
    }
  }

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      product.name.toLowerCase().includes(q) ||
      product.category?.name.toLowerCase().includes(q) ||
      product.id.toLowerCase().includes(q) ||
      (product.sku?.toLowerCase().includes(q) ?? false) ||
      product.tags?.some((t) => t.toLowerCase().includes(q)) ||
      product.description?.toLowerCase().includes(q)

    const catQ = categorySearch.trim().toLowerCase()
    const matchesCategory =
      !catQ || (product.category?.name.toLowerCase().includes(catQ) ?? false)

    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter

    const matchesBranch =
      branchFilter === "all" ||
      product.branch === branchFilter ||
      product.branch === ALL_BRANCHES_VALUE ||
      !product.branch

    return matchesSearch && matchesCategory && matchesStatus && matchesBranch
  })

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageStart =
    filteredProducts.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const pageEnd = Math.min(safePage * pageSize, filteredProducts.length)
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  )

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, categorySearch, statusFilter, branchFilter, pageSize])

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const openProductView = React.useCallback((product: ProductRow) => {
    setViewProduct(product)
  }, [])

  return (
    <div className="dashboard-page space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            {products.length} product{products.length === 1 ? "" : "s"} ·{" "}
            {categories.length} categories
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isRefreshing}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {!readOnly ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/products/categories">
                  <FolderTree className="mr-2 h-4 w-4" />
                  Categories
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add product
                </Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <Card className="dashboard-card">
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Search & filter
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:col-span-2 lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Name, SKU, tags, description, ID..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Filter by category…"
                className="pl-9"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stock status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All statuses" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.name}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/branches" className="text-xs text-muted-foreground">
                Manage branches
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[64px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="hidden lg:table-cell">Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Expiry</TableHead>
                <TableHead className="hidden md:table-cell">Branch</TableHead>
                {!readOnly ? (
                  <TableHead className="text-right">Actions</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={readOnly ? 8 : 9} className="h-28 text-center text-muted-foreground">
                    {products.length === 0 ? (
                      <span>
                        {readOnly
                          ? "No products in inventory yet."
                          : (
                            <>
                              No products yet.{" "}
                              <Link href="/dashboard/products/new" className="text-primary font-medium underline">
                                Add your first product
                              </Link>
                            </>
                          )}
                      </span>
                    ) : (
                      "No products match your filters."
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer"
                    onClick={() => openProductView(product)}
                  >
                    <TableCell>
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted border flex items-center justify-center">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <button
                          type="button"
                          className="font-medium hover:underline line-clamp-1 text-left"
                          onClick={(e) => {
                            e.stopPropagation()
                            openProductView(product)
                          }}
                        >
                          {product.name}
                        </button>
                        {product.sku && (
                          <p className="text-[10px] text-muted-foreground font-mono">{product.sku}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.featured && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-amber-500/40 text-amber-700 bg-amber-500/10"
                            >
                              Featured
                            </Badge>
                          )}
                          {product.active === false && (
                            <Badge variant="outline" className="text-[10px]">
                              Hidden
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {product.category?.name ?? "—"}
                    </TableCell>
                    <TableCell className="font-medium">GH₵{product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          product.status === "In Stock"
                            ? "border-emerald-500/30 text-emerald-700"
                            : product.status === "Low Stock"
                              ? "border-amber-500/30 text-amber-700"
                              : "border-red-500/30 text-red-700"
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm whitespace-nowrap">
                      {(() => {
                        const formatted = formatExpiryDate(product.expiryDate)
                        if (!formatted) {
                          return <span className="text-muted-foreground">—</span>
                        }
                        const tone = expiryTone(product.expiryDate)
                        if (tone === "none") {
                          return formatted
                        }
                        return (
                          <span className={EXPIRY_TONE_CLASS[tone]} title={formatted}>
                            {formatted}
                            {tone === "expired" ? " · Expired" : tone === "soon" ? " · Soon" : null}
                          </span>
                        )
                      })()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {product.branch ?? "All branches"}
                    </TableCell>
                    {!readOnly ? (
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openProductView(product)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleFeatured(product.id, !(product.featured ?? false))
                              }
                            >
                              {product.featured ? "Remove from home page" : "Feature on home page"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleActive(product.id, !(product.active ?? true))
                              }
                            >
                              {product.active === false ? "Show on shop" : "Hide from shop"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filteredProducts.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {pageStart}–{pageEnd} of {filteredProducts.length} product
                {filteredProducts.length === 1 ? "" : "s"}
                {filteredProducts.length !== products.length
                  ? ` (${products.length} total)`
                  : ""}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[5.5rem]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size} / page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[4.5rem] text-center text-sm text-muted-foreground">
                    {safePage} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ProductDetailDrawer
        product={viewProduct}
        open={Boolean(viewProduct)}
        readOnly={readOnly}
        onOpenChange={(open) => {
          if (!open) setViewProduct(null)
        }}
      />
    </div>
  )
}
