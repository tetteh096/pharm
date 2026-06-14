"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Loader2,
  Plus,
  X,
} from "lucide-react"

import {
  createBlogPost,
  updateBlogPost,
  createBlogCategory,
} from "@/app/actions/blog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import RichTextEditor from "@/components/dashboard/RichTextEditor"
import {
  formatImageSize,
  processUploadImage,
  type ImageOrientation,
} from "@/lib/client-image"

const TEXTAREA_CLASSES =
  "flex min-h-[100px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-[#09162a] placeholder:text-[#6b7280] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-[oklch(0.28_0.03_260)] dark:text-[#f1f5f9] dark:placeholder:text-[#94a3b8]"

type Category = { id: string; name: string }

type EditingPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  authorName: string
  status: string
  tags: string[]
  categoryId: string | null
}

const UNCATEGORIZED_VALUE = "__none__"

export function BlogEditorForm({
  categories: initialCategories,
  post,
}: {
  categories: Category[]
  post: EditingPost | null
}) {
  const router = useRouter()
  const isEdit = Boolean(post)

  const [categories, setCategories] = React.useState(initialCategories)
  const [newCategory, setNewCategory] = React.useState("")
  const [addingCategory, setAddingCategory] = React.useState(false)

  const [submitting, setSubmitting] = React.useState<null | "draft" | "publish">(
    null
  )
  const [coverMeta, setCoverMeta] = React.useState<{
    width: number
    height: number
    orientation: ImageOrientation
    sizeLabel: string
  } | null>(null)
  const [coverUploading, setCoverUploading] = React.useState(false)

  const [form, setForm] = React.useState({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    authorName: post?.authorName ?? "Admin",
    status: post?.status ?? "Draft",
    tagsInput: (post?.tags ?? []).join(", "),
    coverImage: post?.coverImage ?? "",
    categoryId: post?.categoryId ?? UNCATEGORIZED_VALUE,
  })

  const setField = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Choose a cover image under 8 MB")
      return
    }

    setCoverUploading(true)
    try {
      const processed = await processUploadImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
      })
      setField("coverImage", processed.dataUrl)
      setCoverMeta({
        width: processed.width,
        height: processed.height,
        orientation: processed.orientation,
        sizeLabel: formatImageSize(processed.bytesApprox),
      })
      toast.success("Cover image ready")
    } catch {
      toast.error("Could not process that image. Try JPG, PNG, or WEBP.")
    } finally {
      setCoverUploading(false)
    }
  }

  const handleAddCategory = async () => {
    const name = newCategory.trim()
    if (!name) return
    setAddingCategory(true)
    try {
      const cat = await createBlogCategory(name)
      setCategories((prev) =>
        [...prev, { id: cat.id, name: cat.name }].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      )
      setField("categoryId", cat.id)
      setNewCategory("")
      toast.success(`Added category “${cat.name}”`)
    } catch (err) {
      console.error(err)
      toast.error("Could not create category")
    } finally {
      setAddingCategory(false)
    }
  }

  async function submit(targetStatus: "Draft" | "Published") {
    if (!form.title.trim()) {
      toast.error("Please add an article title")
      return
    }
    if (!form.content.trim() || form.content === "<p></p>") {
      toast.error("Please write some content before saving")
      return
    }

    setSubmitting(targetStatus === "Draft" ? "draft" : "publish")
    const tags = form.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      coverImage: form.coverImage || undefined,
      authorName: form.authorName,
      status: targetStatus,
      tags,
      categoryId:
        form.categoryId === UNCATEGORIZED_VALUE ? null : form.categoryId,
    }

    try {
      if (isEdit && post) {
        await updateBlogPost(post.id, {
          ...payload,
          coverImage: payload.coverImage ?? "",
          categoryId: payload.categoryId,
        })
        toast.success(
          targetStatus === "Published"
            ? "Article updated & published"
            : "Draft saved"
        )
      } else {
        await createBlogPost(payload)
        toast.success(
          targetStatus === "Published"
            ? "Article published!"
            : "Draft saved"
        )
      }
      router.push("/dashboard/blog")
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error("Could not save the article. Please try again.")
    } finally {
      setSubmitting(null)
    }
  }

  const submittingAny = submitting !== null

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit(form.status === "Published" ? "Published" : "Draft")
      }}
      className="dashboard-page space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/blog">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? "Edit article" : "Write new article"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit
                ? `Editing “${post?.title}” · current status: ${post?.status}`
                : "Drafts stay hidden — only Published posts appear on the public site."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => submit("Draft")}
            disabled={submittingAny}
            className="gap-2"
          >
            {submitting === "draft" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={() => submit("Published")}
            disabled={submittingAny}
            className="gap-2"
          >
            {submitting === "publish" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isEdit && post?.status === "Published" ? "Update & republish" : "Publish article"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="dashboard-card">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Article title
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="E.g. How to safely store medication at home"
                  className="text-lg py-6"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-semibold">
                  Content
                </Label>
                <RichTextEditor
                  value={form.content}
                  onChange={(content) => setField("content", content)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-base font-semibold">
                  Excerpt (short summary)
                </Label>
                <textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={(e) => setField("excerpt", e.target.value)}
                  placeholder="A short teaser that appears on the blog list page…"
                  rows={3}
                  className={TEXTAREA_CLASSES}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Publishing details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Default save status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setField("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft (hidden)</SelectItem>
                    <SelectItem value="Published">Published (public)</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Pressing the buttons above overrides this for that save.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setField("categoryId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNCATEGORIZED_VALUE}>
                      Uncategorized
                    </SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 pt-1">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim() || addingCategory}
                    className="gap-1"
                  >
                    {addingCategory ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorName">Author</Label>
                <Input
                  id="authorName"
                  value={form.authorName}
                  onChange={(e) => setField("authorName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Custom URL slug (optional)</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  placeholder="auto-generated from title if left blank"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagsInput">Tags (comma separated)</Label>
                <Input
                  id="tagsInput"
                  value={form.tagsInput}
                  onChange={(e) => setField("tagsInput", e.target.value)}
                  placeholder="Health, Wellness, Pharmacist Tips"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Featured image</CardTitle>
              <CardDescription>
                Used on the blog list, homepage, and article header. Landscape or portrait
                both work. The site crops to a wide frame (like WordPress), centered on
                your photo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label
                htmlFor="cover-upload"
                className="group relative block w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 transition-colors hover:bg-muted/40"
                style={{ aspectRatio: "16 / 9" }}
              >
                <input
                  id="cover-upload"
                  type="file"
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  accept="image/*"
                  disabled={coverUploading}
                  onChange={handleImageUpload}
                />
                {coverUploading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Optimizing image…</p>
                  </div>
                ) : form.coverImage ? (
                  <>
                    <img
                      src={form.coverImage}
                      alt="Cover preview"
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/40 group-hover:opacity-100">
                      <div className="flex items-center gap-2 text-sm font-medium text-white">
                        <ImageIcon size={16} /> Change image
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <div className="mb-3 rounded-full bg-primary/10 p-3">
                      <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Click to upload featured image</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      JPG, PNG, WEBP. Resized automatically for the site.
                    </p>
                  </div>
                )}
              </label>

              {form.coverImage ? (
                <>
                  {coverMeta ? (
                    <p className="text-xs text-muted-foreground">
                      {coverMeta.width} x {coverMeta.height}px ·{" "}
                      {coverMeta.orientation} · {coverMeta.sizeLabel}
                    </p>
                  ) : null}

                  <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      How it appears on the website
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="mb-1.5 text-xs text-muted-foreground">Blog list card</p>
                        <div
                          className="overflow-hidden rounded-md border"
                          style={{ height: 96, background: "#f4f6f8" }}
                        >
                          <img
                            src={form.coverImage}
                            alt=""
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs text-muted-foreground">Article header</p>
                        <div
                          className="overflow-hidden rounded-md border"
                          style={{ aspectRatio: "16 / 9", background: "#f4f6f8" }}
                        >
                          <img
                            src={form.coverImage}
                            alt=""
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Portrait photos keep the full image in storage. Wide areas crop the
                      sides on cards and headers. Photos inside the article keep their
                      natural shape.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-1 text-destructive"
                    onClick={() => {
                      setField("coverImage", "")
                      setCoverMeta(null)
                    }}
                  >
                    <X size={14} />
                    Remove featured image
                  </Button>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
