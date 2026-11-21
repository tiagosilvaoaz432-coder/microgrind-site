/**
 * Free practice pages, in Portuguese (/praticar/ hub and /praticar/<slug>/) and English
 * (/en/practice/ hub and /en/practice/<slug>/): one quiz or flashcard deck each.
 *
 * Every question, option, answer and explanation is in the HTML, so the page is indexable and
 * works without JavaScript. practice.js turns it into a one-at-a-time quiz / flashcard deck.
 * Content lives in practice/*.mjs (PT) and practice-en/*.mjs (EN); this file only renders it.
 * A page's language is `page.locale` ('en'), Portuguese otherwise. English pages carry `ptSlug`,
 * which pairs them with a Portuguese page for hreflang and the language switch.
 */
import { assetUrl } from './assets.mjs';
import { esc, headAssets, renderCookieBanner, renderFooter, renderHeader, renderInstallDialog } from './chrome.mjs';
import { ORIGIN, REGISTER_URL } from './content.mjs';
import { closingBand } from './page-layout.mjs';
import { absolute, jsonLd } from './render.mjs';
import { ogImageTags, ogImageUrl } from './og.mjs';
import { ga4HeadSnippet } from '../lib/ga4.mjs';
import { PRACTICE_AREAS, PRACTICE_HUB, practicePages } from './practice/index.mjs';
import { PRACTICE_AREAS_EN, PRACTICE_HUB_EN, practicePagesEn } from './practice-en/index.mjs';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const ARROW =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>';

/** Interface text of the practice and study pages. */
export const PRACTICE_TEXT = {
  pt: {
    lang: 'pt-PT',
    ogLocale: 'pt_PT',
    home: 'Início',
    homePath: '/',
    question: (i, n) => `Pergunta ${i} de ${n}`,
    card: (i, n) => `Cartão ${i} de ${n}`,
    questionId: 'pergunta',
    cardId: 'cartao',
    showAnswer: 'Ver resposta',
    rightAnswer: 'Resposta certa',
    hintCards: 'Lê a pergunta, tenta responder de cabeça e abre a resposta.',
    hintQuiz: 'Escolhe uma opção em cada pergunta e abre a resposta para confirmar.',
    restart: 'Recomeçar',
    ctaNoun: (mode, n) => (mode === 'flashcards' ? `Estes ${n} cartões são` : `Estas ${n} perguntas são`),
    ctaTitle: 'Cria perguntas a partir dos teus próprios apontamentos com o MicroGrind',
    ctaTitleFinal: 'Agora com a tua matéria',
    ctaBody: (noun) => `${noun} um exemplo genérico. No MicroGrind, as perguntas saem do teu material, em sessões curtas.`,
    ctaBodyFinal: 'Carrega a tua sebenta, apontamentos ou slides. O MicroGrind monta o mapa da matéria e prepara quizzes, flashcards e simulações de exame com o que tens de estudar.',
    ctaButton: 'Experimentar o MicroGrind grátis',
    utmSource: 'praticar',
    faqTitle: 'Perguntas frequentes',
    relatedTitle: 'Pratica outras disciplinas',
    allPractice: 'Ver todas as páginas de prática',
    disclaimer: 'Perguntas de exemplo, de nível introdutório, para treino. Confirma sempre com o programa e a bibliografia da tua cadeira.',
    countCards: (n) => `${n} flashcards`,
    countQuestions: (n) => `${n} perguntas`,
    hubToStudy: 'Queres um plano de estudo? Vê os guias de como estudar cada disciplina →',
    studyHubPath: '/estudar/',
  },
  en: {
    lang: 'en',
    ogLocale: 'en_GB',
    home: 'Home',
    homePath: '/en/',
    question: (i, n) => `Question ${i} of ${n}`,
    card: (i, n) => `Card ${i} of ${n}`,
    questionId: 'question',
    cardId: 'card',
    showAnswer: 'Show answer',
    rightAnswer: 'Correct answer',
    hintCards: 'Read the question, try to answer from memory, then open the answer.',
    hintQuiz: 'Pick an option for each question, then open the answer to check.',
    restart: 'Start again',
    ctaNoun: (mode, n) => (mode === 'flashcards' ? `These ${n} cards are` : `These ${n} questions are`),
    ctaTitle: 'Create questions from your own notes with MicroGrind',
    ctaTitleFinal: 'Now with your own material',
    ctaBody: (noun) => `${noun} a generic example. In MicroGrind, the questions come from your own material, in short sessions.`,
    ctaBodyFinal: 'Upload your notes, textbook or slides. MicroGrind builds a Subject Map and prepares quizzes, flashcards and mock exams from what you need to study.',
    ctaButton: 'Try MicroGrind for free',
    utmSource: 'practice',
    faqTitle: 'Common questions',
    relatedTitle: 'Practise other subjects',
    allPractice: 'See all practice pages',
    disclaimer: 'Sample questions at an introductory level, for practice. Always check your course syllabus and reading list.',
    countCards: (n) => `${n} flashcards`,
    countQuestions: (n) => `${n} questions`,
    hubToStudy: 'Want a study plan? See the guides on how to study each subject →',
    studyHubPath: '/en/study/',
  },
};

