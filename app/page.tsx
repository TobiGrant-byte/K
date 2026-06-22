import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Research from "@/components/Research";
import Awards from "@/components/Awards";
import Gallery from "@/components/Gallery";
import Credentials from "@/components/Credentials";
import Hobbies from "@/components/Hobbies";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
 import PressSection from "@/components/PressSection";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <Research />
      <Awards />
      <Gallery />
      <Credentials />
      <PressSection />  
      <Hobbies />
      <Contact />
      <Footer />
    </main>
  );
}
