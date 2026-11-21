/**
 * English "How to study X" guides (/en/study/<slug>/) and their hub (/en/study/).
 * Translations of the /estudar/ guides whose subject is not specific to Portugal. Each guide has
 * `ptSlug`, the Portuguese guide it pairs with for hreflang and the language switch.
 * Same schema as study/index.mjs; `practice.slug` points at an English practice page.
 */
import { practicePagesEn } from '../practice-en/index.mjs';
import { studyGuides } from '../study/index.mjs';
import { anatomyGuide, biochemistryGuide, calculus, economics, statistics } from './guides.mjs';

export const STUDY_GROUPS_EN = [{ id: 'higher', label: 'Higher education', slugs: ['statistics', 'calculus', 'economics', 'anatomy', 'biochemistry'] }];

const GUIDES = [statistics, calculus, economics, anatomyGuide, biochemistryGuide];

function miniTest(guide) {
  const source = practicePagesEn.find((p) => p.slug === guide.practice?.slug);
  if (!source) throw new Error(`${guide.slug}: English practice page ${guide.practice?.slug} does not exist`);
  return { slug: guide.slug, mode: source.mode, items: source.items.slice(0, guide.practice.take), source: source.slug, locale: 'en' };
}

export const studyGuidesEn = GUIDES.map((guide) => ({
  ...guide,
  locale: 'en',
  kicker: guide.subject,
  test: { ...miniTest(guide), practiceHeading: `${guide.subject} mini-test` },
}));

export const STUDY_HUB_EN = {
  path: '/en/study/',
  ptPath: '/estudar/',
  kicker: 'How to study',
  title: 'How to study each subject: free guides | MicroGrind',
  description: 'Free guides on how to study statistics, calculus, economics, anatomy and biochemistry: what to study first, a 4-week plan and a mini-test.',
  h1: 'How to study your subject',
  lede: 'Practical guides by subject: what to study and in what order, a 4-week plan, the most common mistakes and a mini-test to start with.',
  faqs: [
    { q: 'Are the guides free?', a: 'Yes. All guides and mini-tests are free and need no account.' },
    {
      q: 'Can I study the exact material from my course?',
      a: 'Yes. In MicroGrind you upload your notes, textbook or slides, and the app builds a Subject Map and prepares study sessions, flashcards and quizzes from that material.',
    },
  ],
};

for (const guide of studyGuidesEn) {
  if (!studyGuides.some((g) => g.slug === guide.ptSlug)) throw new Error(`${guide.slug}: Portuguese guide ${guide.ptSlug} does not exist`);
  for (const slug of guide.related) if (!studyGuidesEn.some((g) => g.slug === slug)) throw new Error(`${guide.slug}: related guide ${slug} does not exist`);
  for (const slug of guide.practiceLinks) if (!practicePagesEn.some((p) => p.slug === slug)) throw new Error(`${guide.slug}: practice link ${slug} does not exist`);
  if (!STUDY_GROUPS_EN.some((g) => g.slugs.includes(guide.slug))) throw new Error(`${guide.slug}: not in a hub group`);
}
