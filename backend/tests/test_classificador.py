"""Classificador dentro da API: carrega o modelo do release e aplica o limiar (testes aprovados em 12/11)."""

import json
from pathlib import Path

import pytest
from PIL import Image

from app.services.classificador_service import ClassificadorService, ImagemInvalida

CLASSES = json.loads((Path(__file__).resolve().parents[2] / "ml" / "classes.json").read_text())


class ClassificadorFalso:
    def __init__(self, probabilidades):
        self.classes = list(probabilidades)
        self.probabilidades = probabilidades

    def prever(self, imagem):
        return self.probabilidades


def saida(top1, confianca):
    resto = (1 - confianca) / (len(CLASSES) - 1)
    return {classe: confianca if classe == top1 else resto for classe in CLASSES}


@pytest.fixture
def jpeg(tmp_path):
    caminho = tmp_path / "folha.jpg"
    Image.new("RGB", (64, 64), (40, 120, 30)).save(caminho)
    return caminho.read_bytes()


def test_carrega_classes_e_limiar_do_release(tmp_path):
    torch = pytest.importorskip("torch")
    criar_rede = pytest.importorskip("diagro_ml.modelo").criar_rede

    torch.save(criar_rede(len(CLASSES), pretreinada=False).state_dict(), tmp_path / "pesos.pt")
    (tmp_path / "classes.json").write_text(json.dumps(CLASSES))
    (tmp_path / "metricas.json").write_text(json.dumps({"arquitetura": "efficientnet_b0", "limiar": 0.6}))

    servico = ClassificadorService.carregar(tmp_path)

    assert servico.classificador.classes == CLASSES
    assert servico.limiar == 0.6


def test_confianca_acima_do_limiar_conclui(jpeg):
    servico = ClassificadorService(ClassificadorFalso(saida("blast", 0.90)), limiar=0.60, modelo_versao="teste")

    resultado = servico.classificar(jpeg)

    assert resultado.status == "concluido"
    assert resultado.label == "blast"
    assert resultado.confianca == pytest.approx(0.90)
    assert len(resultado.probabilidades) == 10


def test_confianca_abaixo_do_limiar_e_inconclusivo(jpeg):
    servico = ClassificadorService(ClassificadorFalso(saida("blast", 0.41)), limiar=0.60, modelo_versao="teste")

    resultado = servico.classificar(jpeg)

    assert resultado.status == "inconclusivo"
    assert resultado.label is None
    assert resultado.confianca == pytest.approx(0.41)
    assert len(resultado.probabilidades) == 10


def test_arquivo_que_nao_e_imagem_levanta_erro_proprio():
    servico = ClassificadorService(ClassificadorFalso(saida("blast", 0.90)), limiar=0.60, modelo_versao="teste")

    with pytest.raises(ImagemInvalida):
        servico.classificar(b"isto nao e uma imagem")
