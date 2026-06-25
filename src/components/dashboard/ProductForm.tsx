"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Resolver } from "react-hook-form"
import * as z from "zod"
import { ImagePlus, Loader2, X, Plus, ArrowLeft, Building2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CategorySearchSelect } from "@/components/dashboard/CategorySearchSelect"
import { Badge } from "@/components/ui/badge"
import {
  createProduct,
  updateProduct,
  createCategory,
  type ProductInput,
} from "@/app/dashboard/products/actions"
import { ALL_BRANCHES_VALUE, deriveStockStatus } from "@/lib/inventory"

const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().optional(),
  sku: z.string().optional(),
  categoryId: z.string().min(1, "Select a category"),
  costPrice: z.coerce.number().min(0, "Cost cannot be negative"),
  price: z.coerce.number().min(0.01, "Selling price must be greater than 0"),
  hasDiscount: z.boolean().default(false),
  discountPercent: z.coerce.number().int().min(0).max(99).default(0),
  stock: z.coerce.number().int().min(0),
  lowStockAt: z.coerce.number().int().min(1).default(10),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  branch: z.string().default(ALL_BRANCHES_VALUE),
  tagsInput: z.string().optional(),
  expiryDate: z.string().optional(),
})

type FormValues = z.infer<typeof productSchema>

type Category = { id: string; name: string }

type Branch = { id: string; name: string; location: string | null }

type ProductRecord = {
  id: string
  name: string
  description: string | null
  sku: string | null
  categoryId: string
  costPrice: number
  price: number
  discountPercent: number
  stock: number
  lowStockAt: number
  active: boolean
  featured: boolean
  branch: string | null
  tags: string[]
  image: string | null
  images: string[]
  expiryDate: Date | string | null
}

const MAX_IMAGES = 6
const MAX_FILE_BYTES = 2 * 1024 * 1024

