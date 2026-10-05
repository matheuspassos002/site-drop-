export interface ProductSize {
  id: string;
  label: string;
  subtitle: string;
  detail: string;
}

export interface ProductVariation {
  id: string;
  name: string;
  colorHex?: string;
  volume?: string;
}

export interface ColorSwatch {
  id: string;
  name: string;
  hex: string;
  image: string;
  borderColor?: string;
}

export interface ProductKit {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice: number;
  installments: string;
  popular?: boolean;
  badge?: string;
  savingsText: string;
  quantity: number;
  pricePerUnit: string;
  supplierCost: number;
}

export interface CustomerReview {
  id: string;
  handle: string;
  author: string;
  avatar: string;
  likes: string;
  timeAgo: string;
  comment: string;
  badgeText: string;
  verifiedBuyer: boolean;
  rating: number;
}

export interface TechFeature {
  iconName: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
}

export interface ProductConfig {
  name: string;
  tagline: string;
  headline: string;
  subheadline: string;
  rating: number;
  reviewsCount: number;
  supplierBaseCost: number;
  stockLeft: number;
  countdownMinutes: number;
  colorInfo: {
    title: string;
    description: string;
    badge: string;
    colors: ColorSwatch[];
  };
  gallery: {
    src: string;
    alt: string;
  }[];
  sizes: ProductSize[];
  variations: ProductVariation[];
  kits: ProductKit[];
  techFeatures: TechFeature[];
  comparison: {
    criterion: string;
    commonBriefs: string;
    microfiberKit: string;
    highlight?: boolean;
  }[];
  reviews: CustomerReview[];
  faq: {
    question: string;
    answer: string;
  }[];
  guarantee: {
    days: number;
    title: string;
    description: string;
  };
}

export const PRODUCT_SIZES: ProductSize[] = [
  { id: 'P', label: 'P', subtitle: '36', detail: 'Tamanho P (36) • Cintura 72 a 76 cm' },
  { id: 'M', label: 'M', subtitle: '38', detail: 'Tamanho M (38) • Cintura 78 a 82 cm' },
  { id: 'G', label: 'G', subtitle: '40/42', detail: 'Tamanho G (40/42) • Cintura 84 a 90 cm' },
  { id: 'GG', label: 'GG', subtitle: '44/46', detail: 'Tamanho GG (44/46) • Cintura 92 a 100 cm' },
];

