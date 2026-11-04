# Diagro — Frontend

Interface web do Diagro, construída com Next.js (App Router), React, TypeScript e Tailwind CSS.

## Como rodar

```bash
cp .env.example .env.local
npm install
npm run dev
```

Acesse http://localhost:3000.

## Estrutura

```
frontend/
├── public/              # arquivos estáticos (imagens, ícones)
└── src/
    ├── app/             # rotas, layouts e páginas (App Router)
    │   └── (marketing)/ # landing page: _components (seções) e _data (textos)
    ├── components/
    │   ├── layout/      # peças de layout compartilhadas (Logo...)
    │   └── ui/          # componentes do shadcn (Button, Sheet...)
    ├── hooks/           # hooks React customizados
    ├── lib/             # utilitários e configuração (env, rotas)
    ├── services/        # comunicação com a API do backend
    └── types/           # tipos e interfaces TypeScript compartilhados
```

## Convenções

- `src/app` contém apenas arquivos de rota (`page.tsx`, `layout.tsx`, `loading.tsx`...). Componentes usados por uma única rota podem ficar em uma pasta privada `_components` dentro dela.
- Imports internos usam o alias `@/` (aponta para `src/`), ex.: `import { api } from "@/services/api"`.
- Componentes em PascalCase (`UploadForm.tsx`); hooks com prefixo `use` (`useUpload.ts`); demais arquivos em camelCase.
- Toda chamada ao backend passa por `src/services`, nunca direto de um componente.
- Textos e listas da landing ficam em `src/app/(marketing)/_data/content.ts`: para mudar conteúdo, edite esse arquivo, não os componentes.
- URLs internas vêm de `src/lib/routes.ts` (ex.: `routes.login`), nunca escritas direto no componente.
- Cores, fontes, sombras e animações são tokens do `src/app/globals.css` (`bg-agro`, `text-ink`, `shadow-raised`...). Evite cores soltas como `#28784b` nos componentes.
- Ao estilizar um `Link` como botão, use `cn(buttonVariants({ ... }))`: o `cn` resolve conflitos de classes entre a base e a variante.
- Variáveis de ambiente ficam em `.env.local` (não versionado); novas variáveis devem ser documentadas em `.env.example`.
