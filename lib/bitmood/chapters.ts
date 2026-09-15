import navigation from "@/conteudo/navegacao.json";
import inicioCopy from "@/conteudo/paginas/inicio.json";
import canaisCopy from "@/conteudo/paginas/canais.json";
import newsletterCopy from "@/conteudo/paginas/newsletter.json";
import sobreCopy from "@/conteudo/paginas/sobre.json";
import pilaresCopy from "@/conteudo/paginas/pilares.json";
import baleias from "@/conteudo/pilares/baleias.json";
import instituicoes from "@/conteudo/pilares/instituicoes.json";
import tecnica from "@/conteudo/pilares/tecnica.json";
import macro from "@/conteudo/pilares/macro.json";
import onchain from "@/conteudo/pilares/onchain.json";
import ordinais from "@/conteudo/pilares/ordinais.json";
import derivativos from "@/conteudo/pilares/derivativos.json";

const pillarCopy = [baleias, instituicoes, tecnica, macro, onchain, ordinais, derivativos];

const originalChapters = [
  { id: "inicio", letter: "↟", nav: navigation.inicio, eyebrow: inicioCopy.sobretitulo, title: [inicioCopy.titulo_linha_1, inicioCopy.titulo_linha_2], description: inicioCopy.descricao, signals: "SETE PERSPECTIVAS. UMA LEITURA CONECTADA.", sculpture: "BALEIAS AZUIS / GERAÇÕES" },
  { id: "perspectivas", letter: "·", nav: navigation.pilares, eyebrow: pilaresCopy.sobretitulo, title: [pilaresCopy.titulo_linha_1, pilaresCopy.titulo_linha_2], description: pilaresCopy.descricao, signals: "B · I · T · M · O¹ · O² · D", sculpture: "EXPANSÃO / CONEXÕES" },
  { id: "baleias", letter: "B", nav: "Baleias e big movers", eyebrow: "01 / 07 — BALEIAS & BIG MOVERS", signals: "GRANDES CARTEIRAS / MOEDAS ANTIGAS / FLUXOS", sculpture: "ORCAS / GRANDES MOVIMENTOS" },
  { id: "instituicoes", letter: "I", nav: "Instituições", eyebrow: "02 / 07 — INSTITUIÇÕES", signals: "GOVERNOS / EMPRESAS / TESOURARIAS / ETFs", sculpture: "INSTITUIÇÕES / CAPITAL" },
  { id: "tecnica", letter: "T", nav: "Análise técnica", eyebrow: "03 / 07 — ANÁLISE TÉCNICA", signals: "MÉDIAS MÓVEIS / FIBONACCI / RSI", sculpture: "FIBONACCI / PROPORÇÕES" },
  { id: "macro", letter: "M", nav: "Macroeconomia", eyebrow: "04 / 07 — MACROECONOMIA", signals: "JUROS / INFLAÇÃO / DÓLAR / LIQUIDEZ", sculpture: "GLOBO / ECONOMIA" },
  { id: "onchain", letter: "O¹", nav: "Métricas on-chain", eyebrow: "05 / 07 — MÉTRICAS ON-CHAIN", signals: "MVRV / SOPR / DETENTORES / OFERTA", sculpture: "ANÉIS / MEMÓRIA DA REDE" },
  { id: "ordinals", letter: "O²", nav: "Ordinals e mineração", eyebrow: "06 / 07 — ORDINALS & MINERAÇÃO", signals: "APLICAÇÕES / TAXAS / HASHRATE / RECEITA", sculpture: "BLOCOS / INSCRIÇÕES" },
  { id: "derivativos", letter: "D", nav: "Futuros e derivativos", eyebrow: "07 / 07 — FUTUROS & DERIVATIVOS", signals: "FUNDING / OPEN INTEREST / LIQUIDAÇÕES", sculpture: "ALAVANCA / POSIÇÕES" },
  { id: "sobre", letter: "AV", nav: navigation.sobre, eyebrow: sobreCopy.sobretitulo, title: [sobreCopy.titulo_linha_1, sobreCopy.titulo_linha_2], description: sobreCopy.descricao, signals: "HISTÓRIA / MÉTODO / TRANSPARÊNCIA", sculpture: "SOBRE / ADILSON VITAL" },
  { id: "canais", letter: "↗", nav: navigation.canais, eyebrow: canaisCopy.sobretitulo, title: [canaisCopy.titulo_linha_1, canaisCopy.titulo_linha_2], description: canaisCopy.descricao, signals: "YOUTUBE / REDES SOCIAIS", sculpture: "PLAY / CONVERSA" },
  { id: "newsletter", letter: "@", nav: navigation.newsletter, eyebrow: newsletterCopy.sobretitulo, title: [newsletterCopy.titulo_linha_1, newsletterCopy.titulo_linha_2], description: newsletterCopy.descricao, signals: "DADOS / MÉTODO / TRANSPARÊNCIA", sculpture: "BALEIAS AZUIS / GERAÇÕES" },
] as const;

export const pillars = originalChapters.slice(2,9).map((chapter,index)=>({
  ...chapter,
  title: [pillarCopy[index].titulo_linha_1, pillarCopy[index].titulo_linha_2],
  description: pillarCopy[index].descricao,
  route: chapter.id === "ordinals" ? "ordinais" : chapter.id,
  worldIndex: index + 2,
  summary: ["Grandes carteiras e fluxos que alteram a oferta.", "Governos, empresas e fundos mudando a escala.", "Tendências, proporções e níveis de preço.", "Juros, inflação e liquidez global.", "O histórico do Bitcoin registrado na rede.", "Inscrições, aplicações e incentivos dos mineradores.", "Futuros, opções e o peso da alavancagem."][index],
}));

export const chapters = [
  originalChapters[0],
  originalChapters[1],
  originalChapters[9], originalChapters[10], originalChapters[11],
];

// Populate only with the owner's confirmed official URLs.
export const channels: { label: string; kind: "youtube" | "social"; href: string | null }[] = [
  { label: canaisCopy.youtube, kind: "youtube", href: null },
  { label: canaisCopy.redes, kind: "social", href: null },
];
