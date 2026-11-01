"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MenuIcon, XIcon } from "lucide-react";
import { cn } from "cn";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type MobileMenuProps = {
  links: { name: string; href: string }[];
};

export default function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon-lg" className="lg:hidden" />}
      >
        <MenuIcon className="size-6" />
        <span className="sr-only">Abrir menu</span>
      </SheetTrigger>

      <SheetContent
        side="top"
        showCloseButton={false}
        className="gap-0 rounded-b-2xl"
      >
        <SheetHeader className="flex-row items-center justify-between border-b px-6 py-4">
          <SheetTitle>
            <Image
              src="/images/landing/logo_Diagro.svg"
              alt="Logo Diagro"
              width={1980}
              height={520}
              className="h-auto w-28"
            />
          </SheetTitle>
          <SheetClose render={<Button variant="ghost" size="icon-lg" />}>
            <XIcon className="size-6" />
            <span className="sr-only">Fechar menu</span>
          </SheetClose>
        </SheetHeader>

        <nav className="px-6 py-2">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-base font-medium text-gray-800"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid grid-cols-2 gap-3 px-6 pt-2 pb-6">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 text-base"
            )}
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 text-base font-semibold shadow-md"
            )}
          >
            Começar agora
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
