/**
 * Writes the marketing SEO pages into site-static/ (or another directory).
 * Does not publish. The app export in dist/ stays separate and still has no root index.html.
 */
import { cpSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { DEFINITION, HOME, ORIGIN, pages } from './content.mjs';
import { escapeHtml, jsonLd, relIndex, renderFooterLinks, renderPage, renderRedirects, renderRobots, renderSitemap } from './render.mjs';
import { renderWhoLevels, whoBootSource } from './who.mjs';
import { installScript, renderInstallDialog } from './install.mjs';

const here = dirname(fileURLToPath(import.meta.url));

function extractFaqs(html) {
  const faqs = [];
  const re = /<summary>(.*?)<\/summary>[\s\S]*?<p>(.*?)<\/p>/g;
  for (const match of html.matchAll(re)) {
    faqs.push({ q: decode(match[1]), a: decode(match[2]) });
  }
  return faqs;
}

function decode(value) {
  return value
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stepDemo(locale, kind) {
  const pt = locale === 'pt';
  if (kind === 'upload') {
    const caption = pt ? 'Exemplo de material' : 'Example of material';
    const items = pt ? ['Sebenta', 'Manual', 'Slides'] : ['Notes', 'Textbook', 'Slides'];
    const rows = items
      .map(
        (label, index) =>
          `<li data-beat><span class="session-index" aria-hidden="true">${index + 1}</span><span>${label}</span></li>`
      )
      .join('');
    return `<div class="step-demo" data-step-demo="upload"><p class="session-caption">${caption}</p><ol class="session-steps">${rows}</ol><div class="session-bar" aria-hidden="true"><span data-demo-fill></span></div></div>`;
  }
  const caption = pt ? 'Exemplo de mapa' : 'Example of a map';
  const root = pt ? 'Energia' : 'Energy';
  const items = pt
    ? ['Formas', 'Transformações', 'Conservação']
    : ['Forms', 'Transformations', 'Conservation'];
  const rows = items
    .map(
      (label, index) =>
        `<li data-beat><span class="session-index" aria-hidden="true">${index + 1}</span><span>${label}</span></li>`
    )
    .join('');
  return `<div class="step-demo" data-step-demo="map"><p class="session-caption">${caption}</p><div class="mini-map"><p class="mini-map-root" data-beat>${root}</p><div class="mini-map-rail" aria-hidden="true"><span data-demo-fill></span></div><ol class="session-steps">${rows}</ol></div></div>`;
}

function insertStepDemo(html, heading, demo) {
  const needle = `<h3>${heading}</h3>`;
  const at = html.indexOf(needle);
  if (at < 0) throw new Error(`Homepage is missing step ${heading}`);
  const close = html.indexOf('</p></article>', at);
  if (close < 0) throw new Error(`Homepage step ${heading} has no closing paragraph`);
  return `${html.slice(0, close)}</p>${demo}</article>${html.slice(close + '</p></article>'.length)}`;
}

function linkMotion(html) {
  const astro = '<link rel="stylesheet" href="/_astro/SiteFooter.DZJN6EwU.css">';
  const motion = '<link rel="stylesheet" href="/motion.css"><link rel="stylesheet" href="/install.css">';
  if (!html.includes(astro)) throw new Error('Homepage is missing the Astro stylesheet.');
  if (html.includes(motion)) return html;
  return html.replace(astro, `${astro}${motion}`);
}

/** Swaps the old iPhone-only dialog and its script for the shared install guide. */
function rewriteInstall(html, locale) {
  const re = /<div class="install-overlay" id="install-overlay" hidden>[\s\S]*?<\/script>/;
  const found = html.match(re);
  if (!found || !found[0].includes("getElementById('install-bar')")) {
    throw new Error(`Homepage ${locale} is missing the old install dialog and script.`);
  }
  const next = html.replace(re, `${renderInstallDialog(locale)}${installScript(locale)}`);
  if (next.includes('install-overlay')) throw new Error(`Homepage ${locale} still has the old install dialog.`);
  if ((next.match(/class="[^"]*js-install/g) ?? []).length < 1) throw new Error(`Homepage ${locale} has no install button.`);
  return next;
}

const STEP_DEMO_SCRIPT = `<script>
(function () {
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var demos = document.querySelectorAll('[data-step-demo]');
  var arms = [];
  demos.forEach(function (demo) {
    var bits = Array.prototype.slice.call(demo.querySelectorAll('[data-beat]'));
    var fill = demo.querySelector('[data-demo-fill]');
    var timer = 0;
    var hold = 0;
    var io = null;
    function show(count) {
      bits.forEach(function (bit, index) {
        var on = index < count;
        bit.classList.toggle('is-on', on);
        bit.classList.toggle('is-done', on && index < count - 1);
        bit.classList.toggle('is-now', index === count - 1 && count > 0);
      });
      if (!fill || !bits.length) return;
      var ratio = count / bits.length;
      if (demo.getAttribute('data-step-demo') === 'map') fill.style.height = (ratio * 100) + '%';
      else fill.style.width = (ratio * 100) + '%';
    }
    function stop() {
      window.clearInterval(timer);
      window.clearTimeout(hold);
    }
    function settle() {
      stop();
      demo.classList.add('is-in');
      show(bits.length);
    }
    function play() {
      stop();
      if (motion.matches) {
        settle();
        return;
      }
      var step = 0;
      show(0);
      timer = window.setInterval(function () {
        if (motion.matches) {
          settle();
          return;
        }
        step += 1;
        show(step);
        if (step >= bits.length) {
          window.clearInterval(timer);
          hold = window.setTimeout(function () {
            if (demo.classList.contains('is-in') && !motion.matches) play();
          }, 1700);
        }
      }, 520);
    }
    function arm() {
      if (motion.matches || !('IntersectionObserver' in window)) {
        settle();
        return;
      }
      if (io) {
        io.disconnect();
        io = null;
        demo.classList.remove('is-in');
      }
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (motion.matches) {
            settle();
            return;
          }
          if (entry.isIntersecting) {
            demo.classList.add('is-in');
            play();
          } else {
            demo.classList.remove('is-in');
            stop();
          }
        });
      }, { threshold: 0.45 });
      io.observe(demo);
    }
    arms.push(arm);
    arm();
  });
  ${whoBootSource()}
  var armWho = bootWho(motion);
  function onMotion() {
    arms.forEach(function (arm) { arm(); });
    armWho();
  }
  if (motion.addEventListener) motion.addEventListener('change', onMotion);
  else if (motion.addListener) motion.addListener(onMotion);
})();
</script>`;

function detailsHtml(item, negation) {
  const attr = negation ? ' data-seo-negation="true"' : '';
  return `<details${attr}><summary>${escapeHtml(item.q)}</summary><div class="faq-a"><div><p>${escapeHtml(item.a)}</p></div></div></details>`;
}

const REVEAL_FROM = `        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var nodes = document.querySelectorAll('.reveal');
        if (reduce || !('IntersectionObserver' in window)) {
          nodes.forEach(function (n) { n.classList.add('is-in'); });
        } else {
          var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-in');
                io.unobserve(entry.target);
              }
            });
          }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
          nodes.forEach(function (n) { io.observe(n); });
        }`;

const REVEAL_TO = `        var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        var nodes = document.querySelectorAll('.reveal');
        var io = null;
        function settleReveals() {
          if (io) {
            io.disconnect();
            io = null;
          }
          nodes.forEach(function (n) { n.classList.add('is-in'); });
        }
        function armReveals() {
          if (io) {
            io.disconnect();
            io = null;
          }
          if (motion.matches || !('IntersectionObserver' in window)) {
            settleReveals();
            return;
          }
          io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (motion.matches) {
                settleReveals();
                return;
              }
              if (entry.isIntersecting) {
                entry.target.classList.add('is-in');
                io.unobserve(entry.target);
              }
            });
          }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
          nodes.forEach(function (n) {
            if (!n.classList.contains('is-in')) io.observe(n);
          });
        }
        armReveals();
        function onRevealMotion() { armReveals(); }
        if (motion.addEventListener) motion.addEventListener('change', onRevealMotion);
        else if (motion.addListener) motion.addListener(onRevealMotion);`;

function patchReveal(html, locale) {
  const count = html.split(REVEAL_FROM).length - 1;
  if (count !== 1) throw new Error(`Homepage ${locale} reveal script was not found once (${count}).`);
  return html.replace(REVEAL_FROM, REVEAL_TO);
}

function rewriteWho(html, locale) {
  const panel = renderWhoLevels(locale);
  const re = /<div class="who-areas">[\s\S]*?<\/div>(?=<\/aside>)/;
  if (!re.test(html)) throw new Error(`Homepage ${locale} is missing the who panel.`);
  const next = html.replace(re, panel);
  const asideStart = next.indexOf('<aside class="who">');
  const asideEnd = next.indexOf('</aside>', asideStart);
  const aside = next.slice(asideStart, asideEnd);
  if (!aside.includes('data-who-levels') || !aside.includes('aria-live="polite"')) {
    throw new Error(`Homepage ${locale} who panel was not replaced.`);
  }
  for (const banned of [
    'who-examples',
    '>Direito<',
    '>Gestão<',
    '>Engenharia<',
    '>Law<',
    '>Management<',
    '>Engineering<',
    'Exemplos',
    'Examples',
  ]) {
    if (aside.includes(banned)) throw new Error(`Homepage ${locale} who panel still has ${banned}.`);
  }
  if (/<a\b/.test(aside)) throw new Error(`Homepage ${locale} who panel must not contain links.`);
  return next;
}

export function patchHome(html, locale) {
  const spec = HOME[locale];
  let next = html;
  for (const [from, to] of spec.replacements) {
    const count = next.split(from).length - 1;
    if (count < 1) throw new Error(`Homepage ${locale} is missing: ${from.slice(0, 72)}`);
    next = next.replaceAll(from, to);
  }
  for (const question of spec.removeQuestions) {
    const re = new RegExp(`<details><summary>${escapeRegExp(question)}</summary>[\\s\\S]*?</details>`);
    if (!re.test(next)) throw new Error(`Homepage ${locale} is missing FAQ to remove: ${question}`);
    next = next.replace(re, '');
  }
  if (locale === 'en') next = next.replaceAll('subject map', 'Subject Map');

  const listOpen = '<div class="faq-list">';
  if (!next.includes(listOpen)) throw new Error(`Homepage ${locale} is missing the FAQ list.`);
  next = next.replace(listOpen, `${listOpen}${detailsHtml(spec.mind, true)}`);
  const useNeedle = `<details><summary>${spec.useQuestion}</summary>`;
  if (!next.includes(useNeedle)) throw new Error(`Homepage ${locale} is missing ${spec.useQuestion}`);
  next = next.replace(useNeedle, `${detailsHtml(spec.files, false)}${useNeedle}`);

  if (!next.includes(spec.privacyNeedle)) throw new Error(`Homepage ${locale} is missing the privacy link.`);
  next = next.replace(spec.privacyNeedle, `${renderFooterLinks(spec.links)}${spec.privacyNeedle}`);

  const faqs = extractFaqs(next);
  if (!faqs.some((item) => item.q === spec.mind.q)) throw new Error(`Homepage ${locale} FAQ was not inserted.`);
  const ld = jsonLd({
    locale,
    path: locale === 'en' ? '/en/' : '/',
    title: locale === 'en' ? 'MicroGrind — Short sessions. Real progress.' : 'MicroGrind — Sessões curtas. Progresso real.',
    description: spec.description,
    faqs,
  });
  const scripts = next.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g);
  if (!scripts || scripts.length !== 1) throw new Error(`Homepage ${locale} should have one JSON-LD script.`);
  next = next.replace(scripts[0], `<script type="application/ld+json">${JSON.stringify(ld)}</script>`);
  if (!next.includes(DEFINITION[locale])) throw new Error(`Homepage ${locale} lost the definition line.`);
  if (!next.includes(spec.description)) throw new Error(`Homepage ${locale} lost the meta description.`);
  next = linkMotion(next);
  const uploadHeading = locale === 'pt' ? 'Carregas a matéria' : 'Upload your material';
  const mapHeading = locale === 'pt' ? 'Vês o mapa' : 'See your Subject Map';
  next = insertStepDemo(next, uploadHeading, stepDemo(locale, 'upload'));
  next = insertStepDemo(next, mapHeading, stepDemo(locale, 'map'));
  if ((next.match(/data-step-demo=/g) ?? []).length !== 2) {
    throw new Error(`Homepage ${locale} step illustrations were not inserted.`);
  }
  const mapAt = next.indexOf('data-step-demo="map"');
  const mapHtml = next.slice(mapAt, next.indexOf('</article>', mapAt));
  if (/data-min|session-times|session-clock/.test(mapHtml)) {
    throw new Error(`Homepage ${locale} map illustration includes a session duration control.`);
  }
  if (!next.includes("querySelectorAll('[data-step-demo]')")) {
    next = next.replace('</body>', `${STEP_DEMO_SCRIPT}</body>`);
  }
  if (!next.includes('bootWho')) throw new Error(`Homepage ${locale} is missing the who motion runtime.`);
  next = patchReveal(next, locale);
  next = rewriteWho(next, locale);
  next = rewriteInstall(next, locale);
  return next;
}

