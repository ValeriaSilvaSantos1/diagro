import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faq } from "../_data/content";
import SectionHeader from "./SectionHeader";

export default function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-16 border-t border-line bg-white py-16 sm:py-20"
    >
      <div className="mx-auto grid-1 max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <SectionHeader
          eyebrow={faq.eyebrow}
          title={faq.title}
          className="self-start"
        />

        <Accordion className="rounded-2xl border border-line px-6 mt-8">
          {faq.items.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="gap-4 py-5 text-base font-semibold text-ink hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 leading-relaxed text-ink-soft">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
