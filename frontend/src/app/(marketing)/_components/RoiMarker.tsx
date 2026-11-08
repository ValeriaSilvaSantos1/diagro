import type { RegionOfInterest } from "../_data/content";

const corners = [
  "-top-px -left-px border-t-2 border-l-2",
  "-top-px -right-px border-t-2 border-r-2",
  "-bottom-px -left-px border-b-2 border-l-2",
  "-right-px -bottom-px border-r-2 border-b-2",
];

type RoiMarkerProps = {
  region: RegionOfInterest;
};

// Caixa tracejada que marca uma região de interesse sobre a foto.
export default function RoiMarker({ region }: RoiMarkerProps) {
  return (
    <div
      className="absolute animate-fade-in"
      style={{
        left: `${region.left}%`,
        top: `${region.top}%`,
        width: `${region.width}%`,
        height: `${region.height}%`,
        animationDelay: `${region.delayMs}ms`,
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-[3px] border-[1.5px] border-dashed border-lime bg-lime/10" />
      {corners.map((corner) => (
        <span key={corner} className={`absolute size-2.5 border-lime ${corner}`} />
      ))}
      <span className="absolute -top-5 left-0 rounded-[4px] bg-lime px-1.5 py-px font-mono text-[10px] font-bold whitespace-nowrap text-forest">
        {region.label}
      </span>
    </div>
  );
}
