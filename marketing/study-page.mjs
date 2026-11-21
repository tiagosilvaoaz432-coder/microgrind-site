/**
 * "How to study X" guides, in Portuguese (/estudar/ hub and /estudar/<slug>/) and English
 * (/en/study/ hub and /en/study/<slug>/).
 * Reuses the practice-page chrome, the interactive mini-test (practice.js) and its styles.
 * Content lives in study/*.mjs (PT) and study-en/*.mjs (EN). English guides carry `ptSlug`.
 */
import { esc } from './chrome.mjs';
import { closingBand } from './page-layout.mjs';
import { absolute, jsonLd } from './render.mjs';
import { LASTMOD_TOKEN } from './lastmod.mjs';
import { ctaBlock, hero, localeOf, PRACTICE_TEXT, practiceHub, practicePath, practiceSection, shell, sitemapEntry } from './practice-page.mjs';
import { practicePages } from './practice/index.mjs';
import { practicePagesEn } from './practice-en/index.mjs';
import { STUDY_GROUPS, STUDY_HUB, studyGuides } from './study/index.mjs';
import { STUDY_GROUPS_EN, STUDY_HUB_EN, studyGuidesEn } from './study-en/index.mjs';
import { ORIGIN } from './content.mjs';

const TEXT = {
  pt: {
    resourceType: 'Guia de estudo',
    topics: (s) => `O que estudar em ${s}, por esta ordem`,
    plan: 'Plano de estudo de 4 semanas',
    fullTest: (s) => `Fazer o teste completo de ${s} →`,
    method: (s) => `Como estudar ${s} com método`,
    mistakes: 'Erros comuns no exame',
    practise: (s) => `Praticar ${s}`,
    otherGuides: 'Como estudar outras disciplinas',
    allGuides: 'Ver todos os guias',
    practiseFree: 'Praticar grátis',
    disclaimer: 'Guia geral de estudo. Confirma sempre o programa, a bibliografia e as regras de avaliação da tua cadeira ou do teu exame.',
    hubToPractice: 'Preferes começar por testar-te? Vê os mini-testes e flashcards grátis →',
  },
  en: {
    resourceType: 'Study guide',
    topics: (s) => `What to study in ${s}, in this order`,
    plan: 'A 4-week study plan',
    fullTest: (s) => `Take the full ${s} test →`,
    method: (s) => `How to study ${s} with a method`,
    mistakes: 'Common exam mistakes',
    practise: (s) => `Practise ${s}`,
    otherGuides: 'How to study other subjects',
    allGuides: 'See all guides',
    practiseFree: 'Practise for free',
    disclaimer: 'A general study guide. Always check your course syllabus, reading list and assessment rules.',
    hubToPractice: 'Rather test yourself first? See the free practice tests and flashcards →',
  },
};

export function studyHub(locale) {
  return locale === 'en' ? STUDY_HUB_EN : STUDY_HUB;
}

function guidesFor(locale) {
  return locale === 'en' ? studyGuidesEn : studyGuides;
}

export function studyPath(guide) {
  return localeOf(guide) === 'en' ? `/en/study/${guide.slug}/` : `/estudar/${guide.slug}/`;
}

/** The guide in the other language, if there is one: { pt, en } paths, or null. */
export function studyPair(guide) {
  if (localeOf(guide) === 'en') {
    const pt = studyGuides.find((g) => g.slug === guide.ptSlug);
    return pt ? { pt: studyPath(pt), en: studyPath(guide) } : null;
  }
  const en = studyGuidesEn.find((g) => g.ptSlug === guide.slug);
  return en ? { pt: studyPath(guide), en: studyPath(en) } : null;
}

function crumbs(guide, locale) {
  const t = PRACTICE_TEXT[locale];
  const hub = studyHub(locale);
  const list = [
    { name: t.home, path: t.homePath },
    { name: hub.kicker, path: hub.path },
  ];
  if (guide) list.push({ name: guide.subject, path: studyPath(guide) });
  return list;
}

