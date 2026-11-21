/**
 * Plans and prices for the public /planos/ and /en/pricing/ pages.
 * Every number mirrors what the app's plans screen shows (components/plans/PlansOffer.tsx, creditFacts()):
 * - prices: public.plans.price_cents and docs/stripe-precos-teste.md (yearly = monthly × 12 × 0.8, rounded to the cent;
 *   the per-month figure is the yearly total ÷ 12, floored to the cent, like yearlyMonthlyEquivalent()).
 * - AI credits: public.plans.credit_quota (supabase/migrations, docs/creditos-ia.md). One pool for the tutor,
 *   exercises, maps, AI exams, test plans, battles, hints, grading and podcasts. Monthly on Plus, Pro and Ultra
 *   (yearly billing too), once on Free, across the 56-day pass on Passe Época.
 * - "Enough for": ≈ credits tutor messages (1 credit per normal-mode message) or ≈ credits ÷ mapCredits(3000)
 *   map pages (6 credits per 1 000 characters, 3 000 characters a page), like creditFacts().
 * - AI exam simulations: EXAM_SIMULATION_ALLOWANCE in supabase/functions/_shared/ai-exam/limits.ts.
 * - Advanced tutor mode: Pro and Ultra only (TUTOR_PREMIUM_PLAN_CODES).
 * scripts/check-app-parity.mjs compares lib/app-limits.mjs with the app before every publish, and the test in
 * seo-site.test.mjs checks this file against lib/app-limits.mjs. Change the app first, then this file.
 */
import { featureHref } from './anchors.mjs';
import { MAP_CREDITS_PER_1000_CHARACTERS } from '../lib/app-limits.mjs';

export const PLAN_FACTS = {
  free: { monthlyCents: null, onceCents: null, credits: 1000, creditWindow: 'once', exams: 0, examWindow: 'month', advanced: false },
  plus: { monthlyCents: 499, onceCents: null, credits: 2000, creditWindow: 'month', exams: 3, examWindow: 'month', advanced: false },
  pro: { monthlyCents: 999, onceCents: null, credits: 4000, creditWindow: 'month', exams: 10, examWindow: 'month', advanced: true },
  ultra: { monthlyCents: 2499, onceCents: null, credits: 10_000, creditWindow: 'month', exams: 15, examWindow: 'month', advanced: true },
  season: { monthlyCents: null, onceCents: 1999, credits: 6000, creditWindow: 'pass', exams: 20, examWindow: 'pass', advanced: false, durationDays: 56 },
};

export const PLAN_ORDER = ['free', 'plus', 'pro', 'ultra', 'season'];
export const FEATURED_PLAN = 'pro';
export const CHARACTERS_PER_PAGE = 3000;

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

/** Credits one map page uses (mapCredits(CHARACTERS_PER_PAGE) in the app). */
export function creditsPerMapPage() {
  return Math.ceil((CHARACTERS_PER_PAGE * MAP_CREDITS_PER_1000_CHARACTERS) / 1000);
}

/** ≈ map pages a credit pool pays for, floored like the app's creditFacts(). */
export function mapPages(credits) {
  return Math.floor(credits / creditsPerMapPage());
}

/** ≈ tutor messages in normal mode: one credit each. */
export function tutorMessages(credits) {
  return credits;
}

/** Cheapest paid price per month: Plus on yearly billing. */
export function cheapestMonthlyCents() {
  return Math.min(...PLAN_ORDER.map((code) => PLAN_FACTS[code].monthlyCents).filter(Boolean).map(yearlyPerMonthCents));
}

export function euros(cents, locale) {
  const value = (cents / 100).toFixed(2);
  return locale === 'en' ? `€${value}` : `${value.replace('.', ',')}\u00a0€`;
}

export function count(value, locale) {
  const digits = String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
  return locale === 'en' ? digits.replaceAll('\u202f', ',') : digits;
}

