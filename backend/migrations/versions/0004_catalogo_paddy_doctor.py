"""Catálogo do arroz com as 10 classes do Paddy Doctor

Os label_modelo passam a ser os nomes das classes do modelo (ml/classes.json). As quatro
linhas da 0002 são atualizadas, e não apagadas, para manter os ids de quem já as referencia.

Revision ID: 0004
Revises: 0003
Create Date: 2026-11-12
"""

from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

AGRONOMO = "Procure um engenheiro agrônomo para confirmar o diagnóstico e definir o manejo."


def upgrade() -> None:
    op.execute(
        f"""
        UPDATE doencas_catalogo d SET label_modelo = v.novo, nome_comum = v.nome, tratamento_recomendado = v.tratamento
        FROM (VALUES
            ('arroz_saudavel', 'normal', 'Folha saudável',
             'Nenhuma ação necessária. Continue o monitoramento periódico da lavoura.'),
            ('arroz_brusone', 'blast', 'Brusone',
             'Doença causada pelo fungo Magnaporthe oryzae. {AGRONOMO}'),
            ('arroz_mancha_parda', 'brown_spot', 'Mancha-parda',
             'Causada pelo fungo Bipolaris oryzae e frequentemente ligada a deficiência nutricional. Recomenda-se análise de solo. {AGRONOMO}'),
            ('arroz_queima_bacteriana', 'bacterial_leaf_blight', 'Crestamento bacteriano',
             'Causado pela bactéria Xanthomonas oryzae pv. oryzae. Evite excesso de adubação nitrogenada. {AGRONOMO}')
        ) AS v(antigo, novo, nome, tratamento)
        WHERE d.label_modelo = v.antigo;

        INSERT INTO doencas_catalogo (cultura_id, label_modelo, nome_comum, tratamento_recomendado)
        SELECT c.id, v.label_modelo, v.nome_comum, v.tratamento
        FROM culturas c
        CROSS JOIN (VALUES
            ('bacterial_leaf_streak', 'Estria bacteriana',
             'Causada pela bactéria Xanthomonas oryzae pv. oryzicola. {AGRONOMO}'),
            ('bacterial_panicle_blight', 'Queima bacteriana da panícula',
             'Causada pela bactéria Burkholderia glumae. {AGRONOMO}'),
            ('dead_heart', 'Coração morto',
             'Sintoma do ataque de broca-do-colmo: o perfilho central seca. {AGRONOMO}'),
            ('downy_mildew', 'Míldio',
             'Doença causada por Sclerophthora macrospora, favorecida por alagamento. {AGRONOMO}'),
            ('hispa', 'Hispa',
             'Dano do besouro Dicladispa armigera, que raspa a folha. {AGRONOMO}'),
            ('tungro', 'Tungro',
             'Doença causada por vírus e transmitida pela cigarrinha-verde. {AGRONOMO}')
        ) AS v(label_modelo, nome_comum, tratamento)
        WHERE c.nome = 'arroz';
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM doencas_catalogo WHERE label_modelo IN
            ('bacterial_leaf_streak', 'bacterial_panicle_blight', 'dead_heart', 'downy_mildew', 'hispa', 'tungro');

        UPDATE doencas_catalogo d SET label_modelo = v.antigo, nome_comum = v.nome, tratamento_recomendado = v.tratamento
        FROM (VALUES
            ('normal', 'arroz_saudavel', 'Folha saudável',
             'Nenhuma ação necessária. Continue o monitoramento periódico da lavoura.'),
            ('blast', 'arroz_brusone', 'Brusone',
             'Doença causada pelo fungo Magnaporthe oryzae. Procure um engenheiro agrônomo para avaliar o controle.'),
            ('brown_spot', 'arroz_mancha_parda', 'Mancha-parda',
             'Causada por Bipolaris oryzae e frequentemente ligada a deficiência nutricional. Recomenda-se análise de solo.'),
            ('bacterial_leaf_blight', 'arroz_queima_bacteriana', 'Queima-das-folhas (bacteriana)',
             'Causada por Xanthomonas oryzae. Procure orientação técnica e evite excesso de adubação nitrogenada.')
        ) AS v(novo, antigo, nome, tratamento)
        WHERE d.label_modelo = v.novo;
        """
    )
