import Header from "@/components/medizen/Header";
import Footer from "@/components/medizen/Footer";
import PageTitle from "@/components/medizen/PageTitle";
import ServiceList from "@/components/medizen/sections/ServiceList";
import PharmacyServicesShowcase from "@/components/medizen/sections/PharmacyServicesShowcase";
import Appointment from "@/components/medizen/sections/Appointment";

export default function ServicePage() {
  return (
    <>
      <Header />
      <main>
        <PageTitle title="Services" />
        <PharmacyServicesShowcase />
        <ServiceList />
        <Appointment />
      </main>
      <Footer />
    </>
  );
}
