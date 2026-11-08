import {
  Camera,
  Focus,
  Gauge,
  History,
  ScanSearch,
  Smartphone,
  Sprout,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { routes } from "@/lib/routes";
import type { NavLink } from "@/types/navigation";

// Textos e listas da landing page. Para mudar conteúdo, edite este arquivo
// em vez dos componentes.

export const navLinks: NavLink[] = [
  { name: "Início", href: routes.home },
  { name: "Como funciona", href: "/#como-funciona" },
  { name: "Funcionalidades", href: "/#funcionalidades" },
  { name: "Benefícios", href: "/#beneficios" },
  { name: "FAQ", href: "/#faq" },
];

export const hero = {
  eyebrow: "Inteligência artificial no campo",
  title: "Mais tecnologia para cuidar da sua",
  titleHighlight: "plantação.",
  description:
    "Envie uma imagem da folha, consulte a análise e acompanhe informações que ajudam você a cuidar melhor da sua lavoura.",
  highlights: [
    "Análise por imagem",
    "Histórico organizado",
    "Interface simples e acessível",
  ],
  image: {
    src: "https://images.unsplash.com/photo-1769613637793-1d497f0fedf0?auto=format&fit=crop&w=1100&q=80",
    alt: "Fotografia de uma folha com manchas escuras",
  },
};

// Regiões de interesse desenhadas sobre a foto, em % do tamanho da imagem.
export type RegionOfInterest = {
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  delayMs: number;
};

export const regionsOfInterest: RegionOfInterest[] = [
  { label: "ROI 01", left: 54, top: 28, width: 24, height: 20, delayMs: 500 },
  { label: "ROI 02", left: 12, top: 52, width: 20, height: 17, delayMs: 700 },
];

export const demoResult = {
  label: "Classificação de exemplo",
  diagnosis: "Mancha foliar (fictícia)",
  confidence: 82,
};

export type IconItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type Step = IconItem & {
  number: string;
};

export const steps: Step[] = [
  {
    number: "01",
    title: "Fotografe",
    description: "Envie uma imagem da folha.",
    icon: Camera,
  },
  {
    number: "02",
    title: "Analise",
    description:
      "A imagem é processada pelo modelo de inteligência artificial integrado.",
    icon: ScanSearch,
  },
  {
    number: "03",
    title: "Acompanhe",
    description: "Consulte o resultado e mantenha suas análises organizadas.",
    icon: History,
  },
];

export const features = {
  eyebrow: "Funcionalidades",
  title: "Tudo o que você precisa para analisar sua lavoura.",
  description:
    "Ferramentas simples para transformar a foto de uma folha em informação útil.",
  items: [
    {
      title: "Análise por imagem",
      description:
        "Envie a foto da folha pelo celular ou computador e receba a classificação feita pelo modelo.",
      icon: ScanSearch,
    },
    {
      title: "Regiões destacadas",
      description:
        "Veja na própria imagem as áreas da folha que chamaram a atenção do modelo.",
      icon: Focus,
    },
    {
      title: "Nível de confiança",
      description:
        "Cada resultado mostra o quanto o modelo está seguro da classificação.",
      icon: Gauge,
    },
    {
      title: "Histórico de análises",
      description:
        "Suas análises ficam salvas e organizadas para consultar quando precisar.",
      icon: History,
    },
  ] satisfies IconItem[],
};

export const benefits = {
  eyebrow: "Benefícios",
  title: "Mais informação para decidir com segurança.",
  description:
    "O DiAgro foi pensado para a rotina de pequenos e médios produtores: rápido de usar e fácil de entender.",
  items: [
    {
      title: "Respostas em instantes",
      description:
        "Tenha uma primeira avaliação da folha sem precisar esperar.",
      icon: Zap,
    },
    {
      title: "Acompanhamento ao longo do tempo",
      description:
        "Compare análises e acompanhe a evolução da sua plantação.",
      icon: TrendingUp,
    },
    {
      title: "Feito para usar no campo",
      description:
        "Interface simples e acessível, que funciona direto do celular.",
      icon: Smartphone,
    },
    {
      title: "Apoio a quem produz",
      description:
        "Tecnologia acessível para ajudar a cuidar melhor da lavoura.",
      icon: Sprout,
    },
  ] satisfies IconItem[],
};

export type Faq = {
  question: string;
  answer: string;
};

export const faq = {
  eyebrow: "FAQ",
  title: "Perguntas frequentes.",
  items: [
    {
      question: "O que é o DiAgro?",
      answer:
        "É uma plataforma que usa inteligência artificial para analisar fotos de folhas e indicar possíveis doenças nas plantas.",
    },
    {
      question: "Como tirar uma boa foto da folha?",
      answer:
        "Fotografe a folha inteira, com boa iluminação natural, sem sombras fortes e com o foco na área afetada.",
    },
    {
      question: "O resultado substitui um agrônomo?",
      answer:
        "Não. A análise é um apoio para a tomada de decisão. Para confirmar um diagnóstico e definir o tratamento, consulte sempre um profissional.",
    },
    {
      question: "Minhas análises ficam salvas?",
      answer:
        "Sim. Cada análise fica no seu histórico, com a imagem e o resultado, para você consultar quando quiser.",
    },
    {
      question: "O DiAgro já está disponível?",
      answer:
        "Esta versão é um protótipo: a análise é simulada e os resultados são identificados como demonstração.",
    },
  ] satisfies Faq[],
};

export const footer = {
  description:
    "Análise de folhas com inteligência artificial para apoiar pequenos e médios produtores.",
  links: [
    { name: "Política de privacidade", href: routes.privacy },
    { name: "Termos de uso", href: routes.terms },
  ] satisfies NavLink[],
  copyright: `© ${new Date().getFullYear()} DiAgro`,
};
