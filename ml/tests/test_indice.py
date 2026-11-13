"""Índice de imagens parecidas: portão de foto fora do padrão e exemplos para o VLM (I.1 a I.4, aprovados em 12/11)."""

import numpy as np
import pytest
import torch
from PIL import Image

from diagro_ml.calibracao import calibrar_corte
from diagro_ml.indice import Indice
from diagro_ml.modelo import TRANSFORMACAO, criar_rede, vetores


def test_i1_distancia_ao_vizinho_mais_proximo():
    indice = Indice(np.eye(2, dtype=np.float32), ["blast", "tungro"], ["blast/1.jpg", "tungro/1.jpg"])

    distancias = indice.distancias(np.array([[1, 0], [1 / np.sqrt(2), 1 / np.sqrt(2)]], dtype=np.float32))

    assert distancias == pytest.approx([0.0, 0.2929], abs=1e-4)


def test_i2_corte_no_percentil_95_da_validacao():
    assert calibrar_corte(np.arange(100) / 100) == pytest.approx(0.9405)


def test_i3_vetores_normalizados():
    torch.manual_seed(0)
    rede = criar_rede(10, pretreinada=False)
    lote = torch.stack([TRANSFORMACAO(Image.new("RGB", (300, 400), cor)) for cor in [(40, 120, 30), (200, 180, 60)]])

    v = vetores(rede, [lote])

    assert v.shape[0] == 2
    assert np.linalg.norm(v, axis=1) == pytest.approx([1, 1], abs=1e-5)


def test_i4_tres_vizinhos_em_ordem_com_classe_e_caminho():
    base = np.array([[1, 0, 0], [0.6, 0.8, 0], [0, 1, 0], [-1, 0, 0]], dtype=np.float32)
    indice = Indice(base, ["blast", "brown_spot", "tungro", "normal"], ["b/1.jpg", "s/1.jpg", "t/1.jpg", "n/1.jpg"])

    vizinhos = indice.vizinhos(np.array([1, 0, 0], dtype=np.float32), n=3)

    assert [v.classe for v in vizinhos] == ["blast", "brown_spot", "tungro"]
    assert [v.caminho for v in vizinhos] == ["b/1.jpg", "s/1.jpg", "t/1.jpg"]
    assert [v.distancia for v in vizinhos] == pytest.approx([0.0, 0.4, 1.0], abs=1e-6)
