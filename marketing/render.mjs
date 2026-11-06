import { headAssets, renderFooter, renderHeader, renderInstallDialog } from './chrome.mjs';
import { CONTACT_EMAIL, DEFINITION, ORIGIN, PAIRS, WEB_APP } from './content.mjs';
import { pageMotionScript, renderWhoLevels } from './who.mjs';

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
  const advantage = block.variant === 'advantage';
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
  const cls = advantage ? 'compare compare-adv' : 'compare';
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

function renderBlock(block, locale) {
  if (block.type === 'negation') {
    return `<div data-seo-negation="true">${block.blocks.map((child) => renderBlock(child, locale)).join('')}</div>`;
  }
  if (block.type === 'levels') return renderWhoLevels(locale);
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

export function jsonLd({ locale, path, title, description, faqs }) {
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

export function renderPage(page) {
  const lang = page.locale === 'en' ? 'en' : 'pt-PT';
  const otherPath = page.locale === 'en' ? page.ptPath : page.enPath;
  const faqs = collectFaqs(page);
  const ld = jsonLd({
    locale: page.locale,
    path: page.path,
    title: page.title,
    description: page.description,
    faqs,
  });
  const h1Attr = page.h1Negation ? ' data-seo-negation="true"' : '';
  const ledeAttr = page.ledeNegation ? ' data-seo-negation="true"' : '';
  const articleClass = page.wide ? 'legal legal-wide' : 'legal';
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
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
<meta name="theme-color" content="#0b0e14">
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script>document.documentElement.classList.add('js');</script>
${headAssets(['/marketing.css', '/motion.css'])}
</head>
<body>
${renderHeader({ locale: page.locale, otherPath })}
<main id="conteudo" tabindex="-1">
<article class="${articleClass}">
<div class="legal-inner">
<p class="kicker">${escapeHtml(page.kicker)}</p>
<h1${h1Attr}>${escapeHtml(page.h1)}</h1>
<p class="lede"${ledeAttr}>${escapeHtml(page.lede)}</p>
${page.blocks.map((block) => renderBlock(block, page.locale)).join('\n')}
</div>
</article>
</main>
${renderFooter({ locale: page.locale })}
${renderInstallDialog(page.locale)}
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
    <lastmod>2026-11-05</lastmod>
    <xhtml:link rel="alternate" hreflang="pt" href="${absolute(url.pt)}" />
    <xhtml:link rel="alternate" hreflang="pt-PT" href="${absolute(url.pt)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${absolute(url.en)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${absolute(url.pt)}" />
  </url>`
    )
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

export function renderRedirects() {
  return `# Retired niche pages. Prepend these rules to the site _redirects.
# Do not replace the /app rules with this file alone.
${NICHE_REDIRECT_RULES.map(([source, destination, code]) => `${source} ${destination} ${code}`).join('\n')}
`;
}

export function renderRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`;
}
