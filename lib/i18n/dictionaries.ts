/**
 * Textos do site em 3 idiomas: português (original do casal), inglês e
 * árabe (traduções feitas pelo Claude — vale uma revisão de alguém nativo,
 * principalmente no árabe). Nomes de lugares, bairros e marcas não são
 * traduzidos.
 *
 * Rotas: "/" = português, "/en" = inglês, "/ar" = árabe (da direita pra
 * esquerda, `dir="rtl"`, fontes árabes — ver app/globals.css).
 */

export type Locale = "pt" | "en" | "ar";

export const LOCALES: { id: Locale; name: string; short: string; href: string; lang: string; dir: "ltr" | "rtl" }[] = [
  { id: "pt", name: "Português", short: "PT", href: "/", lang: "pt-BR", dir: "ltr" },
  { id: "en", name: "English", short: "EN", href: "/en", lang: "en", dir: "ltr" },
  { id: "ar", name: "العربية", short: "ع", href: "/ar", lang: "ar", dir: "rtl" },
];

export function localeInfo(locale: Locale) {
  return LOCALES.find((l) => l.id === locale)!;
}

type Place = { name: string; desc: string };
type Group = { title: string; places: Place[] };

export type Dictionary = {
  meta: { title: string; description: string };
  hero: { h1: string; loading: string; ready: string; scroll: string };
  nav: {
    historia: string;
    evento: string;
    dresscode: string;
    presentes: string;
    hospedagem: string;
    dicas: string;
    openMenu: string;
    home: string;
    language: string;
  };
  story: { eyebrow: string; title: string; chapters: [string, string, string, string, string]; closing: string };
  event: {
    eyebrow: string;
    title: string;
    lead: string;
    where: string;
    /** títulos das sub-seções "Onde será" e "Itinerário" + selo de aviso */
    whereTitle: string;
    importantLabel: string;
    facadeAlt: string;
    venue: [string, string];
    address: [string, string];
    maps: string;
    waze: string;
    calendar: string;
    /** card "Reserve a data": título e nota */
    saveTitle: string;
    countdown: { many: [string, string]; one: [string, string]; today: string };
    saveNote: string;
    calendarTitle: string;
    calendarDetails: string;
    parkingTitle: string;
    parking: string;
    accessTitle: string;
    access: string;
    itineraryTitle: string;
    itinerary: { time: string; title: string; note: string }[];
    quoteTitle: string;
    quote: string;
  };
  dress: {
    eyebrow: string;
    title: string;
    lead: string;
    herTitle: string;
    her: [string, string];
    himTitle: string;
    him: [string, string];
    paletteTitle: string;
    paletteLead: string;
    families: Record<"amarelo" | "pessego" | "terracota" | "caramelo" | "salvia" | "linho" | "ardosia", string>;
    paletteGroup: string;
    paletteHint: string;
    paletteRange: string;
    base: string;
    lighter: string;
    darker: string;
    askTitle: string;
    avoidName: string;
    avoidWhy: string;
    climate: string;
  };
  gift: {
    title: string;
    sub: string;
    lead: string;
    cta: string;
    pageTitle: string;
    back: string;
    newTab: string;
    newTabLabel: string;
    fallback: string;
    iframeTitle: string;
  };
  /** Chamada "Confirmar presença" (antes do Dress code e no rodapé) e a página /confirmacao-de-presenca. */
  rsvp: {
    title: string;
    lead: string;
    cta: string;
    pageTitle: string;
    newTabLabel: string;
    fallback: string;
    iframeTitle: string;
  };
  /** Card "Em breve: fotos do pré-wedding" (sem botão). */
  prewedding: { title: string; sub: string; lead: string };
  /** Mapa "Onde ficar e aproveitar" (#hospedagem): filtros, cards e controles. */
  around: {
    eyebrow: string;
    title: string;
    lead: string;
    filters: { all: string; hotel: string; cafe: string; restaurante: string; shopping: string; beleza: string };
    venue: string;
    /** "{km}" é trocado pela distância, ex.: "1,2 km". */
    distance: string;
    straight: string;
    route: string;
    mapLabel: string;
    zoomIn: string;
    zoomOut: string;
    recenter: string;
    hotelDesc: Record<string, string>;
    notesTitle: string;
    noteFoodTitle: string;
  };
  stay: {
    eyebrow: string;
    title: string;
    lead: string;
    airbnbTitle: string;
    airbnb: string;
    landmarksTitle: string;
    landmarks: string[];
    hotelsTitle: string;
    hotelsLead: string;
    arriveEyebrow: string;
    arriveTitle: string;
    planeTitle: string;
    plane: [string, string, string];
    busTitle: string;
    busLead: string;
    busSteps: string[];
  };
  tips: {
    eyebrow: string;
    title: string;
    lead: string;
    food: [Group, Group, Group];
    foodNote: string;
    beautyEyebrow: string;
    beautyTitle: string;
    beautyLead: string;
    beauty: [Group, Group];
    beautyNote: string;
  };
  footer: { title: string; signature: string };
};

