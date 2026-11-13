"""Etapa 5 do plano de testes: divisão do dataset em treino, validação e teste (5.1 e 5.2) e o
agrupamento de cópias giradas ou espelhadas, que o Sethy tem aos milhares (D.1 a D.4 e R.1, aprovados em 12/11)."""

import hashlib
import shutil

import numpy as np
import pytest
from PIL import Image

from diagro_ml.dados import agrupar, assinatura, distancia_perceptual, dividir, retirar_quase_iguais


def textura(semente):
    ruido = np.random.default_rng(semente).integers(0, 256, (8, 8, 3), dtype=np.uint8)
    return Image.fromarray(ruido).resize((64, 64), Image.BICUBIC)


@pytest.fixture
def pasta(tmp_path):
    for c, classe in enumerate(["blast", "normal", "tungro"]):
        (tmp_path / classe).mkdir()
        for i in range(20):
            textura(c * 100 + i).save(tmp_path / classe / f"{i}.jpg", quality=95)
        for i in range(5):
            shutil.copy(tmp_path / classe / f"{i}.jpg", tmp_path / classe / f"{i}_copia.jpg")
        for i in range(3):
            original = Image.open(tmp_path / classe / f"{i}.jpg")
            original.rotate(90, expand=True).save(tmp_path / classe / f"{i}_girada.jpg", quality=95)
            original.transpose(Image.FLIP_LEFT_RIGHT).save(tmp_path / classe / f"{i}_espelhada.jpg", quality=95)
    return tmp_path


def test_5_1_mesma_semente_mesma_divisao(pasta):
    assert dividir(pasta, semente=42) == dividir(pasta, semente=42)


def test_5_2_nenhum_arquivo_identico_em_duas_partes(pasta):
    partes = dividir(pasta, semente=42)
    hashes = {
        nome: {hashlib.sha256((pasta / caminho).read_bytes()).hexdigest() for caminho, *_ in itens}
        for nome, itens in partes.items()
    }

    assert sum(len(itens) for itens in partes.values()) == 93
    assert not hashes["treino"] & hashes["validacao"]
    assert not hashes["treino"] & hashes["teste"]
    assert not hashes["validacao"] & hashes["teste"]


def test_d1_girada_e_espelhada_tem_distancia_zero():
    foto = textura(1)

    original = assinatura(foto)

    assert distancia_perceptual(original, assinatura(foto.rotate(90, expand=True))) == 0
    assert distancia_perceptual(original, assinatura(foto.transpose(Image.FLIP_LEFT_RIGHT))) == 0


def test_d2_fotos_diferentes_ficam_longe():
    assert distancia_perceptual(assinatura(textura(1)), assinatura(textura(2))) >= 64


def test_d3_original_girada_e_espelhada_caem_na_mesma_parte(pasta):
    parte_de = {caminho: nome for nome, itens in dividir(pasta, semente=42).items() for caminho, *_ in itens}

    for classe in ["blast", "normal", "tungro"]:
        for i in range(3):
            assert parte_de[f"{classe}/{i}.jpg"] == parte_de[f"{classe}/{i}_girada.jpg"] == parte_de[f"{classe}/{i}_espelhada.jpg"]


def test_d4_vinte_fotos_diferentes_viram_vinte_grupos(pasta):
    grupos = agrupar(pasta)

    assert {classe: len(lotes) for classe, lotes in grupos.items()} == {"blast": 20, "normal": 20, "tungro": 20}


def test_r1_tira_do_teste_as_copias_de_fotos_do_treino(tmp_path):
    (tmp_path / "treino" / "blast").mkdir(parents=True)
    (tmp_path / "teste" / "blast").mkdir(parents=True)
    textura(1).save(tmp_path / "treino" / "blast" / "a.jpg", quality=95)
    original = Image.open(tmp_path / "treino" / "blast" / "a.jpg")
    original.rotate(90, expand=True).save(tmp_path / "teste" / "blast" / "a_girada.jpg", quality=95)
    original.transpose(Image.FLIP_LEFT_RIGHT).save(tmp_path / "teste" / "blast" / "a_espelhada.jpg", quality=95)
    textura(2).save(tmp_path / "teste" / "blast" / "b.jpg", quality=95)

    retiradas = retirar_quase_iguais(tmp_path / "teste", tmp_path / "treino")

    assert sorted(p.name for p in retiradas) == ["a_espelhada.jpg", "a_girada.jpg"]
    assert sorted(p.name for p in (tmp_path / "teste" / "blast").iterdir()) == ["b.jpg"]
