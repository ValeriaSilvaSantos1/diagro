from app.core import security
from app.models.usuario import Usuario
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.usuario import CadastroIn, LoginIn


class EmailJaCadastrado(Exception):
    """Já existe uma conta com este e-mail."""


class CredenciaisInvalidas(Exception):
    """E-mail inexistente OU senha errada (de propósito, não dizemos qual)."""


class AuthService:
    """Regras de cadastro e login. Não sabe nada de HTTP: quando algo dá errado,
    levanta uma exceção, e o controller decide qual código HTTP devolver."""

    def __init__(self, repo: UsuarioRepository):
        self.repo = repo

    def cadastrar(self, dados: CadastroIn) -> Usuario:
        email = dados.email.lower()
        if self.repo.buscar_por_email(email) is not None:
            raise EmailJaCadastrado
        senha_hash = security.gerar_hash(dados.senha)
        return self.repo.criar(nome=dados.nome, email=email, senha_hash=senha_hash)

    def login(self, dados: LoginIn) -> str:
        usuario = self.repo.buscar_por_email(dados.email.lower())
        if usuario is None or not security.verificar_senha(dados.senha, usuario.senha_hash):
            raise CredenciaisInvalidas
        return security.criar_token(usuario.id)