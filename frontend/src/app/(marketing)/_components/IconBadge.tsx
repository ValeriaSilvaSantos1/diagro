import type { LucideIcon } from "lucide-react";

type IconBadgeProps = {
  icon: LucideIcon;
};

export default function IconBadge({ icon: Icon }: IconBadgeProps) {
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint text-agro">
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}
