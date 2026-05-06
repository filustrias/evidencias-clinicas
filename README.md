# evidências clínicas

Site educacional sobre Medicina Baseada em Evidências (MBE), com foco em decisões clínicas — voltado a médicos de Moçambique, Angola e países lusófonos.

## Stack

- **Astro 5** com Content Collections — site estático, sem servidor
- **Tailwind CSS 3** — utility-first styling com tokens via CSS variables
- **TypeScript** — modo `strict`
- **Fontsource** — Inter (sans), Source Serif 4 (serif), JetBrains Mono (mono) auto-hospedadas
- **Pagefind** — busca client-side gerada no build
- **@lucide/astro** — ícones

## Pré-requisitos

Node.js **20.3+** ou **22+**, npm 10+.

## Desenvolvimento

```bash
npm install
npm run dev          # http://localhost:4321
```

A busca (Pagefind) **não funciona em dev** — o índice é gerado no build de produção. Para testá-la localmente, rode `npm run build && npm run preview`.

## Build

```bash
npm run build        # gera dist/ + dist/pagefind/
npm run preview      # serve dist/ localmente
```

## Estrutura

```
src/
├── pages/              # 39 rotas (.astro)
├── content/            # markdown via Content Collections (a popular)
├── components/
│   ├── layout/         # Header, Footer, Sidebar, TOC, MobileNav
│   ├── ui/             # Button, Card, Callout, Badge, ConceptCard, CodeBlock
│   ├── theme/          # ThemePanel ("Aa")
│   ├── search/         # SearchInput (Pagefind)
│   └── calculadoras/   # placeholders das calculadoras
├── layouts/            # BaseLayout, PageLayout, DocLayout
├── styles/             # global.css (tokens), prose.css
├── scripts/            # theme-controls.ts
└── data/               # navigation.ts
```

## Sistema de tema

O painel **Aa** no header expõe três controles independentes:

| Controle | Atributo | Valores | Persistência |
|---|---|---|---|
| Tema | `<html data-theme>` | `auto` (default), `light`, `dark` | `localStorage.ec-theme` |
| Tamanho | `<html data-size>` | `default`, `small`, `large` | `localStorage.ec-size` |
| Fonte | `<body data-font>` | `sans` (default), `serif` | `localStorage.ec-font` |

Um script anti-FOUC inline no `<head>` aplica preferências antes do CSS renderizar.

## Deploy

GitHub Pages via workflow em `.github/workflows/deploy.yml`. Deploy automático a cada push em `main`. URL: `https://filustrias.github.io/evidencias-clinicas/`.

A configuração do Astro detecta `process.env.GITHUB_ACTIONS` para ajustar o `base` automaticamente.

## Licenças

- **Código:** [MIT](./LICENSE)
- **Conteúdo educacional:** [CC BY-SA 4.0](./CONTENT-LICENSE.md)

## Decisões e ambiguidades

Decisões locais tomadas durante o scaffold (e ambiguidades resolvidas) ficam em [DECISIONS.md](./DECISIONS.md), em formato ADR.
