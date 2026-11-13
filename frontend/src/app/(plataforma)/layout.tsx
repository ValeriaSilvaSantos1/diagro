import type { Metadata } from "next";
import { Providers } from "./_components/Providers";

// Título das páginas da plataforma: "Entrar · Diagro", "Histórico · Diagro"...
export const metadata: Metadata = {
  title: { default: "Diagro", template: "%s · Diagro" },
};

/**
 * Agrupa login/cadastro e a área interna (/app) sob o mesmo estado global,
 * sem alterar o layout raiz compartilhado com a landing page.
 */
export default function PlataformaLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
