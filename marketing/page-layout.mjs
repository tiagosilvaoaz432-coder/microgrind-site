/**
 * Layout pieces for content pages (guides, about, the comparison page, privacy):
 * hero with a visual per page kind, "on this page" index, related cards and the closing band.
 * Page copy itself stays in content.mjs, compare.mjs and legal.mjs.
 */
import { esc } from './chrome.mjs';
import { CHROME, WEB_APP } from './content.mjs';
import { COMPARE_COLUMNS, comparePair } from './compare.mjs';
import { HOME_COPY } from './home-copy.mjs';
import { chapterCard, progressRing } from './learning-path.mjs';

const MIND = /mapa mental|mind map/i;

const T = {
  pt: {
    home: 'Início',
    compare: 'Comparar',
    toc: 'Nesta página',
    related: 'Continua a ler',
    install: 'Instalar a app',
    how: 'Ver como funciona',
    demo: 'Demo ilustrativa',
    blurbs: {
      '/mapa-da-materia/': 'Como a MicroGrind organiza a disciplina em capítulos e lições.',
      '/estudar-sebenta/': 'Do PDF ao mapa, e do mapa a sessões curtas.',
      '/sobre/': 'O que é a MicroGrind e para quem é.',
      '/comparar/': 'Seis apps de estudo lado a lado: funcionalidades e preços.',
      '/planos/': 'Grátis, Plus, Pro, Ultra e Passe Época: preços e limites.',
    },
    visual: {
      mapa: { title: 'Física', chapter: 'Energia', lessons: ['Formas', 'Transformações', 'Conservação'] },
      sebenta: { title: 'Biologia', chapter: 'A célula', lessons: ['Membrana', 'Núcleo', 'Mitocôndria'] },
      sobre: { title: 'História', chapter: 'Revolução Francesa', lessons: ['Causas', '1789', 'O Terror'] },
    },
  },
  en: {
    home: 'Home',
    compare: 'Compare',
    toc: 'On this page',
    related: 'Keep reading',
    install: 'Install the app',
    how: 'See how it works',
    demo: 'Illustrative demo',
    blurbs: {
      '/en/subject-map/': 'How MicroGrind organises your subject into chapters and lessons.',
      '/en/study-from-pdf/': 'From PDF to map, and from map to short sessions.',
      '/en/about/': 'What MicroGrind is and who it is for.',
      '/en/compare/': 'Six study apps side by side: features and prices.',
      '/en/pricing/': 'Free, Plus, Pro, Ultra and Passe Época: prices and limits.',
    },
    visual: {
      mapa: { title: 'Physics', chapter: 'Energy', lessons: ['Forms', 'Transformations', 'Conservation'] },
      sebenta: { title: 'Biology', chapter: 'The cell', lessons: ['Membrane', 'Nucleus', 'Mitochondria'] },
      sobre: { title: 'History', chapter: 'French Revolution', lessons: ['Causes', '1789', 'The Terror'] },
    },
  },
};

const GUIDE_VISUAL = {
  '/mapa-da-materia/': 'mapa',
  '/en/subject-map/': 'mapa',
  '/estudar-sebenta/': 'sebenta',
  '/en/study-from-pdf/': 'sebenta',
  '/sobre/': 'sobre',
  '/en/about/': 'sobre',
};

export function pageKind(page) {
  if (page.kind) return page.kind;
  if (page.path === comparePair.pt || page.path === comparePair.en) return 'hub';
  return 'guide';
}

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>';

export function breadcrumbs(page) {
  const t = T[page.locale];
  const kind = pageKind(page);
  const crumbs = [{ href: CHROME[page.locale].home, label: t.home }];
  return crumbs;
}

function visual(page) {
  const t = T[page.locale];
  const kind = pageKind(page);
  if (kind === 'hub') {
    const tiles = COMPARE_COLUMNS.map((name) => `<span class="ph-hub-tile${name === 'MicroGrind' ? ' is-mg' : ''}">${esc(name)}</span>`).join('');
    return `<div class="ph-hub mg-glass" data-spotlight aria-hidden="true">${tiles}</div>`;
  }
  const key = GUIDE_VISUAL[page.path];
  if (!key) return '';
  const v = t.visual[key];
  const ui = HOME_COPY[page.locale].map.path;
  const card = chapterCard({
    n: 1,
    title: v.chapter,
    state: 'active',
    done: 1,
    total: 3,
    ui,
    size: 'sm',
    nodes: [
      { label: v.lessons[0], state: 'done', score: 90 },
      { label: v.lessons[1], state: 'current' },
      { label: v.lessons[2], state: 'locked' },
    ],
  });
  return `<div class="ph-app" aria-hidden="true"><div class="ph-app-screen"><div class="dv-subject"><div><p class="dv-title">${esc(v.title)}</p><p class="dv-sub">${esc(ui.lessons(1, 3))}</p></div>${progressRing(33, 48)}</div>${card}</div><p class="ph-demo"><span class="mg-demo-tag"><span class="mg-dot"></span>${esc(t.demo)}</span></p></div>`;
}

