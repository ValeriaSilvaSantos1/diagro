import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, create_engine

from app.controllers import analises, auth, culturas
from app.core.config import settings
from app.core.mongo import ping_mongo
from app.repositories.armazenamento_repository import ArmazenamentoRepository
from app.services.classificador_service import ClassificadorService

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Roda uma vez quando a API sobe: carrega o modelo de MODELO_DIR e garante que o bucket das
    imagens existe no RustFS. MODELO_DIR apontando para uma pasta errada impede a subida; sem
    MODELO_DIR a API sobe sem modelo. Se o RustFS estiver fora do ar, a API sobe mesmo assim e o
    /health mostra o problema.
    """
    app.state.classificador = ClassificadorService.carregar(Path(settings.MODELO_DIR)) if settings.MODELO_DIR else None
    if app.state.classificador is None:
        logger.warning("MODELO_DIR não definido: a API sobe sem modelo.")
    try:
        ArmazenamentoRepository().garantir_bucket()
        logger.info("Bucket '%s' pronto no RustFS.", settings.S3_BUCKET)
    except Exception as e:
        logger.warning("Não foi possível preparar o bucket no RustFS: %s", e)
    yield


app = FastAPI(
    title="Diagro API",
    description="API de Detecção de Doenças em Plantas via Imagem",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(culturas.router)
app.include_router(analises.router)
app.include_router(analises.imagens_router)


@app.get("/health", tags=["Health Check"])
def health_check():
    """
    Verifica a saúde da API e o estado das conexões com o PostgreSQL, o MongoDB e o RustFS.
    """
    health_status = {
        "status": "ok",
        "postgres": "desconhecido",
        "mongodb": "desconhecido",
        "rustfs": "desconhecido",
        "modelo": "não carregado",
    }

    # Teste de conexão com o PostgreSQL
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        health_status["postgres"] = "conectado"
    except Exception as e:
        health_status["postgres"] = f"erro: {str(e)}"
        health_status["status"] = "alerta"

    # Teste de conexão / configuração com o MongoDB
    if ping_mongo():
        health_status["mongodb"] = "conectado"
    else:
        health_status["mongodb"] = "erro: MongoDB fora do ar ou usuário/senha incorretos"
        health_status["status"] = "alerta"

    # Teste de conexão com o RustFS (o servidor responde e o bucket existe?)
    if ArmazenamentoRepository().esta_disponivel():
        health_status["rustfs"] = "conectado"
    else:
        health_status["rustfs"] = f"erro: RustFS fora do ar ou bucket '{settings.S3_BUCKET}' inexistente"
        health_status["status"] = "alerta"

    classificador = getattr(app.state, "classificador", None)
    if classificador is not None:
        health_status["modelo"] = classificador.modelo_versao

    return health_status