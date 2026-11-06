/* MicroGrind site runtime. No dependencies.
 * Every loop pauses off-screen and every effect settles to a static state with prefers-reduced-motion. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var lang = (root.getAttribute('lang') || 'pt').slice(0, 2);
  var isHome = doc.body.classList.contains('mg-home');
  var hasIO = 'IntersectionObserver' in window;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function reduced() { return motion.matches; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function onMotionChange(fn) {
    if (motion.addEventListener) motion.addEventListener('change', fn);
    else if (motion.addListener) motion.addListener(fn);
  }
  /** Calls cb(true/false) as el enters/leaves the viewport. */
  function watch(el, cb, threshold) {
    if (!hasIO) { cb(true); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { cb(e.isIntersecting); });
    }, { threshold: threshold || 0 }).observe(el);
  }
  function restartAnim(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  /* ---------- Header, progress, menu, active section ---------- */

  var header = $('[data-header]');
  var progressBar = $('[data-scroll-progress]');
  var ticking = false;
  var scrollHandlers = [];

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY;
      if (header) header.classList.toggle('is-stuck', y > 8);
      if (progressBar) {
        var max = doc.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.setProperty('--sp', max > 0 ? (y / max).toFixed(4) : 0);
      }
      scrollHandlers.forEach(function (fn) { fn(y); });
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  var menuBtn = $('[data-menu]');
  var sheet = $('[data-sheet]');
  function setMenu(open) {
    if (!menuBtn || !sheet) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    sheet.hidden = !open;
  }
  if (menuBtn && sheet) {
    menuBtn.addEventListener('click', function () { setMenu(sheet.hidden); });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !sheet.hidden) { setMenu(false); menuBtn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1080) setMenu(false); });
  }

  var nav = $('.mg-nav');
  if (nav && isHome && hasIO) {
    var navLinks = $$('a[data-nav]', nav);
    var pill = $('.mg-nav-pill', nav);
    var movePill = function (link) {
      if (!pill) return;
      if (!link) { nav.style.setProperty('--po', 0); return; }
      nav.style.setProperty('--px', link.offsetLeft + 'px');
      nav.style.setProperty('--pw', link.offsetWidth + 'px');
      nav.style.setProperty('--po', 1);
    };
    var visible = {};
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var active = null;
      navLinks.forEach(function (a) {
        var on = !active && visible[a.getAttribute('data-nav')];
        if (on) active = a;
        a.classList.toggle('is-active', !!on);
      });
      movePill(active);
    }, { rootMargin: '-45% 0px -45% 0px' });
    navLinks.forEach(function (a) {
      var target = doc.getElementById(a.getAttribute('data-nav'));
      if (target) navIO.observe(target);
    });
  }

  /* ---------- Reveal ---------- */

  var reveals = $$('[data-reveal]');
  var revealIO = null;
  function armReveals() {
    if (revealIO) { revealIO.disconnect(); revealIO = null; }
    if (reduced() || !hasIO) {
      reveals.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        revealIO.unobserve(e.target);
        if (e.target.hasAttribute('data-reveal')) e.target.classList.add('is-in');
        $$(':scope > [data-reveal="line"], :scope > [data-reveal="wipe"]', e.target).forEach(function (c) { c.classList.add('is-in'); });
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });
    // Clip-path reveals have no visible area until revealed, so watch their parent instead.
    reveals.forEach(function (n) {
      if (n.classList.contains('is-in')) return;
      var v = n.getAttribute('data-reveal');
      revealIO.observe(v === 'line' || v === 'wipe' ? n.parentElement : n);
    });
  }
  armReveals();

  /* ---------- Pointer: spotlight, magnetic buttons, wordmark ---------- */

  var pointerFrame = 0;
  var lastPointer = null;
  doc.addEventListener('pointermove', function (e) {
    if (!finePointer.matches) return;
    lastPointer = e;
    if (pointerFrame) return;
    pointerFrame = window.requestAnimationFrame(function () {
      pointerFrame = 0;
      var ev = lastPointer;
      var card = ev.target.closest && ev.target.closest('.mg-glass');
      if (card) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
        card.style.setProperty('--my', (ev.clientY - r.top) + 'px');
      }
    });
  }, { passive: true });

  $$('[data-magnetic]').forEach(function (btn) {
    btn.addEventListener('pointermove', function (e) {
      if (!finePointer.matches || reduced()) return;
      var r = btn.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
      var dy = (e.clientY - (r.top + r.height / 2)) * 0.32;
      btn.style.setProperty('--mx-off', dx.toFixed(1) + 'px');
      btn.style.setProperty('--my-off', dy.toFixed(1) + 'px');
    });
    btn.addEventListener('pointerleave', function () {
      btn.style.setProperty('--mx-off', '0px');
      btn.style.setProperty('--my-off', '0px');
    });
  });

  var wordmark = $('[data-wordmark] span');
  if (wordmark) {
    var footer = wordmark.closest('footer');
    footer.addEventListener('pointermove', function (e) {
      if (!finePointer.matches) return;
      var r = wordmark.getBoundingClientRect();
      wordmark.style.setProperty('--wx', (e.clientX - r.left) + 'px');
      wordmark.style.setProperty('--wy', (e.clientY - r.top) + 'px');
    });
  }

  /* ---------- Count-up numbers ---------- */

  function countUp(el) {
    var to = parseInt(el.getAttribute('data-count-to'), 10) || 0;
    var fmt = function (n) { return Math.round(n).toLocaleString(lang === 'en' ? 'en-GB' : 'pt-PT'); };
    if (reduced()) { el.textContent = fmt(to); return; }
    var start = null;
    var dur = 1600;
    function step(t) {
      if (start === null) start = t;
      var k = clamp((t - start) / dur, 0, 1);
      el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  $$('[data-count-to]').forEach(function (el) {
    var done = false;
    watch(el, function (inView) { if (inView && !done) { done = true; countUp(el); } }, 0.6);
  });

  /* ---------- Hero ---------- */

  var hero = $('[data-hero]');
  if (hero) {
    var device = $('.mg-device', hero);
    var light = $('[data-cursor-light]', hero);
    var heroVisible = true;
    hero.addEventListener('pointermove', function (e) {
      if (!finePointer.matches || reduced()) return;
      var r = hero.getBoundingClientRect();
      var hx = ((e.clientX - r.left) / r.width) * 2 - 1;
      var hy = ((e.clientY - r.top) / r.height) * 2 - 1;
      hero.style.setProperty('--hx', hx.toFixed(3));
      hero.style.setProperty('--hy', hy.toFixed(3));
      if (light) {
        light.style.setProperty('--cx', (e.clientX - r.left) + 'px');
        light.style.setProperty('--cy', (e.clientY - r.top) + 'px');
      }
      if (device) {
        device.style.setProperty('--ry', (-12 + hx * 10).toFixed(2) + 'deg');
        device.style.setProperty('--rx', (6 - hy * 8).toFixed(2) + 'deg');
        device.style.setProperty('--gx', (60 - hx * 30).toFixed(1) + '%');
      }
    });
    hero.addEventListener('pointerleave', function () {
      hero.style.setProperty('--hx', 0);
      hero.style.setProperty('--hy', 0);
      if (device) { device.style.removeProperty('--ry'); device.style.removeProperty('--rx'); }
    });
    watch(hero, function (v) { heroVisible = v; });
    scrollHandlers.push(function (y) {
      if (heroVisible && !reduced()) hero.style.setProperty('--scroll-y', (y * 0.5).toFixed(1) + 'px');
    });

    // Device demo: upload → map → session
    var wrap = $('[data-hero-device]', hero);
    var screens = $$('[data-screen]', wrap);
    var tabs = $$('[data-stage-tab]', wrap);
    var clock = $('[data-dv-clock]', wrap);
    var STAGE_MS = 4600;
    var stage = 0;
    var stageTimer = 0;
    var clockTimer = 0;
    var deviceVisible = false;
    wrap.style.setProperty('--stage-ms', STAGE_MS + 'ms');

    function runClock() {
      window.clearInterval(clockTimer);
      if (!clock) return;
      var left = 600;
      clock.textContent = '10:00';
      if (reduced()) return;
      clockTimer = window.setInterval(function () {
        left = Math.max(0, left - 7);
        clock.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
      }, 100);
    }
    function showStage(i, fromUser) {
      stage = i;
      screens.forEach(function (s, n) {
        if (n === i) restartAnim(s, 'is-on');
        else s.classList.remove('is-on');
      });
      tabs.forEach(function (t, n) {
        t.setAttribute('aria-pressed', String(n === i));
        t.classList.toggle('is-held', reduced());
        if (n === i) restartAnim(t, 'is-on');
        else t.classList.remove('is-on');
      });
      if (i === 2) runClock(); else window.clearInterval(clockTimer);
      schedule();
      if (fromUser) wrap.classList.add('is-touched');
    }
    function schedule() {
      window.clearTimeout(stageTimer);
      if (reduced() || !deviceVisible || doc.hidden) return;
      stageTimer = window.setTimeout(function () { showStage((stage + 1) % screens.length); }, STAGE_MS);
    }
    tabs.forEach(function (t, n) { t.addEventListener('click', function () { showStage(n, true); }); });
    watch(wrap, function (v) {
      var was = deviceVisible;
      deviceVisible = v;
      if (v && !was) showStage(stage);
      if (!v) { window.clearTimeout(stageTimer); window.clearInterval(clockTimer); }
    }, 0.25);
    doc.addEventListener('visibilitychange', function () { if (!doc.hidden && deviceVisible) schedule(); });
    onMotionChange(function () { showStage(stage); });
  }

  /* ---------- Marquee ---------- */

  $$('[data-marquee]').forEach(function (m) {
    watch(m, function (v) { m.classList.toggle('is-paused', !v); });
  });

  /* ---------- Problem: scroll-linked chaos → order ---------- */

  $$('[data-scene]').forEach(function (scene) {
    var near = false;
    function update() {
      if (reduced()) { scene.style.setProperty('--p', 1); return; }
      var r = scene.getBoundingClientRect();
      var span = r.height - window.innerHeight;
      var raw = span > 0 ? clamp(-r.top / span, 0, 1) : 1;
      var k = clamp((raw - 0.08) / 0.72, 0, 1);
      var eased = k * k * (3 - 2 * k);
      scene.style.setProperty('--p', eased.toFixed(4));
    }
    watch(scene, function (v) { near = v; if (v) update(); });
    scrollHandlers.push(function () { if (near) update(); });
    onMotionChange(update);
    update();
  });

  /* ---------- Tabs helper (roving tabindex + arrows) ---------- */

  function tablist(list, onSelect) {
    var tabs = $$('[role="tab"]', list);
    function select(i, focus) {
      tabs.forEach(function (t, n) {
        var on = n === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = doc.getElementById(t.getAttribute('aria-controls'));
        if (panel) { panel.hidden = !on; panel.classList.toggle('is-on', on); }
      });
      if (focus) tabs[i].focus();
      onSelect(i, tabs[i]);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var k = e.key;
        var next = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % tabs.length;
        if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
        if (k === 'Home') next = 0;
        if (k === 'End') next = tabs.length - 1;
        if (next !== null) { e.preventDefault(); select(next, true); }
      });
    });
    var initial = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; });
    onSelect(initial < 0 ? 0 : initial, tabs[initial < 0 ? 0 : initial]);
    return select;
  }

  /* ---------- Session demo ---------- */

  var session = $('[data-session]');
  var sessionApi = null;
  if (session) {
    var radios = $$('[role="radio"]', session);
    var pill = $('.session-times-pill', session);
    var num = $('[data-session-num]', session);
    var fill = $('[data-session-fill]', session);
    var prog = $('[data-session-progress]', session);
    var topicEl = $('[data-session-topic]', session);
    var playBtn = $('[data-session-play]', session);
    var playLabel = playBtn ? $('span', playBtn) : null;
    var doneMsg = $('[data-session-done]', session);
    var label = session.getAttribute('data-step-label') || '{n}/{t}';
    var runTimer = 0;
    var current = 15;

    function list() { return $('[data-steps="' + current + '"]', session); }
    function stepText(n, t) { return label.replace('{n}', n).replace('{t}', t); }
    function paint(done) {
      var items = $$('li', list());
      var complete = session.classList.contains('is-complete');
      items.forEach(function (li, i) {
        li.classList.toggle('is-done', complete ? i < done : i < done - 1);
        li.classList.toggle('is-now', !complete && i === done - 1);
      });
      fill.style.width = (items.length ? (done / items.length) * 100 : 0) + '%';
      prog.textContent = stepText(done, items.length);
    }
    function movePill() {
      var on = radios.find(function (r) { return r.getAttribute('aria-checked') === 'true'; });
      if (!on || !pill) return;
      pill.style.setProperty('--tx', on.offsetLeft + 'px');
      pill.style.setProperty('--tw', on.offsetWidth + 'px');
    }
    function reset() {
      window.clearInterval(runTimer);
      session.classList.remove('is-complete');
      if (doneMsg) doneMsg.hidden = true;
      if (playLabel) playLabel.textContent = playBtn.getAttribute('data-label-play');
      paint(0);
    }
    function choose(min, focus) {
      current = min;
      session.setAttribute('data-min', String(min));
      radios.forEach(function (r) {
        var on = Number(r.getAttribute('data-min')) === min;
        r.setAttribute('aria-checked', String(on));
        r.tabIndex = on ? 0 : -1;
        if (on && focus) r.focus();
      });
      $$('[data-steps]', session).forEach(function (ol) { ol.hidden = Number(ol.getAttribute('data-steps')) !== min; });
      num.textContent = String(min);
      session.style.setProperty('--ring', (min / 25).toFixed(3));
      movePill();
      reset();
    }
    radios.forEach(function (r, i) {
      r.addEventListener('click', function () { choose(Number(r.getAttribute('data-min')), false); });
      r.addEventListener('keydown', function (e) {
        var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var n = (i + d + radios.length) % radios.length;
        choose(Number(radios[n].getAttribute('data-min')), true);
      });
    });
    function play() {
      reset();
      var items = $$('li', list());
      var done = 0;
      function finish() {
        window.clearInterval(runTimer);
        session.classList.add('is-complete');
        paint(items.length);
        if (doneMsg) doneMsg.hidden = false;
        if (playLabel) playLabel.textContent = playBtn.getAttribute('data-label-replay');
        if (!reduced()) restartAnim(session, 'is-flash');
      }
      if (reduced()) { finish(); return; }
      runTimer = window.setInterval(function () {
        done += 1;
        if (done > items.length) { finish(); return; }
        paint(done);
      }, 700);
      paint(++done);
    }
    if (playBtn) playBtn.addEventListener('click', play);
    window.addEventListener('resize', movePill);
    choose(15, false);
    sessionApi = {
      setTopic: function (name) { if (topicEl) topicEl.textContent = name; reset(); },
      el: session,
      focus: function () { if (playBtn) playBtn.focus({ preventScroll: true }); },
    };
  }

  /* ---------- Subject Map explorer ---------- */

  $$('[data-mapx]').forEach(function (mx) {
    var list = $('[role="tablist"]', mx);
    function bindPanel(panel) {
      if (panel.getAttribute('data-bound')) return;
      panel.setAttribute('data-bound', '1');
      var topics = $$('.mx-topic', panel);
      var details = $$('[data-detail]', panel);
      var lines = $$('.mx-lines path', panel);
      function pick(i) {
        topics.forEach(function (t, n) { t.classList.toggle('is-on', n === i); t.setAttribute('aria-pressed', String(n === i)); });
        details.forEach(function (d, n) { d.hidden = n !== i; d.classList.toggle('is-on', n === i); });
        lines.forEach(function (l, n) { l.classList.toggle('is-on', n === i); });
      }
      topics.forEach(function (t, i) { t.addEventListener('click', function () { pick(i); }); });
      $$('[data-study-topic]', panel).forEach(function (b) {
        b.addEventListener('click', function () {
          if (!sessionApi) return;
          sessionApi.setTopic(b.getAttribute('data-study-topic'));
          sessionApi.el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
          if (!reduced()) restartAnim(sessionApi.el, 'is-flash');
          sessionApi.focus();
        });
      });
      pick(0);
    }
    tablist(list, function (i) {
      var panel = $$('[role="tabpanel"]', mx)[i];
      if (panel) bindPanel(panel);
    });
  });

  /* ---------- How it works: rail + step demos ---------- */

  var railList = $('[data-rail-list]');
  var stepEls = $$('[data-step]');
  if (railList && stepEls.length && hasIO) {
    var railItems = $$('[data-rail]', railList);
    var railIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = Number(e.target.getAttribute('data-step'));
        railItems.forEach(function (li, n) { li.classList.toggle('is-on', n <= i); });
        stepEls.forEach(function (s, n) { s.classList.toggle('is-active', n === i); });
        railList.style.setProperty('--rail', ((i + 1) / stepEls.length).toFixed(3));
      });
    }, { rootMargin: '-40% 0px -45% 0px' });
    stepEls.forEach(function (s) { railIO.observe(s); });
  }

  $$('[data-step-demo]').forEach(function (demo) {
    var beats = $$('[data-beat]', demo);
    var fill = $('[data-demo-fill]', demo);
    var vertical = demo.getAttribute('data-step-demo') === 'map';
    var timer = 0;
    var hold = 0;
    function show(count) {
      beats.forEach(function (b, i) { b.classList.toggle('is-on', i < count); });
      if (fill) fill.style[vertical ? 'height' : 'width'] = (beats.length ? (count / beats.length) * 100 : 0) + '%';
    }
    function stop() { window.clearInterval(timer); window.clearTimeout(hold); }
    function play() {
      stop();
      if (reduced()) { show(beats.length); return; }
      var n = 0;
      show(0);
      timer = window.setInterval(function () {
        n += 1;
        show(n);
        if (n >= beats.length) {
          window.clearInterval(timer);
          hold = window.setTimeout(function () { if (demo.classList.contains('is-in')) play(); }, 2200);
        }
      }, 560);
    }
    watch(demo, function (v) {
      demo.classList.toggle('is-in', v);
      if (v) play(); else stop();
    }, 0.4);
    onMotionChange(function () { if (reduced()) { stop(); show(beats.length); } });
    if (!hasIO) show(beats.length);
  });

  /* ---------- Study modes studio ---------- */

  $$('[data-studio]').forEach(function (studio) {
    var list = $('[role="tablist"]', studio);
    var pill = $('.st-tab-pill', studio);
    function movePill(tab) {
      if (!pill || !tab) return;
      studio.style.setProperty('--ty', tab.offsetTop + 'px');
      studio.style.setProperty('--th', tab.offsetHeight + 'px');
      pill.style.setProperty('--ty', tab.offsetTop + 'px');
      pill.style.setProperty('--th', tab.offsetHeight + 'px');
    }
    var currentTab = null;
    tablist(list, function (i, tab) {
      currentTab = tab;
      movePill(tab);
      if (window.innerWidth <= 1080 && tab.scrollIntoView && list.scrollWidth > list.clientWidth) {
        list.scrollTo({ left: tab.offsetLeft - 16, behavior: reduced() ? 'auto' : 'smooth' });
      }
    });
    window.addEventListener('resize', function () { movePill(currentTab); });
  });

  // Lesson
  $$('[data-lesson]').forEach(function (el) {
    var slides = $$('[data-slide]', el);
    var segs = $$('.st-segs span', el);
    var btn = $('[data-lesson-next]', el);
    var i = 0;
    var arrow = btn.querySelector('svg');
    btn.addEventListener('click', function () {
      i = (i + 1) % slides.length;
      slides.forEach(function (s, n) { s.hidden = n !== i; });
      segs.forEach(function (s, n) { s.classList.toggle('is-on', n <= i); });
      btn.textContent = i === slides.length - 1 ? btn.getAttribute('data-label-restart') : btn.getAttribute('data-label-next');
      if (arrow) btn.appendChild(arrow);
    });
  });

  // Flashcards
  $$('[data-cards]').forEach(function (el) {
    var deck = JSON.parse(el.getAttribute('data-deck') || '[]');
    var card = $('[data-card-flip]', el);
    var q = $('[data-card-q]', el);
    var a = $('[data-card-a]', el);
    var count = $('[data-cards-count]', el);
    var doneP = $('[data-cards-done]', el);
    var know = $('[data-card-know]', el);
    var again = $('[data-card-again]', el);
    var restart = $('[data-card-restart]', el);
    var stack = $('.st-card-stack', el);
    var i = 0;
    var busy = false;
    function render() {
      card.setAttribute('aria-pressed', 'false');
      q.textContent = deck[i].q;
      a.textContent = deck[i].a;
      count.textContent = (i + 1) + ' / ' + deck.length;
    }
    function advance(dir) {
      if (busy) return;
      busy = true;
      var cls = dir < 0 ? 'is-out-left' : 'is-out';
      var after = function () {
        card.classList.remove('is-out', 'is-out-left');
        busy = false;
        i += 1;
        if (i >= deck.length) {
          stack.hidden = true;
          doneP.hidden = false;
          doneP.textContent = el.getAttribute('data-label-done');
          know.hidden = true; again.hidden = true; restart.hidden = false;
          restart.focus();
          return;
        }
        render();
      };
      if (reduced()) { after(); return; }
      card.classList.add(cls);
      window.setTimeout(after, 430);
    }
    card.addEventListener('click', function () {
      card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true'));
    });
    know.addEventListener('click', function () { advance(1); });
    again.addEventListener('click', function () { advance(-1); });
    restart.addEventListener('click', function () {
      i = 0; stack.hidden = false; doneP.hidden = true;
      know.hidden = false; again.hidden = false; restart.hidden = true;
      render(); card.focus();
    });
  });

  // Quiz
  $$('[data-quiz]').forEach(function (el) {
    var correct = Number(el.getAttribute('data-correct'));
    var opts = $$('[data-opt]', el);
    var fb = $('[data-quiz-feedback]', el);
    var retry = $('[data-quiz-retry]', el);
    opts.forEach(function (o) {
      o.addEventListener('click', function () {
        var i = Number(o.getAttribute('data-opt'));
        if (i === correct) {
          o.classList.add('is-right');
          opts.forEach(function (x) { x.disabled = true; });
          fb.className = 'st-feedback is-right';
          fb.textContent = el.getAttribute('data-right');
          retry.hidden = false;
        } else {
          o.classList.add('is-wrong');
          o.disabled = true;
          fb.className = 'st-feedback is-wrong';
          fb.textContent = el.getAttribute('data-wrong');
        }
      });
    });
    retry.addEventListener('click', function () {
      opts.forEach(function (x) { x.disabled = false; x.classList.remove('is-right', 'is-wrong'); });
      fb.textContent = ''; fb.className = 'st-feedback';
      retry.hidden = true;
      opts[0].focus();
    });
  });

  // Mock exam
  $$('[data-exam]').forEach(function (el) {
    var cells = $$('[data-exam-grid] span', el);
    var timerEl = $('[data-exam-timer]', el);
    var countEl = $('[data-exam-count]', el);
    var start = $('[data-exam-start]', el);
    var submit = $('[data-exam-submit]', el);
    var result = $('[data-exam-result]', el);
    var again = $('[data-exam-restart]', el);
    var tick = 0;
    var answer = 0;
    function stop() { window.clearInterval(tick); window.clearInterval(answer); el.classList.remove('is-running'); }
    function fmt(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
    function reset() {
      stop();
      cells.forEach(function (c) { c.className = ''; });
      countEl.textContent = '0';
      timerEl.textContent = '20:00';
      result.hidden = true;
      start.hidden = false; submit.hidden = true;
    }
    start.addEventListener('click', function () {
      reset();
      start.hidden = true; submit.hidden = false;
      el.classList.add('is-running');
      var left = 1200;
      var n = 0;
      if (cells[0]) cells[0].classList.add('is-now');
      tick = window.setInterval(function () { left = Math.max(0, left - 1); timerEl.textContent = fmt(left); }, 1000);
      var step = function () {
        if (n >= cells.length) { window.clearInterval(answer); submit.focus(); return; }
        cells[n].classList.remove('is-now');
        cells[n].classList.add('is-done');
        n += 1;
        countEl.textContent = String(n);
        if (cells[n]) cells[n].classList.add('is-now');
      };
      if (reduced()) { while (n < cells.length) step(); }
      else answer = window.setInterval(step, 650);
      submit.focus();
    });
    submit.addEventListener('click', function () {
      stop();
      submit.hidden = true;
      result.hidden = false;
      again.focus();
    });
    again.addEventListener('click', function () { reset(); start.focus(); });
  });

  // AI tutor chat
  $$('[data-tutor]').forEach(function (el) {
    var chat = $('[data-chat]', el);
    var prompts = $$('[data-prompt]', el);
    var busy = false;
    function bubble(cls, text) {
      var wrap = doc.createElement('div');
      wrap.className = 'st-msg ' + cls;
      if (cls === 'is-ai') {
        var av = doc.createElement('span');
        av.className = 'st-avatar';
        av.setAttribute('aria-hidden', 'true');
        av.innerHTML = el.querySelector('.st-avatar').innerHTML;
        wrap.appendChild(av);
      }
      var p = doc.createElement('p');
      p.textContent = text || '';
      wrap.appendChild(p);
      chat.appendChild(wrap);
      chat.scrollTop = chat.scrollHeight;
      return p;
    }
    prompts.forEach(function (b) {
      b.addEventListener('click', function () {
        if (busy) return;
        busy = true;
        b.disabled = true;
        bubble('is-you', b.textContent);
        var answer = b.getAttribute('data-answer');
        var finish = function () {
          busy = false;
          if (prompts.every(function (x) { return x.disabled; })) prompts.forEach(function (x) { x.disabled = false; });
        };
        if (reduced()) { bubble('is-ai', answer); finish(); return; }
        var typing = bubble('is-ai', '');
        typing.classList.add('st-typing');
        typing.innerHTML = '<i></i><i></i><i></i>';
        typing.setAttribute('aria-hidden', 'true');
        window.setTimeout(function () {
          typing.classList.remove('st-typing');
          typing.removeAttribute('aria-hidden');
          typing.textContent = '';
          var k = 0;
          var stream = window.setInterval(function () {
            k += 3;
            typing.textContent = answer.slice(0, k);
            chat.scrollTop = chat.scrollHeight;
            if (k >= answer.length) { window.clearInterval(stream); finish(); }
          }, 22);
        }, 800);
      });
    });
  });

  /* ---------- Progress: streak + battle ---------- */

  $$('[data-streak]').forEach(function (el) {
    var btn = $('[data-streak-do]', el);
    var numEl = $('[data-streak-num]', el);
    var today = $('.pg-days li.is-today', el);
    btn.addEventListener('click', function () {
      today.classList.add('is-lit');
      numEl.textContent = String(Number(numEl.textContent) + 1);
      if (!reduced()) restartAnim(numEl, 'is-bump');
      btn.disabled = true;
      $('span', btn).textContent = el.getAttribute('data-done-label');
    });
  });

  $$('[data-battle]').forEach(function (el) {
    var btn = $('[data-battle-start]', el);
    var btnLabel = $('span', btn);
    var msg = $('[data-battle-msg]', el);
    var tug = $('.pg-tug', el);
    var players = $$('.pg-player', el);
    var scores = [$('[data-battle-score="0"]', el), $('[data-battle-score="1"]', el)];
    var dots = [$$('[data-battle-dots="0"] i', el), $$('[data-battle-dots="1"] i', el)];
    var note = msg.textContent;
    var timer = 0;
    btn.addEventListener('click', function () {
      window.clearInterval(timer);
      var pts = [0, 0];
      var round = 0;
      players.forEach(function (p) { p.classList.remove('is-winner'); });
      dots.forEach(function (row) { row.forEach(function (d) { d.className = ''; }); });
      scores.forEach(function (s) { s.textContent = '0'; });
      tug.style.setProperty('--tug', 0);
      msg.textContent = note;
      el.classList.add('is-running');
      btn.disabled = true;
      function play() {
        [0.72, 0.62].forEach(function (chance, who) {
          var ok = Math.random() < chance;
          if (ok) pts[who] += 1;
          dots[who][round].className = ok ? 'is-right' : 'is-wrong';
          scores[who].textContent = String(pts[who] * 100);
        });
        tug.style.setProperty('--tug', ((pts[1] - pts[0]) / 5).toFixed(2));
        round += 1;
        if (round >= 5) {
          window.clearInterval(timer);
          el.classList.remove('is-running');
          btn.disabled = false;
          btnLabel.textContent = el.getAttribute('data-again');
          if (pts[0] > pts[1]) { players[0].classList.add('is-winner'); msg.textContent = el.getAttribute('data-win'); }
          else if (pts[1] > pts[0]) { players[1].classList.add('is-winner'); msg.textContent = el.getAttribute('data-lose'); }
          else msg.textContent = el.getAttribute('data-tie');
        }
      }
      if (reduced()) { while (round < 5) play(); return; }
      timer = window.setInterval(play, 800);
    });
  });

  /* ---------- Who rotator (homepage; content pages run their own inline copy) ---------- */

  if (isHome) {
    $$('[data-who-rotator]').forEach(function (rot) {
      var words = $$('[data-who-word]', rot);
      var live = rot.parentElement ? $('[data-who-live]', rot.parentElement) : null;
      var index = 0;
      var timer = 0;
      var inView = false;
      function show(i) {
        words.forEach(function (w, n) { w.classList.toggle('is-on', n === i); });
        if (live && words[i]) live.textContent = words[i].textContent;
      }
      function arm() {
        window.clearInterval(timer);
        if (reduced() || words.length < 2 || !inView) { if (reduced()) show(0); return; }
        timer = window.setInterval(function () { index = (index + 1) % words.length; show(index); }, 4500);
      }
      watch(rot, function (v) { inView = v; arm(); });
      onMotionChange(arm);
    });
  }

  /* ---------- Install (PWA / iOS dialog) ---------- */

  var overlay = $('#install-overlay');
  if (overlay) {
    var dialog = $('#install-dialog');
    var web = overlay.getAttribute('data-web') || '/app/';
    var apk = (overlay.getAttribute('data-android') || '').trim();
    var ua = navigator.userAgent || '';
    var ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var android = /Android/i.test(ua) && !ios;
    var en = overlay.getAttribute('data-lang') === 'en';
    var lastFocus = null;
    var copy = function (e, p) { return en ? e : p; };
    function openDialog() {
      lastFocus = doc.activeElement;
      overlay.hidden = false;
      dialog.focus();
    }
    function closeDialog() {
      overlay.hidden = true;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function runInstall(e) {
      if (e) e.preventDefault();
      setMenu(false);
      if (ios) { openDialog(); return; }
      window.location.href = android && apk ? apk : web;
    }
    $$('.js-install').forEach(function (b) { b.addEventListener('click', runInstall); });
    $('#install-dialog-close').addEventListener('click', closeDialog);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeDialog(); });
    doc.addEventListener('keydown', function (e) {
      if (overlay.hidden) return;
      if (e.key === 'Escape') closeDialog();
      if (e.key === 'Tab') {
        var f = $$('a[href], button:not([disabled])', dialog);
        if (!f.length) return;
        if (e.shiftKey && doc.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && doc.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });

    var bar = $('#install-bar');
    if (bar) {
      var note = $('#install-note');
      var go = $('#install-go');
      var dismissed = false;
      try { dismissed = window.sessionStorage.getItem('mg-install-dismiss') === '1'; } catch (err) { /* private mode */ }
      if (ios) {
        note.textContent = copy('Open the web app in Safari, then Share and Add to Home Screen.', 'Abre a app web no Safari, depois Partilhar e Adicionar ao Ecrã Principal.');
        go.textContent = copy('How to install', 'Como instalar');
        go.setAttribute('href', '#install-dialog');
        go.addEventListener('click', runInstall);
      } else if (android && apk) {
        note.textContent = copy('Download the Android app.', 'Transfere a app para Android.');
        go.textContent = copy('Download', 'Transferir');
        go.setAttribute('href', apk);
      } else if (android) {
        note.textContent = copy('Coming soon on Android. Open the web app.', 'Em breve no Android. Abre a app web.');
      }
      if (dismissed) {
        bar.remove();
      } else {
        bar.hidden = false;
        // Shown like browser chrome: only after the hero, and only while scrolling up or at the end.
        var heroEl = $('[data-hero]');
        var lastY = window.scrollY;
        scrollHandlers.push(function (y) {
          var past = heroEl ? y > heroEl.offsetHeight * 0.7 : y > 400;
          var atEnd = y + window.innerHeight >= doc.documentElement.scrollHeight - 40;
          var goingUp = y < lastY - 4;
          var goingDown = y > lastY + 4;
          if (!past) bar.classList.remove('is-up');
          else if (goingUp || atEnd) bar.classList.add('is-up');
          else if (goingDown) bar.classList.remove('is-up');
          lastY = y;
        });
        $('#install-dismiss').addEventListener('click', function () {
          try { window.sessionStorage.setItem('mg-install-dismiss', '1'); } catch (err) { /* private mode */ }
          bar.remove();
        });
      }
    }
  }

  onMotionChange(armReveals);
  onScroll();
})();
