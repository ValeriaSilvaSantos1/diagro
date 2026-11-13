"""Coluna observacoes em diagnosticos

O model Diagnostico e a rota POST /analises passaram a usar o campo observacoes
(texto livre que o usuário escreve ao enviar a foto), mas nenhuma migration criava
a coluna. Num banco criado do zero, as rotas de análise davam erro 500:
"column diagnosticos.observacoes does not exist".

Revision ID: 0005
Revises: 0004
Create Date: 2026-11-12
"""

from alembic import op

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # IF NOT EXISTS: quem já tinha criado a coluna à mão no próprio banco não recebe erro.
    op.execute("ALTER TABLE diagnosticos ADD COLUMN IF NOT EXISTS observacoes TEXT;")


def downgrade() -> None:
    op.execute("ALTER TABLE diagnosticos DROP COLUMN IF EXISTS observacoes;")