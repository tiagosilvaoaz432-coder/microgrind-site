# Regras para agentes neste repositório (site de marketing MicroGrind)

## Como trabalhar (regra do dono do projeto)

Sempre que fizeres **qualquer alteração** neste repositório, leva-a até à produção sem esperar por novo pedido:

1. Fazer a alteração num ramo novo a partir de `main`.
2. `npm run build` e `npm test` (o teste falha se `site-static/` estiver desatualizado; faz commit do output gerado). Código novo leva testes novos.
3. Rever o próprio diff (textos em pt-PT e en, ligações, acessibilidade).
4. Abrir PR para `main`, esperar que o CI ("Site CI") passe e fazer **merge (squash)**.
5. **Publicar**: correr o workflow "Publicar site" (`.github/workflows/publish-site.yml`) do repositório `tiagosilvaoaz432-coder/MicroGrind`, a partir de `master`, primeiro com `target: preview` e, se terminar com sucesso, com `target: production`. Confirmar que ambos terminam com sucesso (o workflow verifica as rotas publicadas).
6. Dizer ao dono o que mudou e o que ficou em produção, com o ID do deploy anterior para rollback (o workflow imprime-o).

O mesmo se aplica a alterações no repositório `MicroGrind` (ver `appfiles/AGENTS.md` lá).

## Estrutura

Ver `README.md`. As páginas gratuitas de prática estão em `marketing/practice/` (uma entrada por página em `marketing/practice/index.mjs`).
Copy proibida: lista `DEFERRED` em `marketing/seo-site.test.mjs`.
