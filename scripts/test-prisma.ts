import { PrismaClient } from "@prisma/client"

async function main() {
  const prisma = new PrismaClient()
  console.log("Prisma Models:", Object.keys(prisma).filter(k => !k.startsWith("_") && !k.startsWith("$")))
  try {
    const count = await prisma.blogPost.count()
    console.log("BlogPost Count:", count)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error("BlogPost model NOT found or error:", message)
  }
  await prisma.$disconnect()
}

main()
