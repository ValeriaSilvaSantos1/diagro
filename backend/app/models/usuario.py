from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, DateTime, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Usuario(Base):
    """Espelho, em Python, da tabela `usuarios` criada pela migration 0001.

    Este arquivo NÃO cria a tabela (quem cria é o Alembic). Ele só ensina ao
    SQLAlchemy o formato da tabela, para ler e gravar linhas como objetos.
    """

    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    nome: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(160), unique=True)
    senha_hash: Mapped[str] = mapped_column(String(255))
    # Perfil (migration 0007): dados opcionais da propriedade
    propriedade: Mapped[str | None] = mapped_column(String(120))
    area_propriedade: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    culturas_principais: Mapped[str | None] = mapped_column(String(200))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())