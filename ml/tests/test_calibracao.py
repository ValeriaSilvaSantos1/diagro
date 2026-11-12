"""Etapa 5 do plano de testes: o limiar sai da validação com meta de 95% de acerto nos aceitos (5.7)."""

import pytest

from diagro_ml.calibracao import calibrar_limiar

CONFIANCAS = [0.9, 0.8, 0.7, 0.6, 0.5]


def test_5_7_menor_limiar_que_mantem_a_meta():
    assert calibrar_limiar(CONFIANCAS, [True, True, True, False, True], meta=0.95) == 0.7


def test_5_7_tudo_certo_aceita_a_menor_confianca():
    assert calibrar_limiar(CONFIANCAS, [True] * 5, meta=0.95) == 0.5


def test_5_7_meta_inalcancavel_interrompe_o_treino():
    with pytest.raises(ValueError):
        calibrar_limiar(CONFIANCAS, [False] * 5, meta=0.95)
