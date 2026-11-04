import Link from "next/link";
import { cn } from "@/lib/utils";

import Logo from "@/components/layout/Logo";
import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { navLinks } from "../_data/content";
import MobileMenu from "./MobileMenu";

export default function Header() {
  return (
    <header className="w-full border-b border-line px-6 py-4 lg:px-10 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-row items-center justify-between">
        <nav className="flex flex-row items-center gap-17">
          <Link href={routes.home} aria-label="DiAgro — página inicial">
            <Logo priority className="lg:w-35" />
          </Link>
          <ul className="hidden flex-row gap-10 text-sm font-semibold text-ink-soft lg:flex">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="transition hover:text-agro">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href={routes.login}
          className={cn(buttonVariants({ size: "lg" }), "hidden lg:inline-flex")}
        >
          Ir para a plataforma
        </Link>

        <MobileMenu links={navLinks} />
      </div>
    </header>
  );
}
