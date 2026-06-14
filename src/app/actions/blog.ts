"use server"

import { prisma, prismaQuery } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ─── Read actions ────────────────────────────────────────────────────────────

/** All categories — used by sidebar + editor. */
export async function getBlogCategories() {
  return prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: { where: { status: "Published" } } } } },
  })
}

/** Dashboard listing — every post regardless of status. */
export async function getBlogPosts() {
  return prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      _count: { select: { comments: true } },
    },
  })
}

export type PublicBlogFilters = {
  query?: string
  categoryId?: string
  page?: number
  pageSize?: number
}

export type PublicBlogResult = {
  posts: Awaited<ReturnType<typeof prisma.blogPost.findMany>>
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** Public site listing — only published, with search + category + pagination. */
export async function getPublicBlogPosts(
  filters: PublicBlogFilters = {}
): Promise<PublicBlogResult> {
  const page = Math.max(1, Math.floor(filters.page ?? 1))
  const pageSize = Math.max(1, Math.min(24, Math.floor(filters.pageSize ?? 5)))

  const where: Record<string, unknown> = { status: "Published" }
  if (filters.categoryId) where.categoryId = filters.categoryId
  if (filters.query?.trim()) {
    const q = filters.query.trim()
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ]
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.blogPost.count({ where }),
  ])

  return {
    posts,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

/** Latest published posts with full preview data — for the homepage news section. */
export async function getLatestPublicPosts(limit = 4) {
  try {
    return await prismaQuery(() =>
      prisma.blogPost.findMany({
        where: { status: "Published" },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          title: true,
          excerpt: true,
          coverImage: true,
          authorName: true,
          createdAt: true,
          category: { select: { name: true } },
        },
      })
    )
  } catch (error) {
    console.error("[blog] getLatestPublicPosts failed", error)
    return []
  }
}

/** Latest published posts — for sidebar "Recent posts". */
export async function getRecentPublicPosts(limit = 4) {
  return prisma.blogPost.findMany({
    where: { status: "Published" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      coverImage: true,
      createdAt: true,
      category: { select: { name: true } },
    },
  })
}

/** Unique published tags — for sidebar "Tags". */
export async function getPublicBlogTags(limit = 12): Promise<string[]> {
  const posts = await prisma.blogPost.findMany({
    where: { status: "Published" },
    select: { tags: true },
  })
  const counts = new Map<string, number>()
  for (const p of posts) {
    for (const tag of p.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag)
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function createBlogCategory(name: string) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error("Category name is required")
  return prisma.blogCategory.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed },
  })
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

async function ensureUniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base
  let i = 1
  while (true) {
    const conflict = await prisma.blogPost.findUnique({ where: { slug } })
    if (!conflict || conflict.id === ignoreId) return slug
    slug = `${base}-${++i}`
  }
}

export async function createBlogPost(data: {
  title: string
  slug?: string
  excerpt?: string
  content: string
  coverImage?: string
  authorName: string
  status: string
  tags: string[]
  categoryId?: string | null
}) {
  const baseSlug = (data.slug?.trim() || slugifyTitle(data.title)) || "post"
  const slug = await ensureUniqueSlug(baseSlug)

  const post = await prisma.blogPost.create({
    data: {
      title: data.title.trim(),
      slug,
      excerpt: data.excerpt?.trim() || null,
      content: data.content,
      coverImage: data.coverImage?.trim() || null,
      authorName: data.authorName.trim() || "Admin",
      status: data.status,
      tags: data.tags,
      categoryId: data.categoryId || null,
    },
  })

  revalidatePath("/dashboard/blog")
  revalidatePath("/blog")
  return post
}

export async function updateBlogPost(
  id: string,
  data: Partial<{
    title: string
    slug: string
    excerpt: string
    content: string
    coverImage: string
    authorName: string
    status: string
    tags: string[]
    categoryId: string | null
  }>
) {
  // If slug was edited, make sure it's still unique.
  let nextSlug: string | undefined
  if (typeof data.slug === "string") {
    const base = data.slug.trim() || slugifyTitle(data.title ?? "post")
    nextSlug = await ensureUniqueSlug(base, id)
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...data,
      slug: nextSlug,
    },
  })

  revalidatePath("/dashboard/blog")
  revalidatePath("/blog")
  return post
}

export async function deleteBlogPost(id: string) {
  await prisma.blogPost.delete({ where: { id } })
  revalidatePath("/dashboard/blog")
  revalidatePath("/blog")
}

/** Fetch a single post for the editor (any status). */
export async function getBlogPostById(id: string) {
  return prisma.blogPost.findUnique({
    where: { id },
    include: { category: true },
  })
}

// ─── Blog comments ──────────────────────────────────────────────────────────

export async function getPostComments(postId: string) {
  return prisma.blogComment.findMany({
    where: { postId, approved: true },
    orderBy: { createdAt: "desc" },
  })
}

/** Admin view — every comment, with the post title attached. */
export async function getAllBlogComments(filters?: {
  postId?: string
  status?: "approved" | "pending" | "all"
}) {
  const where: Record<string, unknown> = {}
  if (filters?.postId) where.postId = filters.postId
  if (filters?.status === "approved") where.approved = true
  if (filters?.status === "pending") where.approved = false

  return prisma.blogComment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { id: true, title: true, slug: true } },
    },
  })
}

export async function deleteBlogComment(id: string) {
  await prisma.blogComment.delete({ where: { id } })
  revalidatePath("/dashboard/blog")
  revalidatePath("/dashboard/blog/comments")
  revalidatePath("/blog-details")
}

export async function setBlogCommentApproval(id: string, approved: boolean) {
  await prisma.blogComment.update({
    where: { id },
    data: { approved },
  })
  revalidatePath("/dashboard/blog")
  revalidatePath("/dashboard/blog/comments")
  revalidatePath("/blog-details")
}

export async function createBlogComment(input: {
  postId: string
  name: string
  phone: string
  message: string
}) {
  const name = input.name.trim()
  const phone = input.phone.trim()
  const message = input.message.trim()

  if (!name || name.length < 2) {
    return { ok: false as const, error: "Please enter your name." }
  }
  if (!phone || phone.replace(/\D/g, "").length < 7) {
    return {
      ok: false as const,
      error: "Please enter a valid phone number we can reach you on.",
    }
  }
  if (!message || message.length < 4) {
    return { ok: false as const, error: "Please write a longer message." }
  }

  // Ensure the post exists and is published before accepting comments.
  const post = await prisma.blogPost.findUnique({
    where: { id: input.postId },
    select: { id: true, status: true },
  })
  if (!post || post.status !== "Published") {
    return { ok: false as const, error: "This article isn't available for comments." }
  }

  const comment = await prisma.blogComment.create({
    data: {
      postId: input.postId,
      name,
      phone,
      message,
    },
  })

  revalidatePath(`/blog-details`)
  return { ok: true as const, comment }
}
