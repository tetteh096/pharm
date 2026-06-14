import Header from "@/components/medizen/Header";
import Footer from "@/components/medizen/Footer";
import TeamPage from "@/components/medizen/sections/TeamPage";
import { getPublicTeamProfiles } from "@/app/actions/team";

export const metadata = {
  title: "Our Team — Pharmacists in Madina, Odorkor & Sakumono",
  description:
    "Meet the dedicated pharmacists and specialists behind Enviro Pharmacy in Accra — here to serve Madina, Odorkor, Sakumono and Santeo with expertise and compassion.",
  alternates: { canonical: "/team" },
};

export default async function Team() {
  const profiles = await getPublicTeamProfiles();

  return (
    <>
      <Header />
      <main>
        <TeamPage profiles={profiles} />
      </main>
      <Footer />
    </>
  );
}
