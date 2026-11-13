from sqlalchemy import ForeignKey, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Cultura(Base):
    __tablename__ = "culturas"

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    nome: Mapped[str] = mapped_column(String(60), unique=True)


class DoencaCatalogo(Base):
    __tablename__ = "doencas_catalogo"

    id: Mapped[int] = mapped_column(primary_key=True)
    cultura_id: Mapped[int] = mapped_column(ForeignKey("culturas.id"))
    label_modelo: Mapped[str] = mapped_column(String(80), unique=True)
    nome_comum: Mapped[str] = mapped_column(String(120))
    tratamento_recomendado: Mapped[str | None] = mapped_column(Text)
    tipo: Mapped[str] = mapped_column(String(10))
