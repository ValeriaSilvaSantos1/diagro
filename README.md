# diagro
Detecção de doenças em plantas via imagem, com persistência poliglota (PostgreSQL + MongoDB).
A primeira cultura é o arroz: o usuário envia a foto de uma folha e recebe a doença, a praga ou
a folha sadia que o modelo identificou, ou um resultado inconclusivo quando a foto foge do que o
modelo conhece.

## O que mora onde

| Onde | O que guarda | Por quê |
|---|---|---|
| PostgreSQL | usuários, culturas, catálogo (`doencas_catalogo`, com o `tipo` doença, praga ou sadia), metadados das imagens e diagnósticos | dados com relação e restrição: um diagnóstico concluído precisa de doença, confiança e inferência |
| MongoDB | coleção `inferencias`: o resultado bruto de cada inferência (probabilidades, limiar, distância, corte, vizinhos, tempo) | o formato do `resultado` muda com o tipo de modelo (classificação, detecção, segmentação) |
| RustFS (compatível com S3) | os arquivos das fotos | nenhuma imagem fica no PostgreSQL nem no MongoDB |

Os dois bancos se ligam pelos dois lados: `diagnosticos.inferencia_id` guarda o `_id` do documento,
e o documento guarda o `diagnostico_id`. O validador e os índices da coleção `inferencias` são
criados pela própria API quando ela sobe.

**O que acontece num `POST /analises`:** a API classifica a foto em memória (um arquivo que não abre
como imagem volta 422 sem gravar nada), guarda a foto no RustFS, cria o diagnóstico no PostgreSQL,
grava a inferência no MongoDB e atualiza o diagnóstico com o status, a doença do catálogo, a
confiança e o `inferencia_id`. Se o MongoDB estiver fora do ar, o diagnóstico fica com status
`erro` e a foto continua guardada. O `GET /analises/{id}` devolve o documento do MongoDB no campo
`inferencia`.

## Como rodar

Precisa de Docker, Python 3.13 e Node.js.

1. Copie o `.env.example` para `.env` na raiz e preencha usuários, senhas e o `JWT_SECRET`.
2. Suba os bancos e o armazenamento:

   ```bash
   docker compose up -d
   ```

3. Prepare o backend e aplique as migrations:

   ```bash
   cd backend
   python -m venv .venv
   .venv/bin/pip install -r requirements-dev.txt
   .venv/bin/alembic upgrade head
   ```

   **Rode o `alembic upgrade head` de novo sempre que puxar uma migration nova** (pasta
   `backend/migrations/versions/`). Sem isso, as rotas que usam a coluna nova dão erro 500.

4. Baixe o modelo (seção abaixo) e suba a API, de dentro de `backend/`:

   ```bash
   .venv/bin/uvicorn app.main:app --reload
   ```

   O `http://localhost:8000/health` mostra se PostgreSQL, MongoDB, RustFS e o modelo estão de pé.

5. Suba o front (detalhes em `frontend/README.md`):

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Testes

| Parte | Comando | Observação |
|---|---|---|
| backend | `cd backend && .venv/bin/pytest` | precisa do `docker compose up -d`; usa o banco `diagro_teste`, o bucket `diagro-imagens-teste` e o banco `diagro_teste` do MongoDB, nunca os de desenvolvimento |
| ml | `cd ml && pytest` | testes do pacote `diagro_ml` |
| front | `cd frontend && npm test` | Vitest |

O CI roda os três (`backend`, `ml` e `frontend`) em todo PR e push para a `development` e a `main`.

## Modelo

A API classifica as fotos com o modelo publicado nos releases do repositório pelo workflow de treino.
O arquivo `MODELO_APROVADO`, na raiz, diz qual release é o aprovado; é dele que o deploy e o comando
abaixo leem a tag. Para usar o modelo aprovado, baixe o release na raiz do repositório:

```bash
gh release download "$(cat MODELO_APROVADO)" --repo ValeriaSilvaSantos1/diagro --pattern '*' -D modelo
```

E aponte a variável `MODELO_DIR` do `.env` para essa pasta (o caminho é relativo a `backend/`,
de onde a API roda):

```
MODELO_DIR=../modelo
```

Sem `MODELO_DIR`, a API sobe sem modelo e o `/health` informa `"modelo": "não carregado"`; as
análises ficam com status `pendente`. Com `MODELO_DIR` apontando para uma pasta sem os arquivos do
release, a API não sobe.

O modelo é uma EfficientNet-B0 com dois portões: só conclui quando a confiança passa do limiar
calibrado e a foto está perto das imagens de treino (distância a um índice de vetores). Fora disso,
o resultado é inconclusivo.

| Release | Treino | Teste interno (macro-F1) | Teste externo |
|---|---|---|---|
| modelo-2 | Paddy Doctor | 0,967 | Sethy: 0,20 (sem índice, aceitava 92% das fotos com 19% de acerto) |
| modelo-4 | Paddy Doctor, com o índice | 0,967 | Sethy: 0,20, com 99,5% das fotos marcadas como fora do padrão |
| modelo-5 | Paddy Doctor + Sethy | 0,964 | Bangladesh: 0,245 |

O treino de 12/11 (Paddy Doctor, Sethy e o Training e o Validation do Bangladesh) chegou a 0,952 no
teste interno e 0,823 no Testing do Bangladesh, mas **não foi publicado**: reprovou no teste 5.10
(8,4% do teste interno fora do padrão, com teto de 7%). Nele, 58% das fotos de doenças que o modelo
não conhece passaram pelos dois portões. Como o Bangladesh entrou no treino, o Testing dele deixou
de ser um teste externo puro.

## Deploy (Easypanel)

A API e o front têm Dockerfile próprio, os dois construídos a partir da raiz do repositório. A API
sobe com o modelo aprovado dentro da imagem e roda `alembic upgrade head` antes de começar.

| Serviço no Easypanel | Origem | Dockerfile | Variáveis |
|---|---|---|---|
| PostgreSQL, MongoDB, RustFS | imagens `postgres:16`, `mongo:7`, `rustfs/rustfs:1.0.4` | (as do `docker-compose.yml`) | usuários e senhas |
| API | GitHub, branch `main`, Build Path `/` | `backend/Dockerfile` | as do `.env.example` menos `MODELO_DIR`, mais `POSTGRES_SERVER`, `MONGO_SERVER` e `S3_ENDPOINT_URL` com o nome interno de cada serviço, e `CORS_ORIGENS` com a URL pública do front |
| Front | GitHub, branch `main`, Build Path `/` | `frontend/Dockerfile` | `NEXT_PUBLIC_API_URL` com a URL pública da API (entra no build) |

**Cuidado com espaço no fim das variáveis coladas:** um espaço depois do usuário do MongoDB derruba a
autenticação, e o `/health` mostra `"mongodb": "erro"`.

**Atualização automática:** quando um push na `main` passa no CI, o workflow `deploy.yml` chama a
"Deployment Trigger" de cada serviço (aba Deployments do Easypanel). As duas URLs ficam nos secrets
`EASYPANEL_DEPLOY_API` e `EASYPANEL_DEPLOY_FRONT` do repositório. Para trocar o modelo em produção,
mude a tag em `MODELO_APROVADO` numa PR; quando ela chega à `main`, a API é reconstruída com ele.

## Fluxo de trabalho

Cada função sai de uma branch a partir da `development` e volta para ela por PR, com os checks do CI
verdes. A `development` vai para a `main` quando tudo estiver certo.
