"""Coluna tipo no catálogo: doença, praga ou folha sadia (T.1 a T.3, aprovados em 12/11)."""

import pytest
from alembic import command
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

ESPERADO = {
    "normal": "sadia",
    "hispa": "praga",
    "dead_heart": "praga",
    "bacterial_leaf_blight": "doenca",
    "bacterial_leaf_streak": "doenca",
    "bacterial_panicle_blight": "doenca",
    "blast": "doenca",
    "brown_spot": "doenca",
    "downy_mildew": "doenca",
    "tungro": "doenca",
}


def tipos(engine) -> dict[str, str]:
    with engine.connect() as conexao:
        return dict(conexao.execute(text("SELECT label_modelo, tipo FROM doencas_catalogo")).all())


def test_t_1_cada_classe_tem_o_seu_tipo(banco_migrado):
    assert tipos(banco_migrado) == ESPERADO


def test_t_2_tipo_fora_da_lista_e_recusado(banco_migrado):
    with banco_migrado.connect() as conexao:
        transacao = conexao.begin()
        with pytest.raises(IntegrityError):
            conexao.execute(text("UPDATE doencas_catalogo SET tipo = 'fungo' WHERE label_modelo = 'blast'"))
        transacao.rollback()


def test_t_3_downgrade_remove_a_coluna_e_upgrade_recria_com_os_mesmos_valores(alembic_cfg, banco_migrado):
    command.downgrade(alembic_cfg, "0005")
    with banco_migrado.connect() as conexao:
        colunas = conexao.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name = 'doencas_catalogo'")
        ).scalars().all()
    assert "tipo" not in colunas

    command.upgrade(alembic_cfg, "head")

    assert tipos(banco_migrado) == ESPERADO
