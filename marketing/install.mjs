/**
 * "Instalar a app" guide: iPhone (Safari), Android (Chrome) and computer.
 * Rendered on /instalar/ and /en/install/, and inside the install dialog on every page
 * (chrome.mjs). The runtime (tabs, autoplay, dialog, install bar) is in mg.js; the styles,
 * including the CSS-only phone illustration, are the "Install guide" section of mg.css.
 */
import { WEB_APP } from './content.mjs';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export const INSTALL_PATHS = { pt: '/instalar/', en: '/en/install/' };

const ICON = {
  share:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v11M7.8 7.7 12 3.5l4.2 4.2M8 10.5H6.5v9.5h11v-9.5H16"/></svg>',
  more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/></svg>',
  kebab:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="6" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="18" r="1.4"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="4.5" width="15" height="15" rx="4"/><path d="M12 8.5v7M8.5 12h7"/></svg>',
  install:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="11.5" rx="2"/><path d="M12 7.5v5.5M9.6 10.8 12 13.2l2.4-2.4M8.5 19.5h7"/></svg>',
  phone:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>',
  laptop:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M3 18.5h18"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 6-6 6 6 6"/></svg>',
  fwd: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 6 6 6-6 6"/></svg>',
  tabs: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="7.5" width="11" height="11" rx="2.5"/><path d="M8.5 4.5H17a2.5 2.5 0 0 1 2.5 2.5v8.5"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6.5c-2-1.5-4.5-2-7.5-2v13c3 0 5.5.5 7.5 2 2-1.5 4.5-2 7.5-2v-13c-3 0-5.5.5-7.5 2Zm0 0v13"/></svg>',
  copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 5.5a2 2 0 0 0-2-1.5h-7A2.5 2.5 0 0 0 4 6.5v7a2 2 0 0 0 1.5 2"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4 2.4 5 5.3.6-3.9 3.7 1 5.3L12 16l-4.8 2.6 1-5.3-3.9-3.7 5.3-.6Z"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5.5 12.5 4.2 4.2 8.8-9.2"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>',
  apple:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5a4.3 4.3 0 0 0-3.4-1.8c-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8A4.5 4.5 0 0 0 4.7 9.6c-1.6 2.8-.4 6.9 1.1 9.1.8 1.1 1.7 2.3 2.9 2.3s1.6-.7 3-.7 1.8.7 3 .7 2-1.1 2.8-2.2a9.7 9.7 0 0 0 1.3-2.6 3.9 3.9 0 0 1-2.4-3.6ZM14.2 5.8A4 4 0 0 0 15.1 3a4.1 4.1 0 0 0-2.7 1.4 3.8 3.8 0 0 0-1 2.7 3.4 3.4 0 0 0 2.8-1.3Z"/></svg>',
  android:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10.5h10v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 17.5Zm0-1a5 5 0 0 1 10 0Zm-2.5 1.5v5M19.5 11v5M9.5 19v2.5M14.5 19v2.5M8.5 4.5l1.3 1.8M15.5 4.5l-1.3 1.8"/></svg>',
};

