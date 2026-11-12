"""Camada Repository — coleção `inferencias` do MongoDB (Relatório AB1, seção 3.2).

Cada documento guarda o resultado BRUTO de uma inferência do modelo de ML.
O formato de `resultado` muda com o tipo de modelo (classificação, detecção,
segmentação), e é exatamente por isso que ele fica no MongoDB e não no PostgreSQL.

O `_id` gerado aqui (um ObjectId) é gravado em diagnosticos.inferencia_id.
"""

from datetime import UTC, datetime

from bson import ObjectId
from bson.errors import InvalidId
from pymongo.database import Database

from app.core.mongo import get_mongo_db


class InferenciaRepository:
    def __init__(self, db: Database | None = None):
        # Recebe o banco de fora (útil em testes); se não vier, usa o da aplicação.
        self.colecao = (db if db is not None else get_mongo_db())["inferencias"]

    def inserir(self, documento: dict) -> str:
        """Grava o documento e devolve o _id como texto (24 caracteres),
        o formato que vai para a coluna diagnosticos.inferencia_id."""
        doc = {**documento, "criado_em": datetime.now(UTC)}
        resultado = self.colecao.insert_one(doc)
        return str(resultado.inserted_id)

    def obter(self, inferencia_id: str) -> dict | None:
        """Busca pelo _id. Devolve None se o id não existir ou for inválido."""
        try:
            doc = self.colecao.find_one({"_id": ObjectId(inferencia_id)})
        except InvalidId:
            return None
        return self._para_json(doc)

    def obter_por_diagnostico(self, diagnostico_id: int) -> dict | None:
        """Caminho inverso (Mongo → Postgres), usado para auditoria e reprocessamento."""
        return self._para_json(self.colecao.find_one({"diagnostico_id": diagnostico_id}))

    @staticmethod
    def _para_json(doc: dict | None) -> dict | None:
        # ObjectId não é um tipo do JSON: convertemos para texto antes de a API responder.
        if doc is not None:
            doc["_id"] = str(doc["_id"])
        return doc