import { ProductsTable } from "@/components/dashboard/ProductsTable"
import { getProducts, getCategories } from "./actions"
import { getActiveBranches } from "@/app/dashboard/branches/actions"

export default async function ProductsPage() {
  const [products, categories, branches] = await Promise.all([
    getProducts(),
    getCategories(),
    getActiveBranches(),
  ])

  return (
    <ProductsTable
      initialProducts={products}
      initialCategories={categories}
      branches={branches}
    />
  )
}
