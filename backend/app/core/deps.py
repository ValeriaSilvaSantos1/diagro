"""Dependências do FastAPI usadas pelos controllers.

`UsuarioAtual` protege um endpoint: o FastAPI lê o cabeçalho
`Authorization: Bearer <token>`, valida o JWT e entrega o usuário logado
ao endpoint ANTES de qualquer regra de negócio rodar (Relatório AB1, seção 6).

Uso num controller:
    @router.get("/algo")
    def algo(usuario: UsuarioAtual):
        ...  # aqui o usuário já está autenticado
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import TokenInvalido, ler_token
from app.models.usuario import Usuario
from app.repositories.usuario_repository import UsuarioRepository

# auto_error=False: nós mesmos devolvemos o 401, com mensagem em português
_bearer = HTTPBearer(auto_error=False)

Db = Annotated[Session, Depends(get_db)]


def get_usuario_atual(
    db: Db,
    credenciais: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> Usuario:
    nao_autorizado = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token ausente, inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credenciais is None:
        raise nao_autorizado
    try:
        usuario_id = ler_token(credenciais.credentials)
    except TokenInvalido:
        raise nao_autorizado from None

    usuario = UsuarioRepository(db).buscar_por_id(usuario_id)
    if usuario is None:  # token válido, mas o usuário foi apagado
        raise nao_autorizado
    return usuario


UsuarioAtual = Annotated[Usuario, Depends(get_usuario_atual)]