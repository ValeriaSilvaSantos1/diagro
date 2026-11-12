"""Preparação dos datasets: o Bangladesh entra no treino só com as classes do modelo (P.1 e P.2, 12/11)."""

from PIL import Image

from diagro_ml.preparar import preparar


def arvore(raiz):
    for parte in ("Training data", "Testing data"):
        for classe in ("Leaf Blast", "Leaf scald"):
            (raiz / parte / classe).mkdir(parents=True)
            Image.new("RGB", (400, 300), (90, 140, 60)).save(raiz / parte / classe / "Leaf (1).jpg")


def test_p1_pasta_fora_do_mapa_fica_de_fora(tmp_path):
    arvore(tmp_path / "origem")

    preparar(tmp_path / "origem", tmp_path / "destino", mapa={"Leaf Blast": "blast"})

    assert sorted(p.name for p in (tmp_path / "destino").iterdir()) == ["blast"]


def test_p2_subpastas_entram_no_nome_sem_sobrescrever(tmp_path):
    arvore(tmp_path / "origem")

    preparar(tmp_path / "origem", tmp_path / "destino", mapa={"Leaf Blast": "blast", "Leaf scald": "leaf_scald"})

    assert sorted(p.name for p in (tmp_path / "destino" / "blast").iterdir()) == [
        "Testing data__Leaf (1).jpg", "Training data__Leaf (1).jpg",
    ]
