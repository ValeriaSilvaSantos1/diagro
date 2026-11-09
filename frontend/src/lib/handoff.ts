import type { SelectedImage } from '@/components/analysis/ImageUploader'

/**
 * Passa uma foto escolhida no dashboard ("Analisar uma folha") para /app/nova-analise.
 * No App Router não existe `location.state`, então guardamos a imagem aqui, em memória,
 * e a tela de nova análise lê com `useSyncExternalStore`.
 */
let pending: SelectedImage | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const pendingImage = {
  get: () => pending,
  getServer: () => null,
  set(img: SelectedImage | null) {
    pending = img
    emit()
  },
  clear() {
    if (!pending) return
    pending = null
    emit()
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
