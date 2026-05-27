import Header from "@/components/medizen/Header";
import Footer from "@/components/medizen/Footer";
import TeamPage from "@/components/medizen/sections/TeamPage";

export const metadata = {
  title: "Our Team | Enviro Pharmacy",
  description:
    "Meet the dedicated pharmacists and specialists behind Enviro Pharmacy — here to serve you with expertise and compassion.",
};

export default function Team() {
  return (
    <>
      <Header />
      <main>
        <TeamPage />
      </main>
      <Footer />
    </>
  );
}