export function localeOf(page) {
  return page?.locale === 'en' ? 'en' : 'pt';
}

export function textFor(page) {
  return PRACTICE_TEXT[localeOf(page)];
}

export function practiceHub(locale) {
  return locale === 'en' ? PRACTICE_HUB_EN : PRACTICE_HUB;
}

function pagesFor(locale) {
  return locale === 'en' ? practicePagesEn : practicePages;
}

export function practicePath(page) {
  return localeOf(page) === 'en' ? `/en/practice/${page.slug}/` : `/praticar/${page.slug}/`;
}

/** The page in the other language, if there is one: { pt, en } paths, or null. */
export function practicePair(page) {
  if (localeOf(page) === 'en') {
    const pt = practicePages.find((p) => p.slug === page.ptSlug);
    return pt ? { pt: practicePath(pt), en: practicePath(page) } : null;
  }
  const en = practicePagesEn.find((p) => p.ptSlug === page.slug);
  return en ? { pt: practicePath(page), en: practicePath(en) } : null;
}

/** Sign-up link with the campaign that brought the student in. */
export function registerHref(campaign, locale = 'pt') {
  const params = new URLSearchParams({ utm_source: PRACTICE_TEXT[locale].utmSource, utm_medium: 'seo', utm_campaign: campaign });
  return `${REGISTER_URL}?${params}`;
}

/** hreflang links: a lone page points at itself; a paired page lists both languages. */
function alternateLinks(path, locale, pair) {
  if (!pair) {
    const lang = PRACTICE_TEXT[locale].lang;
    return `<link rel="alternate" hreflang="${lang}" href="${absolute(path)}">
<link rel="alternate" hreflang="x-default" href="${absolute(path)}">`;
  }
  return `<link rel="alternate" hreflang="pt-PT" href="${absolute(pair.pt)}">
<link rel="alternate" hreflang="en" href="${absolute(pair.en)}">
<link rel="alternate" hreflang="x-default" href="${absolute(pair.pt)}">`;
}

export function head({ path, title, description, ld, analytics, locale = 'pt', pair = null }) {
  const t = PRACTICE_TEXT[locale];
  const alternateOg = pair ? `\n<meta property="og:locale:alternate" content="${locale === 'en' ? 'pt_PT' : 'en_GB'}">` : '';
  return `<!DOCTYPE html>
<html lang="${t.lang}">
<head>
${analytics ? ga4HeadSnippet() : ''}<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${absolute(path)}">
${alternateLinks(path, locale, pair)}
<meta property="og:site_name" content="MicroGrind">
<meta property="og:type" content="website">
<meta property="og:locale" content="${t.ogLocale}">${alternateOg}
<meta property="og:url" content="${absolute(path)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${ogImageTags(path, title, esc)}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ogImageUrl(path)}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<meta name="theme-color" content="#07090d">
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script>document.documentElement.classList.add('js');</script>
${headAssets(['/marketing.css'])}
<link rel="stylesheet" href="${assetUrl('practice.css')}">
<script src="${assetUrl('practice.js')}" defer></script>
</head>`;
}

