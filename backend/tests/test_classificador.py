"""Classificador dentro da API: carrega o modelo do release e decide entre concluído e inconclusivo
pelo limiar de confiança e pelo corte de distância do índice (testes aprovados em 12/11)."""

import json
from pathlib import Path

import numpy as np
import pytest
import torch
from PIL import Image

from app.services.classificador_service import ClassificadorService, ImagemInvalida
from diagro_ml.indice import Indice
from diagro_ml.modelo import criar_rede

CLASSES = json.loads((Path(__file__).resolve().parents[2] / "ml" / "classes.json").read_text())
PERTO, LONGE = np.array([1, 0, 0], dtype=np.float32), np.array([0, 0, 1], dtype=np.float32)


class ClassificadorFalso:
    def __init__(self, probabilidades, vetor):
        self.classes = list(probabilidades)
        self.probabilidades = probabilidades
        self._vetor = vetor

    def prever(self, imagem):
        return self.probabilidades

    def vetor(self, imagem):
        return self._vetor


def saida(top1, confianca):
    resto = (1 - confianca) / (len(CLASSES) - 1)
    return {classe: confianca if classe == top1 else resto for classe in CLASSES}


def indice():
    return Indice(np.eye(3, dtype=np.float32)[:2], ["blast", "tungro"], ["blast/1.jpg", "tungro/1.jpg"])


def servico(probabilidades, vetor):
    return ClassificadorService(
        ClassificadorFalso(probabilidades, vetor), limiar=0.60, indice=indice(), corte=0.14, modelo_versao="teste"
    )


@pytest.fixture
def jpeg(tmp_path):
    caminho = tmp_path / "folha.jpg"
    Image.new("RGB", (64, 64), (40, 120, 30)).save(caminho)
    return caminho.read_bytes()


def test_carrega_classes_limiar_indice_e_corte_do_release(tmp_path):
    torch.save(criar_rede(len(CLASSES), pretreinada=False).state_dict(), tmp_path / "pesos.pt")
    (tmp_path / "classes.json").write_text(json.dumps(CLASSES))
    (tmp_path / "metricas.json").write_text(json.dumps({"arquitetura": "efficientnet_b0", "limiar": 0.6, "corte": 0.14}))
    indice().salvar(tmp_path / "indice.npz")

    carregado = ClassificadorService.carregar(tmp_path)

    assert carregado.classificador.classes == CLASSES
    assert carregado.limiar == 0.6
    assert carregado.corte == 0.14
    assert carregado.indice.classes == ["blast", "tungro"]


def test_a2_perto_do_indice_e_confianca_acima_do_limiar_conclui(jpeg):
    resultado = servico(saida("blast", 0.90), PERTO).classificar(jpeg)

    assert resultado.status == "concluido"
    assert resultado.label == "blast"
    assert resultado.confianca == pytest.approx(0.90)
    assert len(resultado.probabilidades) == 10


def test_confianca_abaixo_do_limiar_e_inconclusivo(jpeg):
    resultado = servico(saida("blast", 0.41), PERTO).classificar(jpeg)

    assert resultado.status == "inconclusivo"
    assert resultado.label is None
    assert resultado.confianca == pytest.approx(0.41)
    assert len(resultado.probabilidades) == 10


def test_a1_longe_do_indice_e_inconclusivo_mesmo_com_confianca_alta(jpeg):
    resultado = servico(saida("blast", 0.99), LONGE).classificar(jpeg)

    assert resultado.status == "inconclusivo"
    assert resultado.label is None
    assert resultado.confianca == pytest.approx(0.99)


@pytest.mark.parametrize(("vetor", "confianca", "status", "distancia"), [
    (PERTO, 0.90, "concluido", 0.0),
    (LONGE, 0.99, "inconclusivo", 1.0),
])
def test_a3_resultado_carrega_distancia_e_vizinhos(jpeg, vetor, confianca, status, distancia):
    resultado = servico(saida("blast", confianca), vetor).classificar(jpeg)

    assert resultado.status == status
    assert resultado.distancia == pytest.approx(distancia, abs=1e-6)
    assert resultado.corte == 0.14
    assert [v.caminho for v in resultado.vizinhos] == ["blast/1.jpg", "tungro/1.jpg"]


def test_arquivo_que_nao_e_imagem_levanta_erro_proprio():
    with pytest.raises(ImagemInvalida):
        servico(saida("blast", 0.90), PERTO).classificar(b"isto nao e uma imagem")
