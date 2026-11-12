import random
from pathlib import Path

import numpy as np
from PIL import Image

LIMIAR_PERCEPTUAL = 16
BITS = np.array([bin(i).count("1") for i in range(256)], dtype=np.uint8)


def dhash(imagem):
    a = np.asarray(imagem.resize((17, 16), Image.BILINEAR), dtype=np.int16)
    return np.packbits((a[:, 1:] > a[:, :-1]).flatten())


def assinatura(imagem):
    """dHash de 256 bits da foto nas 8 orientações de 90 em 90 graus, com e sem espelho."""
    base = imagem.convert("L").resize((64, 64), Image.BILINEAR)
    return np.stack([
        dhash(versao.rotate(angulo, expand=True))
        for versao in (base, base.transpose(Image.FLIP_LEFT_RIGHT))
        for angulo in (0, 90, 180, 270)
    ])


def distancia_perceptual(a, b):
    """Bits diferentes entre a foto `a` e a orientação de `b` que mais se parece com ela."""
    return int(BITS[np.bitwise_xor(a[0], b)].sum(1).min())


def assinaturas(caminhos):
    lista = []
    for caminho in caminhos:
        with Image.open(caminho) as imagem:
            lista.append(assinatura(imagem))
    return np.stack(lista)


def distancias_perceptuais(consultas, base, lote=8):
    """Matriz com a `distancia_perceptual` de cada consulta a cada foto da base."""
    return np.concatenate([
        BITS[np.bitwise_xor(consultas[i:i + lote, 0][:, None, None, :], base[None])].sum(-1).min(-1).astype(np.uint16)
        for i in range(0, len(consultas), lote)
    ])


def agrupar(pasta, limiar=LIMIAR_PERCEPTUAL):
    """Agrupa pasta/<classe>/<imagem> por classe, juntando fotos a até `limiar` bits uma da outra.

    O Sethy tem cada foto girada, espelhada e repetida em várias séries de arquivos; o Paddy Doctor
    tem 72 grupos de cópias byte a byte. Cópia no treino com a original no teste mede memória, não acerto.
    """
    pasta = Path(pasta)
    grupos = {}
    for pasta_classe in sorted(p for p in pasta.iterdir() if p.is_dir()):
        caminhos = sorted(pasta_classe.iterdir())
        da_classe = assinaturas(caminhos)
        pai = list(range(len(caminhos)))

        def raiz(i):
            while pai[i] != i:
                pai[i] = pai[pai[i]]
                i = pai[i]
            return i

        for i, j in zip(*np.nonzero(distancias_perceptuais(da_classe, da_classe) <= limiar)):
            pai[raiz(i)] = raiz(j)

        lotes = {}
        for i, caminho in enumerate(caminhos):
            lotes.setdefault(raiz(i), []).append(caminho.relative_to(pasta).as_posix())
        grupos[pasta_classe.name] = sorted(lotes.values())
    return grupos


def dividir(pasta, semente=42, proporcoes=(0.70, 0.15, 0.15)):
    """Divide pasta/<classe>/<imagem> em treino, validação e teste, estratificado por classe e sem
    separar fotos do mesmo grupo (ver `agrupar`)."""
    rng = random.Random(semente)
    partes = {"treino": [], "validacao": [], "teste": []}
    for classe, lotes in agrupar(pasta).items():
        rng.shuffle(lotes)
        fim_treino = round(len(lotes) * proporcoes[0])
        fim_validacao = fim_treino + round(len(lotes) * proporcoes[1])
        fatias = {"treino": lotes[:fim_treino], "validacao": lotes[fim_treino:fim_validacao], "teste": lotes[fim_validacao:]}
        for nome, fatia in fatias.items():
            partes[nome] += [(caminho, classe) for lote in fatia for caminho in lote]
    return partes
