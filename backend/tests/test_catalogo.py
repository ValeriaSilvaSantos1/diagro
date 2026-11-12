"""Etapa 2 do plano de testes: o catálogo do arroz tem as classes do modelo (2.1 a 2.3)."""

import json
from pathlib import Path

from sqlalchemy import text

CLASSES = json.loads((Path(__file__).resolve().parents[2] / "ml" / "classes.json").read_text())


def catalogo_do_arroz(engine):
    with engine.connect() as conexao:
        return conexao.execute(
            text(
                "SELECT d.label_modelo, d.nome_comum FROM doencas_catalogo d "
                "JOIN culturas c ON c.id = d.cultura_id WHERE c.nome = 'arroz'"
            )
        ).all()


def test_2_1_catalogo_tem_uma_linha_por_classe(banco_migrado):
    assert len(catalogo_do_arroz(banco_migrado)) == len(CLASSES) == 10


def test_2_2_labels_iguais_as_classes_do_modelo(banco_migrado):
    assert {label for label, _ in catalogo_do_arroz(banco_migrado)} == set(CLASSES)


def test_2_3_toda_classe_tem_nome_em_portugues(banco_migrado):
    assert all(nome.strip() for _, nome in catalogo_do_arroz(banco_migrado))
