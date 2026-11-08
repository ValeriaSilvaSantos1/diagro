import Image from "next/image";

import { hero, regionsOfInterest } from "../_data/content";
import DemoResultCard from "./DemoResultCard";
import RoiMarker from "./RoiMarker";

const frameCorners = [
  "top-0 left-0 rounded-tl-md border-t-2 border-l-2",
  "top-0 right-0 rounded-tr-md border-t-2 border-r-2",
  "bottom-0 left-0 rounded-bl-md border-b-2 border-l-2",
  "right-0 bottom-0 rounded-br-md border-r-2 border-b-2",
];

// Ilustração do hero: foto da folha com a moldura de câmera, as regiões
// detectadas e o cartão com o resultado de demonstração.
export default function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-115 animate-fade-up [animation-delay:120ms] lg:mr-0">
      <figure className="relative aspect-4/5 overflow-hidden rounded-3xl bg-forest-deep shadow-float">
        <Image
          src={hero.image.src}
          alt={hero.image.alt}
          fill
          priority
          sizes="(min-width: 1024px) 460px, (min-width: 640px) 460px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-forest-deep/40 via-transparent to-transparent" />

        <div className="pointer-events-none absolute inset-4" aria-hidden="true">
          {frameCorners.map((corner) => (
            <span
              key={corner}
              className={`absolute size-6 border-white/80 ${corner}`}
            />
          ))}
        </div>

        {regionsOfInterest.map((region) => (
          <RoiMarker key={region.label} region={region} />
        ))}
      </figure>

      <DemoResultCard />
    </div>
  );
}
