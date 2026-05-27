import { prisma } from "../src/lib/prisma"

async function verify() {
  try {
    const productCount = await prisma.product.count()
    console.log(`Found ${productCount} products`)
    console.log("✅ Connected")
  } catch (error) {
    console.error("❌ Verification failed")
    console.error(error)
    process.exit(1)
  }
}

verify()
