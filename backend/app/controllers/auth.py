from fastapi import APIRouter, HTTPException, status

from app.core.deps import Db, UsuarioAtual
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.usuario import CadastroIn, LoginIn, PerfilIn, TokenOut, UsuarioOut
from app.services.auth_service import AuthService, CampoObrigatorio, CredenciaisInvalidas, EmailJaCadastrado

router = APIRouter(prefix="/auth", tags=["Autenticação"])


def _servico(db: Db) -> AuthService:
    """Monta o service com o repository da sessão desta requisição."""
    return AuthService(UsuarioRepository(db))


@router.post("/cadastro", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def cadastrar(dados: CadastroIn, db: Db):
    """Cria uma conta. A senha é guardada como hash Argon2."""
    try:
        return _servico(db).cadastrar(dados)
    except EmailJaCadastrado:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mail já cadastrado") from None


@router.post("/login", response_model=TokenOut)
def login(dados: LoginIn, db: Db):
    """Confere e-mail e senha e devolve um token JWT válido por 30 minutos."""
    try:
        token = _servico(db).login(dados)
    except CredenciaisInvalidas:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha inválidos"
        ) from None
    return TokenOut(access_token=token)


@router.get("/me", response_model=UsuarioOut)
def eu(usuario: UsuarioAtual):
    """Devolve o usuário dono do token. Exige login (botão Authorize no Swagger)."""
    return usuario


@router.patch("/me", response_model=UsuarioOut)
def editar_perfil(dados: PerfilIn, usuario: UsuarioAtual, db: Db):
    """Edita nome, e-mail e os dados da propriedade do usuário logado. Só os campos enviados mudam."""
    try:
        return _servico(db).atualizar_perfil(usuario, dados)
    except EmailJaCadastrado:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mail já cadastrado") from None
    except CampoObrigatorio as erro:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"O campo {erro} não pode ficar vazio"
        ) from None
