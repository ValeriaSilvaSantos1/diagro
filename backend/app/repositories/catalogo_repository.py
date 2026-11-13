from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.catalogo import Cultura, DoencaCatalogo


class CatalogoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_culturas(self) -> list[Cultura]:
        return list(self.db.scalars(select(Cultura).order_by(Cultura.nome)))

    def buscar_cultura(self, nome: str) -> Cultura | None:
        return self.db.scalar(select(Cultura).where(Cultura.nome == nome))

    def listar_doencas(self, cultura_id: int) -> list[DoencaCatalogo]:
        consulta = select(DoencaCatalogo).where(DoencaCatalogo.cultura_id == cultura_id).order_by(DoencaCatalogo.nome_comum)
        return list(self.db.scalars(consulta))
