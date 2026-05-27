import Header from "@/components/medizen/Header";
import Footer from "@/components/medizen/Footer";
import Banner from "@/components/medizen/sections/Banner";
import Category from "@/components/medizen/sections/Category";
import MedPreview from "@/components/medizen/sections/MedPreview";
import { getFeaturedProducts } from "@/app/actions/storefront";
import { getLatestPublicPosts } from "@/app/actions/blog";
import About from "@/components/medizen/sections/About";
import Appointment from "@/components/medizen/sections/Appointment";
import Features from "@/components/medizen/sections/Features";
import Sponsor from "@/components/medizen/sections/Sponsor";
import Choose from "@/components/medizen/sections/Choose";
import Care from "@/components/medizen/sections/Care";
import Special from "@/components/medizen/sections/Special";
import News from "@/components/medizen/sections/News";

export default async function Home() {
  const [featuredProducts, latestPosts] = await Promise.all([
    getFeaturedProducts(),
    getLatestPublicPosts(4),
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
        <Features />
        <Sponsor />
        <Choose />
        <Care />
        <Special />
        <News posts={latestPosts} />
      </main>
      <Footer />
    </>
  );
}
