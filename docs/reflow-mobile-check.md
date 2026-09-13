# Verificação de reflow e mobile — 2026-09-13

Base: commit `30772af`. Alteração desta rodada: ocultar `.sculpture-caption`
e `.side-caption` abaixo de 768 px, preservando título, descrição e arte 3D.

## Evidências

- Produção, 320 × 740: o rótulo decorativo de Ordinals aparecia sobre a arte.
- Produção, 320 × 200: ArrowDown e PageDown rolaram o texto de Ordinals
  (scrollTop de 0 para 40 e depois aproximadamente 103), sem trocar a cena.
- ArrowRight avançou para Derivativos e levou o foco ao título.
- Local, 320 × 740, 320 × 200, 640 × 400 e 1280 × 800: os dez contêineres
  de texto não apresentaram transbordamento horizontal nem saíram do viewport.
- Local: rótulos ocultos nos três tamanhos estreitos e preservados no desktop.
  Captura visual de Ordinals em 320 × 740 confirmou a remoção do rótulo.
- `npm run check:quick`: TypeScript e 11 testes passaram.

## Limites

640 × 400 e 320 × 200 simulam o espaço CSS disponível em zoom de 200% e
400% de uma janela de 1280 × 800; não são um teste de zoom real do navegador.
A medição dos dez contêineres não substitui percorrer visualmente cada cena.
Não foram testados aparelho físico, leitor de tela ou todos os percursos de Tab.
Rolagem interna, foco e proteção de campos de formulário já existiam na base;
não foram implementados nesta rodada. Não houve mudança no controlador ou 3D.