const COPY = {
  pt: {
    tabsLabel: 'Escolhe o teu dispositivo',
    here: 'Este dispositivo',
    stepsLabel: 'Passos',
    go: 'Continuar instalação',
    goNote: 'Abre a MicroGrind no browser e segue estes passos.',
    tabs: { ios: 'iPhone e iPad', android: 'Android', desktop: 'Computador' },
    url: 'microgrind.app',
    ios: {
      browser: 'Safari',
      steps: [
        ['Abre no Safari', 'Vai a microgrind.app/app no Safari.'],
        ['Toca em Partilhar', 'É o quadrado com a seta para cima, na barra do Safari. Se não o vires, toca primeiro em ⋯.'],
        ['Adicionar ao ecrã principal', 'Desliza a lista de opções até encontrares esta.'],
        ['Toca em Adicionar', 'Se aparecer «Abrir como app web», deixa ligado.'],
        ['Pronto', 'A MicroGrind fica no ecrã principal, como qualquer outra app.'],
      ],
      tip: 'Estás no Instagram, TikTok ou WhatsApp? Abre primeiro o link no Safari: a opção só aparece lá.',
      sheet: ['Copiar', 'Adicionar aos favoritos', 'Adicionar à lista de leitura', 'Adicionar ao ecrã principal'],
      addTitle: 'Adicionar ao ecrã principal',
      cancel: 'Cancelar',
      add: 'Adicionar',
      webApp: 'Abrir como app web',
    },
    android: {
      browser: 'Chrome',
      steps: [
        ['Abre no Chrome', 'Vai a microgrind.app/app no Google Chrome.'],
        ['Toca no menu ⋮', 'São os três pontos no canto superior direito.'],
        ['Toca em Instalar app', 'Em algumas versões aparece como «Adicionar ao ecrã principal».'],
        ['Confirma em Instalar', 'O Chrome junta o ícone ao ecrã principal e à lista de apps.'],
        ['Pronto', 'Abre a MicroGrind pelo ícone, em ecrã inteiro.'],
      ],
      tip: 'Samsung Internet: toca em ≡, depois «Adicionar página a» e «Ecrã principal».',
      menu: ['Novo separador', 'Histórico', 'Transferências', 'Instalar app', 'Partilhar…'],
      addTitle: 'Instalar app',
      cancel: 'Cancelar',
      add: 'Instalar',
    },
    desktop: {
      steps: [
        ['Abre no Chrome ou no Edge', 'Vai a microgrind.app/app.'],
        ['Clica no ícone de instalar', 'Fica no lado direito da barra de endereço. Também o encontras no menu ⋮ do browser.'],
        ['Confirma em Instalar', 'A app fica no menu Iniciar ou na pasta Aplicações.'],
        ['Pronto', 'A MicroGrind abre numa janela própria, sem separadores.'],
      ],
      tip: 'Safari no Mac: menu Ficheiro → Adicionar à Dock.',
      addTitle: 'Instalar app?',
      cancel: 'Cancelar',
      add: 'Instalar',
    },
    hints: {
      inApp: 'Estás a ver isto dentro de outra app. Abre o link no browser (⋯ → Abrir no browser) para poderes instalar.',
      iosOther: 'No iPhone, instalar funciona melhor no Safari. Copia o link e abre-o lá.',
      samsung: 'Estás no Samsung Internet: toca em ≡, depois «Adicionar página a» e «Ecrã principal».',
      copy: 'Copiar link',
      copied: 'Link copiado',
    },
    dialog: {
      title: 'Instala a MicroGrind',
      sub: 'Fica no ecrã principal, como uma app. Sem App Store nem Play Store.',
      guide: 'Guia completo',
      close: 'Fechar',
    },
    bar: {
      ios: 'Adiciona-a ao ecrã principal pelo Safari.',
      android: 'Instala-a pelo Chrome, sem Play Store.',
      desktop: 'Instala-a no computador, numa janela própria.',
      apk: 'Transfere a app para Android.',
      install: 'Instalar',
      download: 'Transferir',
    },
    install: 'Instalar',
  },
  en: {
    tabsLabel: 'Choose your device',
    here: 'This device',
    stepsLabel: 'Steps',
    go: 'Continue installation',
    goNote: 'Opens MicroGrind in your browser. Then follow these steps.',
    tabs: { ios: 'iPhone & iPad', android: 'Android', desktop: 'Computer' },
    url: 'microgrind.app',
    ios: {
      browser: 'Safari',
      steps: [
        ['Open it in Safari', 'Go to microgrind.app/app in Safari.'],
        ['Tap Share', 'The square with an arrow pointing up, in the Safari toolbar. If you cannot see it, tap ⋯ first.'],
        ['Add to Home Screen', 'Scroll the list of options until you find it.'],
        ['Tap Add', 'If you see “Open as Web App”, leave it on.'],
        ['Done', 'MicroGrind now sits on your Home Screen, like any other app.'],
      ],
      tip: 'Reading this inside Instagram, TikTok or WhatsApp? Open the link in Safari first: the option only shows up there.',
      sheet: ['Copy', 'Add Bookmark', 'Add to Reading List', 'Add to Home Screen'],
      addTitle: 'Add to Home Screen',
      cancel: 'Cancel',
      add: 'Add',
      webApp: 'Open as Web App',
    },
    android: {
      browser: 'Chrome',
      steps: [
        ['Open it in Chrome', 'Go to microgrind.app/app in Google Chrome.'],
        ['Tap the ⋮ menu', 'The three dots in the top-right corner.'],
        ['Tap Install app', 'On some versions it reads “Add to Home screen”.'],
        ['Confirm with Install', 'Chrome adds the icon to your Home screen and app drawer.'],
        ['Done', 'Open MicroGrind from its icon, full screen.'],
      ],
      tip: 'Samsung Internet: tap ≡, then “Add page to” and “Home screen”.',
      menu: ['New tab', 'History', 'Downloads', 'Install app', 'Share…'],
      addTitle: 'Install app',
      cancel: 'Cancel',
      add: 'Install',
    },
    desktop: {
      steps: [
        ['Open it in Chrome or Edge', 'Go to microgrind.app/app.'],
        ['Click the install icon', 'It sits on the right of the address bar. You can also find it in the browser’s ⋮ menu.'],
        ['Confirm with Install', 'The app shows up in your Start menu or Applications folder.'],
        ['Done', 'MicroGrind opens in its own window, without tabs.'],
      ],
      tip: 'Safari on Mac: File menu → Add to Dock.',
      addTitle: 'Install app?',
      cancel: 'Cancel',
      add: 'Install',
    },
    hints: {
      inApp: 'You are viewing this inside another app. Open the link in your browser (⋯ → Open in browser) to install.',
      iosOther: 'On iPhone, installing works best in Safari. Copy the link and open it there.',
      samsung: 'You are on Samsung Internet: tap ≡, then “Add page to” and “Home screen”.',
      copy: 'Copy link',
      copied: 'Link copied',
    },
    dialog: {
      title: 'Install MicroGrind',
      sub: 'It sits on your Home Screen, like an app. No App Store or Play Store.',
      guide: 'Full guide',
      close: 'Close',
    },
    bar: {
      ios: 'Add it to your Home Screen from Safari.',
      android: 'Install it from Chrome, no Play Store needed.',
      desktop: 'Install it on your computer, in its own window.',
      apk: 'Download the Android app.',
      install: 'Install',
      download: 'Download',
    },
    install: 'Install',
  },
};

