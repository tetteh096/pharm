"use client"

import * as React from "react"
import { Search, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Category = { id: string; name: string }

const MAX_SUGGESTIONS = 8

export function CategorySearchSelect({
  categories,
  value,
  onChange,
  placeholder = "Search categories…",
}: {
  categories: Category[]
  value: string
  onChange: (categoryId: string) => void
  placeholder?: string
}) {
  const [query, setQuery] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const selected = categories.find((c) => c.id === value)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const trimmedQuery = query.trim().toLowerCase()
  const suggestions = React.useMemo(() => {
    if (!trimmedQuery) return []
    return categories
      .filter((c) => c.name.toLowerCase().includes(trimmedQuery))
      .slice(0, MAX_SUGGESTIONS)
  }, [categories, trimmedQuery])

  const showDropdown = isFocused && trimmedQuery.length > 0

  return (
    <div ref={wrapperRef} className="space-y-3">
      {selected ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1 py-1.5 pl-2.5 pr-1 text-sm font-medium border-emerald-500/30 bg-emerald-500/5"
          >
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            {selected.name}
            <button
              type="button"
              onClick={() => {
                onChange("")
                setQuery("")
              }}
              className="ml-1 rounded-full p-0.5 hover:bg-muted"
              aria-label="Clear category"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </Badge>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Start typing to see matching categories.
        </p>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="pl-9"
          autoComplete="off"
        />

        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-lg border border-input bg-white dark:bg-[oklch(0.22_0.025_260)] shadow-lg overflow-hidden">
            {suggestions.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                No categories match &quot;{query.trim()}&quot;
              </p>
            ) : (
              <ul className="p-1 max-h-[260px] overflow-y-auto">
                {suggestions.map((cat) => {
                  const isSelected = cat.id === value
                  return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          onChange(cat.id)
                          setQuery("")
                          setIsFocused(false)
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                          isSelected
                            ? "bg-emerald-500/12 font-semibold text-[#09162a] dark:text-[#f1f5f9]"
                            : "hover:bg-muted/80 text-[#09162a] dark:text-[#e2e8f0]"
                        )}
                      >
                        <span>{highlightMatch(cat.name, trimmedQuery)}</span>
                        {isSelected && (
                          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function highlightMatch(name: string, query: string) {
  if (!query) return name
  const lower = name.toLowerCase()
  const index = lower.indexOf(query)
  if (index === -1) return name
  return (
    <>
      {name.slice(0, index)}
      <mark className="bg-emerald-500/20 text-inherit rounded px-0.5">
        {name.slice(index, index + query.length)}
      </mark>
      {name.slice(index + query.length)}
    </>
  )
}
