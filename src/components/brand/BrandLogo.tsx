import { BRAND_LOGO, BRAND_NAME } from "@/lib/brand"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  /** `full` = wordmark, `icon` = fav / compact mark */
  variant?: "full" | "icon"
  className?: string
  imgClassName?: string
  priority?: boolean
}

export function BrandLogo({
  variant = "full",
  className,
  imgClassName,
  priority = false,
}: BrandLogoProps) {
  const src = variant === "icon" ? BRAND_LOGO.icon : BRAND_LOGO.full

  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${BRAND_NAME} logo`}
        className={cn("max-h-full max-w-full object-contain", imgClassName)}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
      />
    </span>
  )
}
