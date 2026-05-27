"use client"

import * as React from "react"

export type CartLine = {
  id: string
  name: string
  price: number
  image: string
  category: string
  branch: string | null
  quantity: number
  maxStock: number
}

type CartState = {
  items: CartLine[]
}

type AddPayload = Omit<CartLine, "quantity"> & { quantity?: number }

type CartContextValue = {
  items: CartLine[]
  count: number
  subtotal: number
  isHydrated: boolean
  addItem: (item: AddPayload) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clear: () => void
}

const CartContext = React.createContext<CartContextValue | null>(null)
// Bumped: older carts stored full base64 data URIs / a broken fallback image
// path. Bumping the storage key forces clients to start fresh — fixes the
// /assets/img/product/product1.jpg 404 left over in legacy localStorage.
const STORAGE_KEY = "enviro-cart-v2"
const LEGACY_STORAGE_KEYS = ["enviro-cart-v1"]

function loadFromStorage(): CartState {
  if (typeof window === "undefined") return { items: [] }
  // Purge any legacy cart entries so stale image URLs and field shapes can't
  // leak forward.
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      window.localStorage.removeItem(key)
    }
  } catch {
    // ignore
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [] }
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.items)) return parsed
    return { items: [] }
  } catch {
    return { items: [] }
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CartState>({ items: [] })
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setState(loadFromStorage())
    setIsHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!isHydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage unavailable — silently ignore
    }
  }, [state, isHydrated])

  const addItem = React.useCallback((item: AddPayload) => {
    setState((prev) => {
      const qty = Math.max(1, Math.floor(item.quantity ?? 1))
      const existing = prev.items.find((i) => i.id === item.id)
      if (existing) {
        const nextQty = Math.min(existing.maxStock || 9999, existing.quantity + qty)
        return {
          items: prev.items.map((i) =>
            i.id === item.id ? { ...i, quantity: nextQty } : i
          ),
        }
      }
      return {
        items: [
          ...prev.items,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
            branch: item.branch ?? null,
            maxStock: item.maxStock,
            quantity: Math.min(item.maxStock || 9999, qty),
          },
        ],
      }
    })
  }, [])

  const updateQuantity = React.useCallback((id: string, quantity: number) => {
    setState((prev) => {
      if (quantity <= 0) {
        return { items: prev.items.filter((i) => i.id !== id) }
      }
      return {
        items: prev.items.map((i) =>
          i.id === id
            ? { ...i, quantity: Math.min(i.maxStock || 9999, Math.floor(quantity)) }
            : i
        ),
      }
    })
  }, [])

  const removeItem = React.useCallback((id: string) => {
    setState((prev) => ({ items: prev.items.filter((i) => i.id !== id) }))
  }, [])

  const clear = React.useCallback(() => {
    setState({ items: [] })
  }, [])

  const value = React.useMemo<CartContextValue>(() => {
    const count = state.items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotal = state.items.reduce((sum, i) => sum + i.quantity * i.price, 0)
    return {
      items: state.items,
      count,
      subtotal,
      isHydrated,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }
  }, [state, isHydrated, addItem, updateQuantity, removeItem, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>")
  return ctx
}
