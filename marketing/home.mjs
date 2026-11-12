/**
 * Homepage renderer (PT-PT and EN).
 * Story: hero → the problem → the Subject Map → how it works → study modes → progress
 * → who it is for → call to action → FAQ.
 * Interactive demos are driven by /mg.js and work without it as static illustrations.
 */
import { ga4HeadSnippet } from '../lib/ga4.mjs';
import { FEATURE_ANCHORS } from './anchors.mjs';
import { esc, headAssets, renderCookieBanner, renderFooter, renderHeader, renderInstallDialog } from './chrome.mjs';
import { HOME, ORIGIN, WEB_APP } from './content.mjs';
import { HOME_COPY } from './home-copy.mjs';
import { chapterCard, progressRing, subjectProgress } from './learning-path.mjs';
import { jsonLd } from './render.mjs';
import { renderWhoLevels } from './who.mjs';

function svg(inner, cls = '') {
  const c = cls ? ` class="${cls}"` : '';
  return `<svg${c} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

const I = {
  upload: svg('<path d="M12 15V4"></path><path d="m7.5 8.5 4.5-4.5 4.5 4.5"></path><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"></path>'),
  map: svg('<circle cx="12" cy="5.5" r="2.2"></circle><circle cx="5.5" cy="18" r="2.2"></circle><circle cx="18.5" cy="18" r="2.2"></circle><path d="M11 7.5 6.6 16"></path><path d="m13 7.5 4.4 8.5"></path><path d="M7.7 18h8.6"></path>'),
  clock: svg('<circle cx="12" cy="13" r="7.5"></circle><path d="M12 9.5V13l2.4 1.6"></path><path d="M10 2.8h4"></path>'),
  file: svg('<path d="M14 3H7.5A1.5 1.5 0 0 0 6 4.5v15A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V7z"></path><path d="M14 3v4h4"></path><path d="M9 12.5h6M9 16h4"></path>'),
  book: svg('<path d="M4.5 5.5A2 2 0 0 1 6.5 3.5h12v15h-12a2 2 0 0 0-2 2z"></path><path d="M4.5 20.5v-15"></path><path d="M8.5 8h6"></path>'),
  slides: svg('<rect x="3.5" y="4.5" width="17" height="11.5" rx="1.6"></rect><path d="M12 16v3.5M8.5 19.5h7"></path><path d="m10.3 8 3.7 2.2-3.7 2.2z"></path>'),
  lesson: svg('<path d="M4 6.5 12 3l8 3.5-8 3.5z"></path><path d="M7 8.3v4.4c0 1.6 2.2 2.8 5 2.8s5-1.2 5-2.8V8.3"></path><path d="M20 6.5v5"></path>'),
  cards: svg('<rect x="6.5" y="3.5" width="13" height="16" rx="2"></rect><path d="M4.5 6.5v12a2 2 0 0 0 2 2h9"></path>'),
  quiz: svg('<circle cx="12" cy="12" r="8.5"></circle><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 3.5"></path><path d="M12 17h.01"></path>'),
  exam: svg('<rect x="5" y="3.5" width="14" height="17" rx="2"></rect><path d="M9 3.5V5.5h6V3.5"></path><path d="m8.8 12 2 2 4.2-4.2"></path>'),
  tutor: svg('<path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l.9-4.7A7.5 7.5 0 1 1 20 12.5z"></path><path d="M9 11h.01M12 11h.01M15 11h.01"></path>'),
  flame: svg('<path d="M12 21c3.6 0 6-2.4 6-5.6 0-3.8-3.2-5.4-3.8-9.4-2.4 1.4-3.6 3.6-3.4 6-1.2-.6-2-1.8-2.2-3.2C6.9 10.4 6 12.6 6 15.4 6 18.6 8.4 21 12 21z"></path>'),
  bolt: svg('<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"></path>'),
  swords: svg('<path d="M14.5 17.5 3 6V3h3l11.5 11.5"></path><path d="m13 19 6-6"></path><path d="m16 16 4 4"></path><path d="m19 21 2-2"></path><path d="M14.5 6.5 18 3h3v3l-3.5 3.5"></path><path d="m5 14 4 4"></path><path d="m7 17-3 3"></path><path d="m3 19 2 2"></path>'),
  arrow: svg('<path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path>'),
  down: svg('<path d="M12 5v14"></path><path d="m6 13 6 6 6-6"></path>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"></path>'),
  play: svg('<path d="M7 4.5v15l12-7.5z"></path>'),
  spark: svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"></path>'),
  mail: svg('<rect x="3" y="5.5" width="18" height="13" rx="2"></rect><path d="m3.5 7 8.5 6 8.5-6"></path>'),
};

function demoTag(text) {
  return `<span class="mg-demo-tag"><span class="mg-dot" aria-hidden="true"></span>${esc(text)}</span>`;
}

function kicker(n, text) {
  return `<p class="mg-kicker"><span class="mg-kicker-n" aria-hidden="true">${n}</span>${esc(text)}</p>`;
}

/* ---------- Hero ---------- */

function heroDevice(c) {
  const h = c.hero;
  const tabs = h.stages
    .map(
      (label, i) =>
        `<button type="button" class="mg-stage-tab${i === 0 ? ' is-on' : ''}" data-stage-tab="${i}" aria-pressed="${i === 0}"><span class="mg-stage-bar" aria-hidden="true"><span></span></span>${esc(label)}</button>`
    )
    .join('');
  const ui = c.map.path;
  const deviceChapter = chapterCard({
    n: 2,
    title: h.map.chapter,
    state: 'active',
    done: 1,
    total: 3,
    ui,
    size: 'sm',
    nodes: [
      { label: h.map.lessons[0], state: 'done', score: 85 },
      { label: h.map.lessons[1], state: 'current' },
      { label: h.map.lessons[2], state: 'locked' },
    ],
  });
  const steps = h.session.steps
    .map((s, i) => `<li style="--i:${i}"><span class="dv-check" aria-hidden="true">${I.check}</span>${esc(s)}</li>`)
    .join('');
  return `<div class="mg-device-wrap" data-hero-device>
<div class="mg-device" data-tilt>
<div class="mg-device-glare" aria-hidden="true"></div>
<div class="mg-device-screen" role="img" aria-label="${esc(h.deviceLabel)}">
<div class="dv-status" aria-hidden="true"><span>9:41</span><span class="dv-island"></span><span class="dv-signal"></span></div>
<div class="dv-screen is-on" data-screen="0">
<p class="dv-title">${esc(h.upload.title)}</p>
<div class="dv-drop"><span class="dv-file">${I.file}<span><b>${esc(h.upload.file)}</b><small>${esc(h.upload.pages)}</small></span></span><span class="dv-bar"><span></span></span><small class="dv-status-text">${esc(h.upload.status)}</small></div>
<div class="dv-ghosts" aria-hidden="true"><span></span><span></span><span></span></div>
</div>
<div class="dv-screen dv-map-screen" data-screen="1">
<div class="dv-subject"><div><p class="dv-title">${esc(h.map.title)}</p><p class="dv-sub">${esc(ui.lessons(4, 13))}</p></div>${progressRing(31, 52)}</div>
${deviceChapter}
</div>
<div class="dv-screen" data-screen="2">
<p class="dv-title">${esc(h.session.title)}</p>
<div class="dv-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50"></circle><circle class="dv-ring-fill" cx="60" cy="60" r="50"></circle></svg><span class="dv-ring-num"><b data-dv-clock>10:00</b><small>${esc(h.session.topic)}</small></span></div>
<ol class="dv-steps">${steps}</ol>
<p class="dv-done">${I.spark}<span>${esc(h.session.done)}</span></p>
</div>
</div>
</div>
<div class="mg-float mg-float-score" data-depth="0.6" aria-hidden="true"><span class="mg-float-icon">${I.bolt}</span><span><small>${esc(h.chipScore)}</small><b><span data-count-to="72">72</span><i>/100</i></b></span></div>
<div class="mg-float mg-float-streak" data-depth="1" aria-hidden="true"><span class="mg-float-icon is-warm">${I.flame}</span><span><b>6</b><small>${esc(h.chipStreak)}</small></span></div>
<div class="mg-float mg-float-card" data-depth="0.35" aria-hidden="true"><small>${esc(h.chipCard)}</small><b>${esc(h.chipCardText)}</b></div>
<div class="mg-stage-tabs" role="group" aria-label="${esc(h.stagesLabel)}">${tabs}</div>
</div>`;
}

function hero(c) {
  const h = c.hero;
  const formats = h.formats.map((f) => `<li>${esc(f)}</li>`).join('');
  return `<section class="mg-hero" data-hero>
<div class="mg-hero-bg" aria-hidden="true">
<div class="mg-aurora mg-aurora-a" data-depth="-0.4"></div>
<div class="mg-aurora mg-aurora-b" data-depth="-0.25"></div>
<div class="mg-aurora mg-aurora-c" data-depth="-0.15"></div>
<div class="mg-grid-paper"></div>
<svg class="mg-constellation" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice"><g><path d="M90 520 L260 410 L420 470 L560 330"></path><path d="M260 410 L300 250 L470 180"></path><path d="M880 140 L1010 230 L1120 160"></path><path d="M1010 230 L980 400 L1110 520"></path></g><g class="mg-constellation-dots"><circle cx="90" cy="520" r="3"></circle><circle cx="260" cy="410" r="4"></circle><circle cx="420" cy="470" r="3"></circle><circle cx="560" cy="330" r="3"></circle><circle cx="300" cy="250" r="3"></circle><circle cx="470" cy="180" r="4"></circle><circle cx="880" cy="140" r="3"></circle><circle cx="1010" cy="230" r="4"></circle><circle cx="1120" cy="160" r="3"></circle><circle cx="980" cy="400" r="3"></circle><circle cx="1110" cy="520" r="3"></circle></g></svg>
<div class="mg-cursor-light" data-cursor-light></div>
</div>
<div class="wrap mg-hero-grid">
<div class="mg-hero-copy">
<p class="slogan mg-pill" data-reveal="rise"><span class="mg-pulse" aria-hidden="true"></span>${esc(h.slogan)}</p>
<h1 class="mg-h1"><span class="h1-brand">MicroGrind</span> <span class="h1-a" data-reveal="line" style="--d:80ms">${esc(h.h1a)}</span> <span class="h1-b" data-reveal="line" style="--d:220ms">${esc(h.h1b)}</span></h1>
<p class="lede" data-reveal="rise" style="--d:360ms">${esc(h.lede)}</p>
<div class="hero-actions" data-reveal="rise" style="--d:480ms">
<a class="btn btn-lg btn-shine" href="${WEB_APP}" data-magnetic>${esc(h.primary)}${I.arrow}</a>
<a class="btn btn-lg btn-ghost" href="#${c.how.id}">${esc(h.secondary)}${I.down}</a>
</div>
<p class="support" data-reveal="rise" style="--d:560ms">${esc(h.support)}</p>
<ul class="mg-formats" aria-label="${esc(h.formatsLabel)}" data-reveal="rise" style="--d:640ms">${formats}</ul>
</div>
<div class="mg-hero-visual" data-reveal="device" style="--d:200ms">${heroDevice(c)}<p class="mg-hero-demo">${demoTag(c.demoTag)}</p></div>
</div>
</section>`;
}

function marquee(c) {
  const m = c.marquee;
  const row = (items) => {
    const one = items.map((item) => `<span>${esc(item)}</span><i aria-hidden="true">✦</i>`).join('');
    return `<div class="mg-marquee-track">${one}${one}</div>`;
  };
  return `<section class="mg-marquee" data-marquee>
<p class="visually-hidden">${esc(m.label)}</p>
<div class="mg-marquee-row" aria-hidden="true">${row(m.items)}</div>
<div class="mg-marquee-row is-reverse" aria-hidden="true">${row(m.materials)}</div>
</section>`;
}

/* ---------- Problem: chaos → order, driven by scroll ---------- */

const SCATTER = [
  [6, 14, -14], [62, 6, 9], [30, 40, -6], [72, 48, 16], [12, 66, 11], [48, 70, -12],
  [74, 20, -8], [24, 10, 18], [68, 76, 7], [40, 18, -18], [4, 40, 6], [56, 42, 13],
];

function problem(c) {
  const p = c.problem;
  const pieces = p.pieces
    .map((label, i) => {
      const [x0, y0, r0] = SCATTER[i];
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x1 = 3 + col * 24.5;
      const y1 = 30 + row * 21;
      return `<span class="mg-piece" style="--x0:${x0};--y0:${y0};--r0:${r0};--x1:${x1};--y1:${y1};--k:${i}"><span class="mg-piece-lines" aria-hidden="true"></span>${esc(label)}</span>`;
    })
    .join('');
  const heads = p.ordered.map((t, i) => `<span class="mg-col-head" style="--x1:${3 + i * 24.5};--k:${i}">${esc(t)}</span>`).join('');
  return `<section class="mg-problem" id="${p.id}" data-scene aria-labelledby="${p.id}-h">
<div class="mg-scene-sticky">
<div class="wrap mg-problem-grid">
<div class="mg-problem-copy">
${kicker('01', p.kicker)}
<h2 id="${p.id}-h" class="mg-h2" data-reveal="wipe">${esc(p.h2)}</h2>
<div class="mg-ba">
<p class="mg-ba-before"><b>${esc(p.before)}</b>${esc(p.beforeText)}</p>
<p class="mg-ba-after"><b>${esc(p.after)}</b>${esc(p.afterText)}</p>
</div>
<p class="mg-scroll-hint" aria-hidden="true">${I.down}${esc(p.hint)}</p>
</div>
<div class="mg-problem-stage" aria-hidden="true">
<div class="mg-stage-grid"></div>
<span class="mg-stage-root">MicroGrind</span>
${heads}${pieces}
<span class="mg-stage-meter"><span></span></span>
</div>
</div>
</div>
</section>`;
}

/* ---------- Subject Map explorer ---------- */

function mapExplorer(c) {
  const m = c.map;
  const ui = m.path;
  const tabs = m.subjects
    .map(
      (s, i) =>
        `<button type="button" role="tab" id="mx-tab-${s.id}" aria-controls="mx-panel-${s.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" class="mg-chip-tab">${esc(s.label)}</button>`
    )
    .join('');
  const panels = m.subjects
    .map((s, si) => {
      const prog = subjectProgress(s);
      const cards = prog.chapters
        .map((ch) => {
          const nodes = [...ch.lessons, ch.checkpoint].map((node) => {
            const label = node.checkpoint ? ui.checkpoint(ch.n) : node.label;
            let status;
            if (node.checkpoint) status = node.state === 'done' ? ui.checkpointDone(node.score) : ui.checkpointLocked;
            else if (node.state === 'done') status = ui.done(node.score);
            else if (node.state === 'current') status = `${ui.next} · ${ui.continueLesson}`;
            else status = ui.locked;
            const attrs = `data-map-lesson data-title="${esc(label)}" data-meta="${esc(`${ui.chapter(ch.n)} · ${ch.title}`)}" data-status="${esc(status)}" data-state="${node.state}" data-topic="${esc(ch.title)}" data-order="${esc(`${m.orderLabel} ${ch.n}`)}"`;
            return { ...node, label, attrs };
          });
          return chapterCard({ n: ch.n, title: ch.title, state: ch.state, done: ch.done, total: ch.total, ui, nodes, interactive: true });
        })
        .join('');
      const cur = prog.current;
      return `<div class="mx-panel${si === 0 ? ' is-on' : ''}" role="tabpanel" id="mx-panel-${s.id}" aria-labelledby="mx-tab-${s.id}"${si === 0 ? '' : ' hidden'}>
<div class="mx-phone">
<div class="mx-app" tabindex="0" aria-label="${esc(s.label)}">
<div class="lp-subject"><span class="lp-subject-icon" aria-hidden="true">${I.map}</span><div><p class="lp-subject-title">${esc(s.label)}</p><p class="lp-subject-sub">${esc(ui.lessons(prog.done, prog.total))}</p></div>${progressRing(prog.pct)}</div>
<div class="lp-next"><span class="lp-next-play" aria-hidden="true">${I.play}</span><div><p class="lp-next-label">${esc(ui.next)}</p><p class="lp-next-title">${esc(cur.label)}</p><p class="lp-next-sub">${esc(ui.continueLesson)}</p></div><span class="lp-next-arrow" aria-hidden="true">›</span></div>
<div class="lp-exam"><span aria-hidden="true">${I.exam}</span>${esc(ui.examMode)}<span class="lp-next-arrow" aria-hidden="true">›</span></div>
${cards}
</div>
</div>
<div class="mx-side" aria-live="polite">
<p class="mx-detail-meta" data-detail-meta>${esc(`${ui.chapter(cur.chapter.n)} · ${cur.chapter.title}`)}</p>
<p class="mx-detail-title" data-detail-title>${esc(cur.label)}</p>
<p class="mx-detail-status is-current" data-detail-status>${esc(`${ui.next} · ${ui.continueLesson}`)}</p>
<p class="mx-detail-order" data-detail-order>${esc(`${m.orderLabel} ${cur.chapter.n}`)}</p>
<button type="button" class="btn btn-sm mx-study" data-study-topic="${esc(cur.chapter.title)}">${esc(m.cta)}${I.arrow}</button>
</div>
</div>`;
    })
    .join('');
  return `<section class="mg-section mg-map" id="${m.id}" aria-labelledby="${m.id}-h">
<div class="wrap">
<div class="mg-split-head">
<div>
${kicker('02', m.kicker)}
<h2 id="${m.id}-h" class="mg-h2" data-reveal="wipe">${esc(m.h2)}</h2>
</div>
<div class="mg-map-copy" data-reveal="rise">
<p>${m.body}</p>
<p class="mg-order-note">${I.check}<span>${esc(m.order)}</span></p>
</div>
</div>
<div class="mg-mapx mg-glass" data-mapx data-reveal="scale">
<div class="mg-mapx-bar">
<div class="mg-chip-tabs" role="tablist" aria-label="${esc(m.tabsLabel)}">${tabs}</div>
${demoTag(c.demoData)}
</div>
${panels}
<p class="mx-hint">${esc(m.hint)}</p>
</div>
<p class="does-emph mg-quote" data-reveal="wipe">${esc(m.emph)}</p>
</div>
</section>`;
}

/* ---------- How it works ---------- */

function uploadDemo(h) {
  const icons = [I.file, I.book, I.slides];
  const rows = h.uploadItems
    .map((label, i) => `<li data-beat style="--k:${i}"><span class="sd-icon" aria-hidden="true">${icons[i]}</span><span>${esc(label)}</span><span class="sd-tick" aria-hidden="true">${I.check}</span></li>`)
    .join('');
  return `<div class="step-demo sd-upload" data-step-demo="upload"><p class="session-caption">${esc(h.uploadCaption)}</p><div class="sd-drop"><span class="sd-drop-icon" aria-hidden="true">${I.upload}</span><span class="sd-drop-text">${esc(h.uploadDrop)}</span></div><ol class="sd-files">${rows}</ol><div class="sd-bar" aria-hidden="true"><span data-demo-fill></span></div></div>`;
}

function mapDemo(c) {
  const h = c.how;
  const ui = c.map.path;
  const card = chapterCard({
    n: 1,
    title: h.mapRoot,
    state: 'active',
    done: 1,
    total: 3,
    ui,
    size: 'sm',
    beats: true,
    nodes: [
      { label: h.mapItems[0], state: 'done', score: 90 },
      { label: h.mapItems[1], state: 'current' },
      { label: h.mapItems[2], state: 'locked' },
    ],
  });
  return `<div class="step-demo sd-map" data-step-demo="map"><p class="session-caption">${esc(h.mapCaption)}</p>${card}</div>`;
}

function sessionDemo(c) {
  const h = c.how;
  const mins = [5, 10, 15, 25];
  const radios = mins
    .map(
      (m) =>
        `<button type="button" role="radio" data-min="${m}" aria-checked="${m === 15}" tabindex="${m === 15 ? 0 : -1}">${m}<span class="visually-hidden"> ${esc(h.minutes)}</span></button>`
    )
    .join('');
  const lists = mins
    .map((m) => {
      const steps = h.stepsByMin[m];
      const items = steps
        .map((s, i) => `<li><span class="session-index" aria-hidden="true">${i + 1}</span><span>${esc(s)}</span></li>`)
        .join('');
      const hidden = m === 15 ? '' : ' hidden';
      return `<ol class="session-steps" data-steps="${m}"${hidden}>${items}</ol>`;
    })
    .join('');
  const total = h.stepsByMin[15].length;
  return `<div class="session" data-session data-min="15" data-step-label="${esc(h.stepOf('{n}', '{t}'))}">
<p class="session-caption">${esc(h.sessionCaption)}</p>
<div class="session-times" role="radiogroup" aria-label="${esc(h.sessionGroup)}"><span class="session-times-pill" aria-hidden="true"></span>${radios}</div>
<div class="session-board">
<div class="session-clock" aria-hidden="true"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52"></circle><circle class="session-ring" cx="60" cy="60" r="52"></circle></svg><p><b data-session-num>15</b><small>min</small></p></div>
<div class="session-main">
<p class="session-topic">${esc(h.topicLabel)}: <b data-session-topic>${esc(h.defaultTopic)}</b></p>
<p class="session-progress" data-session-progress aria-live="polite">${esc(h.stepOf(0, total))}</p>
<div class="session-bar" aria-hidden="true"><span data-session-fill></span></div>
${lists}
</div>
</div>
<div class="session-foot"><button type="button" class="btn btn-sm" data-session-play data-label-play="${esc(h.play)}" data-label-replay="${esc(h.replay)}">${I.play}<span>${esc(h.play)}</span></button><p class="session-done" data-session-done hidden>${I.flame}<span>${esc(h.done)}</span></p></div>
</div>`;
}

function how(c) {
  const h = c.how;
  const icons = [I.upload, I.map, I.clock];
  const demos = [uploadDemo(h), mapDemo(c), sessionDemo(c)];
  const rail = h.steps.map((s, i) => `<li data-rail="${i}"><span>0${i + 1}</span>${esc(s.h3)}</li>`).join('');
  const steps = h.steps
    .map(
      (s, i) =>
        `<article class="step mg-step mg-glass" data-step="${i}" data-reveal="rise"><div class="mg-step-head"><span class="icon">${icons[i]}</span><span class="step-no" aria-hidden="true">0${i + 1}</span></div><h3>${esc(s.h3)}</h3><p>${esc(s.p)}</p>${demos[i]}</article>`
    )
    .join('');
  return `<section class="mg-section mg-how" id="${h.id}" aria-labelledby="${h.id}-h">
<div class="wrap mg-how-grid">
<div class="mg-how-side">
${kicker('03', h.kicker)}
<h2 id="${h.id}-h" class="mg-h2" data-reveal="wipe">${esc(h.h2)}</h2>
<ol class="mg-rail" data-rail-list aria-hidden="true"><span class="mg-rail-fill"></span>${rail}</ol>
</div>
<div class="mg-steps" data-steps-list>${steps}</div>
</div>
</section>`;
}

/* ---------- Study modes studio ---------- */

function studioLesson(f) {
  const l = f.lesson;
  const slides = l.slides
    .map((s, i) => `<div class="st-slide${i === 0 ? ' is-on' : ''}" data-slide="${i}"${i === 0 ? '' : ' hidden'}><p class="st-slide-h">${esc(s.h)}</p><p class="st-slide-p">${s.p}</p></div>`)
    .join('');
  const segs = l.slides.map((_, i) => `<span${i === 0 ? ' class="is-on"' : ''}></span>`).join('');
  return `<div class="st-lesson" data-lesson><p class="st-meta">${esc(l.topic)}</p><div class="st-segs" aria-hidden="true">${segs}</div><div class="st-slides" aria-live="polite">${slides}</div><button type="button" class="btn btn-sm" data-lesson-next data-label-next="${esc(l.next)}" data-label-restart="${esc(l.restart)}">${esc(l.next)}${I.arrow}</button></div>`;
}

function studioCards(f) {
  const d = f.cards;
  const first = d.deck[0];
  const deck = esc(JSON.stringify(d.deck));
  return `<div class="st-cards" data-cards data-deck="${deck}" data-label-done="${esc(d.doneText)}">
<p class="st-meta" data-cards-count>${esc(d.count(1, d.deck.length))}</p>
<div class="st-card-stack"><span class="st-card-shadow" aria-hidden="true"></span><span class="st-card-shadow is-2" aria-hidden="true"></span>
<button type="button" class="st-card" data-card-flip aria-pressed="false"><span class="visually-hidden">${esc(d.flip)}: </span><span class="st-card-inner"><span class="st-card-face st-front" data-card-q>${esc(first.q)}</span><span class="st-card-face st-back" data-card-a>${esc(first.a)}</span></span></button>
</div>
<p class="st-cards-done" data-cards-done hidden></p>
<div class="st-row"><button type="button" class="btn btn-sm btn-ghost" data-card-again>${esc(d.again)}</button><button type="button" class="btn btn-sm" data-card-know>${esc(d.know)}${I.check}</button><button type="button" class="btn btn-sm btn-ghost" data-card-restart hidden>${esc(d.restart)}</button></div>
</div>`;
}

function studioQuiz(f) {
  const q = f.quiz;
  const opts = q.options
    .map((o, i) => `<li><button type="button" class="st-opt" data-opt="${i}"><span class="st-opt-key" aria-hidden="true">${'ABCD'[i]}</span>${esc(o)}</button></li>`)
    .join('');
  return `<div class="st-quiz" data-quiz data-correct="${q.correct}" data-right="${esc(q.right)}" data-wrong="${esc(q.wrong)}"><p class="st-q">${esc(q.q)}</p><ol class="st-opts">${opts}</ol><p class="st-feedback" data-quiz-feedback aria-live="polite"></p><button type="button" class="btn btn-sm btn-ghost" data-quiz-retry hidden>${esc(q.retry)}</button></div>`;
}

function studioExam(f) {
  const e = f.exam;
  const cells = Array.from({ length: 10 }, (_, i) => `<span>${i + 1}</span>`).join('');
  const bars = e.topics
    .map(([t, v], i) => `<li style="--v:${v};--k:${i}"><span>${esc(t)}</span><span class="st-bar"><span></span></span></li>`)
    .join('');
  return `<div class="st-exam" data-exam>
<div class="st-exam-head"><div><p class="st-meta">${esc(e.meta)}</p><p class="st-exam-title">${esc(e.title)}</p></div><p class="st-timer" data-exam-timer aria-hidden="true">20:00</p></div>
<div class="st-exam-grid" data-exam-grid aria-hidden="true">${cells}</div>
<p class="st-meta"><b data-exam-count>0</b>/10 ${esc(e.answered)}</p>
<div class="st-row"><button type="button" class="btn btn-sm" data-exam-start>${I.play}${esc(e.start)}</button><button type="button" class="btn btn-sm btn-ghost" data-exam-submit hidden>${esc(e.submit)}</button></div>
<div class="st-exam-result" data-exam-result hidden><p class="st-exam-title">${esc(e.result)}</p><ul class="st-bars">${bars}</ul><p class="st-meta">${esc(e.resultNote)}</p><button type="button" class="btn btn-sm btn-ghost" data-exam-restart>${esc(e.restart)}</button></div>
</div>`;
}

function studioTutor(f) {
  const t = f.tutor;
  const prompts = t.prompts
    .map((p, i) => `<button type="button" class="st-prompt" data-prompt="${i}" data-answer="${esc(p.a)}">${esc(p.q)}</button>`)
    .join('');
  return `<div class="st-tutor" data-tutor data-you="${esc(t.you)}" data-name="${esc(t.title)}">
<div class="st-chat" data-chat aria-live="polite"><div class="st-msg is-ai"><span class="st-avatar" aria-hidden="true">${I.spark}</span><p>${esc(t.hello)}</p></div></div>
<div class="st-prompts">${prompts}</div>
</div>`;
}

/** Studio tab id → key in FEATURE_ANCHORS. */
const TAB_ANCHOR = { licoes: 'lessons', flashcards: 'flashcards', quiz: 'quiz', exame: 'exam', tutor: 'tutor' };

function features(c, locale) {
  const f = c.features;
  const anchorOf = (t) => FEATURE_ANCHORS[locale][TAB_ANCHOR[t.id]];
  const anchors = f.tabs.map((t) => `<span class="st-anchor" id="${anchorOf(t)}"></span>`).join('');
  const icons = [I.lesson, I.cards, I.quiz, I.exam, I.tutor];
  const bodies = [studioLesson(f), studioCards(f), studioQuiz(f), studioExam(f), studioTutor(f)];
  const tabs = f.tabs
    .map(
      (t, i) =>
        `<button type="button" role="tab" id="st-tab-${t.id}" aria-controls="st-panel-${t.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" class="st-tab" data-anchor="${anchorOf(t)}"><span class="st-tab-icon">${icons[i]}</span><span class="st-tab-text"><b>${esc(t.label)}</b><small>${esc(t.blurb)}</small></span></button>`
    )
    .join('');
  const panels = f.tabs
    .map(
      (t, i) =>
        `<div class="st-panel${i === 0 ? ' is-on' : ''}" role="tabpanel" id="st-panel-${t.id}" aria-labelledby="st-tab-${t.id}" tabindex="0"${i === 0 ? '' : ' hidden'}><div class="st-window-bar"><span class="st-lights" aria-hidden="true"><i></i><i></i><i></i></span><span class="st-window-title">${icons[i]}${esc(t.label)}</span>${demoTag(c.demoTag)}</div><div class="st-body">${bodies[i]}</div></div>`
    )
    .join('');
  return `<section class="mg-section mg-features" id="${f.id}" aria-labelledby="${f.id}-h">
<div class="mg-features-bg" aria-hidden="true"></div>
<div class="wrap">
<div class="mg-center-head">
${kicker('04', f.kicker)}
<h2 id="${f.id}-h" class="mg-h2" data-reveal="wipe">${esc(f.h2)}</h2>
<p class="mg-lede" data-reveal="rise">${esc(f.lede)}</p>
</div>
<div class="st-anchors" aria-hidden="true">${anchors}</div>
<div class="mg-studio" data-studio data-reveal="scale">
<div class="st-tabs" role="tablist" aria-label="${esc(f.tabsLabel)}" aria-orientation="vertical"><span class="st-tab-pill" aria-hidden="true"></span>${tabs}</div>
<div class="st-stage mg-glass" data-spotlight>${panels}</div>
</div>
</div>
</section>`;
}

/* ---------- Progress: Grind Score, streak, battles ---------- */

function progress(c) {
  const p = c.progress;
  const parts = p.score.breakdown
    .map(([label, v], i) => `<li style="--v:${v};--k:${i}"><span class="pg-part-name">${esc(label)}</span><b>${v}</b><span class="pg-part-bar"><span></span></span></li>`)
    .join('');
  const days = p.streak.days
    .map((d, i) => `<li class="${i < 6 ? 'is-lit' : 'is-today'}" style="--k:${i}"><span class="pg-flame" aria-hidden="true">${I.flame}</span><small>${esc(d)}</small></li>`)
    .join('');
  const qdots = Array.from({ length: 5 }, () => '<i></i>').join('');
  return `<section class="mg-section mg-progress-sec" id="${p.id}" aria-labelledby="${p.id}-h">
<div class="wrap">
<div class="mg-split-head">
<div>
${kicker('05', p.kicker)}
<h2 id="${p.id}-h" class="mg-h2" data-reveal="wipe">${esc(p.h2)}</h2>
</div>
<p class="mg-lede" data-reveal="rise">${esc(p.lede)}</p>
</div>
<div class="mg-bento">
<article class="pg-card pg-score mg-glass" data-spotlight data-reveal="rise" data-score>
<div class="pg-head"><span class="pg-icon">${I.bolt}</span><h3>${esc(p.score.title)}</h3>${demoTag(c.demoData)}</div>
<div class="pg-score-body">
<div class="pg-gauge"><svg viewBox="0 0 200 120" aria-hidden="true"><path class="pg-gauge-track" d="M20 110 A80 80 0 0 1 180 110"></path><path class="pg-gauge-fill" pathLength="100" d="M20 110 A80 80 0 0 1 180 110"></path></svg><p class="pg-gauge-num"><b><span data-count-to="72">72</span><i>${esc(p.score.max)}</i></b><span class="pg-tier">${esc(p.score.label)}</span><small>${esc(p.score.delta)}</small></p></div>
<div class="pg-parts"><p class="pg-label">${esc(p.score.breakdownTitle)}</p><ul>${parts}</ul></div>
</div>
<p class="pg-note">${esc(p.score.note)}</p>
</article>
<article class="pg-card pg-streak mg-glass" data-spotlight data-reveal="rise" style="--d:120ms" data-streak data-done-label="${esc(p.streak.doneLabel)}">
<div class="pg-head"><span class="pg-icon is-warm">${I.flame}</span><h3>${esc(p.streak.title)}</h3></div>
<p class="pg-streak-num"><b data-streak-num>6</b><small>${esc(p.streak.unit)}</small></p>
<ol class="pg-days" aria-hidden="true">${days}</ol>
<p class="pg-note">${esc(p.streak.note)}</p>
<button type="button" class="btn btn-sm btn-warm" data-streak-do>${I.flame}<span>${esc(p.streak.action)}</span></button>
</article>
<article class="pg-card pg-battle mg-glass" data-spotlight data-reveal="rise" style="--d:200ms" data-battle data-win="${esc(p.battle.win)}" data-lose="${esc(p.battle.lose)}" data-tie="${esc(p.battle.tie)}" data-again="${esc(p.battle.again)}">
<div class="pg-head"><span class="pg-icon">${I.swords}</span><h3>${esc(p.battle.title)}</h3><span class="pg-sub">${esc(p.battle.subject)}</span>${demoTag(c.demoData)}</div>
<div class="pg-arena">
<div class="pg-player is-you"><span class="pg-avatar" aria-hidden="true">${esc(p.battle.you.slice(0, 1))}</span><b>${esc(p.battle.you)}</b><span class="pg-score-num" data-battle-score="0">0</span><span class="pg-qdots" data-battle-dots="0">${qdots}</span></div>
<div class="pg-vs" aria-hidden="true"><span>VS</span></div>
<div class="pg-player is-rival"><span class="pg-avatar" aria-hidden="true">${esc(p.battle.rival.slice(0, 1))}</span><b>${esc(p.battle.rival)}</b><span class="pg-score-num" data-battle-score="1">0</span><span class="pg-qdots" data-battle-dots="1">${qdots}</span></div>
</div>
<div class="pg-tug" aria-hidden="true"><span data-battle-tug></span></div>
<div class="pg-battle-foot"><p class="pg-note" data-battle-msg aria-live="polite">${esc(p.battle.note)}</p><button type="button" class="btn btn-sm" data-battle-start>${I.swords}<span>${esc(p.battle.start)}</span></button></div>
</article>
</div>
</div>
</section>`;
}

/* ---------- Who + principle ---------- */

function who(c, locale) {
  const w = c.who;
  const sheets = w.sheets.map((s, i) => `<span class="mg-sheet-card" style="--k:${i}"><span class="mg-sheet-lines" aria-hidden="true"></span>${esc(s)}</span>`).join('');
  return `<section class="mg-section mg-who" id="${w.id}" aria-label="${esc(w.kicker)}">
<div class="wrap mg-who-grid">
<div class="mg-who-col" data-reveal="rise">
${kicker('06', w.kicker)}
<aside class="who"><div class="who-copy"><h3>${esc(w.h3)}</h3><p>${esc(w.p)}</p></div>${renderWhoLevels(locale)}</aside>
</div>
<div class="principle mg-principle mg-glass" data-spotlight data-reveal="scale">
<div class="mg-sheets" aria-hidden="true">${sheets}</div>
<div><p class="kicker">${esc(w.principleKicker)}</p><h2 class="mg-h2">${esc(w.principleH2)}</h2><p>${esc(w.principleP)}</p></div>
</div>
</div>
</section>`;
}

function cta(c) {
  const k = c.cta;
  return `<section class="mg-cta" aria-labelledby="mg-cta-h">
<div class="mg-cta-bg" aria-hidden="true"><span class="mg-cta-ring"></span><span class="mg-cta-ring is-2"></span><span class="mg-cta-ring is-3"></span></div>
<div class="wrap mg-cta-inner" data-reveal="scale">
<p class="mg-kicker is-center">${esc(k.kicker)}</p>
<h2 id="mg-cta-h" class="mg-cta-title">${esc(k.h2)}</h2>
<p class="mg-lede">${esc(k.p)}</p>
<div class="hero-actions is-center"><a class="btn btn-lg btn-shine" href="${WEB_APP}" data-magnetic>${esc(k.primary)}${I.arrow}</a><button class="btn btn-lg btn-ghost js-install" type="button">${esc(k.install)}</button></div>
</div>
</section>`;
}

function faq(c) {
  const f = c.faq;
  const items = f.items
    .map((item) => {
      const attr = item.negation ? ' data-seo-negation="true"' : '';
      return `<details${attr}><summary>${esc(item.q)}</summary><div class="faq-a"><div><p>${esc(item.a)}</p></div></div></details>`;
    })
    .join('');
  return `<section class="mg-section faq mg-faq" id="${f.id}" aria-labelledby="${f.id}-h">
<div class="wrap mg-faq-grid">
<div class="mg-faq-side">
<h2 id="${f.id}-h" class="mg-h2" data-reveal="wipe">${esc(f.h2)}</h2>
<p class="mg-lede">${esc(f.side)}</p>
<a class="mg-mail" href="mailto:ola@microgrind.app">${I.mail}ola@microgrind.app</a>
</div>
<div class="faq-list" data-reveal="rise">${items}</div>
</div>
</section>`;
}

function installBar(c) {
  const t = c.install;
  return `<div class="install-bar" id="install-bar" role="region" aria-label="${esc(t.region)}" hidden><div class="install-inner"><img class="install-mark" src="/logo-mark.png" width="40" height="40" alt=""><div class="install-copy"><p class="install-title">${esc(t.title)}</p><p class="install-note" id="install-note">${esc(t.note)}</p></div><div class="install-actions"><button class="btn btn-sm install-go js-install" id="install-go" type="button">${esc(t.go)}</button><button class="install-dismiss" id="install-dismiss" type="button" aria-label="${esc(t.close)}">×</button></div></div></div>`;
}

export function homeFaqs(locale) {
  return HOME_COPY[locale].faq.items.map(({ q, a }) => ({ q, a }));
}

export function renderHome(locale) {
  const c = HOME_COPY[locale];
  const spec = HOME[locale];
  const url = locale === 'en' ? `${ORIGIN}/en/` : `${ORIGIN}/`;
  const ld = jsonLd({ locale, path: c.path, title: c.title, description: spec.description, faqs: homeFaqs(locale) });
  const ogLocale = locale === 'en' ? 'en_GB' : 'pt_PT';
  const ogAlt = locale === 'en' ? 'pt_PT' : 'en_GB';
  return `<!DOCTYPE html>
<html lang="${c.lang}">
<head>
${ga4HeadSnippet()}<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(c.title)}</title>
<meta name="description" content="${esc(spec.description)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="pt" href="${ORIGIN}/">
<link rel="alternate" hreflang="pt-PT" href="${ORIGIN}/">
<link rel="alternate" hreflang="en" href="${ORIGIN}/en/">
<link rel="alternate" hreflang="x-default" href="${ORIGIN}/">
<meta property="og:site_name" content="MicroGrind">
<meta property="og:type" content="website">
<meta property="og:locale" content="${ogLocale}">
<meta property="og:locale:alternate" content="${ogAlt}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(c.title)}">
<meta property="og:description" content="${esc(spec.description)}">
<meta property="og:image" content="${ORIGIN}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(c.ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(c.title)}">
<meta name="twitter:description" content="${esc(spec.description)}">
<meta name="twitter:image" content="${ORIGIN}/og.png">
<meta name="twitter:image:alt" content="${esc(c.ogAlt)}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<meta name="theme-color" content="#07090d">
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script>document.documentElement.classList.add('js');</script>
${headAssets()}
</head>
<body class="mg-home">
${renderHeader({ locale, otherPath: c.otherPath, onHome: true })}
<main id="conteudo" tabindex="-1">
${hero(c)}
${marquee(c)}
${problem(c)}
${mapExplorer(c)}
${how(c)}
${features(c, locale)}
${progress(c)}
${who(c, locale)}
${cta(c)}
${faq(c)}
</main>
${renderFooter({ locale, onHome: true })}
${installBar(c)}
${renderInstallDialog(locale)}
${renderCookieBanner(locale)}
</body>
</html>
`;
}
