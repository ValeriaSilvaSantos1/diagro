import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routes } from "@/lib/routes";
import { steps } from "../_data/content";
import SectionHeader from "./SectionHeader";
import StepCard from "./StepCard";

export default function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="scroll-mt-16 border-t border-line bg-mist py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="Como funciona"
          title="Três passos, sem complicação."
          action={
            <Link
              href={routes.signup}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-agro hover:underline"
            >
              Começar agora
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
        />

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </ol>
      </div>
    </section>
  );
}
