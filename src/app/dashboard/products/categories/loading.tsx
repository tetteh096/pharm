import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/dashboard/skeletons"

export default function CategoriesLoading() {
  return (
    <div className="dashboard-page space-y-6">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={6} />
    </div>
  )
}
