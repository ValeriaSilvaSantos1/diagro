"""Ponto de entrada do Alembic: diz a ele como se conectar ao banco.

A única mudança em relação ao arquivo que o `alembic init` gera é a URL,
que vem do .env (via app/core/config.py) em vez de ficar escrita no alembic.ini.
"""

from logging.config import fileConfig

from sqlalchemy import create_engine, pool

from alembic import context
from app.core.config import settings

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

URL = settings.DATABASE_URL

# Não usamos autogenerate: as migrations são escritas à mão em SQL.
target_metadata = None


def run_migrations_offline() -> None:
    """`alembic upgrade head --sql` imprime o SQL sem tocar no banco (bom para o relatório)."""
    context.configure(url=URL, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    engine = create_engine(URL, poolclass=pool.NullPool)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()