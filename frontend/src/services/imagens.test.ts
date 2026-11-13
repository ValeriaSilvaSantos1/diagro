import { afterEach, describe, expect, it, vi } from 'vitest'

import { env } from '@/lib/env'
import { ApiError } from '@/services/api'
import { buscarImagem } from '@/services/imagens'

const FOTO_DA_API = `${env.apiUrl}/imagens/7`

function comToken(token: string | null) {
  vi.stubGlobal('window', {})
  vi.stubGlobal('localStorage', { getItem: () => token })
  vi.stubGlobal('sessionStorage', { getItem: () => null })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('buscarImagem (A.1 a A.3, aprovados em 13/11)', () => {
  it('A.1 foto da API vem com o token e vira uma URL blob:', async () => {
    comToken('token-teste')
    const fetch = vi.fn(async () => new Response(new Blob(['jpeg'], { type: 'image/jpeg' })))
    vi.stubGlobal('fetch', fetch)

    const url = await buscarImagem(FOTO_DA_API)

    expect(url.startsWith('blob:')).toBe(true)
    const [chamada, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(chamada).toBe(FOTO_DA_API)
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer token-teste')
  })

  it.each([
    'data:image/png;base64,iVBORw0KGgo=',
    'https://images.unsplash.com/photo-1?w=900',
  ])('A.2 URL que não é da API volta igual, sem fetch: %s', async (src) => {
    comToken('token-teste')
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    expect(await buscarImagem(src)).toBe(src)
    expect(fetch).not.toHaveBeenCalled()
  })

  it.each([401, 404])('A.3 resposta %i vira ApiError com o status', async (codigo) => {
    comToken('token-teste')
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ detail: 'Imagem não encontrada' }), { status: codigo })))

    const erro = await buscarImagem(FOTO_DA_API).catch((e: unknown) => e)

    expect(erro).toBeInstanceOf(ApiError)
    expect((erro as ApiError).status).toBe(codigo)
  })
})
