from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DiagnosticoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    imagem_id: int
    doenca_id: int | None
    modelo_versao: str
    confianca: float | None
    status: str
    criado_em: datetime
    arquivo_url: str
    cultura: str | None = None
    nome_doenca: str | None = None
    tratamento_recomendado: str | None = None
    observacoes: str | None = None
    inferencia_id: str | None = None
    # Documento da coleção `inferencias` do MongoDB; só vem no detalhe de uma análise.
    inferencia: dict | None = None
