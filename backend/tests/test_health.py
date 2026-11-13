"""Etapa 0 do plano de testes: o /health enxerga o PostgreSQL, o RustFS e o MongoDB (0.3 a 0.5)."""

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.mongo import get_client
from app.main import app
from app.repositories.armazenamento_repository import ArmazenamentoRepository


@pytest.fixture
def cliente(banco_migrado):
    ArmazenamentoRepository().garantir_bucket()
    return TestClient(app)


def test_0_3_health_com_os_servicos_no_ar(cliente):
    resposta = cliente.get("/health")

    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["status"] == "ok"
    assert corpo["postgres"] == "conectado"
    assert corpo["rustfs"] == "conectado"
    assert corpo["mongodb"] == "conectado"


def test_0_4_health_com_o_rustfs_fora(cliente, monkeypatch):
    # Porta onde nada escuta: o cliente S3 é montado a cada chamada e lê o endpoint daqui.
    monkeypatch.setattr(settings, "S3_ENDPOINT_URL", "http://127.0.0.1:9")

    resposta = cliente.get("/health")

    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["status"] == "alerta"
    assert corpo["rustfs"].startswith("erro:")
    assert corpo["postgres"] == "conectado"


def test_0_5_health_com_o_mongodb_fora(cliente, monkeypatch):
    # Porta onde nada escuta. O cliente do Mongo é criado uma vez só (lru_cache), então
    # é preciso descartá-lo para ele ser recriado com a porta errada, e de novo no fim.
    monkeypatch.setattr(settings, "MONGO_PORT", 9)
    get_client.cache_clear()
    try:
        resposta = cliente.get("/health")
    finally:
        get_client.cache_clear()

    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["status"] == "alerta"
    assert corpo["mongodb"].startswith("erro:")
    assert corpo["postgres"] == "conectado"