import hashlib
import io
import json
from dataclasses import dataclass
from pathlib import Path

import torch
from PIL import Image, UnidentifiedImageError

from diagro_ml.indice import Indice, Vizinho
from diagro_ml.modelo import Classificador, criar_rede


class ImagemInvalida(Exception):
    """O arquivo enviado não abre como imagem."""


@dataclass
class Resultado:
    status: str
    label: str | None
    confianca: float
    probabilidades: dict[str, float]
    limiar: float
    distancia: float
    corte: float
    vizinhos: list[Vizinho]
    modelo_versao: str


class ClassificadorService:
    """Roda o classificador e conclui só quando a confiança passa do limiar e a foto está perto das
    imagens de treino. Limiar e corte são os calibrados no treino."""

    def __init__(self, classificador, limiar: float, indice: Indice, corte: float, modelo_versao: str):
        self.classificador = classificador
        self.limiar = limiar
        self.indice = indice
        self.corte = corte
        self.modelo_versao = modelo_versao

    @classmethod
    def carregar(cls, pasta: Path) -> "ClassificadorService":
        """Lê os arquivos de um release do treino: pesos.pt, indice.npz, classes.json e metricas.json."""
        pasta = Path(pasta)
        classes = json.loads((pasta / "classes.json").read_text())
        metricas = json.loads((pasta / "metricas.json").read_text())
        pesos = (pasta / "pesos.pt").read_bytes()
        rede = criar_rede(len(classes), pretreinada=False)
        rede.load_state_dict(torch.load(io.BytesIO(pesos), map_location="cpu"))
        versao = f"{metricas['arquitetura']}-{hashlib.sha256(pesos).hexdigest()[:12]}"
        indice = Indice.carregar(pasta / "indice.npz")
        return cls(Classificador(rede, classes), metricas["limiar"], indice, metricas["corte"], versao)

    def classificar(self, conteudo: bytes) -> Resultado:
        try:
            imagem = Image.open(io.BytesIO(conteudo))
            imagem.load()
        except (UnidentifiedImageError, OSError) as erro:
            raise ImagemInvalida from erro

        probabilidades = self.classificador.prever(imagem)
        top1 = max(probabilidades, key=probabilidades.get)
        confianca = probabilidades[top1]
        vetor = self.classificador.vetor(imagem)
        distancia = float(self.indice.distancias(vetor)[0])
        concluido = confianca >= self.limiar and distancia <= self.corte
        return Resultado(
            status="concluido" if concluido else "inconclusivo",
            label=top1 if concluido else None,
            confianca=confianca,
            probabilidades=probabilidades,
            limiar=self.limiar,
            distancia=distancia,
            corte=self.corte,
            vizinhos=self.indice.vizinhos(vetor),
            modelo_versao=self.modelo_versao,
        )
