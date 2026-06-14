"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type DataTableStat = {
  label: string
  value: React.ReactNode
  hint?: string
}

export type DataTableFilter<T> = {
  id: string
  label: string
  defaultValue?: string
  options: { value: string; label: string }[]
  predicate: (row: T, value: string) => boolean
}

export type DataTableColumn<T> = {
  id: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  className?: string
  headerClassName?: string
  hideBelow?: "md" | "lg" | "xl"
}

const HIDE_CLASS: Record<NonNullable<DataTableColumn<unknown>["hideBelow"]>, string> = {
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
}

type DataTableProps<T> = {
  data: T[]
  columns: DataTableColumn<T>[]
  getRowId: (row: T) => string
  searchPlaceholder?: string
  searchFn?: (row: T, query: string) => boolean
  filters?: DataTableFilter<T>[]
  stats?: DataTableStat[] | ((filtered: T[], all: T[]) => DataTableStat[])
  pageSize?: number
  pageSizeOptions?: number[]
  emptyMessage?: React.ReactNode
  emptyFilteredMessage?: React.ReactNode
  onRowClick?: (row: T) => void
  toolbar?: React.ReactNode
  itemLabel?: string
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  searchPlaceholder = "Search…",
  searchFn,
  filters = [],
  stats,
  pageSize: defaultPageSize = 10,
  pageSizeOptions = [10, 25, 50],
  emptyMessage = "No records yet.",
  emptyFilteredMessage = "No records match your search or filters.",
  onRowClick,
  toolbar,
  itemLabel = "records",
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(defaultPageSize)
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(filters.map((f) => [f.id, f.defaultValue ?? "all"]))
  )

  const filtered = React.useMemo(() => {
    let rows = data
    for (const filter of filters) {
      const value = filterValues[filter.id] ?? "all"
      if (value !== "all") {
        rows = rows.filter((row) => filter.predicate(row, value))
      }
    }
    const q = search.trim().toLowerCase()
    if (q && searchFn) {
      rows = rows.filter((row) => searchFn(row, q))
    }
    return rows
  }, [data, search, searchFn, filters, filterValues])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)

  React.useEffect(() => {
    setPage(1)
  }, [search, pageSize, filterValues])

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const pageEnd = Math.min(safePage * pageSize, filtered.length)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const statItems =
    typeof stats === "function" ? stats(filtered, data) : stats

  const hasActiveFilters =
    search.trim().length > 0 ||
    filters.some((f) => (filterValues[f.id] ?? "all") !== "all")

  return (
    <div className="space-y-4">
      {statItems && statItems.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statItems.map((stat) => (
            <Card key={stat.label} className="dashboard-card border-border/70 shadow-none">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{stat.value}</p>
                {stat.hint ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{stat.hint}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Card className="dashboard-card border-border/70 shadow-none">
        <CardHeader className="space-y-3 border-b border-border/60 pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1 max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
                aria-label="Search table"
              />
            </div>
            {toolbar ? <div className="flex shrink-0 flex-wrap items-center gap-2">{toolbar}</div> : null}
          </div>

          {filters.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Select
                  key={filter.id}
                  value={filterValues[filter.id] ?? "all"}
                  onValueChange={(value) =>
                    setFilterValues((prev) => ({ ...prev, [filter.id]: value }))
                  }
                >
                  <SelectTrigger className="w-[min(100%,12rem)]">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => {
                    setSearch("")
                    setFilterValues(
                      Object.fromEntries(filters.map((f) => [f.id, f.defaultValue ?? "all"]))
                    )
                  }}
                >
                  Clear filters
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(
                      column.hideBelow ? HIDE_CLASS[column.hideBelow] : undefined,
                      column.headerClassName
                    )}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {data.length === 0 ? emptyMessage : emptyFilteredMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((row) => (
                  <TableRow
                    key={getRowId(row)}
                    className={cn(onRowClick && "cursor-pointer")}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          column.hideBelow ? HIDE_CLASS[column.hideBelow] : undefined,
                          column.className
                        )}
                        onClick={
                          column.id === "actions" && onRowClick
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filtered.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {pageStart}–{pageEnd} of {filtered.length} {itemLabel}
                {filtered.length !== data.length ? ` (${data.length} total)` : ""}
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
                    {pageSizeOptions.map((size) => (
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
    </div>
  )
}
