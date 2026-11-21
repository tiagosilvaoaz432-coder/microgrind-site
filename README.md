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
- `lib/attribution.mjs`, `lib/web-hit.mjs` — origem da visita (`utm_*`, guardada em `sessionStorage['mg-attr']`) e contador de visitas sem cookies (`record_web_hit`). Cópias de `lib/attribution.ts` e `lib/web-hit.ts` da app.
- `marketing/mg-attr-boot.mjs` — script de todas as páginas: guarda a origem, junta os `utm_*` aos links para `/app/` (`href`, `data-web`, `data-ig-copy`) e conta a visita (`site` ou `mapa`). Corre sem consentimento de cookies; o GA4 e o pixel continuam à espera do «Aceitar».
- `marketing/bundle-mg-attr.mjs` — junta os três ficheiros acima em `site-static/mg-attr.js` (IIFE, sem comentários, sem dependências).
- `scripts/assemble-pages-site.mjs` — junta `deploy/site-root` + `site-static` + o export da app (`dist/`) na pasta enviada ao Cloudflare Pages e, se houver `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` no ambiente, injeta `window.__MG_HIT__` nas páginas (`scripts/inject-web-hit-config.mjs`).
- `scripts/check-app-parity.mjs` — confirma que `lib/app-limits.mjs`, `lib/ga4.mjs`, `lib/attribution.mjs`, `lib/web-hit.mjs` e o aviso de cookies batem certo com a app e com as funções SQL (`private.ads_clean_*`, `record_web_hit`).

## Comandos (Node.js 22.18+)

```bash
npm run build   # escreve site-static/ (não publica)
npm test        # testes + verificação de que site-static/ está atualizado
```

## Adicionar uma página Praticar

1. Escreve a página num ficheiro de `marketing/practice/` (perguntas: `{ q, right, wrong: [3], why }`; flashcards: `{ front, back }`).
2. Acrescenta-a a `PAGES` em `marketing/practice/index.mjs`.
3. `npm run build && npm test` e faz commit de `site-static/`.

## Contador de visitas e chave anon

O URL do Supabase e a chave anon **nunca** vão para o git, para `site-static/` nem para `mg-attr.js`. Só a pasta montada para publicar recebe `<script>window.__MG_HIT__=…</script>` antes de `/mg-attr.js`. Sem as duas variáveis (build local, Site CI), nada é injetado e as páginas não contam visitas. Se só houver uma das duas, se o URL não for uma origem https (como `https://<projeto>.supabase.co`) ou se nenhuma página carregar `/mg-attr.js`, a montagem falha. A chave nunca é impressa.

## Publicação

O site e a web app são publicados juntos no projeto Cloudflare Pages `microgrind`, pelo workflow **"Publicar site"** (`.github/workflows/publish-site.yml`) do repositório `MicroGrind`. Esse workflow faz checkout deste repositório, corre `npm run build` + `npm test` + `check-app-parity`, exporta a app e monta tudo com `scripts/assemble-pages-site.mjs`. O passo de montagem tem de receber `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` (secrets do `MicroGrind`) para o contador funcionar; sem elas, o log mostra um aviso.
