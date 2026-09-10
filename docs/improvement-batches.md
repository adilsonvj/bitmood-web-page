# BITMOOD — plano de melhorias em batches

Base: `bitmood-plano-de-melhorias.md`, enviado pelo proprietário em setembro de 2026.

Executar um batch por vez. Entregar o resultado e aguardar a orientação do proprietário antes de iniciar o seguinte. Correções solicitadas na revisão pertencem ao batch em revisão.

| Batch | Escopo | Itens do documento | Situação |
| --- | --- | --- | --- |
| 1 | Leitura com zoom, scroll, encaixe e contraste | 1–3 | Implementado; aguardando revisão do proprietário |
| 2 | T: espiral de Fibonacci; O1: anéis de tronco; O2: cubos com inscrições | 4 | Aguardando revisão do batch 1 |
| 3 | Estado real do som, navegação acessível, movimento, foco e simplificação visual | 5–11 | Planejado |
| 4 | Performance, fallback e imagens/metadados de compartilhamento | 12–14 | Planejado; ativação de analytics separada |
| 5 | Disclaimer e página de privacidade | 15–16 | Planejado; dados reais do responsável e fornecedores a confirmar |
| 6 | Página Sobre e destino útil para canais indisponíveis | 17, 20 | Planejado; confirmar credenciais, foto e URLs oficiais |

## Batch 1

- Manter o palco 3D e o fundo fixos, as dez cenas e o ciclo nos dois sentidos.
- Cada âncora de cena ocupa uma altura de tela; o navegador controla scroll e encaixe via CSS scroll snap. Os comandos de navegação usam uma transição de 500 ms.
- Textos que ultrapassam a área disponível têm rolagem interna, inclusive com zoom e em telas baixas. O conteúdo permanece alcançável por teclado; setas verticais leem o texto antes de trocar de cena, e setas laterais continuam disponíveis para navegação.
- Manter Tab e Shift+Tab, campos de formulário e atalhos do navegador. Anunciar a cena atual de forma discreta para leitores de tela.
- Retirar opacidade de textos secundários e usar uma superfície escura sob a leitura, garantindo contraste mesmo quando uma faceta clara passa atrás. Placeholder com cor sólida.
- Não alterar esculturas, sons, dados da newsletter, `vite.config.ts`, banco D1 ou configuração da Cloudflare neste batch.

Revisão: percorrer as dez cenas e o retorno à abertura; testar teclado, mouse e toque; verificar leitura e formulário em 100%, 200%, 400% e 320 CSS px; confirmar que o tratamento escuro dos textos preserva o protagonismo das esculturas. Testes do controlador e cálculo de contraste não substituem a revisão real no navegador nem certificam WCAG AA.

## Dependências posteriores

- A API de cadastro e a persistência D1 já existem. Os itens 18–19 exigem integrar um provedor de envio, confirmação, cancelamento e o domínio remetente. Não recriar o armazenamento nem apresentar envio ainda inexistente como ativo.
- Analytics depende da escolha e configuração do serviço. Não inserir identificadores fictícios nem afirmar que ausência de cookies resolve todas as obrigações de privacidade.
- Textos legais serão preparados com os dados disponíveis; pendências de identificação devem ficar no documento de trabalho, sem inventar CNPJ, contato ou fornecedores na página publicada.
- Verificar os perfis fornecidos antes de escrever credenciais na página Sobre. Não inferir apoio ou vínculo institucional ao BITMOOD.
- Itens 21–23 (arquivo de newsletter, prova social e produtos/score) ficam no backlog, condicionados a conteúdo e produtos reais.

## Registro de validação

- Build de produção concluído em 10/09/2026.
- Dez testes passaram: oito do controlador de navegação e dois de contraste. Os pares avaliados ficaram entre 4,99:1 e 14,56:1.
- No navegador, em viewport equivalente a 400% (341 × 234 CSS px), o formulário foi percorrido por teclado até o final: área de 126 px, conteúdo de 437 px, scroll final de 311 px; sem overflow horizontal dentro da área de leitura. A navegação para a cena seguinte também funcionou.
- A varredura automatizada dos cinco tamanhos excedeu o tempo permitido pelo navegador. Não foi concluída nesta retomada. Zoom real, dispositivo móvel, leitor de tela e fluidez 3D ainda exigem revisão; isto não é uma certificação WCAG AA.
- O batch altera somente página, estilos, controlador de navegação, testes correspondentes e este registro. A configuração Cloudflare e as esculturas permanecem como na main anterior.
