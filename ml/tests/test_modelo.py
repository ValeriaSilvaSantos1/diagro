"""Etapa 5 do plano de testes: saída do prever (5.4 e 5.5), com uma rede minúscula no lugar da real."""

import pytest
import torch
from PIL import Image

from diagro_ml.modelo import Classificador

CLASSES = ["blast", "normal", "tungro"]


@pytest.fixture
def classificador():
    torch.manual_seed(0)
    rede = torch.nn.Sequential(
        torch.nn.Conv2d(3, 4, 3), torch.nn.AdaptiveAvgPool2d(1), torch.nn.Flatten(), torch.nn.Linear(4, len(CLASSES))
    )
    return Classificador(rede, CLASSES)


@pytest.fixture
def imagem():
    return Image.new("RGB", (300, 400), (40, 120, 30))


def test_5_4_probabilidades_de_todas_as_classes_somando_1(classificador, imagem):
    probabilidades = classificador.prever(imagem)

    assert list(probabilidades) == CLASSES
    assert sum(probabilidades.values()) == pytest.approx(1, abs=1e-6)


def test_5_5_mesma_imagem_mesma_saida(classificador, imagem):
    assert classificador.prever(imagem) == classificador.prever(imagem)
