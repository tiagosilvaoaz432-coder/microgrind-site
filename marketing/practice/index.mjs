/**
 * All practice pages (/praticar/<slug>/) and the hub (/praticar/).
 * To add a page: write it in one of the area files, then list it in PAGES below.
 * Quiz items are authored as { q, right, wrong: [3], why } and normalised here to
 * { q, options: [4], answer, why }, with the right answer spread across positions A–D.
 */
import { civil, constitucional, penal } from './direito.mjs';
import { calculo, hipoteses, normal } from './matematica.mjs';
import { contabilidade, macro, micro } from './economia.mjs';
import { anatomia, bioquimica, farmacologia, fisiologia } from './ciencias-vida.mjs';
import { bioGeo, psicologia } from './outras.mjs';

export const PRACTICE_AREAS = [
  { id: 'direito', label: 'Direito' },
  { id: 'matematica', label: 'Matemática e Estatística' },
  { id: 'economia', label: 'Economia e Gestão' },
  { id: 'ciencias', label: 'Ciências da vida' },
  { id: 'psicologia', label: 'Psicologia' },
  { id: 'secundario', label: 'Ensino secundário' },
];

const PAGES = [
  penal,
  constitucional,
  civil,
  normal,
  hipoteses,
  calculo,
  micro,
  macro,
  contabilidade,
  anatomia,
  fisiologia,
  bioquimica,
  farmacologia,
  psicologia,
  bioGeo,
];

/** Deterministic position for the right answer: varies by page and question, never random per build. */
function answerSlot(slug, index, size) {
  let h = 0;
  for (const ch of `${slug}#${index}`) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return h % size;
}

export function normaliseQuiz(page) {
  const items = page.items.map((item, i) => {
    if (!item.right || item.wrong?.length !== 3) throw new Error(`${page.slug} item ${i + 1}: needs right + 3 wrong`);
    const slot = answerSlot(page.slug, i, 4);
    const options = [...item.wrong];
    options.splice(slot, 0, item.right);
    return { q: item.q, options, answer: slot, why: item.why };
  });
  return { ...page, items };
}

export const practicePages = PAGES.map((page) => (page.mode === 'quiz' ? normaliseQuiz(page) : page));

export const PRACTICE_HUB = {
  path: '/praticar/',
  kicker: 'Praticar',
  title: 'Perguntas de exame e flashcards grátis por disciplina | MicroGrind',
  description: 'Mini-testes e flashcards grátis de Direito, Estatística, Economia, Anatomia, Bioquímica e mais. Responde, vê a explicação e treina para o exame.',
  h1: 'Pratica para o exame, grátis',
  lede: 'Mini-testes de escolha múltipla e flashcards por disciplina, com a resposta explicada. Escolhe uma página e começa já, sem conta.',
  faqs: [
    {
      q: 'Preciso de conta para fazer os mini-testes?',
      a: 'Não. Todas as páginas de prática são gratuitas e funcionam sem registo. A conta só é precisa para criares perguntas a partir dos teus próprios apontamentos no MicroGrind.',
    },
    {
      q: 'Posso ter perguntas sobre a matéria da minha cadeira?',
      a: 'Sim. No MicroGrind carregas a tua sebenta, apontamentos ou slides, e são preparados quizzes, flashcards e simulações de exame a partir desse material.',
    },
  ],
};

for (const page of practicePages) {
  if (!PRACTICE_AREAS.some((a) => a.id === page.area)) throw new Error(`${page.slug}: unknown area ${page.area}`);
  for (const slug of page.related) {
    if (!practicePages.some((p) => p.slug === slug)) throw new Error(`${page.slug}: related page ${slug} does not exist`);
  }
}
