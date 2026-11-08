"""Schema inicial: as cinco entidades do Relatório AB1 (seção 4)

Revision ID: 0001
Revises:
Create Date: 2026-11-05
"""

from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Ordem de criação: uma tabela só pode referenciar (FK) outra que já existe.
    op.execute(
        """
        CREATE TABLE usuarios (
            id          BIGSERIAL    PRIMARY KEY,
            nome        VARCHAR(120) NOT NULL,
            email       VARCHAR(160) NOT NULL UNIQUE,
            senha_hash  VARCHAR(255) NOT NULL,              -- Argon2, nunca a senha pura
            criado_em   TIMESTAMPTZ  NOT NULL DEFAULT now()
        );

        CREATE TABLE culturas (
            id    SMALLSERIAL PRIMARY KEY,
            nome  VARCHAR(60) NOT NULL UNIQUE
        );

        -- Uma foto pode ser reprocessada por outras versões do modelo:
        -- separar de diagnosticos evita sobrescrever o histórico.
        CREATE TABLE imagens (
            id           BIGSERIAL    PRIMARY KEY,
            usuario_id   BIGINT       NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
            arquivo_url  VARCHAR(255) NOT NULL UNIQUE,      -- CHAVE do objeto no RustFS, não a URL completa
            criado_em    TIMESTAMPTZ  NOT NULL DEFAULT now()
        );

        -- label_modelo = rótulo técnico que o modelo devolve
        -- nome_comum   = o que aparece na tela
        CREATE TABLE doencas_catalogo (
            id                      SERIAL       PRIMARY KEY,
            cultura_id              SMALLINT     NOT NULL REFERENCES culturas(id),
            label_modelo            VARCHAR(80)  NOT NULL UNIQUE,
            nome_comum              VARCHAR(120) NOT NULL,
            tratamento_recomendado  TEXT
        );

        CREATE TABLE diagnosticos (
            id             BIGSERIAL    PRIMARY KEY,
            usuario_id     BIGINT       NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
            imagem_id      BIGINT       NOT NULL REFERENCES imagens(id)  ON DELETE CASCADE,
            doenca_id      INT          REFERENCES doencas_catalogo(id),     -- nulo até concluir
            modelo_versao  VARCHAR(80)  NOT NULL,                            -- ex.: efficientnet_b0_v2_2026-10
            confianca      NUMERIC(5,4) CHECK (confianca BETWEEN 0 AND 1),   -- nulo até concluir
            status         VARCHAR(20)  NOT NULL DEFAULT 'processando',
            inferencia_id  CHAR(24),                                         -- ObjectId do Mongo; sem FK possível
            criado_em      TIMESTAMPTZ  NOT NULL DEFAULT now(),

            -- 'pendente' já aceito: a fila assíncrona da entrega final não exigirá migration
            CONSTRAINT ck_diagnosticos_status
                CHECK (status IN ('pendente', 'processando', 'concluido', 'erro')),

            -- Os três campos nascem nulos, mas são obrigatórios quando o diagnóstico conclui
            CONSTRAINT ck_diagnosticos_concluido_completo
                CHECK (status <> 'concluido'
                       OR (doenca_id IS NOT NULL AND confianca IS NOT NULL AND inferencia_id IS NOT NULL))
        );

        -- Tela de histórico: filtra pelo usuário e ordena do mais recente para o mais antigo
        CREATE INDEX ix_diagnosticos_usuario_data ON diagnosticos (usuario_id, criado_em DESC);
        -- Índices nas FKs (o PostgreSQL não cria sozinho), usados nos JOINs
        CREATE INDEX ix_diagnosticos_imagem ON diagnosticos (imagem_id);
        CREATE INDEX ix_diagnosticos_doenca ON diagnosticos (doenca_id);
        CREATE INDEX ix_imagens_usuario     ON imagens (usuario_id);
        """
    )


def downgrade() -> None:
    # Ordem inversa da criação
    op.execute(
        """
        DROP TABLE diagnosticos;
        DROP TABLE doencas_catalogo;
        DROP TABLE imagens;
        DROP TABLE culturas;
        DROP TABLE usuarios;
        """
    )