export function installCopy(locale) {
  return COPY[locale === 'en' ? 'en' : 'pt'];
}

const e = escapeHtml;

function webPage() {
  return `<div class="ig-web" aria-hidden="true"><div class="ig-web-head"><span class="ig-logo"></span><span>MicroGrind</span></div><div class="ig-web-hero"><i></i><i></i><i class="short"></i></div><div class="ig-web-card"><b></b><i></i><i class="short"></i></div><div class="ig-web-card"><b></b><i></i></div></div>`;
}

function homeScreen(withLabel) {
  const dots = Array.from({ length: 11 }, (_, index) => `<span class="ig-app ig-app-${index % 6}"></span>`).join('');
  return `<div class="ig-home" aria-hidden="true"><div class="ig-home-grid">${dots}<span class="ig-app ig-app-mg"><span class="ig-logo"></span><em>${e(withLabel)}</em></span></div><div class="ig-home-dock"><span class="ig-app ig-app-1"></span><span class="ig-app ig-app-3"></span><span class="ig-app ig-app-4"></span><span class="ig-app ig-app-5"></span></div></div>`;
}

function iosScreen(c) {
  const s = c.ios;
  const sheetRows = s.sheet
    .map((label, index) => {
      const last = index === s.sheet.length - 1;
      const icon = [ICON.copy, ICON.star, ICON.book, ICON.plus][index];
      return `<li${last ? ' class="ig-t ig-t-3"' : ''}><span>${e(label)}</span>${icon}</li>`;
    })
    .join('');
  return `<div class="ig-screen ig-ios" data-ig-screen data-state="1" aria-hidden="true">
<div class="ig-status"><span>9:41</span><span class="ig-island"></span><span class="ig-bat"></span></div>
${webPage()}
<div class="ig-ios-bar"><div class="ig-pill ig-t ig-t-1"><span>${e(c.url)}</span></div><div class="ig-ios-icons"><span>${ICON.back}</span><span>${ICON.fwd}</span><span class="ig-t ig-t-2">${ICON.share}</span><span>${ICON.book}</span><span>${ICON.tabs}</span></div></div>
<div class="ig-sheet"><div class="ig-sheet-head"><span class="ig-logo"></span><div><b>MicroGrind</b><span>${e(c.url)}</span></div></div><div class="ig-sheet-people"><i></i><i></i><i></i><i></i></div><ul>${sheetRows}</ul></div>
<div class="ig-add ig-add-ios"><div class="ig-add-top"><span>${e(s.cancel)}</span><b>${e(s.addTitle)}</b><span class="ig-t ig-t-4">${e(s.add)}</span></div><div class="ig-add-row"><span class="ig-logo"></span><div><b>MicroGrind</b><span>${e(c.url)}</span></div></div><div class="ig-add-toggle"><span>${e(s.webApp)}</span><i></i></div></div>
${homeScreen('MicroGrind')}
</div>`;
}

