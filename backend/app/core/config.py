from pathlib import Path
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
ENV_FILE = ROOT_DIR / ".env"

class Settings(BaseSettings):
    # PostgreSQL
    POSTGRES_USER: str
    POSTGRES_PASSWORD: SecretStr
    POSTGRES_DB: str
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432

    # MongoDB
    MONGO_INITDB_ROOT_USERNAME: str | None = None
    MONGO_INITDB_ROOT_PASSWORD: SecretStr | None = None
    MONGO_SERVER: str = "localhost"
    MONGO_PORT: int = 27017
    MONGO_DB: str = "diagro"

    # RustFS
    RUSTFS_ACCESS_KEY: str
    RUSTFS_SECRET_KEY: SecretStr
    S3_ENDPOINT_URL: str = "http://localhost:9000"
    S3_BUCKET: str = "diagro-imagens"
    S3_REGIAO: str = "us-east-1"

    # Autenticação (JWT)
    JWT_SECRET: SecretStr
    JWT_ALGORITMO: str = "HS256"
    JWT_EXPIRA_MINUTOS: int = 30

    # Modelo: pasta com os arquivos de um release do treino (pesos.pt, indice.npz, classes.json, metricas.json)
    MODELO_DIR: str | None = None

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD.get_secret_value()}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def MONGODB_URL(self) -> str:
        if self.MONGO_INITDB_ROOT_USERNAME and self.MONGO_INITDB_ROOT_PASSWORD:
            return f"mongodb://{self.MONGO_INITDB_ROOT_USERNAME}:{self.MONGO_INITDB_ROOT_PASSWORD.get_secret_value()}@{self.MONGO_SERVER}:{self.MONGO_PORT}/"
        return f"mongodb://{self.MONGO_SERVER}:{self.MONGO_PORT}/"

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()