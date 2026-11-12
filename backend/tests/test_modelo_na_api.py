"""Modelo carregado na subida da API a partir de MODELO_DIR (M.1 a M.3, aprovados em 12/11)."""

import hashlib
import json
from pathlib import Path

import numpy as np
import pytest
import torch
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from diagro_ml.indice import Indice
from diagro_ml.modelo import criar_rede

CLASSES = json.loads((Path(__file__).resolve().parents[2] / "ml" / "classes.json").read_text())


@pytest.fixture
def release(tmp_path):
    torch.save(criar_rede(len(CLASSES), pretreinada=False).state_dict(), tmp_path / "pesos.pt")
    (tmp_path / "classes.json").write_text(json.dumps(CLASSES))
    (tmp_path / "metricas.json").write_text(json.dumps({"arquitetura": "efficientnet_b0", "limiar": 0.6, "corte": 0.14}))
    Indice(np.eye(3, dtype=np.float32)[:2], ["blast", "tungro"], ["blast/1.jpg", "tungro/1.jpg"]).salvar(tmp_path / "indice.npz")
    return tmp_path


def test_m1_health_mostra_a_versao_do_modelo_carregado(banco_migrado, release, monkeypatch):
    monkeypatch.setattr(settings, "MODELO_DIR", str(release))
    versao = "efficientnet_b0-" + hashlib.sha256((release / "pesos.pt").read_bytes()).hexdigest()[:12]

    with TestClient(app) as cliente:
        corpo = cliente.get("/health").json()

    assert corpo["modelo"] == versao


def test_m2_sem_modelo_dir_a_api_sobe_sem_modelo(banco_migrado, monkeypatch):
    monkeypatch.setattr(settings, "MODELO_DIR", None)

    with TestClient(app) as cliente:
        corpo = cliente.get("/health").json()

    assert corpo["modelo"] == "não carregado"
    assert corpo["status"] == "ok"


def test_m3_modelo_dir_sem_pesos_impede_a_subida(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "MODELO_DIR", str(tmp_path))

    with pytest.raises(FileNotFoundError):
        with TestClient(app):
            pass
