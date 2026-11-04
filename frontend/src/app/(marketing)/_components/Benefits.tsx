import Link from "next/link";
import { cn } from "@/lib/utils";

import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { benefits } from "../_data/content";
import BenefitItem from "./BenefitItem";
import SectionHeader from "./SectionHeader";

export default function Benefits() {
  return (
    <section
      id="beneficios"
      className="scroll-mt-16 border-t border-line bg-mist py-16 sm:py-20"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.3fr] lg:items-center lg:gap-16">
        <div>
          <SectionHeader
            eyebrow={benefits.eyebrow}
            title={benefits.title}
            description={benefits.description}
          />
          <Link
            href={routes.signup}
            className={cn(buttonVariants({ size: "xl" }), "mt-8")}
          >
            Começar agora
          </Link>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {benefits.items.map((benefit) => (
            <BenefitItem key={benefit.title} benefit={benefit} />
          ))}
        </ul>
      </div>
    </section>
  );
}
