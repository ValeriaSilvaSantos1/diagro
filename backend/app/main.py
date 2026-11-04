from fastapi import FastAPI
from sqlalchemy import text, create_engine
from app.core.config import settings

app = FastAPI(
    title="Diagro API",
    description="API de Detecção de Doenças em Plantas via Imagem",
    version="1.0.0"
)

@app.get("/health", tags=["Health Check"])
def health_check():
    """
    Verifica a saúde da API e o estado das conexões com o PostgreSQL e MongoDB.
    """
    health_status = {
        "status": "ok",
        "postgres": "desconhecido",
        "mongodb": "desconhecido"
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

    return health_status