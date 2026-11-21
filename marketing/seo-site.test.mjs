import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { GA4_MEASUREMENT_ID_PRODUCTION, ga4MeasurementId } from '../lib/ga4.mjs';
import { DEFINITION, HOME, MIND_MAP_FAQ, PAIRS, pages } from './content.mjs';
import { COMPARE_COLUMNS, RETIRED_VS_SLUGS, comparePages, comparePair } from './compare.mjs';
import { buildSeoSite } from './build-seo-site.mjs';
import { NICHE_REDIRECT_RULES, VS_REDIRECT_RULES, escapeHtml, renderRedirects, withGa4Head } from './render.mjs';
import { collidingAppFiles } from '../scripts/check-site-static.mjs';
import { EXAM_SIMULATIONS, PLAN_CREDITS } from '../lib/app-limits.mjs';
import { FEATURE_ANCHORS } from './anchors.mjs';
import { PLAN_FACTS, cheapestMonthlyCents, creditsPerMapPage, euros, mapPages, planCard, pricingPair } from './plans.mjs';
import { REGISTER_URL } from './content.mjs';
import { practicePath } from './practice-page.mjs';
import { PRACTICE_HUB, practicePages } from './practice/index.mjs';
import { studyPath } from './study-page.mjs';
import { STUDY_HUB, studyGuides } from './study/index.mjs';
import { ASSET_VERSION, COOKIES } from './chrome.mjs';
import { assetUrl } from './assets.mjs';
import { bundleMgAttr } from './bundle-mg-attr.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const siteStatic = join(here, '..', 'site-static');
const out = mkdtempSync(join(tmpdir(), 'mg-seo-'));

const DEFERRED = [
  'excerto exato',
  'excerto exacto',
  'exact passage',
  'exact excerpt',
  'verificada contra',
  'verificadas contra',
  'verificado contra',
  'checked against',
  'validado',
  'validated',
  'domínio conceito',
  'concept-by-concept',
  'lei temporária forte',
  'regime mais favorável a rever',
  'não inventa',
  'does not invent',
  'invent things',
  'outside info',
  'conhecimento geral',
  'general knowledge',
  'saúde',
  'health degree',
  'medical school',
];

function read(rel) {
  return readFileSync(join(out, rel), 'utf8');
}

function jsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'missing JSON-LD');
  return JSON.parse(match[1]);
}

function stripSeoNegation(html) {
  let outHtml = '';
  const re = /<([a-zA-Z0-9]+)([^>]*)>|<\/([a-zA-Z0-9]+)>/g;
  let last = 0;
  let skipping = false;
  let skipTag = '';
  let depth = 0;
  for (const match of html.matchAll(re)) {
    if (!skipping) outHtml += html.slice(last, match.index);
    last = match.index + match[0].length;
    if (match[1]) {
      const tag = match[1].toLowerCase();
      const attrs = match[2] ?? '';
      const selfClosing = /\/\s*$/.test(attrs);
      if (skipping) {
        if (!selfClosing && tag === skipTag) depth += 1;
      } else if (!selfClosing && attrs.includes('data-seo-negation="true"')) {
        skipping = true;
        skipTag = tag;
        depth = 1;
      }
    } else if (match[3] && skipping && match[3].toLowerCase() === skipTag) {
      depth -= 1;
      if (depth === 0) skipping = false;
    }
  }
  if (!skipping) outHtml += html.slice(last);
  return outHtml;
}

function body(html) {
  const start = html.indexOf('<body');
  const end = html.indexOf('</body>');
  return html.slice(start, end);
}

