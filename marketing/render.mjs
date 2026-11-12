import { ga4HeadSnippet } from '../lib/ga4.mjs';
import { headAssets, renderCookieBanner, renderFooter, renderHeader, renderInstallDialog } from './chrome.mjs';
import { RETIRED_VS_SLUGS, comparePair } from './compare.mjs';
import { CONTACT_EMAIL, DEFINITION, ORIGIN, PAIRS, WEB_APP } from './content.mjs';
import { closingBand, pageHero, pageKind, relatedCards, tocNav } from './page-layout.mjs';
import { FEATURED_PLAN, PLAN_COPY, PLAN_ORDER, annualCents, euros, planCard, savingsPercent, yearlyPerMonthCents } from './plans.mjs';
import { renderInstallGuide } from './install.mjs';
import { pageMotionScript, renderWhoLevels } from './who.mjs';
import { practiceSitemapEntries } from './practice-page.mjs';
import { studySitemapEntries } from './study-page.mjs';

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function absolute(path) {
  return path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path}`;
}

export function relIndex(urlPath) {
  if (urlPath === '/') return 'index.html';
  const trimmed = urlPath.replace(/^\//, '').replace(/\/$/, '');
  if (trimmed.includes('..')) throw new Error(`Unsafe path: ${urlPath}`);
  return `${trimmed}/index.html`;
}

function renderInline(parts) {
  return parts
    .map((part) => {
      let text = escapeHtml(part.text);
      if (part.strong) text = `<strong>${text}</strong>`;
      if (part.em) text = `<em>${text}</em>`;
      if (part.href) {
        const external = part.href.startsWith('http') || part.href.startsWith('mailto:');
        const rel = external && part.href.startsWith('http') ? ' rel="noopener"' : '';
        return `<a href="${escapeHtml(part.href)}"${rel}>${text}</a>`;
      }
      return text;
    })
    .join('');
}

function renderCell(cell) {
  if (cell && typeof cell === 'object' && cell.kind === 'price') return `<span class="adv-price">${escapeHtml(cell.text)}</span>`;
  if (cell && typeof cell === 'object' && cell.kind === 'mark') {
    const glyph = cell.value === 'yes' ? '\u2713' : '\u2717';
    return `<span class="adv-glyph" aria-hidden="true">${glyph}</span><span class="visually-hidden">${escapeHtml(cell.label)}</span>`;
  }
  return Array.isArray(cell) ? renderInline(cell) : escapeHtml(cell);
}

function renderParagraph(block) {
  const negation = block.negation ? ' data-seo-negation="true"' : '';
  const cls = block.className ? ` class="${escapeHtml(block.className)}"` : '';
  const inner = block.parts ? renderInline(block.parts) : escapeHtml(block.text);
  return `<p${cls}${negation}>${inner}</p>`;
}

function renderTable(block) {
  const advantage = block.variant === 'advantage' || block.variant === 'hub';
  const head = block.headers
    .map((cell, index) => {
      const text = !advantage && index === 0 ? `<span class="visually-hidden">${renderCell(cell)}</span>` : renderCell(cell);
      const cls = advantage && index > 0 ? ' class="adv-col"' : '';
      return `<th scope="col"${cls}>${text}</th>`;
    })
    .join('');
  const body = block.rows
    .map((row) => {
      const cells = row
        .map((cell, index) => {
          if (index === 0) return `<th scope="row">${renderCell(cell)}</th>`;
          if (cell && typeof cell === 'object' && cell.kind === 'price') return `<td class="adv adv-price-cell">${renderCell(cell)}</td>`;
          if (cell && typeof cell === 'object' && cell.kind === 'mark') {
            const tone = cell.value === 'yes' ? 'adv-yes' : 'adv-no';
            return `<td class="adv ${tone}">${renderCell(cell)}</td>`;
          }
          return `<td>${renderCell(cell)}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');
  const negation = block.negation ? ' data-seo-negation="true"' : '';
  const cls = block.variant === 'hub' ? 'compare compare-adv compare-hub' : advantage ? 'compare compare-adv' : 'compare';
  return `<div class="${cls}"${negation}><table><caption class="visually-hidden">${escapeHtml(block.caption)}</caption><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function renderFaq(block) {
  const items = block.items
    .map((item) => {
      const answer = item.parts ? renderInline(item.parts) : escapeHtml(item.a);
      return `<details><summary>${escapeHtml(item.q)}</summary><div class="faq-a"><div><p>${answer}</p></div></div></details>`;
    })
    .join('');
  const html = `<h2>${escapeHtml(block.title)}</h2><div class="faq-list">${items}</div>`;
  const mentionsConfusion = block.items.some((item) => /mapa mental|mind map/i.test(`${item.q} ${item.a}`));
  return mentionsConfusion ? `<div data-seo-negation="true">${html}</div>` : html;
}

const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>';

function planPrice(card, locale) {
  const t = PLAN_COPY[locale];
  const p = card.plan;
  if (p.monthlyCents) {
    const year = euros(yearlyPerMonthCents(p.monthlyCents), locale);
    const month = euros(p.monthlyCents, locale);
    const annual = euros(annualCents(p.monthlyCents), locale);
    return `<p class="pl-price"><span class="pl-year"><b>${year}</b><small>${t.perMonth}</small></span><span class="pl-month"><b>${month}</b><small>${t.perMonth}</small></span></p>
