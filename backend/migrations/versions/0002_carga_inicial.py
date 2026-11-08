"""Carga inicial: culturas e catálogo de doenças

Culturas e doenças não têm tela de cadastro no MVP: são carga inicial
versionada junto do schema (Relatório AB1, seção 7).

ATENÇÃO: os valores de label_modelo são PROVISÓRIOS. Precisam ser exatamente
os nomes das classes do modelo de Ciência de Dados. Quando a equipe de ML
definir as classes, criem uma NOVA migration ajustando o catálogo; não editem
esta depois que alguém da equipe já a tiver aplicado.

Revision ID: 0002
Revises: 0001
Create Date: 2026-11-05
"""

from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("INSERT INTO culturas (nome) VALUES ('arroz');")
    op.execute(
        """
        INSERT INTO doencas_catalogo (cultura_id, label_modelo, nome_comum, tratamento_recomendado)
        SELECT c.id, v.label_modelo, v.nome_comum, v.tratamento
        FROM culturas c
        CROSS JOIN (VALUES
            ('arroz_saudavel', 'Folha saudável',
             'Nenhuma ação necessária. Continue o monitoramento periódico da lavoura.'),
            ('arroz_brusone', 'Brusone',
             'Doença causada pelo fungo Magnaporthe oryzae. Procure um engenheiro agrônomo para avaliar o controle.'),
            ('arroz_mancha_parda', 'Mancha-parda',
             'Causada por Bipolaris oryzae e frequentemente ligada a deficiência nutricional. Recomenda-se análise de solo.'),
            ('arroz_queima_bacteriana', 'Queima-das-folhas (bacteriana)',
             'Causada por Xanthomonas oryzae. Procure orientação técnica e evite excesso de adubação nitrogenada.')
        ) AS v(label_modelo, nome_comum, tratamento)
        WHERE c.nome = 'arroz';
        """
    )


def downgrade() -> None:
    op.execute("DELETE FROM doencas_catalogo;")
    op.execute("DELETE FROM culturas;")