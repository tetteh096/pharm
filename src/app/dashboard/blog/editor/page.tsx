import { notFound } from "next/navigation"
import {
  getBlogCategories,
  getBlogPostById,
} from "@/app/actions/blog"
import { BlogEditorForm } from "@/components/dashboard/BlogEditorForm"

type SearchParams = Promise<{ id?: string }>

export default async function BlogEditorPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const editId = sp.id?.trim() || null

  const [categories, post] = await Promise.all([
    getBlogCategories(),
    editId ? getBlogPostById(editId) : Promise.resolve(null),
  ])

  if (editId && !post) {
    notFound()
  }

  return (
    <BlogEditorForm
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      post={
        post
          ? {
              id: post.id,
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt ?? "",
              content: post.content,
              coverImage: post.coverImage ?? "",
              authorName: post.authorName,
              status: post.status,
              tags: post.tags,
              categoryId: post.categoryId,
            }
          : null
      }
    />
  )
}
