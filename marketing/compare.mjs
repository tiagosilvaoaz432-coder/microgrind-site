/**
 * The single comparison page: /comparar/ and /en/compare/.
 * Competitor cells come from the verified matrix of 6 Nov 2026 (copy hub, Duarte check).
 * MicroGrind cells and prices follow product decisions of 6 Nov 2026 (Tiago):
 * every MicroGrind row is ✓, the community-library row was dropped, and a price row
 * shows each app's cheapest paid plan from public sources (they vary by country and store).
 * The old /vs-* pages redirect here (see VS_REDIRECT_RULES in render.mjs).
 */
export const COMPARE_COLUMNS = ['Quizlet', 'Knowunity', 'Gemini Notebook', 'Anki', 'Astra AI', 'MicroGrind'];

export const comparePair = { pt: '/comparar/', en: '/en/compare/' };

/** Old one-to-one comparison pages, now redirected to the comparison page. */
export const RETIRED_VS_SLUGS = ['vs-quizlet', 'vs-studingo', 'vs-knowunity', 'vs-notebooklm', 'vs-anki', 'vs-astra-ai'];

const Y = 'yes';
const N = 'no';

// Columns follow COMPARE_COLUMNS. Order: Quizlet, Knowunity, Gemini Notebook, Anki, Astra AI, MicroGrind.
const ROWS = [
  {
    pt: 'Mapa da matéria: a estrutura da disciplina a partir do teu material',
    en: 'Subject Map: your subject’s structure, built from your own material',
    marks: [N, N, N, N, N, Y],
  },
  {
    pt: 'Sessões curtas de 5 a 25 minutos, ligadas ao mapa',
    en: 'Short 5–25 minute sessions tied to the map',
    marks: [N, N, N, N, N, Y],
  },
  {
    pt: 'Vês os capítulos, tópicos e conceitos antes de praticar',
    en: 'See chapters, topics and concepts before you practise',
    marks: [N, N, N, N, N, Y],
  },
  {
    pt: 'Carregas PDF, sebenta, slides ou apontamentos',
    en: 'Upload PDFs, course packs, slides or notes',
    marks: [Y, Y, Y, N, Y, Y],
  },
  {
    pt: 'Flashcards e perguntas de prática',
    en: 'Flashcards and practice questions',
    marks: [Y, Y, Y, Y, Y, Y],
  },
  {
    pt: 'Repetição espaçada',
    en: 'Spaced repetition',
    marks: [N, N, N, Y, N, Y],
  },
  {
    pt: 'Funciona no browser, sem instalar nada no computador',
    en: 'Works in the browser, nothing to install on your computer',
    marks: [Y, Y, Y, N, Y, Y],
  },
  {
    pt: 'Mapa visual da matéria a partir das tuas fontes',
    en: 'Visual map of your material, built from your sources',
    marks: [N, N, Y, N, N, Y],
  },
  {
    pt: 'Modo teste e simulações de exame',
    en: 'Test mode and mock exams',
    marks: [Y, Y, N, N, Y, Y],
  },
];

const PRICES = {
  pt: ['≈ 8 €/mês (Plus)', '5,99 €/mês (Lite)', '4,99 €/mês (Google AI Plus)', 'Grátis · iPhone: 29,99 € (pagamento único)', '≈ 24 €/mês (Plus)', '4 €/mês'],
  en: ['≈ €8/month (Plus)', '€5.99/month (Lite)', '€4.99/month (Google AI Plus)', 'Free · iPhone: €29.99 (one-off)', '≈ €24/month (Plus)', '€4/month'],
};

function mark(value, locale) {
  const label = value === Y ? (locale === 'pt' ? 'Sim' : 'Yes') : locale === 'pt' ? 'Não' : 'No';
  return { kind: 'mark', value, label };
}

function table(locale) {
  const pt = locale === 'pt';
  const rows = ROWS.map((row) => [row[locale], ...row.marks.map((value) => mark(value, locale))]);
  rows.push([pt ? 'Preço do plano pago mais barato' : 'Cheapest paid plan', ...PRICES[locale].map((text) => ({ kind: 'price', text }))]);
  return {
    type: 'table',
    variant: 'hub',
    caption: pt ? 'Comparação de apps de estudo' : 'Study app comparison',
    headers: [pt ? 'Funcionalidade' : 'Feature', ...COMPARE_COLUMNS],
    rows,
  };
}

