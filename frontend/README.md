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
    ├── components/
    │   ├── layout/      # header, footer, sidebar...
    │   └── ui/          # componentes visuais reutilizáveis (Button, Input...)
    ├── hooks/           # hooks React customizados
    ├── lib/             # utilitários e configuração (env, helpers)
    ├── services/        # comunicação com a API do backend
    └── types/           # tipos e interfaces TypeScript compartilhados
```

## Convenções

- `src/app` contém apenas arquivos de rota (`page.tsx`, `layout.tsx`, `loading.tsx`...). Componentes usados por uma única rota podem ficar em uma pasta privada `_components` dentro dela.
- Imports internos usam o alias `@/` (aponta para `src/`), ex.: `import { api } from "@/services/api"`.
- Componentes em PascalCase (`UploadForm.tsx`); hooks com prefixo `use` (`useUpload.ts`); demais arquivos em camelCase.
- Toda chamada ao backend passa por `src/services`, nunca direto de um componente.
- Variáveis de ambiente ficam em `.env.local` (não versionado); novas variáveis devem ser documentadas em `.env.example`.
