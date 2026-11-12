/**
 * "Como estudar X" guides: /estudar/ (hub) and /estudar/<slug>/.
 * Reuses the practice-page chrome, the interactive mini-test (practice.js) and its styles.
 * Content lives in study/*.mjs.
 */
import { esc } from './chrome.mjs';
import { closingBand } from './page-layout.mjs';
import { absolute, jsonLd } from './render.mjs';
import { ctaBlock, hero, practicePath, practiceSection, shell, PRACTICE_LASTMOD } from './practice-page.mjs';
import { PRACTICE_HUB, practicePages } from './practice/index.mjs';
import { STUDY_GROUPS, STUDY_HUB, studyGuides } from './study/index.mjs';
import { ORIGIN } from './content.mjs';

export function studyPath(guide) {
  return `/estudar/${guide.slug}/`;
}

function crumbs(guide) {
  const list = [
    { name: 'Início', path: '/' },
    { name: STUDY_HUB.kicker, path: STUDY_HUB.path },
  ];
  if (guide) list.push({ name: guide.subject, path: studyPath(guide) });
  return list;
}

export function studyLd(guide) {
  const path = studyPath(guide);
  const ld = jsonLd({ locale: 'pt', path, title: guide.title, description: guide.description, faqs: guide.faqs, breadcrumbs: crumbs(guide) });
  ld['@graph'].push({
    '@type': ['Article', 'LearningResource'],
    '@id': `${absolute(path)}#guide`,
    headline: guide.h1,
    name: guide.h1,
    description: guide.description,
    url: absolute(path),
    inLanguage: 'pt-PT',
    isAccessibleForFree: true,
    learningResourceType: 'Guia de estudo',
    educationalLevel: guide.level,
    about: { '@type': 'Thing', name: guide.subject },
    dateModified: PRACTICE_LASTMOD,
    author: { '@id': `${ORIGIN}/#org` },
    publisher: { '@id': `${ORIGIN}/#org` },
  });
  return ld;
}

