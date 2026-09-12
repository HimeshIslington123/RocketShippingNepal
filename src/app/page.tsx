import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import About from "@/components/About";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";

import Testimonials from "@/components/Text";
import ShipmentTracking from "@/components/shippinghome";
import Services from "@/components/Serivice";

import CtaBanner from "@/components/cta";
import WhyChooseRocketShipping from "@/components/whytochoose";
import ShippingProcess from "@/components/shippingprocess";
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
<ShipmentTracking></ShipmentTracking>
<Services></Services>
<WhyChooseRocketShipping></WhyChooseRocketShipping>
<ShippingProcess></ShippingProcess>

      
<Testimonials></Testimonials>
      </main>

      <Footer />
    </>
  );
}
