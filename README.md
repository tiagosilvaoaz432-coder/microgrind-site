# Site de marketing MicroGrind

Pacote autónomo das páginas públicas (PT-PT e inglês). Não inclui a app, o Supabase, nem ficheiros `.env`.

## Estrutura

- `marketing/` — fontes do site: conteúdo, render, CSS, snapshots da página inicial e o teste.
- `site-static/` — HTML, CSS, `sitemap.xml`, `robots.txt`, `_redirects` e `_headers`. É o diretório de output do Cloudflare Pages.
- `scripts/check-site-static.mjs` — helper importado pelo teste. Confirma que o output não coloca ficheiros em `app/`.

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
