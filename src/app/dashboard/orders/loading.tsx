import { PageHeaderSkeleton, TableSkeleton } from "@/components/dashboard/skeletons"

export default function OrdersLoading() {
  return (
    <div className="dashboard-page space-y-6">
      <PageHeaderSkeleton withActions={false} />
      <TableSkeleton rows={8} columns={6} withFilters={false} />
    </div>
  )
}
