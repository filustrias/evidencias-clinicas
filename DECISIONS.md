# Registro de decisões (ADR)

Decisões locais tomadas durante o scaffold inicial e ambiguidades resolvidas, em formato ADR enxuto: contexto + decisão + consequências.

---

## ADR-001 — Setup manual do Astro em vez de `npm create astro@latest`

**Contexto.** O brief (§ 12, passo 2) prescreve `npm create astro@latest .`. O Node disponível no ambiente é v20.11.1; a versão atual de `create-astro` (5.x) requer Node ≥ 22.12. O CLI de scaffold falha imediatamente. A runtime do Astro 5.x, porém, suporta Node 20.3+.

**Decisão.** Configurar o projeto manualmente: `package.json`, `astro.config.mjs`, `tsconfig.json` (estendendo `astro/tsconfigs/strict`) e `tailwind.config.js` escritos diretamente. `npm install` resolveu Astro 5.18.1 e dependências.

**Consequências.** Resultado funcionalmente equivalente ao scaffold via CLI. Quando o projeto for rodado em Node ≥ 22, todas as features funcionam normalmente. Avisos de `EBADENGINE` aparecem no install (chokidar 5 pede 20.19+) mas não bloqueiam build/dev — ainda assim, recomendo subir para Node 22 LTS antes de produção.

---

## ADR-002 — Tailwind 3 + `@astrojs/tailwind` em vez de Tailwind 4 nativo

**Contexto.** O brief (§ 12, passo 7) usa sintaxe de configuração JS com `theme.extend.colors`, etc., característica do Tailwind v3. Tailwind v4 introduz `@theme` em CSS e tem outra integração com Astro (Vite plugin direto).

**Decisão.** Manter Tailwind v3 (`tailwindcss@^3.4`) com integração legacy `@astrojs/tailwind@^6` para casar exatamente com o brief.

**Consequências.** Migração para v4 fica como trabalho futuro, se desejado — exigirá converter `tailwind.config.js` para `@theme { ... }` no CSS e trocar a integração. As tokens em CSS variables continuam compatíveis com qualquer versão.

---

## ADR-003 — `lucide-astro` substituído por `@lucide/astro`

**Contexto.** O brief (§ 12, passo 4) sugere `lucide-astro`. O pacote foi formalmente depreciado em favor de `@lucide/astro` (mensagem do próprio npm registry).

**Decisão.** Usar `@lucide/astro@^1.14`.

**Consequências.** API idêntica para o consumidor; nenhum import foi escrito ainda no scaffold (componentes UI usam SVGs inline para ícones simples). Quando ícones reais forem usados, a importação será `import { IconName } from '@lucide/astro'`.

---

## ADR-004 — Diretório do projeto: `~/OneDrive/Desktop/evidencias-clinicas`

**Contexto.** Usuário escolheu este caminho explicitamente.

**Decisão.** Manter, com ressalva.

**Consequências.** OneDrive sincroniza `node_modules`, o que pode causar conflitos `EPERM` durante `npm install` (já observado uma vez no scaffold inicial — recuperou sozinho). Recomendação: configurar OneDrive para excluir `node_modules` desta pasta, ou marcá-la como "Sempre manter neste dispositivo".

---

## ADR-005 — Deploy: apenas GitHub Pages (sem Cloudflare Pages)

**Contexto.** O brief (§ 10) sugere Cloudflare Pages como preferencial pelos PoPs em Joanesburgo/Lagos, mas oferece GitHub Pages como alternativa.

**Decisão.** Usuário optou por **apenas GitHub Pages**. Workflow em `.github/workflows/deploy.yml`, ativado em push para `main`.

**Consequências.** Latência maior em Moçambique/Angola que com Cloudflare. Caso a performance regional vire uma preocupação, basta conectar o repositório no dashboard do Cloudflare Pages depois — o build é compatível (CF Pages chama `npm run build` e serve `dist/`). O `astro.config.mjs` ajusta `base` automaticamente conforme `process.env.GITHUB_ACTIONS`, então pode ser preciso revisitar caso sirva via outro provedor.

---

## ADR-006 — 39 rotas em vez das "38" mencionadas no brief

**Contexto.** O resumo do brief (§ 9) diz "Total: 38 rotas", mas a enumeração completa lista **39** páginas (5 raiz + 6 cinco-as + 15 conceitos + 5 ferramentas + 3 calculadoras + 5 em-pratica).

**Decisão.** Criar todas as 39 conforme listadas. O número "38" parece ser erro de contagem no resumo.

**Consequências.** Nenhuma — o site cobre todas as rotas explicitamente listadas. Se o autor pretendia 38, basta apontar qual remover.

---

## ADR-007 — Sem `src/content/config.ts` no scaffold inicial

**Contexto.** O brief (§ 3) lista `src/content/config.ts` na estrutura. Astro 5 mudou para `src/content.config.ts` (singular, na raiz de `src/`) como recomendação atual.

**Decisão.** Não criar o arquivo agora. As pastas `src/content/{conceitos,cinco-as,ferramentas,em-pratica}/` foram criadas vazias para receber markdown depois. Quando o conteúdo começar a chegar, criar `src/content.config.ts` definindo as collections com Zod schemas. Pastas vazias não impactam o build.

**Consequências.** Próxima entrega de conteúdo precisa começar criando o `content.config.ts` com os schemas. Documentar isso na conversa quando o markdown vier.

---

## ADR-008 — Pesos de fonte: 400 e 500 (seguindo brief), sem 600/700

**Decisão de design vinda diretamente do brief, registrada para visibilidade.** Manchetes e elementos "fortes" usam `font-weight: 500` em vez de 600/700. CSS dos componentes UI segue isso. Para sobrescrever pontualmente, usar `font-medium` (Tailwind = 500) — `font-semibold` (600) e `font-bold` (700) **não devem** ser introduzidos sem decisão consciente.
