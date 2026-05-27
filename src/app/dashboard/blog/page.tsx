import { getBlogPosts } from "@/app/actions/blog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Plus, MessageCircle } from "lucide-react"
import { BlogRowActions } from "@/components/dashboard/BlogRowActions"

export default async function BlogManagementPage() {
  const posts = await getBlogPosts()

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Blog Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage educational health content.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/blog/comments" className="flex items-center gap-2">
              <MessageCircle size={16} /> Manage comments
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/blog/editor" className="flex items-center gap-2">
              <Plus size={16} /> New Article
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle>All Articles</CardTitle>
          <CardDescription>Manage your published and drafted health articles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Article Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No articles found. Create your first post!
                  </TableCell>
                </TableRow>
              )}
              {posts.map((post) => (
                <TableRow key={post.id} className="group transition-colors">
                  <TableCell className="font-medium max-w-[300px] truncate">{post.title}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {post.category?.name || "Uncategorized"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{post.authorName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {post.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      post.status === "Published" ? "bg-emerald-400/10 text-emerald-500 ring-emerald-400/20" :
                      post.status === "Draft" ? "bg-yellow-400/10 text-yellow-600 ring-yellow-400/20" :
                      "bg-slate-400/10 text-slate-500 ring-slate-400/20"
                    }`}>
                      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                        post.status === "Published" ? "bg-emerald-500" :
                        post.status === "Draft" ? "bg-yellow-500" :
                        "bg-slate-500"
                      }`} />
                      {post.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{post.views}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {post._count?.comments ? (
                      <Link
                        href={`/dashboard/blog/comments?post=${post.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <MessageCircle size={12} />
                        {post._count.comments}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <BlogRowActions
                      postId={post.id}
                      postTitle={post.title}
                      isPublished={post.status === "Published"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
