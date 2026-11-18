import { Bestsellers } from "@/components/home/Bestsellers";
import { CarePromise } from "@/components/home/CarePromise";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { Marquee } from "@/components/home/Marquee";
import { PlantFinder } from "@/components/home/PlantFinder";
import { Services } from "@/components/home/Services";
import { ShopBySpace } from "@/components/home/ShopBySpace";
import { Visit } from "@/components/home/Visit";
import { Preloader } from "@/components/layout/Preloader";

export default function Home() {
  return (
    <>
      <Preloader />
      <main>
        <Hero />
        <Marquee />
        <Bestsellers />
        <ShopBySpace />
        <Manifesto />
        <CarePromise />
        <PlantFinder />
        <Visit />
        <Services />
      </main>
    </>
  );
}