function androidScreen(c) {
  const s = c.android;
  const menuRows = s.menu
    .map((label, index) => `<li${index === 3 ? ' class="ig-t ig-t-3"' : ''}>${index === 3 ? ICON.install : ''}<span>${e(label)}</span></li>`)
    .join('');
  return `<div class="ig-screen ig-android" data-ig-screen data-state="1" aria-hidden="true">
<div class="ig-status ig-status-a"><span>9:41</span><span class="ig-cam"></span><span class="ig-bat"></span></div>
<div class="ig-a-bar"><div class="ig-pill ig-t ig-t-1"><span>${e(c.url)}</span></div><span class="ig-a-tabs">1</span><span class="ig-t ig-t-2 ig-a-kebab">${ICON.kebab}</span></div>
${webPage()}
<div class="ig-menu"><ul>${menuRows}</ul></div>
<div class="ig-add ig-add-android"><span class="ig-logo"></span><b>${e(s.addTitle)}</b><p>MicroGrind<br><span>${e(c.url)}</span></p><div class="ig-add-actions"><span>${e(s.cancel)}</span><span class="ig-t ig-t-4">${e(s.add)}</span></div></div>
${homeScreen('MicroGrind')}
<div class="ig-a-nav"><i></i></div>
</div>`;
}

function desktopScreen(c) {
  const s = c.desktop;
  return `<div class="ig-screen ig-desktop" data-ig-screen data-state="1" aria-hidden="true">
<div class="ig-d-chrome"><span class="ig-d-dots"><i></i><i></i><i></i></span><span class="ig-d-tab"><span class="ig-logo"></span>MicroGrind</span></div>
<div class="ig-d-bar"><span>${ICON.back}</span><div class="ig-pill ig-t ig-t-1"><span>${e(c.url)}/app</span><span class="ig-t ig-t-2 ig-d-install">${ICON.install}</span></div><span>${ICON.kebab}</span></div>
${webPage()}
<div class="ig-d-pop"><b>${e(s.addTitle)}</b><div class="ig-add-row"><span class="ig-logo"></span><div><b>MicroGrind</b><span>${e(c.url)}</span></div></div><div class="ig-add-actions"><span class="ig-t ig-t-3">${e(s.add)}</span><span>${e(s.cancel)}</span></div></div>
<div class="ig-d-win"><div class="ig-d-win-bar"><span class="ig-logo"></span><span>MicroGrind</span><span class="ig-d-win-ctl"><i></i><i></i><i></i></span></div>${webPage()}</div>
</div>`;
}

/** "✓ Continuar instalação": opens the web app, where the steps above are done. Shown above and below each device's steps. */
function goButton(c, where) {
  const note = where === 'top' ? `<span class="ig-go-note">${e(c.goNote)}</span>` : '';
  return `<div class="ig-go ig-go-${where}"><a class="btn ig-go-btn" href="${WEB_APP}" data-ig-go><span class="ig-go-check" aria-hidden="true">${ICON.check}</span><span>${e(c.go)}</span></a>${note}</div>`;
}

