/**
 * Shared site chrome: <head> assets, header with mobile menu, footer and the install dialog (install.mjs).
 * Used by the homepage (home.mjs) and by every content page (render.mjs).
 */
import { FEATURE_ANCHORS } from './anchors.mjs';
import { CHROME, CONTACT_EMAIL } from './content.mjs';

export function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Bump when mg.css / mg.js change so returning visitors get the new files. */
export const ASSET_VERSION = '2026-11-12b';

export const NAV = {
  pt: [
    { id: 'como-funciona', label: 'Como funciona' },
    { id: 'funcionalidades', label: 'Funcionalidades' },
    { id: 'progresso', label: 'Progresso' },
    { href: '/planos/', label: 'Planos' },
    { href: '/comparar/', label: 'Comparar' },
    { href: '/praticar/', label: 'Praticar', highlight: true },
    { id: 'faq', label: 'Perguntas' },
  ],
  en: [
    { id: 'how-it-works', label: 'How it works' },
    { id: 'features', label: 'Features' },
    { id: 'progress', label: 'Progress' },
    { href: '/en/pricing/', label: 'Pricing' },
    { href: '/en/compare/', label: 'Compare' },
    { id: 'faq', label: 'FAQ' },
  ],
};

/** Footer links to each study mode, under Funcionalidades / Features. */
const FEATURE_LINKS = {
  pt: [
    ['map', 'Mapa da matéria'],
    ['lessons', 'Lições'],
    ['flashcards', 'Flashcards'],
    ['quiz', 'Quizzes'],
    ['exam', 'Simulação de exame'],
    ['tutor', 'Tutor IA'],
  ],
  en: [
    ['map', 'Subject Map'],
    ['lessons', 'Lessons'],
    ['flashcards', 'Flashcards'],
    ['quiz', 'Quizzes'],
    ['exam', 'Mock exams'],
    ['tutor', 'AI Tutor'],
  ],
};

const UI = {
  pt: { install: 'Instalar', menu: 'Menu', product: 'Produto', learn: 'Saber mais', langName: 'English', features: 'Ver funcionalidades' },
  en: { install: 'Install', menu: 'Menu', product: 'Product', learn: 'Learn more', langName: 'Português', features: 'Show features' },
};

/** Fonts, design-system stylesheet and script. `extraCss` keeps older page stylesheets first. */
export function headAssets(extraCss = []) {
  const v = ASSET_VERSION;
  return [
    `<link rel="preload" href="/fonts/geist.woff2" as="font" type="font/woff2" crossorigin>`,
    `<link rel="preload" href="/fonts/bricolage.woff2" as="font" type="font/woff2" crossorigin>`,
    ...extraCss.map((href) => `<link rel="stylesheet" href="${href}">`),
    `<link rel="stylesheet" href="/mg.css?v=${v}">`,
    `<script src="/mg.js?v=${v}" defer></script>`,
  ].join('\n');
}

const MENU_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16"></path><path d="M4 16h16"></path></svg>';

function navHref(locale, id, onHome) {
  return onHome ? `#${id}` : `${CHROME[locale].home}#${id}`;
}

const CARET =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>';

/** Header nav links. Funcionalidades / Features gets a dropdown with each study mode. */
function navLinks({ locale, onHome, currentPath, sheet = false }) {
  const ui = UI[locale];
  const featuresId = locale === 'en' ? 'features' : 'funcionalidades';
  return NAV[locale]
    .map((item) => {
      if (item.href) {
        const classes = [item.highlight ? 'mg-nav-hl' : '', item.href === currentPath ? 'is-active' : ''].filter(Boolean).join(' ');
        const current = item.href === currentPath ? ' aria-current="page"' : '';
        return `<a href="${item.href}"${classes ? ` class="${classes}"` : ''}${current}>${esc(item.label)}</a>`;
      }
      const link = `<a href="${navHref(locale, item.id, onHome)}" data-nav="${item.id}">${esc(item.label)}</a>`;
      if (item.id !== featuresId) return link;
      const modes = FEATURE_LINKS[locale]
        .map(([key, label]) => `<a href="${navHref(locale, FEATURE_ANCHORS[locale][key], onHome)}"${sheet ? ' class="mg-sheet-sub"' : ''}>${esc(label)}</a>`)
        .join('');
      if (sheet) return `${link}${modes}`;
      const id = `mg-drop-${locale}`;
      return `<div class="mg-drop" data-drop>${link}<button class="mg-drop-caret" type="button" aria-expanded="false" aria-controls="${id}" aria-label="${esc(ui.features)}" data-drop-toggle>${CARET}</button><div class="mg-drop-menu" id="${id}" data-drop-menu hidden>${modes}</div></div>`;
    })
    .join('');
}

