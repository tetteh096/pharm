"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Check,
  EyeOff,
  ExternalLink,
  Loader2,
  Phone,
  Trash2,
  Calendar,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  deleteBlogComment,
  setBlogCommentApproval,
} from "@/app/actions/blog"

type Comment = {
  id: string
  name: string
  phone: string
  message: string
  approved: boolean
  createdAt: string
  post: { id: string; title: string; slug: string } | null
}

type PostOption = { id: string; title: string }

type Props = {
  initialComments: Comment[]
  posts: PostOption[]
  currentPostId: string
  currentStatus: "approved" | "pending" | "all"
}

const ALL_POSTS = "all"

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?"

export function BlogCommentsManager({
  initialComments,
  posts,
  currentPostId,
  currentStatus,
}: Props) {
  const router = useRouter()
  const [comments, setComments] = React.useState(initialComments)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [busyAction, setBusyAction] = React.useState<
    "delete" | "toggle" | null
  >(null)

  React.useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  const updateFilters = (overrides: Record<string, string>) => {
    const params = new URLSearchParams()
    if (currentPostId !== ALL_POSTS) params.set("post", currentPostId)
    if (currentStatus !== "all") params.set("status", currentStatus)
    for (const [k, v] of Object.entries(overrides)) {
      if (v && v !== ALL_POSTS && v !== "all") params.set(k, v)
      else params.delete(k)
    }
    const qs = params.toString()
    router.push(qs ? `/dashboard/blog/comments?${qs}` : "/dashboard/blog/comments")
  }

  const handleDelete = async (comment: Comment) => {
    const ok = window.confirm(
      `Delete the comment from ${comment.name}? This cannot be undone.`
    )
    if (!ok) return
    setBusyId(comment.id)
    setBusyAction("delete")
    try {
      await deleteBlogComment(comment.id)
      setComments((prev) => prev.filter((c) => c.id !== comment.id))
      toast.success(`Deleted comment from ${comment.name}`)
    } catch (err) {
      console.error(err)
      toast.error("Could not delete the comment")
    } finally {
      setBusyId(null)
      setBusyAction(null)
    }
  }

  const handleToggle = async (comment: Comment) => {
    setBusyId(comment.id)
    setBusyAction("toggle")
    try {
      await setBlogCommentApproval(comment.id, !comment.approved)
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id ? { ...c, approved: !c.approved } : c
        )
      )
      toast.success(
        comment.approved
          ? `Hidden ${comment.name}’s comment from the public site`
          : `Approved ${comment.name}’s comment — now visible`
      )
    } catch (err) {
      console.error(err)
      toast.error("Could not update the comment")
    } finally {
      setBusyId(null)
      setBusyAction(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Filter by article
          </label>
          <Select
            value={currentPostId}
            onValueChange={(v) => updateFilters({ post: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All articles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_POSTS}>All articles</SelectItem>
              {posts.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Status
          </label>
          <Select
            value={currentStatus}
            onValueChange={(v) =>
              updateFilters({ status: v === "all" ? "" : v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="approved">Approved (public)</SelectItem>
              <SelectItem value="pending">Pending (hidden)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-10 text-center">
          <p className="font-semibold text-foreground">No comments yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            When readers leave comments on your articles, they&apos;ll appear
            here for moderation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => {
            const isBusy = busyId === c.id
            return (
              <div
                key={c.id}
                className="rounded-lg border bg-card p-4 sm:p-5 flex gap-4"
              >
                <div
                  className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
                  style={{
                    width: 48,
                    height: 48,
                    background:
                      "linear-gradient(135deg, var(--p1-clr, #13ec8a), var(--p2-clr, #1157ee))",
                  }}
                >
                  {initials(c.name)}
                </div>

                <div className="flex-grow min-w-0 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-foreground truncate">
                          {c.name}
                        </h4>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                            c.approved
                              ? "bg-emerald-400/10 text-emerald-500 ring-emerald-400/20"
                              : "bg-yellow-400/10 text-yellow-600 ring-yellow-400/20"
                          }`}
                        >
                          <span
                            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                              c.approved ? "bg-emerald-500" : "bg-yellow-500"
                            }`}
                          />
                          {c.approved ? "Approved" : "Pending"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDateTime(c.createdAt)}
                        </span>
                        <a
                          href={`tel:${c.phone}`}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <Phone size={12} />
                          {c.phone}
                        </a>
                        {c.post && (
                          <Link
                            href={`/blog-details?id=${c.post.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 hover:text-primary truncate max-w-[280px]"
                          >
                            <ExternalLink size={12} />
                            {c.post.title}
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(c)}
                        disabled={isBusy}
                        className="gap-1"
                      >
                        {isBusy && busyAction === "toggle" ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : c.approved ? (
                          <EyeOff size={14} />
                        ) : (
                          <Check size={14} />
                        )}
                        {c.approved ? "Hide" : "Approve"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(c)}
                        disabled={isBusy}
                        title="Delete comment"
                      >
                        {isBusy && busyAction === "delete" ? (
                          <Loader2 size={16} className="animate-spin text-destructive" />
                        ) : (
                          <Trash2 size={16} className="text-muted-foreground hover:text-destructive" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {c.message}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