const SOURCES = {
  pt: [
    { text: 'Preços: plano pago mais barato, em fontes públicas a 6 de novembro de 2026 — ' },
    { href: 'https://quizlet.com/upgrade', text: 'Quizlet' },
    { text: ', ' },
    { href: 'https://apps.apple.com/pt/app/knowunity/id1484296272', text: 'Knowunity' },
    { text: ', ' },
    { href: 'https://gemini.google/pt/subscriptions/?hl=pt-PT', text: 'Google AI Plus' },
    { text: ', ' },
    { href: 'https://apps.ankiweb.net/', text: 'Anki' },
    { text: ', ' },
    { href: 'https://astra-ai.co/', text: 'Astra AI' },
    { text: '. Variam por país, loja e promoções: confirma no site oficial. Gemini Notebook é o Google NotebookLM; Astra AI é a app de astra-ai.co.' },
  ],
  en: [
    { text: 'Prices: cheapest paid plan, from public sources on 6 November 2026 — ' },
    { href: 'https://quizlet.com/upgrade', text: 'Quizlet' },
    { text: ', ' },
    { href: 'https://apps.apple.com/gb/app/knowunity/id1484296272', text: 'Knowunity' },
    { text: ', ' },
    { href: 'https://gemini.google/subscriptions/', text: 'Google AI Plus' },
    { text: ', ' },
    { href: 'https://apps.ankiweb.net/', text: 'Anki' },
    { text: ', ' },
    { href: 'https://astra-ai.co/', text: 'Astra AI' },
    { text: '. They vary by country, store and promotion: check the official site. Gemini Notebook is Google NotebookLM; Astra AI is the app at astra-ai.co.' },
  ],
};

