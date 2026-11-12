"""Etapa 5 do plano de testes, contra o resultado de um treino de verdade (5.3 e 5.6 a 5.10).

Roda só no treino.yml. DIAGRO_DADOS aponta para o dataset preparado e DIAGRO_SAIDA para a pasta
que o treino gravou.
"""

import json
import os
from pathlib import Path

import pytest

from diagro_ml.calibracao import calibrar_limiar
from diagro_ml.dados import dividir
from diagro_ml.indice import Indice

DADOS = Path(os.environ["DIAGRO_DADOS"])
SAIDA = Path(os.environ["DIAGRO_SAIDA"])
CLASSES = json.loads((Path(__file__).resolve().parents[1] / "classes.json").read_text())


@pytest.fixture(scope="module")
def metricas():
    return json.loads((SAIDA / "metricas.json").read_text())


def test_5_3_classes_iguais_as_pastas_do_dataset():
    assert sorted(p.name for p in DADOS.iterdir() if p.is_dir()) == CLASSES


def test_5_6_macro_f1_no_teste_interno(metricas):
    assert metricas["teste"]["macro_f1"] >= 0.90


def test_5_7_limiar_gravado_e_o_da_validacao(metricas):
    validacao = json.loads((SAIDA / "validacao.json").read_text())

    assert metricas["limiar"] == calibrar_limiar(validacao["confiancas"], validacao["acertos"], meta=0.95)


def test_5_8_teste_externo_reportado_com_intervalo(metricas):
    externo = metricas["externo"]

    assert externo["n"] > 0
    assert externo["ic95"][0] <= externo["macro_f1"] <= externo["ic95"][1]


def test_5_9_indice_com_todas_as_imagens_de_treino_e_corte_gravado(metricas):
    indice = Indice.carregar(SAIDA / "indice.npz")

    assert len(indice.vetores) == len(indice.classes) == len(dividir(DADOS)["treino"])
    assert metricas["corte"] > 0


def test_5_10_poucas_fotos_do_teste_interno_fora_do_padrao(metricas):
    assert metricas["teste"]["fora_do_padrao"] <= 0.07
