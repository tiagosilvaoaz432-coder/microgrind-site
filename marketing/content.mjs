/**
 * Safe SEO copy (Bea, 5 Nov 2026, Tiago ~21:55 Europe/Lisbon).
 * Any course, any level: básico, secundário, superior.
 * Duration is chosen when a study session starts, never on the map.
 * Niche pages /direito and /en/law are retired (redirect, do not link).
 * Lines marked [após OK Duarte] are not included: no exact-excerpt,
 * validation, "não inventa", or concept-mastery claims.
 * Comparison pages are parsed from vs-copy.md. Do not paraphrase them.
 */
import { comparisonLinks, comparisonPages, comparisonPairs } from './comparisons.mjs';

export const ORIGIN = 'https://microgrind.app';
export const WEB_APP = 'https://microgrind.app/app/';
export const CONTACT_EMAIL = 'ola@microgrind.app';

export const PAIRS = [
  { pt: '/', en: '/en/' },
  { pt: '/privacidade/', en: '/en/privacy/' },
  { pt: '/mapa-da-materia/', en: '/en/subject-map/' },
  { pt: '/estudar-sebenta/', en: '/en/study-from-pdf/' },
  { pt: '/sobre/', en: '/en/about/' },
  ...comparisonPairs,
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
  },
  en: {
    q: 'Does it work on the web and on my phone?',
    a: 'Yes. Open it on the web, or install it on your phone.',
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
      'A MicroGrind é uma app de estudo que monta o mapa da matéria a partir da tua sebenta e organiza sessões de 5 a 25 minutos. Para qualquer curso. Sessões curtas. Progresso real.',
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
      'MicroGrind\'s Subject Map structures your course into topics and concepts from your own document. Not a mind map. Study it in 5–25 minute sessions. For any course.',
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
      'MicroGrind is a study app that builds a Subject Map from your notes, textbook or slides and turns it into 5–25 minute sessions. For any course. Short sessions. Real progress.',
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
].concat(comparisonPages);

const CHROME_COURSES = {
  pt: 'Do ensino básico ao superior, em qualquer disciplina.',
  en: 'From primary to higher education, in any subject.',
};

