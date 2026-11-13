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


def pesos_por_grupo(grupos):
    """Peso 1/tamanho para cada foto, para que cada grupo de cópias some 1. A divisão sorteia grupos,
    não fotos: sem o peso, uma foto do Sethy copiada 48 vezes vale 48 fotos no corte e na métrica."""
    tamanhos = {}
    for grupo in grupos:
        tamanhos[grupo] = tamanhos.get(grupo, 0) + 1
    return np.array([1 / tamanhos[grupo] for grupo in grupos])


def calibrar_corte(distancias, grupos=None, percentil=PERCENTIL_DO_CORTE):
    """Distância ao vizinho acima da qual a foto é tratada como fora do padrão do treino: o percentil
    das distâncias da validação, com cada grupo de cópias pesando uma vez. Sem `grupos`, cada foto é
    o próprio grupo e o resultado é o np.percentile."""
    distancias = np.asarray(distancias, dtype=np.float64)
    pesos = np.ones(len(distancias)) if grupos is None else pesos_por_grupo(grupos)
    ordem = np.argsort(distancias, kind="stable")
    d, w = distancias[ordem], pesos[ordem]
    # Posição de cada valor entre 0 e 1; com pesos iguais, é a interpolação linear do np.percentile.
    posicoes = (np.cumsum(w) - w) / (w.sum() - w[-1])
    return float(np.interp(percentil / 100, posicoes, d))


def fracao_fora(distancias, grupos, corte):
    """Fração das fotos fora do padrão, com cada grupo de cópias pesando uma vez."""
    pesos = pesos_por_grupo(grupos)
    return float((pesos * (np.asarray(distancias) > corte)).sum() / pesos.sum())
