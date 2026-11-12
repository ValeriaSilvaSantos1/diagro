from datetime import datetime

from sqlalchemy import BigInteger, CheckConstraint, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Imagem(Base):
    __tablename__ = "imagens"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"))
    arquivo_url: Mapped[str] = mapped_column(String(255), unique=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Diagnostico(Base):
    __tablename__ = "diagnosticos"
    __table_args__ = (
        CheckConstraint("status IN ('pendente', 'processando', 'concluido', 'inconclusivo', 'erro')"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"))
    imagem_id: Mapped[int] = mapped_column(ForeignKey("imagens.id", ondelete="CASCADE"))
    doenca_id: Mapped[int | None] = mapped_column(ForeignKey("doencas_catalogo.id"))
    modelo_versao: Mapped[str] = mapped_column(String(80))
    confianca: Mapped[float | None] = mapped_column(Numeric(5, 4))
    status: Mapped[str] = mapped_column(String(20), default="pendente")
    inferencia_id: Mapped[str | None] = mapped_column(String(24))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    observacoes: Mapped[str | None] = mapped_column(Text)
