import { api } from "@/services/api";

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  criado_em: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function signup(nome: string, email: string, senha: string) {
  return api<AuthUser>("/auth/cadastro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });
}

export async function login(email: string, senha: string) {
  const token = await api<TokenResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  const storage = typeof window !== "undefined" ? sessionStorage : null;
  if (storage) storage.setItem("diagro:token", token.access_token);

  try {
    const user = await api<AuthUser>("/auth/me");
    return { token: token.access_token, user };
  } catch (error) {
    sessionStorage.removeItem("diagro:token");
    throw error;
  }
}
