"""Dados da propriedade no perfil do usuário

A tela "Meu perfil" deixa a pessoa informar o nome da propriedade, a área total e as principais
culturas. Os três campos são opcionais e ficam na própria tabela `usuarios`, porque são
um por pessoa.

Revision ID: 0007
Revises: 0006
Create Date: 2026-11-13
"""

from alembic import op

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE usuarios ADD COLUMN propriedade VARCHAR(120);
        ALTER TABLE usuarios ADD COLUMN area_propriedade NUMERIC(12, 2);
        ALTER TABLE usuarios ADD COLUMN culturas_principais VARCHAR(200);
        ALTER TABLE usuarios ADD CONSTRAINT ck_usuarios_area_positiva
            CHECK (area_propriedade IS NULL OR area_propriedade > 0);
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE usuarios DROP COLUMN culturas_principais;
        ALTER TABLE usuarios DROP COLUMN area_propriedade;
        ALTER TABLE usuarios DROP COLUMN propriedade;
        """
    )
