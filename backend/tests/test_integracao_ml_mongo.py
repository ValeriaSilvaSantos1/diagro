"""Integração do classificador com o MongoDB no POST /analises (I.1 a I.7 e I.9, aprovados em 12/11).

O classificador é o falso dos testes do serviço, posto em app.state no lugar do modelo do release.
"""

import io
import uuid

import pytest
from fastapi.testclient import TestClient
from PIL import Image
from sqlalchemy import text

from app.core.config import settings
from app.core.mongo import get_client, get_mongo_db
from app.main import app
from app.repositories.armazenamento_repository import ArmazenamentoRepository
from app.repositories.inferencia_repository import InferenciaRepository
from tests.test_classificador import LONGE, PERTO, saida, servico


@pytest.fixture
def inferencias():
    get_mongo_db().drop_collection("inferencias")
    repositorio = InferenciaRepository()
    repositorio.garantir_colecao()
    return repositorio


@pytest.fixture
def cliente(banco_migrado, inferencias):
    ArmazenamentoRepository().garantir_bucket()
    yield TestClient(app)
    # Diagnóstico inconclusivo deixado no banco impede o downgrade da 0003 em test_migrations.
    with banco_migrado.begin() as conexao:
        conexao.execute(text("DELETE FROM diagnosticos"))


@pytest.fixture
def com_modelo(monkeypatch):
    def colocar(probabilidades, vetor):
        monkeypatch.setattr(app.state, "classificador", servico(probabilidades, vetor), raising=False)

    return colocar


@pytest.fixture
def sem_modelo(monkeypatch):
    monkeypatch.setattr(app.state, "classificador", None, raising=False)


