import HomeFaq from "@/components/medizen/sections/HomeFaq";
import Testimonials from "@/components/medizen/sections/Testimonials";

export default function HomeHelpSection() {
  return (
    <section className="home-help-section">
      <div className="container">
        <HomeFaq />
        <div className="home-help-divider" aria-hidden />
        <Testimonials />
      </div>
    </section>
  );
}
