import { About } from "@/components/landing/about";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { JsonLd } from "@/components/landing/json-ld";
import { Navbar } from "@/components/landing/navbar";
import { Programs } from "@/components/landing/programs";
import { System } from "@/components/landing/system";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-[#fbfdfb] bg-[radial-gradient(680px_440px_at_50%_0px,#dde8da_0%,#eef4ec_55%,transparent_75%),radial-gradient(420px_320px_at_6%_340px,#d5e3d3_0%,transparent_70%),radial-gradient(380px_300px_at_94%_140px,#d5e3d3_0%,transparent_70%)] font-sans text-[#1d2b21] antialiased">
      <JsonLd />
      <Navbar />
      <main className="flex flex-1 flex-col">
        <Hero />
        <About />
        <Programs />
        <System />
      </main>
      <Footer />
    </div>
  );
}
