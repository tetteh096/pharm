import { NextResponse } from "next/server"
import { getPublicSiteSettings } from "@/lib/site-settings"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const settings = await getPublicSiteSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("[api/public/site-settings]", error)
    return NextResponse.json(
      { error: "Could not load site settings" },
      { status: 500 }
    )
  }
}
