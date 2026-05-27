"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Calculator,
  ImageOff,
  Loader2,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  Trash2,
  Truck,
  Store,
  User,
  Wallet,
  Save,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createManualOrder,
  searchInventoryForOrder,
  type InventorySearchHit,
} from "@/app/dashboard/actions"

type Branch = { id: string; name: string; location: string | null }

type CartLine = {
  product: InventorySearchHit
  quantity: number
  unitPrice: number
}

const PAYMENT_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "MOBILE_MONEY", label: "Mobile money" },
  { value: "CARD", label: "Card" },
  { value: "OTHER", label: "Other" },
]

const TEXTAREA_CLASS =
  "flex min-h-[90px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-[oklch(0.28_0.03_260)]"

export function ManualOrderForm({ branches }: { branches: Branch[] }) {
  const router = useRouter()

  const [customer, setCustomer] = React.useState({
    name: "",
    phone: "",
    email: "",
  })
  const [fulfillmentType, setFulfillmentType] = React.useState<
    "PICKUP" | "DELIVERY"
  >("PICKUP")
  const [branchName, setBranchName] = React.useState<string>(
    branches[0]?.name ?? ""
  )
  const [delivery, setDelivery] = React.useState({
    address: "",
    notes: "",
  })
  const [paymentMethod, setPaymentMethod] = React.useState("CASH")
  const [note, setNote] = React.useState("")
  const [sendEmail, setSendEmail] = React.useState(false)
  const [cart, setCart] = React.useState<CartLine[]>([])

  const [submitting, setSubmitting] = React.useState(false)

  // Product search.
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<InventorySearchHit[]>([])
  const [searching, setSearching] = React.useState(false)
  const [showResults, setShowResults] = React.useState(false)
  const searchRef = React.useRef<HTMLDivElement>(null)

  // Debounced search.
  React.useEffect(() => {
    let cancelled = false
    setSearching(true)
    const handle = setTimeout(async () => {
      try {
        const hits = await searchInventoryForOrder(query, 10)
        if (!cancelled) {
          setResults(hits)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [query])

  // Click-outside to dismiss the search dropdown.
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const addToCart = (product: InventorySearchHit) => {
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock`)
      return
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id)
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          toast.error(`Only ${product.stock} of ${product.name} available`)
          return prev
        }
        return prev.map((l) =>
          l.product.id === product.id
            ? { ...l, quantity: l.quantity + 1 }
            : l
        )
      }
      return [
        ...prev,
        { product, quantity: 1, unitPrice: product.price },
      ]
    })
    setQuery("")
    setShowResults(false)
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.flatMap((l) => {
        if (l.product.id !== productId) return [l]
        const nextQty = l.quantity + delta
        if (nextQty <= 0) return []
        if (nextQty > l.product.stock) {
          toast.error(`Only ${l.product.stock} available`)
          return [l]
        }
        return [{ ...l, quantity: nextQty }]
      })
    )
  }

  const setUnitPrice = (productId: string, raw: string) => {
    const next = parseFloat(raw)
    if (Number.isNaN(next) || next < 0) return
    setCart((prev) =>
      prev.map((l) =>
        l.product.id === productId ? { ...l, unitPrice: next } : l
      )
    )
  }

  const removeLine = (productId: string) => {
    setCart((prev) => prev.filter((l) => l.product.id !== productId))
  }

  const subtotal = cart.reduce(
    (sum, l) => sum + l.unitPrice * l.quantity,
    0
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customer.name.trim()) {
      toast.error("Please add the customer's name")
      return
    }
    if (!customer.phone.trim()) {
      toast.error("Please add the customer's phone number")
      return
    }
    if (!branchName) {
      toast.error("Please pick a branch")
      return
    }
    if (cart.length === 0) {
      toast.error("Add at least one product to the order")
      return
    }
    if (fulfillmentType === "DELIVERY" && !delivery.address.trim()) {
      toast.error("Delivery orders need an address")
      return
    }

    setSubmitting(true)
    const result = await createManualOrder({
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || undefined,
      },
      fulfillmentType,
      branchName,
      deliveryAddress: delivery.address || undefined,
      deliveryNotes: delivery.notes || undefined,
      paymentMethod,
      items: cart.map((l) => ({
        productId: l.product.id,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
      })),
      note: note || undefined,
      sendConfirmationEmail: sendEmail && Boolean(customer.email.trim()),
    })
    setSubmitting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    if (result.emailSent) {
      toast.success(`Order ${result.orderNumber} created · receipt emailed`)
    } else if (sendEmail && customer.email) {
      toast.success(`Order ${result.orderNumber} created`, {
        description: "We couldn't email the customer — check SMTP settings.",
      })
    } else {
      toast.success(`Order ${result.orderNumber} created`)
    }

    router.push("/dashboard/orders")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* Customer */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={18} className="text-primary" /> Customer
            </CardTitle>
            <CardDescription>
              The person placing the order. They&apos;ll be added to the
              patient list automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cust-name">Full name *</Label>
              <Input
                id="cust-name"
                value={customer.name}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, name: e.target.value }))
                }
                placeholder="e.g. Ama Mensah"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-phone">Phone *</Label>
              <Input
                id="cust-phone"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, phone: e.target.value }))
                }
                placeholder="e.g. 024 123 4567"
                type="tel"
                inputMode="tel"
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cust-email">Email (optional)</Label>
              <Input
                id="cust-email"
                value={customer.email}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, email: e.target.value }))
                }
                placeholder="customer@example.com"
                type="email"
              />
              <p className="text-xs text-muted-foreground">
                Needed if you want to email a receipt.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fulfillment */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck size={18} className="text-primary" /> Fulfillment
            </CardTitle>
            <CardDescription>
              How is the customer receiving their order?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "PICKUP", label: "Pickup", icon: Store },
                  { value: "DELIVERY", label: "Delivery", icon: Truck },
                ] as const
              ).map(({ value, label, icon: Icon }) => {
                const active = fulfillmentType === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFulfillmentType(value)}
                    className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-semibold text-sm transition-colors ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                )
              })}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="branch">Branch *</Label>
              <Select value={branchName} onValueChange={setBranchName}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.length === 0 ? (
                    <SelectItem value="" disabled>
                      No active branches — add one first
                    </SelectItem>
                  ) : (
                    branches.map((b) => (
                      <SelectItem key={b.id} value={b.name}>
                        {b.name}
                        {b.location ? ` · ${b.location}` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {fulfillmentType === "DELIVERY" && (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                <div className="space-y-1.5">
                  <Label htmlFor="address">Delivery address *</Label>
                  <textarea
                    id="address"
                    value={delivery.address}
                    onChange={(e) =>
                      setDelivery((d) => ({ ...d, address: e.target.value }))
                    }
                    placeholder="House, street, area, landmark"
                    className={TEXTAREA_CLASS}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Delivery notes (optional)</Label>
                  <textarea
                    id="notes"
                    value={delivery.notes}
                    onChange={(e) =>
                      setDelivery((d) => ({ ...d, notes: e.target.value }))
                    }
                    placeholder="Gate code, preferred time, contact at door…"
                    className={TEXTAREA_CLASS}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package size={18} className="text-primary" /> Order items
            </CardTitle>
            <CardDescription>
              Search inventory and add items to the order. Stock is reserved
              when you submit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative" ref={searchRef}>
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setShowResults(true)
                }}
                onFocus={() => setShowResults(true)}
                placeholder="Search by name, SKU, or tag…"
                className="pl-9"
              />
              {showResults && (results.length > 0 || query) && (
                <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-[360px] overflow-y-auto">
                  {searching && results.length === 0 ? (
                    <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                      <Loader2 size={14} className="animate-spin" /> Searching…
                    </div>
                  ) : results.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-muted-foreground">
                      No products match &ldquo;{query}&rdquo;.
                    </div>
                  ) : (
                    results.map((p) => {
                      const inCart = cart.find((c) => c.product.id === p.id)
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addToCart(p)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted transition-colors"
                          disabled={p.stock <= 0}
                        >
                          <div className="h-10 w-10 rounded-md bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {p.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.image}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageOff
                                size={14}
                                className="text-muted-foreground"
                              />
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="text-sm font-medium truncate">
                              {p.name}
                              {inCart && (
                                <span className="ml-2 text-xs text-primary">
                                  · {inCart.quantity} in cart
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {p.category ?? "—"}
                              {p.sku ? ` · ${p.sku}` : ""}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-mono font-semibold">
                              {p.priceFormatted}
                            </div>
                            <div
                              className={`text-xs ${
                                p.stock <= 0
                                  ? "text-red-500"
                                  : p.stock <= (p.lowStockAt ?? 5)
                                    ? "text-yellow-600"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {p.stock <= 0 ? "Out of stock" : `${p.stock} in stock`}
                            </div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                No products added yet. Use the search above to find items.
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((line) => (
                  <div
                    key={line.product.id}
                    className="rounded-md border bg-card p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-md bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {line.product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={line.product.image}
                            alt={line.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageOff
                            size={14}
                            className="text-muted-foreground"
                          />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="font-medium text-sm">
                          {line.product.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {line.product.category ?? "—"}
                          {line.product.sku ? ` · ${line.product.sku}` : ""}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeLine(line.product.id)}
                      >
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 items-end">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Qty (max {line.product.stock})
                        </label>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(line.product.id, -1)}
                          >
                            <Minus size={12} />
                          </Button>
                          <span className="w-10 text-center font-mono font-semibold text-sm">
                            {line.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(line.product.id, 1)}
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Unit price (GH₵)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={line.unitPrice}
                          onChange={(e) =>
                            setUnitPrice(line.product.id, e.target.value)
                          }
                          className="h-8 text-sm font-mono"
                        />
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Subtotal
                        </div>
                        <div className="font-mono font-bold text-sm">
                          GH₵{(line.unitPrice * line.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar — payment + summary */}
      <div className="space-y-6">
        <Card className="dashboard-card sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet size={18} className="text-primary" /> Payment & summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="payment">Payment method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note">Internal note (audit log)</Label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="e.g. Called in by patient at 2:15 PM"
                className={TEXTAREA_CLASS}
              />
              <p className="text-xs text-muted-foreground">
                Saved to the order&apos;s audit trail along with your name.
              </p>
            </div>

            <label className="flex items-start gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                disabled={!customer.email}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Email receipt to customer</div>
                <div className="text-xs text-muted-foreground">
                  {customer.email
                    ? "Sends the order confirmation email immediately."
                    : "Add an email address above to enable this."}
                </div>
              </div>
            </label>

            <div className="rounded-md bg-muted/40 p-3 space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Items</span>
                <span className="font-mono">
                  {cart.reduce((s, l) => s + l.quantity, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between font-bold text-lg pt-1 border-t">
                <span className="flex items-center gap-1.5">
                  <Calculator size={14} /> Total
                </span>
                <span className="font-mono">GH₵{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={submitting || cart.length === 0}
              size="lg"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Create order
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