export function renderStudyPage(guide, { analytics = true } = {}) {
  const path = studyPath(guide);
  const topics = guide.topics.map(([name, text]) => `<li><b>${esc(name)}.</b> ${esc(text)}</li>`).join('');
  const plan = guide.plan.map(([week, text]) => `<li><span class="sg-week">${esc(week)}</span><span>${esc(text)}</span></li>`).join('');
  const method = guide.method.map((p) => `<p>${esc(p)}</p>`).join('\n');
  const mistakes = guide.mistakes.map((m) => `<li>${esc(m)}</li>`).join('');
  const faqs = guide.faqs.map((f) => `<details class="pq-faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n');
  const practiceLinks = guide.practiceLinks
    .map((slug) => practicePages.find((p) => p.slug === slug))
    .map((p) => `<li><a href="${practicePath(p)}">${esc(p.h1)}</a> <span class="sg-muted">(${p.mode === 'flashcards' ? `${p.items.length} flashcards` : `${p.items.length} perguntas`})</span></li>`)
    .join('');
  const related = guide.related
    .map((slug) => studyGuides.find((g) => g.slug === slug))
    .map((g) => `<li><a href="${studyPath(g)}">${esc(g.h1)}</a></li>`)
    .join('');
  const full = guide.test.source
    ? `<p class="sg-full"><a href="/praticar/${guide.test.source}/">Fazer o teste completo de ${esc(guide.subject)} →</a></p>`
    : '';
  const body = `${hero({ crumbs: crumbs(guide), kicker: STUDY_HUB.kicker, h1: guide.h1, lede: guide.lede })}
<div class="wrap pq-body sg-body">
<section aria-labelledby="sg-topics-h">
<h2 id="sg-topics-h" class="pq-h2">O que estudar em ${esc(guide.subject)}, por esta ordem</h2>
<ol class="sg-topics">${topics}</ol>
</section>
<section aria-labelledby="sg-plan-h">
<h2 id="sg-plan-h" class="pq-h2">Plano de estudo de 4 semanas</h2>
<ol class="sg-plan">${plan}</ol>
</section>
${practiceSection(guide.test)}
${full}
<section class="pq-guide" aria-labelledby="sg-method-h">
<h2 id="sg-method-h" class="pq-h2">Como estudar ${esc(guide.subject)} com método</h2>
${method}
</section>
<section aria-labelledby="sg-mistakes-h">
<h2 id="sg-mistakes-h" class="pq-h2">Erros comuns no exame</h2>
<ul class="sg-mistakes">${mistakes}</ul>
</section>
${ctaBlock(guide.test, { id: 'pq-cta' })}
${practiceLinks ? `<nav class="pq-related" aria-labelledby="sg-practice-h"><h2 id="sg-practice-h" class="pq-h2">Praticar ${esc(guide.subject)}</h2><ul>${practiceLinks}</ul></nav>` : ''}
<section class="pq-faqs" aria-labelledby="pq-faq-h">
<h2 id="pq-faq-h" class="pq-h2">Perguntas frequentes</h2>
${faqs}
</section>
<nav class="pq-related" aria-labelledby="sg-related-h"><h2 id="sg-related-h" class="pq-h2">Como estudar outras disciplinas</h2><ul>${related}</ul><p><a href="${STUDY_HUB.path}">Ver todos os guias</a> · <a href="${PRACTICE_HUB.path}">Praticar grátis</a></p></nav>
<p class="pq-disclaimer">Guia geral de estudo. Confirma sempre o programa, a bibliografia e as regras de avaliação da tua cadeira ou do teu exame.</p>
</div>
${closingBand('pt')}`;
  return shell({ path, title: guide.title, description: guide.description, ld: studyLd(guide), analytics, body });
}

export function renderStudyHub({ analytics = true } = {}) {
  const path = STUDY_HUB.path;
  const groups = STUDY_GROUPS.map((group) => {
    const cards = group.slugs
      .map((slug) => studyGuides.find((g) => g.slug === slug))
      .map((g) => `<li><a class="pq-hub-card mg-glass" href="${studyPath(g)}"><span class="kicker">${esc(g.level)}</span><b>${esc(g.h1)}</b><span class="pq-hub-blurb">${esc(g.lede)}</span></a></li>`)
      .join('');
    return `<section class="pq-hub-group" aria-labelledby="sg-group-${group.id}"><h2 class="pq-h2" id="sg-group-${group.id}">${esc(group.label)}</h2><ul class="pq-hub-grid">${cards}</ul></section>`;
  }).join('\n');
  const ld = jsonLd({ locale: 'pt', path, title: STUDY_HUB.title, description: STUDY_HUB.description, faqs: STUDY_HUB.faqs, breadcrumbs: crumbs(null) });
  ld['@graph'].push({
    '@type': 'ItemList',
    '@id': `${absolute(path)}#list`,
    itemListElement: studyGuides.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(studyPath(g)), name: g.h1 })),
  });
  const faqs = STUDY_HUB.faqs.map((f) => `<details class="pq-faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n');
  const body = `${hero({ crumbs: crumbs(null), kicker: STUDY_HUB.kicker, h1: STUDY_HUB.h1, lede: STUDY_HUB.lede })}
<div class="wrap pq-body pq-hub">
${groups}
<p><a href="${PRACTICE_HUB.path}">Preferes começar por testar-te? Vê os mini-testes e flashcards grátis →</a></p>
<section class="pq-faqs" aria-labelledby="pq-faq-h"><h2 id="pq-faq-h" class="pq-h2">Perguntas frequentes</h2>
${faqs}
</section>
</div>
${closingBand('pt')}`;
  return shell({ path, title: STUDY_HUB.title, description: STUDY_HUB.description, ld, analytics, body });
}

export function studySitemapEntries() {
  return [STUDY_HUB.path, ...studyGuides.map(studyPath)].map(
    (path) => `  <url>
    <loc>${absolute(path)}</loc>
    <lastmod>${PRACTICE_LASTMOD}</lastmod>
    <xhtml:link rel="alternate" hreflang="pt-PT" href="${absolute(path)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${absolute(path)}" />
  </url>`
  );
}
