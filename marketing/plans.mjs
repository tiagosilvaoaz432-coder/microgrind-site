/**
 * Plans and prices for the public /planos/ and /en/pricing/ pages.
 * Every number mirrors what the app's plans screen shows (components/plans/PlansOffer.tsx):
 * - prices: public.plans.price_cents and docs/stripe-precos-teste.md (yearly = monthly × 12 × 0.8, rounded to the cent;
 *   the per-month figure is the yearly total ÷ 12, floored to the cent, like yearlyMonthlyEquivalent()).
 * - characters and pages: public.plans.character_quota, CHARACTERS_PER_PAGE = 3000.
 * - tutor: TUTOR_PLAN_TOKEN_WINDOWS ÷ TUTOR_AVERAGE_MESSAGE_TOKENS (14 502), rounded, like approximateTutorMessages().
 * - AI exam simulations: EXAM_SIMULATION_ALLOWANCE in lib/ai-exam/limits.ts.
 * - Advanced tutor mode: Pro and Ultra only (TUTOR_PREMIUM_PLAN_CODES).
 * The test in seo-site.test.mjs recomputes these from the app modules. Change the app first, then this file.
 */
import { featureHref } from './anchors.mjs';

export const PLAN_FACTS = {
  free: { monthlyCents: null, onceCents: null, characters: 150_000, characterWindow: 'once', tutorTokens: 95_310, exams: 0, examWindow: 'month', advanced: false },
  plus: { monthlyCents: 499, onceCents: null, characters: 250_000, characterWindow: 30, tutorTokens: 635_400, exams: 3, examWindow: 'month', advanced: false },
  pro: { monthlyCents: 999, onceCents: null, characters: 500_000, characterWindow: 30, tutorTokens: 1_270_800, exams: 10, examWindow: 'month', advanced: true },
  ultra: { monthlyCents: 2499, onceCents: null, characters: 1_500_000, characterWindow: 30, tutorTokens: 3_177_000, exams: 15, examWindow: 'month', advanced: true },
  season: { monthlyCents: null, onceCents: 1999, characters: 1_000_000, characterWindow: 'pass', tutorTokens: 1_270_800, exams: 20, examWindow: 'pass', advanced: false, durationDays: 56 },
};

export const PLAN_ORDER = ['free', 'plus', 'pro', 'ultra', 'season'];
export const FEATURED_PLAN = 'pro';
export const CHARACTERS_PER_PAGE = 3000;
export const TUTOR_AVERAGE_MESSAGE_TOKENS = 14_502;

export function annualCents(monthlyCents) {
  return Math.round(monthlyCents * 12 * 0.8);
}

export function yearlyPerMonthCents(monthlyCents) {
  return Math.floor(annualCents(monthlyCents) / 12);
}

export function savingsPercent(monthlyCents) {
  const base = monthlyCents * 12;
  return Math.floor(((base - annualCents(monthlyCents)) * 100) / base);
}

export function pages(characters) {
  return Math.max(1, Math.round(characters / CHARACTERS_PER_PAGE));
}

export function tutorMessages(tokens) {
  return Math.max(1, Math.round(tokens / TUTOR_AVERAGE_MESSAGE_TOKENS));
}

/** Tutor tokens across the 56-day pass: two 30-day windows. */
export function passTutorTokens(plan) {
  const windows = 1 + Math.floor((plan.durationDays - 1) / 30);
  return windows * plan.tutorTokens;
}

export function euros(cents, locale) {
  const value = (cents / 100).toFixed(2);
  return locale === 'en' ? `€${value}` : `${value.replace('.', ',')} €`;
}

export function count(value, locale) {
  const digits = String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return locale === 'en' ? digits.replaceAll(' ', ',') : digits;
}

