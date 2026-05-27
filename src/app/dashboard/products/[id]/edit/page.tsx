import { notFound } from "next/navigation"
import { ProductForm } from "@/components/dashboard/ProductForm"
import { getCategories, getProductById } from "../../actions"
import { getActiveBranches } from "@/app/dashboard/branches/actions"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, categories, branches] = await Promise.all([
    getProductById(id),
    getCategories(),
    getActiveBranches(),
  ])

  if (!product) notFound()

  return (
    <ProductForm
      categories={categories}
      branches={branches}
      product={{
        id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        categoryId: product.categoryId,
        costPrice: product.costPrice,
        price: product.price,
        discountPercent: product.discountPercent,
        stock: product.stock,
        lowStockAt: product.lowStockAt,
        active: product.active,
        featured: product.featured,
        branch: product.branch,
        tags: product.tags,
        image: product.image,
        images: product.images,
        expiryDate: product.expiryDate,
      }}
    />
  )
}
