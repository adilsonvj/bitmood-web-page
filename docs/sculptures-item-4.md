# Item 4 — novas esculturas

- T: oito arcos contínuos nos quadrados de lados 1, 1, 2, 3, 5, 8, 13 e 21.
  Uma malha discreta de 32 segmentos (64 vértices) explicita a construção de Fibonacci.
- O¹: cinco anéis excêntricos, casca rugosa e três rachaduras de profundidades
  diferentes, com bordas desencontradas e circunferências assimétricas.
- O²: três cubos conectados, reaproveitando a construção anterior de On-Chain.
  Células rebaixadas nas faces produzem inscrições geométricas abstratas.

As três formas usam os mesmos 300 fragmentos da experiência. Não foram adicionados
assets, texturas, dependências ou meshes. A revisão acrescenta apenas um objeto
LineSegments para os quadrados de Fibonacci. Paleta e materiais originais preservados.
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

## Revisão após feedback

O proprietário aprovou a base, mas pediu uma espiral mais reconhecível e anéis
menos regulares. A revisão acima foi inspecionada em 1280 × 800 e 320 × 740.
TypeScript, lint, build e 26 testes passaram; depois do build, apenas o valor
de enquadramento vertical da espiral no mobile foi ajustado e conferido no preview.
As métricas de tamanho acima referem-se à primeira versão, antes desta revisão.
