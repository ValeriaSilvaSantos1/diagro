"""Conexão da API com o PostgreSQL (SQLAlchemy).

- engine:        a "porta" de conexão com o banco, criada uma vez só.
- SessionLocal:  fábrica de sessões. Cada requisição ganha a sua sessão.
- Base:          classe-mãe dos models (cada model = uma tabela).
- get_db:        dependência do FastAPI que abre a sessão no início da
                 requisição e fecha no final, mesmo se der erro.
"""

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()