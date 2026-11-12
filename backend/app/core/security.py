"""Segurança: hash de senha com Argon2 e tokens JWT (Relatório AB1, seção 6).

Este arquivo não sabe nada de banco, usuário ou FastAPI: só transforma dados.
Quem decide QUANDO usar cada função é a camada Service.
"""

from datetime import UTC, datetime, timedelta

import jwt
from passlib.context import CryptContext

from app.core.config import settings

_contexto_senha = CryptContext(schemes=["argon2"], deprecated="auto")


class TokenInvalido(Exception):
    """Token ausente, adulterado, assinado com outra chave ou expirado."""


# senhas
def gerar_hash(senha: str) -> str:
    """Argon2 com salt aleatório: a mesma senha gera um hash diferente a cada vez.
    O resultado começa com '$argon2id$' e é isso que vai para usuarios.senha_hash."""
    return _contexto_senha.hash(senha)


def verificar_senha(senha: str, senha_hash: str) -> bool:
    """Compara a senha digitada com o hash guardado, sem nunca 'desfazer' o hash."""
    return _contexto_senha.verify(senha, senha_hash)


# tokens
def criar_token(usuario_id: int) -> str:
    """Gera o JWT do login. Ele carrega só o id do usuário ("sub") e a validade ("exp").

    O token é assinado com JWT_SECRET: qualquer um consegue LER o conteúdo,
    mas ninguém consegue ALTERAR sem invalidar a assinatura. Por isso nunca
    coloquem dados sensíveis (senha, e-mail) dentro dele.
    """
    agora = datetime.now(UTC)
    payload = {
        "sub": str(usuario_id),  # o padrão JWT exige "sub" como texto
        "iat": agora,
        "exp": agora + timedelta(minutes=settings.JWT_EXPIRA_MINUTOS),
    }
    return jwt.encode(payload, settings.JWT_SECRET.get_secret_value(), algorithm=settings.JWT_ALGORITMO)


def ler_token(token: str) -> int:
    """Valida assinatura e validade e devolve o id do usuário. Levanta TokenInvalido se falhar."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET.get_secret_value(),
            algorithms=[settings.JWT_ALGORITMO],
            options={"require": ["exp", "sub"]},
        )
        return int(payload["sub"])
    except (jwt.PyJWTError, ValueError) as e:
        raise TokenInvalido from e