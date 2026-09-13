# Item 4 — novas esculturas

- T: espiral áurea com volume, aproximação contínua da espiral de Fibonacci.
  O raio cresce pelo fator phi a cada quarto de volta.
- O¹: cinco anéis de crescimento irregulares, com grão compartilhado e fissura radial.
- O²: três cubos conectados, reaproveitando a construção anterior de On-Chain.
  Células rebaixadas nas faces produzem inscrições geométricas abstratas.

As três formas usam os mesmos 300 fragmentos da experiência. Não foram adicionados
assets, texturas, dependências ou meshes. Paleta e materiais originais preservados.
O enquadramento de O¹/O² foi ajustado para afastar as artes do texto em telas pequenas.
Os demais alvos geométricos foram comparados por hash com a versão anterior.

## Validação

- Inspeção no navegador local: 1280 × 800, 390 × 844 e 320 × 740.
- As três silhuetas foram conferidas no mobile; os sulcos dos cubos são mais
  perceptíveis no desktop. Navegação entre as cenas e pausa permaneceram funcionais.
- TypeScript, lint sem erros, build de produção e 25 testes passaram.
- Chunk de produção `world`: 504937 bytes (sem compressão). O aviso de chunk acima
  de 500 KB permanece; não é uma medição de performance no aparelho.
- Falta aprovação visual do proprietário e teste em Android físico.
