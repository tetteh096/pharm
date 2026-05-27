import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/dashboard/skeletons"

export default function BranchesLoading() {
  return (
    <div className="dashboard-page space-y-6">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={4} />
    </div>
  )
}
