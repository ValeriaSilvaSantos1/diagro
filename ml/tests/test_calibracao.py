"""Etapa 5 do plano de testes: o limiar sai da validação com meta de 95% de acerto nos aceitos (5.7), e o
corte e o "fora do padrão" contam cada grupo de cópias uma vez (G.1 a G.3, aprovados em 13/11)."""

import numpy as np
import pytest

from diagro_ml.calibracao import calibrar_corte, calibrar_limiar, fracao_fora

CONFIANCAS = [0.9, 0.8, 0.7, 0.6, 0.5]


def test_5_7_menor_limiar_que_mantem_a_meta():
    assert calibrar_limiar(CONFIANCAS, [True, True, True, False, True], meta=0.95) == 0.7


def test_5_7_tudo_certo_aceita_a_menor_confianca():
    assert calibrar_limiar(CONFIANCAS, [True] * 5, meta=0.95) == 0.5


def test_5_7_meta_inalcancavel_interrompe_o_treino():
    with pytest.raises(ValueError):
        calibrar_limiar(CONFIANCAS, [False] * 5, meta=0.95)


def test_g_1_grupo_grande_e_longe_nao_arrasta_o_corte():
    unicas = np.arange(100) / 100
    distancias = np.concatenate([unicas, np.full(100, 2.0)])
    grupos = [f"u{i}" for i in range(100)] + ["copias"] * 100

    assert calibrar_corte(distancias, grupos) == pytest.approx(0.95, abs=0.01)


def test_g_2_sem_copias_o_corte_e_o_percentil_95():
    distancias = np.random.default_rng(0).random(200)

    assert calibrar_corte(distancias, list(range(200))) == pytest.approx(np.percentile(distancias, 95), abs=0.01)


def test_g_3_fora_do_padrao_conta_cada_grupo_uma_vez():
    distancias = np.array([0.9, 0.9, 0.9, 0.9, 0.1, 0.1, 0.1, 0.1])
    grupos = ["copias"] * 4 + ["a", "b", "c", "d"]

    assert fracao_fora(distancias, grupos, corte=0.5) == pytest.approx(0.2)
