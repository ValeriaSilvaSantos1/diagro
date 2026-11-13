from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ---------------------------------------------------------------- entrada
class CadastroIn(BaseModel):
    """O que o front-end envia para criar uma conta."""

    nome: str = Field(min_length=2, max_length=120)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=128)


class PerfilIn(BaseModel):
    """Edição do perfil (PATCH /auth/me). Só os campos enviados mudam; nos opcionais,
    `null` ou texto vazio apaga o valor."""

    nome: str | None = Field(default=None, min_length=2, max_length=120)
    email: EmailStr | None = None
    propriedade: str | None = Field(default=None, max_length=120)
    area_propriedade: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    culturas_principais: str | None = Field(default=None, max_length=200)

    @field_validator("nome", "propriedade", "culturas_principais", mode="before")
    @classmethod
    def _apara(cls, valor):
        return valor.strip() if isinstance(valor, str) else valor


class LoginIn(BaseModel):
    """O que o front-end envia para entrar."""

    email: EmailStr
    senha: str


# ---------------------------------------------------------------- saída
class TokenOut(BaseModel):
    """Resposta do login."""

    access_token: str
    token_type: str = "bearer"


class UsuarioOut(BaseModel):
    """Dados do usuário que podem sair da API. Sem senha_hash, de propósito."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    email: str
    propriedade: str | None = None
    area_propriedade: float | None = None
    culturas_principais: str | None = None
    criado_em: datetime