export function hero({ crumbs, kicker, h1, lede }) {
  const list = crumbs
    .map((c, i) => (i === crumbs.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="${c.path}">${esc(c.name)}</a></li>`))
    .join('');
  return `<header class="ph is-plain ph-kind-practice">
<div class="ph-bg" aria-hidden="true"><div class="mg-aurora mg-aurora-a"></div><div class="mg-aurora mg-aurora-b"></div><div class="mg-grid-paper"></div></div>
<div class="wrap ph-grid">
<div class="ph-copy">
<nav class="ph-crumbs" aria-label="Breadcrumb"><ol>${list}</ol></nav>
<p class="kicker">${esc(kicker)}</p>
<h1>${esc(h1)}</h1>
<p class="lede">${esc(lede)}</p>
</div>
</div>
</header>`;
}

/**
 * Whole page. `pair` ({ pt, en } or null) sets the hreflang links and where the language switch goes;
 * without a pair the switch goes to the other language's homepage.
 */
export function shell({ path, title, description, ld, analytics, body, locale = 'pt', pair = null }) {
  const otherPath = pair ? (locale === 'en' ? pair.pt : pair.en) : locale === 'en' ? '/' : '/en/';
  return `${head({ path, title, description, ld, analytics, locale, pair })}
<body class="mg-page mg-page-practice">
${renderHeader({ locale, otherPath, currentPath: path })}
<main id="conteudo" tabindex="-1">
${body}
</main>
${renderFooter({ locale })}
${renderInstallDialog(locale)}
${renderCookieBanner(locale)}
</body>
</html>
`;
}

function renderQuizItem(item, index, total, t) {
  const options = item.options
    .map(
      (option, i) =>
        `<li class="pq-option"${i === item.answer ? ' data-correct' : ''}><span class="pq-letter" aria-hidden="true">${LETTERS[i]}</span><span class="pq-option-text">${esc(option)}</span></li>`
    )
    .join('');
  return `<li class="pq-item" data-item id="${t.questionId}-${index + 1}">
<p class="pq-count">${t.question(index + 1, total)}</p>
<h3 class="pq-q">${esc(item.q)}</h3>
<ol class="pq-options" type="A">${options}</ol>
<details class="pq-answer" data-answer><summary>${t.showAnswer}</summary><p><strong>${t.rightAnswer}: ${LETTERS[item.answer]}) ${esc(item.options[item.answer])}.</strong> ${esc(item.why)}</p></details>
</li>`;
}

function renderCardItem(item, index, total, t) {
  return `<li class="pq-item pq-card" data-item id="${t.cardId}-${index + 1}">
<p class="pq-count">${t.card(index + 1, total)}</p>
<h3 class="pq-q pq-front">${esc(item.front)}</h3>
<details class="pq-answer pq-back" data-answer><summary>${t.showAnswer}</summary><p>${esc(item.back)}</p></details>
</li>`;
}

export function ctaBlock(page, { id, final = false }) {
  const t = textFor(page);
  const h = final ? t.ctaTitleFinal : t.ctaTitle;
  const p = final ? t.ctaBodyFinal : t.ctaBody(t.ctaNoun(page.mode, page.items.length));
  return `<aside class="pq-cta mg-glass" id="${id}" aria-labelledby="${id}-h">
<p class="pq-cta-h" id="${id}-h">${esc(h)}</p>
<p>${esc(p)}</p>
<a class="btn btn-shine" href="${esc(registerHref(page.slug, localeOf(page)))}" data-practice-cta>${esc(t.ctaButton)}${ARROW}</a>
</aside>`;
}

export function practiceLd(page) {
  const path = practicePath(page);
  const locale = localeOf(page);
  const t = PRACTICE_TEXT[locale];
  const hub = practiceHub(locale);
  const base = jsonLd({
    locale,
    path,
    title: page.title,
    description: page.description,
    faqs: page.faqs,
    breadcrumbs: [
      { name: t.home, path: t.homePath },
      { name: hub.kicker, path: hub.path },
      { name: page.kicker, path },
    ],
  });
  const resource = {
    '@type': page.mode === 'flashcards' ? 'LearningResource' : ['LearningResource', 'Quiz'],
    '@id': `${absolute(path)}#practice`,
    name: page.h1,
    description: page.description,
    url: absolute(path),
    inLanguage: t.lang,
    isAccessibleForFree: true,
    learningResourceType: page.mode === 'flashcards' ? 'Flashcards' : 'Quiz',
    educationalLevel: page.level,
    about: { '@type': 'Thing', name: page.subject },
    keywords: page.keywords.join(', '),
    publisher: { '@id': `${ORIGIN}/#org` },
  };
  if (page.mode === 'quiz') {
    resource.hasPart = page.items.map((item, i) => ({
      '@type': 'Question',
      name: item.q,
      position: i + 1,
      eduQuestionType: 'Multiple choice',
      acceptedAnswer: { '@type': 'Answer', text: item.options[item.answer] },
      suggestedAnswer: item.options.filter((_, j) => j !== item.answer).map((text) => ({ '@type': 'Answer', text })),
    }));
  }
  base['@graph'].push(resource);
  return base;
}

