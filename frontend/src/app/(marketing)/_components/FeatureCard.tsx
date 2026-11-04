import type { IconItem } from "../_data/content";
import IconBadge from "./IconBadge";

type FeatureCardProps = {
  feature: IconItem;
};

export default function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6 transition hover:border-agro/30 hover:shadow-raised">
      <IconBadge icon={feature.icon} />
      <div>
        <h3 className="text-lg font-bold text-ink">{feature.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          {feature.description}
        </p>
      </div>
    </li>
  );
}
