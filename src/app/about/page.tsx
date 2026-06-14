import Header from "@/components/medizen/Header";
import Footer from "@/components/medizen/Footer";
import PageTitle from "@/components/medizen/PageTitle";
import AboutSection from "@/components/medizen/sections/About";
import AboutExtra from "@/components/medizen/sections/AboutExtra";

export const metadata = {
  title: "About Us — Community Pharmacy in Accra, Ghana",
  description:
    "Learn about Enviro Pharmacy: a trusted community pharmacy serving Madina, Odorkor, Sakumono and Santeo with quality medicines, pharmacist care and chronic-care support across Accra.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <PageTitle title="About Us" />
        <AboutSection />
        <AboutExtra />
      </main>
      <Footer />
    </>
  );
}
