"""Endereço do RustFS com "_" (como os do Easypanel, `projeto_servico`), que o boto3 recusa."""

import socket

import boto3

from app.repositories import armazenamento_repository as repo
from app.repositories.armazenamento_repository import endpoint_aceito_pelo_boto3


def test_nome_sem_underline_fica_igual():
    assert endpoint_aceito_pelo_boto3("http://localhost:9000") == "http://localhost:9000"
    assert endpoint_aceito_pelo_boto3("https://s3.exemplo.com") == "https://s3.exemplo.com"


def test_nome_com_underline_vira_ip_e_mantem_porta(monkeypatch):
    monkeypatch.setattr(repo.socket, "gethostbyname", lambda nome: "10.0.1.23")

    url = endpoint_aceito_pelo_boto3("http://teste-rocket-launch_diagro-rustfs:9000")

    assert url == "http://10.0.1.23:9000"
    boto3.client("s3", endpoint_url=url, aws_access_key_id="a", aws_secret_access_key="b", region_name="us-east-1")


def test_nome_com_underline_sem_porta(monkeypatch):
    monkeypatch.setattr(repo.socket, "gethostbyname", lambda nome: "10.0.1.23")

    assert endpoint_aceito_pelo_boto3("http://projeto_rustfs") == "http://10.0.1.23"


def test_nome_que_nao_resolve_volta_como_veio(monkeypatch):
    def falha(nome):
        raise socket.gaierror("não resolve")

    monkeypatch.setattr(repo.socket, "gethostbyname", falha)

    assert endpoint_aceito_pelo_boto3("http://projeto_rustfs:9000") == "http://projeto_rustfs:9000"


def test_health_nao_quebra_com_endpoint_invalido(monkeypatch, banco_migrado):
    from fastapi.testclient import TestClient

    from app.core.config import settings
    from app.main import app

    monkeypatch.setattr(settings, "S3_ENDPOINT_URL", "http://nao_existe_mesmo:9000")

    resposta = TestClient(app).get("/health")

    assert resposta.status_code == 200
    assert resposta.json()["rustfs"].startswith("erro")
