import { ProductForm } from "@/components/dashboard/ProductForm"
import { getCategories } from "../actions"
import { getActiveBranches } from "@/app/dashboard/branches/actions"

export default async function NewProductPage() {
  const [categories, branches] = await Promise.all([
    getCategories(),
    getActiveBranches(),
  ])

  return <ProductForm categories={categories} branches={branches} />
}
