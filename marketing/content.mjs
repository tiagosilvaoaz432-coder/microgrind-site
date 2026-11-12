/**
 * Safe SEO copy (Bea, 5 Nov 2026, Tiago ~21:55 Europe/Lisbon).
 * Any course, any level: básico, secundário, superior.
 * Duration is chosen when a study session starts, never on the map.
 * Niche pages /direito and /en/law are retired (redirect, do not link).
 * Lines marked [após OK Duarte] are not included: no exact-excerpt,
 * validation, "não inventa", or concept-mastery claims.
 * The comparison page (one table with every app) lives in compare.mjs.
 */
import { compareLinks, comparePages, comparePair } from './compare.mjs';
import { pricingPages, pricingPair } from './plans.mjs';

export const ORIGIN = 'https://microgrind.app';
export const WEB_APP = 'https://microgrind.app/app/';
/** Sign-up screen of the web app (app/(auth)/register.tsx, served under /app/). */
export const REGISTER_URL = 'https://microgrind.app/app/register';
export const CONTACT_EMAIL = 'ola@microgrind.app';

export const PAIRS = [
  { pt: '/', en: '/en/' },
  { pt: '/privacidade/', en: '/en/privacy/' },
  { pt: '/mapa-da-materia/', en: '/en/subject-map/' },
  { pt: '/estudar-sebenta/', en: '/en/study-from-pdf/' },
  { pt: '/sobre/', en: '/en/about/' },
  { pt: '/instalar/', en: '/en/install/' },
  pricingPair,
  comparePair,
];

export const DEFINITION = {
  pt: 'A MicroGrind é uma app de estudo que monta o mapa da matéria — tópicos, conceitos, definições e relações — a partir da tua sebenta, manual ou slides, e depois põe-te a estudar em sessões de 5 a 25 minutos. Serve para qualquer curso. Sessões curtas. Progresso real.',
  en: 'MicroGrind is a study app that builds a Subject Map — topics, concepts, definitions and how they connect — from your own notes, textbook or slides, then has you study it in 5–25 minute sessions. Built for any course. Short sessions. Real progress.',
};

export const MIND_MAP_FAQ = {
  pt: {
    q: 'É um mapa mental?',
    a: 'Não. Um mapa mental é um diagrama visual livre. O mapa da matéria organiza a tua disciplina em tópicos, conceitos, definições e relações, a partir do teu material. A MicroGrind usa essa estrutura para preparar sessões curtas de estudo.',
  },
  en: {
    q: 'Is it a mind map?',
    a: 'No. A mind map is a free-form visual diagram. A Subject Map organises your subject into topics, concepts, definitions and how they connect, using your own material. MicroGrind uses that structure to prepare short study sessions.',
  },
};

export const FILES_FAQ = {
  pt: {
    q: 'Que ficheiros posso carregar?',
    a: 'PDF, Word, texto e fotografias dos teus apontamentos. O mapa da matéria constrói-se a partir do ficheiro que carregas.',
  },
  en: {
    q: 'What can I upload?',
    a: 'PDFs, Word files, text and photos of your notes. The Subject Map is built from the file you upload.',
  },
};

export const WEB_FAQ = {
  pt: {
    q: 'Funciona na web e no telemóvel?',
    a: 'Sim. Abre na web ou instala a app no telemóvel.',
    parts: [
      { text: 'Sim. Abre na web ou ' },
      { text: 'instala a app no telemóvel', href: '/instalar/' },
      { text: '.' },
    ],
  },
  en: {
    q: 'Does it work on the web and on my phone?',
    a: 'Yes. Open it on the web, or install it on your phone.',
    parts: [
      { text: 'Yes. Open it on the web, or ' },
      { text: 'install it on your phone', href: '/en/install/' },
      { text: '.' },
    ],
  },
};

