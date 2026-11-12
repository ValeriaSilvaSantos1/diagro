"""Repository da coleção `inferencias` no MongoDB: gravar, ler e a volta para o PostgreSQL.

Usa o banco "diagro_teste" do Mongo (definido no conftest), que é limpo antes de cada teste.
"""

import pytest

from app.core.mongo import get_mongo_db
from app.repositories.inferencia_repository import InferenciaRepository


@pytest.fixture
def repo():
    get_mongo_db()["inferencias"].delete_many({})
    return InferenciaRepository()


def documento(diagnostico_id: int = 1) -> dict:
    return {
        "diagnostico_id": diagnostico_id,
        "imagem_id": 10,
        "modelo_versao": "efficientnet_b0-teste",
        "tipo_tarefa": "classificacao",
        "resultado": {"probabilidades": {"blast": 0.91, "normal": 0.09}},
    }


def test_inserir_devolve_id_de_24_caracteres_e_grava_a_data(repo):
    inferencia_id = repo.inserir(documento())

    assert len(inferencia_id) == 24  # o tamanho de diagnosticos.inferencia_id CHAR(24)
    salvo = repo.obter(inferencia_id)
    assert salvo["_id"] == inferencia_id
    assert salvo["resultado"]["probabilidades"]["blast"] == 0.91
    assert "criado_em" in salvo


def test_obter_por_diagnostico_faz_o_caminho_inverso(repo):
    inferencia_id = repo.inserir(documento(diagnostico_id=42))

    assert repo.obter_por_diagnostico(42)["_id"] == inferencia_id
    assert repo.obter_por_diagnostico(999) is None


def test_id_invalido_ou_inexistente_devolve_none(repo):
    assert repo.obter("nao-e-um-object-id") is None
    assert repo.obter("0" * 24) is None