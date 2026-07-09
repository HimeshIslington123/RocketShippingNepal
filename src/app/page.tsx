import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import About from "@/components/About";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import WhyChooseUs from "@/components/whyto";
import Testimonials from "@/components/Text";
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Partners />

        <About />

   <WhyChooseUs></WhyChooseUs>
<Testimonials></Testimonials>
      </main>
      <Footer />
    </>
  );
}
