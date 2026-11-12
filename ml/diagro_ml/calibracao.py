import numpy as np

META_DE_ACERTO = 0.95
PERCENTIL_DO_CORTE = 95


def calibrar_limiar(confiancas, acertos, meta=META_DE_ACERTO):
    """Menor confiança a partir da qual o modelo acerta pelo menos `meta` dos casos que aceita."""
    pares = sorted(zip(confiancas, acertos), reverse=True)
    limiar, certos = None, 0
    for aceitos, (confianca, acerto) in enumerate(pares, start=1):
        certos += acerto
        if certos / aceitos >= meta:
            limiar = confianca
    if limiar is None:
        raise ValueError(f"nenhum limiar atinge {meta:.0%} de acerto na validação")
    return limiar


def calibrar_corte(distancias, percentil=PERCENTIL_DO_CORTE):
    """Distância ao vizinho acima da qual a foto é tratada como fora do padrão do treino."""
    return float(np.percentile(distancias, percentil))
