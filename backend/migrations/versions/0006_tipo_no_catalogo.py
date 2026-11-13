"""Coluna tipo em doencas_catalogo: doença, praga ou folha sadia

O catálogo do arroz tem, além das doenças, o dano de duas pragas (hispa e broca-do-colmo, que
causa o coração morto) e a folha sadia. A coluna separa os três para a API e o front não
dependerem do nome em português.

Revision ID: 0006
Revises: 0005
Create Date: 2026-11-12
"""

from alembic import op

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE doencas_catalogo ADD COLUMN tipo VARCHAR(10) NOT NULL DEFAULT 'doenca';
        ALTER TABLE doencas_catalogo ALTER COLUMN tipo DROP DEFAULT;
        ALTER TABLE doencas_catalogo ADD CONSTRAINT ck_doencas_catalogo_tipo
            CHECK (tipo IN ('doenca', 'praga', 'sadia'));
        UPDATE doencas_catalogo SET tipo = 'sadia' WHERE label_modelo = 'normal';
        UPDATE doencas_catalogo SET tipo = 'praga' WHERE label_modelo IN ('hispa', 'dead_heart');
        """
    )


def downgrade() -> None:
    op.execute("ALTER TABLE doencas_catalogo DROP COLUMN tipo;")
