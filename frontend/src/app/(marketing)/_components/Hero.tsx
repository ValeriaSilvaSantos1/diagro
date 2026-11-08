import Link from "next/link";
import { CircleCheck, ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";

import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { hero } from "../_data/content";
import HeroPreview from "./HeroPreview";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-12 pb-20 sm:px-8 sm:pt-16 lg:min-h-[calc(100svh-6.5rem)] lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-16">
        <div className="animate-fade-up">

          <h1 className="text-[40px] leading-[1.06] font-extrabold tracking-[-0.035em] text-ink sm:text-[56px]">
            {hero.title} <span className="text-agro">{hero.titleHighlight}</span>
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
            {hero.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={routes.signup}
              className={cn(buttonVariants({ size: "xl" }))}
            >
              <ScanSearch aria-hidden="true" />
              Analisar uma planta
            </Link>
            <Link
              href="#como-funciona"
              className={cn(buttonVariants({ variant: "outline", size: "xl" }))}
            >
              Como funciona
            </Link>
          </div>

          <ul className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {hero.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-center gap-2 text-sm font-medium text-ink-soft"
              >
                <CircleCheck
                  className="size-4.5 text-agro"
                  aria-hidden="true"
                />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}
