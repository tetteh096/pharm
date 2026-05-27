/**
 * Crops excess padding from fav_icon.png and writes sized favicons.
 * Run: node scripts/crop-favicon.mjs
 */
import sharp from "sharp"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const input = join(root, "public/logo/fav_icon.png")
const logoDir = join(root, "public/logo")

const trimmed = await sharp(input).trim({ threshold: 10 }).png().toBuffer()

const sizes = [
  { name: "fav_icon.png", size: 512 },
  { name: "favicon-32.png", size: 32 },
  { name: "favicon-48.png", size: 48 },
  { name: "favicon-192.png", size: 192 },
  { name: "apple-touch-icon.png", size: 180 },
]

for (const { name, size } of sizes) {
  await sharp(trimmed)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(join(logoDir, name))
  console.log(`Wrote ${name} (${size}px)`)
}

await sharp(trimmed)
  .resize(32, 32, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(join(root, "src/app/icon.png"))

console.log("Wrote src/app/icon.png")
