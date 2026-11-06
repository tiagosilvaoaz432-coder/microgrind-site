# Site de marketing MicroGrind

Pacote autónomo das páginas públicas (PT-PT e inglês). Não inclui a app, o Supabase, nem ficheiros `.env`.

## Estrutura

- `marketing/` — fontes do site:
  - `home.mjs` + `home-copy.mjs` — página inicial (PT e EN): secções, demos interativas e textos.
  - `chrome.mjs` — cabeçalho, menu mobile, rodapé e diálogo de instalação, partilhados por todas as páginas.
  - `render.mjs` + `content.mjs` + `comparisons.mjs` — páginas de conteúdo e comparações (`vs-copy.md`).
  - `mg.css` + `mg.js` — sistema de design e runtime (animações, demos, acessibilidade). Sem dependências.
  - `fonts/` — Bricolage Grotesque, Geist e Geist Mono (OFL), servidas pelo próprio site.
  - `site.css` e `motion.css` — estilos antigos, ainda carregados pelas páginas de conteúdo antes de `mg.css`.
- `site-static/` — HTML, CSS, JS, fontes, `sitemap.xml`, `robots.txt`, `_redirects` e `_headers`. É o diretório de output do Cloudflare Pages.
- `scripts/check-site-static.mjs` — helper importado pelo teste. Confirma que o output não coloca ficheiros em `app/`.

As demos da página inicial usam dados fictícios e estão identificadas como demonstrações.
Ao mudar `mg.css` ou `mg.js`, atualiza `ASSET_VERSION` em `marketing/chrome.mjs` para invalidar a cache.

## Como gerar

Na raiz deste pacote, com Node.js:

```bash
npm run build
```

O comando escreve as páginas em `site-static/`. Não publica.

## Teste

```bash
npm test
```

Corre `node marketing/seo-site.test.mjs`.

## Cloudflare Pages

Diretório de output: `site-static`.
