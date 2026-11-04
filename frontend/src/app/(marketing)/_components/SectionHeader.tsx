import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  // conteúdo extra alinhado à direita no desktop (ex.: um link)
  action?: ReactNode;
  className?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
        className
      )}
    >
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-agro uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-extrabold text-ink">{title}</h2>
        {description && (
          <p className="mt-3 max-w-xl leading-relaxed text-ink-soft">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
