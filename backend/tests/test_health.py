"""Etapa 0 do plano de testes: o /health enxerga o PostgreSQL e o RustFS (0.3 e 0.4)."""

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
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


def test_0_4_health_com_o_rustfs_fora(cliente, monkeypatch):
    # Porta onde nada escuta: o cliente S3 é montado a cada chamada e lê o endpoint daqui.
    monkeypatch.setattr(settings, "S3_ENDPOINT_URL", "http://127.0.0.1:9")

    resposta = cliente.get("/health")

    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["status"] == "alerta"
    assert corpo["rustfs"].startswith("erro:")
    assert corpo["postgres"] == "conectado"
