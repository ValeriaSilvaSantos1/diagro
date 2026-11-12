from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse

from app.core.deps import Db, UsuarioAtual
from app.repositories.armazenamento_repository import ArmazenamentoRepository, ObjetoNaoEncontrado
from app.repositories.diagnostico_repository import DiagnosticoRepository
from app.schemas.diagnostico import DiagnosticoOut

router = APIRouter(prefix="/analises", tags=["Análises"])
imagens_router = APIRouter(prefix="/imagens", tags=["Imagens"])


def _out(row) -> DiagnosticoOut:
    diagnostico, imagem, cultura, nome_doenca, tratamento = row
    return DiagnosticoOut(
        id=diagnostico.id,
        imagem_id=diagnostico.imagem_id,
        doenca_id=diagnostico.doenca_id,
        modelo_versao=diagnostico.modelo_versao,
        confianca=float(diagnostico.confianca) if diagnostico.confianca is not None else None,
        status=diagnostico.status,
        criado_em=diagnostico.criado_em,
        arquivo_url=f"/imagens/{imagem.id}",
        cultura=cultura,
        nome_doenca=nome_doenca,
        tratamento_recomendado=tratamento,
        observacoes=diagnostico.observacoes,
    )


@router.get("", response_model=list[DiagnosticoOut])
def listar(usuario: UsuarioAtual, db: Db):
    return [_out(row) for row in DiagnosticoRepository(db).listar(usuario.id)]


@router.get("/{diagnostico_id}", response_model=DiagnosticoOut)
def obter(diagnostico_id: int, usuario: UsuarioAtual, db: Db):
    row = DiagnosticoRepository(db).buscar(usuario.id, diagnostico_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Análise não encontrada")
    return _out(row)


@router.post("", response_model=DiagnosticoOut, status_code=status.HTTP_201_CREATED)
def criar(
    usuario: UsuarioAtual,
    db: Db,
    arquivo: UploadFile = File(...),
    observacoes: str | None = Form(default=None),
):
    if arquivo.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Envie uma imagem JPEG, PNG ou WEBP")
    conteudo = arquivo.file.read()
    armazenamento = ArmazenamentoRepository()
    chave = armazenamento.gerar_chave(usuario.id, arquivo.content_type)
    armazenamento.salvar(conteudo, chave, arquivo.content_type)
    repositorio = DiagnosticoRepository(db)
    imagem = repositorio.criar_imagem(usuario.id, chave)
    diagnostico = repositorio.criar_diagnostico(usuario.id, imagem.id, observacoes)
    row = repositorio.buscar(usuario.id, diagnostico.id)
    return _out(row)


@imagens_router.get("/{imagem_id}", include_in_schema=False)
def obter_imagem(imagem_id: int, usuario: UsuarioAtual, db: Db):
    from app.models.diagnostico import Imagem

    imagem = db.get(Imagem, imagem_id)
    if imagem is None or imagem.usuario_id != usuario.id:
        raise HTTPException(status_code=404, detail="Imagem não encontrada")
    try:
        conteudo, content_type = ArmazenamentoRepository().obter(imagem.arquivo_url)
    except ObjetoNaoEncontrado:
        raise HTTPException(status_code=404, detail="Imagem não encontrada") from None
    return StreamingResponse(iter([conteudo]), media_type=content_type)
