import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

// Proxy uses ONLY the edge-safe config (no bcrypt, no pg, no Prisma).
// In Next.js 16 the "middleware" file convention was renamed to "proxy".
export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/signin",
    "/register",
  ],
}
