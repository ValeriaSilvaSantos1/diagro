import argparse
import json
from pathlib import Path

from PIL import Image


def preparar(origem, destino, mapa=None, lado=256):
    """Copia origem/.../<pasta>/<imagem> para destino/<classe>/<imagem> com o menor lado em `lado` px.

    Decodificar a foto de 1080x1440 a cada época é o que mais pesa no treino em CPU; reduzida uma
    vez, ela entra no cache do CI. `mapa` traduz o nome da pasta de origem para a classe do modelo.
    Pastas acima da classe entram no nome do arquivo: o dataset do Bangladesh numera do zero em cada
    uma das pastas de treino, validação e teste.
    """
    origem, destino = Path(origem), Path(destino)
    for caminho in sorted(c for c in origem.rglob("*") if c.is_file()):
        classe = (mapa or {}).get(caminho.parent.name, caminho.parent.name)
        acima = caminho.relative_to(origem).parts[:-2]
        alvo = destino / classe / f"{'__'.join((*acima, caminho.stem))}.jpg"
        alvo.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(caminho) as imagem:
            imagem.draft("RGB", (lado * 2, lado * 2))
            imagem = imagem.convert("RGB")
            escala = lado / min(imagem.size)
            imagem.resize((round(imagem.width * escala), round(imagem.height * escala)), Image.BICUBIC).save(alvo, quality=95)


if __name__ == "__main__":
    argumentos = argparse.ArgumentParser()
    argumentos.add_argument("origem")
    argumentos.add_argument("destino")
    argumentos.add_argument("--mapa", type=json.loads)
    a = argumentos.parse_args()
    preparar(a.origem, a.destino, a.mapa)
