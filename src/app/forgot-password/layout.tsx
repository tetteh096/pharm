import type { Metadata } from "next"
import Footer from "@/components/medizen/Footer"

export const metadata: Metadata = {
  title: "Forgot Password",
  robots: { index: false, follow: false },
}

// Footer is a server component (reads site settings from the DB); keep it here
// so the "use client" page never bundles the Postgres driver for the browser.
export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  )
}