const PT = {
  names: { free: 'Grátis', plus: 'Plus', pro: 'Pro', ultra: 'Ultra', season: 'Passe Época' },
  taglines: {
    free: 'Para experimentar com uma disciplina.',
    plus: 'Para estudar todas as semanas.',
    pro: 'Para várias disciplinas e o tutor avançado.',
    ultra: 'Para quem carrega muito material.',
    season: 'Para a época de exames, sem subscrição.',
  },
  featured: 'Mais escolhido',
  monthly: 'Mensal',
  yearly: 'Anual',
  save: (p) => `Poupas ${p}%`,
  intervalLabel: 'Faturação',
  perMonth: '/mês',
  billedYearly: (v) => `Faturado anualmente: ${v}`,
  orMonthly: (v) => `Ou ${v}/mês no mensal`,
  billedMonthly: 'Renova todos os meses até cancelares',
  renewsYearly: 'Renova todos os anos até cancelares',
  once: 'Pagamento único · 8 semanas',
  noRenewal: 'Um pagamento, sem renovação',
  free: '0 €',
  freeNote: 'Sem pagamento',
  characters: (c, p, w) =>
    w === 'once'
      ? `${c} caracteres (equivalente a ${p} páginas)`
      : w === 'pass'
        ? `${c} caracteres ao longo de 8 semanas (equivalente a ${p} páginas)`
        : `${c} caracteres em cada 30 dias (equivalente a ${p} páginas)`,
  tutor: (m, total) => (total ? `Tutor IA: ≈ ${total} mensagens ao longo do passe (≈ ${m} em cada 30 dias)` : `Tutor IA: ≈ ${m} mensagens em cada 30 dias`),
  exams: (n, w) =>
    n === 0
      ? 'Sem simulações de exame com IA'
      : w === 'pass'
        ? `${n} simulações de exame com IA em 8 semanas`
        : `${n} simulações de exame com IA por mês`,
  advanced: 'Modo avançado do tutor',
  base: 'Mapa da matéria, lições, flashcards, quizzes e modo exame',
  cta: { free: 'Começar grátis', paid: (n) => `Escolher o ${n}`, season: 'Comprar o passe' },
  yearlyNote:
    'No anual, o preço em destaque é o total anual a dividir por 12, só para comparar. O valor cobrado é o total anual, uma vez por ano. O Passe Época não tem preço anual.',
};

const EN = {
  names: { free: 'Free', plus: 'Plus', pro: 'Pro', ultra: 'Ultra', season: 'Passe Época' },
  taglines: {
    free: 'To try it with one subject.',
    plus: 'To study every week.',
    pro: 'For several subjects and the advanced tutor.',
    ultra: 'For students with a lot of material.',
    season: 'For exam season, without a subscription.',
  },
  featured: 'Most popular',
  monthly: 'Monthly',
  yearly: 'Yearly',
  save: (p) => `Save ${p}%`,
  intervalLabel: 'Billing',
  perMonth: '/month',
  billedYearly: (v) => `Billed annually: ${v}`,
  orMonthly: (v) => `Or ${v}/month on monthly`,
  billedMonthly: 'Renews every month until you cancel',
  renewsYearly: 'Renews every year until you cancel',
  once: 'One payment · 8 weeks',
  noRenewal: 'One payment, no renewal',
  free: '€0',
  freeNote: 'No payment',
  characters: (c, p, w) =>
    w === 'once'
      ? `${c} characters (about ${p} pages)`
      : w === 'pass'
        ? `${c} characters over 8 weeks (about ${p} pages)`
        : `${c} characters every 30 days (about ${p} pages)`,
  tutor: (m, total) => (total ? `AI Tutor: ≈ ${total} messages across the pass (≈ ${m} every 30 days)` : `AI Tutor: ≈ ${m} messages every 30 days`),
  exams: (n, w) =>
    n === 0
      ? 'No AI exam simulations'
      : w === 'pass'
        ? `${n} AI exam simulations over 8 weeks`
        : `${n} AI exam simulations per month`,
  advanced: 'Advanced tutor mode',
  base: 'Subject Map, lessons, flashcards, quizzes and exam mode',
  cta: { free: 'Start for free', paid: (n) => `Choose ${n}`, season: 'Buy the pass' },
  yearlyNote:
    'On yearly billing, the headline price is the yearly total divided by 12, for comparison only. You are charged the yearly total once a year. Passe Época has no yearly price.',
};

export const PLAN_COPY = { pt: PT, en: EN };

