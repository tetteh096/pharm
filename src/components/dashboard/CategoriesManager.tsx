"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  Plus,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  FolderTree,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  createCategoryWithSlug,
  renameCategory,
  deleteCategory,
} from "@/app/dashboard/products/categories/actions"

type CategoryRow = {
  id: string
  name: string
  slug: string | null
  productCount: number
}

export function CategoriesManager({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const router = useRouter()
  const [categories, setCategories] = React.useState(initialCategories)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [newName, setNewName] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editingName, setEditingName] = React.useState("")
  const [savingId, setSavingId] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  )

  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0)
  const usedCount = categories.filter((c) => c.productCount > 0).length

  const refresh = () => router.refresh()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setIsCreating(true)
    try {
      const created = await createCategoryWithSlug(newName)
      setCategories((prev) =>
        [...prev, { id: created.id, name: created.name, slug: created.slug, productCount: 0 }].sort(
          (a, b) => a.name.localeCompare(b.name)
        )
      )
      setNewName("")
      toast.success(`Added "${created.name}"`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add category")
    } finally {
      setIsCreating(false)
    }
  }

  const startEdit = (cat: CategoryRow) => {
    setEditingId(cat.id)
    setEditingName(cat.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName("")
  }

  const handleRename = async (id: string) => {
    if (!editingName.trim()) return
    setSavingId(id)
    try {
      const updated = await renameCategory(id, editingName)
      setCategories((prev) =>
        prev
          .map((c) => (c.id === id ? { ...c, name: updated.name, slug: updated.slug } : c))
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      toast.success("Category renamed")
      cancelEdit()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rename")
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (cat: CategoryRow) => {
    if (cat.productCount > 0) {
      toast.error(
        `Cannot delete — ${cat.productCount} product${cat.productCount === 1 ? "" : "s"} use this category.`
      )
      return
    }
    if (!confirm(`Delete "${cat.name}"?`)) return

    setDeletingId(cat.id)
    try {
      await deleteCategory(cat.id)
      setCategories((prev) => prev.filter((c) => c.id !== cat.id))
      toast.success("Category deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="dashboard-page space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Inventory
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Product categories</h1>
            <p className="text-sm text-muted-foreground">
              Manage the categories used across inventory and the pharmacy shop.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderTree className="h-4 w-4" style={{ color: "#1157ee" }} />
              Total categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{categories.length}</p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Categories in use</CardTitle>
            <CardDescription>With at least 1 product</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{usedCount}</p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total products</CardTitle>
            <CardDescription>Across all categories</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalProducts}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add new category
          </CardTitle>
          <CardDescription>
            Categories created here appear in the product form and shop sidebar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="e.g. Eye Drops, Diabetes Care, First Aid"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isCreating || !newName.trim()}>
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add category
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-lg">All categories</CardTitle>
          <CardDescription>
            Showing {filtered.length} of {categories.length}
          </CardDescription>
          <div className="relative mt-3 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Filter categories…"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              No categories match your search.
            </p>
          ) : (
            <ul className="divide-y">
              {filtered.map((cat) => {
                const isEditing = editingId === cat.id
                const isSaving = savingId === cat.id
                const isDeleting = deletingId === cat.id

                return (
                  <li
                    key={cat.id}
                    className="flex flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {isEditing ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleRename(cat.id)
                            }
                            if (e.key === "Escape") cancelEdit()
                          }}
                          autoFocus
                          className="max-w-sm"
                        />
                      ) : (
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{cat.name}</p>
                          {cat.slug && (
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {cat.slug}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={
                          cat.productCount > 0
                            ? "border-emerald-500/30 text-emerald-700 bg-emerald-500/5"
                            : "text-muted-foreground"
                        }
                      >
                        {cat.productCount} product{cat.productCount === 1 ? "" : "s"}
                      </Badge>

                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSaving}
                            onClick={() => handleRename(cat.id)}
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(cat)}
                            aria-label={`Rename ${cat.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            disabled={isDeleting || cat.productCount > 0}
                            onClick={() => handleDelete(cat)}
                            aria-label={`Delete ${cat.name}`}
                            title={
                              cat.productCount > 0
                                ? "Reassign products before deleting"
                                : "Delete category"
                            }
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
