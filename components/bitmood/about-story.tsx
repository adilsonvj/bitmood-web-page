import { ArrowUpRight } from "lucide-react";
import styles from "@/app/sobre/sobre.module.css";

const beginning = [
  "Em 2016, uma exchange chamada Foxbit foi até a minha universidade falar sobre Bitcoin e blockchain. Eu era aluno de engenharia de computação, achei aquilo besteira e mal prestei atenção. No fim da palestra, eles sortearam dez cartões com uma fração de bitcoin dentro. Eu ganhei um.",
  "Olhei o cartão, vi um QR code que eu não fazia ideia para que servia, e guardei na gaveta.",
  "Alguns meses depois, um amigo me ofereceu um bom dinheiro por aquele cartão. Desconfiado, fui pesquisar quanto aquilo valia — e descobri que tinha uma quantia nada desprezível parada numa gaveta da minha casa. Só que o cartão tinha prazo de resgate. E o prazo já tinha vencido.",
  "Perdi. E o mais incômodo é que não perdi por causa do preço, nem por ter vendido na hora errada. Perdi porque não sabia o que eu tinha em mãos.",
  "Foi ali que começou tudo. De 2016 para cá, estudei esse universo obsessivamente. Ganhei dinheiro, perdi dinheiro, acertei por sorte e errei com convicção. E, em quase dez anos, nunca encontrei o que eu mais queria: um método honesto que me dissesse quando comprar e quando parar.",
];
const method = [
  "Sou Cristão, saí do interior de São Paulo e hoje moro em Luxemburgo com minha linda esposa, Andressa. Trabalho há cinco anos com dados na Amazon, sou engenheiro de computação e doutor em Ciências de Computação, os dois pela USP. Minha pesquisa é em inteligência artificial e redes complexas — a área que estuda como um comportamento coletivo emerge de milhões de decisões individuais. Levei tempo demais para perceber que eu tinha passado anos estudando, em teoria, exatamente aquilo que o Bitcoin é na prática.",
  "O BITMOOD é a tentativa de construir o método que eu nunca achei.",
  "Na prática, é análise das notícias que movem o mercado — só que feita do jeito que fui treinado a fazer: olhando o dado antes da manchete, separando sinal de barulho, e mostrando o raciocínio inteiro em vez do veredito.",
  "Toda vez que o Bitcoin se move, aparecem dez explicações. O trabalho aqui é testar quais delas param de pé: quais dados sustentam aquilo, o que esses dados não conseguem dizer, e onde a análise pode estar errada. Nada de grito, preço-alvo ou \"última chance de comprar\". Quando a resposta for \"não dá para saber\", vai estar escrito assim, não forjo hipóteses.",
  "Certeza ninguém tem sobre Bitcoin. O que existe aqui é método, transparência e uma obsessão em mostrar a conta — o suficiente para você formar a sua própria opinião em vez de adotar a minha.",
];

export function AboutStory({ embedded = false }: { embedded?: boolean }) {
  const Heading = embedded ? "h2" : "h1";
  return <article className={`${styles.main} ${embedded ? styles.embedded : ""}`}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>QUEM ESCREVE O BITMOOD</p>
        <Heading id={embedded ? "title-sobre" : undefined} tabIndex={-1}>Olá! Sou <span>Adilson Vital.</span></Heading>
        <div className={styles.rule} aria-hidden="true" />
      </div>
      <section className={styles.story} aria-label="O cartão que começou a história">
        <div className={styles.copy}>{beginning.slice(0,2).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>
        <aside className={styles.photos} aria-label="Entrada na USP e o cartão da Foxbit">
          <figure className={styles.portrait}>
            <img src="/images/sobre/adilson-usp-2016.webp" width="540" height="960" alt="Adilson aos 19 anos, em 2016, como bixo de Engenharia de Computação na USP, em São Carlos." decoding="async" />
            <figcaption><span>01 / BIXO NA USP</span>Aos 19 anos, entrando na Engenharia de Computação da USP em 2016 — o mesmo ano da palestra da Foxbit.</figcaption>
          </figure>
          <figure>
            <img src="/images/sobre/foxbit-frente.webp" width="1400" height="871" alt="Frente do cartão da Foxbit, com a marca laranja e a inscrição bitcoin wallet." loading="lazy" decoding="async" />
            <figcaption><span>02 / O CARTÃO</span>O cartão da palestra de 2016.</figcaption>
          </figure>
          <figure>
            <img src="/images/sobre/foxbit-verso.webp" width="1400" height="875" alt="Verso do cartão da Foxbit. QR code e endereço da carteira ocultos por segurança." loading="lazy" decoding="async" />
            <figcaption><span>03 / O VERSO</span>O verso do mesmo cartão, com os dados de acesso ocultos.</figcaption>
          </figure>
        </aside>
        <div className={`${styles.copy} ${styles.continuation}`}>
          {beginning.slice(2,4).map((paragraph,index)=><p key={index}>{paragraph}</p>)}
          <blockquote className={styles.quote}><p>“Moedas perdidas apenas fazem com que as moedas de todos os outros valham um pouco mais.”</p><footer>Satoshi Nakamoto — fórum Bitcointalk, 21 de junho de 2010</footer></blockquote>
          <p>{beginning[4]}</p>
        </div>
      </section>
      <section className={styles.story} aria-label="Quem sou e por que criei o BITMOOD">
        <div className={styles.copy}><p>{method[0]}</p></div>
        <aside className={styles.photos} aria-label="Uma lembrança com Andressa">
          <figure>
            <img src="/images/sobre/adilson-andressa-londres.webp" width="1672" height="941" alt="Adilson e Andressa sorrindo diante de uma baleia no Museu de História Natural de Londres." loading="lazy" decoding="async" />
            <figcaption><span>04 / FORA DOS DADOS</span>Com Andressa no meu aniversário de 30 anos no Natural History Museum em Londres :)</figcaption>
          </figure>
        </aside>
        <div className={`${styles.copy} ${styles.continuation}`}>
          {method.slice(1,3).map((paragraph,index)=><p key={index} className={index===0?styles.statement:undefined}>{paragraph}</p>)}
          <blockquote className={styles.quote}><p>“Hypotheses non fingo” — não forjo hipóteses.</p><footer>Isaac Newton — <i>Principia</i>, Escólio Geral, 1713</footer></blockquote>
          {method.slice(3).map((paragraph,index)=><p key={index}>{paragraph}</p>)}
          <p>Se isso faz sentido pra você, a próxima leitura chega no seu e-mail.</p>
          <a className={styles.channel} href={embedded ? "#newsletter" : "/#newsletter"}>Receber a newsletter <ArrowUpRight size={21} /></a>
        </div>
      </section>
    </article>;
}
