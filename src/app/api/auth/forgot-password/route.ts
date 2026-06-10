import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import { createRateLimiter, getClientIp } from "@/lib/rate-limit"
import crypto from "crypto"

// 5 requests per 15 minutes per IP — prevents email bombing
const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 })

export async function POST(req: NextRequest) {
  // Rate limit check
  const ip = getClientIp(req)
  const { allowed, resetAt } = limiter.check(`forgot-password:${ip}`)
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) },
      }
    )
  }

  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })

    // Always respond with 200 to prevent email enumeration
    if (!user || !user.active) {
      return NextResponse.json({ ok: true })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    })

    await sendPasswordResetEmail(user.email, user.name, token)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