export function ProductForm({
  categories: initialCategories,
  branches = [],
  product,
}: {
  categories: Category[]
  branches?: Branch[]
  product?: ProductRecord | null
}) {
  const router = useRouter()
  const isEdit = Boolean(product)
  const [categories, setCategories] = React.useState(initialCategories)
  const [images, setImages] = React.useState<string[]>([])
  const [newCategoryName, setNewCategoryName] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isAddingCategory, setIsAddingCategory] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(productSchema as never) as Resolver<FormValues>,
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      categoryId: "",
      costPrice: 0,
      price: 0,
      hasDiscount: false,
      discountPercent: 0,
      stock: 0,
      lowStockAt: 10,
      active: true,
      featured: false,
      branch: ALL_BRANCHES_VALUE,
      tagsInput: "",
      expiryDate: "",
    },
  })

  const stock = form.watch("stock")
  const lowStockAt = form.watch("lowStockAt")
  const price = form.watch("price")
  const hasDiscount = form.watch("hasDiscount")
  const discountPercent = form.watch("discountPercent")
  const expiryDateValue = form.watch("expiryDate")
  const computedStatus = deriveStockStatus(Number(stock) || 0, Number(lowStockAt) || 10)

  const effectiveDiscount = hasDiscount ? Math.max(0, Math.min(99, Number(discountPercent) || 0)) : 0
  const effectivePrice = Number(price) * (1 - effectiveDiscount / 100)

  // Expiry: parse to date and compute remaining days for inline warning.
  const expiryInfo = React.useMemo(() => {
    if (!expiryDateValue) return null
    const d = new Date(expiryDateValue)
    if (Number.isNaN(d.getTime())) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const days = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return { days }
  }, [expiryDateValue])

  React.useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description ?? "",
        sku: product.sku ?? "",
        categoryId: product.categoryId,
        costPrice: product.costPrice ?? 0,
        price: product.price,
        hasDiscount: (product.discountPercent ?? 0) > 0,
        discountPercent: product.discountPercent ?? 0,
        stock: product.stock,
        lowStockAt: product.lowStockAt ?? 10,
        active: product.active,
        featured: product.featured ?? false,
        branch: product.branch ?? ALL_BRANCHES_VALUE,
        tagsInput: product.tags.join(", "),
        expiryDate: product.expiryDate
          ? new Date(product.expiryDate).toISOString().slice(0, 10)
          : "",
      })
      const imgs =
        product.images?.length > 0
          ? product.images
          : product.image
            ? [product.image]
            : []
      setImages(imgs)
    }
  }, [product, form])

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    setIsAddingCategory(true)
    try {
      const cat = await createCategory(newCategoryName)
      setCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)))
      form.setValue("categoryId", cat.id)
      setNewCategoryName("")
      toast.success(`Category "${cat.name}" added`)
    } catch {
      toast.error("Could not create category")
    } finally {
      setIsAddingCategory(false)
    }
  }

  const handleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images`)
      return
    }

    files.slice(0, remaining).forEach((file) => {
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name} is over 2MB`)
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setImages((prev) => [...prev, base64].slice(0, MAX_IMAGES))
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ""
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(values: FormValues) {
    if (images.length === 0) {
      toast.error("Add at least one product image")
      return
    }

    setIsSubmitting(true)
    const tags = (values.tagsInput ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const payload: ProductInput = {
      name: values.name,
      description: values.description,
      sku: values.sku,
      categoryId: values.categoryId,
      costPrice: values.costPrice,
      price: values.price,
      discountPercent: values.hasDiscount ? values.discountPercent : 0,
      stock: values.stock,
      lowStockAt: values.lowStockAt,
      active: values.active,
      featured: values.featured,
      branch: values.branch,
      tags,
      images,
      image: images[0],
      expiryDate: values.expiryDate?.trim() ? values.expiryDate : null,
    }

    try {
      if (isEdit && product) {
        await updateProduct(product.id, payload)
        toast.success("Product updated")
      } else {
        await createProduct(payload)
        toast.success("Product created")
      }
      router.push("/dashboard/products")
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error("Could not save product. Check SKU is unique.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="dashboard-page space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Inventory
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? "Edit product" : "Add medical product"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Cost, selling price, stock, images, and pharmacy category.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg">Product images</CardTitle>
              <CardDescription>
                Upload up to {MAX_IMAGES} images (JPG, PNG, WEBP — max 2MB each). First image is the shop thumbnail.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {images.map((src, i) => (
                  <div
                    key={i}
                    className="relative h-24 w-24 rounded-lg border overflow-hidden bg-muted"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 rounded-full bg-background/90 p-0.5 shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-white text-center py-0.5">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-emerald-500/50 transition-colors">
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground mt-1">Add</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="sr-only"
                      onChange={handleImageFiles}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg">Basic details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Product title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Amoxicillin 500mg capsules" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-[#09162a] placeholder:text-[#6b7280] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-[oklch(0.28_0.03_260)] dark:text-[#f1f5f9] dark:placeholder:text-[#94a3b8]"
                        placeholder="Dosage, pack size, manufacturer, usage notes..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product code / SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. AMX-500-21" {...field} />
                    </FormControl>
                    <FormDescription>Optional unique code for inventory</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tagsInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="antibiotic, prescription, capsule" {...field} />
                    </FormControl>
                    <FormDescription>Comma-separated</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg">Category & branch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical category *</FormLabel>
                    <FormControl>
                      <CategorySearchSelect
                        categories={categories}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="e.g. pain relief, vitamins, antibiotics…"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCategory}
                  disabled={isAddingCategory || !newCategoryName.trim()}
                >
                  {isAddingCategory ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch availability</FormLabel>
                    {branches.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground flex items-center justify-between gap-3">
                        <span>No branches set up yet.</span>
                        <Button type="button" size="sm" variant="outline" asChild>
                          <Link href="/dashboard/branches">
                            <Building2 className="h-3.5 w-3.5 mr-1" />
                            Add a branch
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ALL_BRANCHES_VALUE}>
                            All branches
                          </SelectItem>
                          {branches.map((b) => (
                            <SelectItem key={b.id} value={b.name}>
                              {b.name}
                              {b.location ? ` — ${b.location}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormDescription>
                      <Link
                        href="/dashboard/branches"
                        className="text-xs underline text-muted-foreground hover:text-foreground"
                      >
                        Manage branches →
                      </Link>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg">Pricing & stock</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost price (GH₵)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min={0} {...field} />
                    </FormControl>
                    <FormDescription>What you pay / wholesale</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regular price (GH₵) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min={0.01} {...field} />
                    </FormControl>
                    <FormDescription>List price before any discount</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="sm:col-span-2 rounded-lg border p-4 space-y-3 border-rose-500/25 bg-rose-500/5">
                <FormField
                  control={form.control}
                  name="hasDiscount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 m-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-input mt-0.5"
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="!mt-0">This product is on sale</FormLabel>
                        <FormDescription>
                          Show a strikethrough price and a SALE badge on the shop.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                {hasDiscount && (
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end pt-2 border-t border-rose-500/15">
                    <FormField
                      control={form.control}
                      name="discountPercent"
                      render={({ field }) => (
                        <FormItem className="m-0">
                          <FormLabel>Discount percentage (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={99}
                              step={1}
                              placeholder="e.g. 15"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Whole numbers 1–99</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="text-right pb-1">
                      <p className="text-xs text-muted-foreground mb-1">Customer pays</p>
                      <p className="text-2xl font-bold tabular-nums text-rose-600">
                        GH₵{(effectivePrice > 0 ? effectivePrice : 0).toFixed(2)}
                      </p>
                      {Number(price) > 0 && effectiveDiscount > 0 && (
                        <p className="text-xs text-muted-foreground line-through tabular-nums">
                          GH₵{Number(price).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity in stock</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lowStockAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low stock alert at</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Expiry date (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription className="flex flex-wrap items-center gap-2">
                      <span>For pharmacy records — not shown to customers.</span>
                      {expiryInfo && expiryInfo.days < 0 && (
                        <Badge
                          variant="outline"
                          className="border-red-500/40 bg-red-500/10 text-red-600"
                        >
                          Expired {Math.abs(expiryInfo.days)} day{Math.abs(expiryInfo.days) === 1 ? "" : "s"} ago
                        </Badge>
                      )}
                      {expiryInfo && expiryInfo.days >= 0 && expiryInfo.days <= 30 && (
                        <Badge
                          variant="outline"
                          className="border-amber-500/40 bg-amber-500/10 text-amber-700"
                        >
                          Expires in {expiryInfo.days} day{expiryInfo.days === 1 ? "" : "s"}
                        </Badge>
                      )}
                      {expiryInfo && expiryInfo.days > 30 && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                        >
                          {expiryInfo.days} days remaining
                        </Badge>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="sm:col-span-2 flex items-center gap-3">
                <Badge variant="outline">Status: {computedStatus}</Badge>
                <span className="text-xs text-muted-foreground">
                  Updates automatically from quantity
                </span>
              </div>
              <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 rounded-lg border p-4 border-amber-500/25 bg-amber-500/5">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-input mt-0.5"
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="!mt-0">Featured on home page</FormLabel>
                        <FormDescription>
                          Shows in the Popular Products section on the website homepage.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 rounded-lg border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-input mt-0.5"
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="!mt-0">Visible on shop</FormLabel>
                        <FormDescription>
                          Turn off to hide from the pharmacy shop listing.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/products">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
