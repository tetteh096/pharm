import { ProductsTable } from "@/components/dashboard/ProductsTable"
import { getProducts, getCategories } from "./actions"
import { getActiveBranches } from "@/app/dashboard/branches/actions"
import { auth } from "@/auth"
import { canWriteInventory } from "@/lib/dashboard-rbac"

export default async function ProductsPage() {
  const session = await auth()
  const readOnly = !canWriteInventory(session?.user?.role)
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
      readOnly={readOnly}
    />
  )
}
