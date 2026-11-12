/**
 * Shareable links to each study mode on the homepage, e.g. microgrind.app/#tutor.
 * The map is its own section. The other modes are tabs in #funcionalidades / #features:
 * mg.js opens the matching tab when the page loads with one of these hashes.
 */
export const FEATURE_ANCHORS = {
  pt: { map: 'mapa', lessons: 'licoes', flashcards: 'flashcards', quiz: 'quizzes', exam: 'simulacao-exame', tutor: 'tutor' },
  en: { map: 'subject-map', lessons: 'lessons', flashcards: 'flashcards', quiz: 'quizzes', exam: 'mock-exams', tutor: 'tutor' },
};

export function featureHref(locale, key) {
  return `${locale === 'en' ? '/en/' : '/'}#${FEATURE_ANCHORS[locale][key]}`;
}
