import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text, create_engine

from app.core.config import settings
from app.repositories.armazenamento_repository import ArmazenamentoRepository

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Roda uma vez quando a API sobe: garante que o bucket das imagens existe no RustFS.
    Se o RustFS estiver fora do ar, a API sobe mesmo assim e o /health mostra o problema.
    """
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


@app.get("/health", tags=["Health Check"])
def health_check():
    """
    Verifica a saúde da API e o estado das conexões com o PostgreSQL, o MongoDB e o RustFS.
    """
    health_status = {
        "status": "ok",
        "postgres": "desconhecido",
        "mongodb": "desconhecido",
        "rustfs": "desconhecido"
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
    try:
        # Aqui validamos se a URL do Mongo foi montada corretamente
        if settings.MONGODB_URL:
            health_status["mongodb"] = "configurado"
        else:
            health_status["mongodb"] = "não configurado"
    except Exception as e:
        health_status["mongodb"] = f"erro: {str(e)}"

    # Teste de conexão com o RustFS (o servidor responde e o bucket existe?)
    if ArmazenamentoRepository().esta_disponivel():
        health_status["rustfs"] = "conectado"
    else:
        health_status["rustfs"] = f"erro: RustFS fora do ar ou bucket '{settings.S3_BUCKET}' inexistente"
        health_status["status"] = "alerta"

    return health_status