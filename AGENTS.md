# BITMOOD — continuidade do projeto

- Use a versão mais recente de `main` em `adilsonvj/bitmood-web-page` como base. Preserve alterações feitas pelo proprietário antes de enviar novos commits.
- O domínio de produção é `bitmood.com.br`, com publicação na Cloudflare. Preserve os valores reais de D1 em `vite.config.ts`: binding `DB`, banco `bitmood-db`, ID `4e693c7d-e498-40ed-9958-fb2c1d6ab93d`. Eles foram configurados pelo proprietário; não os substitua por valores de um starter ou de uma cópia antiga do Sites.
- O projeto usa Vinext e Cloudflare Worker, com API de newsletter. Preserve a configuração de publicação e as migrações existentes ao fazer mudanças visuais.
- A experiência tem dez cenas em ciclo, fundo fixo, animação como elemento principal e textos breves. A newsletter fica na abertura com a baleia-azul e o filhote. Mantenha as definições das sete verticais em `lib/bitmood/chapters.ts`.
- Preserve a navegação por teclado, o encaixe na cena mais próxima e a preferência de movimento reduzido. O som inicia habilitado, toca após uma interação permitida pelo navegador e respeita a preferência salva de silêncio.
- Mantenha `legacy/` e o histórico anterior do repositório. Os canais só devem receber URLs oficiais confirmados pelo proprietário.