/** The interactive quiz / flashcard block (practice.js). `page` needs slug, mode, items, practiceHeading and locale. */
export function practiceSection(page) {
  const t = textFor(page);
  const total = page.items.length;
  const items = page.items.map((item, i) => (page.mode === 'flashcards' ? renderCardItem(item, i, total, t) : renderQuizItem(item, i, total, t))).join('\n');
  const modeLabel = page.mode === 'flashcards' ? 'flashcards' : 'quiz';
  return `<section class="pq-practice" aria-labelledby="pq-practice-h" data-practice="${modeLabel}" data-slug="${esc(page.slug)}">
<h2 id="pq-practice-h" class="pq-h2">${esc(page.practiceHeading)}</h2>
<p class="pq-hint" data-practice-hint>${page.mode === 'flashcards' ? t.hintCards : t.hintQuiz}</p>
<ol class="pq-list" data-practice-list>
${items}
</ol>
<div class="pq-result" data-practice-result hidden tabindex="-1">
<p class="pq-score" data-practice-score aria-live="polite"></p>
<p class="pq-score-note" data-practice-note></p>
<div class="pq-review" data-practice-review></div>
${ctaBlock(page, { id: 'pq-cta-final', final: true })}
<button class="btn btn-ghost btn-sm" type="button" data-practice-restart>${t.restart}</button>
</div>
<p class="pq-sr" aria-live="polite" data-practice-live></p>
</section>`;
}

