"""Etapa 6 do plano de testes: o catálogo que o front lê da API (6.2), sem exigir login."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def cliente(banco_migrado):
    return TestClient(app)


def test_culturas_lista_so_o_arroz(cliente):
    resposta = cliente.get("/culturas")

    assert resposta.status_code == 200
    assert [cultura["nome"] for cultura in resposta.json()] == ["arroz"]


def test_doencas_do_arroz_tem_as_10_classes_sem_token(cliente):
    resposta = cliente.get("/culturas/arroz/doencas")

    assert resposta.status_code == 200
    doencas = resposta.json()
    assert len(doencas) == 10
    assert all({"label_modelo", "nome_comum", "tratamento_recomendado"} <= doenca.keys() for doenca in doencas)


def test_cultura_inexistente_da_404(cliente):
    assert cliente.get("/culturas/milho/doencas").status_code == 404
