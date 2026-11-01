import Image from "next/image";
import Link from "next/link";
import { cn } from "cn";

import { buttonVariants } from "@/components/ui/button";
import MobileMenu from "./MobileMenu";

const headerLinks = [
  { name: "Início", href: "/" },
  { name: "Como funciona", href: "/#como-funciona" },
  { name: "Funcionalidades", href: "/#funcionalidades" },
  { name: "Benefícios", href: "/#beneficios" },
  { name: "FAQ", href: "/#faq" },
];

export default function Header() {
  return (
    <header className="w-full border-b border-gray-200 px-6 py-4 lg:px-10 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-row items-center justify-between">
        <nav className="flex flex-row items-center gap-17">
          <Link href="/">
            <Image
              src="/images/landing/logo_Diagro.svg"
              alt="Logo Diagro"
              width={1980}
              height={520}
              priority
              className="h-auto w-28 lg:w-35"
            />
          </Link>
          <ul className="hidden flex-row gap-10 text-sm font-semibold text-gray-600 lg:flex">
            {headerLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/login"
          className={cn(buttonVariants({ size: "lg" }), "hidden lg:inline-flex")}
        >
          Ir para a plataforma
        </Link>

        <MobileMenu links={headerLinks} />
      </div>
    </header>
  );
}
