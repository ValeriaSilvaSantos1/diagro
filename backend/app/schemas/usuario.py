from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------------------------------------------------------------- entrada
class CadastroIn(BaseModel):
    """O que o front-end envia para criar uma conta."""

    nome: str = Field(min_length=2, max_length=120)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=128)


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
    criado_em: datetime