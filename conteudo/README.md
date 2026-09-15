# Conteúdo editável do BITMOOD

Edite estes arquivos pelo lápis do GitHub. Salve na branch `main` (ou faça merge da sua branch) e aguarde a publicação automática da Cloudflare. A mudança não é instantânea.

## Onde editar

| Arquivo | O que altera |
| --- | --- |
| `navegacao.json` | Nomes das cinco abas: Início, Pilares, Sobre mim, Canais e Newsletter; usados nos menus e navegação lateral entre seções |
| `paginas/inicio.json` | Título, subtítulo, descrição, botão, título da aba do navegador e descrição de busca da home |
| `paginas/pilares.json` | Sobretítulo da seção Pilares e apresentação da seção |
| `paginas/sobre.json` | Título, história, método, citações, legendas, conclusão, botão e metadados da página Sobre mim |
| `paginas/canais.json` | Título, descrição, nomes dos canais e texto de disponibilidade |
| `paginas/newsletter.json` | Título, descrição e textos do formulário |
| `pilares/*.json` | Título e descrição de cada um dos sete pilares |

Os títulos exibidos em cada pilar vêm de `pilares/*.json`, não da apresentação geral em `paginas/pilares.json`.

## Regras de edição

- Altere os valores, não os nomes dos campos.
- Preserve aspas, vírgulas, colchetes e chaves. JSON não aceita comentários.
- Para usar aspas dentro de um texto, prefira “aspas curvas”.
- O texto é simples, sem HTML ou Markdown.
- Em `sobre.json`, mantenha os cinco parágrafos de `historia`, os cinco de `metodo` e as quatro entradas de `fotos`, na mesma ordem: o layout intercala imagens e citações nesses pontos. Pode reescrever cada texto livremente.
- Os títulos têm duas partes; telas menores podem quebrar cada parte em mais linhas.
- Renomear uma aba não muda sua rota. Por exemplo, “Sobre o autor” continua acessível por `#sobre`.
- `titulo_navegador` é o título da aba do Chrome/Safari. Os nomes dos botões de navegação ficam em `navegacao.json`.

As imagens, links, navegação e integração da newsletter continuam no código. Alterar textos não altera consentimento armazenado, validação da API ou os endereços de envio. Mensagens de erro específicas retornadas pela API continuam tendo prioridade sobre a mensagem genérica do formulário.

Não há analytics instalado por esta mudança.
