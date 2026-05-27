"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Edit, Eye, Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { deleteBlogPost } from "@/app/actions/blog"

export function BlogRowActions({
  postId,
  postTitle,
  isPublished,
}: {
  postId: string
  postTitle: string
  isPublished: boolean
}) {
  const router = useRouter()
  const [deleting, setDeleting] = React.useState(false)

  const handleDelete = async () => {
    const ok = window.confirm(
      `Delete “${postTitle}”? This cannot be undone.`
    )
    if (!ok) return
    setDeleting(true)
    try {
      await deleteBlogPost(postId)
      toast.success(`Deleted “${postTitle}”`)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error("Could not delete the article")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        asChild
        title={isPublished ? "View on public site" : "Preview (draft URL)"}
      >
        <Link
          href={`/blog-details?id=${postId}`}
          target="_blank"
          rel="noreferrer"
        >
          <Eye size={16} className="text-muted-foreground hover:text-primary" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild title="Edit">
        <Link href={`/dashboard/blog/editor?id=${postId}`}>
          <Edit size={16} className="text-muted-foreground hover:text-primary" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Delete"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? (
          <Loader2 size={16} className="animate-spin text-destructive" />
        ) : (
          <Trash2
            size={16}
            className="text-muted-foreground hover:text-destructive"
          />
        )}
      </Button>
    </div>
  )
}
