"""Senhas do .env não aparecem quando o Settings é impresso, como acontece numa mensagem de erro."""

from app.core.config import Settings

SEGREDOS = {
    "POSTGRES_PASSWORD": "segredo-postgres",
    "MONGO_INITDB_ROOT_PASSWORD": "segredo-mongo",
    "RUSTFS_SECRET_KEY": "segredo-rustfs",
    "JWT_SECRET": "segredo-jwt",
}


def configuracao():
    return Settings(_env_file=None, POSTGRES_USER="u", POSTGRES_DB="d", MONGO_INITDB_ROOT_USERNAME="m",
                    RUSTFS_ACCESS_KEY="r", **SEGREDOS)


def test_s1_impressao_do_settings_nao_mostra_segredos():
    impresso = repr(configuracao()) + str(configuracao())

    assert [valor for valor in SEGREDOS.values() if valor in impresso] == []


def test_s2_urls_de_conexao_usam_o_valor_real():
    settings = configuracao()

    assert ":segredo-postgres@" in settings.DATABASE_URL
    assert ":segredo-mongo@" in settings.MONGODB_URL


def test_s3_token_do_login_e_lido_de_volta():
    from app.core.security import criar_token, ler_token

    assert ler_token(criar_token(42)) == 42
