"use client"

import * as React from "react"

const INLINE_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">` +
      `<rect width="200" height="200" fill="#f1f5f9"/>` +
      `<g fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">` +
      `<text x="100" y="92" font-size="14" font-weight="700">Enviro</text>` +
      `<text x="100" y="112" font-size="11">Pharmacy</text>` +
      `</g>` +
      `<circle cx="100" cy="142" r="14" fill="none" stroke="#94a3b8" stroke-width="2"/>` +
      `<path d="M93 142h14M100 135v14" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>` +
      `</svg>`
  )

type SafeProductImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "onError"
> & {
  src: string | null | undefined
  alt: string
  /** Override the inline fallback if needed. */
  fallbackSrc?: string
}

/**
 * Renders a product image but swaps in a branded inline-SVG placeholder if the
 * `src` is missing or fails to load. Use this anywhere we render data URIs that
 * may be broken (cart, checkout, carousels).
 */
export function SafeProductImage({
  src,
  alt,
  fallbackSrc,
  ...rest
}: SafeProductImageProps) {
  const fallback = fallbackSrc ?? INLINE_FALLBACK
  const [errored, setErrored] = React.useState(false)
  const resolvedSrc = errored || !src ? fallback : src

  React.useEffect(() => {
    setErrored(false)
  }, [src])

  return (
    <img
      {...rest}
      src={resolvedSrc}
      alt={alt}
      onError={() => setErrored(true)}
    />
  )
}

export default SafeProductImage
