# API do Diagro com o modelo aprovado dentro da imagem.
# Construída a partir da raiz do repositório: docker build -f backend/Dockerfile .
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Dependências antes do código: o torch só é baixado de novo quando o requirements.txt muda.
COPY backend/requirements.txt backend/requirements.txt
RUN grep -v '^-e ' backend/requirements.txt > /tmp/requirements.txt \
    && pip install -r /tmp/requirements.txt

COPY ml/pyproject.toml ml/classes.json ml/
COPY ml/diagro_ml ml/diagro_ml
RUN pip install --no-deps -e ml

# Release do modelo indicado em MODELO_APROVADO, baixado dos releases públicos do repositório.
COPY MODELO_APROVADO .
RUN python -c "import pathlib, urllib.request; \
tag = pathlib.Path('MODELO_APROVADO').read_text().strip(); \
destino = pathlib.Path('modelo'); destino.mkdir(); \
[urllib.request.urlretrieve(f'https://github.com/ValeriaSilvaSantos1/diagro/releases/download/{tag}/{nome}', destino / nome) \
 for nome in ('pesos.pt', 'indice.npz', 'classes.json', 'metricas.json')]; \
print('modelo', tag, 'baixado')"
ENV MODELO_DIR=/app/modelo

COPY backend backend
WORKDIR /app/backend

EXPOSE 8000
# As migrations rodam a cada subida, antes da API: coluna nova não chega sem elas.
CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]
