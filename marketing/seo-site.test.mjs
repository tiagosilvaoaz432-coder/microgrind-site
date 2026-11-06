import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DEFINITION, HOME, MIND_MAP_FAQ, PAIRS, pages } from './content.mjs';
import { comparisonPages, comparisonPairs } from './comparisons.mjs';
import { buildSeoSite } from './build-seo-site.mjs';
import { NICHE_REDIRECT_RULES, collectFaqs, escapeHtml, renderRedirects } from './render.mjs';
import { collidingAppFiles } from '../scripts/check-site-static.mjs';

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
    ['en/subject-map/index.html', '/en/subject-map/'],
    ['en/study-from-pdf/index.html', '/en/study-from-pdf/'],
    ['en/about/index.html', '/en/about/'],
  ]);

  for (const page of comparisonPages) {
    const rel = `${page.path.replace(/^\//, '').replace(/\/$/, '')}/index.html`;
    expected.set(rel, page.path);
  }

  for (const [rel, path] of expected) {
    const html = read(rel);
    const canonical = `https://microgrind.app${path === '/' ? '/' : path}`;
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
    assert.equal(JSON.stringify(graph).includes('"offers"'), false, rel);
    const app = graph.find((node) => (Array.isArray(node['@type']) ? node['@type'] : [node['@type']]).includes('SoftwareApplication'));
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
    if (path.startsWith('/en')) {
      assert.match(footer, /From primary to higher education, in any subject\./);
      assert.match(footer, /aria-label="Comparisons"/);
      assert.match(footer, /href="\/en\/vs-quizlet\/"/);
      assert.match(footer, /href="\/en\/vs-astra-ai\/"/);
      assert.doesNotMatch(footer, /href="\/en\/law\/?"/);
    } else {
      assert.match(footer, /Do ensino básico ao superior, em qualquer disciplina\./);
      assert.match(footer, /aria-label="Comparações"/);
      assert.match(footer, /href="\/vs-quizlet\/"/);
      assert.match(footer, /href="\/vs-astra-ai\/"/);
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
  assert.match(homePt, /href="\/vs-notebooklm\/"/);
  assert.match(homePt, /href="\/vs-studingo\/"/);
  assert.match(homePt, /href="\/vs-knowunity\/"/);
  assert.match(homePt, /href="\/vs-anki\/"/);
  assert.match(homeEn, /href="\/en\/vs-notebooklm\/"/);
  assert.match(homeEn, /href="\/en\/vs-studingo\/"/);
  assert.match(homeEn, /href="\/en\/vs-knowunity\/"/);
  assert.match(homeEn, /href="\/en\/vs-anki\/"/);
  assert.match(homeEn, /<strong class="ink-mark">Subject Map<\/strong>/);
  assert.match(homePt, /Serve para qualquer curso/);
  assert.doesNotMatch(homePt, /estudantes de Direito/);
  assert.match(homePt, /mapa da matéria/);
  assert.match(homePt, /5 a 25 minutos/);
  assert.match(homePt, /Feito a partir do teu material/);
  assert.match(homePt, /já trabalhaste/);
  assert.match(homePt, /Que ficheiros posso carregar\?/);
  assert.match(homePt, new RegExp(HOME.pt.description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(homeEn, /study app/i);
  assert.match(homeEn, /Subject Map/);
  assert.match(homeEn, /Built for any course/);
  assert.match(homeEn, /short sessions/i);
  assert.match(homeEn, /5–25 minute/);
  assert.doesNotMatch(homeEn, /law students/);
  assert.match(homeEn, /The map is the means/);
  assert.match(homeEn, /Built from your own material/);
  assert.match(homeEn, /What can I upload\?/);
  assert.match(homeEn, new RegExp(HOME.en.description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(homePt, /ensino básico, secundário ou superior/);
  assert.match(homePt, /Para qualquer curso ou disciplina, do ensino básico ao superior/);
  assert.match(homePt, /Apontamentos, manual, sebenta ou slides/);
  assert.match(homePt, /para veres como os temas se ligam/);
  assert.match(homePt, /Ao iniciares uma sessão, escolhes a duração: entre 5 e 25 minutos/);
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
  assert.match(homeEn, /When you start a session, you choose its duration: between 5 and 25 minutes/);
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
    assert.doesNotMatch(upload, /data-min|session-times|session-clock/);
    assert.doesNotMatch(map, /data-min|session-times|session-clock/);
    assert.match(html, /role="radiogroup"/);
    assert.match(html, /data-session/);
  }

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
  assert.match(mapa, /Quando inicias uma sessão de estudo, escolhes a duração: entre 5 e 25 minutos/);
  assert.match(mapa, /conservação da energia/);
  assert.match(mapa, /Ao iniciares uma sessão de estudo, escolhes a duração, entre 5 e 25 minutos/);
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
  assert.match(sebenta, /Ao iniciares uma sessão, escolhes a duração, entre 5 e 25 minutos/);
  assert.match(sebenta, /Estudas a matéria organizada no mapa/);
  assert.doesNotMatch(sebenta, /href="\/direito\/?"/);
  assert.doesNotMatch(sebenta, /Se estudas Direito, começa/);
  assert.doesNotMatch(sebenta, /passagens do teu ficheiro/);

  const pdf = read('en/study-from-pdf/index.html');
  assert.match(pdf, /doesn&#39;t just turn a PDF into flashcards|doesn't just turn a PDF into flashcards/);
  assert.match(pdf, /for any course/);
  assert.match(pdf, /When you start a session, choose a duration between 5 and 25 minutes/);
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
  assert.match(sobre, /Ao iniciares uma sessão, escolhes a duração, entre 5 e 25 minutos, e estudas a matéria organizada no mapa/);
  assert.doesNotMatch(sobre, /Para universitários/);
  assert.doesNotMatch(sobre, /foco de lançamento/);
  assert.match(about, /primary, secondary or higher education/);
  assert.match(about, /When you start a session, choose a duration between 5 and 25 minutes and study the material organised in your Subject Map/);
  assert.match(about, /Built for any course/);
  assert.doesNotMatch(about, /For university students/);
  assert.doesNotMatch(about, /Launch focus is university law/);
  assert.doesNotMatch(about, /law students/);
  assert.match(sobre, /mailto:ola@microgrind.app/);
  assert.match(about, /mailto:ola@microgrind.app/);

  const subjectPage = read('en/subject-map/index.html');
  assert.match(subjectPage, /For any course/);
  assert.match(subjectPage, /conservation of energy/);
  assert.match(subjectPage, /When you start a study session, you choose its duration: between 5 and 25 minutes/);
  assert.match(subjectPage, /When you start a study session, you choose a duration between 5 and 25 minutes/);
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

  assert.deepEqual(
    comparisonPairs.map(({ pt, en }) => ({ pt, en })),
    [
      { pt: '/vs-quizlet/', en: '/en/vs-quizlet/' },
      { pt: '/vs-studingo/', en: '/en/vs-studingo/' },
      { pt: '/vs-knowunity/', en: '/en/vs-knowunity/' },
      { pt: '/vs-notebooklm/', en: '/en/vs-notebooklm/' },
      { pt: '/vs-anki/', en: '/en/vs-anki/' },
      { pt: '/vs-astra-ai/', en: '/en/vs-astra-ai/' },
    ],
  );
  assert.deepEqual(PAIRS.slice(-6).map(({ pt, en }) => ({ pt, en })), comparisonPairs.map(({ pt, en }) => ({ pt, en })));
  assert.equal(comparisonPages.length, 12);

  function decode(value) {
    return value.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&amp;', '&');
  }
  function visibleFaqs(html) {
    const faqs = [];
    const re = /<summary>([\s\S]*?)<\/summary>[\s\S]*?<p>([\s\S]*?)<\/p>/g;
    for (const match of html.matchAll(re)) {
      faqs.push({
        q: decode(match[1].replace(/<[^>]+>/g, '')),
        a: decode(match[2].replace(/<[^>]+>/g, '')),
      });
    }
    return faqs;
  }
  const copy = readFileSync(join(here, 'vs-copy.md'), 'utf8');
  assert.equal(
    readFileSync(join(here, 'copy-paginas-vs-vantagens-2026-11-06.md'), 'utf8'),
    copy,
    'dated advantage copy must match vs-copy.md',
  );
  function unwrap(markdown) {
    return markdown
      .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1');
  }
  const unwrapped = unwrap(copy);
  const banned = [
    'melhor que',
    'better than',
    'não inventa',
    'does not invent',
    'fidelidade',
    'waiting for tiago',
    'nota max',
    '15m+',
    '+2 valores',
    '+2 grades',
    'money back',
  ];

  for (const page of comparisonPages) {
    const rel = `${page.path.replace(/^\//, '').replace(/\/$/, '')}/index.html`;
    const html = read(rel);
    const pattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(html, new RegExp(`<title>${pattern(escapeHtml(page.title))}</title>`));
    assert.match(html, new RegExp(`name="description" content="${pattern(escapeHtml(page.description))}"`));
    assert.match(html, new RegExp(`<h1[^>]*>${pattern(escapeHtml(page.h1))}</h1>`));
    assert.match(html, new RegExp(`<p class="lede"[^>]*>${pattern(escapeHtml(page.lede))}</p>`));
    assert.match(html, /<table>/);
    assert.match(html, /<th scope="col">Feature<\/th>/);
    assert.match(html, /<th scope="col" class="adv-col">MicroGrind<\/th>/);
    assert.match(html, /class="compare compare-adv"/);
    const tableHtml = html.match(/<tbody>[\s\S]*?<\/tbody>/)[0];
    const expectedRows = page.path.includes('vs-anki') ? 5 : 4;
    assert.equal((tableHtml.match(/<tr>/g) ?? []).length, expectedRows, page.path);
    const yesLabel = page.locale === 'pt' ? 'Sim' : 'Yes';
    const noLabel = page.locale === 'pt' ? 'Não' : 'No';
    const yesCell = `<td class="adv adv-yes"><span class="adv-glyph" aria-hidden="true">✓</span><span class="visually-hidden">${yesLabel}</span></td>`;
    const noCell = `<td class="adv adv-no"><span class="adv-glyph" aria-hidden="true">✗</span><span class="visually-hidden">${noLabel}</span></td>`;
    assert.equal((tableHtml.match(new RegExp(yesCell.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length, expectedRows, page.path);
    assert.equal((tableHtml.match(new RegExp(noCell.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length, expectedRows, page.path);
    assert.match(tableHtml, page.locale === 'pt' ? /via mapa da matéria \(não só upload/ : /via the Subject Map \(not only upload/);
    assert.doesNotMatch(tableHtml, /não nicho Direito|not Law-only|Qualquer nível|Any level/);
    if (page.path.includes('vs-anki')) {
      assert.match(tableHtml, page.locale === 'pt' ? /App web \+ PWA \(sem depender de app desktop\)/ : /Web app \+ PWA \(no desktop app required\)/);
    } else {
      assert.doesNotMatch(tableHtml, /App web \+ PWA|Web app \+ PWA/);
    }
    assert.doesNotMatch(tableHtml, /N\/D|N\/A|\$|€/);
    assert.match(html, page.locale === 'pt' ? />Tabela de vantagens</ : />Advantage table</);
    assert.match(html, page.locale === 'pt' ? />O que (?:o|a) .+ faz bem</ : />What .+ does well</);
    assert.match(html, page.locale === 'pt' ? />Por isso escolhe MicroGrind se…</ : />Choose MicroGrind if…</);
    assert.doesNotMatch(html, /Tabela de comparação|Comparison table|comparação honesta|honest comparison|Quando escolher|When to choose/);
    assert.match(html, page.locale === 'pt' ? /Última verificação: 6 Nov 2026/ : /Last checked: 6 Nov 2026/);
    assert.match(html, page.locale === 'pt' ? /Sessões curtas\. Progresso real\./ : /Short sessions\. Real progress\./);
    assert.doesNotMatch(html, /session-times|data-min=|role="radiogroup"|data-session/);
    assert.doesNotMatch(html, /href="\/direito\/?"/);
    assert.doesNotMatch(html, /href="\/en\/law\/?"/);
    assert.deepEqual(
      [...html.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map((match) => match[1]),
      ['/logo-mark.png', '/logo-mark.png'],
      page.path,
    );
    const other = page.locale === 'pt' ? page.enPath : page.ptPath;
    assert.match(html, new RegExp(`rel="alternate" hreflang="en" href="https://microgrind\\.app${page.enPath.replaceAll('/', '\\/')}"`));
    assert.match(html, new RegExp(`rel="alternate" hreflang="pt-PT" href="https://microgrind\\.app${page.ptPath.replaceAll('/', '\\/')}"`));
    assert.match(html, new RegExp(`rel="alternate" hreflang="x-default" href="https://microgrind\\.app${page.ptPath.replaceAll('/', '\\/')}"`));
    assert.match(html, new RegExp(`class="lang" href="${other.replaceAll('/', '\\/')}"`));
    const graph = jsonLd(html)['@graph'];
    const webpage = graph.find((node) => node['@type'] === 'WebPage');
    assert.equal(webpage.about['@id'], 'https://microgrind.app/#app', page.path);
    assert.equal(JSON.stringify(graph).includes('AggregateRating'), false, page.path);
    const model = collectFaqs(page);
    const visible = visibleFaqs(html);
    const faqLd = graph.find((node) => node['@type'] === 'FAQPage');
    const expectedFaqs = page.path.includes('vs-astra-ai') ? 7 : 6;
    assert.equal(model.length, expectedFaqs, page.path);
    assert.equal(visible.length, expectedFaqs, page.path);
    for (let i = 0; i < model.length; i += 1) {
      assert.equal(visible[i].q, model[i].q, page.path);
      assert.equal(visible[i].a, model[i].a, page.path);
      assert.equal(faqLd.mainEntity[i].name, model[i].q, page.path);
      assert.equal(faqLd.mainEntity[i].acceptedAnswer.text, model[i].a, page.path);
      assert.ok(unwrapped.includes(model[i].q), model[i].q);
      assert.ok(unwrapped.includes(model[i].a), model[i].a);
    }
    assert.ok(unwrapped.includes(page.h1), page.h1);
    assert.ok(unwrapped.includes(page.title), page.title);
    assert.ok(unwrapped.includes(page.description), page.description);
    assert.ok(unwrapped.includes(page.lede), page.lede);
    const haystack = html.toLowerCase();
    for (const phrase of banned) {
      if ((phrase === '+2 valores' || phrase === '+2 grades') && page.path.includes('vs-astra-ai')) continue;
      assert.equal(haystack.includes(phrase), false, `${page.path} contains ${phrase}`);
    }
    assert.doesNotMatch(html, /grounded|zero alucina|a IA não inventa|tutor com fontes|MicroGrind tem tutor|MicroGrind has a tutor/i);
  }

  const quizlet = read('vs-quizlet/index.html');
  assert.match(quizlet, /Não apresentamos a MicroGrind como substituto\./);
  assert.match(quizlet, /Mapa da matéria a partir do teu material \(tópicos, conceitos, relações\)/);
  assert.match(quizlet, /não só upload → Study Guides \/ flashcards/);
  assert.match(quizlet, /o que a MicroGrind tem e o Quizlet não/);
  assert.doesNotMatch(quizlet, /help\.quizlet\.com/);
  assert.doesNotMatch(quizlet, /App web \+ PWA|não nicho Direito/);
  assert.match(read('vs-studingo/index.html'), /não só upload → flashcards gerados/);
  assert.doesNotMatch(read('vs-studingo/index.html'), /App web \+ PWA/);
  assert.match(read('vs-knowunity/index.html'), /não só upload → notas comunidade/);
  assert.match(read('vs-notebooklm/index.html'), /não só upload → síntese \/ Mind Map/);
  assert.match(read('en/vs-notebooklm/index.html'), /not only upload → synthesis \/ Mind Map/);
  assert.match(read('vs-anki/index.html'), /não só upload → decks/);
  assert.match(read('en/vs-anki/index.html'), /not only upload → decks/);
  assert.match(read('vs-astra-ai/index.html'), /não só upload → Exam Prep/);
  assert.match(read('en/vs-astra-ai/index.html'), /not only upload → Exam Prep/);
  assert.match(read('vs-studingo/index.html'), /https:\/\/studingo\.io\/pricing/);
  assert.doesNotMatch(read('vs-studingo/index.html'), /\$14\.99|\$59\.99/);
  assert.match(read('vs-knowunity/index.html'), /<strong>não<\/strong> compete nesse eixo nesta página/);
  assert.match(read('vs-knowunity/index.html'), /https:\/\/knowunity\.com\/pro-plan/);
  assert.doesNotMatch(read('vs-knowunity/index.html'), /\$49\.99/);
  assert.match(read('en/vs-knowunity/index.html'), /not<\/strong> competing on that axis on this page/);
  const notebook = read('vs-notebooklm/index.html');
  assert.match(notebook, /MicroGrind vs Gemini Notebook \(NotebookLM\) — vantagens MicroGrind/);
  assert.match(notebook, /Gemini Notebook \(antes NotebookLM\)/);
  assert.match(notebook, /Legenda Mind Map:/);
  assert.match(notebook, /não «não tem mapas nenhum»/);
  assert.match(notebook, /https:\/\/notebooklm\.google\/plans/);
  assert.match(read('en/vs-notebooklm/index.html'), /MicroGrind vs Gemini Notebook \(NotebookLM\) — MicroGrind advantages/);
  assert.match(read('en/vs-notebooklm/index.html'), /not “has no maps at all”/);
  assert.match(read('en/vs-notebooklm/index.html'), /https:\/\/notebooklm\.google\/plans/);
  assert.match(read('vs-anki/index.html'), /O Anki <strong>tem<\/strong> flashcards/);
  assert.match(read('vs-anki/index.html'), /não é «tem flashcards»/);
  assert.match(read('vs-anki/index.html'), /https:\/\/apps\.ankiweb\.net\//);
  assert.match(read('en/vs-anki/index.html'), /Anki <strong>has<\/strong> flashcards/);
  const astra = read('vs-astra-ai/index.html');
  assert.match(astra, /https:\/\/astra-ai\.co\//);
  assert.match(astra, /https:\/\/astra-ai\.co\/pricing/);
  assert.match(astra, /não com projectos crypto ou outros «Astra AI»/);
  assert.match(astra, /<strong>não<\/strong> se posiciona aqui como tutor IA/);
  assert.match(astra, /<strong>não<\/strong> listamos «tutor» como feature da MicroGrind/);
  assert.match(astra, /Garantias de notas Astra \(«\+2 valores…»\) são claims da Astra — não nossos\./);
  assert.doesNotMatch(astra.replace('«+2 valores…»', ''), /\+2 valores/);
  const astraEn = read('en/vs-astra-ai/index.html');
  assert.match(astraEn, /not crypto projects or other “Astra AI” names/);
  assert.match(astraEn, /not<\/strong> positioned here as an AI tutor/);
  assert.match(astraEn, /Astra grade guarantees \(“\+2 grades…”\) are Astra’s claims — not ours\./);
  assert.doesNotMatch(astraEn.replace('“+2 grades…”', ''), /\+2 grades/);
  assert.doesNotMatch(`${astra}\n${astraEn}`, /astraai\.com|crypto\.astra/i);

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
  for (const pair of comparisonPairs) {
    assert.ok(sitemap.includes(`<loc>https://microgrind.app${pair.pt}</loc>`), pair.pt);
    assert.ok(sitemap.includes(`<loc>https://microgrind.app${pair.en}</loc>`), pair.en);
    assert.ok(sitemap.includes(`hreflang="pt-PT" href="https://microgrind.app${pair.pt}"`));
    assert.ok(sitemap.includes(`hreflang="en" href="https://microgrind.app${pair.en}"`));
    assert.ok(sitemap.includes(`hreflang="x-default" href="https://microgrind.app${pair.pt}"`));
  }

  const redirects = read('_redirects');
  assert.equal(redirects, renderRedirects());
  for (const [source, destination, code] of NICHE_REDIRECT_RULES) {
    assert.match(redirects, new RegExp(`^${source.replaceAll('/', '\\/')} ${destination.replaceAll('/', '\\/')} ${code}$`, 'm'));
  }
  assert.doesNotMatch(redirects, /^\/mapa-da-materia/m);
  assert.doesNotMatch(redirects, /\/vs-/);
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

  const css = read('marketing.css');
  assert.match(css, /\.compare-adv td\.adv/);
  assert.match(css, /\.adv-yes \.adv-glyph\{color:#042f2e;background:#5eead4\}/);
  assert.match(css, /\.adv-no \.adv-glyph\{color:#4c0519;background:#fecdd3\}/);
  const motion = read('motion.css');
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
  const designCss = read('mg.css');
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
    assert.equal((html.match(/role="tablist"/g) ?? []).length, 2);
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
  assert.match(sobre, /href="\/motion.css"/);
  assert.match(sobre, /addEventListener\('change', onMotion\)/);
  assert.match(sobre, /Para quem estuda no ensino básico, secundário ou superior/);
  assert.doesNotMatch(sobre, /who-examples|>Direito<|>Gestão<|>Engenharia</);
  assert.match(about, /data-who-levels/);
  assert.match(about, />Primary</);
  assert.match(about, />Higher education</);
  assert.match(about, /Any course or subject — from your own material\./);
  assert.match(about, /href="\/motion.css"/);
  assert.match(about, /primary, secondary or higher education/);
  assert.doesNotMatch(about, /who-examples|>Law<|>Management<|>Engineering</);

  const committedRels = [...expected.keys(), 'sitemap.xml', 'robots.txt', 'marketing.css', 'motion.css', '_redirects'];
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

  console.log('marketing/seo-site.test.mjs passed');
} finally {
  rmSync(out, { recursive: true, force: true });
}
