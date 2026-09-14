const originalChapters = [
  { id: "inicio", letter: "↟", nav: "Início", eyebrow: "BITMOOD / BITCOIN INTELLIGENCE", title: ["Bitcoin com dados.", "Visão de longo prazo."], description: "Análise de Bitcoin baseada em dados, para quem pensa em anos e não em dias.", signals: "SETE PERSPECTIVAS. UMA LEITURA CONECTADA.", sculpture: "BALEIAS AZUIS / GERAÇÕES" },
  { id: "perspectivas", letter: "·", nav: "Perspectivas", eyebrow: "UMA METODOLOGIA. SETE PERSPECTIVAS.", title: ["Cada parte.", "Uma perspectiva."], description: "Os movimentos começam a se conectar.", signals: "B · I · T · M · O¹ · O² · D", sculpture: "EXPANSÃO / CONEXÕES" },
  { id: "baleias", letter: "B", nav: "Baleias e big movers", eyebrow: "01 / 07 — BALEIAS & BIG MOVERS", title: ["Grandes carteiras.", "Grandes movimentos."], description: "Baleias, carteiras da era Satoshi e fluxos de mineradores. Movimentos que podem alterar a oferta disponível.", signals: "GRANDES CARTEIRAS / MOEDAS ANTIGAS / FLUXOS", sculpture: "ORCAS / GRANDES MOVIMENTOS" },
  { id: "instituicoes", letter: "I", nav: "Instituições", eyebrow: "02 / 07 — INSTITUIÇÕES", title: ["Capital que", "muda a escala."], description: "Governos, empresas, fundos e tesourarias. Compras e vendas que podem mudar o equilíbrio entre oferta e demanda.", signals: "GOVERNOS / EMPRESAS / TESOURARIAS / ETFs", sculpture: "INSTITUIÇÕES / CAPITAL" },
  { id: "tecnica", letter: "T", nav: "Análise técnica", eyebrow: "03 / 07 — ANÁLISE TÉCNICA", title: ["Os sinais", "do movimento."], description: "Médias móveis, Fibonacci e RSI ajudam a ler tendências e níveis de preço em que compradores e vendedores podem reagir.", signals: "MÉDIAS MÓVEIS / FIBONACCI / RSI", sculpture: "FIBONACCI / PROPORÇÕES" },
  { id: "macro", letter: "M", nav: "Macroeconomia", eyebrow: "04 / 07 — MACROECONOMIA", title: ["Um mercado.", "Um mundo inteiro."], description: "Juros, inflação, dólar e liquidez global. As condições da economia mudam o custo do capital e o apetite por Bitcoin.", signals: "JUROS / INFLAÇÃO / DÓLAR / LIQUIDEZ", sculpture: "GLOBO / ECONOMIA" },
  { id: "onchain", letter: "O¹", nav: "Métricas on-chain", eyebrow: "05 / 07 — MÉTRICAS ON-CHAIN", title: ["A rede deixa", "seus sinais."], description: "MVRV, SOPR e comportamento dos detentores. Os registros da rede ajudam a interpretar lucro realizado, acumulação e pressão de venda.", signals: "MVRV / SOPR / DETENTORES / OFERTA", sculpture: "ANÉIS / MEMÓRIA DA REDE" },
  { id: "ordinals", letter: "O²", nav: "Ordinals e mineração", eyebrow: "06 / 07 — ORDINALS & MINERAÇÃO", title: ["Novos usos.", "Novos incentivos."], description: "Ordinals, aplicações sobre Bitcoin e métricas dos mineradores. Investigamos como taxas e receita da mineração conectam uso, incentivos e oferta.", signals: "APLICAÇÕES / TAXAS / HASHRATE / RECEITA", sculpture: "BLOCOS / INSCRIÇÕES" },
  { id: "derivativos", letter: "D", nav: "Futuros e derivativos", eyebrow: "07 / 07 — FUTUROS & DERIVATIVOS", title: ["O peso da", "alavancagem."], description: "Futuros, opções, funding e posições abertas. A alavancagem e as liquidações podem amplificar altas e quedas.", signals: "FUNDING / OPEN INTEREST / LIQUIDAÇÕES", sculpture: "ALAVANCA / POSIÇÕES" },
  { id: "sobre", letter: "AV", nav: "Sobre mim", eyebrow: "QUEM ESCREVE O BITMOOD", title: ["Olá! Sou", "Adilson Vital."], description: "A história por trás do BITMOOD.", signals: "HISTÓRIA / MÉTODO / TRANSPARÊNCIA", sculpture: "SOBRE / ADILSON VITAL" },
  { id: "canais", letter: "↗", nav: "YouTube e redes", eyebrow: "CONTINUE A CONVERSA", title: ["Outras formas", "de mergulhar."], description: "As perspectivas do BITMOOD em vídeo e nas redes.", signals: "YOUTUBE / REDES SOCIAIS", sculpture: "PLAY / CONVERSA" },
  { id: "newsletter", letter: "@", nav: "Newsletter", eyebrow: "CONTINUE ACOMPANHANDO", title: ["A próxima leitura.", "No seu e-mail."], description: "Receba as próximas análises do BITMOOD: dados, contexto e o raciocínio por trás de cada leitura.", signals: "DADOS / MÉTODO / TRANSPARÊNCIA", sculpture: "BALEIAS AZUIS / GERAÇÕES" },
] as const;

export const pillars = originalChapters.slice(2,9).map((chapter,index)=>({
  ...chapter,
  route: chapter.id === "ordinals" ? "ordinais" : chapter.id,
  worldIndex: index + 2,
  summary: ["Grandes carteiras e fluxos que alteram a oferta.", "Governos, empresas e fundos mudando a escala.", "Tendências, proporções e níveis de preço.", "Juros, inflação e liquidez global.", "O histórico do Bitcoin registrado na rede.", "Inscrições, aplicações e incentivos dos mineradores.", "Futuros, opções e o peso da alavancagem."][index],
}));

export const chapters = [
  originalChapters[0],
  {...originalChapters[1], title:["Sete pilares.","Uma leitura conectada."], description:"Explore as perspectivas que orientam cada análise do BITMOOD."},
  originalChapters[9], originalChapters[10], originalChapters[11],
];

// Populate only with the owner's confirmed official URLs.
export const channels: { label: string; kind: "youtube" | "social"; href: string | null }[] = [
  { label: "YouTube", kind: "youtube", href: null },
  { label: "Redes sociais", kind: "social", href: null },
];
