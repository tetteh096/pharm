import type { Metadata } from "next"
import Header from "@/components/medizen/Header"
import Footer from "@/components/medizen/Footer"
import PageTitle from "@/components/medizen/PageTitle"
import { ContactPageContent } from "@/components/medizen/ContactPageContent"
import { getPublicBranches } from "@/lib/branches"
import { getPublicSiteSettings } from "@/lib/site-settings"

export const metadata: Metadata = {
  title: "Contact Us | Enviro Pharmacy",
  description:
    "Contact Enviro Pharmacy for directions, branch hours, stock checks, and pharmacy support.",
}

export default async function ContactPage() {
  const [branches, siteSettings] = await Promise.all([
    getPublicBranches(),
    getPublicSiteSettings(),
  ])
  return (
    <>
      <Header />
      <main>
        <PageTitle title="Contact Us" />
        <ContactPageContent
          branches={branches}
          contactEmail={siteSettings.contactEmail}
          whatsappBranches={siteSettings.whatsappBranches}
        />
      </main>
      <Footer />
    </>
  )
}