const PT_TABLE = {
  caption: 'Diferença entre um mapa mental e o mapa da matéria',
  headers: ['Aspeto', 'Mapa mental', 'Mapa da matéria (MicroGrind)'],
  rows: [
    ['Origem', 'Ideias livres', 'O teu documento (sebenta, manual, slides)'],
    ['Forma', 'Diagrama visual', 'Estrutura: tópicos → conceitos → definições → relações'],
    ['Para quê', 'Brainstorm, resumo visual', 'Gerar e organizar sessões de estudo de 5–25 min'],
  ],
};

const EN_TABLE = {
  caption: 'Difference between a mind map and a Subject Map',
  headers: ['Aspect', 'Mind map', 'Subject Map (MicroGrind)'],
  rows: [
    ['Source', 'Free ideas', 'Your document (notes, textbook, slides)'],
    ['Shape', 'Visual diagram', 'Structure: topics → concepts → definitions → relations'],
    ['Purpose', 'Brainstorming, visual summary', 'Building and ordering 5–25 min study sessions'],
  ],
};

function faq(locale, title) {
  return {
    type: 'faq',
    title,
    items: [MIND_MAP_FAQ[locale], FILES_FAQ[locale], WEB_FAQ[locale]],
  };
}

const INSTALL_FAQ = {
  pt: [
    {
      q: 'Tenho de ir à App Store ou à Play Store?',
      a: 'Não. A MicroGrind é uma app web: instalas a partir do browser, em menos de um minuto, e entras com a mesma conta.',
    },
    {
      q: 'Não me aparece «Adicionar ao ecrã principal». E agora?',
      a: 'No iPhone, confirma que estás no Safari e não dentro de outra app, como o Instagram, o TikTok ou o WhatsApp. Se o botão Partilhar não estiver visível, toca primeiro em ⋯. No Android, usa o Google Chrome.',
    },
    {
      q: 'A app instalada é diferente da versão web?',
      a: 'É a mesma MicroGrind, com a mesma conta e o mesmo progresso. Abre pelo ícone, em ecrã inteiro, sem a barra do browser.',
    },
    {
      q: 'Como tiro a app do telemóvel?',
      a: 'Como qualquer outra app: mantém o ícone premido e escolhe Remover app (iPhone) ou Desinstalar (Android).',
    },
  ],
  en: [
    {
      q: 'Do I need the App Store or the Play Store?',
      a: 'No. MicroGrind is a web app: you install it from your browser in under a minute, and sign in with the same account.',
    },
    {
      q: 'I cannot see “Add to Home Screen”. What now?',
      a: 'On iPhone, make sure you are in Safari and not inside another app such as Instagram, TikTok or WhatsApp. If the Share button is hidden, tap ⋯ first. On Android, use Google Chrome.',
    },
    {
      q: 'Is the installed app different from the web version?',
      a: 'It is the same MicroGrind, with the same account and the same progress. It opens from its icon, full screen, without the browser bar.',
    },
    {
      q: 'How do I remove the app from my phone?',
      a: 'Like any other app: press and hold the icon, then choose Remove App (iPhone) or Uninstall (Android).',
    },
  ],
};

const installPages = [
  {
    id: 'instalar',
    locale: 'pt',
    path: '/instalar/',
    ptPath: '/instalar/',
    enPath: '/en/install/',
    kind: 'install',
    wide: true,
    title: 'Instalar a MicroGrind no iPhone e no Android | MicroGrind',
    description:
      'Como instalar a MicroGrind no telemóvel: no iPhone pelo Safari, no Android pelo Chrome, e no computador. Sem App Store nem Play Store, em menos de um minuto.',
    kicker: 'Instalar a app',
    h1: 'Instala a MicroGrind no telemóvel',
    lede: 'Sem App Store nem Play Store. Adicionas a app ao ecrã principal a partir do browser, em menos de um minuto, e abres a MicroGrind como qualquer outra app.',
    blocks: [
      { type: 'install' },
      { type: 'faq', title: 'Perguntas frequentes', items: INSTALL_FAQ.pt },
    ],
  },
  {
    id: 'install',
    locale: 'en',
    path: '/en/install/',
    ptPath: '/instalar/',
    enPath: '/en/install/',
    kind: 'install',
    wide: true,
    title: 'Install MicroGrind on iPhone and Android | MicroGrind',
    description:
      'How to install MicroGrind on your phone: from Safari on iPhone, from Chrome on Android, and on your computer. No App Store or Play Store, in under a minute.',
    kicker: 'Install the app',
    h1: 'Install MicroGrind on your phone',
    lede: 'No App Store or Play Store. Add the app to your Home Screen from your browser in under a minute, then open MicroGrind like any other app.',
    blocks: [
      { type: 'install' },
      { type: 'faq', title: 'Frequently asked questions', items: INSTALL_FAQ.en },
    ],
  },
];