const pt: Dictionary = {
  meta: {
    title: "Gabriela & Emanuel — Nosso casamento",
    description: "Confirme presença, envie uma foto ou mensagem e conheça os detalhes da nossa celebração.",
  },
  hero: {
    h1: "Gabriela & Emanuel — vamos nos casar em 17 de abril de 2027",
    loading: "Preparando a pintura:",
    ready: "Pronto",
    scroll: "Role para baixo",
  },
  nav: {
    historia: "Nossa história",
    evento: "O grande dia",
    dresscode: "Dress code",
    presentes: "Presentes",
    hospedagem: "Onde ficar",
    dicas: "Dicas da região",
    openMenu: "Abrir menu",
    home: "Gabriela & Emanuel — voltar ao início",
    language: "Idioma",
  },
  story: {
    eyebrow: "Nossa história",
    title: "O amor deu uma volta ao mundo para encontrar a gente.",
    chapters: [
      "Nossa história começou com um desencontro: estivemos em Cape Town, mas enquanto um voltava para casa, o outro acabava de chegar. Ainda não era a nossa hora.",
      "De lá, trouxemos uma grande amiga em comum, que depois nos apresentou do jeito mais despretensioso possível: em um grupo criado por acidente no Instagram. Ela talvez não soubesse, mas estava inaugurando uma carreira de cupido.",
      "Uma conversa puxou outra, a curiosidade virou vontade de estar perto e um convite para viajar com amigos ganhou outros encantos. Entre um café, um passeio e um beijo antes do forró, começamos a descobrir o que nenhum dos dois tinha planejado.",
      "Vieram as viagens para se ver, a saudade e as conversas sinceras que foram abrindo espaço para o amor. Até que estar juntos deixou de ser o plano para o próximo fim de semana e virou o plano para a vida.",
      "O endereço passou a ser o mesmo, os sonhos ganharam um “nós” e, em poucos meses, o casamento já tinha data. Para um começo tão despretensioso, até que aquele grupo rendeu.",
    ],
    closing: "Agora, queremos reunir quem a gente ama para celebrar essa história e viver com vocês um pedacinho dela.",
  },
  event: {
    eyebrow: "O grande dia",
    title: "Nosso encontro está marcado",
    lead: "Sábado, 17 de abril de 2027",
    where: "Onde",
    whereTitle: "Onde será",
    importantLabel: "Importante",
    facadeAlt: "Fachada do condomínio Square, com duas torres e palmeiras na entrada",
    venue: ["Ed. Square 2", "Salão de Festas, Andar “L”"],
    address: ["Rua Luís Correia de Melo, 86", "Chácara Santo Antônio · São Paulo · CEP 04726-220"],
    maps: "Google Maps",
    waze: "Waze",
    calendar: "Salvar na agenda",
    saveTitle: "Reserve a data",
    countdown: { many: ["Faltam", "dias"], one: ["Falta", "dia"], today: "É hoje!" },
    saveNote: "A partir das 16h, em São Paulo. Salve na sua agenda e venha celebrar com a gente!",
    calendarTitle: "Casamento Gabriela & Emanuel",
    calendarDetails: "16h chegada · 16h30 cerimônia · 17h recepção · 22h encerramento",
    parkingTitle: "Estacionamento",
    parking: "O estacionamento é na rua e as vagas podem ser disputadas. Se puder, venha de carro de aplicativo.",
    accessTitle: "Acesso",
    access: "O casamento será em um condomínio. Enviaremos as orientações de entrada mais perto da data.",
    itineraryTitle: "Itinerário",
    itinerary: [
      { time: "16h", title: "Chegada dos convidados", note: "Chegue com calma pra se acomodar antes da cerimônia." },
      { time: "16h30", title: "Cerimônia", note: "O momento do sim." },
      { time: "17h", title: "Recepção e celebração", note: "Boa comida, boas conversas, música e abraços." },
      { time: "22h", title: "Encerramento", note: "Fim da festa — e o começo de muitas lembranças." },
    ],
    quoteTitle: "Boa comida, boas conversas e pessoas queridas.",
    quote:
      "Sonhamos com uma celebração pequena, acolhedora e com tempo para estar junto de verdade. Vai ter música, risadas, abraços e espaço para novos encontros.",
  },
  dress: {
    eyebrow: "Dress code",
    title: "Esporte fino",
    lead: "Queremos todo mundo lindo, confortável e com vontade de dançar. Pense em tecidos leves e elegantes, que combinem com um fim de tarde de outono em São Paulo.",
    herTitle: "Para elas",
    her: [
      "Vestidos midi ou longos, macacões e conjuntos de alfaiataria. Tecidos fluidos, como seda, crepe, linho e viscose, caem muito bem.",
      "No pé, vale o que deixar você dançar a noite toda: salto bloco, sandália ou sapatilha.",
    ],
    himTitle: "Para eles",
    him: [
      "Calça de alfaiataria ou de sarja com camisa social ou de linho. O blazer é bem-vindo e a gravata é opcional.",
      "Sapato social, loafer ou mocassim. A bermuda e o tênis ficam para outro dia.",
    ],
    paletteTitle: "A paleta do nosso dia",
    paletteLead:
      "Tons suaves e terrosos, como numa aquarela. Escolha uma cor e brinque com os tons dela: do mais claro ao mais escuro, todos combinam com a gente.",
    families: {
      amarelo: "Amarelo",
      pessego: "Pêssego",
      terracota: "Terracota",
      caramelo: "Caramelo",
      salvia: "Sálvia",
      linho: "Linho",
      ardosia: "Ardósia",
    },
    paletteGroup: "Cores da paleta",
    paletteHint: "Toque numa cor para ver os tons, do mais claro ao mais escuro.",
    paletteRange: "do mais claro ao mais escuro",
    base: "base",
    lighter: "mais claro",
    darker: "mais escuro",
    askTitle: "Pedimos com carinho",
    avoidName: "Branco e off-white",
    avoidWhy: "ficam para a noiva",
    climate: "Em abril, as noites em São Paulo costumam ser mais fresquinhas: leve um casaquinho ou uma pashmina.",
  },
  prewedding: {
    title: "Pré-wedding",
    sub: "Em breve",
    lead: "Estamos preparando as fotos do nosso pré-wedding com muito carinho. Logo, logo elas aparecem por aqui!",
  },
  gift: {
    title: "Presenteie os noivos",
    sub: "Lista de presentes",
    lead: "Sua presença é o nosso maior presente. Mas, se quiser nos mimar, preparamos uma lista com muito carinho.",
    cta: "Ver lista de presentes",
    pageTitle: "Lista de presentes",
    back: "Voltar",
    newTab: "Abrir em outra aba",
    newTabLabel: "Abrir a lista em outra aba",
    fallback: "Se a lista não aparecer, use “Abrir em outra aba” lá em cima.",
    iframeTitle: "Lista de presentes de Gabriela & Emanuel",
  },
  rsvp: {
    title: "Você vem viver esse dia com a gente?",
    lead: "Estamos preparando tudo com muito carinho e queremos saber se podemos contar com você.",
    cta: "Confirmar presença",
    pageTitle: "Confirmação de presença",
    newTabLabel: "Abrir a confirmação em outra aba",
    fallback: "Se o formulário não aparecer, use “Abrir em outra aba” lá em cima.",
    iframeTitle: "Confirmação de presença no casamento de Gabriela & Emanuel",
  },
  around: {
    eyebrow: "Hospedagem e dicas",
    title: "Onde ficar e aproveitar",
    lead: "O salão fica na Chácara Santo Antônio, Zona Sul de São Paulo. No mapa estão os lugares que separamos por perto: onde se hospedar, tomar um café, comer, passear no shopping e se arrumar para a festa.",
    filters: { all: "Todos", hotel: "Hotéis", cafe: "Cafés e padarias", restaurante: "Restaurantes", shopping: "Shoppings", beleza: "Salões e barbearias" },
    venue: "Nosso casamento",
    distance: "{km} do salão",
    straight: "em linha reta",
    route: "Ver rota",
    mapLabel: "Mapa da região do casamento com os lugares recomendados",
    zoomIn: "Aproximar",
    zoomOut: "Afastar",
    recenter: "Voltar para o salão",
    hotelDesc: {
      intercity: "Hotel executivo na Av. das Nações Unidas, perto da estação Granja Julieta.",
      transamerica: "Hotel executivo no próprio bairro do casamento.",
      novotel: "Hotel na região da Berrini, com restaurante e boa estrutura.",
      ibis: "Opção econômica ao lado do MorumbiShopping.",
    },
    notesTitle: "Bom saber",
    noteFoodTitle: "Horários e delivery",
  },
  stay: {
    eyebrow: "Hospedagem",
    title: "Onde se hospedar",
    lead: "Nosso casamento será na Zona Sul de São Paulo, na Rua Luís Correia de Melo. Para ficar por perto, procure hospedagens nestes bairros:",
    airbnbTitle: "Airbnb",
    airbnb: "Na busca pelo Airbnb, use o mapa e confira o trajeto até o endereço do casamento antes de reservar.",
    landmarksTitle: "Referências da região",
    landmarks: [
      "MorumbiShopping",
      "Shopping Parque da Cidade",
      "Carrefour da Avenida das Nações Unidas",
      "Estação Granja Julieta — Linha 9–Esmeralda",
      "Estação Alto da Boa Vista — Linha 5–Lilás",
    ],
    hotelsTitle: "Prefere ficar em hotel?",
    hotelsLead: "Algumas opções na região para consultar:",
    arriveEyebrow: "Como chegar",
    arriveTitle: "Chegando em São Paulo",
    planeTitle: "De avião",
    plane: [
      "Se puder escolher, dê preferência ao ",
      "Aeroporto de Congonhas",
      ", mais próximo da região do casamento. De lá, você pode pegar um Uber ou 99 até sua hospedagem.",
    ],
    busTitle: "De ônibus",
    busLead: "Chegando pela Rodoviária do Tietê:",
    busSteps: [
      "Na rodoviária, siga as placas para a estação Portuguesa–Tietê.",
      "Pegue a Linha 1–Azul, sentido Jabaquara, e desça na estação Santa Cruz.",
      "Faça a transferência para a Linha 5–Lilás, sentido Capão Redondo.",
      "Desça na estação Alto da Boa Vista.",
      "De lá, pegue um Uber ou 99 até sua hospedagem.",
    ],
  },
  tips: {
    eyebrow: "Dicas da região",
    title: "Onde comer por perto",
    lead: "Para quem chegar antes ou ficar mais alguns dias, aqui vão algumas dicas para comer por perto!",
    food: [
      {
        title: "Restaurantes e botecos",
        places: [
          {
            name: "Casarão de Minas",
            desc: "Comida mineira para comer no local ou pedir pelo iFood. Nossa dica: os pratos executivos são bem servidos e, dependendo da fome, dão para duas pessoas!",
          },
          { name: "Parrilaria Granja Julieta", desc: "Para quem gosta de comida de bar e espetinhos." },
          { name: "Boteco Vila Cruzeiro", desc: "Uma opção para petiscar e conversar sem pressa." },
          { name: "Boteco São Paulo — Vila Cruzeiro", desc: "Outra alternativa de boteco no bairro." },
        ],
      },
      {
        title: "Café da manhã ou um lanche",
        places: [
          { name: "Padaria Flor das Américas", desc: "Para tomar um café e fazer uma pausa para um lanche." },
          {
            name: "Giga",
            desc: "Além de mercado, tem padaria. Prático para tomar um café e aproveitar para comprar o que precisar para a hospedagem.",
          },
        ],
      },
      {
        title: "Shoppings e praças de alimentação",
        places: [
          { name: "Shopping Parque da Cidade", desc: "Opções de refeições, lanches e cafés." },
          { name: "MorumbiShopping", desc: "Praça de alimentação e uma variedade de restaurantes." },
          { name: "Shopping Market Place", desc: "Praça de alimentação e restaurantes, pertinho do MorumbiShopping." },
        ],
      },
    ],
    foodNote:
      "Confira os horários antes de sair e, para pedidos por delivery, a disponibilidade de entrega no endereço da sua hospedagem.",
    beautyEyebrow: "Salões de beleza e barbearias",
    beautyTitle: "Uma ajuda com a produção",
    beautyLead: "Quer uma ajuda com a produção para o casamento? Separamos algumas opções na região para consultar e agendar!",
    beauty: [
      {
        title: "Cabelo, maquiagem e unhas",
        places: [
          { name: "Ritualle Bem Estar", desc: "Vila Cruzeiro — salão de beleza e estética na região." },
          { name: "Geff Lima", desc: "Granja Julieta — salão especializado em cabelos e mechas, na Rua Booker Pittman, 57." },
          {
            name: "Jacques Janine",
            desc: "Granja Julieta — escova, penteados, maquiagem, manicure e pedicure. Também oferece corte masculino e barba.",
          },
          { name: "Espaço Dharma", desc: "Vila Cruzeiro — serviços de cabelo, escova, manicure e pedicure. Também conta com barbearia." },
        ],
      },
      {
        title: "Barbearias",
        places: [
          { name: "Tarantino", desc: "Chácara Santo Antônio — corte de cabelo, barba e visagismo." },
          { name: "Corleone", desc: "MorumbiShopping — corte de cabelo e cuidados com a barba." },
        ],
      },
    ],
    beautyNote:
      "Agende com antecedência e confirme os serviços, valores e tempo de atendimento. Nosso encontro começa às 16h, então reserve uma folguinha para se vestir e chegar com calma! 🤍",
  },
  footer: { title: "Esperamos vocês para celebrar com a gente!", signature: "Com amor, Gabriela & Emanuel" },
};

