import Header from "@/components/medizen/Header";
import Footer from "@/components/medizen/Footer";
import Banner from "@/components/medizen/sections/Banner";
import Category from "@/components/medizen/sections/Category";
import MedPreview from "@/components/medizen/sections/MedPreview";
import { getFeaturedProducts } from "@/app/actions/storefront";
import { getLatestPublicPosts } from "@/app/actions/blog";
import { getPublicBranches } from "@/lib/branches";
import About from "@/components/medizen/sections/About";
import Appointment from "@/components/medizen/sections/Appointment";
import Sponsor from "@/components/medizen/sections/Sponsor";
import Choose from "@/components/medizen/sections/Choose";
import Care from "@/components/medizen/sections/Care";
import Special from "@/components/medizen/sections/Special";
import News from "@/components/medizen/sections/News";
import HomeHelpSection from "@/components/medizen/sections/HomeHelpSection";

export default async function Home() {
  const [featuredProducts, latestPosts, branches] = await Promise.all([
    getFeaturedProducts(),
    getLatestPublicPosts(4),
    getPublicBranches(),
  ]);

  return (
    <>
      <Header />
      <main>
        <Banner />
        <Category />
        <MedPreview products={featuredProducts} />
        <About />
        <Appointment />
        <Sponsor />
        <Choose />
        <Care />
        <Special branches={branches} />
        <News posts={latestPosts} />
        <HomeHelpSection />
      </main>
      <Footer />
    </>
  );
}