/** Hero: breadcrumb, kicker, h1, lede, actions and the visual. */
export function pageHero(page, { h1Attr = '', ledeAttr = '', updated = '' } = {}) {
  const t = T[page.locale];
  const kind = pageKind(page);
  const crumbs = breadcrumbs(page)
    .map((c) => `<li><a href="${c.href}">${esc(c.label)}</a></li>`)
    .concat(`<li aria-current="page">${esc(page.kicker)}</li>`)
    .join('');
  const second =
    kind === 'legal'
        ? ''
        : `<a class="btn btn-ghost" href="${CHROME[page.locale].home}#${page.locale === 'en' ? 'how-it-works' : 'como-funciona'}">${esc(t.how)}</a>`;
  const art = visual(page);
  const lede = page.lede ? `<p class="lede"${ledeAttr} data-reveal="rise" style="--d:160ms">${esc(page.lede)}</p>` : '';
  return `<header class="ph${art ? '' : ' is-plain'} ph-kind-${kind}">
<div class="ph-bg" aria-hidden="true"><div class="mg-aurora mg-aurora-a"></div><div class="mg-aurora mg-aurora-b"></div><div class="mg-grid-paper"></div></div>
<div class="wrap ph-grid">
<div class="ph-copy">
<nav class="ph-crumbs" aria-label="Breadcrumb"><ol>${crumbs}</ol></nav>
<p class="kicker">${esc(page.kicker)}</p>
<h1${h1Attr}>${esc(page.h1)}</h1>
${updated}${lede}
<div class="hero-actions" data-reveal="rise" style="--d:260ms"><button class="btn js-install" type="button" data-magnetic>${esc(t.install)}${ARROW}</button>${second}</div>
</div>
${art ? `<div class="ph-visual" data-reveal="device" style="--d:150ms">${art}</div>` : ''}
</div>
</header>`;
}

export function tocNav(locale) {
  return `<nav class="pg-toc" data-toc aria-label="${esc(T[locale].toc)}" hidden><p class="footer-label">${esc(T[locale].toc)}</p><ol></ol></nav>`;
}

/** Up to three other pages of the same language. */
export function relatedCards(page, allPages) {
  const t = T[page.locale];
  const same = allPages.filter((p) => p.locale === page.locale && p.path !== page.path && !MIND.test(p.h1));
  const picks = same.filter((p) => ['guide', 'hub'].includes(pageKind(p))).slice(0, 3);
  const cards = picks
    .filter(Boolean)
    .slice(0, 3)
    .map((p) => {
      const k = pageKind(p);
      const title = k === 'hub' ? t.compare : p.kicker;
      const blurb = t.blurbs[p.path] ?? '';
      return `<a class="pg-card-link mg-glass" data-spotlight href="${p.path}"><span class="kicker">${esc(p.kicker)}</span><b>${esc(title)}</b><span class="pg-card-blurb">${esc(blurb)}</span><span class="pg-card-go" aria-hidden="true">${ARROW}</span></a>`;
    })
    .join('');
  if (!cards) return '';
  return `<section class="pg-related" aria-labelledby="pg-related-h"><div class="wrap"><h2 id="pg-related-h" class="pg-related-h">${esc(t.related)}</h2><div class="pg-related-grid">${cards}</div></div></section>`;
}

export function closingBand(locale) {
  const k = HOME_COPY[locale].cta;
  return `<section class="mg-cta is-compact" aria-labelledby="pg-cta-h">
<div class="mg-cta-bg" aria-hidden="true"><span class="mg-cta-ring"></span><span class="mg-cta-ring is-2"></span></div>
<div class="wrap mg-cta-inner" data-reveal="scale">
<p id="pg-cta-h" class="mg-cta-title">${esc(k.h2)}</p>
<p class="mg-lede">${esc(k.p)}</p>
<div class="hero-actions is-center"><a class="btn btn-lg btn-shine" href="${WEB_APP}" data-magnetic>${esc(k.primary)}${ARROW}</a><button class="btn btn-lg btn-ghost js-install" type="button">${esc(k.install)}</button></div>
</div>
</section>`;
}