/** One card's text, in the order the app's plans screen lists the facts. */
export function planCard(code, locale) {
  const t = PLAN_COPY[locale];
  const p = PLAN_FACTS[code];
  const facts = [t.base, t.characters(count(p.characters, locale), count(pages(p.characters), locale), p.characterWindow)];
  if (code === 'season') facts.push(t.tutor(tutorMessages(p.tutorTokens), tutorMessages(passTutorTokens(p))));
  else facts.push(t.tutor(tutorMessages(p.tutorTokens)));
  facts.push(t.exams(p.exams, p.examWindow));
  if (p.advanced) facts.push(t.advanced);
  return { code, name: t.names[code], tagline: t.taglines[code], facts, plan: p };
}

/* ---------- Pricing pages (/planos/ and /en/pricing/) ---------- */


const APP = 'https://microgrind.app/app/';

function priceRow(locale) {
  const t = PLAN_COPY[locale];
  return PLAN_ORDER.map((code) => {
    const p = PLAN_FACTS[code];
    if (p.monthlyCents) return `${euros(p.monthlyCents, locale)}${t.perMonth}`;
    if (p.onceCents) return `${euros(p.onceCents, locale)} (${locale === 'en' ? '8 weeks' : '8 semanas'})`;
    return t.free;
  });
}

function yearRow(locale) {
  return PLAN_ORDER.map((code) => {
    const p = PLAN_FACTS[code];
    if (!p.monthlyCents) return '—';
    return `${euros(annualCents(p.monthlyCents), locale)}${locale === 'en' ? '/year' : '/ano'}`;
  });
}

function charactersRow(locale) {
  return PLAN_ORDER.map((code) => {
    const p = PLAN_FACTS[code];
    const c = count(p.characters, locale);
    const pg = count(pages(p.characters), locale);
    if (locale === 'en') {
      if (p.characterWindow === 'once') return `${c} in total (≈ ${pg} pages)`;
      if (p.characterWindow === 'pass') return `${c} over 8 weeks (≈ ${pg} pages)`;
      return `${c} every 30 days (≈ ${pg} pages)`;
    }
    if (p.characterWindow === 'once') return `${c} no total (≈ ${pg} páginas)`;
    if (p.characterWindow === 'pass') return `${c} em 8 semanas (≈ ${pg} páginas)`;
    return `${c} em cada 30 dias (≈ ${pg} páginas)`;
  });
}

function tutorRow(locale) {
  return PLAN_ORDER.map((code) => {
    const p = PLAN_FACTS[code];
    if (code === 'season') {
      const n = tutorMessages(passTutorTokens(p));
      return locale === 'en' ? `≈ ${n} messages across the pass` : `≈ ${n} mensagens no passe`;
    }
    const n = tutorMessages(p.tutorTokens);
    return locale === 'en' ? `≈ ${n} messages every 30 days` : `≈ ${n} mensagens em cada 30 dias`;
  });
}

function examRow(locale) {
  return PLAN_ORDER.map((code) => {
    const p = PLAN_FACTS[code];
    if (p.examWindow === 'pass') return locale === 'en' ? `${p.exams} over 8 weeks` : `${p.exams} em 8 semanas`;
    return locale === 'en' ? `${p.exams} per month` : `${p.exams} por mês`;
  });
}

function marks(locale, test) {
  const yes = locale === 'en' ? 'Included' : 'Incluído';
  const no = locale === 'en' ? 'Not included' : 'Não incluído';
  return PLAN_ORDER.map((code) => {
    const on = test(code, PLAN_FACTS[code]);
    return { kind: 'mark', value: on ? 'yes' : 'no', label: on ? yes : no };
  });
}

function link(locale, key, text) {
  return [{ href: featureHref(locale, key), text }];
}

