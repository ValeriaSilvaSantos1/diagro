"""Rotas de análise: envio da foto, histórico, detalhe e a foto protegida por login.
"""

import io
import uuid

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.repositories.armazenamento_repository import ArmazenamentoRepository


@pytest.fixture
def cliente(banco_migrado):
    ArmazenamentoRepository().garantir_bucket()
    return TestClient(app)


def entrar(cliente) -> dict:
    """Cria um usuário novo (e-mail único a cada teste) e devolve o cabeçalho com o token."""
    email = f"{uuid.uuid4().hex[:10]}@diagro.dev"
    cliente.post("/auth/cadastro", json={"nome": "Teste", "email": email, "senha": "senha-forte-1"})
    token = cliente.post("/auth/login", json={"email": email, "senha": "senha-forte-1"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def foto_jpeg() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (64, 64), (40, 160, 60)).save(buffer, format="JPEG")
    return buffer.getvalue()


def enviar(cliente, cabecalho, observacoes=None):
    dados = {"observacoes": observacoes} if observacoes else None
    return cliente.post(
        "/analises", headers=cabecalho, files={"arquivo": ("folha.jpg", foto_jpeg(), "image/jpeg")}, data=dados
    )


def test_enviar_foto_cria_a_analise_com_observacoes(cliente):
    resposta = enviar(cliente, entrar(cliente), observacoes="manchas na borda da folha")

    assert resposta.status_code == 201
    corpo = resposta.json()
    assert corpo["observacoes"] == "manchas na borda da folha"
    assert corpo["arquivo_url"] == f"/imagens/{corpo['imagem_id']}"


def test_historico_e_detalhe_do_proprio_usuario(cliente):
    cabecalho = entrar(cliente)
    primeira = enviar(cliente, cabecalho).json()
    segunda = enviar(cliente, cabecalho).json()

    historico = cliente.get("/analises", headers=cabecalho)
    assert historico.status_code == 200
    assert [item["id"] for item in historico.json()] == [segunda["id"], primeira["id"]]  # mais recente primeiro

    detalhe = cliente.get(f"/analises/{primeira['id']}", headers=cabecalho)
    assert detalhe.status_code == 200
    assert detalhe.json()["id"] == primeira["id"]


def test_um_usuario_nao_ve_a_analise_nem_a_foto_de_outro(cliente):
    dono = entrar(cliente)
    analise = enviar(cliente, dono).json()
    outro = entrar(cliente)

    assert cliente.get("/analises", headers=outro).json() == []
    assert cliente.get(f"/analises/{analise['id']}", headers=outro).status_code == 404
    assert cliente.get(analise["arquivo_url"], headers=outro).status_code == 404


def test_dono_baixa_a_propria_foto(cliente):
    dono = entrar(cliente)
    analise = enviar(cliente, dono).json()

    resposta = cliente.get(analise["arquivo_url"], headers=dono)

    assert resposta.status_code == 200
    assert resposta.headers["content-type"] == "image/jpeg"
    assert resposta.content == foto_jpeg()


def test_rotas_de_analise_exigem_login(cliente):
    assert cliente.get("/analises").status_code == 401
    assert cliente.post("/analises", files={"arquivo": ("f.jpg", foto_jpeg(), "image/jpeg")}).status_code == 401