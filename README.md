# Site de marketing MicroGrind

Fontes das páginas públicas de https://microgrind.app (PT-PT e inglês). Não inclui a app, o Supabase, nem ficheiros `.env` — esses ficam no repositório `MicroGrind`.

## Estrutura

- `marketing/` — gerador do site (Node.js, sem dependências): conteúdo, render, CSS/JS e o teste.
  - `marketing/practice/` — conteúdo das páginas gratuitas **Praticar** (`/praticar/…`): mini-testes e flashcards por disciplina.
  - `marketing/practice-page.mjs`, `practice.js`, `practice.css` — render e interatividade dessas páginas.
- `site-static/` — output gerado (HTML, CSS minificado, `sitemap.xml`, `robots.txt`, `_redirects`, `_headers`, `404.html`). Está no git; o teste falha se estiver desatualizado.
  - `marketing/assets.mjs` — cada CSS/JS/fonte é publicado com `?v=<hash do conteúdo>`; o `_headers` guarda-os em cache durante um ano. Não há versões para mudar à mão.
  - `marketing/lastmod.json` — data da última alteração do conteúdo (`<main>`) de cada página, usada no `sitemap.xml`. O `npm run build` atualiza-o sozinho; faz commit dele com o resto.
  - `_headers` — `noindex` na web app (`/app/*`) e nas cópias em `*.pages.dev`; o `assemble-pages-site.mjs` junta-o ao `_headers` da app.
  - `404.html` — o Cloudflare Pages devolve-o com código 404 para endereços que não existem (sem ele, mostrava a página inicial com 200).
- `deploy/site-root/` — ficheiros que só existem no site publicado (favicons, `og.png`, `logo-mark.png`).
- `lib/ga4.mjs` — Google Analytics/pixel (só depois do consentimento). Cópia do `lib/ga4.ts` da app.
- `lib/app-limits.mjs` — números dos planos copiados da app.
- `scripts/assemble-pages-site.mjs` — junta `deploy/site-root` + `site-static` + o export da app (`dist/`) na pasta enviada ao Cloudflare Pages.
- `scripts/check-app-parity.mjs` — confirma que `lib/app-limits.mjs` e `lib/ga4.mjs` batem certo com a app.

## Comandos (Node.js 22.18+)

```bash
npm run build   # escreve site-static/ (não publica)
npm test        # testes + verificação de que site-static/ está atualizado
```

## Adicionar uma página Praticar

1. Escreve a página num ficheiro de `marketing/practice/` (perguntas: `{ q, right, wrong: [3], why }`; flashcards: `{ front, back }`).
2. Acrescenta-a a `PAGES` em `marketing/practice/index.mjs`.
3. `npm run build && npm test` e faz commit de `site-static/`.

## Publicação

O site e a web app são publicados juntos no projeto Cloudflare Pages `microgrind`, pelo workflow **"Publicar site"** (`.github/workflows/publish-site.yml`) do repositório `MicroGrind`. Esse workflow faz checkout deste repositório, corre `npm run build` + `npm test` + `check-app-parity`, exporta a app e monta tudo com `scripts/assemble-pages-site.mjs`.
