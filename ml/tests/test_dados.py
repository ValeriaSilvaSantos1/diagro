"""Etapa 5 do plano de testes: divisão do dataset em treino, validação e teste (5.1 e 5.2)."""

import hashlib
import shutil

import pytest
from PIL import Image

from diagro_ml.dados import dividir


@pytest.fixture
def pasta(tmp_path):
    for c, classe in enumerate(["blast", "normal", "tungro"]):
        (tmp_path / classe).mkdir()
        for i in range(20):
            Image.new("RGB", (8, 8), (c * 80, i * 10, 0)).save(tmp_path / classe / f"{i}.jpg")
        for i in range(5):
            shutil.copy(tmp_path / classe / f"{i}.jpg", tmp_path / classe / f"{i}_copia.jpg")
    return tmp_path


def test_5_1_mesma_semente_mesma_divisao(pasta):
    assert dividir(pasta, semente=42) == dividir(pasta, semente=42)


def test_5_2_nenhum_arquivo_identico_em_duas_partes(pasta):
    partes = dividir(pasta, semente=42)
    hashes = {
        nome: {hashlib.sha256((pasta / caminho).read_bytes()).hexdigest() for caminho, _ in itens}
        for nome, itens in partes.items()
    }

    assert sum(len(itens) for itens in partes.values()) == 75
    assert not hashes["treino"] & hashes["validacao"]
    assert not hashes["treino"] & hashes["teste"]
    assert not hashes["validacao"] & hashes["teste"]
