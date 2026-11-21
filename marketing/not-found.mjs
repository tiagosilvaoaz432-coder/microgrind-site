/**
 * /404.html. Cloudflare Pages serves it, with HTTP 404, for any URL that matches no file and no
 * _redirects rule. Without it, Pages treats the project as a single-page app and answers every
 * unknown URL with the homepage and HTTP 200, which search engines count as duplicate pages.
 * /app/* is not affected: the web app's _redirects ends with `/app/* /app/ 200`.
 *
 * All asset URLs are root-absolute, so the page works at any depth. It is noindex and has no
 * canonical. The copy is in Portuguese with an English line, since the URL says nothing about
 * the visitor's language.
 */
import { ga4HeadSnippet } from '../lib/ga4.mjs';
import { esc, headAssets, renderCookieBanner, renderFooter, renderHeader, renderInstallDialog } from './chrome.mjs';
import { WEB_APP } from './content.mjs';

const LINKS = [
  { href: '/', label: 'Página inicial' },
  { href: '/planos/', label: 'Planos e preços' },
  { href: '/praticar/', label: 'Praticar grátis' },
  { href: '/estudar/', label: 'Como estudar' },
  { href: '/en/', label: 'English', lang: 'en' },
];

export function renderNotFound() {
  const links = LINKS.map((l) => `<li><a href="${l.href}"${l.lang ? ` lang="${l.lang}" hreflang="${l.lang}"` : ''}>${esc(l.label)}</a></li>`).join('');
  return `<!DOCTYPE html>
<html lang="pt-PT">
<head>
${ga4HeadSnippet()}<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Página não encontrada | MicroGrind</title>
<meta name="description" content="Esta página não existe. Volta à página inicial da MicroGrind ou abre a app.">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#07090d">
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script>document.documentElement.classList.add('js');</script>
${headAssets(['/marketing.css'])}
</head>
<body class="mg-page mg-page-notfound">
${renderHeader({ locale: 'pt', otherPath: '/en/', currentPath: '/404' })}
<main id="conteudo" tabindex="-1">
<section class="wrap nf">
<p class="kicker">Erro 404</p>
<h1 class="mg-h2">Esta página não existe.</h1>
<p class="nf-lede">O endereço pode estar mal escrito ou a página mudou de sítio.</p>
<p class="nf-lede" lang="en">This page does not exist. The address may be mistyped, or the page has moved.</p>
<p class="nf-actions"><a class="btn" href="/">Ir para a página inicial</a> <a class="btn btn-ghost" href="${WEB_APP}">Abrir a app</a></p>
<nav aria-label="Páginas principais"><ul class="nf-links">${links}</ul></nav>
</section>
</main>
${renderFooter({ locale: 'pt' })}
${renderInstallDialog('pt')}
${renderCookieBanner('pt')}
</body>
</html>
`;
}
