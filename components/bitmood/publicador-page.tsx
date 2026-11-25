import copy from "@/conteudo/paginas/publicador.json";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./publicador-page.module.css";

export type PaginaPublicador = "inicio" | "privacidade" | "termos";

type Secao = { titulo: string; paragrafos?: string[]; itens?: string[]; link?: string };

const rotas: Record<PaginaPublicador, string> = {
  inicio: "/publicador",
  privacidade: "/publicador/privacidade",
  termos: "/publicador/termos",
};

/** Links externos ficam no código; os textos, em conteudo/paginas/publicador.json. */
function LinksDaSecao({ tipo }: { tipo: string }) {
  if (tipo === "revogar") return <p><a href="https://security.google.com/settings/security/permissions" rel="noopener noreferrer">Permissões da Conta do Google</a></p>;
  if (tipo === "youtube") return <p><a href="https://www.youtube.com/t/terms" rel="noopener noreferrer">Termos de Serviço do YouTube</a></p>;
  if (tipo === "google") return <p><a href="https://www.youtube.com/t/terms" rel="noopener noreferrer">Termos de Serviço do YouTube</a> · <a href="https://policies.google.com/privacy" rel="noopener noreferrer">Política de Privacidade do Google</a></p>;
  if (tipo === "contato") return <p><a href={`mailto:${copy.contato}`}>{copy.contato}</a></p>;
  return null;
}

export function metadadosPublicador(pagina: PaginaPublicador) {
  const texto = copy[pagina];
  return {
    title: texto.titulo_navegador,
    description: texto.descricao_busca,
    alternates: { canonical: `https://bitmood.com.br${rotas[pagina]}` },
    robots: { index: false, follow: true },
  };
}

export function PublicadorPage({ pagina }: { pagina: PaginaPublicador }) {
  const texto = copy[pagina];
  const secoes: Secao[] = texto.secoes;
  const outras = (Object.keys(rotas) as PaginaPublicador[]).filter(item => item !== pagina);
  return <div className={styles.page}>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className={styles.header}>
      <Link className="wordmark" href="/" aria-label="BITMOOD — início"><img src="/brand/whale.svg" width="42" height="26" alt="" /><span>BITMOOD<span className="brand-dot">.</span></span></Link>
      <nav aria-label="Navegação principal"><Link className={styles.back} href="/"><ArrowLeft size={16} /> {copy.voltar}</Link></nav>
    </header>
    <main id="conteudo" className={styles.main}>
      <p className={styles.eyebrow}>{texto.sobretitulo}</p>
      <h1>{texto.titulo}</h1>
      {texto.introducao.map(paragrafo => <p key={paragrafo} className={styles.lead}>{paragrafo}</p>)}
      {secoes.map(secao => <section key={secao.titulo}>
        <h2>{secao.titulo}</h2>
        {secao.paragrafos?.map(paragrafo => <p key={paragrafo}>{paragrafo}</p>)}
        {secao.itens ? <ul>{secao.itens.map(item => <li key={item}>{item}</li>)}</ul> : null}
        {secao.link ? <LinksDaSecao tipo={secao.link} /> : null}
      </section>)}
      <p className={styles.updated}>Atualizado em {copy.atualizado_em}.</p>
    </main>
    <footer className={styles.footer}>
      <span>BITMOOD / BITCOIN INTELLIGENCE</span>
      <nav aria-label="Páginas do BITMOOD Publicador">{outras.map(item => <Link key={item} href={rotas[item]}>{copy.links[item]}</Link>)}</nav>
    </footer>
  </div>;
}
