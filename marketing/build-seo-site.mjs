/**
 * Writes the public site into site-static/ (or another directory): homepage, content pages,
 * design-system assets, sitemap, robots, redirects, headers and the 404 page. Does not publish.
 * The app export in dist/ stays separate and still has no root index.html.
 */
import { cpSync, mkdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { ASSETS, FONTS, fontUrl } from './assets.mjs';
import { RETIRED_VS_SLUGS } from './compare.mjs';
import { ORIGIN, pages } from './content.mjs';
import { renderHome } from './home.mjs';
import { LASTMOD_TOKEN, readLastmod, resolveLastmod, writeLastmod } from './lastmod.mjs';
import { legalPages } from './legal.mjs';
import { renderNotFound } from './not-found.mjs';
import { practicePath, renderPracticeHub, renderPracticePage } from './practice-page.mjs';
import { PRACTICE_HUB, practicePages } from './practice/index.mjs';
import { renderStudyHub, renderStudyPage, studyPath } from './study-page.mjs';
import { STUDY_HUB, studyGuides } from './study/index.mjs';
import { relIndex, renderHeaders, renderPage, renderRedirects, renderRobots, renderSitemap } from './render.mjs';

const here = dirname(fileURLToPath(import.meta.url));

/** Every indexable page, by URL path, in sitemap order. */
export function renderAllPages() {
  const rendered = new Map();
  for (const page of pages) rendered.set(page.path, renderPage(page, { allPages: pages }));
  // Privacy pages: same template (see legal.mjs).
  for (const page of legalPages) rendered.set(page.path, renderPage(page, { allPages: pages }));
  // Free practice pages (PT only): hub + one quiz / flashcard deck per page.
  rendered.set(PRACTICE_HUB.path, renderPracticeHub());
  for (const page of practicePages) rendered.set(practicePath(page), renderPracticePage(page));
  // "Como estudar X" guides (PT only).
  rendered.set(STUDY_HUB.path, renderStudyHub());
  for (const guide of studyGuides) rendered.set(studyPath(guide), renderStudyPage(guide));
  rendered.set('/', renderHome('pt'));
  rendered.set('/en/', renderHome('en'));
  return rendered;
}

/**
 * @param {string} outDir
 * @param {{ writeManifest?: boolean, today?: string }} [options] writeManifest: update marketing/lastmod.json
 *   (npm run build does; the test build only reads it).
 */
export function buildSeoSite(outDir, { writeManifest = false, today } = {}) {
  mkdirSync(outDir, { recursive: true });
  rmSync(join(outDir, 'direito'), { recursive: true, force: true });
  rmSync(join(outDir, 'en', 'law'), { recursive: true, force: true });
  for (const slug of RETIRED_VS_SLUGS) {
    rmSync(join(outDir, slug), { recursive: true, force: true });
    rmSync(join(outDir, 'en', slug), { recursive: true, force: true });
  }
  rmSync(join(outDir, 'praticar'), { recursive: true, force: true });
  rmSync(join(outDir, 'estudar'), { recursive: true, force: true });

  const rendered = renderAllPages();
  const { dates, manifest } = resolveLastmod(rendered, readLastmod(), today);
  if (writeManifest) writeLastmod(manifest);
  for (const [path, html] of rendered) {
    const file = join(outDir, relIndex(path));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html.replaceAll(LASTMOD_TOKEN, dates.get(path)));
  }

  writeFileSync(join(outDir, '404.html'), renderNotFound());
  // CSS is minified and points at versioned font URLs; every asset URL carries a content hash.
  for (const [name, asset] of Object.entries(ASSETS)) writeFileSync(join(outDir, name), asset.content);
  cpSync(join(here, 'fonts'), join(outDir, 'fonts'), { recursive: true });
  for (const name of FONTS) if (!fontUrl(name)) throw new Error(`Missing font ${name}`);
  writeFileSync(join(outDir, '_redirects'), renderRedirects());
  writeFileSync(join(outDir, '_headers'), renderHeaders());
  writeFileSync(join(outDir, 'sitemap.xml'), renderSitemap((path) => dates.get(path)));
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
  buildSeoSite(out, { writeManifest: true });
  console.log(`Site written under ${out}. Not published. Canonical host ${ORIGIN}.`);
}
