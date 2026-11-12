/*
 * Practice pages (/praticar/…): turns the static list of questions into a one-at-a-time
 * quiz or flashcard deck. Without this script the page still shows every question with
 * its answer in a <details>, so nothing depends on it.
 */
(function () {
  'use strict';

  function track(name, params) {
    try {
      if (typeof window.gtag === 'function' && window.mgAnalyticsLoaded) window.gtag('event', name, params);
    } catch (e) {
      /* Analytics must never break the page. */
    }
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function setup(root) {
    var mode = root.getAttribute('data-practice');
    var slug = root.getAttribute('data-slug');
    var list = root.querySelector('[data-practice-list]');
    var items = Array.prototype.slice.call(list.querySelectorAll('[data-item]'));
    var result = root.querySelector('[data-practice-result]');
    var scoreEl = root.querySelector('[data-practice-score]');
    var noteEl = root.querySelector('[data-practice-note]');
    var reviewEl = root.querySelector('[data-practice-review]');
    var live = root.querySelector('[data-practice-live]');
    var hint = root.querySelector('[data-practice-hint]');
    var total = items.length;
    var current = 0;
    var outcomes = [];
    var started = false;

    root.classList.add('is-interactive');
    if (hint) {
      hint.textContent =
        mode === 'flashcards'
          ? 'Tenta responder de cabeça, vira o cartão e diz se sabias.'
          : 'Escolhe uma opção. Vês logo se acertaste e porquê.';
    }

    items.forEach(function (item, index) {
      var answer = item.querySelector('[data-answer]');
      var explanation = answer.querySelector('p');
      var feedback = el('div', 'pq-feedback');
      feedback.hidden = true;
      feedback.setAttribute('tabindex', '-1');
      var verdict = el('p', 'pq-verdict');
      feedback.appendChild(verdict);
      feedback.appendChild(explanation.cloneNode(true));
      answer.hidden = true;
      item.appendChild(feedback);

      var nav = el('div', 'pq-nav');
      var next = el('button', 'btn btn-sm', index === total - 1 ? 'Ver resultado' : 'Seguinte');
      next.type = 'button';
      next.hidden = true;
      next.addEventListener('click', function () {
        go(index + 1);
      });

      if (mode === 'quiz') {
        var options = Array.prototype.slice.call(item.querySelectorAll('.pq-option'));
        var group = el('div', 'pq-choices');
        group.setAttribute('role', 'group');
        group.setAttribute('aria-label', 'Opções da pergunta ' + (index + 1));
        var buttons = options.map(function (option) {
          var button = el('button', 'pq-choice');
          button.type = 'button';
          button.innerHTML = option.innerHTML;
          if (option.hasAttribute('data-correct')) button.setAttribute('data-correct', '');
          group.appendChild(button);
          return button;
        });
        item.querySelector('.pq-options').replaceWith(group);
        buttons.forEach(function (button) {
          button.addEventListener('click', function () {
            if (outcomes[index] != null) return;
            if (!started) {
              started = true;
              track('practice_start', { practice_slug: slug, practice_mode: mode });
            }
            var right = button.hasAttribute('data-correct');
            outcomes[index] = right;
            buttons.forEach(function (b) {
              b.disabled = true;
              if (b.hasAttribute('data-correct')) b.classList.add('is-correct');
            });
            if (!right) button.classList.add('is-wrong');
            button.setAttribute('aria-pressed', 'true');
            verdict.textContent = right ? 'Certo!' : 'Não é essa.';
            verdict.className = 'pq-verdict ' + (right ? 'is-good' : 'is-bad');
            feedback.hidden = false;
            next.hidden = false;
            live.textContent = (right ? 'Resposta certa. ' : 'Resposta errada. ') + explanation.textContent;
            next.focus({ preventScroll: true });
          });
        });
      } else {
        var flip = el('button', 'btn btn-ghost btn-sm', 'Virar cartão');
        flip.type = 'button';
        var knew = el('button', 'btn btn-sm pq-knew', 'Sabia');
        knew.type = 'button';
        knew.hidden = true;
        var missed = el('button', 'btn btn-ghost btn-sm pq-missed', 'Não sabia');
        missed.type = 'button';
        missed.hidden = true;
        verdict.hidden = true;
        flip.addEventListener('click', function () {
          if (!started) {
            started = true;
            track('practice_start', { practice_slug: slug, practice_mode: mode });
          }
          feedback.hidden = false;
          flip.hidden = true;
          knew.hidden = false;
          missed.hidden = false;
          item.classList.add('is-flipped');
          live.textContent = 'Resposta: ' + explanation.textContent;
          knew.focus({ preventScroll: true });
        });
        function rate(value) {
          outcomes[index] = value;
          go(index + 1);
        }
        knew.addEventListener('click', function () {
          rate(true);
        });
        missed.addEventListener('click', function () {
          rate(false);
        });
        nav.appendChild(flip);
        nav.appendChild(missed);
        nav.appendChild(knew);
      }
      nav.appendChild(next);
      item.appendChild(nav);
    });

    function show(index) {
      items.forEach(function (item, i) {
        item.hidden = i !== index;
      });
    }

    function go(index) {
      if (index >= total) return finish();
      current = index;
      show(current);
      var heading = items[current].querySelector('.pq-q');
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
      var top = root.getBoundingClientRect().top + window.scrollY - 96;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
    }

    function finish() {
      var right = outcomes.filter(Boolean).length;
      items.forEach(function (item) {
        item.hidden = true;
      });
      list.hidden = true;
      result.hidden = false;
      scoreEl.textContent =
        mode === 'flashcards' ? 'Sabias ' + right + ' de ' + total + ' cartões.' : 'Acertaste ' + right + ' de ' + total + ' perguntas.';
      var ratio = right / total;
      noteEl.textContent =
        ratio >= 0.8
          ? 'Muito bem. Agora treina com a matéria exata da tua cadeira.'
          : ratio >= 0.5
            ? 'Bom ponto de partida. Revê as que falhaste e volta a tentar.'
            : 'Ainda há matéria para consolidar. Revê as explicações abaixo com calma.';
      reviewEl.textContent = '';
      var missedItems = items.filter(function (_, i) {
        return !outcomes[i];
      });
      if (missedItems.length > 0) {
        reviewEl.appendChild(el('p', 'pq-review-h', mode === 'flashcards' ? 'Cartões para rever' : 'Perguntas para rever'));
        var ul = el('ul');
        missedItems.forEach(function (item) {
          var li = el('li');
          li.appendChild(el('b', null, item.querySelector('.pq-q').textContent));
          var p = item.querySelector('.pq-feedback > p:last-child');
          if (p) li.appendChild(el('span', null, ' ' + p.textContent));
          ul.appendChild(li);
        });
        reviewEl.appendChild(ul);
      }
      result.focus({ preventScroll: true });
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
      track('practice_complete', { practice_slug: slug, practice_mode: mode, score: right, total: total });
    }

    root.querySelector('[data-practice-restart]').addEventListener('click', function () {
      window.location.reload();
    });

    show(0);
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-practice]'), setup);
    Array.prototype.forEach.call(document.querySelectorAll('[data-practice-cta]'), function (link) {
      link.addEventListener('click', function () {
        var root = document.querySelector('[data-practice]');
        track('practice_cta_click', { practice_slug: root ? root.getAttribute('data-slug') : '', cta_position: link.closest('[id]') ? link.closest('[id]').id : '' });
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
