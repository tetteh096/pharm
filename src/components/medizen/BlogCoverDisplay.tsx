import { SafeProductImage } from "@/components/medizen/shop/SafeProductImage"

type BlogCoverDisplayProps = {
  src: string | null | undefined
  alt: string
  /** Wide frame used on cards and article headers. Portrait images crop the sides. */
  aspectRatio?: string
  maxHeight?: number | string
  className?: string
  roundedClassName?: string
}

/**
 * Featured/cover image frame used across the public blog.
 * Any orientation is accepted; the frame crops with object-fit: cover (WordPress-style).
 */
export function BlogCoverDisplay({
  src,
  alt,
  aspectRatio = "16 / 9",
  maxHeight,
  className = "",
  roundedClassName = "rounded-4",
}: BlogCoverDisplayProps) {
  return (
    <div
      className={`relative w-100 overflow-hidden ${roundedClassName} ${className}`.trim()}
      style={{
        aspectRatio,
        maxHeight,
        background: "#f4f6f8",
      }}
    >
      <SafeProductImage
        src={src}
        alt={alt}
        className="w-100 h-100"
        style={{
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
        }}
      />
    </div>
  )
}
