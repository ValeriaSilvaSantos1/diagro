import numpy as np
import torch
from torchvision import models, transforms

TRANSFORMACAO = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


class Classificador:
    def __init__(self, rede: torch.nn.Module, classes: list[str]):
        self.rede = rede.eval()
        self.classes = classes

    @torch.no_grad()
    def prever(self, imagem) -> dict[str, float]:
        entrada = TRANSFORMACAO(imagem.convert("RGB")).unsqueeze(0)
        probabilidades = torch.softmax(self.rede(entrada), dim=1)[0]
        return dict(zip(self.classes, probabilidades.tolist()))

    def vetor(self, imagem) -> np.ndarray:
        return vetores(self.rede, [TRANSFORMACAO(imagem.convert("RGB")).unsqueeze(0)])[0]


def criar_rede(n_classes: int, pretreinada: bool = True) -> torch.nn.Module:
    rede = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1 if pretreinada else None)
    rede.classifier[1] = torch.nn.Linear(rede.classifier[1].in_features, n_classes)
    return rede


@torch.no_grad()
def vetores(rede: torch.nn.Module, lotes) -> np.ndarray:
    """Vetor normalizado da penúltima camada da EfficientNet, que é o que o índice compara."""
    rede.eval()
    saidas = [torch.nn.functional.normalize(torch.flatten(rede.avgpool(rede.features(lote)), 1), dim=1) for lote in lotes]
    return torch.cat(saidas).numpy()
