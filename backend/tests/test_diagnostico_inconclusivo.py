"""Etapa 1 do plano de testes: o status inconclusivo na tabela diagnosticos (1.1 a 1.5)."""

import pytest
from alembic import command
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

INFERENCIA_ID = "a" * 24


def preparar(conexao):
    usuario_id = conexao.execute(
        text("INSERT INTO usuarios (nome, email, senha_hash) VALUES ('Teste', 'teste@diagro.dev', 'x') RETURNING id")
    ).scalar_one()
    imagem_id = conexao.execute(
        text("INSERT INTO imagens (usuario_id, arquivo_url) VALUES (:u, 'imagens/teste.jpg') RETURNING id"),
        {"u": usuario_id},
    ).scalar_one()
    conexao.info["ids"] = {"usuario_id": usuario_id, "imagem_id": imagem_id}


@pytest.fixture
def conexao(banco_migrado):
    with banco_migrado.connect() as conexao:
        transacao = conexao.begin()
        preparar(conexao)
        yield conexao
        transacao.rollback()


def inserir(conexao, status, confianca, inferencia_id, doenca_id=None):
    conexao.execute(
        text(
            "INSERT INTO diagnosticos "
            "(usuario_id, imagem_id, doenca_id, modelo_versao, confianca, status, inferencia_id) "
            "VALUES (:usuario_id, :imagem_id, :doenca_id, 'teste', :confianca, :status, :inferencia_id)"
        ),
        {**conexao.info["ids"], "doenca_id": doenca_id, "confianca": confianca,
         "status": status, "inferencia_id": inferencia_id},
    )


def test_1_1_inconclusivo_sem_doenca_e_aceito(conexao):
    inserir(conexao, "inconclusivo", 0.41, INFERENCIA_ID)


def test_1_2_concluido_sem_doenca_continua_barrado(conexao):
    with pytest.raises(IntegrityError):
        inserir(conexao, "concluido", 0.90, INFERENCIA_ID)


def test_1_3_status_desconhecido_e_barrado(conexao):
    with pytest.raises(IntegrityError):
        inserir(conexao, "qualquer", 0.41, INFERENCIA_ID)


@pytest.mark.parametrize(("confianca", "inferencia_id"), [(None, INFERENCIA_ID), (0.41, None)])
def test_1_4_inconclusivo_exige_confianca_e_inferencia(conexao, confianca, inferencia_id):
    with pytest.raises(IntegrityError):
        inserir(conexao, "inconclusivo", confianca, inferencia_id)


def test_1_5_downgrade_e_upgrade_da_0003(alembic_cfg, banco_migrado):
    command.downgrade(alembic_cfg, "0002")
    command.upgrade(alembic_cfg, "head")

    with banco_migrado.connect() as conexao:
        transacao = conexao.begin()
        preparar(conexao)
        inserir(conexao, "inconclusivo", 0.41, INFERENCIA_ID)
        transacao.rollback()


@pytest.fixture
def inconclusivo_gravado(banco_migrado):
    """Diagnóstico inconclusivo gravado de verdade (sem rollback), para o downgrade encontrá-lo."""
    with banco_migrado.begin() as conexao:
        usuario_id = conexao.execute(
            text("INSERT INTO usuarios (nome, email, senha_hash) VALUES ('Teste', 'downgrade@diagro.dev', 'x') RETURNING id")
        ).scalar_one()
        imagem_id = conexao.execute(
            text("INSERT INTO imagens (usuario_id, arquivo_url) VALUES (:u, 'imagens/downgrade.jpg') RETURNING id"),
            {"u": usuario_id},
        ).scalar_one()
        diagnostico_id = conexao.execute(
            text(
                "INSERT INTO diagnosticos (usuario_id, imagem_id, modelo_versao, confianca, status, inferencia_id) "
                "VALUES (:u, :i, 'teste', 0.41, 'inconclusivo', :inferencia) RETURNING id"
            ),
            {"u": usuario_id, "i": imagem_id, "inferencia": INFERENCIA_ID},
        ).scalar_one()
    yield diagnostico_id
    with banco_migrado.begin() as conexao:
        conexao.execute(text("DELETE FROM usuarios WHERE id = :u"), {"u": usuario_id})


def diagnostico(engine, diagnostico_id):
    with engine.connect() as conexao:
        return conexao.execute(
            text("SELECT status, confianca, inferencia_id FROM diagnosticos WHERE id = :id"), {"id": diagnostico_id}
        ).one()


def test_d_1_downgrade_da_0003_converte_inconclusivo_em_erro_sem_perder_confianca_e_inferencia(
    alembic_cfg, banco_migrado, inconclusivo_gravado
):
    try:
        command.downgrade(alembic_cfg, "0002")

        status, confianca, inferencia_id = diagnostico(banco_migrado, inconclusivo_gravado)
        assert status == "erro"
        assert float(confianca) == pytest.approx(0.41)
        assert inferencia_id == INFERENCIA_ID
    finally:
        command.upgrade(alembic_cfg, "head")


def test_d_2_upgrade_depois_do_downgrade_funciona_e_a_linha_continua_como_erro(
    alembic_cfg, banco_migrado, inconclusivo_gravado
):
    command.downgrade(alembic_cfg, "0002")
    command.upgrade(alembic_cfg, "head")

    assert diagnostico(banco_migrado, inconclusivo_gravado).status == "erro"
