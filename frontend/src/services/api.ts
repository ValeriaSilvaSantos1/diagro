import { env } from "@/lib/env";

/** Erro de uma chamada à API. A mensagem é o `detail` do backend; `status` é o código HTTP (ex.: 401). */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Token do login salvo no navegador, ou null fora dele e sem login. */
export function lerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("diagro:token") || sessionStorage.getItem("diagro:token");
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = lerToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new ApiError(body?.detail || `Erro ${response.status} ao acessar ${path}`, response.status);
  }

  return response.json() as Promise<T>;
}
