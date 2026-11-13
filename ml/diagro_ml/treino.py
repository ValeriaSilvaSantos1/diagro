import argparse
import json
import random
import time
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from sklearn.metrics import f1_score
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms

from diagro_ml.calibracao import META_DE_ACERTO, calibrar_corte, calibrar_limiar, fracao_fora
from diagro_ml.dados import dividir
from diagro_ml.indice import Indice
from diagro_ml.modelo import TRANSFORMACAO, criar_rede, vetores

CLASSES = json.loads((Path(__file__).resolve().parents[1] / "classes.json").read_text())

AUMENTO = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.6, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(0.2, 0.2, 0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


class Imagens(Dataset):
    def __init__(self, raiz, itens, transformacao):
        self.raiz, self.itens, self.transformacao = Path(raiz), itens, transformacao

    def __len__(self):
        return len(self.itens)

    def __getitem__(self, i):
        caminho, classe = self.itens[i][:2]
        imagem = Image.open(self.raiz / caminho).convert("RGB")
        return self.transformacao(imagem), CLASSES.index(classe) if classe in CLASSES else -1


@torch.no_grad()
def probabilidades(rede, carregador):
    rede.eval()
    saidas, rotulos = [], []
    for entrada, rotulo in carregador:
        saidas.append(torch.softmax(rede(entrada), dim=1))
        rotulos.append(rotulo)
    return torch.cat(saidas).numpy(), torch.cat(rotulos).numpy()


def entradas(carregador):
    return (entrada for entrada, _ in carregador)


def macro_f1_com_ic(rotulos, previstos, labels, reamostras=1000, semente=42):
    f1 = f1_score(rotulos, previstos, labels=labels, average="macro", zero_division=0)
    rng = np.random.default_rng(semente)
    amostras = [
        f1_score(rotulos[i], previstos[i], labels=labels, average="macro", zero_division=0)
        for i in (rng.integers(0, len(rotulos), len(rotulos)) for _ in range(reamostras))
    ]
    return {"macro_f1": float(f1), "ic95": [float(np.percentile(amostras, 2.5)), float(np.percentile(amostras, 97.5))],
            "n": int(len(rotulos))}


def amostrar(itens, limite, semente):
    if not limite:
        return itens
    por_classe = {}
    for item in itens:
        por_classe.setdefault(item[1], []).append(item)
    rng = random.Random(semente)
    return [item for classe in sorted(por_classe) for item in rng.sample(por_classe[classe], min(limite, len(por_classe[classe])))]


def treinar(dados, saida, externo=None, epocas=12, lote=32, semente=42, limite_por_classe=None, pretreinada=True):
    torch.manual_seed(semente)
    saida = Path(saida)
    saida.mkdir(parents=True, exist_ok=True)
    partes = {nome: amostrar(itens, limite_por_classe, semente) for nome, itens in dividir(dados, semente).items()}

    def carregador(nome, transformacao, embaralhar=False):
        return DataLoader(Imagens(dados, partes[nome], transformacao), batch_size=lote, shuffle=embaralhar, num_workers=4)

    treino = carregador("treino", AUMENTO, embaralhar=True)
    validacao, teste = carregador("validacao", TRANSFORMACAO), carregador("teste", TRANSFORMACAO)

    rede = criar_rede(len(CLASSES), pretreinada)
    otimizador = torch.optim.AdamW(rede.parameters(), lr=1e-3, weight_decay=1e-4)
    agenda = torch.optim.lr_scheduler.CosineAnnealingLR(otimizador, epocas)
    perda = torch.nn.CrossEntropyLoss()
    melhor = -1.0
    for epoca in range(1, epocas + 1):
        inicio = time.time()
        rede.train()
        for entrada, rotulo in treino:
            otimizador.zero_grad()
            perda(rede(entrada), rotulo).backward()
            otimizador.step()
        agenda.step()
        p, y = probabilidades(rede, validacao)
        f1 = f1_score(y, p.argmax(1), average="macro")
        print(f"época {epoca}/{epocas}: macro-F1 na validação {f1:.4f} em {time.time() - inicio:.0f} s", flush=True)
        if f1 > melhor:
            melhor = f1
            torch.save(rede.state_dict(), saida / "pesos.pt")

    rede.load_state_dict(torch.load(saida / "pesos.pt"))
    print("calibrando o limiar na validação", flush=True)
    p, y = probabilidades(rede, validacao)
    confiancas, acertos = p.max(1).tolist(), (p.argmax(1) == y).tolist()
    limiar = calibrar_limiar(confiancas, acertos)
    (saida / "validacao.json").write_text(json.dumps({"confiancas": confiancas, "acertos": acertos}))

    treino_ordenado = carregador("treino", TRANSFORMACAO)
    indice = Indice(vetores(rede, entradas(treino_ordenado)), [item[1] for item in partes["treino"]], [item[0] for item in partes["treino"]])
    indice.salvar(saida / "indice.npz")
    corte = calibrar_corte(indice.distancias(vetores(rede, entradas(validacao))), [item[2] for item in partes["validacao"]])
    print(f"índice com {len(indice.vetores)} imagens de treino, corte {corte:.4f}; avaliando o teste", flush=True)

    p, y = probabilidades(rede, teste)
    aceitos = p.max(1) >= limiar
    distancias_teste = indice.distancias(vetores(rede, entradas(teste)))
    metricas = {
        "arquitetura": "efficientnet_b0",
        "epocas": epocas,
        "meta_de_acerto": META_DE_ACERTO,
        "limiar": limiar,
        "corte": corte,
        "validacao": {"macro_f1": float(melhor)},
        "teste": {
            **macro_f1_com_ic(y, p.argmax(1), list(range(len(CLASSES)))),
            "cobertura": float(aceitos.mean()),
            "acerto_nos_aceitos": float((p.argmax(1) == y)[aceitos].mean()) if aceitos.any() else None,
            "fora_do_padrao": fracao_fora(distancias_teste, [item[2] for item in partes["teste"]], corte),
            "fora_do_padrao_por_arquivo": float((distancias_teste > corte).mean()),
        },
    }
    if externo:
        print("avaliando o teste externo", flush=True)
        metricas["externo"] = avaliar_externo(rede, externo, lote, indice, corte, limiar)
    (saida / "metricas.json").write_text(json.dumps(metricas, indent=2, ensure_ascii=False))
    return metricas


def avaliar_externo(rede, pasta, lote, indice, corte, limiar):
    """Dataset de outra fonte. Pastas com nome de classe do modelo medem acerto; as outras são
    doenças que o modelo não conhece, em que toda foto aceita pelos dois portões (confiança e
    distância ao índice) vira um diagnóstico errado."""
    pasta = Path(pasta)
    todos = [(c.relative_to(pasta).as_posix(), c.parent.name) for c in sorted(pasta.glob("*/*"))]

    def carregador(itens):
        return DataLoader(Imagens(pasta, itens, TRANSFORMACAO), batch_size=lote, num_workers=4)

    def avaliar(itens):
        p, y = probabilidades(rede, carregador(itens))
        distancias = indice.distancias(vetores(rede, entradas(carregador(itens))))
        return p, y, distancias, (p.max(1) >= limiar) & (distancias <= corte)

    conhecidas = [item for item in todos if item[1] in CLASSES]
    desconhecidas = [item for item in todos if item[1] not in CLASSES]
    p, y, distancias, aceitos = avaliar(conhecidas)
    acertos = p.argmax(1) == y
    presentes = sorted({int(r) for r in y})
    resultado = {**macro_f1_com_ic(y, p.argmax(1), presentes), "classes": [CLASSES[i] for i in presentes],
                 "fora_do_padrao": float((distancias > corte).mean()), "aceitos": float(aceitos.mean()),
                 "acerto_nos_aceitos": float(acertos[aceitos].mean()) if aceitos.any() else None}
    if desconhecidas:
        _, _, distancias, aceitos = avaliar(desconhecidas)
        resultado["desconhecidas"] = {"n": len(desconhecidas), "classes": sorted({c for _, c in desconhecidas}),
                                      "fora_do_padrao": float((distancias > corte).mean()), "aceitos": float(aceitos.mean())}
    return resultado


if __name__ == "__main__":
    argumentos = argparse.ArgumentParser()
    argumentos.add_argument("--dados", required=True)
    argumentos.add_argument("--saida", required=True)
    argumentos.add_argument("--externo")
    argumentos.add_argument("--epocas", type=int, default=12)
    argumentos.add_argument("--limite-por-classe", type=int)
    a = argumentos.parse_args()
    print(json.dumps(treinar(a.dados, a.saida, a.externo, a.epocas, limite_por_classe=a.limite_por_classe), indent=2))
