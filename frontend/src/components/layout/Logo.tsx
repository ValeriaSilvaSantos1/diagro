import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  priority?: boolean;
};

export default function Logo({ className, priority }: LogoProps) {
  return (
    <Image
      src="/images/landing/logo_Diagro.svg"
      alt="Logo Diagro"
      width={1980}
      height={520}
      priority={priority}
      className={cn("h-auto w-28", className)}
    />
  );
}
