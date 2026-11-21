/**
 * English practice pages (/en/practice/<slug>/) and their hub (/en/practice/).
 * They are translations of the /praticar/ pages whose subject is not specific to Portugal
 * (no Portuguese law, SNC accounting or national exams). Each page has `ptSlug`, the slug of the
 * Portuguese page it pairs with for hreflang and the language switch.
 */
import { normaliseQuiz, practicePages } from '../practice/index.mjs';
import { limitsDerivatives, hypothesisTesting, normalDistribution } from './statistics.mjs';
import { macroeconomics, microeconomics } from './economics.mjs';
import { anatomy, biochemistry, pharmacology, physiology } from './life-sciences.mjs';
import { developmentalPsychology } from './psychology.mjs';

export const PRACTICE_AREAS_EN = [
  { id: 'statistics', label: 'Maths and statistics' },
  { id: 'economics', label: 'Economics' },
  { id: 'life-sciences', label: 'Life sciences' },
  { id: 'psychology', label: 'Psychology' },
];

const PAGES = [
  normalDistribution,
  hypothesisTesting,
  limitsDerivatives,
  microeconomics,
  macroeconomics,
  anatomy,
  physiology,
  biochemistry,
  pharmacology,
  developmentalPsychology,
];

export const practicePagesEn = PAGES.map((page) => ({ ...(page.mode === 'quiz' ? normaliseQuiz(page) : page), locale: 'en' }));

export const PRACTICE_HUB_EN = {
  path: '/en/practice/',
  ptPath: '/praticar/',
  kicker: 'Practice',
  title: 'Free exam practice questions and flashcards | MicroGrind',
  description: 'Free practice questions and flashcards for statistics, calculus, economics, anatomy, physiology, biochemistry and more, each with the answer explained.',
  h1: 'Free exam practice, by subject',
  lede: 'Multiple-choice practice tests and flashcards, with every answer explained. Pick a page and start now, no account needed.',
  faqs: [
    {
      q: 'Do I need an account for the practice tests?',
      a: 'No. Every practice page is free and works without signing up. You only need an account to create questions from your own notes in MicroGrind.',
    },
    {
      q: 'Can I get questions on my own course material?',
      a: 'Yes. In MicroGrind you upload your notes, textbook or slides, and the app builds a Subject Map with quizzes, flashcards and mock exams from that material.',
    },
  ],
};

for (const page of practicePagesEn) {
  if (!PRACTICE_AREAS_EN.some((a) => a.id === page.area)) throw new Error(`${page.slug}: unknown area ${page.area}`);
  if (!practicePages.some((p) => p.slug === page.ptSlug)) throw new Error(`${page.slug}: Portuguese page ${page.ptSlug} does not exist`);
  for (const slug of page.related) {
    if (!practicePagesEn.some((p) => p.slug === slug)) throw new Error(`${page.slug}: related page ${slug} does not exist`);
  }
  const source = practicePages.find((p) => p.slug === page.ptSlug);
  if (source.items.length !== page.items.length) throw new Error(`${page.slug}: ${page.items.length} items, the Portuguese page has ${source.items.length}`);
}
