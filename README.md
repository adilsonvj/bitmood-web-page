# BITMOOD

Site institucional em português para a marca e a metodologia BITMOOD. A experiência mantém uma cena 3D fixa enquanto a rolagem transforma 300 fragmentos independentes em animais e esculturas para cada vertical.

## Percurso

São dez cenas em ciclo: baleia-azul com filhote e newsletter, expansão, B, I, T, M, O¹, O², D e canais. Continuar depois dos canais recompõe as baleias da abertura; voltar na abertura leva aos canais. A rolagem é nativa e reversível, com encaixe automático na cena mais próxima ao terminar o gesto.

As baleias e orcas nadam com movimentos de corpo, cauda e nadadeiras. Luzes internas percorrem os animais e fachos atravessam os vãos entre as facetas. Os fragmentos mantêm movimentos independentes e reagem a cliques.

Setas, Page Up e Page Down mudam de cena; Home leva à abertura e End aos canais. Espaço avança e Shift + Espaço volta, preservando os comandos dos campos e botões. A navegação respeita campos de formulário e diálogos. Há controle para reduzir o movimento e tratamento da preferência de acessibilidade do dispositivo.

O som começa habilitado e é liberado após a primeira interação permitida pelo navegador. A preferência de silêncio é salva no dispositivo. A trilha sintetizada combina mar suave, notas harmônicas e camadas de ar/água nas transições; o áudio pausa quando a aba fica oculta.

| Vertical | Escultura | Conteúdo |
| --- | --- | --- |
| B | Três orcas nadando juntas | Baleias, grandes carteiras, carteiras antigas e fluxos de mineradores |
| I | Edifício institucional | Governos, empresas, fundos e tesourarias |
| T | Candles e curva | Médias móveis, Fibonacci e RSI |
| M | Globo | Juros, inflação, dólar e liquidez |
| O¹ | Cubos tridimensionais conectados | Métricas on-chain, detentores, MVRV e SOPR |
| O² | Picareta | Ordinals, aplicações em Bitcoin e economia dos mineradores |
| D | Alavanca: bloco menor embaixo, bloco maior elevado | Futuros, opções, funding, posições abertas e liquidações |

As esculturas são ilustrativas. O site não apresenta cotações, indicadores ou dados de mercado ao vivo.

## Desenvolvimento

O projeto usa Vinext, React, Three.js e componentes acessíveis de interface. A configuração da Cloudflare está em `vite.config.ts`; o projeto também mantém a identidade da prévia original em `.openai/hosting.json`.

- `app/page.tsx`: percurso, navegação, controles, diálogos e integração da cena.
- `app/globals.css`: tema e enquadramento responsivo.
- `lib/bitmood/chapters.ts`: textos, verticais e configuração dos canais.
- `lib/bitmood/navigation.js`: rolagem circular, encaixe, teclado e foco.
- `components/bitmood/world.js`: cena WebGL, transições e movimentos.
- `components/bitmood/sculptures.js`: posições das esculturas.
- `public/experience/cetaceans.json`: geometria das baleias e orcas, com topologia compatível para transformação.
- `scripts/generate-cetaceans.py`: geração reproduzível das geometrias; requer Python, NumPy e SciPy, apenas para recriar o arquivo já incluído.
- `components/bitmood/audio.ts`: mar, notas, transições e preferência de som.
- `components/bitmood/newsletter.tsx`: formulário de cadastro.
- `app/api/newsletter/route.ts`: validação e persistência dos cadastros no D1.

## Configuração editorial e newsletter

Os endereços oficiais do YouTube e das redes ainda precisam ser confirmados. As entradas em `channels` usam `href: null` e aparecem como “Em breve”; substituir apenas por endereços confirmados.

O formulário de newsletter registra inscrições no banco D1 por meio da API existente. O envio de campanhas e mensagens automáticas depende de uma futura integração com um provedor de e-mail. Não há integração com um serviço de envio nesta versão.

## Verificação

A implementação foi verificada com build de produção, TypeScript, testes do controlador de navegação e inspeção de renders locais das geometrias. Os testes cobrem ciclos nos dois sentidos, encaixe antes/depois da metade, término de toque, teclado, formulários, diálogos e movimento reduzido. A fluidez, o áudio e o enquadramento no navegador ainda precisam ser avaliados nos dispositivos de destino.

```bash
node --test tests/journey.test.mjs
npx tsc --noEmit --incremental false
npm run build
```

## Executar a cópia deste repositório

Requer Node.js 22.13.0 ou superior. Na raiz do projeto:

```bash
npm ci
npm run dev
```

Abra o endereço local exibido pelo servidor. Para gerar o build de produção, use `npm run build`; o script incluído requer Bash e GNU `timeout` (disponíveis em Linux/WSL). A API de newsletter depende do binding Cloudflare D1 `DB` e da aplicação das migrações em `drizzle/`.

Esta versão usa React, Vinext e Three.js e precisa do build e do Worker para servir a aplicação e sua API.

## Publicação na Cloudflare

O proprietário configurou o domínio `bitmood.com.br` e o deploy a partir deste repositório. Preserve os dois commits de configuração `267a3405` e `bd2f3e3d`: o binding `DB` usa o banco `bitmood-db`, com ID `4e693c7d-e498-40ed-9958-fb2c1d6ab93d`. Não substitua esses valores em `vite.config.ts` por placeholders ao atualizar a experiência. Esta revisão mantém esse arquivo byte a byte.

## Origem e página anterior

A prévia privada original foi publicada em https://bitmood.plucky-spice-0136.chatgpt.site. O código inicial foi transferido da revisão `5c9edfb132316ca65d58bb40acdbe1a2ba8f8766`; as revisões seguintes ficam neste repositório.

A página estática anterior e seu README estão preservados em `legacy/`. O histórico anterior do repositório também foi mantido.
