import hashlib
import random
from collections import defaultdict
from pathlib import Path


def dividir(pasta, semente=42, proporcoes=(0.70, 0.15, 0.15)):
    """Divide pasta/<classe>/<imagem> em treino, validação e teste, estratificado por classe.

    Arquivos idênticos byte a byte andam juntos: o Paddy Doctor tem 72 grupos de cópias, e uma
    cópia no treino com a original no teste mede memória, não acerto.
    """
    pasta = Path(pasta)
    grupos = defaultdict(lambda: defaultdict(list))
    for caminho in sorted(pasta.glob("*/*")):
        grupos[caminho.parent.name][hashlib.sha256(caminho.read_bytes()).hexdigest()].append(
            caminho.relative_to(pasta).as_posix()
        )

    rng = random.Random(semente)
    partes = {"treino": [], "validacao": [], "teste": []}
    for classe in sorted(grupos):
        lotes = [grupos[classe][h] for h in sorted(grupos[classe])]
        rng.shuffle(lotes)
        fim_treino = round(len(lotes) * proporcoes[0])
        fim_validacao = fim_treino + round(len(lotes) * proporcoes[1])
        fatias = {"treino": lotes[:fim_treino], "validacao": lotes[fim_treino:fim_validacao], "teste": lotes[fim_validacao:]}
        for nome, fatia in fatias.items():
            partes[nome] += [(caminho, classe) for lote in fatia for caminho in lote]
    return partes