export const PRODUCT_CONFIG: ProductConfig = {
  name: "Kit 10 Cuecas Boxer Masculinas de Microfibra Conforto",
  tagline: "Tecnologia Dry Anatômica • Anti-Assadura • Cós Que Não Enrola",
  headline: "O Fim das Cuecas Que Enrolam, Apertam e Retêm Suor",
  subheadline:
    "Desenvolvidas com microfibra premium de alta respirabilidade e forro 100% algodão hipoalergênico. Ajuste anatômico preciso que acompanha os movimentos do seu corpo o dia todo sem deformar.",
  rating: 4.9,
  reviewsCount: 2380,
  supplierBaseCost: 48.00,
  stockLeft: 14,
  countdownMinutes: 15,
  colorInfo: {
    title: "Cores Lisas Sortidas no Pacote",
    description: "Kit montado de fábrica com cores clássicas e discretas: Preto, Branco, Azul Médio/Aço, Azul Marinho, Cinza Grafite e Vinho/Bordô. Zero estampas infantis ou chamativas.",
    badge: "SORTIMENTO DE FÁBRICA",
    colors: [
      { id: "preto", name: "Preto", hex: "#111111", image: "/images/boxer_black.jpg" },
      { id: "branco", name: "Branco", hex: "#FFFFFF", borderColor: "#D1D5DB", image: "/images/boxer_white.jpg" },
      { id: "azul-medio", name: "Azul Médio / Aço", hex: "#3B82F6", image: "/images/boxer_blue.jpg" },
      { id: "azul-marinho", name: "Azul Marinho", hex: "#1E293B", image: "/images/boxer_navy.jpg" },
      { id: "cinza-grafite", name: "Cinza Grafite", hex: "#6B7280", image: "/images/boxer_grey.jpg" },
      { id: "vinho-bordo", name: "Vinho / Bordô", hex: "#881337", image: "/images/boxer_burgundy.jpg" },
    ],
  },
  gallery: [
    {
      src: "/images/hero.jpg",
      alt: "Kit Cuecas Boxer Masculinas Microfibra Conforto Cores Lisas Sortidas",
    },
    {
      src: "/images/boxer_black.jpg",
      alt: "Cueca Boxer Microfibra Preto",
    },
    {
      src: "/images/boxer_white.jpg",
      alt: "Cueca Boxer Microfibra Branco",
    },
    {
      src: "/images/boxer_blue.jpg",
      alt: "Cueca Boxer Microfibra Azul Médio Aço",
    },
    {
      src: "/images/boxer_navy.jpg",
      alt: "Cueca Boxer Microfibra Azul Marinho",
    },
    {
      src: "/images/boxer_grey.jpg",
      alt: "Cueca Boxer Microfibra Cinza Grafite",
    },
    {
      src: "/images/boxer_burgundy.jpg",
      alt: "Cueca Boxer Microfibra Vinho Bordô",
    },
    {
      src: "/images/texture.jpg",
      alt: "Detalhe da trama respirável de microfibra com costura flatlock anti-atrito",
    },
    {
      src: "/images/model.jpg",
      alt: "Caimento ergonômico anatômico que não sobe nas pernas ao caminhar",
    },
    {
      src: "/images/box.jpg",
      alt: "Apresentação em embalagem especial com peças separadas e dobradas",
    },
  ],
  sizes: PRODUCT_SIZES,
  variations: [
    {
      id: "cores-sortidas",
      name: "Cores Lisas Sortidas",
      volume: "Sortimento de Fábrica",
    },
  ],
  kits: [
    {
      id: "kit-5",
      name: "Kit 5 Cuecas Boxer (Básico)",
      tagline: "Ideal para o dia a dia e testar o ajuste anatômico no corpo",
      price: 99.90,
      originalPrice: 149.90,
      installments: "3x de R$ 33,30 sem juros",
      savingsText: "Economize R$ 50,00",
      badge: "33% OFF",
      quantity: 5,
      pricePerUnit: "R$ 19,98 cada",
      popular: false,
      supplierCost: 45.00,
    },
    {
      id: "kit-10",
      name: "Kit 10 Cuecas Boxer (Oferta Campeã)",
      tagline: "O mais vendido: Apenas R$ 15,99 por peça + Frete Grátis",
      price: 159.90,
      originalPrice: 249.90,
      installments: "3x de R$ 53,30 sem juros",
      savingsText: "Economize R$ 90,00",
      badge: "MAIS VENDIDO 🔥 • MAIOR ECONOMIA",
      quantity: 10,
      pricePerUnit: "R$ 15,99 cada",
      popular: true,
      supplierCost: 69.99,
    },
  ],
  techFeatures: [
    {
      iconName: "Wind",
      title: "Microfibra Dry Respirável",
      subtitle: "Evaporação ultra-rápida",
      description: "Trama com micro-poros térmicos que dispersam o suor e a umidade, mantendo a região íntima seca e arejada durante todo o dia.",
      tag: "ANTI-SUOR",
    },
    {
      iconName: "Shield",
      title: "Modelagem Anti-Assadura",
      subtitle: "Não sobe nas pernas",
      description: "Corte boxer anatômico com comprimento alongado na medida certa. Fim das dobras incômodas e assaduras por fricção entre as coxas.",
      tag: "ERGONÔMICA",
    },
    {
      iconName: "Layers",
      title: "Cós Elástico High-Density 40mm",
      subtitle: "Não dobra e não marca",
      description: "Elástico de alta densidade anatômico que se fixa confortavelmente na cintura sem apertar, sem dobrar ao sentar e sem perder a pressão.",
      tag: "ALTA DURABILIDADE",
    },
    {
      iconName: "Sparkles",
      title: "Forro 100% Algodão Hipoalergênico",
      subtitle: "Proteção biológica e anti-odor",
      description: "Área de contato íntimo com forro duplo de algodão natural de toque macio, prevenindo proliferação de bactérias e maus odores.",
      tag: "SAÚDE ÍNTIMA",
    },
  ],
  comparison: [
    {
      criterion: "Preço Médio por Peça",
      commonBriefs: "R$ 35,00 a R$ 50,00 cada",
      microfiberKit: "R$ 15,99 no Kit 10",
      highlight: true,
    },
    {
      criterion: "Comportamento ao Caminhar",
      commonBriefs: "Enrola e sobe na virilha",
      microfiberKit: "Permanece firme e alinhada",
      highlight: true,
    },
    {
      criterion: "Respirabilidade & Suor",
      commonBriefs: "Algodão encharca e fica pesado",
      microfiberKit: "Tecido Dry de rápida evaporação",
    },
    {
      criterion: "Durabilidade na Máquina",
      commonBriefs: "Laceia e cria bolinhas rápido",
      microfiberKit: "Costuras flatlock reforçadas",
    },
    {
      criterion: "Cores e Estilo",
      commonBriefs: "Estampas que desbotam fácil",
      microfiberKit: "Cores lisas sóbrias e modernas",
    },
  ],
  reviews: [
    {
      id: "rev-1",
      handle: "@rodrigo.crossfit",
      author: "Rodrigo Silveira",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      likes: "1.4k",
      timeAgo: "há 1 dia",
      badgeText: "Comprador Verificado",
      verifiedBuyer: true,
      rating: 5,
      comment:
        "Treino crossfit pesado 6x na semana. Cueca comum sempre rasgava na virilha ou enrolava na coxa durante o agachamento. Esse kit me surpreendeu de verdade: não sobe, não dá assadura e seca rápido. Já comprei o kit de 20.",
    },
    {
      id: "rev-2",
      handle: "@marcelo.eng",
      author: "Marcelo Diniz",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
      likes: "920",
      timeAgo: "há 3 dias",
      badgeText: "Comprador Verificado",
      verifiedBuyer: true,
      rating: 5,
      comment:
        "Trabalho 10 horas por dia sentado no escritório. O elástico das cuecas normais me deixava marcado e incomodava na cintura. O cós dessa cueca é perfeito, macio e não dobra. O custo-benefício de R$ 15 por peça é imbatível.",
    },
    {
      id: "rev-3",
      handle: "@felipe_running",
      author: "Felipe Nogueira",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
      likes: "2.1k",
      timeAgo: "há 5 dias",
      badgeText: "Comprador Verificado",
      verifiedBuyer: true,
      rating: 5,
      comment:
        "Chegou em 4 dias em Belo Horizonte. Todas as cores são bonitas e lisas, nada brega. Uso tamanho G (peso 82kg, 1,80m) e vestiu com caimento sob medida. Melhor compra que fiz pro meu dia a dia.",
    },
  ],
  faq: [
    {
      question: "Como escolher o tamanho correto para o meu corpo?",
      answer:
        "Nossa grade segue o padrão nacional ABNT: P veste manequim 36 (cintura 72 a 76cm); M veste 38 (cintura 78 a 82cm); G veste 40/42 (cintura 84 a 90cm); GG veste 44/46 (cintura 92 a 100cm). Se você estiver entre dois tamanhos ou preferir caimento mais folgado, recomendamos escolher o tamanho maior.",
    },
    {
      question: "A cueca enrola ou sobe nas pernas durante o dia?",
      answer:
        "Não. O modelo foi projetado com corte boxer de extensão média e acabamento elástico suave nas pernas, que mantém a barra no lugar sem apertar e sem subir enquanto você anda, corre ou treina.",
    },
    {
      question: "Quais são as cores que vêm no kit?",
      answer:
        "O kit é composto exclusivamente por cores lisas clássicas masculinas: Preto, Grafite, Azul Marinho, Cinza e Bordô. Todas sem estampas exageradas, garantindo um visual limpo e discreto.",
    },
    {
      question: "O tecido desbota ou perde a elasticidade ao lavar?",
      answer:
        "Nossa microfibra de alta densidade conta com elastano tecnológico e tingimento de alta fixação. Pode lavar normalmente em máquina que as peças não desbotam, não perdem a pressão do elástico e não formam bolinhas.",
    },
    {
      question: "Qual é o prazo de entrega e formas de envio?",
      answer:
        "O envio é feito com Frete Grátis e seguro total para todo o território nacional. O prazo médio varia entre 3 a 7 dias úteis. Assim que o pedido é postado, você recebe o código de rastreamento no seu WhatsApp e no seu e-mail.",
    },
    {
      question: "Posso trocar se o tamanho não ficar bom?",
      answer:
        "Sim! Oferecemos nossa Garantia Total de 30 Dias. Se ao receber o produto você experimentar a primeira peça e precisar de outro tamanho, realizamos a troca do kit sem burocracia.",
    },
  ],
  guarantee: {
    days: 30,
    title: "Garantia Blindada de Satisfação de 30 Dias",
    description:
      "Receba o kit na sua casa e teste o conforto da primeira peça. Se você não achar que são as cuecas mais confortáveis, respiráveis e com melhor ajuste que você já vestiu, devolvemos 100% do seu dinheiro. Sem letras miúdas.",
  },
};
