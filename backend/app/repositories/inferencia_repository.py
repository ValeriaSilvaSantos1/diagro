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
from pymongo.errors import CollectionInvalid

from app.core.mongo import get_mongo_db

VALIDADOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["diagnostico_id", "modelo_versao", "tipo_tarefa", "resultado", "criado_em"],
        "properties": {
            "diagnostico_id": {"bsonType": ["int", "long"], "description": "diagnosticos.id no PostgreSQL"},
            "imagem_id": {"bsonType": ["int", "long"]},
            "modelo_versao": {"bsonType": "string", "description": "ex.: efficientnet_b0-1a2b3c4d5e6f"},
            "tipo_tarefa": {"enum": ["classificacao", "deteccao", "segmentacao"]},
            "resultado": {"bsonType": "object", "description": "formato livre, depende do tipo_tarefa"},
            "tempo_inferencia_ms": {"bsonType": ["double", "int", "long"]},
            "criado_em": {"bsonType": "date"},
        },
    }
}


class InferenciaRepository:
    def __init__(self, db: Database | None = None):
        # Recebe o banco de fora (útil em testes); se não vier, usa o da aplicação.
        self.colecao = (db if db is not None else get_mongo_db())["inferencias"]

    def garantir_colecao(self) -> None:
        """Cria a coleção com o validador e os índices, ou aplica os dois numa coleção que já existia
        sem eles. Chamado quando a API sobe e pode rodar quantas vezes for preciso."""
        banco = self.colecao.database
        try:
            banco.create_collection(self.colecao.name, validator=VALIDADOR, validationLevel="strict")
        except CollectionInvalid:
            banco.command("collMod", self.colecao.name, validator=VALIDADOR, validationLevel="strict")
        # Um diagnóstico tem no máximo uma inferência.
        self.colecao.create_index("diagnostico_id", unique=True, name="ux_inferencias_diagnostico")
        # Comparar versões do modelo ao longo do tempo.
        self.colecao.create_index([("modelo_versao", 1), ("criado_em", -1)], name="ix_inferencias_modelo_data")

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