import torch
from torchvision import transforms

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
