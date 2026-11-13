"""Edição do perfil (PATCH /auth/me): nome, e-mail e dados da propriedade."""

import uuid

import pytest
from fastapi.testclient import TestClient

from app.main import app

SENHA = "senha-forte-1"


@pytest.fixture
def cliente(banco_migrado):
    return TestClient(app)


def novo_email() -> str:
    return f"{uuid.uuid4().hex[:10]}@diagro.dev"


def entrar(cliente, email=None) -> dict:
    email = email or novo_email()
    cliente.post("/auth/cadastro", json={"nome": "Teste", "email": email, "senha": SENHA})
    token = cliente.post("/auth/login", json={"email": email, "senha": SENHA}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_perfil_novo_vem_sem_dados_da_propriedade(cliente):
    eu = cliente.get("/auth/me", headers=entrar(cliente)).json()

    assert eu["propriedade"] is None
    assert eu["area_propriedade"] is None
    assert eu["culturas_principais"] is None


def test_edita_nome_email_e_propriedade_e_persiste(cliente):
    cabecalho = entrar(cliente)
    email = novo_email()

    resposta = cliente.patch(
        "/auth/me",
        headers=cabecalho,
        json={
            "nome": "  Maria Souza ",
            "email": email.upper(),
            "propriedade": "Sítio Boa Esperança",
            "area_propriedade": 12.5,
            "culturas_principais": "arroz, milho",
        },
    )

    assert resposta.status_code == 200
    eu = cliente.get("/auth/me", headers=cabecalho).json()
    assert eu["nome"] == "Maria Souza"
    assert eu["email"] == email
    assert eu["propriedade"] == "Sítio Boa Esperança"
    assert eu["area_propriedade"] == 12.5
    assert eu["culturas_principais"] == "arroz, milho"


def test_login_funciona_com_o_email_novo(cliente):
    cabecalho = entrar(cliente)
    email = novo_email()
    cliente.patch("/auth/me", headers=cabecalho, json={"email": email})

    resposta = cliente.post("/auth/login", json={"email": email, "senha": SENHA})

    assert resposta.status_code == 200


def test_so_os_campos_enviados_mudam(cliente):
    cabecalho = entrar(cliente)
    cliente.patch("/auth/me", headers=cabecalho, json={"propriedade": "Fazenda A", "area_propriedade": 30})

    eu = cliente.patch("/auth/me", headers=cabecalho, json={"culturas_principais": "arroz"}).json()

    assert eu["nome"] == "Teste"
    assert eu["propriedade"] == "Fazenda A"
    assert eu["area_propriedade"] == 30
    assert eu["culturas_principais"] == "arroz"


def test_vazio_ou_null_apaga_os_opcionais(cliente):
    cabecalho = entrar(cliente)
    cliente.patch("/auth/me", headers=cabecalho, json={"propriedade": "Fazenda A", "area_propriedade": 30, "culturas_principais": "arroz"})

    eu = cliente.patch(
        "/auth/me", headers=cabecalho, json={"propriedade": "  ", "area_propriedade": None, "culturas_principais": ""}
    ).json()

    assert eu["propriedade"] is None
    assert eu["area_propriedade"] is None
    assert eu["culturas_principais"] is None


def test_email_de_outra_conta_da_409(cliente):
    email_ocupado = novo_email()
    entrar(cliente, email_ocupado)

    resposta = cliente.patch("/auth/me", headers=entrar(cliente), json={"email": email_ocupado})

    assert resposta.status_code == 409


def test_manter_o_proprio_email_nao_da_409(cliente):
    email = novo_email()
    cabecalho = entrar(cliente, email)

    assert cliente.patch("/auth/me", headers=cabecalho, json={"email": email, "nome": "Outro"}).status_code == 200


@pytest.mark.parametrize(
    "corpo",
    [{"nome": None}, {"email": None}, {"nome": " "}, {"email": "nao-e-email"}, {"area_propriedade": 0}, {"area_propriedade": -3}],
)
def test_valores_invalidos_dao_422(cliente, corpo):
    assert cliente.patch("/auth/me", headers=entrar(cliente), json=corpo).status_code == 422


def test_sem_token_da_401(cliente):
    assert cliente.patch("/auth/me", json={"nome": "Alguém"}).status_code == 401