export const pages = [
  {
    id: 'mapa',
    locale: 'pt',
    path: '/mapa-da-materia/',
    ptPath: '/mapa-da-materia/',
    enPath: '/en/subject-map/',
    title: 'Mapa da matéria — estrutura da disciplina | MicroGrind',
    description:
      'O mapa da matéria da MicroGrind organiza a tua sebenta em tópicos e conceitos. Não é um mapa mental. Estuda em sessões de 5–25 min. Para qualquer curso.',
    kicker: 'Mapa da matéria',
    h1: 'O mapa da matéria',
    lede: DEFINITION.pt,
    blocks: [
      { type: 'h2', text: 'O que é' },
      {
        type: 'p',
        text: 'O mapa da matéria é a estrutura da tua disciplina: tópicos, conceitos, definições e relações, organizada a partir dos teus apontamentos, do manual, da sebenta ou dos slides. O mapa organiza a matéria. Quando inicias uma sessão de estudo, escolhes a duração: entre 5 e 25 minutos.',
      },
      {
        type: 'p',
        text: 'Por exemplo, numa unidade sobre energia, a matéria pode organizar-se em formas de energia, transformações e conservação da energia. A estrutura parte do material que carregas, seja qual for a disciplina ou o nível de ensino.',
      },
      {
        type: 'negation',
        blocks: [
          { type: 'h2', text: 'O mapa da matéria não é um mapa mental' },
          {
            type: 'p',
            text: 'Um mapa mental é um diagrama livre, feito à mão ou por IA, para fazer brainstorming e ligar ideias de forma visual. O mapa da matéria da MicroGrind é uma estrutura da disciplina — tópicos, conceitos, definições e relações — construída a partir do teu documento. Não serve para decorar desenhos: serve para a app saber o que há para aprender e organizar as tuas sessões.',
          },
          { type: 'table', ...PT_TABLE },
        ],
      },
      { type: 'h2', text: 'Como se estuda a partir dele' },
      {
        type: 'list',
        items: [
          'Carregas os apontamentos, o manual, a sebenta ou os slides.',
          'A app monta o mapa da matéria: tópicos, conceitos, definições e relações.',
          'Ao iniciares uma sessão de estudo, escolhes a duração, entre 5 e 25 minutos, e estudas a matéria organizada no mapa.',
        ],
      },
      faq('pt', 'Perguntas frequentes'),
      { type: 'cta', href: WEB_APP, label: 'Começar em microgrind.app' },
    ],
  },
  {
    id: 'sebenta',
    locale: 'pt',
    path: '/estudar-sebenta/',
    ptPath: '/estudar-sebenta/',
    enPath: '/en/study-from-pdf/',
    title: 'Estudar a partir da sebenta e do PDF | MicroGrind',
    description:
      'Carrega a sebenta, o PDF ou os slides. A MicroGrind monta primeiro o mapa da matéria e só depois sessões de 5 a 25 minutos. Não é só PDF→flashcards.',
    kicker: 'Sebenta e PDF',
    h1: 'Estudar a partir do PDF — primeiro o mapa, depois o estudo.',
    lede:
      'A MicroGrind não transforma apenas um PDF em cartões. Primeiro monta o mapa da matéria do documento e, a partir dele, cria sessões de estudo de 5 a 25 minutos.',
    blocks: [
      { type: 'h2', text: 'Porque saltar do PDF para as perguntas corre mal' },
      {
        type: 'p',
        text: 'Quando se passa direto do ficheiro para as perguntas, é fácil deixar partes de fora, repetir conceitos, misturar tópicos e dar demasiado peso a pormenores.',
      },
      { type: 'h2', text: 'Como funciona' },
      {
        type: 'list',
        items: [
          'Carregas o ficheiro: PDF, Word, texto ou uma fotografia dos apontamentos.',
          'Vês o mapa da matéria.',
          'Ao iniciares uma sessão, escolhes a duração, entre 5 e 25 minutos.',
          'Estudas a matéria organizada no mapa.',
        ],
      },
      { type: 'h2', text: 'A partir do teu material' },
      {
        type: 'p',
        text: 'O mapa da matéria constrói-se a partir da sebenta, do manual ou dos slides que carregas — em qualquer curso.',
      },
      faq('pt', 'Perguntas frequentes'),
      { type: 'cta', href: WEB_APP, label: 'Começar em microgrind.app' },
    ],
  },
  {
    id: 'sobre',
    locale: 'pt',
    path: '/sobre/',
    ptPath: '/sobre/',
    enPath: '/en/about/',
    title: 'Sobre a MicroGrind | MicroGrind',
    description:
      'A MicroGrind é uma app de estudo que monta o mapa da matéria a partir da tua sebenta e organiza sessões de 5 a 25 minutos. Para qualquer curso.',
    kicker: 'Sobre',
    h1: 'Sobre a MicroGrind',
    lede: DEFINITION.pt,
    blocks: [
      { type: 'h2', text: 'O que é' },
      {
        type: 'p',
        text: 'A MicroGrind monta o mapa da matéria a partir dos materiais que já usas para estudar e organiza o trabalho em sessões curtas. Sessões curtas. Progresso real.',
      },
      { type: 'h2', text: 'Para quem' },
      {
        type: 'p',
        text: 'Para quem estuda no ensino básico, secundário ou superior, em qualquer curso ou disciplina. O mapa da matéria parte dos teus apontamentos, do manual, da sebenta ou dos slides.',
      },
      { type: 'levels' },
      { type: 'h2', text: 'Como funciona' },
      {
        type: 'list',
        items: [
          'Carregas a matéria: PDF, sebenta, manual ou slides.',
          'Vês o mapa da matéria, com tópicos, conceitos, definições e relações.',
          'Ao iniciares uma sessão, escolhes a duração, entre 5 e 25 minutos, e estudas a matéria organizada no mapa.',
        ],
      },
      {
        type: 'p',
        parts: [
          { text: 'Podes abrir a app na web. Contacto: ' },
          { href: `mailto:${CONTACT_EMAIL}`, text: CONTACT_EMAIL },
          { text: '. ' },
          { href: '/privacidade/', text: 'Política de privacidade' },
          { text: '.' },
        ],
      },
      {
        type: 'faq',
        title: 'Perguntas frequentes',
        items: [
          { q: 'O que é a MicroGrind?', a: DEFINITION.pt },
          WEB_FAQ.pt,
        ],
      },
      { type: 'cta', href: WEB_APP, label: 'Começar em microgrind.app' },
    ],
  },
  {
    id: 'subject-map',
    locale: 'en',
    path: '/en/subject-map/',
    ptPath: '/mapa-da-materia/',
    enPath: '/en/subject-map/',
    title: 'Subject Map vs mind map — what\'s the difference? | MicroGrind',
    description:
      'MicroGrind\'s Subject Map turns your own document into topics and concepts. Not a mind map. Study it in 5–25 minute sessions. For any course.',
    kicker: 'Subject Map',
    h1: 'Subject Map vs mind map',
    h1Negation: true,
    lede:
      'A Subject Map is a structured representation of a course — topics, concepts, definitions and relations — built from your document. A mind map is a free-form visual diagram. MicroGrind builds Subject Maps, not mind maps.',
    ledeNegation: true,
    blocks: [
      { type: 'h2', text: 'What is a Subject Map?' },
      {
        type: 'p',
        text: 'A Subject Map is the structure of your subject: topics, concepts, definitions and how they connect, organised from your own notes, textbook or slides. The map organises the material. When you start a study session, you choose its duration: between 5 and 25 minutes.',
      },
      {
        type: 'p',
        text: 'For example, a unit on energy might include forms of energy, energy transformations and conservation of energy. The structure comes from the material you upload, whatever your subject or level of study.',
      },
      {
        type: 'negation',
        blocks: [
          { type: 'h2', text: 'What is a mind map?' },
          {
            type: 'p',
            text: 'A mind map is a free-form visual diagram for brainstorming. MicroGrind\'s Subject Map is a structured representation of your subject — topics, concepts, definitions and relations — built from your document. It isn\'t something to stare at; it\'s how the app knows what there is to learn and plans your sessions.',
          },
          { type: 'h2', text: 'Side by side' },
          { type: 'table', ...EN_TABLE },
        ],
      },
      { type: 'h2', text: 'Why structure beats a diagram for studying' },
      {
        type: 'p',
        text: 'The Subject Map organises your material into topics and concepts for study. When you start a study session, you choose a duration between 5 and 25 minutes.',
      },
      { type: 'h2', text: 'Is it the same as a syllabus map or a course map?' },
      {
        type: 'p',
        text: 'Close: a syllabus lists topics. A Subject Map goes down to concepts, definitions and relations, built from your material.',
      },
      {
        type: 'p',
        parts: [
          { text: 'To study straight from a file, see ' },
          { href: '/en/study-from-pdf/', text: 'study from your PDFs and notes' },
          { text: '.' },
        ],
      },
      faq('en', 'Common questions'),
      { type: 'cta', href: WEB_APP, label: 'Build your Subject Map at microgrind.app' },
    ],
  },
  {
    id: 'pdf',
    locale: 'en',
    path: '/en/study-from-pdf/',
    ptPath: '/estudar-sebenta/',
    enPath: '/en/study-from-pdf/',
    title: 'Study from your PDFs and notes — Subject Map first | MicroGrind',
    description:
      'Upload your PDFs, notes or slides. MicroGrind builds a Subject Map first, then short 5–25 min study sessions. Not just PDF-to-flashcards. For any course.',
    kicker: 'PDFs and notes',
    h1: 'Study from your PDFs — map first, then study.',
    lede:
      'MicroGrind doesn\'t just turn a PDF into flashcards. It first builds a Subject Map of the document, then creates study sessions of 5–25 minutes from that map.',
    blocks: [
      { type: 'h2', text: 'Why jumping from a PDF to questions falls short' },
      {
        type: 'p',
        text: 'Going straight from the file to questions can skip important parts, repeat concepts, mix topics and overweight details.',
      },
      { type: 'h2', text: 'How it works' },
      {
        type: 'list',
        items: [
          'Upload a PDF, a Word file, text or a photo of your notes.',
          'See your Subject Map.',
          'When you start a session, choose a duration between 5 and 25 minutes.',
          'Study the material organised in your Subject Map.',
        ],
      },
      { type: 'h2', text: 'Built from your document' },
      {
        type: 'p',
        text: 'The Subject Map is built from the file you upload — notes, textbook or slides — for any course.',
      },
      faq('en', 'Common questions'),
      { type: 'cta', href: WEB_APP, label: 'Upload your first document at microgrind.app' },
    ],
  },
  {
    id: 'about',
    locale: 'en',
    path: '/en/about/',
    ptPath: '/sobre/',
    enPath: '/en/about/',
    title: 'About MicroGrind | MicroGrind',
    description:
      'MicroGrind is a study app that builds a Subject Map from your notes, textbook or slides and turns it into 5–25 minute sessions. For any course.',
    kicker: 'About',
    h1: 'About MicroGrind',
    lede: DEFINITION.en,
    blocks: [
      { type: 'h2', text: 'What it is' },
      {
        type: 'p',
        text: 'MicroGrind builds a Subject Map from the materials you already study with, then organises the work into short sessions. Short sessions. Real progress.',
      },
      { type: 'h2', text: 'Who it is for' },
      {
        type: 'p',
        text: 'For students at any level — primary, secondary or higher education — in any course or subject. Your Subject Map is built from your own notes, textbook or slides.',
      },
      { type: 'levels' },
      { type: 'h2', text: 'How it works' },
      {
        type: 'list',
        items: [
          'Upload the material: PDF, notes, textbook or slides.',
          'See the Subject Map: topics, concepts, definitions and relations.',
          'When you start a session, choose a duration between 5 and 25 minutes and study the material organised in your Subject Map.',
        ],
      },
      {
        type: 'p',
        parts: [
          { text: 'Open the app on the web. Contact: ' },
          { href: `mailto:${CONTACT_EMAIL}`, text: CONTACT_EMAIL },
          { text: '. ' },
          { href: '/en/privacy/', text: 'Privacy policy' },
          { text: '.' },
        ],
      },
      {
        type: 'faq',
        title: 'Common questions',
        items: [
          { q: 'What is MicroGrind?', a: DEFINITION.en },
          WEB_FAQ.en,
        ],
      },
      { type: 'cta', href: WEB_APP, label: 'Start at microgrind.app' },
    ],
  },
].concat(installPages, pricingPages, comparePages);