<p class="pl-bill"><span class="pl-year">${escapeHtml(t.billedYearly(annual))} · <em>${escapeHtml(t.save(savingsPercent(p.monthlyCents)))}</em><br>${escapeHtml(t.orMonthly(month))}</span><span class="pl-month">${escapeHtml(t.billedMonthly)}</span></p>`;
  }
  if (p.onceCents) {
    return `<p class="pl-price"><b>${euros(p.onceCents, locale)}</b><small>${escapeHtml(t.once)}</small></p><p class="pl-bill">${escapeHtml(t.noRenewal)}</p>`;
  }
  return `<p class="pl-price"><b>${t.free}</b></p><p class="pl-bill">${escapeHtml(t.freeNote)}</p>`;
}

function renderPlans(block, locale) {
  const t = PLAN_COPY[locale];
  const cards = PLAN_ORDER.map((code) => {
    const card = planCard(code, locale);
    const featured = code === FEATURED_PLAN;
    const facts = card.facts.map((f) => `<li>${CHECK}<span>${escapeHtml(f)}</span></li>`).join('');
    const label = code === 'free' ? t.cta.free : code === 'season' ? t.cta.season : t.cta.paid(card.name);
    const href = code === 'free' ? WEB_APP : `${WEB_APP}plans`;
    const badge = featured ? `<span class="pl-badge">${escapeHtml(t.featured)}</span>` : '';
    return `<li class="pl-card mg-glass${featured ? ' is-featured' : ''}" id="plano-${code}" data-spotlight>${badge}<h3>${escapeHtml(card.name)}</h3><p class="pl-tag">${escapeHtml(card.tagline)}</p>${planPrice(card, locale)}<ul class="pl-facts">${facts}</ul><a class="btn${featured ? ' btn-shine' : ' btn-ghost'}" href="${href}">${escapeHtml(label)}</a></li>`;
  }).join('');
  const save = savingsPercent(499);
  return `<div class="pl" data-plans data-interval="year">
