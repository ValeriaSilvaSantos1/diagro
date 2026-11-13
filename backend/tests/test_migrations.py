"""Etapa 0 do plano de testes: as migrations sobem e descem num banco vazio (0.1 e 0.2)."""

from alembic import command
from sqlalchemy import text

TABELAS_DA_APLICACAO = {"usuarios", "culturas", "imagens", "doencas_catalogo", "diagnosticos"}


def tabelas(engine) -> set[str]:
    with engine.connect() as conexao:
        linhas = conexao.execute(
            text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public' AND table_type = 'BASE TABLE' "
                "AND table_name <> 'alembic_version'"
            )
        )
        return {linha[0] for linha in linhas}


def test_0_1_upgrade_head_cria_as_cinco_tabelas(alembic_cfg, engine):
    command.upgrade(alembic_cfg, "head")

    assert tabelas(engine) == TABELAS_DA_APLICACAO


def test_0_2_downgrade_base_remove_todas_as_tabelas(alembic_cfg, engine):
    command.upgrade(alembic_cfg, "head")
    try:
        command.downgrade(alembic_cfg, "base")

        assert tabelas(engine) == set()
    finally:
        command.upgrade(alembic_cfg, "head")