const CHROME_COURSES = {
  pt: 'Do ensino básico ao superior, em qualquer disciplina.',
  en: 'From primary to higher education, in any subject.',
};

/** Homepage meta and footer links. The page itself is rendered by home.mjs from home-copy.mjs. */
export const HOME = {
  pt: {
    description:
      'App de estudo: monta o mapa da matéria a partir da tua sebenta, manual ou slides. Sessões de 5 a 25 min, flashcards, quizzes e exames. 4 €/mês.',
    links: [
      { href: '/mapa-da-materia/', label: 'Mapa da matéria' },
      { href: '/estudar-sebenta/', label: 'Estudar a sebenta' },
      { href: '/sobre/', label: 'Sobre' },
      { href: '/planos/', label: 'Planos e preços' },
      { href: '/instalar/', label: 'Instalar a app' },
      { href: '/praticar/', label: 'Praticar grátis' },
      { href: '/estudar/', label: 'Como estudar' },
      ...compareLinks.pt,
    ],
  },
  en: {
    description:
      'Study app: builds a Subject Map from your notes, textbook or slides. 5–25 minute sessions, flashcards, quizzes and mock exams. €4 a month.',
    links: [
      { href: '/en/subject-map/', label: 'Subject Map' },
      { href: '/en/study-from-pdf/', label: 'Study from PDFs' },
      { href: '/en/about/', label: 'About' },
      { href: '/en/pricing/', label: 'Plans and pricing' },
      { href: '/en/install/', label: 'Install the app' },
      ...compareLinks.en,
    ],
  },
};

export const CHROME = {
  pt: {
    skip: 'Saltar para o conteúdo',
    nav: 'Principal',
    lang: 'EN',
    langHreflang: 'en',
    langLang: 'en',
    open: 'Abrir na web',
    slogan: 'Sessões curtas. Progresso real.',
    blurb: 'App de estudo para qualquer curso.',
    courses: CHROME_COURSES.pt,
    contact: 'Contacto',
    privacyHref: '/privacidade/',
    privacy: 'Política de privacidade',
    home: '/',
    links: HOME.pt.links,
  },
  en: {
    skip: 'Skip to content',
    nav: 'Primary',
    lang: 'PT',
    langHreflang: 'pt-PT',
    langLang: 'pt-PT',
    open: 'Open on the web',
    slogan: 'Short sessions. Real progress.',
    blurb: 'Built for any course.',
    courses: CHROME_COURSES.en,
    contact: 'Contact',
    privacyHref: '/en/privacy/',
    privacy: 'Privacy policy',
    home: '/en/',
    links: HOME.en.links,
  },
};
