"""CORS lido de CORS_ORIGENS, para o front publicado conseguir chamar a API (C.1 e C.2, aprovados em 13/11).

O conftest define CORS_ORIGENS com https://diagro.teste antes de a app ser importada.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


def preflight(origem: str):
    return TestClient(app).options(
        "/health", headers={"Origin": origem, "Access-Control-Request-Method": "GET"}
    )


def test_c_1_origem_configurada_e_aceita():
    assert preflight("https://diagro.teste").headers.get("access-control-allow-origin") == "https://diagro.teste"


@pytest.mark.parametrize("origem", ["https://outro.teste", "http://localhost:4000"])
def test_c_2_origem_fora_da_lista_nao_recebe_o_cabecalho(origem):
    assert "access-control-allow-origin" not in preflight(origem).headers
