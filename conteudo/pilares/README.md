# Editar os textos dos pilares

Cada arquivo JSON corresponde a um pilar: baleias, instituicoes, tecnica, macro, onchain, ordinais ou derivativos.

## Como editar no GitHub

1. Abra o arquivo desejado na branch `main` e clique no lápis.
2. Altere os textos entre aspas:
   - `titulo_linha_1`: primeira parte do título.
   - `titulo_linha_2`: segunda parte do título.
   - `descricao`: parágrafo abaixo do título.
3. Preserve as chaves, aspas e vírgulas. Para colocar aspas dentro do texto, prefira aspas curvas “assim”.
4. Salve com **Commit changes** na `main` (ou faça merge, se usar uma branch).
5. Aguarde a publicação automática da Cloudflare terminar e atualize o site.

Não é instantâneo: o site precisa ser recompilado e publicado. JSON inválido impede a nova publicação.

Estes arquivos alimentam a jornada principal e a página dedicada do pilar. A descrição também alimenta os metadados dessa página. Não é necessário alterar React, CSS ou esculturas.

As duas partes do título têm uma quebra entre elas; em telas menores, cada parte pode ocupar mais de uma linha. Prefira títulos curtos. Nomes do menu, letras e rotas continuam em `lib/bitmood/chapters.ts`.
