import type { IconItem } from "../_data/content";
import IconBadge from "./IconBadge";

type BenefitItemProps = {
  benefit: IconItem;
};

export default function BenefitItem({ benefit }: BenefitItemProps) {
  return (
    <li className="flex gap-4 rounded-2xl border border-line bg-white p-5">
      <IconBadge icon={benefit.icon} />
      <div>
        <h3 className="font-bold text-ink">{benefit.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          {benefit.description}
        </p>
      </div>
    </li>
  );
}