function planTable(locale) {
  const names = PLAN_ORDER.map((code) => PLAN_COPY[locale].names[code]);
  const pt = locale === 'pt';
  return {
    type: 'table',
    variant: 'advantage',
    caption: pt ? 'O que inclui cada plano da MicroGrind' : 'What each MicroGrind plan includes',
    headers: [pt ? 'Plano' : 'Plan', ...names],
    rows: [
      [pt ? 'Preço' : 'Price', ...priceRow(locale)],
      [pt ? 'No anual (poupas 20%)' : 'Yearly (save 20%)', ...yearRow(locale)],
      [link(locale, 'map', pt ? 'Mapa da matéria' : 'Subject Map'), ...marks(locale, () => true)],
      [link(locale, 'lessons', pt ? 'Lições' : 'Lessons'), ...marks(locale, () => true)],
      [link(locale, 'flashcards', 'Flashcards'), ...marks(locale, () => true)],
      [link(locale, 'quiz', 'Quizzes'), ...marks(locale, () => true)],
      [pt ? 'Material carregado (caracteres)' : 'Uploaded material (characters)', ...charactersRow(locale)],
      [link(locale, 'tutor', pt ? 'Tutor IA' : 'AI Tutor'), ...tutorRow(locale)],
      [pt ? 'Modo avançado do tutor' : 'Advanced tutor mode', ...marks(locale, (_, p) => p.advanced)],
      [link(locale, 'exam', pt ? 'Simulações de exame com IA' : 'AI exam simulations'), ...examRow(locale)],
    ],
  };
}

export const pricingPair = { pt: '/planos/', en: '/en/pricing/' };