export const HOME = {
  pt: {
    description:
      'A MicroGrind monta o mapa da matéria a partir da tua sebenta, manual ou slides e organiza sessões de 5 a 25 minutos. Para qualquer curso. Sessões curtas. Progresso real.',
    lede: DEFINITION.pt,
    footerBlur: 'App de estudo para qualquer curso.',
    mind: MIND_MAP_FAQ.pt,
    files: FILES_FAQ.pt,
    useQuestion: 'Posso usar?',
    removeQuestions: ['A IA não inventa coisas?', 'E se a minha sebenta tiver erros?'],
    privacyNeedle: '<p><a class="footer-privacy" href="/privacidade/">Política de privacidade</a></p>',
    links: [
      { href: '/mapa-da-materia/', label: 'Mapa da matéria' },
      { href: '/estudar-sebenta/', label: 'Estudar a sebenta' },
      { href: '/sobre/', label: 'Sobre' },
      ...comparisonLinks.pt,
    ],
    replacements: [
      [
        'A MicroGrind organiza a matéria de qualquer curso num mapa e em sessões de 5 a 25 minutos. Direito, Gestão, Engenharia e os outros.',
        'A MicroGrind monta o mapa da matéria a partir da tua sebenta, manual ou slides e organiza sessões de 5 a 25 minutos. Para qualquer curso. Sessões curtas. Progresso real.',
      ],
      [
        'Carregas a matéria. Vês o mapa. Estudas em sessões curtas. Para qualquer curso.',
        'A MicroGrind monta o mapa da matéria a partir da tua sebenta, manual ou slides e organiza sessões de 5 a 25 minutos. Para qualquer curso. Sessões curtas. Progresso real.',
      ],
      [
        'Carrega a sebenta, os slides ou os apontamentos. A MicroGrind organiza a matéria em tópicos e conceitos, a partir do teu documento, e depois estudas em sessões de 5 a 25 minutos.',
        DEFINITION.pt,
      ],
      [
        'já dominas, e não',
        'já trabalhaste — e não',
      ],
      [
        '<p class="kicker">O princípio</p><h2>Estar correto não chega.</h2><p>Tem de estar suportado pelo teu documento. A MicroGrind monta o mapa da matéria a partir da tua sebenta, do manual ou dos apontamentos.</p>',
        '<p class="kicker">O princípio</p><h2>Feito a partir do teu material</h2><p>A MicroGrind monta o mapa da matéria a partir dos teus apontamentos, do manual, da sebenta ou dos slides. Estudas a partir do material que já usas na tua disciplina.</p>',
      ],
      [
        'Para qualquer curso. Direito, Gestão, Engenharia e os outros.',
        'Para qualquer curso ou disciplina, do ensino básico ao superior.',
      ],
      [
        'Para quem estuda na universidade, em qualquer curso. O mapa parte dos teus apontamentos, da sebenta ou dos slides, seja Direito, Gestão, Engenharia ou outro.',
        'Para quem estuda no ensino básico, secundário ou superior, em qualquer curso ou disciplina. O mapa da matéria parte dos teus apontamentos, do manual, da sebenta ou dos slides.',
      ],
      [
        'A partir do teu material, monta o <strong class="ink-mark">mapa da matéria</strong>: a estrutura da cadeira, tópico a tópico. Vês por onde começar e como a matéria se liga.',
        'A partir do teu material, a MicroGrind monta o <strong class="ink-mark">mapa da matéria</strong>: a estrutura da disciplina, tópico a tópico. Vês como a matéria está organizada e como os temas se ligam.',
      ],
      [
        'PDF, sebenta, apontamentos da cadeira. O que já usas para estudar.',
        'Apontamentos, manual, sebenta ou slides. O que já usas para estudar.',
      ],
      [
        'A app organiza a tua matéria em capítulos, tópicos e conceitos. Deixas de estudar à sorte e passas a ver o fio condutor da cadeira.',
        'A app organiza a tua matéria em capítulos, tópicos e conceitos para veres como os temas se ligam.',
      ],
      [
        'Escolhes 5, 10, 15 ou 25 minutos. Cada sessão parte do mapa, por isso não perdes tempo a decidir por onde começar.',
        'Ao iniciares uma sessão, escolhes a duração: entre 5 e 25 minutos. Estudas a matéria organizada no mapa, numa sessão curta que cabe no teu dia.',
      ],
      [
        '<summary>Tenho pouco tempo e muitas cadeiras. Serve para mim?</summary><div class="faq-a"><div><p>As sessões duram entre 5 e 25 minutos e cabem entre aulas. Cada sessão parte do mapa, por isso não perdes tempo a decidir por onde começar.</p>',
        '<summary>Tenho pouco tempo e muitas disciplinas. Serve para mim?</summary><div class="faq-a"><div><p>As sessões duram entre 5 e 25 minutos e cabem entre aulas. Ao iniciares uma sessão, escolhes a duração para estudar a matéria organizada no mapa.</p>',
      ],
      [
        'aria-label="Exemplo de cadeira"',
        'aria-label="Exemplo de disciplina"',
      ],
      [
        'aria-label="Ilustração de uma cadeira que abre em tópicos e, depois, em conceitos."',
        'aria-label="Exemplo de mapa da matéria: Direito Civil abre em tópicos e conceitos."',
      ],
      [
        '<div class="tree-card" data-tree-card>',
        '<div class="tree-card" data-tree-card><p class="session-caption tree-example">Exemplo</p>',
      ],
      [
        '<p>Direito, Gestão, Engenharia e outros.</p>',
        `<p>${CHROME_COURSES.pt}</p>`,
      ],
    ],
  },
  en: {
    description:
      'MicroGrind builds a Subject Map from your notes, textbook or slides, then 5–25 minute study sessions. For any course. Short sessions. Real progress.',
    lede: DEFINITION.en,
    footerBlur: 'Built for any course.',
    mind: MIND_MAP_FAQ.en,
    files: FILES_FAQ.en,
    useQuestion: 'Can I use it?',
    removeQuestions: ['Does the AI invent things?', 'What if my notes have mistakes?'],
    privacyNeedle: '<p><a class="footer-privacy" href="/en/privacy/">Privacy policy</a></p>',
    links: [
      { href: '/en/subject-map/', label: 'Subject Map' },
      { href: '/en/study-from-pdf/', label: 'Study from PDFs' },
      { href: '/en/about/', label: 'About' },
      ...comparisonLinks.en,
    ],
    replacements: [
      [
        'MicroGrind turns the material for any degree into a subject map and 5–25 minute sessions. Law, Management, Engineering and the rest.',
        'MicroGrind builds a Subject Map from your notes, textbook or slides, then 5–25 minute study sessions. For any course. Short sessions. Real progress.',
      ],
      [
        'Upload your material. See the map. Study in short sessions. For any degree.',
        'MicroGrind builds a Subject Map from your notes, textbook or slides, then 5–25 minute study sessions. For any course. Short sessions. Real progress.',
      ],
      [
        'Upload your notes, slides or textbook. MicroGrind organises the material into topics and concepts, built from your own document, then you study in 5 to 25 minute sessions.',
        DEFINITION.en,
      ],
      ['A study app for any degree.', 'Built for any course.'],
      [
        'From your own material, it builds a <strong class="ink-mark">subject map</strong>. You see where to start and how the material fits together.</p>',
        'From your own material, it builds a <strong class="ink-mark">subject map</strong>. You see where to start and how the material fits together.</p><p class="does-emph">The map is the means. The sessions are the habit. What counts by the end of the week is what you have already worked through — not how many cards you flipped.</p>',
      ],
      [
        '<p class="kicker">The principle</p><h2>Being correct is not enough.</h2><p>It has to be supported by your own document. MicroGrind builds the subject map from your course pack, textbook or notes.</p>',
        '<p class="kicker">The principle</p><h2>Built from your own material</h2><p>MicroGrind builds your Subject Map from your notes, textbook or slides. Study from the material you already use for your subject.</p>',
      ],
      [
        'For any degree. Law, Management, Engineering and the rest.',
        'For any course or subject, from primary school to higher education.',
      ],
      [
        '<h3>For university students</h3><p>For university students on any degree. The map is built from your own notes, course pack or slides, whether that is Law, Management, Engineering or another subject.</p>',
        '<h3>Who it is for</h3><p>For students at any level — primary, secondary or higher education — in any course or subject. Your Subject Map is built from your own notes, textbook or slides.</p>',
      ],
      [
        '<h3>Upload</h3><p>Your course pack, textbook or notes (PDF).</p>',
        '<h3>Upload your material</h3><p>Notes, textbook or slides. What you already use to study.</p>',
      ],
      [
        '<h3>See the map</h3><p>Chapters, topics, concepts.</p>',
        '<h3>See your Subject Map</h3><p>The app organises your material into chapters, topics and concepts so you can see how they connect.</p>',
      ],
      [
        '<h3>Study short</h3><p>You choose 5, 10, 15 or 25 minutes. Each session starts from the map, so you don\u2019t waste time deciding where to begin.</p>',
        '<h3>Study in short sessions</h3><p>When you start a session, you choose its duration: between 5 and 25 minutes. Study the material organised in your Subject Map, in a short session that fits your day.</p>',
      ],
      [
        '<summary>I have little time and a lot of courses. Is this for me?</summary><div class="faq-a"><div><p>Sessions last between 5 and 25 minutes and fit between classes. Each session starts from the map, so you don\u2019t spend time deciding where to begin.</p>',
        '<summary>I have little time and several subjects to study. Is this for me?</summary><div class="faq-a"><div><p>Sessions last between 5 and 25 minutes and fit between classes. When you start a session, you choose its duration to study the material organised in your Subject Map.</p>',
      ],
      [
        '<div class="tree-card" data-tree-card>',
        '<div class="tree-card" data-tree-card><p class="session-caption tree-example">Example</p>',
      ],
      [
        '<p>Law, Management, Engineering and others.</p>',
        `<p>${CHROME_COURSES.en}</p>`,
      ],
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
