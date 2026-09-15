# BITMOOD — continuidade do projeto

- Use a versão mais recente de `main` em `adilsonvj/bitmood-web-page` como base. Preserve alterações feitas pelo proprietário antes de enviar novos commits.
- O domínio de produção é `bitmood.com.br`, com publicação na Cloudflare. Preserve os valores reais de D1 em `vite.config.ts`: binding `DB`, banco `bitmood-db`, ID `4e693c7d-e498-40ed-9958-fb2c1d6ab93d`. Eles foram configurados pelo proprietário; não os substitua por valores de um starter ou de uma cópia antiga do Sites.
- O projeto usa Vinext e Cloudflare Worker, com API de newsletter. Preserve a configuração de publicação e as migrações existentes ao fazer mudanças visuais.
- A experiência tem cinco estações horizontais circulares: Hero, Pilares, Sobre mim, Canais e Newsletter. Dentro de Pilares, sete estados verticais circulares mostram uma escultura animada por vez. `lib/bitmood/axis-navigation.js` controla os eixos; letras selecionam pilares sem recarregar a página. As sete rotas dedicadas abrem a mesma experiência no pilar correspondente, preservando metadados. Esquerda/direita sempre saem para a jornada principal, preservando o pilar selecionado. Não interpolar índices de esculturas entre seções: isso exibe pilares intermediários indevidamente. Sobre mim e textos transbordantes mantêm leitura vertical nativa.
- Preserve a navegação por teclado, o encaixe na cena mais próxima e a preferência de movimento reduzido. O som inicia habilitado, toca após uma interação permitida pelo navegador e respeita a preferência salva de silêncio.
- Mantenha `legacy/` e o histórico anterior do repositório. Os canais só devem receber URLs oficiais confirmados pelo proprietário.

## Economia de contexto e validação

- Textos editáveis ficam em `conteudo/paginas/*.json`, `conteudo/pilares/*.json` e `conteudo/navegacao.json`. Preserve essa fonte única de conteúdo; consulte `conteudo/README.md` antes de alterar sua estrutura.

- Respeite o escopo pedido pelo usuário. Não acrescente refatorações, pesquisas ou funcionalidades paralelas a uma mudança pequena.
- Comece buscas em `app/`, `components/bitmood/`, `lib/bitmood/`, `db/`, `worker/` e `tests/`, restringindo-as aos arquivos relacionados à tarefa.
- Não abra `public/experience/*.json`, `worker-configuration.d.ts`, `package-lock.json`, `legacy/` ou `vendor/` em tarefas comuns. Quando um desses artefatos for relevante, prefira tamanho, hash ou busca direcionada em vez de imprimir o conteúdo completo.
- Não use subagentes, pesquisa web, geração de imagem ou automação de navegador em alterações locais simples, salvo quando o usuário pedir ou a validação visual exigir.
- Para texto, metadados e CSS local, execute somente o teste diretamente relacionado. Para React, acessibilidade e estado, use `npm run check:quick` quando aplicável.
- Reserve `npm run check:full` para mudanças em dependências, build, Worker/Cloudflare, navegação principal ou Three.js, ou quando o usuário pedir a verificação completa.
- Depois que uma verificação passar, não a repita sem uma nova alteração relevante. Execute no máximo um build completo na etapa final.
