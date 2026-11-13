'use client'

import { useEffect, useState } from 'react'

import { buscarImagem, ehFotoDaApi } from '@/services/imagens'

/** URL que a tag <img> pode usar: a foto da API baixada com o token (null enquanto carrega ou se
 *  falhar) ou a própria `src` quando ela não é da API. Libera a URL blob: ao trocar de foto ou desmontar. */
export function useImagemProtegida(src: string): string | null {
  const daApi = ehFotoDaApi(src)
  const [carregada, setCarregada] = useState<{ src: string; url: string } | null>(null)

  useEffect(() => {
    if (!daApi) return
    let ativo = true
    let url: string | null = null
    buscarImagem(src)
      .then((nova) => {
        if (ativo) {
          url = nova
          setCarregada({ src, url: nova })
        } else {
          URL.revokeObjectURL(nova)
        }
      })
      .catch(() => {})
    return () => {
      ativo = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [src, daApi])

  if (!daApi) return src
  return carregada?.src === src ? carregada.url : null
}
