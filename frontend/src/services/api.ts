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
    throw new ApiError(body?.detail || `Erro ${response.status} ao acessar ${path}`, response.status);
  }

  return response.json() as Promise<T>;
}
