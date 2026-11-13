import Image from "next/image";
import { CircleCheck} from "lucide-react";

import { demoResult, hero } from "../_data/content";

// Cartão flutuante com um resultado de análise.
export default function DemoResultCard() {
  return (
    <div className="absolute -bottom-8 -left-3 w-[82%] max-w-75 rounded-2xl border border-line bg-white p-4 shadow-raised sm:-left-10">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-agro-dark">
          <CircleCheck className="size-3.5" aria-hidden="true" />
          Concluída
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Image
          src={hero.image.src}
          alt=""
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-lg object-cover ring-1 ring-line"
        />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{demoResult.label}</p>
          <p className="truncate text-sm font-bold text-ink">
            {demoResult.diagnosis}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Confiança do modelo</span>
          <span className="font-mono font-semibold text-ink">
            {demoResult.confidence}%
          </span>
        </div>
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist"
          role="progressbar"
          aria-label="Confiança do modelo"
          aria-valuenow={demoResult.confidence}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-agro"
            style={{ width: `${demoResult.confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}
