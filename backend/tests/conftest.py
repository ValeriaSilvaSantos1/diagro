"""Banco e bucket próprios dos testes, para nunca tocar nos dados de desenvolvimento.

As variáveis precisam estar no ambiente antes de qualquer import de `app`, porque o
`settings` é montado uma vez só, quando app.core.config é importado. Variável de ambiente
tem prioridade sobre o .env, então o resto da configuração continua vindo de lá.
"""

import os
from pathlib import Path

os.environ["POSTGRES_DB"] = os.environ.get("POSTGRES_DB_TESTE", "diagro_teste")
os.environ["S3_BUCKET"] = os.environ.get("S3_BUCKET_TESTE", "diagro-imagens-teste")
os.environ["MONGO_DB"] = os.environ.get("MONGO_DB_TESTE", "diagro_teste")

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text

from app.core.config import settings

BACKEND_DIR = Path(__file__).resolve().parent.parent


def url_do_banco(nome: str) -> str:
    return settings.DATABASE_URL.rsplit("/", 1)[0] + f"/{nome}"


@pytest.fixture(scope="session", autouse=True)
def banco_de_teste():
    """Recria o banco de teste do zero a cada rodada. O nome precisa terminar em _teste:
    é a trava que impede um DROP DATABASE no banco de desenvolvimento."""
    nome = settings.POSTGRES_DB
    assert nome.endswith("_teste"), f"banco de teste precisa terminar em _teste, veio {nome!r}"

    admin = create_engine(url_do_banco("postgres"), isolation_level="AUTOCOMMIT")
    with admin.connect() as conexao:
        conexao.execute(text(f'DROP DATABASE IF EXISTS "{nome}" WITH (FORCE)'))
        conexao.execute(text(f'CREATE DATABASE "{nome}"'))
    admin.dispose()
    yield nome


@pytest.fixture(scope="session")
def alembic_cfg() -> Config:
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "migrations"))
    return cfg


@pytest.fixture(scope="session")
def engine(banco_de_teste):
    engine = create_engine(settings.DATABASE_URL)
    yield engine
    engine.dispose()


@pytest.fixture(scope="session")
def banco_migrado(alembic_cfg, engine):
    command.upgrade(alembic_cfg, "head")
    return engine
