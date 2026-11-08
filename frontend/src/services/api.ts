import { env } from "@/lib/env";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined" &&
    (localStorage.getItem("diagro:token") || sessionStorage.getItem("diagro:token"));
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail || `Erro ${response.status} ao acessar ${path}`);
  }

  return response.json() as Promise<T>;
}
