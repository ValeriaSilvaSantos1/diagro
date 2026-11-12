import hashlib
import io
import json
from dataclasses import dataclass
from pathlib import Path

import torch
from PIL import Image, UnidentifiedImageError

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
    modelo_versao: str


class ClassificadorService:
    """Roda o classificador e decide entre concluído e inconclusivo pelo limiar calibrado no treino."""

    def __init__(self, classificador, limiar: float, modelo_versao: str):
        self.classificador = classificador
        self.limiar = limiar
        self.modelo_versao = modelo_versao

    @classmethod
    def carregar(cls, pasta: Path) -> "ClassificadorService":
        """Lê os arquivos de um release do treino: pesos.pt, classes.json e metricas.json."""
        pasta = Path(pasta)
        classes = json.loads((pasta / "classes.json").read_text())
        metricas = json.loads((pasta / "metricas.json").read_text())
        pesos = (pasta / "pesos.pt").read_bytes()
        rede = criar_rede(len(classes), pretreinada=False)
        rede.load_state_dict(torch.load(io.BytesIO(pesos), map_location="cpu"))
        versao = f"{metricas['arquitetura']}-{hashlib.sha256(pesos).hexdigest()[:12]}"
        return cls(Classificador(rede, classes), metricas["limiar"], versao)

    def classificar(self, conteudo: bytes) -> Resultado:
        try:
            imagem = Image.open(io.BytesIO(conteudo))
            imagem.load()
        except (UnidentifiedImageError, OSError) as erro:
            raise ImagemInvalida from erro

        probabilidades = self.classificador.prever(imagem)
        top1 = max(probabilidades, key=probabilidades.get)
        confianca = probabilidades[top1]
        concluido = confianca >= self.limiar
        return Resultado(
            status="concluido" if concluido else "inconclusivo",
            label=top1 if concluido else None,
            confianca=confianca,
            probabilidades=probabilidades,
            limiar=self.limiar,
            modelo_versao=self.modelo_versao,
        )