def entrar(cliente) -> dict:
    email = f"{uuid.uuid4().hex[:10]}@diagro.dev"
    cliente.post("/auth/cadastro", json={"nome": "Teste", "email": email, "senha": "senha-forte-1"})
    token = cliente.post("/auth/login", json={"email": email, "senha": "senha-forte-1"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def foto_jpeg() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (64, 64), (40, 160, 60)).save(buffer, format="JPEG")
    return buffer.getvalue()


def enviar(cliente, cabecalho, conteudo=None):
    arquivo = ("folha.jpg", conteudo if conteudo is not None else foto_jpeg(), "image/jpeg")
    return cliente.post("/analises", headers=cabecalho, files={"arquivo": arquivo})


def id_no_catalogo(engine, label: str) -> int:
    with engine.connect() as conexao:
        return conexao.execute(
            text("SELECT id FROM doencas_catalogo WHERE label_modelo = :label"), {"label": label}
        ).scalar_one()


def objetos_no_bucket() -> int:
    armazenamento = ArmazenamentoRepository()
    return armazenamento.cliente.list_objects_v2(Bucket=armazenamento.bucket).get("KeyCount", 0)


def test_i_1_foto_que_passa_nos_dois_portoes_conclui_com_a_doenca_do_catalogo(cliente, com_modelo, banco_migrado):
    com_modelo(saida("blast", 0.90), PERTO)

    resposta = enviar(cliente, entrar(cliente))

    assert resposta.status_code == 201
    corpo = resposta.json()
    assert corpo["status"] == "concluido"
    assert corpo["doenca_id"] == id_no_catalogo(banco_migrado, "blast")
    assert corpo["nome_doenca"] == "Brusone"
    assert corpo["confianca"] == pytest.approx(0.90, abs=1e-4)
    assert corpo["modelo_versao"] == "teste"
    assert len(corpo["inferencia_id"]) == 24


def test_i_2_foto_barrada_num_portao_fica_inconclusiva(cliente, com_modelo):
    com_modelo(saida("blast", 0.99), LONGE)

    corpo = enviar(cliente, entrar(cliente)).json()

    assert corpo["status"] == "inconclusivo"
    assert corpo["doenca_id"] is None
    assert corpo["nome_doenca"] is None
    assert corpo["confianca"] == pytest.approx(0.99, abs=1e-4)
    assert len(corpo["inferencia_id"]) == 24


def test_i_3_documento_no_mongo_guarda_a_inferencia_bruta(cliente, com_modelo, inferencias):
    com_modelo(saida("blast", 0.90), PERTO)

    corpo = enviar(cliente, entrar(cliente)).json()
    documento = inferencias.obter(corpo["inferencia_id"])

    assert documento["diagnostico_id"] == corpo["id"]
    assert documento["imagem_id"] == corpo["imagem_id"]
    assert documento["modelo_versao"] == "teste"
    assert documento["tipo_tarefa"] == "classificacao"
    assert documento["tempo_inferencia_ms"] >= 0
    resultado = documento["resultado"]
    assert resultado["status"] == "concluido"
    assert resultado["label"] == "blast"
    assert len(resultado["probabilidades"]) == 10
    assert resultado["limiar"] == 0.60
    assert resultado["corte"] == 0.14
    assert resultado["distancia"] == pytest.approx(0.0, abs=1e-6)
    assert [v["caminho"] for v in resultado["vizinhos"]] == ["blast/1.jpg", "tungro/1.jpg"]


def test_i_4_caminho_inverso_do_diagnostico_para_a_inferencia(cliente, com_modelo, inferencias):
    com_modelo(saida("blast", 0.90), PERTO)

    corpo = enviar(cliente, entrar(cliente)).json()

    assert inferencias.obter_por_diagnostico(corpo["id"])["_id"] == corpo["inferencia_id"]


def test_i_5_sem_modelo_a_analise_fica_pendente_e_nada_vai_para_o_mongo(cliente, sem_modelo, inferencias):
    corpo = enviar(cliente, entrar(cliente)).json()

    assert corpo["status"] == "pendente"
    assert corpo["modelo_versao"] == "aguardando-modelo"
    assert corpo["inferencia_id"] is None
    assert inferencias.colecao.count_documents({}) == 0


def test_i_6_arquivo_que_nao_abre_como_imagem_nao_grava_nada(cliente, com_modelo, inferencias):
    com_modelo(saida("blast", 0.90), PERTO)
    cabecalho = entrar(cliente)
    antes = objetos_no_bucket()

    resposta = enviar(cliente, cabecalho, conteudo=b"isto nao e uma imagem")

    assert resposta.status_code == 422
    assert cliente.get("/analises", headers=cabecalho).json() == []
    assert inferencias.colecao.count_documents({}) == 0
    assert objetos_no_bucket() == antes


def test_i_7_mongo_fora_do_ar_grava_o_diagnostico_com_erro_e_guarda_a_foto(cliente, com_modelo, monkeypatch):
    com_modelo(saida("blast", 0.90), PERTO)
    cabecalho = entrar(cliente)
    monkeypatch.setattr(settings, "MONGO_PORT", 9)
    get_client.cache_clear()
    try:
        resposta = enviar(cliente, cabecalho)
    finally:
        get_client.cache_clear()

    assert resposta.status_code == 201
    corpo = resposta.json()
    assert corpo["status"] == "erro"
    assert corpo["doenca_id"] is None
    assert corpo["inferencia_id"] is None
    assert cliente.get(corpo["arquivo_url"], headers=cabecalho).status_code == 200


def test_i_9_detalhe_traz_a_inferencia_do_mongo_so_para_o_dono(cliente, com_modelo):
    com_modelo(saida("blast", 0.90), PERTO)
    dono = entrar(cliente)
    criado = enviar(cliente, dono).json()

    detalhe = cliente.get(f"/analises/{criado['id']}", headers=dono).json()

    assert detalhe["inferencia"]["_id"] == criado["inferencia_id"]
    assert detalhe["inferencia"]["resultado"]["label"] == "blast"
    assert cliente.get(f"/analises/{criado['id']}", headers=entrar(cliente)).status_code == 404
