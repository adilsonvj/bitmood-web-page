# Android / Chrome — navegação por toque

Relato: no desktop a roda funciona; no Android a tela desce antes da transição.
Hipótese: o pan nativo do scrollport/contêiner de texto acontece antes da mudança
de cena. Não houve reprodução em aparelho Android físico nesta rodada.

## Correção

- Um swipe vertical de um dedo troca uma cena após 36 pixels de deslocamento.
- O primeiro movimento vertical pertencente à cena cancela o pan nativo;
  movimentos posteriores no mesmo gesto não saltam várias cenas.
- Texto longo tem prioridade para rolagem nativa. No limite, um novo gesto
  permite trocar de cena. Em ponteiros coarse, o texto não encadeia a rolagem
  para a trilha externa no meio do gesto.
- Pinça, pan após zoom, campos de formulário e diálogos ficam com o navegador.
- Roda do mouse, teclado, snapping, navegação circular e esculturas preservados.

Referência de plataforma: [Touch events — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/touchmove_event).
O listener de touchmove é local à trilha e não-passivo para cancelar apenas
os gestos de cena. Não se usa touch-action:none nem se desabilita o zoom.

## Verificação no aparelho (pendente)

Validação local: TypeScript, lint (sem erros), build de produção e 22 testes
passaram. Os avisos existentes de imagens e tamanho do chunk 3D permanecem.

1. Recarregar a versão publicada no Chrome Android.
2. Deslizar sobre a arte e sobre texto que cabe: verificar ausência de pan
   inicial da tela e uma única troca por gesto, nos dois sentidos.
3. Em texto longo, ler até o fim e trocar de cena com um novo gesto.
4. Confirmar pinça/zoom, formulário, menu e volta do último capítulo ao primeiro.
5. No Chrome desktop, verificar que a roda continua com o comportamento anterior.

Os testes automatizados simulam eventos no controlador; não reproduzem
o compositor, a barra de endereço ou o teclado virtual do Android.
