# diagro
Detecção de doenças em plantas via imagem, com persistência poliglota (PostgreSQL + MongoDB).

## Modelo

A API classifica as fotos com o modelo publicado nos releases do repositório pelo workflow de treino.
Para usar o modelo aprovado, baixe o release na raiz do repositório:

```bash
gh release download modelo-5 --repo ValeriaSilvaSantos1/diagro --pattern '*' -D modelo
```

E aponte a variável `MODELO_DIR` do `.env` para essa pasta (o caminho é relativo a `backend/`,
de onde a API roda):

```
MODELO_DIR=../modelo
```

Sem `MODELO_DIR`, a API sobe sem modelo e o `/health` informa `"modelo": "não carregado"`. Com
`MODELO_DIR` apontando para uma pasta sem os arquivos do release, a API não sobe.
