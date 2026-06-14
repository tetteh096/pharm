import type { NextAuthConfig } from "next-auth"
import type { Role } from "@prisma/client"
import { canAccessDashboardRoute } from "@/lib/dashboard-rbac"

// Edge-safe config: NO bcrypt, NO Prisma, NO pg
// Used by middleware (Edge runtime)
export const authConfig: NextAuthConfig = {
  // trustHost lets NextAuth5 derive the base URL from the incoming request
  // instead of relying on the hardcoded NEXTAUTH_URL env var.
  // This means redirects always use the actual host/port (localhost:3002,
  // your-domain.com, etc.) with zero config changes between environments.
  trustHost: true,
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = (auth?.user as any)?.role as Role | undefined
      const path = nextUrl.pathname

      // Protect all dashboard routes
      if (path.startsWith("/dashboard")) {
        if (!isLoggedIn) return false // redirects to signIn page

        if (!canAccessDashboardRoute(role, path)) {
          return Response.redirect(new URL("/dashboard", nextUrl))
        }

        return true
      }

      // Redirect logged-in users away from signin/register
      if ((path === "/signin" || path === "/register") && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as any).role as Role
        token.department = (user as any).department as string | undefined
        token.picture = (user as any).image ?? null
        token.name = user.name ?? token.name
        token.email = user.email ?? token.email
      }
      // Allow updates from the client via `update()` on next-auth's useSession
      if (trigger === "update" && session?.user) {
        if (typeof session.user.name === "string") token.name = session.user.name
        if (typeof session.user.email === "string") token.email = session.user.email
        if ("image" in session.user) token.picture = session.user.image ?? null
        if (typeof (session.user as any).department === "string") {
          token.department = (session.user as any).department
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.department = token.department as string | undefined
        session.user.image = (token.picture as string | null | undefined) ?? null
        if (typeof token.name === "string") session.user.name = token.name
        if (typeof token.email === "string") session.user.email = token.email
      }
      return session
    },
  },
  providers: [], // Providers added in auth.ts (Node.js runtime only)
}