<div class="pl-switch" role="radiogroup" aria-label="${escapeHtml(t.intervalLabel)}"><button type="button" role="radio" aria-checked="false" data-interval-choice="month">${escapeHtml(t.monthly)}</button><button type="button" role="radio" aria-checked="true" data-interval-choice="year">${escapeHtml(t.yearly)} <span class="pl-save">${escapeHtml(t.save(save))}</span></button></div>
<ul class="pl-grid">${cards}</ul>
<p class="pl-note">${escapeHtml(t.yearlyNote)}</p>
</div>`;
}

function renderBlock(block, locale) {
  if (block.type === 'plans') return renderPlans(block, locale);
  if (block.type === 'negation') {
    return `<div data-seo-negation="true">${block.blocks.map((child) => renderBlock(child, locale)).join('')}</div>`;
  }
  if (block.type === 'levels') return renderWhoLevels(locale);
  if (block.type === 'install') return renderInstallGuide(locale, { id: 'guia', variant: 'page' });
  if (block.type === 'h2') {
    const html = `<h2>${escapeHtml(block.text)}</h2>`;
    return block.negation ? `<div data-seo-negation="true">${html}</div>` : html;
  }
  if (block.type === 'p') return renderParagraph(block);
  if (block.type === 'list') {
    const tag = block.ordered === false ? 'ul' : 'ol';
    const negation = block.negation ? ' data-seo-negation="true"' : '';
    const items = block.items
      .map((item) => `<li>${Array.isArray(item) ? renderInline(item) : escapeHtml(item)}</li>`)
      .join('');
    return `<${tag} class="page-list"${negation}>${items}</${tag}>`;
  }
  if (block.type === 'table') return renderTable(block);
  if (block.type === 'faq') return renderFaq(block);
  if (block.type === 'cta') {
    if (block.parts) {
      const html = `<p class="page-cta">${renderInline(block.parts)}</p>`;
      return block.negation ? `<div data-seo-negation="true">${html}</div>` : html;
    }
    return `<p class="page-cta"><a class="btn" href="${escapeHtml(block.href)}">${escapeHtml(block.label)}</a></p>`;
  }
  throw new Error(`Unknown block ${block.type}`);
}

export function collectFaqs(page) {
  const faqs = [];
  function walk(blocks) {
    for (const block of blocks) {
      if (block.type === 'faq') faqs.push(...block.items);
      if (block.type === 'negation') walk(block.blocks);
    }
  }
  walk(page.blocks);
  return faqs;
}

/** Monthly price of MicroGrind (EUR), as published on the site. */
export const APP_PRICE_EUR = '4.00';

/** What the app does, for search engines and AI answers. Keep in line with the app. */
export const APP_FEATURES = {
  pt: [
    'Mapa da matéria a partir dos teus apontamentos, sebenta, manual ou slides (PDF, Word, texto, fotos)',
    'Capítulos e lições na ordem dos teus resumos',
    'Sessões de estudo de 5 a 25 minutos',
    'Mini-lições, flashcards e quizzes',
    'Simulações de exame (modo exame)',
    'Tutor IA',
    'Grind Score (0 a 100) e streaks',
    'Battles entre estudantes',
    'Web e telemóvel (PWA)',
  ],
  en: [
    'Subject Map from your notes, course pack, textbook or slides (PDF, Word, text, photos)',
    'Chapters and lessons in the order of your own summaries',
    '5–25 minute study sessions',
    'Mini-lessons, flashcards and quizzes',
    'Mock exams (exam mode)',
    'AI Tutor',
    'Grind Score (0 to 100) and streaks',
    'Battles between students',
    'Web and phone (PWA)',
  ],
};

/** Site-wide last modification date for the sitemap. */
export const SITE_LASTMOD = '2026-11-06';

export function jsonLd({ locale, path, title, description, faqs, breadcrumbs = [] }) {
  const pageUrl = absolute(path);
  const inLanguage = locale === 'en' ? 'en' : 'pt-PT';
  const graph = [
    {
      '@type': 'Organization',
      '@id': `${ORIGIN}/#org`,
      name: 'MicroGrind',
      url: `${ORIGIN}/`,
      logo: `${ORIGIN}/og.png`,
      email: CONTACT_EMAIL,
    },
    {
      '@type': 'WebSite',
      '@id': `${ORIGIN}/#website`,
      name: 'MicroGrind',
      url: `${ORIGIN}/`,
      inLanguage: 'pt-PT',
      publisher: { '@id': `${ORIGIN}/#org` },
    },
    {
      '@type': ['SoftwareApplication', 'MobileApplication'],
      '@id': `${ORIGIN}/#app`,
      name: 'MicroGrind',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      url: WEB_APP,
      description: DEFINITION[locale === 'en' ? 'en' : 'pt'],
      slogan: locale === 'en' ? 'Short sessions. Real progress.' : 'Sessões curtas. Progresso real.',
      inLanguage: ['pt-PT', 'en'],
      featureList: APP_FEATURES[locale === 'en' ? 'en' : 'pt'],
      offers: {
        '@type': 'Offer',
        price: APP_PRICE_EUR,
        priceCurrency: 'EUR',
        url: WEB_APP,
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: APP_PRICE_EUR,
          priceCurrency: 'EUR',
          unitCode: 'MON',
          referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
        },
      },
      publisher: { '@id': `${ORIGIN}/#org` },
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      inLanguage,
      isPartOf: { '@id': `${ORIGIN}/#website` },
      about: { '@id': `${ORIGIN}/#app` },
      publisher: { '@id': `${ORIGIN}/#org` },
    },
  ];
  if (breadcrumbs.length > 0) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumbs`,
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: absolute(crumb.path),
      })),
    });
  }
  if (faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      url: pageUrl,
      inLanguage,
      mainEntity: faqs.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** Insert the Google tag once, immediately after `<head>`. */
export function withGa4Head(html) {
  if (html.includes('googletagmanager.com/gtag/js')) return html;
  const marker = '<head>';
  const at = html.indexOf(marker);
  if (at < 0) throw new Error('HTML is missing <head>.');
  return `${html.slice(0, at + marker.length)}\n${ga4HeadSnippet()}${html.slice(at + marker.length)}`;
}

export function renderPage(page, { allPages = [], analytics = true } = {}) {
  const lang = page.locale === 'en' ? 'en' : 'pt-PT';
  const otherPath = page.locale === 'en' ? page.ptPath : page.enPath;
  const faqs = collectFaqs(page);
  const ld = jsonLd({
    locale: page.locale,
    path: page.path,
    title: page.title,
    description: page.description,
    faqs,
    breadcrumbs: [
      { name: page.locale === 'en' ? 'Home' : 'Início', path: page.locale === 'en' ? '/en/' : '/' },
      { name: page.kicker, path: page.path },
    ],
  });
  const kind = pageKind(page);
  const h1Attr = page.h1Negation ? ' data-seo-negation="true"' : '';
  const ledeAttr = page.ledeNegation ? ' data-seo-negation="true"' : '';
  const articleClass = page.wide ? 'legal legal-wide' : 'legal';
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
${analytics ? ga4HeadSnippet() : ''}<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(page.title)}</title>
<meta name="description" content="${escapeHtml(page.description)}">
<link rel="canonical" href="${absolute(page.path)}">
<link rel="alternate" hreflang="pt" href="${absolute(page.ptPath)}">
<link rel="alternate" hreflang="pt-PT" href="${absolute(page.ptPath)}">
<link rel="alternate" hreflang="en" href="${absolute(page.enPath)}">
<link rel="alternate" hreflang="x-default" href="${absolute(page.ptPath)}">
<meta property="og:site_name" content="MicroGrind">
<meta property="og:type" content="website">
<meta property="og:locale" content="${page.locale === 'en' ? 'en_GB' : 'pt_PT'}">
<meta property="og:locale:alternate" content="${page.locale === 'en' ? 'pt_PT' : 'en_GB'}">
<meta property="og:url" content="${absolute(page.path)}">
<meta property="og:title" content="${escapeHtml(page.title)}">
<meta property="og:description" content="${escapeHtml(page.description)}">
<meta property="og:image" content="${ORIGIN}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(page.title)}">
<meta name="twitter:description" content="${escapeHtml(page.description)}">
<meta name="twitter:image" content="${ORIGIN}/og.png">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<meta name="theme-color" content="#07090d">
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script>document.documentElement.classList.add('js');</script>
${headAssets(['/marketing.css', '/motion.css'])}
</head>
<body class="mg-page mg-page-${kind}">
${renderHeader({ locale: page.locale, otherPath, currentPath: page.path })}
<main id="conteudo" tabindex="-1">
${pageHero(page, { h1Attr, ledeAttr, updated: page.updatedHtml ?? '' })}
<div class="wrap pg-body${kind === 'legal' ? ' is-narrow' : ''}${kind === 'pricing' || kind === 'install' ? ' is-full' : ''}">
${kind === 'legal' || kind === 'pricing' || kind === 'install' ? '' : tocNav(page.locale)}
<article class="${articleClass}">
<div class="legal-inner">
${page.blocks.map((block) => renderBlock(block, page.locale)).join('\n')}
</div>
</article>
</div>
${relatedCards(page, allPages)}
${kind === 'legal' ? '' : closingBand(page.locale)}
</main>
${renderFooter({ locale: page.locale })}
${renderInstallDialog(page.locale)}
${renderCookieBanner(page.locale)}
${pageMotionScript()}
</body>
</html>
`;
}

