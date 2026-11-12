/**
 * Free practice pages: /praticar/ (hub) and /praticar/<slug>/ (one quiz or flashcard deck each).
 *
 * Every question, option, answer and explanation is in the HTML, so the page is indexable and
 * works without JavaScript. practice.js turns it into a one-at-a-time quiz / flashcard deck.
 * Content lives in practice/*.mjs; this file only renders it. PT-PT only for now.
 */
import { esc, headAssets, renderCookieBanner, renderFooter, renderHeader, renderInstallDialog } from './chrome.mjs';
import { ORIGIN, REGISTER_URL } from './content.mjs';
import { closingBand } from './page-layout.mjs';
import { absolute, jsonLd } from './render.mjs';
import { ga4HeadSnippet } from '../lib/ga4.mjs';
import { PRACTICE_AREAS, PRACTICE_HUB, practicePages } from './practice/index.mjs';

export const PRACTICE_ASSET_VERSION = '2026-11-12b';
export const PRACTICE_LASTMOD = '2026-11-12';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const ARROW =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>';

export function practicePath(page) {
  return `/praticar/${page.slug}/`;
}

/** Sign-up link with the campaign that brought the student in. */
export function registerHref(campaign) {
  const params = new URLSearchParams({ utm_source: 'praticar', utm_medium: 'seo', utm_campaign: campaign });
  return `${REGISTER_URL}?${params}`;
}

export function head({ path, title, description, ld, analytics }) {
  return `<!DOCTYPE html>
<html lang="pt-PT">
<head>
${analytics ? ga4HeadSnippet() : ''}<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${absolute(path)}">
<link rel="alternate" hreflang="pt-PT" href="${absolute(path)}">
<link rel="alternate" hreflang="x-default" href="${absolute(path)}">
<meta property="og:site_name" content="MicroGrind">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_PT">
<meta property="og:url" content="${absolute(path)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${ORIGIN}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ORIGIN}/og.png">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<meta name="theme-color" content="#07090d">
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script>document.documentElement.classList.add('js');</script>
${headAssets(['/marketing.css'])}
<link rel="stylesheet" href="/practice.css?v=${PRACTICE_ASSET_VERSION}">
<script src="/practice.js?v=${PRACTICE_ASSET_VERSION}" defer></script>
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

export function shell({ path, title, description, ld, analytics, body }) {
  return `${head({ path, title, description, ld, analytics })}
<body class="mg-page mg-page-practice">
${renderHeader({ locale: 'pt', otherPath: '/en/', currentPath: path })}
<main id="conteudo" tabindex="-1">
${body}
</main>
${renderFooter({ locale: 'pt' })}
${renderInstallDialog('pt')}
${renderCookieBanner('pt')}
</body>
</html>
`;
}

function renderQuizItem(item, index, total) {
  const options = item.options
    .map(
      (option, i) =>
        `<li class="pq-option"${i === item.answer ? ' data-correct' : ''}><span class="pq-letter" aria-hidden="true">${LETTERS[i]}</span><span class="pq-option-text">${esc(option)}</span></li>`
    )
    .join('');
  return `<li class="pq-item" data-item id="pergunta-${index + 1}">
<p class="pq-count">Pergunta ${index + 1} de ${total}</p>
<h3 class="pq-q">${esc(item.q)}</h3>
<ol class="pq-options" type="A">${options}</ol>
<details class="pq-answer" data-answer><summary>Ver resposta</summary><p><strong>Resposta certa: ${LETTERS[item.answer]}) ${esc(item.options[item.answer])}.</strong> ${esc(item.why)}</p></details>
</li>`;
}

function renderCardItem(item, index, total) {
  return `<li class="pq-item pq-card" data-item id="cartao-${index + 1}">
<p class="pq-count">Cartão ${index + 1} de ${total}</p>
<h3 class="pq-q pq-front">${esc(item.front)}</h3>
<details class="pq-answer pq-back" data-answer><summary>Ver resposta</summary><p>${esc(item.back)}</p></details>
</li>`;
}

export function ctaBlock(page, { id, final = false }) {
  const noun = page.mode === 'flashcards' ? 'Estes {n} cartões são' : 'Estas {n} perguntas são';
  const h = final ? 'Agora com a tua matéria' : 'Cria perguntas a partir dos teus próprios apontamentos com o MicroGrind';
  const p = final
    ? 'Carrega a tua sebenta, apontamentos ou slides. O MicroGrind monta o mapa da matéria e prepara quizzes, flashcards e simulações de exame com o que tens de estudar.'
    : `${noun.replace('{n}', page.items.length)} um exemplo genérico. No MicroGrind, as perguntas saem do teu material, em sessões de 5 a 25 minutos.`;
  return `<aside class="pq-cta mg-glass" id="${id}" aria-labelledby="${id}-h">
<p class="pq-cta-h" id="${id}-h">${esc(h)}</p>
<p>${esc(p)}</p>
<a class="btn btn-shine" href="${esc(registerHref(page.slug))}" data-practice-cta>Experimentar o MicroGrind grátis${ARROW}</a>
</aside>`;
}

export function practiceLd(page) {
  const path = practicePath(page);
  const base = jsonLd({
    locale: 'pt',
    path,
    title: page.title,
    description: page.description,
    faqs: page.faqs,
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: PRACTICE_HUB.kicker, path: PRACTICE_HUB.path },
      { name: page.kicker, path },
    ],
  });
  const resource = {
    '@type': page.mode === 'flashcards' ? 'LearningResource' : ['LearningResource', 'Quiz'],
    '@id': `${absolute(path)}#practice`,
    name: page.h1,
    description: page.description,
    url: absolute(path),
    inLanguage: 'pt-PT',
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

