"use client"

import React from "react"
import { ChevronDown } from "lucide-react"

type Props = {
  title: string
  subtitle?: string
  /** Open by default on mobile when the section first renders. */
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

/** Full content on desktop; tap-to-expand on mobile to shorten long pages. */
export function CollapseBlock({
  title,
  subtitle,
  defaultOpen = false,
  children,
  className = "",
}: Props) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <div className={`collapse-block ${className}`.trim()}>
      <button
        type="button"
        className="collapse-block__trigger d-lg-none"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="collapse-block__trigger-text">
          <span className="collapse-block__title">{title}</span>
          {subtitle ? (
            <span className="collapse-block__subtitle">{subtitle}</span>
          ) : null}
        </span>
        <ChevronDown
          size={20}
          className={`collapse-block__chevron${open ? " is-open" : ""}`}
          aria-hidden
        />
      </button>
      <div
        className={`collapse-block__panel${open ? " is-open" : ""}`}
        aria-hidden={!open ? true : undefined}
      >
        {children}
      </div>
    </div>
  )
}