export function buildSeoSite(outDir) {
  mkdirSync(outDir, { recursive: true });
  rmSync(join(outDir, 'direito'), { recursive: true, force: true });
  rmSync(join(outDir, 'en', 'law'), { recursive: true, force: true });
  for (const page of pages) {
    const rel = relIndex(page.path);
    const file = join(outDir, rel);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, renderPage(page));
  }
  const pt = patchHome(readFileSync(join(here, 'snapshots', 'home-pt.html'), 'utf8'), 'pt');
  const en = patchHome(readFileSync(join(here, 'snapshots', 'home-en.html'), 'utf8'), 'en');
  writeFileSync(join(outDir, 'index.html'), pt);
  mkdirSync(join(outDir, 'en'), { recursive: true });
  writeFileSync(join(outDir, 'en', 'index.html'), en);
  cpSync(join(here, 'site.css'), join(outDir, 'marketing.css'));
  cpSync(join(here, 'motion.css'), join(outDir, 'motion.css'));
  cpSync(join(here, 'install.css'), join(outDir, 'install.css'));
  writeFileSync(join(outDir, '_redirects'), renderRedirects());
  writeFileSync(join(outDir, 'sitemap.xml'), renderSitemap());
  writeFileSync(join(outDir, 'robots.txt'), renderRobots());
  return outDir;
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(realpathSync(entry)).href;
}

if (isDirectRun()) {
  const out = join(here, '..', 'site-static');
  buildSeoSite(out);
  console.log(`SEO pages written under ${out}. Not published. Canonical host ${ORIGIN}.`);
}
