import copy from "@/conteudo/paginas/sobre.json";
import { ArrowUpRight } from "lucide-react";
import styles from "@/app/sobre/sobre.module.css";

const beginning = copy.historia;
const method = copy.metodo;

export function AboutStory({ embedded = false }: { embedded?: boolean }) {
  const Heading = embedded ? "h2" : "h1";
  return <article className={`${styles.main} ${embedded ? styles.embedded : ""}`}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{copy.sobretitulo}</p>
        <Heading id={embedded ? "title-sobre" : undefined} tabIndex={-1}>{copy.titulo_linha_1} <span>{copy.titulo_linha_2}</span></Heading>
        <div className={styles.rule} aria-hidden="true" />
      </div>
      <section className={styles.story} aria-label="O cartão que começou a história">
        <div className={styles.copy}>{beginning.slice(0,2).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>
        <aside className={styles.photos} aria-label="Entrada na USP e o cartão da Foxbit">
          <figure className={styles.portrait}>
            <img src="/images/sobre/adilson-usp-2016.webp" width="540" height="960" alt="Adilson aos 19 anos, em 2016, como bixo de Engenharia de Computação na USP, em São Carlos." decoding="async" />
            <figcaption><span>{copy.fotos[0].titulo}</span>{copy.fotos[0].legenda}</figcaption>
          </figure>
          <figure>
            <img src="/images/sobre/foxbit-frente.webp" width="1400" height="871" alt="Frente do cartão da Foxbit, com a marca laranja e a inscrição bitcoin wallet." loading="lazy" decoding="async" />
            <figcaption><span>{copy.fotos[1].titulo}</span>{copy.fotos[1].legenda}</figcaption>
          </figure>
          <figure>
            <img src="/images/sobre/foxbit-verso.webp" width="1400" height="875" alt="Verso do cartão da Foxbit. QR code e endereço da carteira ocultos por segurança." loading="lazy" decoding="async" />
            <figcaption><span>{copy.fotos[2].titulo}</span>{copy.fotos[2].legenda}</figcaption>
          </figure>
        </aside>
        <div className={`${styles.copy} ${styles.continuation}`}>
          {beginning.slice(2,4).map((paragraph,index)=><p key={index}>{paragraph}</p>)}
          <blockquote className={styles.quote}><p>{copy.citacao_satoshi.texto}</p><footer>{copy.citacao_satoshi.autor}</footer></blockquote>
          <p>{beginning[4]}</p>
        </div>
      </section>
      <section className={styles.story} aria-label="Quem sou e por que criei o BITMOOD">
        <div className={styles.copy}><p>{method[0]}</p></div>
        <aside className={styles.photos} aria-label="Uma lembrança com Andressa">
          <figure>
            <img src="/images/sobre/adilson-andressa-londres.webp" width="1672" height="941" alt="Adilson e Andressa sorrindo diante de uma baleia no Museu de História Natural de Londres." loading="lazy" decoding="async" />
            <figcaption><span>{copy.fotos[3].titulo}</span>{copy.fotos[3].legenda}</figcaption>
          </figure>
        </aside>
        <div className={`${styles.copy} ${styles.continuation}`}>
          {method.slice(1,3).map((paragraph,index)=><p key={index} className={index===0?styles.statement:undefined}>{paragraph}</p>)}
          <blockquote className={styles.quote}><p>{copy.citacao_newton.texto}</p><footer>{copy.citacao_newton.autor} — <i>{copy.citacao_newton.obra}</i>, {copy.citacao_newton.referencia}</footer></blockquote>
          {method.slice(3).map((paragraph,index)=><p key={index}>{paragraph}</p>)}
          <p>{copy.conclusao}</p>
          <a className={styles.channel} href={embedded ? "#newsletter" : "/#newsletter"}>{copy.botao} <ArrowUpRight size={21} /></a>
        </div>
      </section>
    </article>;
}
