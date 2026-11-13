from dataclasses import dataclass
from pathlib import Path

import numpy as np


@dataclass
class Vizinho:
    classe: str
    caminho: str
    distancia: float


class Indice:
    """Vetores das imagens de treino com classe e caminho de cada uma. Distância é 1 menos o cosseno."""

    def __init__(self, vetores: np.ndarray, classes: list[str], caminhos: list[str]):
        self.vetores = np.asarray(vetores, dtype=np.float32)
        self.classes = list(classes)
        self.caminhos = list(caminhos)

    def distancias(self, consultas: np.ndarray, lote: int = 512) -> np.ndarray:
        """Distância de cada consulta à imagem mais parecida do índice."""
        consultas = np.atleast_2d(consultas)
        return np.concatenate(
            [1 - (consultas[i:i + lote] @ self.vetores.T).max(1) for i in range(0, len(consultas), lote)]
        )

    def vizinhos(self, consulta: np.ndarray, n: int = 3) -> list[Vizinho]:
        distancias = 1 - self.vetores @ consulta
        return [Vizinho(self.classes[i], self.caminhos[i], float(distancias[i])) for i in np.argsort(distancias, kind="stable")[:n]]

    def salvar(self, caminho: Path) -> None:
        np.savez(caminho, vetores=self.vetores.astype(np.float16), classes=self.classes, caminhos=self.caminhos)

    @classmethod
    def carregar(cls, caminho: Path) -> "Indice":
        with np.load(caminho, allow_pickle=False) as dados:
            return cls(dados["vetores"], dados["classes"].tolist(), dados["caminhos"].tolist())
