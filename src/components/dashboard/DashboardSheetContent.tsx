"use client"

import * as React from "react"

import { SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

/**
 * Wide slide-out panel for dashboard detail views (orders, products, chronic care, etc.).
 * Uses `.dashboard-detail-sheet` in globals.css — do not use raw SheetContent for staff panels.
 */
export function DashboardSheetContent({
  className,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetContent>) {
  return (
    <SheetContent
      side={side}
      className={cn(
        "dashboard-detail-sheet flex w-full flex-col gap-0 p-0 text-base overflow-hidden",
        className
      )}
      {...props}
    />
  )
}
