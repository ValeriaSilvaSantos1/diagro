import { env } from "@/lib/env";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, init);

  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao acessar ${path}`);
  }

  return response.json() as Promise<T>;
}
