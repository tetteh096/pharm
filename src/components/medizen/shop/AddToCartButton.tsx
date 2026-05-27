"use client"

import { useCart, type CartLine } from "@/context/CartContext"
import { toast } from "sonner"
import { ShoppingCart } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

type AddToCartButtonProps = {
  product: Omit<CartLine, "quantity"> & { quantity?: number }
  disabled?: boolean
  variant?: "icon" | "full"
  className?: string
  label?: string
}

export default function AddToCartButton({
  product,
  disabled = false,
  variant = "icon",
  className,
  label = "Add to cart",
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)

  const handleAdd = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (disabled) {
      toast.error("This item is out of stock")
      return
    }
    setAdding(true)
    addItem(product)
    toast.success(`${product.name} added to cart`)
    setTimeout(() => setAdding(false), 350)
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled || adding}
        className={
          className ??
          "common-btn box-style p2-bg text-white rounded-5 px-5 py-3 fw_700 border-0 d-inline-flex align-items-center gap-2"
        }
      >
        <ShoppingCart size={18} />
        {disabled ? "Out of stock" : label}
      </button>
    )
  }

  return (
    <motion.button
      type="button"
      onClick={handleAdd}
      whileHover={{ scale: disabled ? 1 : 1.05, backgroundColor: disabled ? undefined : "var(--p1-clr)", color: "#fff" }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      disabled={disabled || adding}
      className={className ?? "cart-btn rounded-circle d-center border-0 shadow-sm"}
      style={{
        width: "45px",
        height: "45px",
        background: disabled ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.05)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      aria-label={disabled ? "Out of stock" : `Add ${product.name} to cart`}
    >
      <ShoppingCart size={18} />
    </motion.button>
  )
}
