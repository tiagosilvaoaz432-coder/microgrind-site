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
      nav.style.setProperty('--px', (link.getBoundingClientRect().left - nav.getBoundingClientRect().left) + 'px');
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

  /* ---------- Funcionalidades / Features dropdown in the header ---------- */

  $$('[data-drop]').forEach(function (drop) {
    var toggle = $('[data-drop-toggle]', drop);
    var menu = $('[data-drop-menu]', drop);
    if (!toggle || !menu) return;
    var closeTimer = null;
    function setDrop(open) {
      window.clearTimeout(closeTimer);
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      drop.classList.toggle('is-open', open);
    }
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setDrop(menu.hidden);
      if (!menu.hidden && e.detail === 0) { var first = $('a', menu); if (first) first.focus(); }
    });
    if (finePointer.matches) {
      drop.addEventListener('mouseenter', function () { setDrop(true); });
      drop.addEventListener('mouseleave', function () { closeTimer = window.setTimeout(function () { setDrop(false); }, 160); });
    }
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setDrop(false); });
    drop.addEventListener('focusout', function (e) { if (!drop.contains(e.relatedTarget)) setDrop(false); });
    doc.addEventListener('click', function (e) { if (!drop.contains(e.target)) setDrop(false); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setDrop(false); toggle.focus(); }
    });
  });

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

  /* ---------- "On this page" index for content pages ---------- */

  var toc = $('[data-toc]');
  if (toc) {
    var heads = $$('.legal-inner h2').filter(function (h) { return !h.closest('.faq-list'); });
    if (heads.length >= 4) {
      var list = $('ol', toc);
      var links = heads.map(function (h, i) {
        if (!h.id) {
          var slug = (h.textContent || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          h.id = (slug || 'sec') + '-' + (i + 1);
        }
        var li = doc.createElement('li');
        var a = doc.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        li.appendChild(a);
        list.appendChild(li);
        return a;
      });
      toc.hidden = false;
      if (hasIO) {
        var tocIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var at = heads.indexOf(e.target);
            links.forEach(function (a, n) { a.classList.toggle('is-active', n === at); });
          });
        }, { rootMargin: '-20% 0px -70% 0px' });
        heads.forEach(function (h) { tocIO.observe(h); });
      }
    }
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
      var lessons = $$('[data-map-lesson]', panel);
      var meta = $('[data-detail-meta]', panel);
      var title = $('[data-detail-title]', panel);
      var status = $('[data-detail-status]', panel);
      var order = $('[data-detail-order]', panel);
      var study = $('[data-study-topic]', panel);
      function pick(node) {
        lessons.forEach(function (n) { n.setAttribute('aria-pressed', String(n === node)); });
        meta.textContent = node.getAttribute('data-meta');
        title.textContent = node.getAttribute('data-title');
        status.textContent = node.getAttribute('data-status');
        status.className = 'mx-detail-status is-' + node.getAttribute('data-state');
        order.textContent = node.getAttribute('data-order');
        study.setAttribute('data-study-topic', node.getAttribute('data-topic'));
      }
      lessons.forEach(function (n) { n.addEventListener('click', function () { pick(n); }); });
      study.addEventListener('click', function () {
        if (!sessionApi) return;
        sessionApi.setTopic(study.getAttribute('data-study-topic'));
        sessionApi.el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
        if (!reduced()) restartAnim(sessionApi.el, 'is-flash');
        sessionApi.focus();
      });
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
    var timer = 0;
    var hold = 0;
    function show(count) {
      beats.forEach(function (b, i) { b.classList.toggle('is-on', i < count); });
      if (fill) fill.style.width = (beats.length ? (count / beats.length) * 100 : 0) + '%';
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
    var select = tablist(list, function (i, tab) {
      currentTab = tab;
      movePill(tab);
      if (window.innerWidth <= 1080 && tab.scrollIntoView && list.scrollWidth > list.clientWidth) {
        list.scrollTo({ left: tab.offsetLeft - 16, behavior: reduced() ? 'auto' : 'smooth' });
      }
    });
    window.addEventListener('resize', function () { movePill(currentTab); });

    // Each mode has its own link (/#tutor, /#quizzes, ...). Open that tab on load and on hash change,
    // and keep the address in step when a tab is chosen, so the link can be shared.
    var tabs = $$('[role="tab"]', list);
    function fromHash() {
      var id = '';
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch (err) { return; }
      if (!id) return;
      for (var n = 0; n < tabs.length; n++) {
        if (tabs[n].getAttribute('data-anchor') === id) { select(n, false); return; }
      }
    }
    fromHash();
    window.addEventListener('hashchange', fromHash);
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var id = t.getAttribute('data-anchor');
        if (id && window.history && window.history.replaceState && window.location.hash !== '#' + id) {
          window.history.replaceState(null, '', '#' + id);
        }
      });
    });
  });

  /* ---------- Plans: monthly / yearly ---------- */

  $$('[data-plans]').forEach(function (plans) {
    var choices = $$('[data-interval-choice]', plans);
    function pick(value, focus) {
      plans.setAttribute('data-interval', value);
      choices.forEach(function (b) {
        var on = b.getAttribute('data-interval-choice') === value;
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
    }
    choices.forEach(function (b, i) {
      b.addEventListener('click', function () { pick(b.getAttribute('data-interval-choice'), false); });
      b.addEventListener('keydown', function (e) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) < 0) return;
        e.preventDefault();
        var next = choices[(i + 1) % choices.length];
        pick(next.getAttribute('data-interval-choice'), true);
      });
    });
    pick(plans.getAttribute('data-interval') || 'year', false);
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

  /* ---------- Cookie consent (analytics only after "Accept") ---------- */

  var cookieBox = $('[data-cookies]');
  var CONSENT_KEY = 'mg-consent';
  function readConsent() {
    try { return window.localStorage.getItem(CONSENT_KEY); } catch (err) { return null; }
  }
  function clearAnalyticsCookies() {
    var host = window.location.hostname.replace(/^www\./, '');
    doc.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^_ga/.test(name)) return;
      ['', '; domain=' + host, '; domain=.' + host].forEach(function (d) {
        doc.cookie = name + '=; Max-Age=0; path=/' + d;
      });
    });
  }
  function showCookies(open) {
    if (!cookieBox) return;
    cookieBox.hidden = !open;
    if (open) window.requestAnimationFrame(function () { cookieBox.classList.add('is-up'); });
    else cookieBox.classList.remove('is-up');
  }
  if (cookieBox) {
    $$('[data-cookie-choice]', cookieBox).forEach(function (b) {
      b.addEventListener('click', function () {
        var choice = b.getAttribute('data-cookie-choice');
        try { window.localStorage.setItem(CONSENT_KEY, choice); } catch (err) { /* private mode */ }
        if (choice === 'granted') {
          if (typeof window.mgLoadAnalytics === 'function') window.mgLoadAnalytics();
        } else {
          if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: 'denied' });
          clearAnalyticsCookies();
        }
        showCookies(false);
      });
    });
    $$('[data-cookie-open]').forEach(function (b) { b.addEventListener('click', function () { showCookies(true); }); });
    if (!readConsent()) showCookies(true);
  }

  /* ---------- Install guide, dialog and install bar ----------
   * Markup: install.mjs. Tabs per device, steps that play the phone illustration,
   * and a <dialog> opened by every .js-install button. */

  var installDialog = $('#install-dialog');
  var ua = navigator.userAgent || '';
  var ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var android = /Android/i.test(ua) && !ios;
  var mobile = ios || android;
  var platform = ios ? 'ios' : android ? 'android' : 'desktop';
  var inApp = /FBAN|FBAV|FB_IAB|Instagram|TikTok|musical_ly|Bytedance|Snapchat|LinkedInApp|Pinterest|Line\//i.test(ua);
  var iosOther = ios && /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua);
  var samsung = /SamsungBrowser/i.test(ua);
  function installText(name) { return installDialog ? installDialog.getAttribute('data-' + name) || '' : ''; }
  var installHint = inApp ? installText('hint-in-app') : iosOther ? installText('hint-ios-other') : samsung ? installText('hint-samsung') : '';

  function setupGuide(guide) {
    var tabs = $$('[role="tab"]', guide);
    var panels = $$('[role="tabpanel"]', guide);
    var live = null;
    var state = 1;
    var timer = 0;
    var seen = false;
    var paused = false;
    function count() { return live ? $$('[data-ig-step]', live).length : 0; }
    function go(n) {
      if (!live) return;
      state = n;
      var screen = $('[data-ig-screen]', live);
      if (screen) screen.setAttribute('data-state', String(n));
      $$('[data-ig-step]', live).forEach(function (step) {
        var k = Number(step.getAttribute('data-ig-step'));
        var b = $('button', step);
        step.classList.toggle('is-now', k === n);
        step.classList.toggle('is-done', k < n);
        if (k === n) b.setAttribute('aria-current', 'step');
        else b.removeAttribute('aria-current');
      });
    }
    function stop() { window.clearInterval(timer); timer = 0; }
    function play() {
      stop();
      if (paused || !seen || reduced()) return;
      timer = window.setInterval(function () { go(state % count() + 1); }, 2600);
    }
    function select(name, focus) {
      tabs.forEach(function (tab) {
        var on = tab.getAttribute('data-ig-tab') === name;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        if (on && focus) tab.focus();
      });
      panels.forEach(function (panel) {
        var on = panel.getAttribute('data-ig-panel') === name;
        panel.hidden = !on;
        if (on) live = panel;
      });
      go(reduced() ? count() : 1);
      play();
    }
    tabs.forEach(function (tab, i) {
      if (tab.getAttribute('data-ig-tab') === platform) {
        var here = $('.ig-here', tab);
        if (here) here.hidden = false;
      }
      tab.addEventListener('click', function () { paused = false; select(tab.getAttribute('data-ig-tab')); });
      tab.addEventListener('keydown', function (e) {
        var move = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!move) return;
        e.preventDefault();
        select(tabs[(i + move + tabs.length) % tabs.length].getAttribute('data-ig-tab'), true);
      });
    });
    $$('[data-ig-step] button', guide).forEach(function (b) {
      b.addEventListener('click', function () {
        paused = true;
        stop();
        go(Number(b.parentNode.getAttribute('data-ig-step')));
      });
    });
    var hintBox = $('[data-ig-hint]', guide);
    if (hintBox && installHint) {
      $('p', hintBox).textContent = installHint;
      hintBox.hidden = false;
      var copyBtn = $('[data-ig-copy]', hintBox);
      if (samsung || !navigator.clipboard) copyBtn.hidden = true;
      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(copyBtn.getAttribute('data-ig-copy')).then(function () {
          $('span', copyBtn).textContent = installText('hint-copied');
        });
      });
    }
    watch(guide, function (on) { seen = on; if (on) play(); else stop(); }, 0.3);
    onMotionChange(function () { if (reduced()) { stop(); go(count()); } else play(); });
    select(platform);
    return function reset() { paused = false; select(platform); };
  }

  var dialogReset = null;
  $$('[data-ig]').forEach(function (guide) {
    var reset = setupGuide(guide);
    if (installDialog && installDialog.contains(guide)) dialogReset = reset;
  });

  var installFocus = null;
  function openInstall(e) {
    if (!installDialog) return;
    if (e) e.preventDefault();
    setMenu(false);
    installFocus = doc.activeElement;
    if (dialogReset) dialogReset();
    if (typeof installDialog.showModal === 'function') {
      if (!installDialog.open) installDialog.showModal();
    } else {
      installDialog.setAttribute('open', '');
    }
    root.classList.add('ig-lock');
  }
  function installClosed() {
    root.classList.remove('ig-lock');
    if (installFocus && installFocus.focus) installFocus.focus();
  }
  function closeInstall() {
    if (typeof installDialog.close === 'function') installDialog.close();
    else { installDialog.removeAttribute('open'); installClosed(); }
  }
  if (installDialog) {
    installDialog.addEventListener('close', installClosed);
    installDialog.addEventListener('click', function (e) { if (e.target === installDialog) closeInstall(); });
    $$('[data-ig-close]', installDialog).forEach(function (b) { b.addEventListener('click', closeInstall); });
    var installApk = android ? installText('android').trim() : '';
    $$('.js-install').forEach(function (b) {
      b.addEventListener('click', function (e) {
        // A future Android build can set data-android on the dialog: the install bar then downloads it.
        if (installApk && b.id === 'install-go') { e.preventDefault(); window.location.href = installApk; return; }
        openInstall(e);
      });
    });
    if (/^#(instalar|install)$/.test(window.location.hash)) openInstall();
  }

  var bar = $('#install-bar');
  if (bar && installDialog) {
    var note = $('#install-note');
    var go = $('#install-go');
    var dismissed = false;
    try { dismissed = window.sessionStorage.getItem('mg-install-dismiss') === '1'; } catch (err) { /* private mode */ }
    if (installApk) {
      note.textContent = installText('note-apk');
      go.textContent = installText('label-download');
    } else {
      note.textContent = installText(ios ? 'note-ios' : android ? 'note-android' : 'note-desktop');
      go.textContent = installText('label-install');
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

  /* ---------- Homepage pop-up: free practice pages (/praticar/) ----------
   * Opens a few seconds after load, at most once every 7 days, never over another dialog
   * and never when the visitor arrived on a #anchor. */
  var promo = $('[data-practice-promo]');
  if (promo) {
    var PROMO_KEY = 'mg-practice-promo';
    var PROMO_DAYS = 7;
    var lastSeen = 0;
    try { lastSeen = Number(window.localStorage.getItem(PROMO_KEY)) || 0; } catch (err) { /* private mode */ }
    var promoFocus = null;
    var promoTrack = function (name) {
      try { if (typeof window.gtag === 'function' && window.mgAnalyticsLoaded) window.gtag('event', name, { promo: 'praticar' }); } catch (err) { /* never break */ }
    };
    var closePromo = function () {
      if (typeof promo.close === 'function') promo.close();
      else { promo.open = false; root.classList.remove('ig-lock'); }
    };
    promo.addEventListener('close', function () {
      root.classList.remove('ig-lock');
      if (promoFocus && promoFocus.focus) promoFocus.focus();
    });
    promo.addEventListener('click', function (e) { if (e.target === promo) closePromo(); });
    $$('[data-promo-close]', promo).forEach(function (b) {
      b.addEventListener('click', function () { promoTrack('practice_promo_dismiss'); closePromo(); });
    });
    $$('[data-promo-link]', promo).forEach(function (a) {
      a.addEventListener('click', function () { promoTrack('practice_promo_click'); });
    });
    var due = Date.now() - lastSeen > PROMO_DAYS * 864e5;
    if (due && !window.location.hash) {
      window.setTimeout(function () {
        if (doc.querySelector('dialog[open]')) return;
        try { window.localStorage.setItem(PROMO_KEY, String(Date.now())); } catch (err) { /* private mode */ }
        promoFocus = doc.activeElement;
        if (typeof promo.showModal === 'function') promo.showModal();
        else promo.open = true;
        root.classList.add('ig-lock');
        promoTrack('practice_promo_view');
      }, 2500);
    }
  }

  onMotionChange(armReveals);
  onScroll();
  /* ---------- ChatGPT Ads: count clicks into the web app ----------
   * window.oaiq exists only after cookie consent (lib/oaiq.ts via lib/ga4.ts). */
  doc.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || typeof window.oaiq !== 'function') return;
    var path;
    try { path = new URL(a.href, window.location.href).pathname; } catch (err) { return; }
    if (path.indexOf('/app/') !== 0 && path !== '/app') return;
    try {
      window.oaiq('measure', 'custom', { type: 'custom' }, {
        custom_event_name: 'open_web_app',
        event_id: 'open_' + Date.now() + '_' + Math.random().toString(36).slice(2)
      });
    } catch (err) { /* never block navigation */ }
  });
})();
