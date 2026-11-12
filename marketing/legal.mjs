/**
 * Privacy policy pages, rendered with the same template as the other content pages.
 * Updated 6 Nov 2026: Google Analytics 4 runs only after cookie consent (lib/ga4.ts + banner in mg.js).
 * Updated 6 Nov 2026: the OpenAI ads pixel (lib/oaiq.ts) loads with the same consent.
 * Keep this text in line with what the site actually does.
 */
const UPDATED = {
  pt: '<p class="updated">Atualizado a <time datetime="2026-11-06">6 de novembro de 2026</time>.</p>',
  en: '<p class="updated">Last updated <time datetime="2026-11-06">6 November 2026</time>.</p>',
};

const mail = { href: 'mailto:ola@microgrind.app', text: 'ola@microgrind.app' };
const cnpd = { href: 'https://www.cnpd.pt/', text: 'cnpd.pt' };
const openaiPrivacy = { href: 'https://openai.com/policies/privacy-policy/', text: 'openai.com/policies/privacy-policy' };
const googlePrivacy = { href: 'https://policies.google.com/privacy', text: 'policies.google.com/privacy' };

export const legalPages = [
  {
    kind: 'legal',
    id: 'privacidade',
    locale: 'pt',
    path: '/privacidade/',
    ptPath: '/privacidade/',
    enPath: '/en/privacy/',
    title: 'MicroGrind — Política de privacidade e cookies',
    description: 'Como o site da MicroGrind trata os teus dados: Google Analytics só com consentimento, cookies e os teus direitos.',
    kicker: 'Privacidade',
    h1: 'Política de privacidade e cookies',
    lede: 'Esta política aplica-se ao site microgrind.app e à app web em microgrind.app/app.',
    updatedHtml: UPDATED.pt,
    blocks: [
      { type: 'h2', text: 'Quem é responsável' },
      { type: 'p', text: 'A MicroGrind é a responsável pelo tratamento dos dados deste site.' },
      { type: 'p', parts: [{ text: 'Contacto: ' }, mail] },
      { type: 'h2', text: 'O que recolhemos' },
      { type: 'p', text: 'O site não pede o teu email nem cria conta. Para usar a app, abres a app web ou instalas a app no telemóvel.' },
      {
        type: 'p',
        text: 'Se aceitares os cookies de análise, usamos o Google Analytics 4 para medir como o site e a app web são usados: páginas vistas, origem da visita, tipo de dispositivo e browser, e país ou região aproximados. Os dados são agregados e não os usamos para te identificar.',
      },
      {
        type: 'p',
        text: 'Com o mesmo consentimento, carregamos também o pixel de medição de anúncios da OpenAI (ChatGPT Ads). Serve para saber se os nossos anúncios no ChatGPT funcionam: regista quando abres a app web a partir do site e quando crias conta. Envia à OpenAI esses eventos, um identificador aleatório do evento e dados técnicos da visita (página, browser, endereço IP). Não envia o teu email nem o teu nome.',
      },
      { type: 'p', text: 'Não vendemos dados e não os passamos a outras empresas para marketing.' },
      { type: 'h2', text: 'Cookies' },
      {
        type: 'list',
        ordered: false,
        items: [
          [
            { strong: true, text: 'Necessários.' },
            { text: ' Guardamos no teu browser a tua escolha sobre cookies (mg-consent) e se fechaste o aviso para instalar a app. Não te identificam e não precisam de consentimento.' },
          ],
          [
            { strong: true, text: 'Análise (Google Analytics).' },
            { text: ' Os cookies _ga e _ga_* só são criados depois de aceitares. Duram até 2 anos. Antes disso, o site não carrega nenhum script da Google.' },
          ],
          [{ strong: true, text: 'Publicidade.' }, { text: ' Não usamos.' }],
        ],
      },
      { type: 'p', text: 'Podes mudar a tua escolha a qualquer momento em «Cookies», no rodapé do site. Se recusares, apagamos os cookies de análise que existam.' },
      { type: 'h2', text: 'Base legal e Google' },
      { type: 'p', text: 'Usamos o Google Analytics com base no teu consentimento (artigo 6.º, n.º 1, alínea a) do RGPD). Podes retirá-lo quando quiseres, sem afetar o que foi feito antes.' },
      {
        type: 'p',
        parts: [
          { text: 'O Google Analytics é fornecido pela Google Ireland Limited. A Google pode tratar dados fora da União Europeia, ao abrigo do EU-U.S. Data Privacy Framework e de cláusulas contratuais-tipo. Mais informação em ' },
          googlePrivacy,
          { text: '.' },
        ],
      },
      {
        type: 'p',
        parts: [
          { text: 'O pixel de anúncios é fornecido pela OpenAI, que pode tratar dados fora da União Europeia, ao abrigo de cláusulas contratuais-tipo. Mais informação em ' },
          openaiPrivacy,
          { text: '.' },
        ],
      },
      { type: 'h2', text: 'Os teus direitos' },
      {
        type: 'p',
        parts: [
          { text: 'Podes pedir acesso, retificação ou apagamento dos teus dados, opor-te ao tratamento e retirar o consentimento. Também podes apresentar queixa à CNPD, a Comissão Nacional de Proteção de Dados, em ' },
          cnpd,
          { text: '.' },
        ],
      },
      { type: 'p', parts: [{ text: 'Para exercer estes direitos, escreve para ' }, mail, { text: '.' }] },
    ],
  },
  {
    kind: 'legal',
    id: 'privacy',
    locale: 'en',
    path: '/en/privacy/',
    ptPath: '/privacidade/',
    enPath: '/en/privacy/',
    title: 'MicroGrind — Privacy and cookie policy',
    description: 'How the MicroGrind website handles your data: Google Analytics only with consent, cookies and your rights.',
    kicker: 'Privacy',
    h1: 'Privacy and cookie policy',
    lede: 'This policy covers the microgrind.app website and the web app at microgrind.app/app.',
    updatedHtml: UPDATED.en,
    blocks: [
      { type: 'h2', text: 'Who is responsible' },
      { type: 'p', text: 'MicroGrind is the controller for the data processed on this website.' },
      { type: 'p', parts: [{ text: 'Contact: ' }, mail] },
      { type: 'h2', text: 'What we collect' },
      { type: 'p', text: 'The website does not ask for your email or create an account. To use the app, open the web app or install the app on your phone.' },
      {
        type: 'p',
        text: 'If you accept analytics cookies, we use Google Analytics 4 to measure how the website and web app are used: pages viewed, where the visit came from, device and browser type, and approximate country or region. The data is aggregated and we do not use it to identify you.',
      },
      {
        type: 'p',
        text: 'With the same consent, we also load OpenAI’s ad measurement pixel (ChatGPT Ads). It tells us whether our ads in ChatGPT work: it records when you open the web app from the site and when you create an account. It sends OpenAI those events, a random event identifier and technical visit data (page, browser, IP address). It does not send your email or your name.',
      },
      { type: 'p', text: 'We do not sell data and we do not pass it to other companies for marketing.' },
      { type: 'h2', text: 'Cookies' },
      {
        type: 'list',
        ordered: false,
        items: [
          [
            { strong: true, text: 'Necessary.' },
            { text: ' We store your cookie choice (mg-consent) and whether you closed the install prompt in your browser. They do not identify you and need no consent.' },
          ],
          [
            { strong: true, text: 'Analytics (Google Analytics).' },
            { text: ' The _ga and _ga_* cookies are only set after you accept. They last up to 2 years. Until then, the site loads no Google script.' },
          ],
          [{ strong: true, text: 'Advertising.' }, { text: ' We do not use any.' }],
        ],
      },
      { type: 'p', text: 'You can change your choice at any time under “Cookies” in the site footer. If you decline, we delete any analytics cookies already set.' },
      { type: 'h2', text: 'Legal basis and Google' },
      { type: 'p', text: 'We use Google Analytics based on your consent (Article 6(1)(a) GDPR). You can withdraw it whenever you like, without affecting what happened before.' },
      {
        type: 'p',
        parts: [
          { text: 'Google Analytics is provided by Google Ireland Limited. Google may process data outside the European Union under the EU-U.S. Data Privacy Framework and standard contractual clauses. More at ' },
          googlePrivacy,
          { text: '.' },
        ],
      },
      {
        type: 'p',
        parts: [
          { text: 'The ad pixel is provided by OpenAI, which may process data outside the European Union under standard contractual clauses. More at ' },
          openaiPrivacy,
          { text: '.' },
        ],
      },
      { type: 'h2', text: 'Your rights' },
      {
        type: 'p',
        parts: [
          { text: 'You can ask for access, rectification or erasure of your data, object to processing and withdraw consent. You can also complain to the CNPD, the Portuguese data protection authority, at ' },
          cnpd,
          { text: '.' },
        ],
      },
      { type: 'p', parts: [{ text: 'To use these rights, email ' }, mail, { text: '.' }] },
    ],
  },
];
