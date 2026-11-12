/**
 * Pop-up on the PT homepage that invites visitors to the free practice pages (/praticar/).
 * mg.js opens it a few seconds after the page loads, at most once every 7 days
 * (localStorage 'mg-practice-promo'), and never over the install dialog.
 */
import { esc } from './chrome.mjs';
import { PRACTICE_HUB, practicePages } from './practice/index.mjs';

/** Subjects shown as quick links, in this order. */
const PROMO_SLUGS = [
  'direito-penal-teoria-do-crime',
  'distribuicao-normal-exercicios-resolvidos',
  'flashcards-anatomia',
  'microeconomia-perguntas-de-exame',
  'calculo-limites-e-derivadas',
  'biologia-geologia-exame-nacional',
];

const CLOSE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12"></path><path d="M18 6 6 18"></path></svg>';

export function renderPracticePromo() {
  const chips = PROMO_SLUGS.map((slug) => practicePages.find((p) => p.slug === slug))
    .filter(Boolean)
    .map((p) => `<a class="pp-chip" href="/praticar/${p.slug}/" data-promo-link>${esc(p.kicker)}</a>`)
    .join('');
  return `<dialog class="pp-dialog" id="practice-promo" aria-labelledby="pp-title" aria-describedby="pp-sub" data-practice-promo>
<div class="pp-card">
<button type="button" class="pp-x" data-promo-close aria-label="Fechar">${CLOSE}</button>
<p class="pp-kicker"><span class="mg-dot"></span>Grátis · sem conta</p>
<h2 id="pp-title">Testa-te já na tua disciplina</h2>
<p id="pp-sub">Mini-testes e flashcards com a resposta explicada, para Direito, Estatística, Economia, Anatomia e mais. Em 5 minutos sabes o que ainda tens de rever.</p>
<div class="pp-chips">${chips}</div>
<div class="pp-actions"><a class="btn btn-shine" href="${PRACTICE_HUB.path}" data-promo-link autofocus>Praticar grátis</a><button type="button" class="btn btn-ghost" data-promo-close>Agora não</button></div>
</div>
</dialog>`;
}
