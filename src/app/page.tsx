import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import About from "@/components/About";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import WhyChooseUs from "@/components/whyto";
import Testimonials from "@/components/Text";
import ShipmentTracking from "@/components/shippinghome";
import Services from "@/components/Serivice";
import WhyRocketShipping from "@/components/why";
import CtaBanner from "@/components/cta";
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
<ShipmentTracking></ShipmentTracking>
<Services></Services>
<WhyRocketShipping></WhyRocketShipping>

       {/*  <Partners />

        <About /> */}

   {/* <WhyChooseUs></WhyChooseUs> */}
<Testimonials></Testimonials>
      </main>

      <Footer />
    </>
  );
}
