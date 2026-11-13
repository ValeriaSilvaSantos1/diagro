"""Grava o resultado do classificador nos dois bancos: a inferência bruta no MongoDB e o
diagnóstico, com o _id dela, no PostgreSQL."""

import logging
from dataclasses import asdict

from pymongo.errors import PyMongoError

from app.models.diagnostico import Diagnostico
from app.repositories.diagnostico_repository import DiagnosticoRepository
from app.repositories.inferencia_repository import InferenciaRepository
from app.services.classificador_service import Resultado

logger = logging.getLogger("uvicorn.error")


class AnaliseService:
    def __init__(self, diagnosticos: DiagnosticoRepository):
        self.diagnosticos = diagnosticos

    def registrar_inferencia(self, diagnostico: Diagnostico, resultado: Resultado, tempo_inferencia_ms: float) -> None:
        """Sem o MongoDB, o diagnóstico fica com status 'erro': a foto já está guardada e o
        usuário vê a análise no histórico, mas nada é concluído sem a inferência gravada."""
        try:
            inferencia_id = InferenciaRepository().inserir(self._documento(diagnostico, resultado, tempo_inferencia_ms))
        except PyMongoError as erro:
            logger.warning("Inferência do diagnóstico %s não gravada no MongoDB: %s", diagnostico.id, erro)
            self.diagnosticos.registrar_resultado(
                diagnostico, status="erro", modelo_versao=resultado.modelo_versao,
                confianca=None, doenca_id=None, inferencia_id=None,
            )
            return

        doenca_id = self.diagnosticos.id_da_doenca(resultado.label) if resultado.label else None
        self.diagnosticos.registrar_resultado(
            diagnostico, status=resultado.status, modelo_versao=resultado.modelo_versao,
            confianca=resultado.confianca, doenca_id=doenca_id, inferencia_id=inferencia_id,
        )

    @staticmethod
    def _documento(diagnostico: Diagnostico, resultado: Resultado, tempo_inferencia_ms: float) -> dict:
        bruto = asdict(resultado)
        modelo_versao = bruto.pop("modelo_versao")
        return {
            "diagnostico_id": diagnostico.id,
            "imagem_id": diagnostico.imagem_id,
            "modelo_versao": modelo_versao,
            "tipo_tarefa": "classificacao",
            "resultado": bruto,
            "tempo_inferencia_ms": tempo_inferencia_ms,
        }
