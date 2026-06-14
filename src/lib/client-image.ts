export type ImageOrientation = "portrait" | "landscape" | "square"

export type ProcessedImage = {
  dataUrl: string
  width: number
  height: number
  orientation: ImageOrientation
  bytesApprox: number
}

export type ImageResizeOptions = {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  mimeType?: "image/jpeg" | "image/webp" | "image/png"
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Could not read the image file"))
    reader.readAsDataURL(file)
  })
}

function estimateBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? ""
  return Math.round((base64.length * 3) / 4)
}

function pickOutputMime(file: File, preferred?: ImageResizeOptions["mimeType"]) {
  if (preferred) return preferred
  if (file.type === "image/png") return "image/png"
  if (file.type === "image/webp") return "image/webp"
  return "image/jpeg"
}

export function resizeImageDataUrl(
  dataUrl: string,
  options: ImageResizeOptions = {}
): Promise<ProcessedImage> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.85,
    mimeType = "image/jpeg",
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let width = img.naturalWidth
      let height = img.naturalHeight
      const scale = Math.min(maxWidth / width, maxHeight / height, 1)
      width = Math.max(1, Math.round(width * scale))
      height = Math.max(1, Math.round(height * scale))

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not process image"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      const out = canvas.toDataURL(mimeType, quality)
      const orientation: ImageOrientation =
        width > height ? "landscape" : width < height ? "portrait" : "square"

      resolve({
        dataUrl: out,
        width,
        height,
        orientation,
        bytesApprox: estimateBytes(out),
      })
    }
    img.onerror = () => reject(new Error("Could not load image"))
    img.src = dataUrl
  })
}

export async function processUploadImage(
  file: File,
  options: ImageResizeOptions = {}
): Promise<ProcessedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file")
  }

  const raw = await readFileAsDataUrl(file)
  return resizeImageDataUrl(raw, {
    ...options,
    mimeType: pickOutputMime(file, options.mimeType),
  })
}

export function formatImageSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
