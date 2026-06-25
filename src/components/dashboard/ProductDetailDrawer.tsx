"use client"

import * as React from "react"
import Link from "next/link"
import {
  Calendar,
  Edit,
  ExternalLink,
  Package,
  Tag,
  Building2,
} from "lucide-react"

import { Sheet, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DashboardSheetContent } from "@/components/dashboard/DashboardSheetContent"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ALL_BRANCHES_VALUE } from "@/lib/inventory"

export type ProductDetail = {
  id: string
  name: string
  description: string | null
  sku: string | null
  costPrice: number
  price: number
  discountPercent: number
  stock: number
  lowStockAt: number
  status: string
  active: boolean
  featured: boolean
  image: string | null
  images: string[]
  tags: string[]
  branch: string | null
  expiryDate: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
  category: { id: string; name: string } | null
}

const formatGhs = (value: number) => `GH₵${value.toFixed(2)}`

const formatDate = (value: Date | string | null) => {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function salePrice(product: ProductDetail) {
  if (product.discountPercent > 0) {
    return product.price * (1 - product.discountPercent / 100)
  }
  return product.price
}

type Props = {
  product: ProductDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
  readOnly?: boolean
}

export function ProductDetailDrawer({
  product,
  open,
  onOpenChange,
  readOnly = false,
}: Props) {
  const gallery = React.useMemo(() => {
    if (!product) return []
    const urls = [product.image, ...product.images].filter(
      (url): url is string => Boolean(url)
    )
    return [...new Set(urls)]
  }, [product])

  const effectivePrice = product ? salePrice(product) : 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <DashboardSheetContent className="overflow-y-auto">
        {!product ? null : (
          <>
            <SheetHeader className="border-b px-6 py-5 sticky top-0 bg-background z-10">
              <SheetTitle className="flex items-start gap-3 text-2xl pr-10">
                <Package size={24} className="text-primary shrink-0 mt-1" />
                <span className="leading-snug break-words">{product.name}</span>
              </SheetTitle>
              <SheetDescription className="text-base mt-1">
                {product.sku ? (
                  <span className="font-mono text-sm">SKU: {product.sku}</span>
                ) : (
                  "No SKU assigned"
                )}
              </SheetDescription>
            </SheetHeader>

            <div className="px-6 py-7 space-y-7 text-base min-w-0">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
                {gallery.length > 0 ? (
                  <div className="space-y-4 min-w-0">
                    <div className="rounded-xl border overflow-hidden bg-muted min-h-[220px] flex items-center justify-center p-4">
                      <img
                        src={gallery[0]}
                        alt={product.name}
                        className="max-h-[320px] w-full object-contain"
                      />
                    </div>
                    {gallery.length > 1 ? (
                      <div className="flex gap-3 overflow-x-auto pb-1">
                        {gallery.map((url) => (
                          <div
                            key={url}
                            className="h-20 w-20 shrink-0 rounded-lg border overflow-hidden bg-muted"
                          >
                            <img
                              src={url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-xl border bg-muted/50 flex items-center justify-center min-h-[220px]">
                    <Package className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}

                <div className="flex flex-wrap gap-2 content-start min-w-0">
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
                  {product.featured ? (
                    <Badge
                      variant="outline"
                      className="border-amber-500/40 text-amber-700 bg-amber-500/10"
                    >
                      Featured
                    </Badge>
                  ) : null}
                  {product.active === false ? (
                    <Badge variant="outline">Hidden from shop</Badge>
                  ) : (
                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-700">
                      Visible on shop
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 min-w-0">
                <InfoCard label="Category" value={product.category?.name ?? "—"} />
                <InfoCard
                  label="Branch"
                  value={product.branch ?? ALL_BRANCHES_VALUE}
                  icon={<Building2 size={14} className="shrink-0" />}
                />
                <InfoCard label="Stock" value={String(product.stock)} />
                <InfoCard label="Low stock at" value={String(product.lowStockAt)} />
                {!readOnly ? (
                  <InfoCard label="Cost" value={formatGhs(product.costPrice)} />
                ) : null}
                <InfoCard
                  label="Selling price"
                  value={
                    product.discountPercent > 0 ? (
                      <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="line-through text-muted-foreground text-base">
                          {formatGhs(product.price)}
                        </span>
                        <span>{formatGhs(effectivePrice)}</span>
                        <span className="text-sm text-amber-700">
                          (−{product.discountPercent}%)
                        </span>
                      </span>
                    ) : (
                      formatGhs(product.price)
                    )
                  }
                />
                <InfoCard label="Expiry" value={formatDate(product.expiryDate)} />
                <InfoCard label="Updated" value={formatDate(product.updatedAt)} />
              </div>

              {product.tags.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <Tag size={14} />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {product.description ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Description
                  </h3>
                  <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap rounded-xl border bg-card p-5">
                    {product.description}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2 border-t pt-5">
                <Button variant="outline" asChild className="gap-2">
                  <Link href={`/shop/${product.id}`} target="_blank">
                    <ExternalLink size={16} />
                    View on shop
                  </Link>
                </Button>
                {!readOnly ? (
                  <Button asChild className="gap-2">
                    <Link href={`/dashboard/products/${product.id}/edit`}>
                      <Edit size={16} />
                      Edit product
                    </Link>
                  </Button>
                ) : null}
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar size={12} />
                Added {formatDate(product.createdAt)}
              </p>
            </div>
          </>
        )}
      </DashboardSheetContent>
    </Sheet>
  )
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card p-4 min-w-0 overflow-hidden">
      <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1.5 font-semibold text-foreground text-lg break-words">
        {value}
      </div>
    </div>
  )
}
