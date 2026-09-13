import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { channels } from "@/lib/bitmood/chapters";
import styles from "./sobre.module.css";

export const metadata: Metadata = {
  title: "Adilson Vital — Sobre o BITMOOD",
  description: "A história de Adilson Vital, do cartão de Bitcoin guardado na gaveta à criação do BITMOOD: dados, método e transparência.",
};

const beginning = [
  "Em 2016, uma exchange chamada Foxbit foi até a minha universidade falar sobre Bitcoin e blockchain. Eu era aluno de engenharia de computação, achei aquilo besteira e mal prestei atenção. No fim da palestra, eles sortearam dez cartões com uma fração de bitcoin dentro. Eu ganhei um.",
  "Olhei o cartão, vi um QR code que eu não fazia ideia para que servia, e guardei na gaveta.",
  "Alguns meses depois, um amigo me ofereceu um bom dinheiro por aquele cartão. Desconfiado, fui pesquisar quanto aquilo valia — e descobri que tinha uma quantia nada desprezível parada numa gaveta da minha casa. Só que o cartão tinha prazo de resgate. E o prazo já tinha vencido.",
  "Perdi. E o mais incômodo é que não perdi por causa do preço, nem por ter vendido na hora errada. Perdi porque não sabia o que eu tinha em mãos.",
  "Foi ali que começou tudo. De 2016 para cá, estudei esse universo obsessivamente. Ganhei dinheiro, perdi dinheiro, acertei por sorte e errei com convicção. E, em quase dez anos, nunca encontrei o que eu mais queria: um método honesto que me dissesse quando comprar e quando parar.",
];
const method = [
  "Sou Cristão, Araraquarense, e hoje moro em Luxemburgo com minha linda esposa, Andressa (foto nossa no meu aniversário de 30 anos no Museu de História Natural de Londres :) ). Trabalho há cinco anos com dados na Amazon, sou engenheiro de computação e doutor em Ciências de Computação, os dois pela USP. Minha pesquisa é em inteligência artificial e redes complexas — a área que estuda como um comportamento coletivo emerge de milhões de decisões individuais. Levei tempo demais para perceber que eu tinha passado anos estudando, em teoria, exatamente aquilo que o Bitcoin é na prática.",
  "O BITMOOD é a tentativa de construir o método que eu nunca achei.",
  "Na prática, é análise das notícias que movem o mercado — só que feita do jeito que fui treinado a fazer: olhando o dado antes da manchete, separando sinal de barulho, e mostrando o raciocínio inteiro em vez do veredito.",
  "Toda vez que o Bitcoin se move, aparecem dez explicações. O trabalho aqui é testar quais delas param de pé: quais dados sustentam aquilo, o que esses dados não conseguem dizer, e onde a análise pode estar errada. Nada de grito, preço-alvo ou \"última chance de comprar\". Quando a resposta for \"não dá para saber\", vai estar escrito assim.",
  "Certeza ninguém tem sobre Bitcoin. O que existe aqui é método, transparência e uma obsessão em mostrar a conta — o suficiente para você formar a sua própria opinião em vez de adotar a minha.",
];

export default function About() {
  const youtube = channels.find(channel => channel.kind === "youtube" && channel.href);
  return <div className={styles.page}>
    <a className="skip-link" href="#historia">Pular para a história</a>
    <header className={styles.header}>
      <Link className="wordmark" href="/" aria-label="BITMOOD — início"><img src="/brand/whale.svg" width="42" height="26" alt="" /><span>BITMOOD<span className="brand-dot">.</span></span></Link>
      <nav aria-label="Navegação principal"><Link className={styles.back} href="/"><ArrowLeft size={16} /> Voltar ao universo BITMOOD</Link></nav>
    </header>
    <main id="historia" className={styles.main}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>QUEM ESCREVE O BITMOOD</p>
        <h1>Olá! Sou <span>Adilson Vital.</span></h1>
        <div className={styles.rule} aria-hidden="true" />
      </div>
      <section className={styles.story} aria-label="O cartão que começou a história">
        <div className={styles.copy}>{beginning.slice(0,2).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>
        <aside className={styles.photos} aria-label="O cartão da Foxbit">
          <figure>
            <img src="/images/sobre/foxbit-frente.webp" width="1400" height="871" alt="Frente do cartão da Foxbit, com a marca laranja e a inscrição bitcoin wallet." decoding="async" />
            <figcaption><span>01 / O COMEÇO</span>O cartão da palestra de 2016.</figcaption>
          </figure>
        </aside>
        <div className={`${styles.copy} ${styles.continuation}`}>{beginning.slice(2).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>
      </section>
      <section className={styles.story} aria-label="Quem sou e por que criei o BITMOOD">
        <div className={styles.copy}><p>{method[0]}</p></div>
        <aside className={styles.photos} aria-label="Uma lembrança com Andressa">
          <figure>
            <img src="/images/sobre/adilson-andressa-londres.webp" width="1672" height="941" alt="Adilson e Andressa sorrindo diante de uma baleia no Museu de História Natural de Londres." loading="lazy" decoding="async" />
            <figcaption><span>02 / FORA DOS DADOS</span>Com Andressa, no meu aniversário de 30 anos. Museu de História Natural de Londres.</figcaption>
          </figure>
        </aside>
        <div className={`${styles.copy} ${styles.continuation}`}>
          {method.slice(1).map((paragraph,index)=><p key={index} className={index===0?styles.statement:undefined}>{paragraph}</p>)}
          <p>Se isso faz sentido, é só acompanhar.</p>
          <a className={styles.channel} href={youtube?.href ?? "/#canais"}>{youtube ? "Ir para o canal" : "Ver canais do BITMOOD"}<ArrowUpRight size={21} /></a>
        </div>
      </section>
    </main>
    <footer className={styles.footer}><span>BITMOOD / BITCOIN INTELLIGENCE</span><p>Projeto independente, sem vínculo ou endosso da Amazon.</p><Link href="/#newsletter">Receber a newsletter <ArrowUpRight size={15} /></Link></footer>
  </div>;
}
