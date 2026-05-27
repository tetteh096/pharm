import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import * as dotenv from "dotenv"

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashed = await bcrypt.hash("12345678", 12)

  const user = await prisma.user.update({
    where: { email: "admin@medizen.gh" },
    data: {
      email: "admin@gmail.com",
      password: hashed,
    },
  })

  console.log(`✅ Updated: ${user.email} — password changed.`)
}

main()
  .catch(e => { console.error("❌", e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect(); await pool.end() })