const en: Dictionary = {
  meta: {
    title: "Gabriela & Emanuel — Our wedding",
    description: "RSVP, send us a photo or a message and find all the details of our celebration.",
  },
  hero: {
    h1: "Gabriela & Emanuel — we're getting married on April 17, 2027",
    loading: "Preparing the painting:",
    ready: "Ready",
    scroll: "Scroll down",
  },
  nav: {
    historia: "Our story",
    evento: "The big day",
    dresscode: "Dress code",
    presentes: "Gifts",
    hospedagem: "Where to stay",
    dicas: "Local tips",
    openMenu: "Open menu",
    home: "Gabriela & Emanuel — back to the top",
    language: "Language",
  },
  story: {
    eyebrow: "Our story",
    title: "Love went around the world to find us.",
    chapters: [
      "Our story began with a near miss: we were both in Cape Town, but as one of us was heading home, the other had just arrived. It wasn't our time yet.",
      "From there, we brought home a dear friend in common, who later introduced us in the most unassuming way possible: in a group chat created by accident on Instagram. She may not have known it, but she was starting a career as a cupid.",
      "One conversation led to another, curiosity turned into wanting to be close, and an invitation to travel with friends took on a new charm. Between a coffee, a stroll and a kiss before the forró, we began to discover something neither of us had planned.",
      "Then came the trips to see each other, the missing each other, and the honest conversations that made room for love. Until being together stopped being the plan for next weekend and became the plan for life.",
      "We moved in together, our dreams became “ours” and, within a few months, the wedding had a date. For such an unassuming beginning, that group chat really paid off.",
    ],
    closing: "Now we want to gather the people we love to celebrate this story and share a little piece of it with you.",
  },
  event: {
    eyebrow: "The big day",
    title: "Save the date",
    lead: "Saturday, April 17, 2027",
    where: "Where",
    whereTitle: "Where it will be",
    importantLabel: "Important",
    facadeAlt: "Front of the Square condominium, with two towers and palm trees at the entrance",
    venue: ["Ed. Square 2", "Party Hall, Floor “L”"],
    address: ["Rua Luís Correia de Melo, 86", "Chácara Santo Antônio · São Paulo · Brazil · 04726-220"],
    maps: "Google Maps",
    waze: "Waze",
    calendar: "Add to calendar",
    saveTitle: "Save the date",
    countdown: { many: ["", "days to go"], one: ["", "day to go"], today: "It's today!" },
    saveNote: "From 4 pm, in São Paulo. Add it to your calendar and come celebrate with us!",
    calendarTitle: "Gabriela & Emanuel's wedding",
    calendarDetails: "4 pm arrival · 4:30 pm ceremony · 5 pm reception · 10 pm farewell",
    parkingTitle: "Parking",
    parking: "Parking is on the street and spots can be hard to find. If you can, come by Uber or 99.",
    accessTitle: "Access",
    access: "The wedding will take place in a residential building. We'll send the entry instructions closer to the date.",
    itineraryTitle: "Schedule",
    itinerary: [
      { time: "4:00 pm", title: "Guests arrive", note: "Arrive with time to settle in before the ceremony." },
      { time: "4:30 pm", title: "Ceremony", note: "The moment we say “I do”." },
      { time: "5:00 pm", title: "Reception & celebration", note: "Good food, good conversation, music and hugs." },
      { time: "10:00 pm", title: "Farewell", note: "The end of the party — and the start of many memories." },
    ],
    quoteTitle: "Good food, good conversation and people we love.",
    quote:
      "We dreamed of a small, warm celebration, with time to truly be together. There will be music, laughter, hugs and room for new friendships.",
  },
  dress: {
    eyebrow: "Dress code",
    title: "Smart casual",
    lead: "We want everyone to feel beautiful, comfortable and ready to dance. Think light, elegant fabrics that suit a late autumn afternoon in São Paulo.",
    herTitle: "For her",
    her: [
      "Midi or long dresses, jumpsuits and tailored sets. Flowing fabrics such as silk, crêpe, linen and viscose work beautifully.",
      "For shoes, choose whatever lets you dance all night: block heels, sandals or flats.",
    ],
    himTitle: "For him",
    him: [
      "Tailored or chino trousers with a dress shirt or a linen shirt. A blazer is welcome and a tie is optional.",
      "Dress shoes, loafers or moccasins. Save the shorts and sneakers for another day.",
    ],
    paletteTitle: "The palette of our day",
    paletteLead:
      "Soft, earthy tones, like a watercolor. Pick a color and play with its shades: from the lightest to the darkest, they all go with us.",
    families: {
      amarelo: "Yellow",
      pessego: "Peach",
      terracota: "Terracotta",
      caramelo: "Caramel",
      salvia: "Sage",
      linho: "Linen",
      ardosia: "Slate",
    },
    paletteGroup: "Palette colors",
    paletteHint: "Tap a color to see its shades, from lightest to darkest.",
    paletteRange: "from lightest to darkest",
    base: "base",
    lighter: "lighter",
    darker: "darker",
    askTitle: "A kind request",
    avoidName: "White and off-white",
    avoidWhy: "are for the bride",
    climate: "In April, evenings in São Paulo tend to be cool: bring a light jacket or a pashmina.",
  },
  prewedding: {
    title: "Pre-wedding",
    sub: "Coming soon",
    lead: "We are lovingly preparing our pre-wedding photos. They will be here very soon!",
  },
  gift: {
    title: "Gifts for the couple",
    sub: "Gift registry",
    lead: "Your presence is the greatest gift of all. But if you'd like to spoil us, we've put together a registry with lots of love.",
    cta: "See the gift registry",
    pageTitle: "Gift registry",
    back: "Back",
    newTab: "Open in a new tab",
    newTabLabel: "Open the registry in a new tab",
    fallback: "If the registry doesn't show up, use “Open in a new tab” above.",
    iframeTitle: "Gabriela & Emanuel's gift registry",
  },
  rsvp: {
    title: "Will you share this day with us?",
    lead: "We're preparing everything with lots of love and would love to know if we can count on you.",
    cta: "RSVP",
    pageTitle: "RSVP",
    newTabLabel: "Open the RSVP form in a new tab",
    fallback: "If the form doesn't show up, use “Open in a new tab” above.",
    iframeTitle: "RSVP for Gabriela & Emanuel's wedding",
  },
  around: {
    eyebrow: "Stay & local tips",
    title: "Where to stay and enjoy",
    lead: "The venue is in Chácara Santo Antônio, in the South Zone of São Paulo. The map shows the places we picked nearby: where to stay, grab a coffee, eat, go to the mall and get ready for the party.",
    filters: { all: "All", hotel: "Hotels", cafe: "Cafés & bakeries", restaurante: "Restaurants", shopping: "Malls", beleza: "Salons & barbers" },
    venue: "Our wedding",
    distance: "{km} from the venue",
    straight: "as the crow flies",
    route: "Directions",
    mapLabel: "Map of the wedding area with our recommended places",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    recenter: "Back to the venue",
    hotelDesc: {
      intercity: "Business hotel on Av. das Nações Unidas, near Granja Julieta station.",
      transamerica: "Business hotel in the wedding's own neighborhood.",
      novotel: "Hotel in the Berrini area, with a restaurant and good facilities.",
      ibis: "Budget option right next to MorumbiShopping.",
    },
    notesTitle: "Good to know",
    noteFoodTitle: "Opening hours & delivery",
  },
  stay: {
    eyebrow: "Where to stay",
    title: "Where to stay",
    lead: "Our wedding will be in the South Zone of São Paulo, on Rua Luís Correia de Melo. To stay nearby, look for places in these neighborhoods:",
    airbnbTitle: "Airbnb",
    airbnb: "When searching on Airbnb, use the map and check the route to the wedding address before booking.",
    landmarksTitle: "Landmarks in the area",
    landmarks: [
      "MorumbiShopping",
      "Shopping Parque da Cidade",
      "Carrefour on Avenida das Nações Unidas",
      "Granja Julieta station — Line 9–Emerald",
      "Alto da Boa Vista station — Line 5–Lilac",
    ],
    hotelsTitle: "Prefer a hotel?",
    hotelsLead: "A few options in the area:",
    arriveEyebrow: "Getting here",
    arriveTitle: "Arriving in São Paulo",
    planeTitle: "By plane",
    plane: [
      "If you can choose, fly into ",
      "Congonhas Airport",
      ", the closest to the wedding area. From there, you can take an Uber or 99 to where you're staying.",
    ],
    busTitle: "By bus",
    busLead: "Arriving at the Tietê Bus Terminal:",
    busSteps: [
      "At the terminal, follow the signs to Portuguesa–Tietê station.",
      "Take Line 1–Blue towards Jabaquara and get off at Santa Cruz station.",
      "Transfer to Line 5–Lilac towards Capão Redondo.",
      "Get off at Alto da Boa Vista station.",
      "From there, take an Uber or 99 to where you're staying.",
    ],
  },
  tips: {
    eyebrow: "Local tips",
    title: "Where to eat nearby",
    lead: "For those arriving early or staying a few extra days, here are some tips on where to eat nearby!",
    food: [
      {
        title: "Restaurants & bars",
        places: [
          {
            name: "Casarão de Minas",
            desc: "Food from Minas Gerais to eat in or order on iFood. Our tip: the lunch specials are generous and, depending on how hungry you are, can feed two!",
          },
          { name: "Parrilaria Granja Julieta", desc: "For fans of bar food and skewers." },
          { name: "Boteco Vila Cruzeiro", desc: "A spot for snacks and unhurried conversation." },
          { name: "Boteco São Paulo — Vila Cruzeiro", desc: "Another neighborhood bar option." },
        ],
      },
      {
        title: "Breakfast or a snack",
        places: [
          { name: "Padaria Flor das Américas", desc: "A bakery for a coffee and a snack break." },
          {
            name: "Giga",
            desc: "A supermarket with a bakery. Handy for a coffee and for picking up anything you need for your stay.",
          },
        ],
      },
      {
        title: "Malls & food courts",
        places: [
          { name: "Shopping Parque da Cidade", desc: "Meals, snacks and coffee shops." },
          { name: "MorumbiShopping", desc: "A food court and a variety of restaurants." },
          { name: "Shopping Market Place", desc: "A food court and restaurants, right next to MorumbiShopping." },
        ],
      },
    ],
    foodNote: "Check opening hours before heading out and, for delivery orders, whether they deliver to your address.",
    beautyEyebrow: "Beauty salons & barbershops",
    beautyTitle: "A little help getting ready",
    beautyLead: "Want some help getting ready for the wedding? Here are a few options in the area to check out and book!",
    beauty: [
      {
        title: "Hair, makeup & nails",
        places: [
          { name: "Ritualle Bem Estar", desc: "Vila Cruzeiro — beauty and aesthetics salon in the area." },
          { name: "Geff Lima", desc: "Granja Julieta — salon specialized in hair and highlights, at Rua Booker Pittman, 57." },
          {
            name: "Jacques Janine",
            desc: "Granja Julieta — blow-dry, hairstyling, makeup, manicure and pedicure. Also offers men's haircuts and beard trims.",
          },
          { name: "Espaço Dharma", desc: "Vila Cruzeiro — hair, blow-dry, manicure and pedicure. Also has a barbershop." },
        ],
      },
      {
        title: "Barbershops",
        places: [
          { name: "Tarantino", desc: "Chácara Santo Antônio — haircuts, beard and grooming consultancy." },
          { name: "Corleone", desc: "MorumbiShopping — haircuts and beard care." },
        ],
      },
    ],
    beautyNote:
      "Book in advance and confirm services, prices and how long it takes. Our celebration starts at 4 pm, so leave yourself some time to get dressed and arrive calmly! 🤍",
  },
  footer: { title: "We can't wait to celebrate with you!", signature: "With love, Gabriela & Emanuel" },
};

