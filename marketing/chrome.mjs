/**
 * Shared site chrome: <head> assets, header with mobile menu, footer and the install dialog.
 * Used by the homepage (home.mjs) and by every content page (render.mjs).
 */
import { CHROME, CONTACT_EMAIL, WEB_APP } from './content.mjs';

export function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Bump when mg.css / mg.js change so returning visitors get the new files. */
export const ASSET_VERSION = '2026-11-06';

export const NAV = {
  pt: [
    { id: 'como-funciona', label: 'Como funciona' },
    { id: 'funcionalidades', label: 'Funcionalidades' },
    { id: 'progresso', label: 'Progresso' },
    { id: 'faq', label: 'Perguntas' },
  ],
  en: [
    { id: 'how-it-works', label: 'How it works' },
    { id: 'features', label: 'Features' },
    { id: 'progress', label: 'Progress' },
    { id: 'faq', label: 'FAQ' },
  ],
};

const UI = {
  pt: { install: 'Instalar', menu: 'Menu', product: 'Produto', learn: 'Saber mais', langName: 'English' },
  en: { install: 'Install', menu: 'Menu', product: 'Product', learn: 'Learn more', langName: 'Português' },
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

export function renderHeader({ locale, otherPath, onHome = false }) {
  const chrome = CHROME[locale];
  const ui = UI[locale];
  const links = NAV[locale]
    .map((item) => `<a href="${navHref(locale, item.id, onHome)}" data-nav="${item.id}">${esc(item.label)}</a>`)
    .join('');
  return `<a class="skip" href="#conteudo">${esc(chrome.skip)}</a>
<div class="mg-progress" aria-hidden="true"><span data-scroll-progress></span></div>
<header class="site-header mg-header" data-header>
<div class="mg-header-inner">
<a class="logo" href="${chrome.home}" aria-label="MicroGrind"><img src="/logo-mark.png" width="30" height="30" alt="" decoding="async" style="width:30px;height:30px;flex:none;display:block"><span>MicroGrind</span></a>
<nav class="mg-nav" aria-label="${esc(chrome.nav)}">${links}<span class="mg-nav-pill" aria-hidden="true"></span></nav>
<div class="mg-actions">
<a class="lang" href="${otherPath}" hreflang="${chrome.langHreflang}" lang="${chrome.langLang}" aria-label="${ui.langName}">${chrome.lang}</a>
<button class="btn btn-sm btn-ghost js-install mg-hide-sm" type="button">${esc(ui.install)}</button>
<a class="btn btn-sm" href="${WEB_APP}" data-magnetic>${esc(chrome.open)}</a>
<button class="mg-menu" type="button" aria-expanded="false" aria-controls="mg-sheet" data-menu><span class="visually-hidden">${esc(ui.menu)}</span>${MENU_ICON}</button>
</div>
</div>
<div class="mg-sheet" id="mg-sheet" data-sheet hidden>
<nav aria-label="${esc(ui.menu)}">${links}</nav>
<div class="mg-sheet-actions"><a class="btn" href="${WEB_APP}">${esc(chrome.open)}</a><button class="btn btn-ghost js-install" type="button">${esc(ui.install)}</button><a class="lang" href="${otherPath}" hreflang="${chrome.langHreflang}" lang="${chrome.langLang}">${ui.langName}</a></div>
</div>
</header>`;
}

function linkList(links) {
  return links.map((link) => `<p><a class="footer-privacy" href="${esc(link.href)}">${esc(link.label)}</a></p>`).join('');
}

export function renderFooter({ locale, onHome = false }) {
  const chrome = CHROME[locale];
  const ui = UI[locale];
  const headingAt = chrome.links.findIndex((link) => link.heading);
  const pages = headingAt < 0 ? chrome.links : chrome.links.slice(0, headingAt);
  const compare = headingAt < 0 ? [] : chrome.links.slice(headingAt + 1);
  const compareLabel = headingAt < 0 ? '' : chrome.links[headingAt].label;
  const product = NAV[locale].map((item) => ({ href: navHref(locale, item.id, onHome), label: item.label }));
  return `<footer class="site-footer mg-footer">
<div class="mg-footer-glow" aria-hidden="true"></div>
<div class="wrap mg-footer-grid">
<div class="mg-footer-brand">
<a class="logo" href="${chrome.home}"><img src="/logo-mark.png" width="30" height="30" alt="" decoding="async" style="width:30px;height:30px;flex:none;display:block"><span>MicroGrind</span></a>
<p class="footer-slogan">${esc(chrome.slogan)}</p>
<p>${esc(chrome.blurb)}</p>
<p>${esc(chrome.courses)}</p>
<a class="btn btn-sm mg-footer-cta" href="${WEB_APP}">${esc(chrome.open)}</a>
</div>
<nav class="mg-footer-col" aria-label="${esc(ui.product)}"><p class="footer-label">${esc(ui.product)}</p>${linkList(product)}</nav>
<nav class="mg-footer-col" aria-label="${esc(ui.learn)}"><p class="footer-label">${esc(ui.learn)}</p>${linkList(pages)}</nav>
<nav class="mg-footer-col footer-compare" aria-label="${esc(compareLabel)}"><p class="footer-label">${esc(compareLabel)}</p>${linkList(compare)}</nav>
<div class="mg-footer-col footer-meta">
<p class="footer-label">${esc(chrome.contact)}</p>
<p class="footer-email"><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
<p><a class="footer-privacy" href="${chrome.privacyHref}">${esc(chrome.privacy)}</a></p>
<p class="footer-copy">© MicroGrind</p>
</div>
</div>
<p class="mg-wordmark" aria-hidden="true" data-wordmark><span>MicroGrind</span></p>
</footer>`;
}

const INSTALL = {
  pt: {
    kicker: 'iPhone',
    title: 'Adiciona a MicroGrind ao ecrã principal',
    steps: ['Abre a app web no Safari.', 'Toca em Partilhar.', 'Toca em Adicionar ao Ecrã Principal.'],
    open: 'Abrir a app web',
    close: 'Fechar',
  },
  en: {
    kicker: 'iPhone',
    title: 'Add MicroGrind to your Home Screen',
    steps: ['Open the web app in Safari.', 'Tap Share.', 'Tap Add to Home Screen.'],
    open: 'Open the web app',
    close: 'Close',
  },
};

/** iPhone install dialog. Install buttons (.js-install) open it on iOS and go to the web app elsewhere. */
export function renderInstallDialog(locale) {
  const t = INSTALL[locale];
  const steps = t.steps.map((step) => `<li>${esc(step)}</li>`).join('');
  return `<div class="install-overlay" id="install-overlay" data-lang="${locale}" data-web="${WEB_APP}" data-android hidden><div class="install-dialog" id="install-dialog" role="dialog" aria-modal="true" aria-labelledby="install-dialog-title" tabindex="-1"><p class="kicker">${esc(t.kicker)}</p><h2 id="install-dialog-title">${esc(t.title)}</h2><ol class="install-steps">${steps}</ol><div class="install-dialog-actions"><a class="btn" id="install-open-web" href="${WEB_APP}">${esc(t.open)}</a><button class="btn btn-ghost" id="install-dialog-close" type="button">${esc(t.close)}</button></div></div></div>`;
}