export function studyLd(guide) {
  const locale = localeOf(guide);
  const path = studyPath(guide);
  const ld = jsonLd({ locale, path, title: guide.title, description: guide.description, faqs: guide.faqs, breadcrumbs: crumbs(guide, locale) });
  ld['@graph'].push({
    '@type': ['Article', 'LearningResource'],
    '@id': `${absolute(path)}#guide`,
    headline: guide.h1,
    name: guide.h1,
    description: guide.description,
    url: absolute(path),
    inLanguage: PRACTICE_TEXT[locale].lang,
    isAccessibleForFree: true,
    learningResourceType: TEXT[locale].resourceType,
    educationalLevel: guide.level,
    about: { '@type': 'Thing', name: guide.subject },
    dateModified: LASTMOD_TOKEN, // replaced with this page's date in build-seo-site.mjs
    author: { '@id': `${ORIGIN}/#org` },
    publisher: { '@id': `${ORIGIN}/#org` },
  });
  return ld;
}

export function renderStudyPage(guide, { analytics = true } = {}) {
  const locale = localeOf(guide);
  const t = TEXT[locale];
  const pt = PRACTICE_TEXT[locale];
  const path = studyPath(guide);
  const practiceList = locale === 'en' ? practicePagesEn : practicePages;
  const topics = guide.topics.map(([name, text]) => `<li><b>${esc(name)}.</b> ${esc(text)}</li>`).join('');
  const plan = guide.plan.map(([week, text]) => `<li><span class="sg-week">${esc(week)}</span><span>${esc(text)}</span></li>`).join('');
  const method = guide.method.map((p) => `<p>${esc(p)}</p>`).join('\n');
  const mistakes = guide.mistakes.map((m) => `<li>${esc(m)}</li>`).join('');
  const faqs = guide.faqs.map((f) => `<details class="pq-faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n');
  const practiceLinks = guide.practiceLinks
    .map((slug) => practiceList.find((p) => p.slug === slug))
    .map((p) => `<li><a href="${practicePath(p)}">${esc(p.h1)}</a> <span class="sg-muted">(${p.mode === 'flashcards' ? pt.countCards(p.items.length) : pt.countQuestions(p.items.length)})</span></li>`)
    .join('');
  const related = guide.related
    .map((slug) => guidesFor(locale).find((g) => g.slug === slug))
    .map((g) => `<li><a href="${studyPath(g)}">${esc(g.h1)}</a></li>`)
    .join('');
  const source = guide.test.source ? practiceList.find((p) => p.slug === guide.test.source) : null;
  const full = source ? `<p class="sg-full"><a href="${practicePath(source)}">${esc(t.fullTest(guide.subject))}</a></p>` : '';
  const hub = studyHub(locale);
  const body = `${hero({ crumbs: crumbs(guide, locale), kicker: hub.kicker, h1: guide.h1, lede: guide.lede })}
<div class="wrap pq-body sg-body">
<section aria-labelledby="sg-topics-h">
<h2 id="sg-topics-h" class="pq-h2">${esc(t.topics(guide.subject))}</h2>
<ol class="sg-topics">${topics}</ol>
</section>
<section aria-labelledby="sg-plan-h">
<h2 id="sg-plan-h" class="pq-h2">${t.plan}</h2>
<ol class="sg-plan">${plan}</ol>
</section>
${practiceSection(guide.test)}
${full}
<section class="pq-guide" aria-labelledby="sg-method-h">
<h2 id="sg-method-h" class="pq-h2">${esc(t.method(guide.subject))}</h2>
${method}
</section>
<section aria-labelledby="sg-mistakes-h">
<h2 id="sg-mistakes-h" class="pq-h2">${t.mistakes}</h2>
<ul class="sg-mistakes">${mistakes}</ul>
</section>
${ctaBlock(guide.test, { id: 'pq-cta' })}
${practiceLinks ? `<nav class="pq-related" aria-labelledby="sg-practice-h"><h2 id="sg-practice-h" class="pq-h2">${esc(t.practise(guide.subject))}</h2><ul>${practiceLinks}</ul></nav>` : ''}
<section class="pq-faqs" aria-labelledby="pq-faq-h">
<h2 id="pq-faq-h" class="pq-h2">${pt.faqTitle}</h2>
${faqs}
</section>
<nav class="pq-related" aria-labelledby="sg-related-h"><h2 id="sg-related-h" class="pq-h2">${t.otherGuides}</h2><ul>${related}</ul><p><a href="${hub.path}">${t.allGuides}</a> · <a href="${practiceHub(locale).path}">${t.practiseFree}</a></p></nav>
<p class="pq-disclaimer">${t.disclaimer}</p>
</div>
${closingBand(locale)}`;
  return shell({ path, title: guide.title, description: guide.description, ld: studyLd(guide), analytics, body, locale, pair: studyPair(guide) });
}

export function renderStudyHub({ analytics = true, locale = 'pt' } = {}) {
  const t = TEXT[locale];
  const pt = PRACTICE_TEXT[locale];
  const hub = studyHub(locale);
  const guides = guidesFor(locale);
  const path = hub.path;
  const groups = (locale === 'en' ? STUDY_GROUPS_EN : STUDY_GROUPS).map((group) => {
    const cards = group.slugs
      .map((slug) => guides.find((g) => g.slug === slug))
      .map((g) => `<li><a class="pq-hub-card mg-glass" href="${studyPath(g)}"><span class="kicker">${esc(g.level)}</span><b>${esc(g.h1)}</b><span class="pq-hub-blurb">${esc(g.lede)}</span></a></li>`)
      .join('');
    return `<section class="pq-hub-group" aria-labelledby="sg-group-${group.id}"><h2 class="pq-h2" id="sg-group-${group.id}">${esc(group.label)}</h2><ul class="pq-hub-grid">${cards}</ul></section>`;
  }).join('\n');
  const ld = jsonLd({ locale, path, title: hub.title, description: hub.description, faqs: hub.faqs, breadcrumbs: crumbs(null, locale) });
  ld['@graph'].push({
    '@type': 'ItemList',
    '@id': `${absolute(path)}#list`,
    itemListElement: guides.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(studyPath(g)), name: g.h1 })),
  });
  const faqs = hub.faqs.map((f) => `<details class="pq-faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n');
  const body = `${hero({ crumbs: crumbs(null, locale), kicker: hub.kicker, h1: hub.h1, lede: hub.lede })}
<div class="wrap pq-body pq-hub">
${groups}
<p><a href="${practiceHub(locale).path}">${t.hubToPractice}</a></p>
<section class="pq-faqs" aria-labelledby="pq-faq-h"><h2 id="pq-faq-h" class="pq-h2">${pt.faqTitle}</h2>
${faqs}
</section>
</div>
${closingBand(locale)}`;
  const pair = { pt: STUDY_HUB.path, en: STUDY_HUB_EN.path };
  return shell({ path, title: hub.title, description: hub.description, ld, analytics, body, locale, pair });
}

/** Sitemap entries for the guides, both languages. */
export function studySitemapEntries(lastmodFor) {
  const hubPair = { pt: STUDY_HUB.path, en: STUDY_HUB_EN.path };
  return [
    sitemapEntry(STUDY_HUB.path, lastmodFor(STUDY_HUB.path), hubPair, 'pt'),
    ...studyGuides.map((g) => sitemapEntry(studyPath(g), lastmodFor(studyPath(g)), studyPair(g), 'pt')),
    sitemapEntry(STUDY_HUB_EN.path, lastmodFor(STUDY_HUB_EN.path), hubPair, 'en'),
    ...studyGuidesEn.map((g) => sitemapEntry(studyPath(g), lastmodFor(studyPath(g)), studyPair(g), 'en')),
  ];
}
