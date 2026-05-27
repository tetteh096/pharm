import { PageHeaderSkeleton, TableSkeleton } from "@/components/dashboard/skeletons"

export default function BlogLoading() {
  return (
    <div className="dashboard-page space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={6} columns={5} withFilters={false} />
    </div>
  )
}
