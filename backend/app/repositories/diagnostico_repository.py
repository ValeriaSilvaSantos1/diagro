from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.catalogo import Cultura, DoencaCatalogo
from app.models.diagnostico import Diagnostico, Imagem


class DiagnosticoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar(self, usuario_id: int) -> list[tuple[Diagnostico, Imagem, str | None, str | None, str | None, str | None]]:
        query = (
            select(
                Diagnostico, Imagem, Cultura.nome, DoencaCatalogo.nome_comum,
                DoencaCatalogo.tratamento_recomendado, DoencaCatalogo.tipo,
            )
            .join(Imagem, Imagem.id == Diagnostico.imagem_id)
            .outerjoin(DoencaCatalogo, DoencaCatalogo.id == Diagnostico.doenca_id)
            .outerjoin(Cultura, Cultura.id == DoencaCatalogo.cultura_id)
            .where(Diagnostico.usuario_id == usuario_id)
            .order_by(Diagnostico.criado_em.desc())
        )
        return list(self.db.execute(query).all())

    def buscar(self, usuario_id: int, diagnostico_id: int):
        query = (
            select(
                Diagnostico, Imagem, Cultura.nome, DoencaCatalogo.nome_comum,
                DoencaCatalogo.tratamento_recomendado, DoencaCatalogo.tipo,
            )
            .join(Imagem, Imagem.id == Diagnostico.imagem_id)
            .outerjoin(DoencaCatalogo, DoencaCatalogo.id == Diagnostico.doenca_id)
            .outerjoin(Cultura, Cultura.id == DoencaCatalogo.cultura_id)
            .where(Diagnostico.usuario_id == usuario_id, Diagnostico.id == diagnostico_id)
        )
        return self.db.execute(query).first()

    def criar_imagem(self, usuario_id: int, chave: str) -> Imagem:
        imagem = Imagem(usuario_id=usuario_id, arquivo_url=chave)
        self.db.add(imagem)
        self.db.flush()
        return imagem

    def criar_diagnostico(self, usuario_id: int, imagem_id: int, observacoes: str | None) -> Diagnostico:
        diagnostico = Diagnostico(
            usuario_id=usuario_id,
            imagem_id=imagem_id,
            modelo_versao="aguardando-modelo",
            status="pendente",
            observacoes=observacoes,
        )
        self.db.add(diagnostico)
        self.db.commit()
        self.db.refresh(diagnostico)
        return diagnostico

    def id_da_doenca(self, label_modelo: str) -> int | None:
        return self.db.scalar(select(DoencaCatalogo.id).where(DoencaCatalogo.label_modelo == label_modelo))

    def registrar_resultado(
        self,
        diagnostico: Diagnostico,
        *,
        status: str,
        modelo_versao: str,
        confianca: float | None,
        doenca_id: int | None,
        inferencia_id: str | None,
    ) -> None:
        diagnostico.status = status
        diagnostico.modelo_versao = modelo_versao
        diagnostico.confianca = confianca
        diagnostico.doenca_id = doenca_id
        diagnostico.inferencia_id = inferencia_id
        self.db.commit()
        self.db.refresh(diagnostico)
