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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Cover image must be 2MB or smaller")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setField("coverImage", reader.result as string)
    }
    reader.readAsDataURL(file)
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
              <CardTitle>Cover image</CardTitle>
              <CardDescription>
                Shown on the blog list and at the top of the article.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label
                htmlFor="cover-upload"
                className="group relative block w-full overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                style={{ aspectRatio: "16 / 9" }}
              >
                <input
                  id="cover-upload"
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {form.coverImage ? (
                  <>
                    <img
                      src={form.coverImage}
                      alt="Cover preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="text-white text-sm font-medium flex items-center gap-2">
                        <ImageIcon size={16} /> Change image
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <div className="p-3 bg-primary/10 rounded-full mb-3">
                      <ImageIcon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, WEBP — max 2MB
                    </p>
                  </div>
                )}
              </label>
              {form.coverImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 text-destructive gap-1"
                  onClick={() => setField("coverImage", "")}
                >
                  <X size={14} />
                  Remove image
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
