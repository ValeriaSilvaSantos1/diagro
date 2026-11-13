"""Status inconclusivo em diagnosticos

Quando a confiança do classificador fica abaixo do limiar, o diagnóstico não aponta
doença, mas guarda a confiança e o documento da inferência no Mongo, porque o modelo rodou.

Revision ID: 0003
Revises: 0002
Create Date: 2026-11-12
"""

from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE diagnosticos DROP CONSTRAINT ck_diagnosticos_status;
        ALTER TABLE diagnosticos ADD CONSTRAINT ck_diagnosticos_status
            CHECK (status IN ('pendente', 'processando', 'concluido', 'inconclusivo', 'erro'));
        ALTER TABLE diagnosticos ADD CONSTRAINT ck_diagnosticos_inconclusivo_completo
            CHECK (status <> 'inconclusivo' OR (confianca IS NOT NULL AND inferencia_id IS NOT NULL));
        """
    )


def downgrade() -> None:
    # Antes da 0003 não existe 'inconclusivo'. Essas linhas viram 'erro' e mantêm a confiança e o
    # inferencia_id; o status original continua no documento da inferência no Mongo.
    op.execute(
        """
        ALTER TABLE diagnosticos DROP CONSTRAINT ck_diagnosticos_inconclusivo_completo;
        UPDATE diagnosticos SET status = 'erro' WHERE status = 'inconclusivo';
        ALTER TABLE diagnosticos DROP CONSTRAINT ck_diagnosticos_status;
        ALTER TABLE diagnosticos ADD CONSTRAINT ck_diagnosticos_status
            CHECK (status IN ('pendente', 'processando', 'concluido', 'erro'));
        """
    )
