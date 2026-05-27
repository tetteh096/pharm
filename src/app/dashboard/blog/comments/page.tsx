import Link from "next/link"
import { ArrowLeft, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getAllBlogComments, getBlogPosts } from "@/app/actions/blog"
import { BlogCommentsManager } from "@/components/dashboard/BlogCommentsManager"

type SearchParams = Promise<{
  post?: string
  status?: "approved" | "pending" | "all"
}>

export const dynamic = "force-dynamic"

export default async function BlogCommentsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const postFilter = sp.post?.trim() || undefined
  const statusFilter = sp.status ?? "all"

  const [comments, posts] = await Promise.all([
    getAllBlogComments({
      postId: postFilter,
      status: statusFilter,
    }),
    getBlogPosts(),
  ])

  const totalApproved = comments.filter((c) => c.approved).length
  const totalPending = comments.filter((c) => !c.approved).length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/blog">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <MessageCircle size={22} className="text-primary" />
              Blog comments
            </h1>
            <p className="text-sm text-muted-foreground">
              Moderate reader comments, contact them if needed, and remove
              anything inappropriate.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardDescription>Total comments</CardDescription>
            <CardTitle className="text-3xl">{comments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardDescription>Visible (approved)</CardDescription>
            <CardTitle className="text-3xl text-emerald-500">
              {totalApproved}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardDescription>Hidden (pending review)</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {totalPending}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="dashboard-card">
        <CardContent className="p-6">
          <BlogCommentsManager
            initialComments={comments.map((c) => ({
              id: c.id,
              name: c.name,
              phone: c.phone,
              message: c.message,
              approved: c.approved,
              createdAt: c.createdAt.toISOString(),
              post: c.post,
            }))}
            posts={posts.map((p) => ({ id: p.id, title: p.title }))}
            currentPostId={postFilter ?? "all"}
            currentStatus={statusFilter}
          />
        </CardContent>
      </Card>
    </div>
  )
}
