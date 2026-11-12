"""Conexão da API com o MongoDB (PyMongo, síncrono, como o resto da API).

- get_mongo_db(): o banco "diagro" do MongoDB, pronto para usar.
- ping_mongo():   para o /health — o MongoDB responde?

O MongoClient é criado UMA vez e reaproveitado (lru_cache): ele mantém um
conjunto de conexões abertas e é seguro para usar em várias requisições ao
mesmo tempo. Criar um cliente por requisição seria lento e esgotaria conexões.
"""

from functools import lru_cache

from pymongo import MongoClient
from pymongo.database import Database

from app.core.config import settings


@lru_cache
def get_client() -> MongoClient:
    # serverSelectionTimeoutMS: se o Mongo estiver fora do ar, desiste em 3 s
    # (o padrão é 30 s, o que travaria a requisição e o /health).
    return MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=3000)


def get_mongo_db() -> Database:
    return get_client()[settings.MONGO_DB]


def ping_mongo() -> bool:
    try:
        get_client().admin.command("ping")
        return True
    except Exception:
        return False