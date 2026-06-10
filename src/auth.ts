import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import { createRateLimiter } from "@/lib/rate-limit"

// 10 login attempts per 15 minutes per email address
// Keyed on email so a single account can't be brute-forced from many IPs
const loginLimiter = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 })

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = (credentials.email as string).toLowerCase().trim()

        // Rate limit by email — block brute force on any single account
        const { allowed } = loginLimiter.check(`login:${email}`)
        if (!allowed) {
          // Returning null makes NextAuth show a generic "Sign in failed" error
          // which is intentional — we don't want to leak that it's rate limited
          throw new Error("Too many login attempts. Please wait 15 minutes and try again.")
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.active) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) return null

        // Reset limiter on successful login
        loginLimiter.reset(`login:${email}`)

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department ?? undefined,
          image: user.image ?? undefined,
        }
      },
    }),
  ],
})
