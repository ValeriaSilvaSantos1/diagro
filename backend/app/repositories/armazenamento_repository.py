"""Camada Repository — armazenamento das imagens no RustFS (protocolo S3).

O PostgreSQL guarda só a CHAVE do objeto na coluna imagens.arquivo_url
(ex.: "imagens/7/2026/11/3f2a9c4e1b.jpg"), nunca a URL completa: a URL muda
de ambiente para ambiente (localhost, Docker, servidor), a chave não.

Usamos o boto3, o cliente S3 genérico. Como o RustFS fala o mesmo protocolo da
Amazon S3, trocar de servidor no futuro é só mudar o S3_ENDPOINT_URL no .env.
"""

import uuid
from datetime import UTC, datetime

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

from app.core.config import settings

EXTENSOES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


class ObjetoNaoEncontrado(Exception):
    pass


class ArmazenamentoRepository:
    def __init__(self):
        self.bucket = settings.S3_BUCKET
        self.cliente = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.RUSTFS_ACCESS_KEY,
            aws_secret_access_key=settings.RUSTFS_SECRET_KEY,
            region_name=settings.S3_REGIAO,
            config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
        )

    def garantir_bucket(self) -> None:
        """Cria o bucket se ele ainda não existir. Chamado quando a API sobe,
        para ninguém da equipe precisar criar o bucket na mão."""
        try:
            self.cliente.head_bucket(Bucket=self.bucket)
        except ClientError as e:
            if e.response["Error"]["Code"] in ("404", "NoSuchBucket", "NotFound"):
                self.cliente.create_bucket(Bucket=self.bucket)
            else:
                raise

    @staticmethod
    def gerar_chave(usuario_id: int, content_type: str) -> str:
        """Chave única e organizada por usuário e mês. O uuid evita colisão de nomes
        (duas fotos chamadas IMG_001.jpg não se sobrescrevem)."""
        agora = datetime.now(UTC)
        extensao = EXTENSOES.get(content_type, "bin")
        return f"imagens/{usuario_id}/{agora:%Y/%m}/{uuid.uuid4().hex}.{extensao}"

    def salvar(self, conteudo: bytes, chave: str, content_type: str) -> str:
        """Envia o arquivo e devolve a chave, é ela que vai para imagens.arquivo_url."""
        self.cliente.put_object(Bucket=self.bucket, Key=chave, Body=conteudo, ContentType=content_type)
        return chave

    def obter(self, chave: str) -> tuple[bytes, str]:
        """Devolve (conteúdo, content_type). Usado pelo endpoint que entrega a imagem
        ao usuário depois de conferir o token (o bucket é privado)."""
        try:
            resposta = self.cliente.get_object(Bucket=self.bucket, Key=chave)
        except ClientError as e:
            if e.response["Error"]["Code"] in ("NoSuchKey", "404"):
                raise ObjetoNaoEncontrado(chave) from e
            raise
        return resposta["Body"].read(), resposta.get("ContentType", "application/octet-stream")

    def remover(self, chave: str) -> None:
        self.cliente.delete_object(Bucket=self.bucket, Key=chave)

    def esta_disponivel(self) -> bool:
        """Para o /health: o servidor responde e o bucket existe?"""
        try:
            self.cliente.head_bucket(Bucket=self.bucket)
            return True
        except Exception:
            return False