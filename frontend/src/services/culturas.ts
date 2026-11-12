import { api } from '@/services/api'

export interface CulturaApi {
  id: number
  nome: string
}

export function listarCulturas() {
  return api<CulturaApi[]>('/culturas')
}
