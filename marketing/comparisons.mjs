/**
 * «MicroGrind vs X» pages. Public strings come from vs-copy.md (6 Nov 2026).
 * Do not paraphrase that file. Chrome only: kicker, FAQ heading, footer cluster.
 * Tables are MicroGrind advantages: ✓ on MicroGrind, ✗ on the competitor.
 * Competitor names stay plain text. No logos, no tutor/grounded claims.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIND = /mapa mental|mind map/i;
const MARK_YES = '\u2713';
const MARK_NO = '\u2717';

const ORDER = [
  { slug: 'vs-quizlet', label: 'vs Quizlet', kicker: 'Quizlet' },
  { slug: 'vs-studingo', label: 'vs Studingo', kicker: 'Studingo' },
  { slug: 'vs-knowunity', label: 'vs Knowunity', kicker: 'Knowunity' },
  { slug: 'vs-notebooklm', label: 'vs Gemini Notebook', kicker: 'Gemini Notebook' },
  { slug: 'vs-anki', label: 'vs Anki', kicker: 'Anki' },
  { slug: 'vs-astra-ai', label: 'vs Astra AI', kicker: 'Astra AI' },
];

const copyPath = join(dirname(fileURLToPath(import.meta.url)), 'vs-copy.md');
const copy = readFileSync(copyPath, 'utf8').replaceAll('\r\n', '\n');

function fail(where, message) {
  throw new Error(`${where}: ${message}`);
}

function partsText(parts) {
  return parts.map((part) => part.text).join('');
}

function parseInline(source, where) {
  if (source.startsWith('*') && source.endsWith('*') && !source.startsWith('**')) {
    return parseInline(source.slice(1, -1), where).map((part) => ({ ...part, em: true }));
  }
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*[\]]+)\*/g;
  const parts = [];
  let last = 0;
  for (const match of source.matchAll(re)) {
    if (match.index > last) parts.push({ text: source.slice(last, match.index) });
    if (match[1] != null) {
      if (!match[2].startsWith('https://')) fail(where, `link must be https: ${match[2]}`);
      parts.push({ href: match[2], text: match[1] });
    } else if (match[3] != null) parts.push({ text: match[3] });
    else if (match[4] != null) parts.push({ strong: true, text: match[4] });
    else parts.push({ em: true, text: match[5] });
    last = match.index + match[0].length;
  }
  if (last < source.length) parts.push({ text: source.slice(last) });
  const merged = [];
  for (const part of parts) {
    const prev = merged.at(-1);
    const plain = !part.href && !part.em && !part.strong;
    const prevPlain = prev && !prev.href && !prev.em && !prev.strong;
    if (plain && prevPlain) prev.text += part.text;
    else merged.push({ ...part });
  }
  if (merged.length === 0) fail(where, 'empty text');
  const visible = partsText(merged);
  if (/[*`[\]]/.test(visible)) fail(where, `unparsed markdown in “${source.slice(0, 160)}”`);
  return merged;
}

function plain(source, where) {
  const parts = parseInline(source, where);
  if (parts.length !== 1 || parts[0].href || parts[0].em || parts[0].strong) {
    fail(where, `expected plain text, got markup in “${source.slice(0, 120)}”`);
  }
  return parts[0].text;
}

function normalizeParagraph(text) {
  return text.replace(/\s*\n\s*/g, ' ').trim();
}

function cleanRules(text) {
  return text
    .split('\n')
    .filter((line) => line.trim() !== '---')
    .join('\n')
    .trim();
}

function sectionsOf(body, where) {
  const marks = [...body.matchAll(/^### (.+)$/gm)];
  if (marks.length === 0) fail(where, 'no sections');
  return marks.map((mark, index) => {
    const start = mark.index + mark[0].length;
    const end = index + 1 < marks.length ? marks[index + 1].index : body.length;
    return { title: mark[1].trim(), body: cleanRules(body.slice(start, end)) };
  });
}

function section(sections, title, where) {
  const found = sections.filter((item) => item.title === title);
  if (found.length !== 1) fail(where, `expected one “${title}”, got ${found.length}`);
  return found[0].body;
}

function splitRow(line, where) {
  const cells = line.trim().split('|').map((cell) => cell.trim());
  if (cells[0] === '') cells.shift();
  if (cells.at(-1) === '') cells.pop();
  if (cells.length !== 3) fail(where, `table row needs 3 cells: ${line.slice(0, 100)}`);
  return cells;
}

function isDisclaimer(item) {
  return item.startsWith('*') && item.endsWith('*') && !item.startsWith('**');
}

function advantageMark(symbol, locale, where) {
  if (symbol === MARK_YES) return { kind: 'mark', value: 'yes', label: locale === 'pt' ? 'Sim' : 'Yes' };
  if (symbol === MARK_NO) return { kind: 'mark', value: 'no', label: locale === 'pt' ? 'Não' : 'No' };
  fail(where, `expected a plain ✓ or ✗, got “${symbol}”`);
}

function featureText(cell) {
  return typeof cell === 'string' ? cell : partsText(cell);
}

function parseTable(body, locale, competitor, where) {
  const lines = body.split('\n').map((line) => line.trim()).filter((line) => line.startsWith('|'));
  if (lines.length < 3) fail(where, 'table is incomplete');
  const headers = splitRow(lines[0], where).map((cell, index) => plain(cell, `${where} header ${index}`));
  if (headers[0] !== 'Feature' || headers[1] !== 'MicroGrind' || headers[2] !== competitor) {
    fail(where, `headers must be Feature | MicroGrind | ${competitor}, got ${headers.join(' | ')}`);
  }
  const rows = [];
  for (const line of lines.slice(1)) {
    const cells = splitRow(line, where);
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    rows.push(cells.map((cell, index) => {
      if (index > 0) {
        const mark = advantageMark(plain(cell, `${where} mark`), locale, where);
        if (index === 1 && mark.value !== 'yes') fail(where, 'MicroGrind column must be ✓');
        if (index === 2 && mark.value !== 'no') fail(where, 'competitor column must be ✗');
        return mark;
      }
      const parts = parseInline(cell, where);
      if (parts.length === 1 && !parts[0].href && !parts[0].em && !parts[0].strong) return parts[0].text;
      return parts;
    }));
  }
  if (rows.length < 4 || rows.length > 5) fail(where, `expected 4 or 5 table rows, got ${rows.length}`);
  const rest = [];
  let seen = false;
  for (const line of body.split('\n')) {
    if (line.trim().startsWith('|')) {
      seen = true;
      continue;
    }
    if (seen) rest.push(line);
  }
  const trailing = rest.join('\n').split(/\n\s*\n/).map(normalizeParagraph).filter(Boolean);
  const disclaimers = trailing.filter(isDisclaimer);
  const notes = trailing.filter((item) => !isDisclaimer(item));
  if (disclaimers.length !== 1) fail(where, `expected 1 price disclaimer, got ${disclaimers.length}`);
  if (notes.length > 1) fail(where, `expected at most 1 table note, got ${notes.length}`);
  return { headers, rows, note: notes[0] ?? null, disclaimer: disclaimers[0] };
}

function parseList(title, body, count, where) {
  const lines = body.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length !== count) fail(where, `${title} expected ${count} bullets, got ${lines.length}`);
  const items = lines.map((line) => {
    if (!line.startsWith('- ')) fail(where, `bullet expected: ${line.slice(0, 80)}`);
    return parseInline(line.slice(2).trim(), where);
  });
  return { title, items };
}

function parseFaqs(body, count, where) {
  const chunks = body.split(/\n(?=\*\*)/).map((chunk) => chunk.trim()).filter(Boolean);
  const items = chunks.map((chunk) => {
    const match = chunk.match(/^\*\*(.+?)\*\*\s*\n([\s\S]+)$/);
    if (!match) fail(where, `bad FAQ chunk: ${chunk.slice(0, 120)}`);
    const q = match[1].trim();
    const answer = normalizeParagraph(match[2]);
    const parts = parseInline(answer, `${where} FAQ`);
    return { q, a: partsText(parts), parts };
  });
  if (items.length !== count) fail(where, `expected ${count} FAQs, got ${items.length}`);
  return items;
}

function blockText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(blockText).join('');
  if (typeof value === 'object') {
    return `${value.text || ''}${value.label || ''}${value.q || ''}${value.a || ''}${blockText(value.parts)}${blockText(value.items)}${blockText(value.rows)}${blockText(value.headers)}`;
  }
  return '';
}

function mark(block) {
  if (block.type !== 'faq' && MIND.test(blockText(block))) block.negation = true;
  return block;
}

function listBlock(choose) {
  return mark({ type: 'list', ordered: false, items: choose.items });
}

const PDF_ROW = {
  'vs-quizlet': {
    pt: 'Estudo a partir do teu PDF / sebenta / slides via mapa da matéria (não só upload → Study Guides / flashcards)',
    en: 'Study from your PDF / handbook / slides via the Subject Map (not only upload → Study Guides / flashcards)',
  },
  'vs-studingo': {
    pt: 'Estudo a partir do teu PDF / sebenta / slides via mapa da matéria (não só upload → flashcards gerados)',
    en: 'Study from your PDF / handbook / slides via the Subject Map (not only upload → generated flashcards)',
  },
  'vs-knowunity': {
    pt: 'Estudo a partir do teu PDF / sebenta / slides via mapa da matéria (não só upload → notas comunidade)',
    en: 'Study from your PDF / handbook / slides via the Subject Map (not only upload → community notes)',
  },
  'vs-notebooklm': {
    pt: 'Estudo a partir do teu PDF / sebenta / slides via mapa da matéria (não só upload → síntese / Mind Map)',
    en: 'Study from your PDF / handbook / slides via the Subject Map (not only upload → synthesis / Mind Map)',
  },
  'vs-anki': {
    pt: 'Estudo a partir do teu PDF / sebenta / slides via mapa da matéria (não só upload → decks)',
    en: 'Study from your PDF / handbook / slides via the Subject Map (not only upload → decks)',
  },
  'vs-astra-ai': {
    pt: 'Estudo a partir do teu PDF / sebenta / slides via mapa da matéria (não só upload → Exam Prep)',
    en: 'Study from your PDF / handbook / slides via the Subject Map (not only upload → Exam Prep)',
  },
};

const PWA_LABEL = {
  pt: 'App web + PWA (sem depender de app desktop)',
  en: 'Web app + PWA (no desktop app required)',
};

function assertAdvantageRows(table, spec, locale, where) {
  const expected = spec.slug === 'vs-anki' ? 5 : 4;
  if (table.rows.length !== expected) fail(where, `expected ${expected} advantage rows, got ${table.rows.length}`);
  const pdf = featureText(table.rows[2][0]);
  if (pdf !== PDF_ROW[spec.slug][locale]) fail(where, `PDF row drifted: ${pdf}`);
  if (table.rows[2][2].note || table.rows[2][2].value !== 'no') fail(where, 'PDF competitor cell must be a plain ✗');
  const features = table.rows.map((row) => featureText(row[0]));
  for (const feature of features) {
    if (/não nicho Direito|not Law-only|Qualquer nível|Any level \(primary/i.test(feature)) {
      fail(where, `audience row must stay out of the table: ${feature}`);
    }
  }
  const pwa = features.filter((feature) => /App web \+ PWA|Web app \+ PWA/.test(feature));
  if (spec.slug === 'vs-anki') {
    if (pwa.length !== 1 || pwa[0] !== PWA_LABEL[locale]) fail(where, `Anki PWA label drifted: ${pwa.join(' | ')}`);
  } else if (pwa.length !== 0) {
    fail(where, `PWA row is Anki-only, found: ${pwa.join(' | ')}`);
  }
}

function buildLocale(spec, locale, body) {
  const where = `${spec.slug} ${locale}`;
  const pt = `/${spec.slug}/`;
  const en = `/en/${spec.slug}/`;
  const sections = sectionsOf(body, where);
  const titles = sections.map((item) => item.title);
  const tableTitle = locale === 'pt' ? 'Tabela de vantagens' : 'Advantage table';
  const chooseTitle = locale === 'pt' ? 'Por isso escolhe MicroGrind se…' : 'Choose MicroGrind if…';
  const doesRe = locale === 'pt' ? /^O que (?:o|a) .+ faz bem$/ : /^What .+ does well$/;
  const doesTitles = titles.filter((title) => doesRe.test(title));
  if (doesTitles.length !== 1) fail(where, `expected 1 “does well” section, got ${doesTitles.join(' | ')}`);
  const expectedTitles = ['Meta', 'H1', 'Intro', tableTitle, doesTitles[0], chooseTitle, 'FAQ', 'CTA'];
  if (titles.join('\n') !== expectedTitles.join('\n')) {
    fail(where, `section order: ${titles.join(' | ')}`);
  }
  const introParts = section(sections, 'Intro', where).split(/\n\s*\n/).map(normalizeParagraph).filter(Boolean);
  if (introParts.length !== 2) fail(where, `expected 2 intro paragraphs, got ${introParts.length}`);
  const table = parseTable(section(sections, tableTitle, where), locale, spec.kicker, where);
  assertAdvantageRows(table, spec, locale, where);
  const doesWell = parseList(doesTitles[0], section(sections, doesTitles[0], where), 2, where);
  const choose = parseList(chooseTitle, section(sections, chooseTitle, where), 3, where);
  const faqs = parseFaqs(section(sections, 'FAQ', where), spec.slug === 'vs-astra-ai' ? 7 : 6, where);
  const ctaParts = section(sections, 'CTA', where).split(/\n\s*\n/).map(normalizeParagraph).filter(Boolean);
  if (ctaParts.length !== 1) fail(where, `expected 1 CTA paragraph, got ${ctaParts.length}`);
  const cta = ctaParts[0];
  const h1 = plain(normalizeParagraph(section(sections, 'H1', where)), `${where} H1`);
  const title = plain(section(sections, 'Meta', where).match(/\*\*Meta title:\*\*\s*(.+)/)?.[1] ?? '', `${where} title`);
  const description = plain(section(sections, 'Meta', where).match(/\*\*Meta description:\*\*\s*(.+)/)?.[1] ?? '', `${where} description`);
  const lede = plain(introParts[0], `${where} lede`);
  const page = {
    id: `${spec.slug}-${locale}`,
    locale,
    path: locale === 'pt' ? pt : en,
    ptPath: pt,
    enPath: en,
    wide: true,
    title,
    description,
    kicker: locale === 'pt' ? 'Vantagens' : 'Advantages',
    h1,
    lede,
    blocks: [
      mark({ type: 'p', parts: parseInline(introParts[1], `${where} intro`) }),
      mark({ type: 'h2', text: tableTitle }),
      mark({
        type: 'table',
        variant: 'advantage',
        caption: h1,
        headers: table.headers,
        rows: table.rows,
      }),
      ...(table.note ? [mark({ type: 'p', className: 'compare-note', parts: parseInline(table.note, `${where} note`) })] : []),
      mark({ type: 'p', className: 'updated', parts: parseInline(table.disclaimer, `${where} disclaimer`) }),
      mark({ type: 'h2', text: doesWell.title }),
      listBlock(doesWell),
      mark({ type: 'h2', text: choose.title }),
      listBlock(choose),
      {
        type: 'faq',
        title: locale === 'pt' ? 'Perguntas frequentes' : 'Common questions',
        items: faqs,
      },
      mark({ type: 'cta', parts: parseInline(cta, `${where} CTA`) }),
    ],
  };
  if (MIND.test(page.h1)) page.h1Negation = true;
  if (MIND.test(page.lede)) page.ledeNegation = true;
  return page;
}

function localeBody(chunk, heading) {
  const match = chunk.match(new RegExp(`^${heading}\\s*$`, 'm'));
  if (!match) fail(heading, 'missing locale heading');
  return chunk.slice(match.index + match[0].length);
}

const start = copy.indexOf('# 1. ');
const endNote = copy.indexOf('\n## Rodapé comum');
const published = copy.slice(start, endNote < 0 ? undefined : endNote).trim();
const chunks = published.split(/^# \d+\. /m).slice(1);
if (chunks.length !== ORDER.length) fail('vs-copy', `expected ${ORDER.length} competitors, got ${chunks.length}`);

export const comparisonPairs = [];
export const comparisonPages = [];

chunks.forEach((chunk, index) => {
  const spec = ORDER[index];
  const urls = chunk.match(/\*\*URLs:\*\*\s*`(\/vs-[a-z0-9-]+\/)`\s*·\s*`(\/en\/vs-[a-z0-9-]+\/)`/);
  if (!urls) fail(spec.slug, 'missing URLs');
  if (urls[1] !== `/${spec.slug}/` || urls[2] !== `/en/${spec.slug}/`) {
    fail(spec.slug, `URL mismatch ${urls[1]} ${urls[2]}`);
  }
  const ptBody = localeBody(chunk, '## PT-PT');
  const enAt = ptBody.search(/^## EN\s*$/m);
  if (enAt < 0) fail(spec.slug, 'missing EN');
  const enBody = ptBody.slice(enAt).replace(/^## EN\s*/, '');
  comparisonPairs.push({ pt: urls[1], en: urls[2], label: spec.label });
  comparisonPages.push(buildLocale(spec, 'pt', ptBody.slice(0, enAt)));
  comparisonPages.push(buildLocale(spec, 'en', enBody));
});

export const comparisonLinks = {
  pt: [{ heading: true, label: 'Comparações' }, ...comparisonPairs.map((pair) => ({ href: pair.pt, label: pair.label }))],
  en: [{ heading: true, label: 'Comparisons' }, ...comparisonPairs.map((pair) => ({ href: pair.en, label: pair.label }))],
};

const hrefs = new Set();
function walkHrefs(value) {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach(walkHrefs);
    return;
  }
  if (typeof value === 'object') {
    if (value.href) hrefs.add(value.href);
    walkHrefs(value.parts);
    walkHrefs(value.items);
    walkHrefs(value.rows);
    walkHrefs(value.blocks);
  }
}
comparisonPages.forEach((page) => walkHrefs(page.blocks));
for (const match of published.matchAll(/\]\((https:[^)\s]+)\)/g)) {
  if (!hrefs.has(match[1])) fail('vs-copy', `dropped link ${match[1]}`);
}
const questions = [...published.matchAll(/^\*\*(.+?)\*\*\s*$/gm)].map((match) => match[1].trim());
const renderedQuestions = comparisonPages.flatMap((page) => page.blocks.find((block) => block.type === 'faq').items.map((item) => item.q));
if (questions.length !== 74) fail('vs-copy', `expected 74 FAQ questions, got ${questions.length}`);
if (questions.join('\n') !== renderedQuestions.join('\n')) fail('vs-copy', 'FAQ questions drifted from vs-copy.md');
