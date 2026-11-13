import { api } from "@/services/api";

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  propriedade: string | null;
  area_propriedade: number | null;
  culturas_principais: string | null;
  criado_em: string;
}

/** Campos que o PATCH /auth/me aceita. Só os enviados mudam; `null` apaga os opcionais. */
export interface PerfilPatch {
  nome?: string;
  email?: string;
  propriedade?: string | null;
  area_propriedade?: number | null;
  culturas_principais?: string | null;
}

/** Converte o usuário da API para o formato do front (área com vírgula, como a pessoa digita). */
export function usuarioDaApi(usuario: AuthUser) {
  return {
    name: usuario.nome,
    email: usuario.email,
    property: usuario.propriedade ?? undefined,
    propertyArea: usuario.area_propriedade == null ? undefined : String(usuario.area_propriedade).replace(".", ","),
    mainCrops: usuario.culturas_principais ?? undefined,
  };
}

export async function atualizarPerfil(dados: PerfilPatch) {
  return api<AuthUser>("/auth/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
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

/** Usuário dono do token salvo. Responde 401 se o token estiver ausente, inválido ou expirado. */
export async function getCurrentUser() {
  return api<AuthUser>("/auth/me");
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
