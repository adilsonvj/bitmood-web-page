---
name: site-bitmood
description: Como mexer no site bitmood.com.br (este repositório) do jeito combinado com o dono. Mudança direto na main, textos nos arquivos de conteúdo, verificação enxuta, conferência das páginas no ar e relatório com links. Use sempre que o dono pedir qualquer mudança no site, numa página, num texto ou no e-mail de contato, pedir uma página nova, ou perguntar se algo já está publicado.
---

# Site bitmood.com.br

Leia `AGENTS.md` antes de tudo: ele traz o que não pode quebrar (configuração da Cloudflare e do D1, a navegação em
eixos, as rotas dos pilares) e as regras de economia de verificação. Esta skill acrescenta o combinado com o dono
sobre como entregar. Fale em português do Brasil, com frases curtas, sem jargão técnico.

## Como o dono quer

- **Commits direto na `main`** (pedido de 26/11/2026), sem pull request. A Cloudflare publica sozinha em 1 a 2
  minutos depois do push. Antes de começar: `git fetch origin main` e parta do que está lá, para não passar por cima
  de mudanças do dono.
- **E-mails:** no site só aparece o e-mail público de contato, o campo `contato` de
  `conteudo/paginas/publicador.json`. Os e-mails donos das contas (Google, Cloudflare, GitHub) nunca vão para páginas,
  textos ou descrições. Se um e-mail errado entrar numa branch, leve a mudança para a `main` num commit único
  (`git merge --squash`), para ele não ficar no histórico da `main`.
- **No fim, links e instruções completas:** o que mudou, o link de cada página no ar e, se ele precisa fazer algo
  (num painel do Google, por exemplo), o passo a passo com o link direto de cada tela e os valores em blocos copiáveis.

## Fazer a mudança

1. Texto fica em `conteudo/paginas/*.json`, `conteudo/pilares/*.json` e `conteudo/navegacao.json`
   (`conteudo/README.md` explica). Link externo e estrutura ficam no componente.
2. Página nova: rota em `app/<rota>/page.tsx`, componente em `components/bitmood/`, texto num JSON de
   `conteudo/paginas/`, uma linha na tabela de `conteudo/README.md` e um teste em `tests/content.test.mjs`.
   Modelo pronto: as páginas do Publicador (`app/publicador/`, `components/bitmood/publicador-page.tsx`).
3. Verifique: `npm run check:quick` e **um** `npm run build` no fim. Para ver a página antes de publicar, use
   `npx vite --port 4173` (o `vinext start` não roda fora da Cloudflare) e tire uma captura no celular e no desktop.
4. Commit na `main`, push e espere a publicação.

## Conferir no ar

```bash
curl -sS -L -o /tmp/pg.html -w "%{http_code}\n" https://bitmood.com.br/<rota>
grep -o '<title>[^<]*</title>' /tmp/pg.html
grep -oE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}' /tmp/pg.html | sort -u   # só o e-mail público pode aparecer
```

O domínio `bitmood.com.br` está liberado no ambiente `auto-shorts-video`. Se o pedido for bloqueado pela rede,
proponha a liberação do domínio ao dono; sem ela, diga que não conseguiu conferir e peça para ele abrir o link.
Só diga "está no ar" depois de ver a página responder com o conteúdo novo.

## O que avisar sempre

- O que **não** foi conferido (por exemplo: o formulário da newsletter em produção).
- Texto de política, termos ou aviso legal é um texto simples e fiel ao que a página faz, não uma revisão jurídica.
