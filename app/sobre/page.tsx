import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { AboutStory } from "@/components/bitmood/about-story";
import styles from "./sobre.module.css";

export const metadata: Metadata = {
  title: "Adilson Vital — Sobre o BITMOOD",
  description: "A história de Adilson Vital, do cartão de Bitcoin guardado na gaveta à criação do BITMOOD: dados, método e transparência.",
};

export default function About() {
  return <div className={styles.page}>
    <a className="skip-link" href="#historia">Pular para a história</a>
    <header className={styles.header}>
      <Link className="wordmark" href="/" aria-label="BITMOOD — início"><img src="/brand/whale.svg" width="42" height="26" alt="" /><span>BITMOOD<span className="brand-dot">.</span></span></Link>
      <nav aria-label="Navegação principal"><Link className={styles.back} href="/"><ArrowLeft size={16} /> Voltar ao universo BITMOOD</Link></nav>
    </header>
    <main id="historia"><AboutStory /></main>
    <footer className={styles.footer}><span>BITMOOD / BITCOIN INTELLIGENCE</span><p>Projeto independente, sem vínculo ou endosso da Amazon.</p><Link href="/#newsletter">Receber a newsletter <ArrowUpRight size={15} /></Link></footer>
  </div>;
}