export const pricingPages = [
  {
    id: 'planos',
    kind: 'pricing',
    wide: true,
    locale: 'pt',
    path: pricingPair.pt,
    ptPath: pricingPair.pt,
    enPath: pricingPair.en,
    title: 'Planos e preços | MicroGrind',
    description:
      'Planos da MicroGrind: Grátis, Plus (4,99 €/mês), Pro (9,99 €/mês), Ultra (24,99 €/mês) e Passe Época (19,99 €, 8 semanas). No anual poupas 20%.',
    kicker: 'Planos e preços',
    h1: 'Planos e preços',
    lede:
      'Começa grátis. Quando precisares de mais material, mais tutor ou simulações de exame com IA, escolhes um plano. Os preços e os limites são os mesmos que vês no ecrã Planos da app.',
    blocks: [
      { type: 'plans' },
      { type: 'h2', text: 'O que inclui cada plano' },
      planTable('pt'),
      {
        type: 'p',
        text: 'O mapa da matéria, as lições, os flashcards, os quizzes e o modo exame com as questões do teu mapa estão em todos os planos. O que muda é a quantidade de material que podes carregar, as mensagens do tutor e as simulações de exame com IA.',
      },
      { type: 'h2', text: 'Funcionalidades' },
      {
        type: 'list',
        ordered: false,
        items: [
          [{ href: featureHref('pt', 'map'), text: 'Mapa da matéria' }, { text: ': a tua disciplina em capítulos e lições, a partir do teu material.' }],
          [{ href: featureHref('pt', 'lessons'), text: 'Lições' }, { text: ': mini-lições curtas, um conceito de cada vez.' }],
          [{ href: featureHref('pt', 'flashcards'), text: 'Flashcards' }, { text: ': cartões gerados a partir dos teus tópicos.' }],
          [{ href: featureHref('pt', 'quiz'), text: 'Quizzes' }, { text: ': perguntas sobre o teu documento, com explicação.' }],
          [{ href: featureHref('pt', 'exam'), text: 'Simulação de exame' }, { text: ': treina com tempo, como no dia do teste.' }],
          [{ href: featureHref('pt', 'tutor'), text: 'Tutor IA' }, { text: ': pergunta o que não percebeste, sobre a tua matéria.' }],
        ],
      },
      {
        type: 'faq',
        title: 'Perguntas sobre planos',
        items: [
          {
            q: 'Quanto custa a MicroGrind?',
            a: 'Há um plano Grátis. O Plus custa 4,99 € por mês, o Pro 9,99 € por mês e o Ultra 24,99 € por mês. No anual pagas 47,90 €, 95,90 € ou 239,90 € por ano e poupas 20%. O Passe Época custa 19,99 €, num só pagamento, e dura 8 semanas.',
          },
          {
            q: 'Como funciona o plano anual?',
            a: 'O preço por mês mostrado no anual é o total anual a dividir por 12, só para comparar. O valor cobrado é o total anual, uma vez por ano. Os limites continuam a contar em períodos de 30 dias.',
          },
          {
            q: 'O que é o Passe Época?',
            a: 'Um pagamento único de 19,99 € que dá 8 semanas de acesso, sem renovação. Serve para a época de exames, sem subscrição.',
          },
          {
            q: 'O que conta como caracteres?',
            a: 'O texto do material que carregas para montar o mapa da matéria. Uma página são cerca de 3000 caracteres.',
          },
          {
            q: 'Posso cancelar?',
            a: 'Sim. Plus, Pro e Ultra renovam até cancelares. Gere a subscrição no ecrã Planos da app. O Passe Época não renova.',
          },
          {
            q: 'Onde compro um plano?',
            a: 'No ecrã Planos da MicroGrind, aberta no navegador em microgrind.app/app. O pagamento é feito pelo Stripe e o recibo segue para o email da tua conta.',
          },
        ],
      },
      { type: 'cta', href: APP, label: 'Começar grátis em microgrind.app' },
    ],
  },
  {
    id: 'pricing',
    kind: 'pricing',
    wide: true,
    locale: 'en',
    path: pricingPair.en,
    ptPath: pricingPair.pt,
    enPath: pricingPair.en,
    title: 'Plans and pricing | MicroGrind',
    description:
      'MicroGrind plans: Free, Plus (€4.99/month), Pro (€9.99/month), Ultra (€24.99/month) and Passe Época (€19.99, 8 weeks). Save 20% on yearly billing.',
    kicker: 'Plans and pricing',
    h1: 'Plans and pricing',
    lede:
      'Start for free. When you need more material, more tutor messages or AI exam simulations, pick a plan. Prices and limits are the same ones you see on the Plans screen in the app.',
    blocks: [
      { type: 'plans' },
      { type: 'h2', text: 'What each plan includes' },
      planTable('en'),
      {
        type: 'p',
        text: 'The Subject Map, lessons, flashcards, quizzes and exam mode with the questions in your map are on every plan. What changes is how much material you can upload, the tutor messages and the AI exam simulations.',
      },
      { type: 'h2', text: 'Features' },
      {
        type: 'list',
        ordered: false,
        items: [
          [{ href: featureHref('en', 'map'), text: 'Subject Map' }, { text: ': your subject in chapters and lessons, from your own material.' }],
          [{ href: featureHref('en', 'lessons'), text: 'Lessons' }, { text: ': short lessons, one concept at a time.' }],
          [{ href: featureHref('en', 'flashcards'), text: 'Flashcards' }, { text: ': cards built from your topics.' }],
          [{ href: featureHref('en', 'quiz'), text: 'Quizzes' }, { text: ': questions about your document, with explanations.' }],
          [{ href: featureHref('en', 'exam'), text: 'Mock exams' }, { text: ': practise against the clock, like on test day.' }],
          [{ href: featureHref('en', 'tutor'), text: 'AI Tutor' }, { text: ': ask about whatever didn’t click, on your material.' }],
        ],
      },
      {
        type: 'faq',
        title: 'Questions about plans',
        items: [
          {
            q: 'How much does MicroGrind cost?',
            a: 'There is a Free plan. Plus is €4.99 a month, Pro €9.99 a month and Ultra €24.99 a month. On yearly billing you pay €47.90, €95.90 or €239.90 a year and save 20%. Passe Época is €19.99, one payment, for 8 weeks.',
          },
          {
            q: 'How does yearly billing work?',
            a: 'The monthly price shown on yearly billing is the yearly total divided by 12, for comparison only. You are charged the yearly total once a year. Limits still count in 30-day periods.',
          },
          {
            q: 'What is Passe Época?',
            a: 'A one-off payment of €19.99 for 8 weeks of access, with no renewal. It is meant for exam season, without a subscription.',
          },
          {
            q: 'What counts as characters?',
            a: 'The text of the material you upload to build your Subject Map. One page is about 3,000 characters.',
          },
          {
            q: 'Can I cancel?',
            a: 'Yes. Plus, Pro and Ultra renew until you cancel. Manage your subscription on the Plans screen in the app. Passe Época does not renew.',
          },
          {
            q: 'Where do I buy a plan?',
            a: 'On the Plans screen in MicroGrind, opened in your browser at microgrind.app/app. Payment is handled by Stripe and the receipt goes to your account email.',
          },
        ],
      },
      { type: 'cta', href: APP, label: 'Start for free at microgrind.app' },
    ],
  },
];
