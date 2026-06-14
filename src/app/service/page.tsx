import Header from "@/components/medizen/Header";
import Footer from "@/components/medizen/Footer";
import PageTitle from "@/components/medizen/PageTitle";
import ServicesTrustSection from "@/components/medizen/sections/ServicesTrustSection";
import PharmacyServicesShowcase from "@/components/medizen/sections/PharmacyServicesShowcase";
import Appointment from "@/components/medizen/sections/Appointment";

export const metadata = {
  title: "Pharmacy Services — Prescriptions, Chronic Care & Consultations",
  description:
    "Explore Enviro Pharmacy services across Accra: prescription dispensing, chronic-care management, pharmacist consultations, home delivery and more in Madina, Odorkor, Sakumono and Santeo.",
  alternates: { canonical: "/service" },
};

export default function ServicePage() {
  return (
    <>
      <Header />
      <main>
        <PageTitle title="Services" />
        <PharmacyServicesShowcase />
        <ServicesTrustSection />
        <Appointment />
      </main>
      <Footer />
    </>
  );
}