function stepsList(steps, id) {
  return steps
    .map(
      ([title, body], index) =>
        `<li data-ig-step="${index + 1}"><button type="button" aria-describedby="${id}-s${index + 1}"><span class="ig-num" aria-hidden="true"><span>${index + 1}</span>${ICON.check}</span><span class="ig-step-title">${e(title)}</span></button><p id="${id}-s${index + 1}">${e(body)}</p></li>`
    )
    .join('');
}

/**
 * The tabbed guide. `id` keeps ids unique when the page also has the dialog.
 * `variant` is "page" (install page) or "dialog".
 */
export function renderInstallGuide(locale, { id = 'ig', variant = 'page' } = {}) {
  const c = installCopy(locale);
  const platforms = [
    ['ios', ICON.apple, iosScreen(c), c.ios],
    ['android', ICON.android, androidScreen(c), c.android],
    ['desktop', ICON.laptop, desktopScreen(c), c.desktop],
  ];
  const tabs = platforms
    .map(
      ([key, icon], index) =>
        `<button type="button" role="tab" id="${id}-tab-${key}" aria-controls="${id}-panel-${key}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-ig-tab="${key}">${icon}<span>${e(c.tabs[key])}</span><small class="ig-here" hidden>${e(c.here)}</small></button>`
    )
    .join('');
  const panels = platforms
    .map(
      ([key, , screen, spec], index) =>
        `<div class="ig-panel" role="tabpanel" id="${id}-panel-${key}" aria-labelledby="${id}-tab-${key}" data-ig-panel="${key}"${index === 0 ? '' : ' hidden'}>${goButton(c, 'top')}<div class="ig-stage"><div class="ig-device ig-device-${key}">${screen}</div></div><div class="ig-flow"><ol class="ig-steps" aria-label="${e(c.stepsLabel)}">${stepsList(spec.steps, `${id}-${key}`)}</ol><p class="ig-tip">${e(spec.tip)}</p></div>${goButton(c, 'bottom')}</div>`
    )
    .join('');
  return `<div class="ig ig--${variant}" data-ig id="${id}"><div class="ig-hint" data-ig-hint hidden><p></p><button type="button" class="ig-copy" data-ig-copy="${e(WEB_APP)}">${ICON.copy}<span>${e(c.hints.copy)}</span></button></div><div class="ig-tabs" role="tablist" aria-label="${e(c.tabsLabel)}">${tabs}</div>${panels}</div>`;
}

/** Native <dialog>; mg.js opens it from every .js-install button and, on phones, from the install bar. */
export function renderInstallDialog(locale) {
  const c = installCopy(locale);
  return `<dialog class="ig-dialog" id="install-dialog" aria-labelledby="install-dialog-title" aria-describedby="install-dialog-sub" data-web="${WEB_APP}" data-android="" data-note-ios="${e(c.bar.ios)}" data-note-android="${e(c.bar.android)}" data-note-desktop="${e(c.bar.desktop)}" data-note-apk="${e(c.bar.apk)}" data-label-install="${e(c.bar.install)}" data-label-download="${e(c.bar.download)}" data-hint-in-app="${e(c.hints.inApp)}" data-hint-ios-other="${e(c.hints.iosOther)}" data-hint-samsung="${e(c.hints.samsung)}" data-hint-copied="${e(c.hints.copied)}"><div class="ig-sheet-wrap"><div class="ig-dialog-head"><span class="ig-logo"></span><div><h2 id="install-dialog-title">${e(c.dialog.title)}</h2><p id="install-dialog-sub">${e(c.dialog.sub)}</p></div><button type="button" class="ig-x" data-ig-close aria-label="${e(c.dialog.close)}">${ICON.close}</button></div>${renderInstallGuide(locale, { id: 'mgi', variant: 'dialog' })}<div class="ig-dialog-foot"><a class="ig-more" href="${INSTALL_PATHS[locale === 'en' ? 'en' : 'pt']}">${e(c.dialog.guide)} →</a></div></div></dialog>`;
}