try {
  buildSeoSite(out);

  const colliding = await collidingAppFiles(out);
  assert.deepEqual(colliding, [], 'SEO output must not put files under app/');

  const expected = new Map([
    ['index.html', '/'],
    ['en/index.html', '/en/'],
    ['mapa-da-materia/index.html', '/mapa-da-materia/'],
    ['estudar-sebenta/index.html', '/estudar-sebenta/'],
    ['sobre/index.html', '/sobre/'],
    ['comparar/index.html', '/comparar/'],
    ['en/compare/index.html', '/en/compare/'],
    ['en/subject-map/index.html', '/en/subject-map/'],
    ['en/study-from-pdf/index.html', '/en/study-from-pdf/'],
    ['en/about/index.html', '/en/about/'],
    ['instalar/index.html', '/instalar/'],
    ['en/install/index.html', '/en/install/'],
  ]);

  const measurementId = ga4MeasurementId();
  assert.equal(GA4_MEASUREMENT_ID_PRODUCTION, 'G-MXG7DRQWRG');
  assert.equal(ga4MeasurementId({}), 'G-MXG7DRQWRG');
  assert.equal(ga4MeasurementId({ GA_MEASUREMENT_ID: '  G-PREVIEW1  ' }), 'G-PREVIEW1');
  assert.throws(() => ga4MeasurementId({ EXPO_PUBLIC_GA_MEASUREMENT_ID: 'UA-123' }), /G-XXXXXXXX/);
  const taggedTwice = withGa4Head(withGa4Head('<!DOCTYPE html><html><head><meta charset="utf-8"></head><body></body></html>'));
  assert.equal((taggedTwice.match(/googletagmanager\.com\/gtag\/js/g) ?? []).length, 1);
  assert.ok(taggedTwice.indexOf('googletagmanager.com/gtag/js') < taggedTwice.indexOf('</head>'));

  for (const [rel, path] of expected) {
    const html = read(rel);
    const canonical = `https://microgrind.app${path === '/' ? '/' : path}`;
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    const metaDescription = html.match(/<meta name="description" content="(.*?)"/)[1];
    assert.ok(title.length <= 85, `${rel} title is ${title.length} chars`);
    assert.ok(metaDescription.length <= 160, `${rel} description is ${metaDescription.length} chars`);
    const headEnd = html.indexOf('</head>');
    const loaderAt = html.indexOf(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
    assert.ok(loaderAt > html.indexOf('<head') && loaderAt < headEnd, `${rel} loads gtag in head`);
    assert.equal((html.match(/googletagmanager\.com\/gtag\/js/g) ?? []).length, 1, `${rel} loads gtag once`);
    assert.match(html, new RegExp(`function gtag\\(\\)\\{dataLayer\\.push\\(arguments\\);\\}`));
    assert.match(html, new RegExp(`gtag\\('config', '${measurementId}'\\)`));
    assert.match(html, new RegExp(`rel="canonical" href="${canonical.replaceAll('/', '\\/')}"`));
    assert.match(html, /hreflang="pt-PT"/);
    assert.match(html, /hreflang="en"/);
    assert.match(html, /hreflang="x-default"/);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, rel);
    assert.match(html, /<main\b/);
    const graph = jsonLd(html)['@graph'];
    const types = graph.flatMap((node) => (Array.isArray(node['@type']) ? node['@type'] : [node['@type']]));
    assert.ok(types.includes('Organization'), rel);
    assert.ok(types.includes('SoftwareApplication'), rel);
    assert.ok(types.includes('MobileApplication'), rel);
    assert.ok(types.includes('FAQPage'), rel);
    assert.equal(graph.some((node) => node.sameAs), false, rel);
    const app = graph.find((node) => (Array.isArray(node['@type']) ? node['@type'] : [node['@type']]).includes('SoftwareApplication'));
    assert.equal(app.offers['@type'], 'AggregateOffer', `${rel} app offers`);
    assert.equal(app.offers.lowPrice, '0', `${rel} there is a Free plan`);
    assert.equal(app.offers.highPrice, '24.99', `${rel} dearest monthly plan`);
    assert.equal(app.offers.offerCount, 5, rel);
    assert.equal(app.offers.priceCurrency, 'EUR', rel);
    assert.doesNotMatch(JSON.stringify(app.featureList), /5 a 25|5–25|Battles entre|between students|streaks|Mini-li/, `${rel} feature list matches the app`);
    assert.ok(app.featureList.length >= 8, rel);
    assert.ok(app.featureList.some((f) => /Tutor/.test(f)), rel);
    if (path !== '/' && path !== '/en/') {
      const crumbs = graph.find((node) => node['@type'] === 'BreadcrumbList');
      assert.ok(crumbs && crumbs.itemListElement.at(-1).item === canonical, `${rel} breadcrumbs`);
    }
    assert.match(app.description, /Subject Map|mapa da matéria/);
    assert.match(app.description, /qualquer curso|any course/);
    assert.equal(app.audience, undefined, `${rel} must not set a law-only audience`);
    assert.match(app.slogan, /Sessões curtas\. Progresso real\.|Short sessions\. Real progress\./);
    const visible = stripSeoNegation(body(html));
    assert.doesNotMatch(visible, /mapa mental|mind map/i, `${rel} uses the phrase outside a rejection block`);
    const footerStart = html.indexOf('<footer');
    const footerEnd = html.indexOf('</footer>');
    assert.ok(footerStart > 0 && footerEnd > footerStart, `${rel} footer`);
    const footer = html.slice(footerStart, footerEnd);
    assert.doesNotMatch(footer, /\bDireito\b/, `${rel} footer names Direito`);
    assert.doesNotMatch(footer, /\bLaw\b/, `${rel} footer names Law`);
    assert.doesNotMatch(footer, /\b(Gestão|Engenharia|Management|Engineering)\b/, `${rel} footer names a course example`);
    assert.doesNotMatch(footer, /\/vs-/, `${rel} footer links a retired vs page`);
    if (path.startsWith('/en')) {
      assert.match(footer, /From primary to higher education, in any subject\./);
      assert.match(footer, /aria-label="Comparisons"/);
      assert.match(footer, /href="\/en\/compare\/"/);
      assert.doesNotMatch(footer, /href="\/en\/law\/?"/);
    } else {
      assert.match(footer, /Do ensino básico ao superior, em qualquer disciplina\./);
      assert.match(footer, /aria-label="Comparações"/);
      assert.match(footer, /href="\/comparar\/"/);
      assert.doesNotMatch(footer, /href="\/direito\/?"/);
    }
  }

  const homePt = read('index.html');
  const homeEn = read('en/index.html');
  assert.match(homePt, /lang="pt-PT"/);
  assert.match(homeEn, /lang="en"/);
  assert.ok(homePt.includes(DEFINITION.pt));
  assert.ok(homeEn.includes(DEFINITION.en));
  assert.ok(homePt.includes(MIND_MAP_FAQ.pt.q));
  assert.ok(homePt.includes(MIND_MAP_FAQ.pt.a));
  assert.ok(homeEn.includes(MIND_MAP_FAQ.en.q));
  assert.ok(homeEn.includes(MIND_MAP_FAQ.en.a));
  assert.match(homePt, /Primeiro, o mapa da tua matéria/);
  assert.match(homeEn, /First, a map of your course material/);
  assert.doesNotMatch(homePt, /A IA não inventa/);
  assert.doesNotMatch(homeEn, /Does the AI invent/);
  assert.doesNotMatch(homePt, /Estar correto não chega/);
  assert.doesNotMatch(homeEn, /Being correct is not enough/);
  assert.doesNotMatch(homePt, /E se a minha sebenta tiver erros/);
  assert.doesNotMatch(homeEn, /What if my notes have mistakes/);
  assert.match(homePt, /href="\/mapa-da-materia\/"/);
  assert.match(homePt, /href="\/sobre\/"/);
  assert.match(homeEn, /href="\/en\/subject-map\/"/);
  assert.match(homeEn, /href="\/en\/about\/"/);
  assert.doesNotMatch(homePt, /href="\/direito\/?"/);
  assert.doesNotMatch(homeEn, /href="\/en\/law\/?"/);
  assert.match(homePt, /href="\/comparar\/"/);
  assert.match(homeEn, /href="\/en\/compare\/"/);
  assert.doesNotMatch(`${homePt}${homeEn}`, /href="[^"]*\/vs-/);
  assert.match(homeEn, /<strong class="ink-mark">Subject Map<\/strong>/);
  assert.match(homePt, /Serve para qualquer curso/);
  assert.doesNotMatch(homePt, /estudantes de Direito/);
  assert.match(homePt, /mapa da matéria/);
  assert.doesNotMatch(homePt, /5 a 25 minutos|entre 5 e 25|escolhes a duração/);
  assert.match(homePt, /Feito a partir do teu material/);
  assert.match(homePt, /já trabalhaste/);
  assert.match(homePt, /Que ficheiros posso carregar\?/);
  assert.match(homePt, new RegExp(HOME.pt.description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(homeEn, /study app/i);
  assert.match(homeEn, /Subject Map/);
  assert.match(homeEn, /Built for any course/);
  assert.match(homeEn, /short sessions/i);
  assert.doesNotMatch(homeEn, /5–25 minute|between 5 and 25|choose its duration/);
  assert.doesNotMatch(homeEn, /law students/);
  assert.match(homeEn, /The map is the means/);
  assert.match(homeEn, /Built from your own material/);
  assert.match(homeEn, /What can I upload\?/);
  assert.match(homeEn, new RegExp(HOME.en.description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(homePt, /ensino básico, secundário ou superior/);
  assert.match(homePt, /Para qualquer curso ou disciplina, do ensino básico ao superior/);
  assert.match(homePt, /Apontamentos, manual, sebenta ou slides/);
  assert.match(homePt, /para veres como os temas se ligam/);
  assert.match(homePt, /Ao iniciares uma sessão, escolhes quantos itens queres estudar: 5, 10, 20 ou os que quiseres/);
  assert.match(homePt, /estrutura da disciplina, tópico a tópico/);
  assert.match(homePt, /na tua disciplina/);
  assert.match(homePt, /muitas disciplinas/);
  assert.match(homePt, /data-step-demo="upload"/);
  assert.match(homePt, /data-step-demo="map"/);
  assert.match(homePt, /Exemplo de material/);
  assert.match(homePt, /Exemplo de mapa/);
  assert.match(homePt, /Energia/);
  for (const html of [homePt, homeEn]) {
    assert.match(html, /<link rel="stylesheet" href="\/mg\.css\?v=[^"]+">/);
    assert.match(html, /<script src="\/mg\.js\?v=[^"]+" defer><\/script>/);
    assert.doesNotMatch(html, /\/_astro\//, 'homepage must not depend on the old Astro build');
  }
  assert.match(homePt, /Exemplo de sessão/);
  assert.doesNotMatch(homePt, /na universidade/);
  assert.doesNotMatch(homePt, /apontamentos da cadeira/);
  assert.doesNotMatch(homePt, /estrutura da cadeira/);
  assert.doesNotMatch(homePt, /Escolhes 5, 10, 15 ou 25 minutos/);
  assert.doesNotMatch(homePt, /A partir dele escolhes/);
  assert.match(homeEn, /Who it is for/);
  assert.match(homeEn, /primary, secondary or higher education/);
  assert.match(homeEn, /from primary school to higher education/);
  assert.match(homeEn, /Upload your material/);
  assert.match(homeEn, /See your Subject Map/);
  assert.match(homeEn, /Study in short sessions/);
  assert.match(homeEn, /When you start a session, you choose how many items to study: 5, 10, 20 or your own number/);
  assert.match(homeEn, /for your subject/);
  assert.match(homeEn, /several subjects to study/);
  assert.match(homeEn, /data-step-demo="map"/);
  assert.match(homeEn, /Example of a map/);
  assert.match(homeEn, />Energy</);
  assert.match(homeEn, /Example of a session/);
  assert.doesNotMatch(homeEn, /For university students/);
  assert.doesNotMatch(homeEn, /any degree/i);
  assert.doesNotMatch(homeEn, /You choose 5, 10, 15 or 25 minutes/);

  function stepDemo(html, kind) {
    const start = html.indexOf(`data-step-demo="${kind}"`);
    assert.ok(start > 0, kind);
    return html.slice(start, html.indexOf('</article>', start));
  }
  for (const html of [homePt, homeEn]) {
    const upload = stepDemo(html, 'upload');
    const map = stepDemo(html, 'map');
    assert.doesNotMatch(upload, /data-items|session-times|session-clock/);
    assert.doesNotMatch(map, /data-items|session-times|session-clock/);
    assert.match(html, /role="radiogroup"/);
    assert.match(html, /data-session/);
    // Same presets as the app's session setup: 5, 10 and 20 items, no minute picker.
    assert.deepEqual([...html.matchAll(/role="radio" data-items="(\d+)"/g)].map((m) => m[1]), ['5', '10', '20']);
    assert.doesNotMatch(html, /data-min=/);
    assert.match(html, /data-dv-clock data-total="10">0\/10</);
    // Formats the app accepts: no PowerPoint, so slides are named as PDF.
    assert.doesNotMatch(html, /<li[^>]*>Slides<\/li>/);
    // The section with what the app does beyond the demos.
    assert.match(html, /class="mg-extras"/);
    assert.equal((html.match(/class="mx-card /g) ?? []).length, 6);
  }
  assert.match(homePt, /Slides em PDF/);
  assert.match(homeEn, /Slides as PDF/);
  for (const phrase of ['Ajustar mapa', 'Plano de teste', 'Pontos fracos', 'Idioma de estudo', 'Lembretes de estudo', 'Capítulos quando quiseres']) {
    assert.ok(homePt.includes(phrase), `home shows ${phrase}`);
  }
  for (const phrase of ['Adjust map', 'Test plan', 'Weak points', 'Study language', 'Study reminders', 'Chapters when you want them']) {
    assert.ok(homeEn.includes(phrase), `English home shows ${phrase}`);
  }
  // Names as the app shows them in Portuguese.
  assert.match(homePt, />Sequência</);
  assert.match(homePt, />Batalhas</);
  assert.match(homePt, />Focado</);
  assert.doesNotMatch(homePt, /Battles|[a-z ]battle[ !.]|>Streak<|Locked In|Mini-lição/);
  // Price: Free to start, paid from Plus on yearly billing.
  assert.doesNotMatch(`${homePt}${homeEn}`, /Tudo por 4 €|4 € por mês|All for €4|€4 a month/);
  assert.match(homePt, /os planos pagos começam em 3,99\u00a0€\/mês/);
  assert.match(homeEn, /paid plans start at €3\.99\/month/);

  assert.equal(existsSync(join(out, 'direito', 'index.html')), false);
  assert.equal(existsSync(join(out, 'en', 'law', 'index.html')), false);

  const subject = read('en/subject-map/index.html');
  assert.match(subject, /Subject Map vs mind map/);
  assert.match(subject, /syllabus/);
  assert.match(subject, /<table>/);
  assert.match(subject, /What is a mind map\?/);

  const mapa = read('mapa-da-materia/index.html');
  assert.match(mapa, /O mapa da matéria não é um mapa mental/);
  assert.match(mapa, /<table>/);
  assert.match(mapa, /Serve para qualquer curso/);
  assert.match(mapa, /Mapa da matéria — estrutura da disciplina \| MicroGrind/);
  assert.match(mapa, /Quando inicias uma sessão de estudo, escolhes quantos itens queres estudar/);
  assert.match(mapa, /conservação da energia/);
  assert.match(mapa, /Estudas o mapa lição a lição, com um checkpoint no fim de cada capítulo/);
  assert.match(mapa, /Ajustar mapa/);
  assert.doesNotMatch(mapa, /5 a 25|5–25|escolhes a duração/);
  assert.doesNotMatch(mapa, /Direito Penal|irretroatividade|estrutura da cadeira|A partir dele escolhes/);
  assert.doesNotMatch(mapa, /estudantes de Direito/);
  assert.doesNotMatch(mapa, /passagens do documento/);
  assert.doesNotMatch(mapa, /ligada às passagens/);
  const mapaLd = jsonLd(mapa);
  const mapaPage = mapaLd['@graph'].find((node) => node['@type'] === 'WebPage');
  assert.equal(mapaPage.name, 'Mapa da matéria — estrutura da disciplina | MicroGrind');
  const mapaFaq = mapaLd['@graph'].find((node) => node['@type'] === 'FAQPage');
  const mapaMind = mapaFaq.mainEntity.find((item) => item.name === MIND_MAP_FAQ.pt.q);
  assert.equal(mapaMind.acceptedAnswer.text, MIND_MAP_FAQ.pt.a);

  const sebenta = read('estudar-sebenta/index.html');
  assert.match(sebenta, /em qualquer curso/);
  assert.match(sebenta, /Ou fazes uma sessão curta: escolhes quantos itens queres estudar/);
  assert.doesNotMatch(sebenta, /5 a 25|escolhes a duração/);
  assert.match(sebenta, /Estudas a matéria organizada no mapa, lição a lição/);
  assert.doesNotMatch(sebenta, /href="\/direito\/?"/);
  assert.doesNotMatch(sebenta, /Se estudas Direito, começa/);
  assert.doesNotMatch(sebenta, /passagens do teu ficheiro/);

  const pdf = read('en/study-from-pdf/index.html');
  assert.match(pdf, /doesn&#39;t just turn a PDF into flashcards|doesn't just turn a PDF into flashcards/);
  assert.match(pdf, /for any course/);
  assert.match(pdf, /Or do a short session: choose how many items to study/);
  assert.doesNotMatch(pdf, /5–25|between 5 and 25|choose a duration/);
  assert.match(pdf, /See your Subject Map/);
  assert.doesNotMatch(pdf, /href="\/en\/law\/?"/);
  assert.doesNotMatch(pdf, /passages of your file/);
  assert.doesNotMatch(pdf, /For law, start/);
  assert.doesNotMatch(pdf, /outside info/i);

  const sobre = read('sobre/index.html');
  const about = read('en/about/index.html');
  assert.doesNotMatch(sobre, /mapa mental|mind map/i);
  assert.doesNotMatch(about, /mind map|mapa mental/i);
  assert.match(sobre, /ensino básico, secundário ou superior/);
  assert.match(sobre, /Estudas a matéria organizada no mapa, lição a lição ou em sessões curtas em que escolhes quantos itens queres estudar/);
  assert.doesNotMatch(sobre, /5 a 25|escolhes a duração/);
  assert.doesNotMatch(sobre, /Para universitários/);
  assert.doesNotMatch(sobre, /foco de lançamento/);
  assert.match(about, /primary, secondary or higher education/);
  assert.match(about, /Study the material organised in your Subject Map, lesson by lesson or in short sessions where you choose how many items to study/);
  assert.doesNotMatch(about, /5–25|between 5 and 25|choose a duration/);
  assert.match(about, /Built for any course/);
  assert.doesNotMatch(about, /For university students/);
  assert.doesNotMatch(about, /Launch focus is university law/);
  assert.doesNotMatch(about, /law students/);
  assert.match(sobre, /mailto:ola@microgrind.app/);
  assert.match(about, /mailto:ola@microgrind.app/);

  const subjectPage = read('en/subject-map/index.html');
  assert.match(subjectPage, /For any course/);
  assert.match(subjectPage, /conservation of energy/);
  assert.match(subjectPage, /When you start a study session, you choose how many items to study/);
  assert.match(subjectPage, /Adjust map/);
  assert.doesNotMatch(subjectPage, /5–25|between 5 and 25|choose (its|a) duration/);
  assert.doesNotMatch(subjectPage, /Criminal Law|non-retroactivity|href="\/en\/law\/?"/);
  assert.doesNotMatch(subjectPage, /Law students can start/);
  assert.doesNotMatch(subjectPage, /source-linked/);
  assert.doesNotMatch(subjectPage, /linked back to its passages/);
  const subjectFaq = jsonLd(subjectPage)['@graph'].find((node) => node['@type'] === 'FAQPage');
  const subjectMind = subjectFaq.mainEntity.find((item) => item.name === MIND_MAP_FAQ.en.q);
  assert.equal(subjectMind.acceptedAnswer.text, MIND_MAP_FAQ.en.a);

  for (const page of pages) {
    const html = read(page.path === '/' ? 'index.html' : `${page.path.replace(/^\//, '').replace(/\/$/, '')}/index.html`);
    const haystack = html.toLowerCase();
    for (const phrase of DEFERRED) {
      assert.equal(haystack.includes(phrase), false, `${page.path} contains deferred claim: ${phrase}`);
    }
    assert.equal(html.includes('sameAs'), false, page.path);
  }

  for (const phrase of ['excerto exato', 'exact passage', 'lei temporária forte', 'domínio conceito']) {
    assert.equal(homePt.toLowerCase().includes(phrase), false, phrase);
    assert.equal(homeEn.toLowerCase().includes(phrase), false, phrase);
  }

  // One comparison page (/comparar/, /en/compare/); the one-to-one vs pages are gone.
  assert.deepEqual(comparePair, { pt: '/comparar/', en: '/en/compare/' });
  assert.equal(comparePages.length, 2);
  assert.ok(PAIRS.some((pair) => pair.pt === comparePair.pt && pair.en === comparePair.en));
  assert.equal(PAIRS.some((pair) => /\/vs-/.test(pair.pt + pair.en)), false);
  assert.equal(pages.some((page) => /\/vs-/.test(page.path)), false);
  for (const slug of RETIRED_VS_SLUGS) {
    assert.equal(existsSync(join(out, slug, 'index.html')), false, slug);
    assert.equal(existsSync(join(out, 'en', slug, 'index.html')), false, slug);
  }
  function decode(value) {
    return value.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&amp;', '&');
  }
  for (const page of comparePages) {
    const rel = `${page.path.replace(/^\//, '').replace(/\/$/, '')}/index.html`;
    const html = read(rel);
    assert.match(html, new RegExp(`<title>${escapeHtml(page.title).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</title>`));
    const table = html.match(/<div class="compare compare-adv compare-hub"[\s\S]*?<\/table><\/div>/)[0];
    const headerText = [...table.matchAll(/<th scope="col"[^>]*>([\s\S]*?)<\/th>/g)].map((m) => m[1].replace(/<[^>]+>/g, ''));
    assert.deepEqual(headerText, [page.locale === 'pt' ? 'Funcionalidade' : 'Feature', ...COMPARE_COLUMNS]);
    assert.equal(COMPARE_COLUMNS.at(-1), 'MicroGrind');
    const rows = table.match(/<tbody>[\s\S]*<\/tbody>/)[0].match(/<tr>[\s\S]*?<\/tr>/g);
    assert.equal(rows.length, 10, page.path);
    assert.doesNotMatch(table, /comunitária|community library/i, 'community-library row was dropped');
    for (const row of rows.slice(0, -1)) {
      const marks = [...row.matchAll(/class="adv adv-(yes|no)"/g)].map((m) => m[1]);
      assert.equal(marks.length, COMPARE_COLUMNS.length, page.path);
      assert.equal(marks.at(-1), 'yes', `${page.path}: MicroGrind is ✓ on every feature row`);
    }
    const prices = [...rows.at(-1).matchAll(/<span class="adv-price">([\s\S]*?)<\/span>/g)].map((m) => decode(m[1]));
    assert.equal(prices.length, COMPARE_COLUMNS.length, page.path);
    assert.equal(prices.at(-1), page.locale === 'pt' ? 'Grátis · pago desde 3,99\u00a0€/mês' : 'Free · paid from €3.99/month');
    assert.doesNotMatch(html, /4 € por mês|€4 a month|5 a 25|5–25/);
    assert.match(html, page.locale === 'pt' ? /Há um plano Grátis/ : /There is a Free plan/);
    assert.match(html, /https:\/\/quizlet\.com\/upgrade/);
    assert.doesNotMatch(html, /Studingo|N\/D|N\/A/);
    assert.equal((html.match(/<summary>/g) ?? []).length, 5, page.path);
  }

  const sitemap = read('sitemap.xml');
  for (const pair of PAIRS) {
    assert.ok(sitemap.includes(`<loc>https://microgrind.app${pair.pt === '/' ? '/' : pair.pt}</loc>`), pair.pt);
    assert.ok(sitemap.includes(`<loc>https://microgrind.app${pair.en}</loc>`), pair.en);
    assert.ok(sitemap.includes('hreflang="pt-PT"'));
    assert.ok(sitemap.includes('hreflang="en"'));
    assert.ok(sitemap.includes('hreflang="x-default"'));
  }
  const robots = read('robots.txt');
  assert.match(robots, /Sitemap: https:\/\/microgrind\.app\/sitemap\.xml/);
  assert.match(robots, /Allow: \//);
  assert.doesNotMatch(sitemap, /\/direito\/|\/en\/law\//);
  assert.doesNotMatch(sitemap, /\/vs-/);

  const redirects = read('_redirects');
  assert.equal(redirects, renderRedirects());
  for (const [source, destination, code] of NICHE_REDIRECT_RULES) {
    assert.match(redirects, new RegExp(`^${source.replaceAll('/', '\\/')} ${destination.replaceAll('/', '\\/')} ${code}$`, 'm'));
  }
  assert.doesNotMatch(redirects, /^\/mapa-da-materia/m);
  for (const [source, destination, code] of VS_REDIRECT_RULES) {
    assert.match(redirects, new RegExp(`^${source.replaceAll('/', '\\/')} ${destination.replaceAll('/', '\\/')} ${code}$`, 'm'));
  }
  function redirectTo(pathname) {
    for (const line of redirects.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [source, destination, code] = trimmed.split(/\s+/);
      if (source === pathname) return { destination, code };
    }
    return null;
  }
  assert.deepEqual(redirectTo('/direito'), { destination: '/', code: '301' });
  assert.deepEqual(redirectTo('/direito/'), { destination: '/', code: '301' });
  assert.deepEqual(redirectTo('/en/law'), { destination: '/en/', code: '301' });
  assert.deepEqual(redirectTo('/en/law/'), { destination: '/en/', code: '301' });
  assert.equal(redirectTo('/mapa-da-materia'), null);
  assert.equal(redirectTo('/mapa-da-materia/'), null);
  assert.equal(redirectTo('/comparar'), null);
  assert.equal(redirectTo('/comparar/'), null);
  assert.equal(redirectTo('/en/compare'), null);
  assert.equal(redirectTo('/en/compare/'), null);
  assert.deepEqual(redirectTo('/vs-quizlet/'), { destination: '/comparar/', code: '301' });
  assert.deepEqual(redirectTo('/en/vs-astra-ai'), { destination: '/en/compare/', code: '301' });
  assert.equal([...redirects.matchAll(/^\/comparar|^\/en\/compare/gm)].length, 0, 'the comparison page itself is never redirected');

  // Rule checks read the CSS sources; the published files are minified (assets.mjs).
  const css = readFileSync(join(here, 'site.css'), 'utf8');
  assert.match(css, /\.compare-adv td\.adv/);
  assert.match(css, /\.compare-hub\{overflow-x:auto/);
  assert.match(css, /\.compare-hub table\{width:100%;min-width:52rem;table-layout:fixed\}/);
  assert.match(css, /\.adv-yes \.adv-glyph\{color:#042f2e;background:#5eead4\}/);
  assert.match(css, /\.adv-no \.adv-glyph\{color:#4c0519;background:#fecdd3\}/);
  const motion = readFileSync(join(here, 'motion.css'), 'utf8');
  assert.match(motion, /\.step-demo/);
  assert.match(motion, /prefers-reduced-motion/);
  assert.doesNotMatch(motion, /session-times|data-min/);
  assert.match(motion, /\.who-level/);
  assert.match(motion, /#f3d25a/);
  assert.match(motion, /translateY\(8px\)/);
  assert.match(motion, /translateY\(-2px\)/);
  assert.match(motion, /background:\s*transparent/);
  const runtime = read('mg.js');
  assert.match(runtime, /prefers-reduced-motion: reduce/);
  assert.match(runtime, /onMotionChange\(armReveals\)/, 'reveals must settle when reduced motion turns on');
  assert.match(runtime, /if \(reduced\(\)\) \{ show\(beats\.length\); return; \}/, 'step demos must settle with reduced motion');
  const designCss = readFileSync(join(here, 'mg.css'), 'utf8');
  assert.match(designCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(designCss, /\[hidden\] \{ display: none !important; \}/);
  for (const font of ['bricolage.woff2', 'geist.woff2', 'geist-mono.woff2']) {
    assert.ok(existsSync(join(out, 'fonts', font)), font);
  }

  function whoAside(html) {
    const start = html.indexOf('<aside class="who">');
    const end = html.indexOf('</aside>', start);
    assert.ok(start > 0 && end > start, 'who aside');
    return html.slice(start, end);
  }
  const whoPt = whoAside(homePt);
  const whoEn = whoAside(homeEn);
  assert.match(whoPt, /<h3>Para quem<\/h3>/);
  assert.match(
    whoPt,
    /Para quem estuda no ensino básico, secundário ou superior, em qualquer curso ou disciplina\. O mapa da matéria parte dos teus apontamentos, do manual, da sebenta ou dos slides\./
  );
  assert.match(whoPt, /Ensino básico/);
  assert.match(whoPt, />Secundário</);
  assert.match(whoPt, />Superior</);
  assert.match(whoPt, /Qualquer curso ou disciplina — do teu material\./);
  assert.match(whoPt, /data-who-rotator/);
  assert.match(whoPt, /aria-live="polite"/);
  assert.match(whoPt, /class="is-on">Biologia</);
  assert.match(whoPt, /História/);
  assert.match(whoPt, /Economia/);
  assert.match(whoPt, /Inglês/);
  assert.doesNotMatch(whoPt, /<a\b|who-examples|Exemplos|>Direito<|>Gestão<|>Engenharia</);
  assert.match(whoEn, /<h3>Who it is for<\/h3>/);
  assert.match(
    whoEn,
    /For students at any level — primary, secondary or higher education — in any course or subject\. Your Subject Map is built from your own notes, textbook or slides\./
  );
  assert.match(whoEn, />Primary</);
  assert.match(whoEn, />Secondary</);
  assert.match(whoEn, />Higher education</);
  assert.match(whoEn, /Any course or subject — from your own material\./);
  assert.match(whoEn, /class="is-on">Biology</);
  assert.match(whoEn, /History/);
  assert.match(whoEn, /Economics/);
  assert.match(whoEn, /English/);
  assert.match(whoEn, /aria-live="polite"/);
  assert.doesNotMatch(whoEn, /<a\b|who-examples|Examples|>Law<|>Management<|>Engineering</);
  assert.match(homePt, /data-who-rotator/);

  // Redesigned homepage: story sections, interactive demos, honest labelling.
  for (const [html, tag, sample] of [
    [homePt, 'Demo ilustrativa', 'Demo · dados fictícios'],
    [homeEn, 'Illustrative demo', 'Demo · sample data'],
  ]) {
    for (const hook of ['data-hero-device', 'data-scene', 'data-mapx', 'data-studio', 'data-score', 'data-streak', 'data-battle', 'data-tutor', 'data-exam', 'data-cards', 'data-quiz']) {
      assert.match(html, new RegExp(hook), hook);
    }
    assert.ok(html.includes(tag), tag);
    assert.ok(html.includes(sample), sample);
    assert.doesNotMatch(html, /AggregateRating|ratingValue|testimonial|\d[\d.,]* (estudantes|students|utilizadores|users)\b/i);
    const withoutInstall = html.replace(/<dialog class="ig-dialog"[\s\S]*?<\/dialog>/, '');
    assert.equal((withoutInstall.match(/role="tablist"/g) ?? []).length, 2);
    assert.match(html, /href="https:\/\/microgrind\.app\/app\/"/);
    assert.match(html, /class="btn btn-lg btn-ghost js-install"/);
    assert.match(html, /id="install-dialog"/);
  }
  assert.match(homePt, /Tutor IA/);
  assert.match(homeEn, /AI Tutor/);
  assert.match(homePt, /Os tópicos seguem a ordem dos teus resumos\./);
  assert.match(homeEn, /Topics follow the order of your own summaries\./);
  assert.match(runtime, /, 4500\)/);
  assert.match(sobre, /data-who-levels/);
  assert.match(sobre, /Ensino básico/);
  assert.match(sobre, /Qualquer curso ou disciplina — do teu material\./);
  assert.match(sobre, /href="\/motion\.css\?v=[0-9a-f]{10}"/);
  assert.match(sobre, /addEventListener\('change', onMotion\)/);
  assert.match(sobre, /Para quem estuda no ensino básico, secundário ou superior/);
  assert.doesNotMatch(sobre, /who-examples|>Direito<|>Gestão<|>Engenharia</);
  assert.match(about, /data-who-levels/);
  assert.match(about, />Primary</);
  assert.match(about, />Higher education</);
  assert.match(about, /Any course or subject — from your own material\./);
  assert.match(about, /href="\/motion\.css\?v=[0-9a-f]{10}"/);
  assert.match(about, /primary, secondary or higher education/);
  assert.doesNotMatch(about, /who-examples|>Law<|>Management<|>Engineering</);

  // Install guide: its own page, and the same guide in the dialog on every page.
  for (const [rel, steps] of [
    ['instalar/index.html', ['Toca em Partilhar', 'Adicionar ao ecrã principal', 'Toca no menu ⋮', 'Toca em Instalar app']],
    ['en/install/index.html', ['Tap Share', 'Add to Home Screen', 'Tap the ⋮ menu', 'Tap Install app']],
  ]) {
    const html = read(rel);
    assert.match(html, /<div class="ig ig--page" data-ig id="guia">/, rel);
    for (const step of steps) assert.ok(html.includes(step), `${rel} ${step}`);
    for (const tab of ['ios', 'android', 'desktop']) assert.match(html, new RegExp(`data-ig-tab="${tab}"`), `${rel} ${tab}`);
    assert.doesNotMatch(html, /<nav class="pg-toc"/, rel);
  }
  for (const rel of ['index.html', 'en/index.html', 'sobre/index.html', 'en/compare/index.html', 'instalar/index.html']) {
    const html = read(rel);
    assert.equal((html.match(/<dialog class="ig-dialog" id="install-dialog"/g) ?? []).length, 1, rel);
    assert.match(html, /<div class="ig ig--dialog" data-ig id="mgi">/, rel);
    assert.doesNotMatch(html, /install-overlay/, rel);
    // No "Abrir na web": the install guide's "Continuar instalação" opens the web app instead.
    assert.doesNotMatch(html, /Abrir na web|Open on the web|Abrir a app web|Open the web app/, rel);
    const dialogHtml = html.slice(html.indexOf('<dialog class="ig-dialog"'), html.indexOf('</dialog>'));
    assert.equal((dialogHtml.match(/<a class="btn ig-go-btn" href="https:\/\/microgrind\.app\/app\/" data-ig-go>/g) ?? []).length, 6, rel);
    assert.match(dialogHtml, /Continuar instalação|Continue installation/, rel);
    assert.match(html, /js-install/, rel);
  }
  assert.match(homePt, /href="\/instalar\/"/);
  assert.match(homeEn, /href="\/en\/install\/"/);
  assert.match(runtime, /installDialog\.showModal\(\)/);

  // Content-page template: hero, related cards, closing band; privacy pages use it too.
  for (const rel of ['mapa-da-materia/index.html', 'sobre/index.html', 'en/compare/index.html']) {
    const html = read(rel);
    assert.match(html, /<header class="ph[^"]*ph-kind-/, rel);
    assert.match(html, /class="pg-related"/, rel);
    assert.match(html, /class="mg-cta is-compact"/, rel);
    assert.match(html, /data-toc/, rel);
  }
  for (const [rel, lang, sentences] of [
    [
      'privacidade/index.html',
      'pt-PT',
      [
        'Os cookies _ga e _ga_* só são criados depois de aceitares',
        '<strong>Necessários.</strong> Guardamos no teu browser a tua escolha sobre cookies (mg-consent) e se fechaste o aviso para instalar a app. No mesmo separador, guardamos também a origem da visita (por exemplo chatgpt), só o domínio de onde vieste e a página de entrada, até fechares o separador, para saber de onde veio um registo. Contamos visitas por dia e por origem, sem cookies, sem identificadores e sem o endereço IP. Nada disto te identifica e não precisa de consentimento.',
        '<time datetime="2026-11-21">21 de novembro de 2026</time>',
      ],
    ],
    [
      'en/privacy/index.html',
      'en',
      [
        'The _ga and _ga_* cookies are only set after you accept',
        '<strong>Necessary.</strong> We store your cookie choice (mg-consent) and whether you closed the install prompt in your browser. In the same tab we also keep where the visit came from (for example chatgpt), the referring domain only, and the landing page, until you close the tab, so a signup can be attributed. We count visits per day and per source, with no cookies, no identifiers and no IP address. None of this identifies you and it needs no consent.',
        '<time datetime="2026-11-21">21 November 2026</time>',
      ],
    ],
  ]) {
    const html = read(rel);
    assert.match(html, new RegExp(`<html lang="${lang}"`), rel);
    for (const sentence of sentences) assert.ok(html.includes(sentence), `${rel}: ${sentence.slice(0, 60)}`);
    assert.doesNotMatch(html, /Não te identificam e não precisam de consentimento|They do not identify you and need no consent/, `${rel} old necessary-cookies text`);
    assert.match(html, /mailto:ola@microgrind\.app/, rel);
    assert.match(html, /https:\/\/www\.cnpd\.pt\//, rel);
    assert.match(html, /Google Analytics 4/, rel);
    assert.equal(html.includes('/_astro/'), false, rel);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, rel);
    assert.match(html, /<footer class="site-footer mg-footer">/, rel);
  }

  // Analytics only after consent: no Google script tag in the HTML, a banner, and a footer button.
  for (const html of [homePt, homeEn, read('sobre/index.html'), read('privacidade/index.html')]) {
    assert.doesNotMatch(html, /<script[^>]+googletagmanager/);
    assert.match(html, /gtag\('consent', 'default', \{[^}]*analytics_storage: 'denied'/);
    assert.match(html, /localStorage\.getItem\('mg-consent'\) === 'granted'/);
    assert.match(html, /data-cookies[^>]*hidden/);
    assert.match(html, /data-cookie-choice="granted"/);
    assert.match(html, /data-cookie-choice="denied"/);
    assert.match(html, /data-cookie-open/);
  }
  assert.match(runtime, /mgLoadAnalytics/);

  // Cookie banner: GA4 and the ChatGPT ads pixel, both only after "Aceitar" / "Accept".
  assert.equal(COOKIES.pt.text, 'Usamos cookies de análise (Google Analytics) e o pixel dos anúncios no ChatGPT para perceber como o site é usado e medir os nossos anúncios. Só os ativamos se aceitares.');
  assert.equal(COOKIES.en.text, 'We use analytics cookies (Google Analytics) and the ChatGPT ads pixel to understand how the site is used and measure our ads. They are only turned on if you accept.');
  for (const [html, locale] of [[homePt, 'pt'], [homeEn, 'en'], [read('mapa-da-materia/index.html'), 'pt'], [read('en/subject-map/index.html'), 'en']]) {
    assert.ok(html.includes(`<p>${COOKIES[locale].text} <a href=`), `${locale} cookie banner text`);
    assert.doesNotMatch(html, /pixel de anúncios da OpenAI|OpenAI’s ad pixel/, 'old banner text');
  }

  // mg-attr.js (attribution + cookieless counter): on every page, right after mg.js, no secrets anywhere.
  // Content-hash versions (assets.mjs): each file's ?v= changes whenever the file does.
  const mgJsTag = `<script src="${assetUrl('mg.js')}" defer></script>`;
  const attrTag = `<script type="module" src="${assetUrl('mg-attr.js')}"></script>`;
  assert.match(ASSET_VERSION, /^[0-9a-f]{10}$/);
  const builtFiles = [];
  (function list(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) list(path);
      else builtFiles.push(relative(out, path));
    }
  })(out);
  const builtPages = builtFiles.filter((rel) => rel.endsWith('.html'));
  assert.ok(builtPages.length >= 40, `found ${builtPages.length} pages`);
  for (const rel of builtPages) {
    const html = read(rel);
    assert.equal(html.split(attrTag).length - 1, 1, `${rel} loads mg-attr.js once`);
    assert.ok(html.includes(`${mgJsTag}\n${attrTag}`), `${rel} loads mg-attr.js right after mg.js`);
    assert.ok(html.indexOf(attrTag) < html.indexOf('</head>'), `${rel} mg-attr.js in <head>`);
    assert.equal(html.includes('__MG_HIT__'), false, `${rel}: the counter config is only added at publish time`);
  }
  const attrBundle = read('mg-attr.js');
  assert.equal(attrBundle, bundleMgAttr());
  assert.match(attrBundle, /record_web_hit/);
  assert.match(attrBundle, /__MG_HIT__/);
  assert.match(attrBundle, /data-ig-copy/);
  assert.equal(attrBundle.includes('eyJ'), false, 'mg-attr.js must not embed a JWT');
  assert.equal(attrBundle.includes('supabase.co'), false, 'mg-attr.js must not embed a project URL');
  assert.doesNotMatch(attrBundle, /\/\*|^\s*\/\//m, 'mg-attr.js has no comments');
  // site-static/ is in git: no Supabase URL, anon key (a JWT) or counter config may ever land there.
  (function scan(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) scan(path);
      else if (!/\.(woff2|png|ico|jpg|webp)$/.test(entry.name)) {
        const text = readFileSync(path, 'utf8');
        const rel = relative(siteStatic, path);
        assert.equal(text.includes('eyJ'), false, `site-static/${rel} contains a JWT-like string`);
        assert.equal(/supabase\.co\b/.test(text), false, `site-static/${rel} contains a Supabase URL`);
        assert.equal(text.includes('__MG_HIT__='), false, `site-static/${rel} contains the counter config`);
      }
    }
  })(siteStatic);
  // Every generated file is committed as built (covers mg-attr.js and the asset versions on every page).
  for (const rel of builtFiles) {
    assert.ok(readFileSync(join(siteStatic, rel)).equals(readFileSync(join(out, rel))), `${rel} is stale; run npm run build`);
  }

  const committedRels = [...expected.keys(), 'privacidade/index.html', 'en/privacy/index.html', 'sitemap.xml', 'robots.txt', 'marketing.css', 'motion.css', 'practice.css', 'practice.js', 'mg-attr.js', '_redirects', '_headers', '404.html'];
  for (const rel of committedRels) {
    const fresh = read(rel);
    const committed = readFileSync(join(siteStatic, rel), 'utf8');
    assert.equal(committed, fresh, `${rel} is stale; run node marketing/build-seo-site.mjs`);
  }

  function walk(dir, acc = []) {
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, name.name);
      if (name.isDirectory()) walk(path, acc);
      else acc.push(relative(out, path));
    }
    return acc;
  }
  assert.equal(walk(out).some((path) => path.startsWith('app/') || path.startsWith('app' + '/')), false);
  assert.equal(walk(out).some((path) => path.startsWith('direito/') || path.startsWith('en/law/')), false);
  assert.equal(existsSync(join(siteStatic, 'direito', 'index.html')), false);
  assert.equal(existsSync(join(siteStatic, 'en', 'law', 'index.html')), false);

  // Pricing page: numbers match the app, both languages are paired, every card renders.
  for (const [code, plan] of Object.entries(PLAN_FACTS)) {
    assert.equal(plan.credits, PLAN_CREDITS[code], `${code} AI credits match the app`);
    assert.equal(plan.exams, EXAM_SIMULATIONS[code], `${code} exam simulations match the app`);
  }
  assert.equal(creditsPerMapPage(), 18, 'a 3 000-character map page costs 18 credits, like mapCredits(3000)');
  assert.deepEqual(
    Object.fromEntries(Object.keys(PLAN_FACTS).map((code) => [code, mapPages(PLAN_FACTS[code].credits)])),
    { free: 55, plus: 111, pro: 222, ultra: 555, season: 333 },
    'map pages per plan, floored like the app'
  );
  assert.equal(cheapestMonthlyCents(), 399, 'cheapest paid price: Plus yearly, €3.99 a month');
  assert.deepEqual(planCard('plus', 'pt').facts, [
    'Mapa da matéria, lições, flashcards, quizzes e modo exame',
    '2\u202f000 créditos de IA por mês, para o tutor, exercícios, mapas e exames',
    'Dá para ≈ 2\u202f000 mensagens do tutor ou ≈ 111 páginas de mapa',
    '3 simulações de exame com IA por mês',
    'Os créditos de IA renovam todos os meses, também no plano anual',
  ]);
  assert.deepEqual(planCard('free', 'en').facts, [
    'Subject Map, lessons, flashcards, quizzes and exam mode',
    '1,000 AI credits (once), for the tutor, exercises, maps and exams',
    'Enough for ≈ 1,000 tutor messages or ≈ 55 map pages',
    'No AI exam simulations',
  ]);
  assert.ok(planCard('season', 'pt').facts.includes('6\u202f000 créditos de IA ao longo de 8 semanas, para o tutor, exercícios, mapas e exames'));
  assert.ok(planCard('pro', 'en').facts.includes('Advanced tutor mode'));
  assert.equal(euros(cheapestMonthlyCents(), 'pt'), '3,99\u00a0€');
  assert.ok(PAIRS.some((pair) => pair.pt === pricingPair.pt && pair.en === pricingPair.en));
  for (const [rel, prices] of [
    ['planos/index.html', ['4,99\u00a0€', '9,99\u00a0€', '24,99\u00a0€', '19,99\u00a0€', '47,90\u00a0€', '95,90\u00a0€', '239,90\u00a0€']],
    ['en/pricing/index.html', ['€4.99', '€9.99', '€24.99', '€19.99', '€47.90', '€95.90', '€239.90']],
  ]) {
    const html = readFileSync(join(out, rel), 'utf8');
    assert.equal((html.match(/class="pl-card/g) ?? []).length, 5, rel);
    for (const price of prices) assert.ok(html.includes(price), `${rel} shows ${price}`);
    assert.ok(html.includes('href="https://microgrind.app/app/plans"'), `${rel} links to the app plans screen`);
    assert.doesNotMatch(html, /caracteres|characters|tokens/i, `${rel} no longer sells the retired character and token limits`);
    assert.match(html, rel.startsWith('en/') ? /AI credits/ : /créditos de IA/, `${rel} sells AI credits`);
  }

  // Homepage: each study mode has its own anchor, and each studio tab names it.
  for (const [locale, rel] of [['pt', 'index.html'], ['en', 'en/index.html']]) {
    const html = readFileSync(join(out, rel), 'utf8');
    for (const [key, id] of Object.entries(FEATURE_ANCHORS[locale])) {
      assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) ?? []).length, 1, `${rel} has one #${id}`);
      if (key !== 'map') assert.ok(html.includes(`data-anchor="${id}"`), `${rel} tab opens #${id}`);
    }
  }

  // Free practice pages (/praticar/): indexable, complete without JS, one CTA to sign-up.
  assert.ok(practicePages.length >= 10, 'at least ten practice pages');
  const practiceTitles = new Set();
  const practiceDescriptions = new Set();
  const practiceSitemap = read('sitemap.xml');
  const hub = read('praticar/index.html');
  assert.ok(practiceSitemap.includes('<loc>https://microgrind.app/praticar/</loc>'), 'hub in sitemap');
  assert.match(read('index.html'), /href="\/praticar\/"/, 'homepage footer links the practice hub');
  assert.equal((hub.match(/<h1[\s>]/g) ?? []).length, 1, 'hub has one h1');
  assert.ok(jsonLd(hub)['@graph'].some((node) => node['@type'] === 'ItemList'), 'hub ItemList');
  for (const page of practicePages) {
    const path = practicePath(page);
    assert.ok(path.startsWith('/praticar/'), path);
    assert.doesNotMatch(path, /^\/(direito|en\/law)\b/, `${path} must not reuse a retired URL`);
    assert.ok(hub.includes(`href="${path}"`), `hub links ${path}`);
    assert.ok(practiceSitemap.includes(`<loc>https://microgrind.app${path}</loc>`), `${path} in sitemap`);
    const rel = `${path.slice(1)}index.html`;
    const html = read(rel);
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    const description = html.match(/<meta name="description" content="(.*?)"/)[1];
    assert.ok(title.length <= 85, `${rel} title is ${title.length} chars`);
    assert.ok(description.length <= 160, `${rel} description is ${description.length} chars`);
    assert.ok(!practiceTitles.has(title), `${rel} title is unique`);
    assert.ok(!practiceDescriptions.has(description), `${rel} description is unique`);
    practiceTitles.add(title);
    practiceDescriptions.add(description);
    assert.match(html, /<html lang="pt-PT">/);
    assert.ok(html.includes(`<link rel="canonical" href="https://microgrind.app${path}">`), `${rel} canonical`);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${rel} one h1`);
    assert.equal((html.match(/googletagmanager\.com\/gtag\/js/g) ?? []).length, 1, `${rel} gtag once`);
    assert.doesNotMatch(html, /<script[^>]+googletagmanager/, `${rel} no Google script before consent`);
    assert.match(html, /data-cookie-choice="granted"/, `${rel} cookie banner`);
    assert.match(html, /src="\/practice\.js\?v=/, `${rel} loads practice.js`);
    const graph = jsonLd(html)['@graph'];
    const resource = graph.find((node) => [node['@type']].flat().includes('LearningResource'));
    assert.ok(resource && resource.isAccessibleForFree === true && resource.inLanguage === 'pt-PT', `${rel} LearningResource`);
    const crumbs = graph.find((node) => node['@type'] === 'BreadcrumbList');
    assert.equal(crumbs.itemListElement.length, 3, `${rel} breadcrumbs`);
    assert.equal(crumbs.itemListElement[1].item, `https://microgrind.app${PRACTICE_HUB.path}`);
    assert.ok(graph.some((node) => node['@type'] === 'FAQPage'), `${rel} FAQPage`);
    const total = page.items.length;
    assert.ok(total >= 10, `${rel} has ${total} items`);
    assert.equal((html.match(/data-item /g) ?? []).length, total, `${rel} renders every item`);
    assert.equal((html.match(/<details class="pq-answer/g) ?? []).length, total, `${rel} every answer is in the HTML`);
    if (page.mode === 'quiz') {
      assert.equal((html.match(/data-correct/g) ?? []).length, total, `${rel} one right option per question`);
      for (const item of page.items) {
        assert.equal(item.options.length, 4, `${rel}: ${item.q}`);
        assert.equal(new Set(item.options).size, 4, `${rel}: options are distinct in ${item.q}`);
        assert.ok(item.why.length > 20, `${rel}: explanation for ${item.q}`);
      }
      const slots = new Set(page.items.map((item) => item.answer));
      assert.ok(slots.size >= 3, `${rel} spreads the right answer over A–D`);
      assert.equal(resource.hasPart.length, total, `${rel} Quiz questions in JSON-LD`);
    }
    assert.ok(html.includes(`href="${escapeHtml(`${REGISTER_URL}?utm_source=praticar&utm_medium=seo&utm_campaign=${page.slug}`).replaceAll('&quot;', '"')}"`), `${rel} CTA to sign-up with UTM`);
    assert.match(html, /Cria perguntas a partir dos teus próprios apontamentos com o MicroGrind/);
    const haystack = html.toLowerCase();
    for (const phrase of DEFERRED) assert.equal(haystack.includes(phrase), false, `${rel} contains deferred claim: ${phrase}`);
    for (const slug of page.related) assert.ok(html.includes(`href="/praticar/${slug}/"`), `${rel} links related ${slug}`);
  }
  for (const rel of ['practice.css', 'practice.js', 'praticar/index.html', ...practicePages.map((p) => `${practicePath(p).slice(1)}index.html`)]) {
    assert.equal(readFileSync(join(siteStatic, rel), 'utf8'), read(rel), `${rel} is stale; run npm run build`);
  }

  // Header: Praticar link, Funcionalidades/Features dropdown with every study mode; PT home pop-up.
  for (const [rel, locale] of [['index.html', 'pt'], ['sobre/index.html', 'pt'], ['praticar/index.html', 'pt'], ['en/index.html', 'en']]) {
    const html = read(rel);
    const header = html.slice(html.indexOf('<header class="site-header'), html.indexOf('</header>'));
    const drop = header.match(/<div class="mg-drop" data-drop>([\s\S]*?)<\/div><\/div>/);
    assert.ok(drop, `${rel} has the features dropdown`);
    assert.match(drop[0], /aria-expanded="false"/);
    assert.match(drop[0], /data-drop-menu hidden/);
    const modes = Object.values(FEATURE_ANCHORS[locale]);
    for (const id of modes) assert.ok(drop[0].includes(`#${id}"`), `${rel} dropdown links #${id}`);
    for (const id of modes) assert.ok(header.includes(`class="mg-sheet-sub"`) && header.includes(`#${id}" class="mg-sheet-sub"`), `${rel} mobile menu links #${id}`);
    if (locale === 'pt') assert.match(header, /<a href="\/praticar\/" class="mg-nav-hl[^"]*"[^>]*>Praticar<\/a>/, `${rel} header links /praticar/`);
    else assert.doesNotMatch(header, /\/praticar\//, `${rel} EN header has no PT-only practice link`);
  }
  const promoHome = read('index.html');
  assert.match(promoHome, /<dialog class="pp-dialog" id="practice-promo"/, 'PT home has the practice pop-up');
  assert.match(promoHome, /data-practice-promo[\s\S]*href="\/praticar\/" data-promo-link autofocus/, 'pop-up links the hub');
  assert.equal((promoHome.match(/class="pp-chip" href="\/praticar\/[a-z0-9-]+\/"/g) ?? []).length, 6, 'pop-up shows six subjects');
  assert.doesNotMatch(read('en/index.html'), /data-practice-promo/, 'EN home has no PT pop-up');
  assert.doesNotMatch(read('sobre/index.html'), /data-practice-promo/, 'only the homepage opens the pop-up');
  for (const rel of ['mg.css', 'mg.js']) assert.equal(readFileSync(join(siteStatic, rel), 'utf8'), read(rel), `${rel} is stale; run npm run build`);

  // "Como estudar X" guides (/estudar/): one page per subject, indexable, with a working mini-test.
  assert.ok(studyGuides.length >= 14, 'at least 14 study guides');
  const studyHub = read('estudar/index.html');
  const studySitemap = read('sitemap.xml');
  assert.ok(studySitemap.includes(`<loc>https://microgrind.app${STUDY_HUB.path}</loc>`), 'study hub in sitemap');
  assert.match(read('index.html'), /href="\/estudar\/"/, 'footer links the study hub');
  assert.match(read('praticar/index.html'), /href="\/estudar\/"/, 'practice hub links the study hub');
  assert.equal((studyHub.match(/<h1[\s>]/g) ?? []).length, 1);
  const seenTitles = new Set(practicePages.map((p) => p.title));
  for (const guide of studyGuides) {
    const path = studyPath(guide);
    const rel = `${path.slice(1)}index.html`;
    const html = read(rel);
    assert.ok(studyHub.includes(`href="${path}"`), `hub links ${path}`);
    assert.ok(studySitemap.includes(`<loc>https://microgrind.app${path}</loc>`), `${path} in sitemap`);
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    const description = html.match(/<meta name="description" content="(.*?)"/)[1];
    assert.ok(title.length <= 85, `${rel} title is ${title.length} chars`);
    assert.ok(description.length <= 160, `${rel} description is ${description.length} chars`);
    assert.match(title, /^Como estudar /, `${rel} title starts with the search phrase`);
    assert.ok(!seenTitles.has(title), `${rel} title is unique`);
    seenTitles.add(title);
    assert.ok(html.includes(`<link rel="canonical" href="https://microgrind.app${path}">`), `${rel} canonical`);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${rel} one h1`);
    assert.match(html, /<h1>Como estudar /, `${rel} h1`);
    const graph = jsonLd(html)['@graph'];
    assert.ok(graph.some((n) => [n['@type']].flat().includes('Article')), `${rel} Article`);
    assert.ok(graph.some((n) => n['@type'] === 'FAQPage'), `${rel} FAQPage`);
    assert.equal(graph.find((n) => n['@type'] === 'BreadcrumbList').itemListElement.length, 3, `${rel} breadcrumbs`);
    assert.equal(guide.plan.length, 4, `${rel} four-week plan`);
    assert.ok(guide.topics.length >= 5 && guide.mistakes.length >= 4 && guide.faqs.length >= 3, `${rel} has enough content`);
    assert.match(html, /data-practice="(quiz|flashcards)"/, `${rel} embeds a mini-test`);
    assert.equal((html.match(/data-item /g) ?? []).length, guide.test.items.length, `${rel} renders every test item`);
    if (guide.test.mode === 'quiz') assert.equal((html.match(/data-correct/g) ?? []).length, guide.test.items.length, `${rel} one right option per question`);
    assert.match(html, /src="\/practice\.js\?v=/, `${rel} loads practice.js`);
    assert.ok(html.includes(`utm_campaign=${guide.slug}`), `${rel} CTA with campaign`);
    for (const slug of guide.related) assert.ok(html.includes(`href="/estudar/${slug}/"`), `${rel} links /estudar/${slug}/`);
    for (const slug of guide.practiceLinks) assert.ok(html.includes(`href="/praticar/${slug}/"`), `${rel} links /praticar/${slug}/`);
    const haystack = html.toLowerCase();
    for (const phrase of DEFERRED) assert.equal(haystack.includes(phrase), false, `${rel} contains deferred claim: ${phrase}`);
    assert.doesNotMatch(stripSeoNegation(body(html)), /mapa mental|mind map/i, `${rel} mind-map phrase`);
    assert.equal(readFileSync(join(siteStatic, rel), 'utf8'), html, `${rel} is stale; run npm run build`);
  }
  assert.equal(readFileSync(join(siteStatic, 'estudar/index.html'), 'utf8'), studyHub, 'estudar/index.html is stale');

  console.log('marketing/seo-site.test.mjs passed');
} finally {
  rmSync(out, { recursive: true, force: true });
}
