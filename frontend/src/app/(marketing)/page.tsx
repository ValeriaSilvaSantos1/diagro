import Benefits from "./_components/Benefits";
import Faq from "./_components/Faq";
import Features from "./_components/Features";
import Hero from "./_components/Hero";
import HowItWorks from "./_components/HowItWorks";

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <HowItWorks />
      <Features />
      <Benefits />
      <Faq />
    </main>
  );
}
