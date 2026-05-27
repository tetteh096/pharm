import { PageHeaderSkeleton, TableSkeleton } from "@/components/dashboard/skeletons"

export default function ProductsLoading() {
  return (
    <div className="dashboard-page space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} columns={7} />
    </div>
  )
}
