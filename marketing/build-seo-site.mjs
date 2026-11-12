/**
 * Writes the public site into site-static/ (or another directory): homepage, content pages,
 * design-system assets, sitemap, robots and redirects. Does not publish.
 * The app export in dist/ stays separate and still has no root index.html.
 */
import { cpSync, mkdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { RETIRED_VS_SLUGS } from './compare.mjs';
import { ORIGIN, pages } from './content.mjs';
import { renderHome } from './home.mjs';
import { legalPages } from './legal.mjs';
import { practicePath, renderPracticeHub, renderPracticePage } from './practice-page.mjs';
import { PRACTICE_HUB, practicePages } from './practice/index.mjs';
import { renderStudyHub, renderStudyPage, studyPath } from './study-page.mjs';
import { STUDY_HUB, studyGuides } from './study/index.mjs';
import { relIndex, renderPage, renderRedirects, renderRobots, renderSitemap } from './render.mjs';

const here = dirname(fileURLToPath(import.meta.url));

export function buildSeoSite(outDir) {
  mkdirSync(outDir, { recursive: true });
  rmSync(join(outDir, 'direito'), { recursive: true, force: true });
  rmSync(join(outDir, 'en', 'law'), { recursive: true, force: true });
  for (const slug of RETIRED_VS_SLUGS) {
    rmSync(join(outDir, slug), { recursive: true, force: true });
    rmSync(join(outDir, 'en', slug), { recursive: true, force: true });
  }
  for (const page of pages) {
    const file = join(outDir, relIndex(page.path));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, renderPage(page, { allPages: pages }));
  }
  // Privacy pages: same template (see legal.mjs).
  for (const page of legalPages) {
    const file = join(outDir, relIndex(page.path));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, renderPage(page, { allPages: pages }));
  }
  // Free practice pages (PT only): hub + one quiz / flashcard deck per page.
  rmSync(join(outDir, 'praticar'), { recursive: true, force: true });
  mkdirSync(dirname(join(outDir, relIndex(PRACTICE_HUB.path))), { recursive: true });
  writeFileSync(join(outDir, relIndex(PRACTICE_HUB.path)), renderPracticeHub());
  for (const page of practicePages) {
    const file = join(outDir, relIndex(practicePath(page)));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, renderPracticePage(page));
  }
  // "Como estudar X" guides (PT only).
  rmSync(join(outDir, 'estudar'), { recursive: true, force: true });
  mkdirSync(dirname(join(outDir, relIndex(STUDY_HUB.path))), { recursive: true });
  writeFileSync(join(outDir, relIndex(STUDY_HUB.path)), renderStudyHub());
  for (const guide of studyGuides) {
    const file = join(outDir, relIndex(studyPath(guide)));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, renderStudyPage(guide));
  }
  writeFileSync(join(outDir, 'index.html'), renderHome('pt'));
  mkdirSync(join(outDir, 'en'), { recursive: true });
  writeFileSync(join(outDir, 'en', 'index.html'), renderHome('en'));
  cpSync(join(here, 'site.css'), join(outDir, 'marketing.css'));
  cpSync(join(here, 'motion.css'), join(outDir, 'motion.css'));
  cpSync(join(here, 'mg.css'), join(outDir, 'mg.css'));
  cpSync(join(here, 'mg.js'), join(outDir, 'mg.js'));
  cpSync(join(here, 'practice.css'), join(outDir, 'practice.css'));
  cpSync(join(here, 'practice.js'), join(outDir, 'practice.js'));
  cpSync(join(here, 'fonts'), join(outDir, 'fonts'), { recursive: true });
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
  console.log(`Site written under ${out}. Not published. Canonical host ${ORIGIN}.`);
}
