import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/** Header block — page title + subtitle + (optional) action buttons. */
export function PageHeaderSkeleton({ withActions = true }: { withActions?: boolean }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>
      {withActions && (
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      )}
    </div>
  )
}

/** Row of small stat cards (overview page). */
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/** Generic table skeleton with a filter bar above it. */
export function TableSkeleton({
  rows = 6,
  columns = 6,
  withFilters = true,
}: {
  rows?: number
  columns?: number
  withFilters?: boolean
}) {
  return (
    <Card className="dashboard-card">
      {withFilters && (
        <CardHeader className="space-y-3 pb-3">
          <Skeleton className="h-4 w-32" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-9 sm:col-span-2 lg:col-span-2" />
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="px-4 py-3 border-b border-border/60 flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="px-4 py-4 border-b border-border/40 last:border-b-0 flex gap-4 items-center"
          >
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className={c === 0 ? "h-10 w-10 rounded-md" : "h-4 flex-1"}
              />
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/** Card grid skeleton (used by Branches & Categories). */
export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="dashboard-card">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-7 w-7 rounded" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/** Form page skeleton (used by add/edit product). */
export function FormSkeleton() {
  return (
    <div className="dashboard-page max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-24" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="dashboard-card">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