const ar: Dictionary = {
  meta: {
    title: "غابرييلا وإيمانويل — حفل زفافنا",
    description: "أكّدوا حضوركم وتعرّفوا على كل تفاصيل احتفالنا.",
  },
  hero: {
    h1: "غابرييلا وإيمانويل — سنتزوّج في 17 أبريل 2027",
    loading: "نُحضّر اللوحة:",
    ready: "جاهز",
    scroll: "مرّر للأسفل",
  },
  nav: {
    historia: "قصتنا",
    evento: "اليوم الكبير",
    dresscode: "قواعد اللباس",
    presentes: "الهدايا",
    hospedagem: "أين تقيمون",
    dicas: "نصائح المنطقة",
    openMenu: "فتح القائمة",
    home: "غابرييلا وإيمانويل — العودة إلى البداية",
    language: "اللغة",
  },
  story: {
    eyebrow: "قصتنا",
    title: "دار الحبّ حول العالم ليجدنا.",
    chapters: [
      "بدأت قصتنا بلقاءٍ لم يكتمل: كنّا كلانا في كيب تاون، لكن بينما كان أحدنا عائدًا إلى البيت، كان الآخر قد وصل للتوّ. لم يكن الوقت قد حان بعد.",
      "ومن هناك عدنا بصديقةٍ عزيزة مشتركة، عرّفتنا على بعضنا لاحقًا بأبسط طريقةٍ ممكنة: في مجموعةٍ أُنشئت بالصدفة على إنستغرام. ربما لم تكن تعلم، لكنها كانت تبدأ مسيرتها كـ«كيوبيد».",
      "جرّت محادثةٌ محادثةً أخرى، وتحوّل الفضول إلى رغبةٍ في القرب، واكتسبت دعوةٌ للسفر مع الأصدقاء سحرًا جديدًا. بين فنجان قهوة ونزهةٍ وقُبلةٍ قبل رقصة الفورّو، بدأنا نكتشف ما لم يخطّط له أيٌّ منّا.",
      "ثم جاءت الرحلات لنرى بعضنا، والشوق، والأحاديث الصادقة التي أفسحت مكانًا للحبّ. حتى لم يعد أن نكون معًا خطةً لعطلة نهاية الأسبوع القادمة، بل صار خطة العمر.",
      "صار عنواننا واحدًا، وأصبحت أحلامنا «أحلامنا نحن»، وخلال أشهرٍ قليلة صار للزفاف موعد. لبدايةٍ بهذه البساطة، يبدو أن تلك المجموعة أثمرت حقًّا.",
    ],
    closing: "والآن نريد أن نجمع من نحبّهم لنحتفل بهذه القصة ونعيش معكم جزءًا صغيرًا منها.",
  },
  event: {
    eyebrow: "اليوم الكبير",
    title: "موعدنا محدَّد",
    lead: "السبت، 17 أبريل 2027",
    where: "المكان",
    whereTitle: "أين سيكون",
    importantLabel: "مهم",
    facadeAlt: "واجهة مجمّع سكوير، ببرجين وأشجار نخيل عند المدخل",
    venue: ["مبنى Square 2", "قاعة الحفلات، الطابق «L»"],
    address: ["Rua Luís Correia de Melo, 86", "Chácara Santo Antônio · ساو باولو · البرازيل"],
    maps: "خرائط Google",
    waze: "Waze",
    calendar: "أضِف إلى التقويم",
    saveTitle: "احفظوا الموعد",
    countdown: { many: ["باقي", "يومًا"], one: ["باقي", "يوم"], today: "إنه اليوم!" },
    saveNote: "ابتداءً من الساعة 4:00 م، في ساو باولو. أضيفوه إلى تقويمكم وتعالوا نحتفل معًا!",
    calendarTitle: "زفاف غابرييلا وإيمانويل",
    calendarDetails: "4:00 م الوصول · 4:30 م المراسم · 5:00 م الاستقبال · 10:00 م الختام",
    parkingTitle: "مواقف السيارات",
    parking: "المواقف في الشارع وقد يصعب إيجاد مكان. إن أمكن، تعالوا بسيارة أجرة عبر التطبيق.",
    accessTitle: "الدخول",
    access: "سيُقام الزفاف داخل مجمّعٍ سكني. سنرسل تعليمات الدخول قبل الموعد بقليل.",
    itineraryTitle: "برنامج اليوم",
    itinerary: [
      { time: "4:00 م", title: "وصول الضيوف", note: "تعالوا مبكرًا قليلًا لتستقرّوا قبل المراسم." },
      { time: "4:30 م", title: "المراسم", note: "لحظة «نعم»." },
      { time: "5:00 م", title: "الاستقبال والاحتفال", note: "طعامٌ طيّب، وأحاديث جميلة، وموسيقى، وأحضان." },
      { time: "10:00 م", title: "الختام", note: "نهاية الحفل — وبداية ذكرياتٍ كثيرة." },
    ],
    quoteTitle: "طعامٌ طيّب، وأحاديث جميلة، وأناسٌ نحبّهم.",
    quote: "حلمنا باحتفالٍ صغيرٍ ودافئ، فيه متّسعٌ من الوقت لنكون معًا حقًّا. ستكون هناك موسيقى وضحكات وأحضان ومساحةٌ للقاءاتٍ جديدة.",
  },
  dress: {
    eyebrow: "قواعد اللباس",
    title: "أنيق غير رسمي",
    lead: "نريد أن يشعر الجميع بالجمال والراحة والرغبة في الرقص. اختاروا أقمشةً خفيفةً وأنيقة تناسب عصرَ يومٍ خريفيّ في ساو باولو.",
    herTitle: "لها",
    her: [
      "فساتين متوسطة الطول أو طويلة، أو أفرولات، أو أطقم مفصّلة. الأقمشة الانسيابية مثل الحرير والكريب والكتان والفسكوز تبدو رائعة.",
      "أما الحذاء، فاختاري ما يتيح لكِ الرقص طوال الليل: كعبًا عريضًا أو صندلًا أو حذاءً مسطّحًا.",
    ],
    himTitle: "له",
    him: [
      "بنطال مفصّل أو قطني مع قميصٍ رسمي أو من الكتان. السترة مرحَّبٌ بها وربطة العنق اختيارية.",
      "حذاء رسمي أو لوفر أو موكاسان. أما السراويل القصيرة والأحذية الرياضية فلتبقَ ليومٍ آخر.",
    ],
    paletteTitle: "ألوان يومنا",
    paletteLead: "درجاتٌ هادئة وترابية، كأنها لوحةٌ مائية. اختاروا لونًا واستمتعوا بدرجاته: من الأفتح إلى الأغمق، كلّها تنسجم معنا.",
    families: {
      amarelo: "أصفر",
      pessego: "خوخي",
      terracota: "طيني",
      caramelo: "كراميل",
      salvia: "أخضر مريمي",
      linho: "كتّاني",
      ardosia: "أردوازي",
    },
    paletteGroup: "ألوان اللوحة",
    paletteHint: "المسوا لونًا لرؤية درجاته، من الأفتح إلى الأغمق.",
    paletteRange: "من الأفتح إلى الأغمق",
    base: "الأساس",
    lighter: "أفتح",
    darker: "أغمق",
    askTitle: "رجاءٌ بمحبّة",
    avoidName: "الأبيض والأوف وايت",
    avoidWhy: "للعروس",
    climate: "في أبريل تكون أمسيات ساو باولو منعشةً عادةً: أحضروا سترةً خفيفة أو شالًا.",
  },
  prewedding: {
    title: "صور ما قبل الزفاف",
    sub: "قريبًا",
    lead: "نُحضّر صور ما قبل الزفاف بكل حب، وستكون هنا قريبًا جدًا!",
  },
  gift: {
    title: "هدية للعروسين",
    sub: "قائمة الهدايا",
    lead: "حضوركم هو أجمل هدية لنا. وإن أحببتم تدليلنا، فقد أعددنا قائمةً بكل حب.",
    cta: "عرض قائمة الهدايا",
    pageTitle: "قائمة الهدايا",
    back: "رجوع",
    newTab: "فتح في علامة تبويب جديدة",
    newTabLabel: "فتح القائمة في علامة تبويب جديدة",
    fallback: "إن لم تظهر القائمة، استخدموا «فتح في علامة تبويب جديدة» في الأعلى.",
    iframeTitle: "قائمة هدايا غابرييلا وإيمانويل",
  },
  rsvp: {
    title: "هل ستعيش هذا اليوم معنا؟",
    lead: "نُعِدّ كل شيء بكثير من الحب، ونودّ أن نعرف إن كان بإمكاننا الاعتماد على حضورك.",
    cta: "تأكيد الحضور",
    pageTitle: "تأكيد الحضور",
    newTabLabel: "فتح نموذج تأكيد الحضور في علامة تبويب جديدة",
    fallback: "إن لم يظهر النموذج، استخدموا «فتح في علامة تبويب جديدة» في الأعلى.",
    iframeTitle: "تأكيد الحضور في حفل زفاف غابرييلا وإيمانويل",
  },
  around: {
    eyebrow: "الإقامة ونصائح المنطقة",
    title: "أين تقيمون وتستمتعون",
    lead: "تقع القاعة في حي Chácara Santo Antônio في المنطقة الجنوبية من ساو باولو. على الخريطة الأماكن التي اخترناها بالقرب: للإقامة، وشرب القهوة، والأكل، والتسوّق، والاستعداد للحفل.",
    filters: { all: "الكل", hotel: "فنادق", cafe: "مقاهٍ ومخابز", restaurante: "مطاعم", shopping: "مراكز تسوّق", beleza: "صالونات وحلاقون" },
    venue: "حفل زفافنا",
    distance: "{km} من القاعة",
    straight: "بخط مستقيم",
    route: "الاتجاهات",
    mapLabel: "خريطة منطقة الزفاف مع الأماكن التي نوصي بها",
    zoomIn: "تكبير",
    zoomOut: "تصغير",
    recenter: "العودة إلى القاعة",
    hotelDesc: {
      intercity: "فندق أعمال في Av. das Nações Unidas قرب محطة Granja Julieta.",
      transamerica: "فندق أعمال في حي الزفاف نفسه.",
      novotel: "فندق في منطقة Berrini مع مطعم ومرافق جيدة.",
      ibis: "خيار اقتصادي بجوار MorumbiShopping.",
    },
    notesTitle: "من المفيد معرفته",
    noteFoodTitle: "المواعيد والتوصيل",
  },
  stay: {
    eyebrow: "الإقامة",
    title: "أين تقيمون",
    lead: "سيُقام زفافنا في المنطقة الجنوبية من ساو باولو، في شارع Rua Luís Correia de Melo. للإقامة بالقرب، ابحثوا عن سكنٍ في هذه الأحياء:",
    airbnbTitle: "Airbnb",
    airbnb: "عند البحث في Airbnb، استخدموا الخريطة وتحقّقوا من المسافة إلى عنوان الزفاف قبل الحجز.",
    landmarksTitle: "معالم في المنطقة",
    landmarks: [
      "MorumbiShopping",
      "Shopping Parque da Cidade",
      "كارفور في Avenida das Nações Unidas",
      "محطة Granja Julieta — الخط 9 (الزمرّدي)",
      "محطة Alto da Boa Vista — الخط 5 (الليلكي)",
    ],
    hotelsTitle: "تفضّلون الفندق؟",
    hotelsLead: "بعض الخيارات في المنطقة:",
    arriveEyebrow: "كيف تصلون",
    arriveTitle: "الوصول إلى ساو باولو",
    planeTitle: "بالطائرة",
    plane: [
      "إن استطعتم الاختيار، فضّلوا ",
      "مطار كونغونياس",
      "، فهو الأقرب إلى منطقة الزفاف. ومن هناك يمكنكم أخذ Uber أو 99 إلى مكان إقامتكم.",
    ],
    busTitle: "بالحافلة",
    busLead: "عند الوصول إلى محطة حافلات Tietê:",
    busSteps: [
      "في المحطة، اتبعوا اللافتات إلى محطة مترو Portuguesa–Tietê.",
      "خذوا الخط 1 (الأزرق) باتجاه Jabaquara وانزلوا في محطة Santa Cruz.",
      "انتقلوا إلى الخط 5 (الليلكي) باتجاه Capão Redondo.",
      "انزلوا في محطة Alto da Boa Vista.",
      "ومن هناك خذوا Uber أو 99 إلى مكان إقامتكم.",
    ],
  },
  tips: {
    eyebrow: "نصائح المنطقة",
    title: "أين تأكلون بالقرب",
    lead: "لمن يصل مبكرًا أو يبقى بضعة أيام إضافية، إليكم بعض الأماكن لتناول الطعام بالقرب!",
    food: [
      {
        title: "مطاعم ومقاهٍ شعبية",
        places: [
          {
            name: "Casarão de Minas",
            desc: "مطبخ ولاية ميناس جيرايس، للأكل في المكان أو الطلب عبر iFood. نصيحتنا: وجبات الغداء سخية وقد تكفي شخصين!",
          },
          { name: "Parrilaria Granja Julieta", desc: "لمحبّي أطباق المقاهي والأسياخ المشوية." },
          { name: "Boteco Vila Cruzeiro", desc: "مكانٌ للمقبّلات والحديث على مهل." },
          { name: "Boteco São Paulo — Vila Cruzeiro", desc: "خيارٌ آخر في الحيّ." },
        ],
      },
      {
        title: "فطور أو وجبة خفيفة",
        places: [
          { name: "Padaria Flor das Américas", desc: "مخبزٌ لفنجان قهوة واستراحةٍ مع وجبةٍ خفيفة." },
          { name: "Giga", desc: "سوبرماركت فيه مخبز. عمليّ لشرب القهوة وشراء ما تحتاجونه لإقامتكم." },
        ],
      },
      {
        title: "مراكز تسوّق وساحات طعام",
        places: [
          { name: "Shopping Parque da Cidade", desc: "وجبات ووجبات خفيفة ومقاهٍ." },
          { name: "MorumbiShopping", desc: "ساحة طعام ومجموعة متنوّعة من المطاعم." },
          { name: "Shopping Market Place", desc: "ساحة طعام ومطاعم، بالقرب من MorumbiShopping." },
        ],
      },
    ],
    foodNote: "تحقّقوا من مواعيد العمل قبل الخروج، ومن إمكانية التوصيل إلى عنوان إقامتكم عند الطلب.",
    beautyEyebrow: "صالونات تجميل وحلاقة",
    beautyTitle: "مساعدة في التجهّز",
    beautyLead: "تحتاجون مساعدة في التجهّز للزفاف؟ اخترنا لكم بعض الأماكن في المنطقة للاستفسار والحجز!",
    beauty: [
      {
        title: "شعر ومكياج وأظافر",
        places: [
          { name: "Ritualle Bem Estar", desc: "Vila Cruzeiro — صالون تجميل وعناية." },
          { name: "Geff Lima", desc: "Granja Julieta — صالون متخصّص في الشعر والخصلات، Rua Booker Pittman, 57." },
          { name: "Jacques Janine", desc: "Granja Julieta — تصفيف ومكياج وعناية بالأظافر. ويقدّم أيضًا قصّ الشعر للرجال وتهذيب اللحية." },
          { name: "Espaço Dharma", desc: "Vila Cruzeiro — شعر وتصفيف وعناية بالأظافر، وفيه أيضًا ركنٌ للحلاقة." },
        ],
      },
      {
        title: "صالونات حلاقة",
        places: [
          { name: "Tarantino", desc: "Chácara Santo Antônio — قصّ الشعر واللحية واستشارات المظهر." },
          { name: "Corleone", desc: "MorumbiShopping — قصّ الشعر والعناية باللحية." },
        ],
      },
    ],
    beautyNote: "احجزوا مسبقًا وتأكّدوا من الخدمات والأسعار ومدّة الموعد. يبدأ لقاؤنا في الرابعة عصرًا، فخصّصوا وقتًا كافيًا لتتجهّزوا وتصلوا بهدوء! 🤍",
  },
  footer: { title: "ننتظركم لنحتفل معًا!", signature: "مع الحب، غابرييلا وإيمانويل" },
};

export const DICTIONARIES: Record<Locale, Dictionary> = { pt, en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
