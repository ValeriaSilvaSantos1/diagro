import type { Step } from "../_data/content";
import IconBadge from "./IconBadge";

type StepCardProps = {
  step: Step;
};

export default function StepCard({ step }: StepCardProps) {
  return (
    <li className="flex gap-4 rounded-2xl border border-line bg-white p-6 items-center">
      <IconBadge icon={step.icon} />
      <div>
        <p className="font-mono text-xs font-semibold text-muted-foreground">
          {step.number}
        </p>
        <h3 className="mt-0.5 text-lg font-bold text-ink">{step.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          {step.description}
        </p>
      </div>
    </li>
  );
}