const PT = {
  names: { free: 'Grátis', plus: 'Plus', pro: 'Pro', ultra: 'Ultra', season: 'Passe Época' },
  taglines: {
    free: 'Para experimentar com uma disciplina.',
    plus: 'Para estudar todas as semanas.',
    pro: 'Para várias disciplinas e o tutor avançado.',
    ultra: 'Para quem usa muito o tutor e os mapas.',
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
  free: '0\u00a0€',
  freeNote: 'Sem pagamento',
  credits: (c, w) =>
    w === 'once'
      ? `${c} créditos de IA (uma vez), para o tutor, exercícios, mapas e exames`
      : w === 'pass'
        ? `${c} créditos de IA ao longo de 8 semanas, para o tutor, exercícios, mapas e exames`
        : `${c} créditos de IA por mês, para o tutor, exercícios, mapas e exames`,
  equivalent: (m, p) => `Dá para ≈ ${m} mensagens do tutor ou ≈ ${p} páginas de mapa`,
  monthlyRenewal: 'Os créditos de IA renovam todos os meses, também no plano anual',
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
    ultra: 'For heavy use of the tutor and maps.',
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
  credits: (c, w) =>
    w === 'once'
      ? `${c} AI credits (once), for the tutor, exercises, maps and exams`
      : w === 'pass'
        ? `${c} AI credits over 8 weeks, for the tutor, exercises, maps and exams`
        : `${c} AI credits a month, for the tutor, exercises, maps and exams`,
  equivalent: (m, p) => `Enough for ≈ ${m} tutor messages or ≈ ${p} map pages`,
  monthlyRenewal: 'AI credits renew every month, on yearly billing too',
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
  const facts = [
    t.base,
    t.credits(count(p.credits, locale), p.creditWindow),
    t.equivalent(count(tutorMessages(p.credits), locale), count(mapPages(p.credits), locale)),
    t.exams(p.exams, p.examWindow),
  ];
  if (p.advanced) facts.push(t.advanced);
  if (p.creditWindow === 'month') facts.push(t.monthlyRenewal);
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

function creditsRow(locale) {
  return PLAN_ORDER.map((code) => {
    const p = PLAN_FACTS[code];
    const c = count(p.credits, locale);
    if (locale === 'en') {
      if (p.creditWindow === 'once') return `${c} (once)`;
      if (p.creditWindow === 'pass') return `${c} over 8 weeks`;
      return `${c} a month`;
    }
    if (p.creditWindow === 'once') return `${c} (uma vez)`;
    if (p.creditWindow === 'pass') return `${c} em 8 semanas`;
    return `${c} por mês`;
  });
}

function equivalentRow(locale) {
  return PLAN_ORDER.map((code) => {
    const p = PLAN_FACTS[code];
    const m = count(tutorMessages(p.credits), locale);
    const pg = count(mapPages(p.credits), locale);
    return locale === 'en' ? `≈ ${m} tutor messages or ≈ ${pg} map pages` : `≈ ${m} mensagens do tutor ou ≈ ${pg} páginas de mapa`;
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
      [pt ? 'Créditos de IA' : 'AI credits', ...creditsRow(locale)],
      [pt ? 'Dá para (um ou outro)' : 'Enough for (one or the other)', ...equivalentRow(locale)],
      [link(locale, 'tutor', pt ? 'Tutor IA' : 'AI Tutor'), ...marks(locale, () => true)],
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
      'Começa grátis. Quando precisares de mais créditos de IA ou de simulações de exame com IA, escolhes um plano. Os preços e os limites são os mesmos que vês no ecrã Planos da app.',
    blocks: [
      { type: 'plans' },
      { type: 'h2', text: 'O que inclui cada plano' },
      planTable('pt'),
      {
        type: 'p',
        text: 'O mapa da matéria, as lições, os flashcards, os quizzes, o tutor e o modo exame com as questões do teu mapa estão em todos os planos. O que muda são os créditos de IA, um só saldo para o tutor, os exercícios, os mapas, os exames com IA, os planos de teste e as batalhas, e as simulações de exame com IA.',
      },
      { type: 'h2', text: 'Funcionalidades' },
      {
        type: 'list',
        ordered: false,
        items: [
          [{ href: featureHref('pt', 'map'), text: 'Mapa da matéria' }, { text: ': a tua disciplina em capítulos e lições, a partir do teu material.' }],
          [{ href: featureHref('pt', 'lessons'), text: 'Lições' }, { text: ': lições curtas, capítulo a capítulo, com um checkpoint no fim de cada capítulo.' }],
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
            a: 'O preço por mês mostrado no anual é o total anual a dividir por 12, só para comparar. O valor cobrado é o total anual, uma vez por ano. Os créditos de IA renovam todos os meses, também no anual.',
          },
          {
            q: 'O que é o Passe Época?',
            a: 'Um pagamento único de 19,99 € que dá 8 semanas de acesso, sem renovação. Serve para a época de exames, sem subscrição.',
          },
          {
            q: 'O que são os créditos de IA?',
            a: `Um só saldo para o tutor, os exercícios, os mapas, os exames com IA, os planos de teste e as batalhas. Cada pedido gasta o que custa: em média, uma mensagem do tutor no modo normal gasta 1 crédito e uma página de mapa cerca de ${creditsPerMapPage()}. Antes de gerares um mapa ou um capítulo, a app mostra quantos créditos vai usar.`,
          },
          {
            q: 'Os créditos que não uso passam para o mês seguinte?',
            a: 'Não. No Plus, no Pro e no Ultra, o saldo volta ao total todos os meses, também no anual. No Grátis, os créditos são para usar uma vez. No Passe Época, duram as 8 semanas.',
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
      'Start for free. When you need more AI credits or AI exam simulations, pick a plan. Prices and limits are the same ones you see on the Plans screen in the app.',
    blocks: [
      { type: 'plans' },
      { type: 'h2', text: 'What each plan includes' },
      planTable('en'),
      {
        type: 'p',
        text: 'The Subject Map, lessons, flashcards, quizzes, the tutor and exam mode with the questions in your map are on every plan. What changes are the AI credits, one balance for the tutor, exercises, maps, AI exams, test plans and battles, and the AI exam simulations.',
      },
      { type: 'h2', text: 'Features' },
      {
        type: 'list',
        ordered: false,
        items: [
          [{ href: featureHref('en', 'map'), text: 'Subject Map' }, { text: ': your subject in chapters and lessons, from your own material.' }],
          [{ href: featureHref('en', 'lessons'), text: 'Lessons' }, { text: ': short lessons, chapter by chapter, with a checkpoint at the end of each chapter.' }],
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
            a: 'The monthly price shown on yearly billing is the yearly total divided by 12, for comparison only. You are charged the yearly total once a year. AI credits renew every month, on yearly billing too.',
          },
          {
            q: 'What is Passe Época?',
            a: 'A one-off payment of €19.99 for 8 weeks of access, with no renewal. It is meant for exam season, without a subscription.',
          },
          {
            q: 'What are AI credits?',
            a: `One balance for the tutor, exercises, maps, AI exams, test plans and battles. Each request uses what it costs: on average, a tutor message in normal mode uses 1 credit and a map page about ${creditsPerMapPage()}. Before you generate a map or a chapter, the app shows how many credits it will use.`,
          },
          {
            q: 'Do unused credits carry over to the next month?',
            a: 'No. On Plus, Pro and Ultra, the balance goes back to the full amount every month, on yearly billing too. On Free, the credits are for one-time use. On Passe Época, they last the 8 weeks.',
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
