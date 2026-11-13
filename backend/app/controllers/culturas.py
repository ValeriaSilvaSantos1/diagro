from fastapi import APIRouter, HTTPException, status

from app.core.deps import Db
from app.repositories.catalogo_repository import CatalogoRepository
from app.schemas.catalogo import CulturaOut, DoencaOut

router = APIRouter(prefix="/culturas", tags=["Catálogo"])


@router.get("", response_model=list[CulturaOut])
def listar_culturas(db: Db):
    """Culturas que o modelo de identificação atende."""
    return CatalogoRepository(db).listar_culturas()


@router.get("/{nome}/doencas", response_model=list[DoencaOut])
def listar_doencas(nome: str, db: Db):
    """Classes que o modelo reconhece numa cultura, com o texto de manejo de cada uma."""
    repositorio = CatalogoRepository(db)
    cultura = repositorio.buscar_cultura(nome)
    if cultura is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cultura não encontrada")
    return repositorio.listar_doencas(cultura.id)