export function renderHeader({ locale, otherPath, onHome = false, currentPath = '' }) {
  const chrome = CHROME[locale];
  const ui = UI[locale];
  const links = navLinks({ locale, onHome, currentPath });
  const sheetLinks = navLinks({ locale, onHome, currentPath, sheet: true });
  return `<a class="skip" href="#conteudo">${esc(chrome.skip)}</a>
<div class="mg-progress" aria-hidden="true"><span data-scroll-progress></span></div>
<header class="site-header mg-header" data-header>
<div class="mg-header-inner">
<a class="logo" href="${chrome.home}" aria-label="MicroGrind"><img src="/logo-mark.png" width="30" height="30" alt="" decoding="async" style="width:30px;height:30px;flex:none;display:block"><span>MicroGrind</span></a>
<nav class="mg-nav" aria-label="${esc(chrome.nav)}">${links}<span class="mg-nav-pill" aria-hidden="true"></span></nav>
<div class="mg-actions">
<a class="lang" href="${otherPath}" hreflang="${chrome.langHreflang}" lang="${chrome.langLang}" aria-label="${ui.langName}">${chrome.lang}</a>
<button class="btn btn-sm js-install" type="button" data-magnetic>${esc(ui.install)}</button>
<button class="mg-menu" type="button" aria-expanded="false" aria-controls="mg-sheet" data-menu><span class="visually-hidden">${esc(ui.menu)}</span>${MENU_ICON}</button>
</div>
</div>
<div class="mg-sheet" id="mg-sheet" data-sheet hidden>
<nav aria-label="${esc(ui.menu)}">${sheetLinks}</nav>
<div class="mg-sheet-actions"><button class="btn js-install" type="button">${esc(ui.install)}</button><a class="lang" href="${otherPath}" hreflang="${chrome.langHreflang}" lang="${chrome.langLang}">${ui.langName}</a></div>
</div>
</header>`;
}

function linkList(links) {
  return links.map((link) => `<p${link.sub ? ' class="footer-sub"' : ''}><a class="footer-privacy" href="${esc(link.href)}">${esc(link.label)}</a></p>`).join('');
}

export function renderFooter({ locale, onHome = false }) {
  const chrome = CHROME[locale];
  const ui = UI[locale];
  const headingAt = chrome.links.findIndex((link) => link.heading);
  const pages = headingAt < 0 ? chrome.links : chrome.links.slice(0, headingAt);
  const compare = headingAt < 0 ? [] : chrome.links.slice(headingAt + 1);
  const compareLabel = headingAt < 0 ? '' : chrome.links[headingAt].label;
  const featuresId = locale === 'en' ? 'features' : 'funcionalidades';
  const product = NAV[locale].flatMap((item) => {
    if (!item.id) return item.href === '/planos/' || item.href === '/en/pricing/' ? [{ href: item.href, label: item.label }] : [];
    const own = { href: navHref(locale, item.id, onHome), label: item.label };
    if (item.id !== featuresId) return [own];
    const modes = FEATURE_LINKS[locale].map(([key, label]) => ({ href: navHref(locale, FEATURE_ANCHORS[locale][key], onHome), label, sub: true }));
    return [own, ...modes];
  });
  return `<footer class="site-footer mg-footer">
<div class="mg-footer-glow" aria-hidden="true"></div>
<div class="wrap mg-footer-grid">
<div class="mg-footer-brand">
<a class="logo" href="${chrome.home}"><img src="/logo-mark.png" width="30" height="30" alt="" decoding="async" style="width:30px;height:30px;flex:none;display:block"><span>MicroGrind</span></a>
<p class="footer-slogan">${esc(chrome.slogan)}</p>
<p>${esc(chrome.blurb)}</p>
<p>${esc(chrome.courses)}</p>
<button class="btn btn-sm mg-footer-cta js-install" type="button">${esc(ui.install)}</button>
</div>
<nav class="mg-footer-col" aria-label="${esc(ui.product)}"><p class="footer-label">${esc(ui.product)}</p>${linkList(product)}</nav>
<nav class="mg-footer-col" aria-label="${esc(ui.learn)}"><p class="footer-label">${esc(ui.learn)}</p>${linkList(pages)}</nav>
<nav class="mg-footer-col footer-compare" aria-label="${esc(compareLabel)}"><p class="footer-label">${esc(compareLabel)}</p>${linkList(compare)}</nav>
<div class="mg-footer-col footer-meta">
<p class="footer-label">${esc(chrome.contact)}</p>
<p class="footer-email"><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
<p><a class="footer-privacy" href="${chrome.privacyHref}">${esc(chrome.privacy)}</a></p>
<p><button type="button" class="footer-privacy mg-link-button" data-cookie-open>${esc(COOKIES[locale].footer)}</button></p>
<p class="footer-copy">© MicroGrind</p>
</div>
</div>
<p class="mg-wordmark" aria-hidden="true" data-wordmark><span>MicroGrind</span></p>
</footer>`;
}

/** Install dialog with the full guide (install.mjs). Every .js-install button opens it (mg.js). */
export { renderInstallDialog } from './install.mjs';

const COOKIES = {
  pt: {
    footer: 'Cookies',
    label: 'Cookies',
    text: 'Usamos cookies de análise (Google Analytics) e o pixel de anúncios da OpenAI para perceber como o site é usado e medir os nossos anúncios. Só os ativamos se aceitares.',
    policy: 'Política de privacidade',
    accept: 'Aceitar',
    decline: 'Recusar',
  },
  en: {
    footer: 'Cookies',
    label: 'Cookies',
    text: 'We use analytics cookies (Google Analytics) and OpenAI’s ad pixel to understand how the site is used and measure our ads. They are only turned on if you accept.',
    policy: 'Privacy policy',
    accept: 'Accept',
    decline: 'Decline',
  },
};

/** Cookie consent banner. mg.js shows it until the visitor chooses; the footer button reopens it. */
export function renderCookieBanner(locale) {
  const t = COOKIES[locale];
  const policy = CHROME[locale].privacyHref;
  return `<section class="mg-cookies" data-cookies role="region" aria-label="${esc(t.label)}" hidden><p>${esc(t.text)} <a href="${policy}">${esc(t.policy)}</a></p><div class="mg-cookies-actions"><button type="button" class="btn btn-sm btn-ghost" data-cookie-choice="denied">${esc(t.decline)}</button><button type="button" class="btn btn-sm" data-cookie-choice="granted">${esc(t.accept)}</button></div></section>`;
}
