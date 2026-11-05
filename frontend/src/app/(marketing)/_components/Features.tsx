import { features } from "../_data/content";
import FeatureCard from "./FeatureCard";
import SectionHeader from "./SectionHeader";

export default function Features() {
  return (
    <section
      id="funcionalidades"
      className="scroll-mt-16 border-t border-line bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeader
          eyebrow={features.eyebrow}
          title={features.title}
          description={features.description}
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.items.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </ul>
      </div>
    </section>
  );
}
