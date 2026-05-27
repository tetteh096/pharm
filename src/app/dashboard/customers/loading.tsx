import {
  PageHeaderSkeleton,
  StatsGridSkeleton,
  TableSkeleton,
} from "@/components/dashboard/skeletons"

export default function CustomersLoading() {
  return (
    <div className="dashboard-page space-y-6">
      <PageHeaderSkeleton withActions={false} />
      <StatsGridSkeleton count={3} />
      <TableSkeleton rows={6} columns={6} withFilters={false} />
    </div>
  )
}
