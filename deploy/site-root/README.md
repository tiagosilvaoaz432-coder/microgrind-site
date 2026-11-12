# Ficheiros que só existiam no site publicado

Esta pasta guarda os ficheiros de microgrind.app que nenhum build deste repositório gera:
ícones, `og.png` e `logo-mark.png`. As páginas de privacidade passaram para `marketing/legal.mjs`
(mesmo template das outras páginas). Foram copiados do site publicado
em 6 Nov 2026 (sem a ofuscação de email que a Cloudflare injeta ao servir).

`scripts/assemble-pages-site.mjs` copia esta pasta primeiro, depois `site-static/` e por fim
o export da app (`dist/`). Um ficheiro com o mesmo caminho em `site-static/` ganha.

Para mudar a política de privacidade, edita `marketing/legal.mjs` e publica com o workflow
"Publicar site" (Actions).
