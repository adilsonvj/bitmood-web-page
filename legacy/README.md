# BITMOOD — landing page

Página estática simples de apresentação do BITMOOD: os 7 pilares, o método, e um formulário de espera da newsletter (o botão de envio ainda não está ligado a nada — falta escolher a plataforma de e-mail).

Um único arquivo HTML, sem build, sem dependências. Identidade visual e paleta de `00-nucleo/marca/` e `00-nucleo/identidade-marca.md` do repositório principal do projeto.

## Rodar localmente

Abrir `index.html` direto no navegador, ou:

```bash
npx serve .
```

## Publicar

Repositório pronto para GitHub Pages, Vercel ou Netlify (é só HTML estático). Domínio alvo: `bitmood.com.br` (registrado na Hostinger).

## Pendências

- [ ] Ligar o formulário de e-mail a uma plataforma real (Mailchimp, ConvertKit, Beehiiv...)
- [ ] Apontar o DNS do `bitmood.com.br` para onde a página for publicada
- [ ] Trocar os links de redes sociais pelos handles finais, quando definidos