export function renderSitemap() {
  const urls = PAIRS.flatMap((pair) => [
    { loc: pair.pt, pt: pair.pt, en: pair.en },
    { loc: pair.en, pt: pair.pt, en: pair.en },
  ]);
  const body = urls
    .map(
      (url) => `  <url>
    <loc>${absolute(url.loc)}</loc>
    <lastmod>${SITE_LASTMOD}</lastmod>
    <xhtml:link rel="alternate" hreflang="pt" href="${absolute(url.pt)}" />
    <xhtml:link rel="alternate" hreflang="pt-PT" href="${absolute(url.pt)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${absolute(url.en)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${absolute(url.pt)}" />
  </url>`
    )
    .concat(practiceSitemapEntries())
    .concat(studySitemapEntries())
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
}

/** Old niche URLs. Prepend these to the live _redirects; do not drop the /app rules. */
export const NICHE_REDIRECT_RULES = [
  ['/direito/', '/', 301],
  ['/direito', '/', 301],
  ['/direito/index.html', '/', 301],
  ['/en/law/', '/en/', 301],
  ['/en/law', '/en/', 301],
  ['/en/law/index.html', '/en/', 301],
];

/** Retired one-to-one comparison pages: each goes to the comparison page in its language. */
export const VS_REDIRECT_RULES = RETIRED_VS_SLUGS.flatMap((slug) => [
  [`/${slug}/`, comparePair.pt, 301],
  [`/${slug}`, comparePair.pt, 301],
  [`/en/${slug}/`, comparePair.en, 301],
  [`/en/${slug}`, comparePair.en, 301],
]);

export function renderRedirects() {
  return `# Retired pages. Prepend these rules to the site _redirects.
# Do not replace the /app rules with this file alone.
${[...NICHE_REDIRECT_RULES, ...VS_REDIRECT_RULES].map(([source, destination, code]) => `${source} ${destination} ${code}`).join('\n')}
`;
}

export function renderRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`;
}
