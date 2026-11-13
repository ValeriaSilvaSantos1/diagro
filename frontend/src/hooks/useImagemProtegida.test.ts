// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { env } from '@/lib/env'
import { useImagemProtegida } from '@/hooks/useImagemProtegida'
import { buscarImagem } from '@/services/imagens'

vi.mock('@/services/imagens', async (original) => ({
  ...(await original<typeof import('@/services/imagens')>()),
  buscarImagem: vi.fn(),
}))

const FOTO_DA_API = `${env.apiUrl}/imagens/7`
const revogar = vi.fn()

beforeEach(() => {
  URL.revokeObjectURL = revogar
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useImagemProtegida (H.1 a H.3, aprovados em 13/11)', () => {
  it('H.1 foto da API troca para a URL blob: e a libera ao desmontar', async () => {
    vi.mocked(buscarImagem).mockResolvedValue('blob:teste')

    const { result, unmount } = renderHook(() => useImagemProtegida(FOTO_DA_API))

    expect(result.current).toBeNull()
    await waitFor(() => expect(result.current).toBe('blob:teste'))
    unmount()
    expect(revogar).toHaveBeenCalledWith('blob:teste')
  })

  it('H.2 URL que não é da API é usada direto, sem busca', () => {
    const src = 'data:image/png;base64,iVBORw0KGgo='

    const { result } = renderHook(() => useImagemProtegida(src))

    expect(result.current).toBe(src)
    expect(buscarImagem).not.toHaveBeenCalled()
  })

  it('H.3 erro da API deixa a foto vazia e não libera nada', async () => {
    vi.mocked(buscarImagem).mockRejectedValue(new Error('404'))

    const { result, unmount } = renderHook(() => useImagemProtegida(FOTO_DA_API))

    await waitFor(() => expect(buscarImagem).toHaveBeenCalled())
    expect(result.current).toBeNull()
    unmount()
    expect(revogar).not.toHaveBeenCalled()
  })
})
