# Áudio no iPhone — correção de retomada

Relato: o som parece não funcionar no iPhone. Navegador, versão de iOS e estado
do botão ainda não confirmados; não houve reprodução em iPhone físico.

Lacunas verificadas no código e corrigidas:

- A retomada aceitava apenas `suspended`, mas o Safari também usa `interrupted`.
- Uma promessa de resume pendente bloqueava todas as novas tentativas de ativação.
- Retomadas tardias agora conferem a identidade do contexto, visibilidade e
  preferência antes de elevar o ganho, evitando reativação após silêncio/saída.

Testes simulam interrupted, volta à página e nova tentativa com resume pendente.
Isso não comprova que o aparelho emita som: estado running não detecta volume
físico, saída Bluetooth nem o modo silencioso do iPhone.

Referências: [estado do AudioContext no Safari](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state)
e [relato de Web Audio e modo silencioso no WebKit](https://bugs.webkit.org/show_bug.cgi?id=237322).

Próxima verificação: testar o botão Som no aparelho, informar navegador/iOS e
se o botão permanece desativado ou indica Som on sem saída audível.
Não foi alterada a categoria AudioSession nem forçada reprodução sobre o modo silencioso.
