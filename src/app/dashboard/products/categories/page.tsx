import { CategoriesManager } from "@/components/dashboard/CategoriesManager"
import { getCategoriesWithCounts } from "./actions"

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts()

  return <CategoriesManager initialCategories={categories} />
}
