import type { Metadata } from "next"
import Header from "@/components/medizen/Header"
import Footer from "@/components/medizen/Footer"
import PageTitle from "@/components/medizen/PageTitle"
import { ContactPageContent } from "@/components/medizen/ContactPageContent"

export const metadata: Metadata = {
  title: "Contact Us | Enviro Pharmacy",
  description:
    "Contact Enviro Pharmacy branches in Madina, Odorkor, Sakumono and Santeo for directions, branch hours, stock checks, and pharmacy support.",
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <PageTitle title="Contact Us" />
        <ContactPageContent />
      </main>
      <Footer />
    </>
  )
}
