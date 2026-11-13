from pydantic import BaseModel, ConfigDict


class CulturaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str


class DoencaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    label_modelo: str
    nome_comum: str
    tratamento_recomendado: str | None