const COPY = {
  pt: {
    path: '/comparar/',
    title: 'Comparar apps de estudo: MicroGrind, Quizlet, Knowunity, Anki e mais | MicroGrind',
    description:
      'MicroGrind, Quizlet, Knowunity, Gemini Notebook, Anki e Astra AI lado a lado: o que cada app faz e quanto custa o plano pago mais barato.',
    kicker: 'Comparar',
    h1: 'Comparar apps de estudo',
    lede: 'Seis apps de estudo lado a lado: o que cada uma faz e quanto custa o plano pago mais barato. A MicroGrind junta mapa da matéria, sessões curtas, flashcards, quizzes e simulações de exame, por 4 € por mês.',
    tableTitle: 'Tabela de comparação',
    whyTitle: 'Porque escolher a MicroGrind',
    why: [
      [{ strong: true, text: 'Primeiro o mapa.' }, { text: ' Vês a disciplina inteira, capítulo a capítulo, antes de estudar a primeira página.' }],
      [{ strong: true, text: 'Depois, sessões curtas.' }, { text: ' Escolhes entre 5 e 25 minutos e estudas a matéria organizada no mapa.' }],
      [{ strong: true, text: 'Tudo no mesmo sítio.' }, { text: ' Lições, flashcards, quizzes, repetição espaçada e simulações de exame, a partir do teu material.' }],
      [{ strong: true, text: '4 € por mês.' }, { text: ' Na web e no telemóvel.' }],
    ],
    faqTitle: 'Perguntas frequentes',
    faq: [
      { q: 'Quanto custa a MicroGrind?', a: '4 € por mês. Abre a app em microgrind.app, na web ou no telemóvel.' },
      {
        q: 'Os preços das outras apps são exatos?',
        a: 'São o plano pago mais barato que encontrámos em fontes públicas a 6 de novembro de 2026. Mudam com o país, a loja e as promoções, por isso confirma sempre no site oficial de cada app.',
      },
      {
        q: 'O mapa da matéria é um mapa mental?',
        a: 'Não. Um mapa mental é um diagrama livre. O mapa da matéria organiza a tua disciplina em capítulos, tópicos, conceitos e relações a partir do material que carregas, e é a base das sessões curtas.',
      },
      {
        q: 'Posso usar a MicroGrind com outra app?',
        a: 'Sim. Podes estudar a estrutura da disciplina na MicroGrind e continuar a usar outra app para o que precisares.',
      },
      { q: 'Que ficheiros posso carregar?', a: 'PDF, Word, texto e fotografias dos teus apontamentos. O mapa da matéria constrói-se a partir do ficheiro que carregas.' },
    ],
    cta: [{ text: 'Começa em ' }, { href: 'https://microgrind.app/app/', text: 'microgrind.app' }, { text: ' ou lê o que é o ' }, { href: 'https://microgrind.app/mapa-da-materia/', text: 'mapa da matéria' }, { text: '. Sessões curtas. Progresso real.' }],
  },
  en: {
    path: '/en/compare/',
    title: 'Compare study apps: MicroGrind, Quizlet, Knowunity, Anki and more | MicroGrind',
    description:
      'MicroGrind, Quizlet, Knowunity, Gemini Notebook, Anki and Astra AI side by side: what each app does and what its cheapest paid plan costs.',
    kicker: 'Compare',
    h1: 'Compare study apps',
    lede: 'Six study apps side by side: what each one does and what its cheapest paid plan costs. MicroGrind brings together a Subject Map, short sessions, flashcards, quizzes and mock exams for €4 a month.',
    tableTitle: 'Comparison table',
    whyTitle: 'Why MicroGrind',
    why: [
      [{ strong: true, text: 'Map first.' }, { text: ' See the whole subject, chapter by chapter, before you study the first page.' }],
      [{ strong: true, text: 'Then short sessions.' }, { text: ' Pick 5 to 25 minutes and study the material organised in your map.' }],
      [{ strong: true, text: 'All in one place.' }, { text: ' Lessons, flashcards, quizzes, spaced repetition and mock exams, built from your own material.' }],
      [{ strong: true, text: '€4 a month.' }, { text: ' On the web and on your phone.' }],
    ],
    faqTitle: 'Common questions',
    faq: [
      { q: 'How much does MicroGrind cost?', a: '€4 a month. Open the app at microgrind.app, on the web or on your phone.' },
      {
        q: 'Are the other apps’ prices exact?',
        a: 'They are the cheapest paid plan we found in public sources on 6 November 2026. They change by country, store and promotion, so always check each app’s official site.',
      },
      {
        q: 'Is the Subject Map a mind map?',
        a: 'No. A mind map is a free-form diagram. The Subject Map organises your subject into chapters, topics, concepts and how they connect, from the material you upload, and it drives your short sessions.',
      },
      {
        q: 'Can I use MicroGrind alongside another app?',
        a: 'Yes. You can study your subject’s structure in MicroGrind and keep using another app for whatever else you need.',
      },
      { q: 'What can I upload?', a: 'PDFs, Word files, text and photos of your notes. The Subject Map is built from the file you upload.' },
    ],
    cta: [{ text: 'Start at ' }, { href: 'https://microgrind.app/app/', text: 'microgrind.app' }, { text: ' or read what the ' }, { href: 'https://microgrind.app/en/subject-map/', text: 'Subject Map' }, { text: ' is. Short sessions. Real progress.' }],
  },
};

function page(locale) {
  const c = COPY[locale];
  return {
    id: `compare-${locale}`,
    locale,
    path: c.path,
    ptPath: comparePair.pt,
    enPath: comparePair.en,
    wide: true,
    title: c.title,
    description: c.description,
    kicker: c.kicker,
    h1: c.h1,
    lede: c.lede,
    blocks: [
      { type: 'h2', text: c.tableTitle },
      table(locale),
      { type: 'p', className: 'compare-note', parts: SOURCES[locale] },
      { type: 'h2', text: c.whyTitle },
      { type: 'list', ordered: false, items: c.why },
      { type: 'faq', title: c.faqTitle, items: c.faq },
      { type: 'cta', parts: c.cta },
    ],
  };
}

export const comparePages = [page('pt'), page('en')];

export const compareLinks = {
  pt: [{ heading: true, label: 'Comparações' }, { href: comparePair.pt, label: 'Comparar apps de estudo' }],
  en: [{ heading: true, label: 'Comparisons' }, { href: comparePair.en, label: 'Compare study apps' }],
};
