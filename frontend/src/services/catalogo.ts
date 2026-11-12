import { api } from "@/services/api";

export interface DoencaCatalogo {
  id: number;
  label_modelo: string;
  nome_comum: string;
  tratamento_recomendado: string | null;
}

export function listarDoencas(cultura: string) {
  return api<DoencaCatalogo[]>(`/culturas/${cultura}/doencas`);
}
