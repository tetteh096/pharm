import Header from "@/components/medizen/Header";
import Footer from "@/components/medizen/Footer";
import PageTitle from "@/components/medizen/PageTitle";
import AboutSection from "@/components/medizen/sections/About";
import AboutExtra from "@/components/medizen/sections/AboutExtra";

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