/** The interactive quiz / flashcard block (practice.js). `page` needs slug, mode, items and practiceHeading. */
export function practiceSection(page) {
  const total = page.items.length;
  const items = page.items.map((item, i) => (page.mode === 'flashcards' ? renderCardItem(item, i, total) : renderQuizItem(item, i, total))).join('\n');
  const modeLabel = page.mode === 'flashcards' ? 'flashcards' : 'quiz';
  return `<section class="pq-practice" aria-labelledby="pq-practice-h" data-practice="${modeLabel}" data-slug="${esc(page.slug)}">
<h2 id="pq-practice-h" class="pq-h2">${esc(page.practiceHeading)}</h2>
<p class="pq-hint" data-practice-hint>${page.mode === 'flashcards' ? 'Lê a pergunta, tenta responder de cabeça e abre a resposta.' : 'Escolhe uma opção em cada pergunta e abre a resposta para confirmar.'}</p>
<ol class="pq-list" data-practice-list>
${items}
</ol>
<div class="pq-result" data-practice-result hidden tabindex="-1">
<p class="pq-score" data-practice-score aria-live="polite"></p>
<p class="pq-score-note" data-practice-note></p>
<div class="pq-review" data-practice-review></div>
${ctaBlock(page, { id: 'pq-cta-final', final: true })}
<button class="btn btn-ghost btn-sm" type="button" data-practice-restart>Recomeçar</button>
</div>
<p class="pq-sr" aria-live="polite" data-practice-live></p>
</section>`;
}

export function renderPracticePage(page, { analytics = true } = {}) {
  const path = practicePath(page);
  const how = page.howTo.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n');
  const faqs = page.faqs.map((f) => `<details class="pq-faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n');
  const related = page.related
    .map((slug) => practicePages.find((p) => p.slug === slug))
    .filter(Boolean)
    .map((p) => `<li><a href="${practicePath(p)}">${esc(p.h1)}</a></li>`)
    .join('');
  const body = `${hero({
    crumbs: [
      { name: 'Início', path: '/' },
      { name: PRACTICE_HUB.kicker, path: PRACTICE_HUB.path },
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
<h2 id="pq-faq-h" class="pq-h2">Perguntas frequentes</h2>
${faqs}
</section>
${related ? `<nav class="pq-related" aria-labelledby="pq-related-h"><h2 id="pq-related-h" class="pq-h2">Pratica outras disciplinas</h2><ul>${related}</ul><p><a href="${PRACTICE_HUB.path}">Ver todas as páginas de prática</a></p></nav>` : ''}
<p class="pq-disclaimer">Perguntas de exemplo, de nível introdutório, para treino. Confirma sempre com o programa e a bibliografia da tua cadeira.</p>
</div>
${closingBand('pt')}`;
  return shell({ path, title: page.title, description: page.description, ld: practiceLd(page), analytics, body });
}

export function renderPracticeHub({ analytics = true } = {}) {
  const path = PRACTICE_HUB.path;
  const groups = PRACTICE_AREAS.map((area) => {
    const cards = practicePages
      .filter((p) => p.area === area.id)
      .map(
        (p) =>
          `<li><a class="pq-hub-card mg-glass" href="${practicePath(p)}"><span class="kicker">${p.mode === 'flashcards' ? `${p.items.length} flashcards` : `${p.items.length} perguntas`}</span><b>${esc(p.h1)}</b><span class="pq-hub-blurb">${esc(p.lede)}</span></a></li>`
      )
      .join('');
    return `<section class="pq-hub-group" aria-labelledby="pq-area-${area.id}"><h2 class="pq-h2" id="pq-area-${area.id}">${esc(area.label)}</h2><ul class="pq-hub-grid">${cards}</ul></section>`;
  }).join('\n');
  const ld = jsonLd({
    locale: 'pt',
    path,
    title: PRACTICE_HUB.title,
    description: PRACTICE_HUB.description,
    faqs: PRACTICE_HUB.faqs,
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: PRACTICE_HUB.kicker, path },
    ],
  });
  ld['@graph'].push({
    '@type': 'ItemList',
    '@id': `${absolute(path)}#list`,
    itemListElement: practicePages.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(practicePath(p)), name: p.h1 })),
  });
  const faqs = PRACTICE_HUB.faqs.map((f) => `<details class="pq-faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n');
  const body = `${hero({
    crumbs: [
      { name: 'Início', path: '/' },
      { name: PRACTICE_HUB.kicker, path },
    ],
    kicker: PRACTICE_HUB.kicker,
    h1: PRACTICE_HUB.h1,
    lede: PRACTICE_HUB.lede,
  })}
<div class="wrap pq-body pq-hub">
${groups}
<p><a href="/estudar/">Queres um plano de estudo? Vê os guias de como estudar cada disciplina →</a></p>
<section class="pq-faqs" aria-labelledby="pq-faq-h"><h2 id="pq-faq-h" class="pq-h2">Perguntas frequentes</h2>
${faqs}
</section>
</div>
${closingBand('pt')}`;
  return shell({ path, title: PRACTICE_HUB.title, description: PRACTICE_HUB.description, ld, analytics, body });
}

/** Sitemap entries for the practice pages (PT only, no hreflang pair). */
export function practiceSitemapEntries() {
  return [PRACTICE_HUB.path, ...practicePages.map(practicePath)].map(
    (path) => `  <url>
    <loc>${absolute(path)}</loc>
    <lastmod>${PRACTICE_LASTMOD}</lastmod>
    <xhtml:link rel="alternate" hreflang="pt-PT" href="${absolute(path)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${absolute(path)}" />
  </url>`
  );
}
