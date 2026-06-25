import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import * as dotenv from "dotenv"
import { PHARMACY_CATEGORIES } from "../src/data/pharmacy-categories"
import { PHARMACY_BRANCHES } from "../src/data/pharmacy-branches"
import { slugifyCategory } from "../src/lib/inventory"

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@medizen.gh" },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("MedizenAdmin2025!", 12)
    await prisma.user.create({
      data: {
        name: "System Admin",
        email: "admin@medizen.gh",
        password: hashedPassword,
        role: Role.ADMIN,
        department: "Administration",
        active: true,
      },
    })
    console.log("✅ Admin user created: admin@medizen.gh / MedizenAdmin2025!")
  } else {
    console.log("ℹ️  Admin user already exists, skipping.")
  }

  let categoriesCreated = 0
  for (const name of PHARMACY_CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: { slug: slugifyCategory(name) },
      create: { name, slug: slugifyCategory(name) },
    })
    categoriesCreated++
  }
  console.log(`✅ Pharmacy categories ready (${categoriesCreated} categories).`)

  const seedBranches = [
    {
      name: "Sakumono",
      location: "NHTC Estate, Sakumono, Accra",
      phone: "053 088 3354",
      hours: "Monday – Saturday",
    },
    {
      name: "Madina",
      location: "La-Nkwantanang-Madina, Accra",
      phone: "055 461 2072",
      hours: "Monday – Saturday",
      notes: null,
    },
    {
      name: "Odorkor",
      location: "Odorkor, Accra",
      phone: "059 937 6675",
      hours: "Monday – Saturday",
    },
    {
      name: "Santeo",
      location: "Icgc Dominion Temple, Adjei Kojo Santeo Road, Santeo, Accra",
      phone: "053 118 3617",
      hours: "Monday – Saturday",
    },
  ]

  // Enrich each branch with the richer public-site fields (gps, maps, accent…)
  // from the shared static data, matched by slug.
  const staticBySlug = new Map(PHARMACY_BRANCHES.map((b) => [b.id, b]))

  for (const [index, b] of seedBranches.entries()) {
    const slug = slugifyCategory(b.name)
    const meta = staticBySlug.get(slug)
    const data = {
      slug,
      location: b.location,
      phone: b.phone,
      tel: meta?.tel ?? (b.phone ? b.phone.replace(/[^\d]/g, "") : null),
      gps: meta?.gps ?? null,
      hours: b.hours,
      notes: b.notes ?? null,
      maps: meta?.maps ?? null,
      mapEmbed: meta?.mapEmbed ?? null,
      accent: meta?.accent ?? "#13ec8a",
      comingSoon: meta?.comingSoon ?? false,
      sortOrder: index,
    }
    await prisma.branch.upsert({
      where: { name: b.name },
      update: data,
      create: { name: b.name, active: true, ...data },
    })
  }
  console.log(`✅ Branches ready (${seedBranches.length} default branches).`)

  // ─── Blog categories ──────────────────────────────────────────────────────
  const blogCategories = [
    "Wellness Tips",
    "Medication Guidance",
    "Family Health",
  ]
  for (const name of blogCategories) {
    await prisma.blogCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  const blogCats = await prisma.blogCategory.findMany()
  const catByName = Object.fromEntries(blogCats.map((c) => [c.name, c.id]))
  console.log(`✅ Blog categories ready (${blogCats.length}).`)

  // ─── Blog posts ───────────────────────────────────────────────────────────
  const blogPosts = [
    {
      title: "How to safely store medication at home in Ghana",
      slug: "safely-store-medication-at-home",
      categoryId: catByName["Medication Guidance"],
      excerpt:
        "A short pharmacist-approved guide to keeping your medicines effective in our humid climate — from antibiotics to insulin.",
      coverImage:
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&q=70&auto=format&fit=crop",
      tags: ["Storage", "Safety", "Pharmacist Tips"],
      content: `
        <p>Heat and humidity in Accra can quickly degrade common medications. A few simple habits can keep your prescriptions safe and effective.</p>
        <h2>1. Keep medicines below 25 °C</h2>
        <p>Avoid storing tablets and capsules in cars, on top of fridges, or near windows. A cool, dry cabinet inside the house is best.</p>
        <h2>2. Mind the bathroom</h2>
        <p>Even though it's tempting, the bathroom is humid and warm. Move medications to a bedroom drawer instead.</p>
        <h2>3. Refrigerate when required</h2>
        <p>Insulin, some eye drops, and reconstituted antibiotics belong in the fridge (2–8 °C) — never in the freezer.</p>
        <h2>4. Original packaging matters</h2>
        <p>Blister packs and amber bottles protect medicines from light and moisture. Keep them sealed until use.</p>
        <p>Need a refill? Visit our Madina or Odorkor branch and our pharmacists will personally check your storage routine.</p>
      `.trim(),
      status: "Published",
    },
    {
      title: "Five everyday habits for stronger immunity",
      slug: "five-habits-stronger-immunity",
      categoryId: catByName["Wellness Tips"],
      excerpt:
        "Small, science-backed changes that strengthen your immune system without expensive supplements.",
      coverImage:
        "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1200&q=70&auto=format&fit=crop",
      tags: ["Wellness", "Immunity", "Lifestyle"],
      content: `
        <p>You don't need pricey supplements to stay healthy. The fundamentals — sleep, water, movement, and a balanced plate — are still the most evidence-based way to keep your immune system in shape.</p>
        <h2>1. Sleep 7–9 hours</h2>
        <p>Most adults need at least seven hours. Less sleep raises stress hormones and reduces the body's ability to fight infection.</p>
        <h2>2. Hydrate</h2>
        <p>Aim for 6–8 glasses of water daily — more during harmattan or hot afternoons.</p>
        <h2>3. Eat the rainbow</h2>
        <p>Mixed greens, peppers, oranges, papaya and tomatoes pack vitamins A, C, and E. Local market produce works perfectly.</p>
        <h2>4. Move daily</h2>
        <p>30 minutes of brisk walking, dancing, or light cardio is enough to lower inflammation and improve circulation.</p>
        <h2>5. Manage stress</h2>
        <p>Chronic stress dampens immunity. Try deep breathing, prayer, journaling, or a chat with friends to decompress each day.</p>
        <p>If you feel persistently tired or unwell, drop by Enviro Pharmacy — our pharmacists can guide you on next steps.</p>
      `.trim(),
      status: "Published",
    },
    {
      title: "When to see a pharmacist before your doctor",
      slug: "when-to-see-pharmacist-first",
      categoryId: catByName["Family Health"],
      excerpt:
        "Pharmacists handle more than dispensing — here's when stopping by the pharmacy first will save you time, money, and stress.",
      coverImage:
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=70&auto=format&fit=crop",
      tags: ["Pharmacist", "Family", "Care"],
      content: `
        <p>For many common health concerns, your pharmacist is the fastest first stop. Here's when we can help directly.</p>
        <h2>Minor cuts, burns and bruises</h2>
        <p>We stock everything from antiseptics to sterile dressings and can show you how to use them properly.</p>
        <h2>Coughs, colds, and seasonal allergies</h2>
        <p>Our pharmacists will recommend the right over-the-counter option for your symptoms — and tell you when to escalate to a doctor.</p>
        <h2>Refilling chronic medications</h2>
        <p>If you're managing diabetes, hypertension, or asthma, we can streamline refills and remind you when it's time for a check-up.</p>
        <h2>Travel preparation</h2>
        <p>Heading out of the country? We'll help you build a travel kit — from anti-malarial tablets to rehydration salts.</p>
        <h2>Family health screening</h2>
        <p>Walk into either branch for a quick blood pressure or random blood sugar check — no appointment needed.</p>
        <p>Trust your pharmacy team. We're here for the everyday questions, so the doctor is reserved for the more complex ones.</p>
      `.trim(),
      status: "Published",
    },
  ]

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        tags: post.tags,
        status: post.status,
        categoryId: post.categoryId,
      },
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        tags: post.tags,
        status: post.status,
        authorName: "Enviro Pharmacy Team",
        categoryId: post.categoryId,
      },
    })
  }
  console.log(`✅ Blog posts ready (${blogPosts.length} sample posts).`)

  console.log("✅ Seeding complete.")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
