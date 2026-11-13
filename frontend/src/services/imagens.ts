import { env } from '@/lib/env'
import { ApiError, lerToken } from '@/services/api'

/** A rota /imagens/{id} da API exige login, e uma tag <img> não manda o token. */
export function ehFotoDaApi(src: string): boolean {
  return src.startsWith(`${env.apiUrl}/imagens/`)
}

/** Baixa a foto da API com o token e devolve uma URL blob: para a tag <img>; quem chama libera a URL
 *  com URL.revokeObjectURL. Outras URLs (pré-visualização local, imagens públicas) voltam iguais. */
export async function buscarImagem(src: string): Promise<string> {
  if (!ehFotoDaApi(src)) return src
  const token = lerToken()
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const resposta = await fetch(src, { headers })
  if (!resposta.ok) throw new ApiError(`Erro ${resposta.status} ao carregar a foto`, resposta.status)
  return URL.createObjectURL(await resposta.blob())
}
