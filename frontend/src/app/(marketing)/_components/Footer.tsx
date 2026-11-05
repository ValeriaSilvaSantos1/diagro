import Link from "next/link";

import Logo from "@/components/layout/Logo";
import { routes } from "@/lib/routes";
import { footer } from "../_data/content";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href={routes.home}
            aria-label="DiAgro — página inicial"
            className="inline-flex"
          >
            <Logo />
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {footer.description}
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm md:items-end">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground">
            {footer.links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-ink">
                {link.name}
              </Link>
            ))}
            <span>{footer.copyright}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
