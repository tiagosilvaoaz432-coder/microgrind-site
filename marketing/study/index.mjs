/**
 * "Como estudar X" guides (/estudar/<slug>/) and the hub (/estudar/), for searches like
 * "estudar direito penal" or "como estudar estatística".
 *
 * Guide schema: slug, subject, level, title, description, h1, lede,
 *   topics: [[name, text]], plan: [[week, text]] (4), method: [paragraph], mistakes: [text],
 *   practice: { slug, take } (embed the first `take` items of a /praticar/ page)
 *     or quiz: { mode: 'quiz', items: [{ q, right, wrong: [3], why }] },
 *   practiceLinks: [/praticar/ slugs], related: [/estudar/ slugs], faqs: [{ q, a }].
 */
import { normaliseQuiz, practicePages } from '../practice/index.mjs';
import { civil, constitucional, penal } from './direito.mjs';
import { calculo, estatistica, fisicaQuimica, matematica } from './exatas.mjs';
import { anatomia, bioGeo, bioquimica, contabilidade, economia, historia, portugues } from './outras.mjs';

export const STUDY_GROUPS = [
  { id: 'superior', label: 'Ensino superior', slugs: ['direito-penal', 'direito-constitucional', 'direito-civil', 'estatistica', 'calculo', 'economia', 'contabilidade', 'anatomia', 'bioquimica'] },
  { id: 'secundario', label: 'Ensino secundário (exames nacionais)', slugs: ['matematica', 'fisica-quimica', 'biologia-geologia', 'portugues', 'historia'] },
];

const GUIDES = [penal, constitucional, civil, estatistica, matematica, calculo, economia, contabilidade, anatomia, bioquimica, bioGeo, fisicaQuimica, portugues, historia];

function miniTest(guide) {
  if (guide.practice) {
    const source = practicePages.find((p) => p.slug === guide.practice.slug);
    if (!source) throw new Error(`${guide.slug}: practice page ${guide.practice.slug} does not exist`);
    return { slug: guide.slug, mode: source.mode, items: source.items.slice(0, guide.practice.take), source: source.slug };
  }
  const quiz = normaliseQuiz({ slug: guide.slug, mode: 'quiz', items: guide.quiz.items });
  return { slug: guide.slug, mode: 'quiz', items: quiz.items, source: null };
}

export const studyGuides = GUIDES.map((guide) => {
  const test = miniTest(guide);
  return {
    ...guide,
    kicker: guide.subject,
    test: { ...test, practiceHeading: `Mini-teste de ${guide.subject}` },
  };
});

export const STUDY_HUB = {
  path: '/estudar/',
  kicker: 'Como estudar',
  title: 'Como estudar cada disciplina: guias grátis com plano e mini-teste | MicroGrind',
  description: 'Guias grátis de como estudar Direito, Estatística, Matemática, Economia, Anatomia, Português, História e mais: o que estudar, plano e mini-teste.',
  h1: 'Como estudar a tua disciplina',
  lede: 'Guias práticos por disciplina: o que estudar e por que ordem, um plano de 4 semanas, os erros mais comuns e um mini-teste para começares já.',
  faqs: [
    { q: 'Os guias são gratuitos?', a: 'Sim. Todos os guias e mini-testes são gratuitos e não precisam de conta.' },
    { q: 'Posso estudar a matéria exata da minha cadeira?', a: 'Sim. No MicroGrind carregas a tua sebenta, apontamentos ou slides, e a app monta o mapa da matéria e prepara sessões de estudo, flashcards e quizzes a partir desse material.' },
  ],
};

for (const guide of studyGuides) {
  for (const slug of guide.related) if (!studyGuides.some((g) => g.slug === slug)) throw new Error(`${guide.slug}: related guide ${slug} does not exist`);
  for (const slug of guide.practiceLinks) if (!practicePages.some((p) => p.slug === slug)) throw new Error(`${guide.slug}: practice link ${slug} does not exist`);
  if (!STUDY_GROUPS.some((g) => g.slugs.includes(guide.slug))) throw new Error(`${guide.slug}: not in a hub group`);
}
