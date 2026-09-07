# BITMOOD

Site institucional em português para a marca e a metodologia BITMOOD. A experiência mantém uma cena 3D fixa enquanto a rolagem transforma 207 fragmentos independentes de uma baleia em esculturas para cada vertical.

## Percurso

São 11 cenas: baleia, expansão, B, I, T, M, O¹, O², D, canais e newsletter. A rolagem é nativa e reversível. Os fragmentos têm movimento contínuo e reagem a cliques. O som é opcional e começa desligado; há controle para reduzir o movimento e tratamento da preferência de acessibilidade do dispositivo.

| Vertical | Escultura | Conteúdo |
| --- | --- | --- |
| B | Cofre | Baleias, grandes carteiras, carteiras antigas e fluxos de mineradores |
| I | Edifício institucional | Governos, empresas, fundos e tesourarias |
| T | Candles e curva | Médias móveis, Fibonacci e RSI |
| M | Globo | Juros, inflação, dólar e liquidez |
| O¹ | Blocos conectados | Métricas on-chain, detentores, MVRV e SOPR |
| O² | Processador | Ordinals, aplicações em Bitcoin e economia dos mineradores |
| D | Alavanca | Futuros, opções, funding, posições abertas e liquidações |

As esculturas são ilustrativas. O site não apresenta cotações, indicadores ou dados de mercado ao vivo.

## Desenvolvimento

O projeto usa o starter Sites Vinext, React, Three.js e componentes acessíveis de interface. Use os helpers de instalação, build e empacotamento do Sites. A identidade de publicação está em `.openai/hosting.json`.

- `app/page.tsx`: percurso, navegação, controles, diálogos e integração da cena.
- `app/globals.css`: tema e enquadramento responsivo.
- `lib/bitmood/chapters.ts`: textos, verticais e configuração dos canais.
- `components/bitmood/world.js`: cena WebGL, transições e movimentos.
- `components/bitmood/sculptures.js`: posições das esculturas.
- `public/experience/whale.json`: geometria dos 207 fragmentos.
- `components/bitmood/newsletter.tsx`: formulário de cadastro.
- `app/api/newsletter/route.ts`: validação e persistência dos cadastros no D1.

## Configuração editorial e newsletter

Os endereços oficiais do YouTube e das redes ainda precisam ser confirmados. As entradas em `channels` usam `href: null` e aparecem como “Em breve”; substituir apenas por endereços confirmados.

O formulário de newsletter registra inscrições no banco D1 por meio da API existente. O envio de campanhas e mensagens automáticas depende de uma futura integração com um provedor de e-mail. Não há integração com um serviço de envio nesta versão.

## Verificação

A implementação foi verificada com build de produção, TypeScript e inspeção de renders locais das geometrias. A fluidez e o enquadramento no navegador ainda precisam ser avaliados nos dispositivos de destino.

## Executar a cópia deste repositório

Requer Node.js 22.13.0 ou superior. Na raiz do projeto:

```bash
npm ci
npm run dev
```

Abra o endereço local exibido pelo servidor. Para gerar o build de produção, use `npm run build`; o script incluído requer Bash e GNU `timeout` (disponíveis em Linux/WSL). A API de newsletter depende do binding Cloudflare D1 `DB` e da aplicação das migrações em `drizzle/`.

Esta versão usa React, Vinext e Three.js; não é um HTML estático para abrir diretamente ou publicar sem build no GitHub Pages. O projeto mantém a configuração da publicação existente no Sites.

## Versão aprovada e página anterior

A experiência aprovada está em https://bitmood.plucky-spice-0136.chatgpt.site (acesso privado). Código transferido da revisão `5c9edfb132316ca65d58bb40acdbe1a2ba8f8766`, com a documentação de execução adicionada neste repositório.

A página estática anterior e seu README estão preservados em `legacy/`. O histórico anterior do repositório também foi mantido. O domínio previsto continua sendo `bitmood.com.br`; DNS e publicação nesse domínio não foram alterados por esta transferência.
