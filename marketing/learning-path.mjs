/**
 * Learning path component: the vertical, winding lesson path of the app's subject map.
 * Used by the homepage in the hero device, the map explorer and the how-it-works step.
 */
import { esc } from './chrome.mjs';

/* ---------- Learning path (same look as the app's subject map) ---------- */

const PATH_X = [50, 74, 26, 74, 26, 74, 26];
const ROW = { md: 160, sm: 132 };

const ICON_STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.8l2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 16.87l-5.5 2.88 1.05-6.12L3.1 9.3l6.15-.9z"></path></svg>';
const ICON_LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.4" fill="currentColor"></rect><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.2"></path></svg>';
export const ICON_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

function nodeIcon(node) {
  if (node.state === 'done') return ICON_CHECK;
  if (node.state === 'current') return ICON_STAR;
  return ICON_LOCK;
}

/**
 * nodes: [{ label, state: 'done'|'current'|'locked', score?, checkpoint?, attrs? }]
 * Interactive paths render buttons (attrs carry the detail data for mg.js).
 */
export function lessonPath(nodes, { size = 'md', interactive = false, cont = 'CONTINUAR', beats = false } = {}) {
  const row = ROW[size];
  const height = nodes.length * row;
  const pos = nodes.map((node, i) => ({
    x: node.checkpoint ? 50 : PATH_X[i % PATH_X.length],
    y: i * row + row * 0.36,
  }));
  const segs = pos
    .slice(1)
    .map((p, i) => {
      const a = pos[i];
      const bend = row * 0.55;
      const d = `M${a.x} ${a.y} C${a.x} ${a.y + bend} ${p.x} ${p.y - bend} ${p.x} ${p.y}`;
      const lit = nodes[i + 1].state !== 'locked';
      return lit
        ? `<path class="lp-seg-shadow" d="${d}"></path><path class="lp-seg is-lit" d="${d}"></path>`
        : `<path class="lp-seg is-dots" d="${d}"></path>`;
    })
    .join('');
  const items = nodes
    .map((node, i) => {
      const tag = interactive ? 'button' : 'span';
      const type = interactive ? ' type="button"' : '';
      const cls = `lp-node is-${node.state}${node.checkpoint ? ' is-checkpoint' : ''}${i === 0 ? ' is-first' : ''}`;
      const attrs = node.attrs ? ` ${node.attrs}` : '';
      const beat = beats ? ' data-beat' : '';
      const pressed = interactive ? ` aria-pressed="${node.state === 'current'}"` : '';
      const pill = node.state === 'current' ? `<span class="lp-continue" aria-hidden="true">${esc(cont)}</span>` : '';
      const score = node.state === 'done' && node.score != null ? `<span class="lp-score">${node.score}%</span>` : '';
      return `<${tag}${type} class="${cls}" style="--x:${pos[i].x};--y:${pos[i].y}px;--k:${i}"${attrs}${beat}${pressed}>${pill}<span class="lp-orb">${nodeIcon(node)}</span><span class="lp-label">${esc(node.label)}</span>${score}</${tag}>`;
    })
    .join('');
  return `<div class="lp-path lp-${size}" style="height:${height}px"><svg class="lp-lines" viewBox="0 0 100 ${height}" preserveAspectRatio="none" aria-hidden="true">${segs}</svg>${items}</div>`;
}

/** Chapter card: header, progress bar and the path. */
export function chapterCard({ n, title, state, done, total, nodes, ui, size = 'md', interactive = false, beats = false, fillAttr = '' }) {
  const badge = state === 'complete' ? ICON_CHECK : String(n);
  const pill = state === 'complete' ? `<span class="lp-pill">${esc(ui.complete)}</span>` : '';
  const pct = total ? Math.round((done / total) * 100) : 0;
  return `<section class="lp-chapter is-${state}" aria-label="${esc(ui.chapter(n))}: ${esc(title)}">
<div class="lp-chapter-head"><span class="lp-badge" aria-hidden="true">${badge}</span><div class="lp-chapter-name"><p class="lp-chapter-no">${esc(ui.chapter(n))}</p><p class="lp-chapter-title"${beats ? ' data-beat' : ''}>${esc(title)}</p></div>${pill}</div>
<div class="lp-progress"><span class="lp-bar"><span${fillAttr} style="width:${pct}%"></span></span><small>${esc(ui.progress(done, total))}</small></div>
${lessonPath(nodes, { size, interactive, cont: ui.cont, beats })}
</section>`;
}

/** Ring like the app's subject header. */
export function progressRing(pct, size = 64) {
  const r = 26;
  const c = (2 * Math.PI * r).toFixed(1);
  const off = (c * (1 - pct / 100)).toFixed(1);
  return `<span class="lp-ring" style="--s:${size}px" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="${r}"></circle><circle class="lp-ring-fill" cx="32" cy="32" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${off}"></circle></svg><b>${pct}%</b></span>`;
}

const SCORES = [85, 95, 100, 80, 80, 67, 90, 75, 88, 92];

/** Turns subject topics → chapters with lesson states like a map in progress. */
export function subjectProgress(subject) {
  let k = 0;
  const chapters = subject.topics.map((topic, ci) => {
    const state = ci < 2 ? 'complete' : ci === 2 ? 'active' : 'locked';
    const lessons = topic.concepts.map((name, li) => {
      let s = 'locked';
      if (state === 'complete') s = 'done';
      else if (state === 'active') s = li === 0 ? 'done' : li === 1 ? 'current' : 'locked';
      return { label: name, state: s, score: s === 'done' ? SCORES[k++ % SCORES.length] : null };
    });
    const done = lessons.filter((l) => l.state === 'done').length;
    const checkpoint = { label: null, state: state === 'complete' ? 'done' : 'locked', checkpoint: true, score: state === 'complete' ? SCORES[k++ % SCORES.length] : null };
    return { n: ci + 1, title: topic.name, state, done, total: lessons.length, lessons, checkpoint };
  });
  const total = chapters.reduce((a, c) => a + c.total, 0);
  const done = chapters.reduce((a, c) => a + c.done, 0);
  const current = chapters.flatMap((c) => c.lessons.map((l) => ({ ...l, chapter: c }))).find((l) => l.state === 'current');
  return { chapters, total, done, pct: Math.round((done / total) * 100), current };
}
