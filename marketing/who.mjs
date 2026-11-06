/**
 * Study-level panel for «Para quem» / «Who it is for».
 * Illustrative only: not links, and not a list of degree names.
 */

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function icon(inner) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

const ICONS = {
  one: icon('<path d="M14.8 5.4a1.9 1.9 0 0 1 2.7 2.7L8 17.6 4.6 18.8l1.2-3.4z"></path><path d="M13 7.2 16.2 10.4"></path>'),
  two: icon(
    '<path d="M5 5.4A2.2 2.2 0 0 1 7.2 3.2H19.5v15.6H7.2A2.2 2.2 0 0 0 5 21z"></path><path d="M5 5.4A2.2 2.2 0 0 1 7.2 7.6H19.5"></path>'
  ),
  map: icon('<path d="M3 10 12 5.4 21 10 12 14.6z"></path><path d="M6.4 12v3.4c0 1.4 2.5 2.7 5.6 2.7s5.6-1.3 5.6-2.7V12"></path>'),
};

const COPY = {
  pt: {
    listLabel: 'Níveis de ensino',
    levels: [
      { icon: 'one', label: 'Ensino básico' },
      { icon: 'two', label: 'Secundário' },
      { icon: 'map', label: 'Superior' },
    ],
    note: 'Qualquer curso ou disciplina — do teu material.',
    words: ['Biologia', 'História', 'Economia', 'Inglês'],
  },
  en: {
    listLabel: 'Levels of study',
    levels: [
      { icon: 'one', label: 'Primary' },
      { icon: 'two', label: 'Secondary' },
      { icon: 'map', label: 'Higher education' },
    ],
    note: 'Any course or subject — from your own material.',
    words: ['Biology', 'History', 'Economics', 'English'],
  },
};

export function renderWhoLevels(locale) {
  const spec = COPY[locale];
  if (!spec) throw new Error(`No who levels for ${locale}`);
  const items = spec.levels
    .map(
      (level) =>
        `<li class="who-level"><span class="who-level-icon" aria-hidden="true">${ICONS[level.icon]}</span><span class="who-level-label">${escapeHtml(level.label)}</span></li>`
    )
    .join('');
  const words = spec.words
    .map((word, index) =>
      index === 0
        ? `<span data-who-word class="is-on">${escapeHtml(word)}</span>`
        : `<span data-who-word>${escapeHtml(word)}</span>`
    )
    .join('');
  return `<div class="who-areas" data-who-levels><ul class="who-levels" aria-label="${escapeHtml(spec.listLabel)}">${items}</ul><p class="who-note">${escapeHtml(spec.note)}</p><p class="who-subject"><span class="who-subject-words" data-who-rotator aria-hidden="true">${words}</span><span class="visually-hidden" data-who-live aria-live="polite">${escapeHtml(spec.words[0])}</span></p></div>`;
}

/** Shared browser runtime. Expects a matchMedia('(prefers-reduced-motion: reduce)') object named by the caller. */
export function whoBootSource() {
  return `function bootWho(motion) {
  var arms = [];
  document.querySelectorAll('[data-who-rotator]').forEach(function (rot) {
    var words = Array.prototype.slice.call(rot.querySelectorAll('[data-who-word]'));
    var live = rot.parentElement ? rot.parentElement.querySelector('[data-who-live]') : null;
    var index = 0;
    var timer = 0;
    words.forEach(function (word, n) {
      if (word.classList.contains('is-on')) index = n;
    });
    function show(i) {
      words.forEach(function (word, n) {
        word.classList.toggle('is-on', n === i);
      });
      if (live && words[i]) live.textContent = words[i].textContent;
    }
    function stop() {
      window.clearInterval(timer);
      timer = 0;
    }
    function arm() {
      stop();
      if (motion.matches || words.length < 2) {
        show(0);
        return;
      }
      show(index);
      timer = window.setInterval(function () {
        if (motion.matches) {
          stop();
          show(0);
          return;
        }
        index = (index + 1) % words.length;
        show(index);
      }, 4500);
    }
    arms.push(arm);
    arm();
  });
  document.querySelectorAll('[data-who-levels]').forEach(function (panel) {
    if (panel.closest('.reveal')) return;
    var io = null;
    function armPanel() {
      if (io) {
        io.disconnect();
        io = null;
      }
      if (motion.matches || !('IntersectionObserver' in window)) {
        panel.classList.add('is-in');
        return;
      }
      if (panel.classList.contains('is-in')) return;
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (motion.matches || entry.isIntersecting) {
            panel.classList.add('is-in');
            if (io) io.disconnect();
          }
        });
      }, { threshold: 0.35 });
      io.observe(panel);
    }
    arms.push(armPanel);
    armPanel();
  });
  return function () {
    arms.forEach(function (arm) { arm(); });
  };
}`;
}

export function pageMotionScript() {
  return `<script>
(function () {
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  ${whoBootSource()}
  var armWho = bootWho(motion);
  function onMotion() { armWho(); }
  if (motion.addEventListener) motion.addEventListener('change', onMotion);
  else if (motion.addListener) motion.addListener(onMotion);
})();
</script>`;
}
