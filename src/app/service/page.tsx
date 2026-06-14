import Header from "@/components/medizen/Header";
import Footer from "@/components/medizen/Footer";
import PageTitle from "@/components/medizen/PageTitle";
import ServicesTrustSection from "@/components/medizen/sections/ServicesTrustSection";
import PharmacyServicesShowcase from "@/components/medizen/sections/PharmacyServicesShowcase";
import ServicesPharmacistSupport from "@/components/medizen/sections/ServicesPharmacistSupport";
import Appointment from "@/components/medizen/sections/Appointment";

export const metadata = {
  title: "Pharmacy Services — Prescriptions, Chronic Care & Consultations",
  description:
    "Licensed pharmacist support: prescription dispensing, consultations, blood pressure and glucose checks, chronic care, and medicine delivery with order confirmation before dispatch.",
  alternates: { canonical: "/service" },
};

export default function ServicePage() {
  return (
    <>
      <Header />
      <main>
        <PageTitle title="Services" />
        <PharmacyServicesShowcase />
        <ServicesPharmacistSupport />
        <ServicesTrustSection />
        <Appointment />
      </main>
      <Footer />
    </>
  );
}