export function renderPracticePage(page, { analytics = true } = {}) {
  const locale = localeOf(page);
  const t = PRACTICE_TEXT[locale];
  const hub = practiceHub(locale);
  const path = practicePath(page);
  const how = page.howTo.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n');
  const faqs = page.faqs.map((f) => `<details class="pq-faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n');
  const related = page.related
    .map((slug) => pagesFor(locale).find((p) => p.slug === slug))
    .filter(Boolean)
    .map((p) => `<li><a href="${practicePath(p)}">${esc(p.h1)}</a></li>`)
    .join('');
  const body = `${hero({
    crumbs: [
      { name: t.home, path: t.homePath },
      { name: hub.kicker, path: hub.path },
      { name: page.kicker, path },
    ],
    kicker: page.kicker,
    h1: page.h1,
    lede: page.lede,
  })}
<div class="wrap pq-body">
${practiceSection(page)}
${ctaBlock(page, { id: 'pq-cta' })}
<section class="pq-guide" aria-labelledby="pq-guide-h">
<h2 id="pq-guide-h" class="pq-h2">${esc(page.howTo.h2)}</h2>
${how}
</section>
<section class="pq-faqs" aria-labelledby="pq-faq-h">
<h2 id="pq-faq-h" class="pq-h2">${t.faqTitle}</h2>
${faqs}
</section>
${related ? `<nav class="pq-related" aria-labelledby="pq-related-h"><h2 id="pq-related-h" class="pq-h2">${t.relatedTitle}</h2><ul>${related}</ul><p><a href="${hub.path}">${t.allPractice}</a></p></nav>` : ''}
<p class="pq-disclaimer">${t.disclaimer}</p>
</div>
${closingBand(locale)}`;
  return shell({ path, title: page.title, description: page.description, ld: practiceLd(page), analytics, body, locale, pair: practicePair(page) });
}

export function renderPracticeHub({ analytics = true, locale = 'pt' } = {}) {
  const t = PRACTICE_TEXT[locale];
  const hub = practiceHub(locale);
  const pages = pagesFor(locale);
  const path = hub.path;
  const areas = locale === 'en' ? PRACTICE_AREAS_EN : PRACTICE_AREAS;
  const groups = areas.map((area) => {
    const cards = pages
      .filter((p) => p.area === area.id)
      .map(
        (p) =>
          `<li><a class="pq-hub-card mg-glass" href="${practicePath(p)}"><span class="kicker">${p.mode === 'flashcards' ? t.countCards(p.items.length) : t.countQuestions(p.items.length)}</span><b>${esc(p.h1)}</b><span class="pq-hub-blurb">${esc(p.lede)}</span></a></li>`
      )
      .join('');
    return `<section class="pq-hub-group" aria-labelledby="pq-area-${area.id}"><h2 class="pq-h2" id="pq-area-${area.id}">${esc(area.label)}</h2><ul class="pq-hub-grid">${cards}</ul></section>`;
  }).join('\n');
  const ld = jsonLd({
    locale,
    path,
    title: hub.title,
    description: hub.description,
    faqs: hub.faqs,
    breadcrumbs: [
      { name: t.home, path: t.homePath },
      { name: hub.kicker, path },
    ],
  });
  ld['@graph'].push({
    '@type': 'ItemList',
    '@id': `${absolute(path)}#list`,
    itemListElement: pages.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(practicePath(p)), name: p.h1 })),
  });
  const faqs = hub.faqs.map((f) => `<details class="pq-faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n');
  const body = `${hero({
    crumbs: [
      { name: t.home, path: t.homePath },
      { name: hub.kicker, path },
    ],
    kicker: hub.kicker,
    h1: hub.h1,
    lede: hub.lede,
  })}
<div class="wrap pq-body pq-hub">
${groups}
<p><a href="${t.studyHubPath}">${t.hubToStudy}</a></p>
<section class="pq-faqs" aria-labelledby="pq-faq-h"><h2 id="pq-faq-h" class="pq-h2">${t.faqTitle}</h2>
${faqs}
</section>
</div>
${closingBand(locale)}`;
  const pair = { pt: PRACTICE_HUB.path, en: PRACTICE_HUB_EN.path };
  return shell({ path, title: hub.title, description: hub.description, ld, analytics, body, locale, pair });
}

/** One sitemap <url>: a lone page lists itself; a paired page lists both languages. */
export function sitemapEntry(path, lastmod, pair, locale) {
  const links = pair
    ? `    <xhtml:link rel="alternate" hreflang="pt-PT" href="${absolute(pair.pt)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${absolute(pair.en)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${absolute(pair.pt)}" />`
    : `    <xhtml:link rel="alternate" hreflang="${PRACTICE_TEXT[locale].lang}" href="${absolute(path)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${absolute(path)}" />`;
  return `  <url>
    <loc>${absolute(path)}</loc>
    <lastmod>${lastmod}</lastmod>
${links}
  </url>`;
}

/** Sitemap entries for the practice pages, both languages. */
export function practiceSitemapEntries(lastmodFor) {
  const hubPair = { pt: PRACTICE_HUB.path, en: PRACTICE_HUB_EN.path };
  return [
    sitemapEntry(PRACTICE_HUB.path, lastmodFor(PRACTICE_HUB.path), hubPair, 'pt'),
    ...practicePages.map((p) => sitemapEntry(practicePath(p), lastmodFor(practicePath(p)), practicePair(p), 'pt')),
    sitemapEntry(PRACTICE_HUB_EN.path, lastmodFor(PRACTICE_HUB_EN.path), hubPair, 'en'),
    ...practicePagesEn.map((p) => sitemapEntry(practicePath(p), lastmodFor(practicePath(p)), practicePair(p), 'en')),
  ];
}
