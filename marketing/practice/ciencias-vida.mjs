/**
 * Practice pages — Ciências da vida (flashcard decks).
 * Card items: { front, back }. Avoid the words listed as deferred in seo-site.test.mjs.
 */

const FLASH_FAQ_HOW = {
  q: 'Como devo usar flashcards para estudar?',
  a: 'Tenta responder de cabeça antes de virar o cartão e separa os que falhaste. Revê esses mais vezes e em dias diferentes: a repetição espaçada fixa melhor do que reler a matéria.',
};

export const anatomia = {
  slug: 'flashcards-anatomia',
  area: 'ciencias',
  mode: 'flashcards',
  subject: 'Anatomia',
  level: 'Ensino superior',
  kicker: 'Anatomia',
  title: 'Flashcards de Anatomia: 12 cartões grátis para rever | MicroGrind',
  description: 'Flashcards de Anatomia humana: ossos, músculos, coração, pulmões, nervos e planos anatómicos. Vira o cartão, vê a resposta e conta os acertos.',
  h1: 'Flashcards de Anatomia',
  lede: 'Doze flashcards de Anatomia humana para reveres o essencial: esqueleto, músculos, coração, pulmões e planos anatómicos.',
  practiceHeading: 'Flashcards: Anatomia',
  keywords: ['flashcards de anatomia', 'flashcards anatomia humana', 'anatomia perguntas', 'estudar anatomia', 'anatomia exame'],
  related: ['flashcards-fisiologia', 'flashcards-bioquimica'],
  items: [
    { front: 'Qual é o osso mais longo do corpo humano?', back: 'O fémur, na coxa.' },
    { front: 'Quantas vértebras cervicais tem a coluna vertebral?', back: 'Sete (C1 a C7). C1 é o atlas e C2 é o áxis.' },
    { front: 'Quantos ossos tem, em regra, o esqueleto adulto?', back: 'Cerca de 206.' },
    { front: 'Qual é o principal músculo da inspiração?', back: 'O diafragma. Ao contrair, desce e aumenta o volume da cavidade torácica.' },
    { front: 'Que válvula separa a aurícula esquerda do ventrículo esquerdo?', back: 'A válvula mitral (bicúspide). À direita fica a válvula tricúspide.' },
    { front: 'Que nervo inerva o diafragma?', back: 'O nervo frénico, com origem nas raízes C3 a C5.' },
    { front: 'Quantos lobos tem o pulmão direito? E o esquerdo?', back: 'O direito tem três lobos (superior, médio e inferior); o esquerdo tem dois.' },
    { front: 'Qual é a maior glândula do corpo humano?', back: 'O fígado.' },
    { front: 'O que liga um músculo a um osso? E um osso a outro osso?', back: 'Tendão liga músculo a osso. Ligamento liga osso a osso.' },
    { front: 'Onde se situa a glândula tiroide?', back: 'Na face anterior do pescoço, abaixo da laringe e à frente da traqueia.' },
    { front: 'Que artéria leva o sangue do ventrículo esquerdo para a circulação sistémica?', back: 'A aorta. Do ventrículo direito sai o tronco pulmonar.' },
    { front: 'Que plano divide o corpo em metades direita e esquerda?', back: 'O plano sagital (o sagital mediano divide-o em duas metades iguais).' },
  ],
  howTo: {
    h2: 'Como estudar Anatomia',
    paragraphs: [
      'Estuda por sistemas e por regiões, sempre com imagem: atlas, modelos ou esquemas que desenhas tu. Dizer em voz alta a localização e as relações de cada estrutura ajuda mais do que reler a lista de nomes.',
      'Os flashcards funcionam bem para Anatomia porque a matéria tem muitos termos e relações curtas: origem e inserção, inervação, irrigação. Faz cartões pequenos, com uma pergunta por cartão.',
      'Revê todos os dias um pouco, em vez de tudo na véspera. Na semana do exame, junta perguntas de identificação em imagem com perguntas de relação entre estruturas.',
    ],
  },
  faqs: [
    FLASH_FAQ_HOW,
    {
      q: 'Posso fazer flashcards de Anatomia com os meus apontamentos?',
      a: 'Sim. No MicroGrind carregas os teus apontamentos, sebenta ou slides e são preparados flashcards e quizzes a partir desse material, para estudares em sessões curtas.',
    },
  ],
};

export const fisiologia = {
  slug: 'flashcards-fisiologia',
  area: 'ciencias',
  mode: 'flashcards',
  subject: 'Fisiologia',
  level: 'Ensino superior',
  kicker: 'Fisiologia',
  title: 'Flashcards de Fisiologia: 12 cartões grátis para rever | MicroGrind',
  description: 'Flashcards de Fisiologia: potencial de membrana, coração, rim, respiração, hormonas e sistema nervoso autónomo. Revê e conta os acertos.',
  h1: 'Flashcards de Fisiologia',
  lede: 'Doze flashcards de Fisiologia humana sobre neurónio, coração, respiração, rim e regulação hormonal.',
  practiceHeading: 'Flashcards: Fisiologia',
  keywords: ['flashcards fisiologia', 'fisiologia humana perguntas', 'estudar fisiologia', 'fisiologia exame', 'débito cardíaco'],
  related: ['flashcards-anatomia', 'flashcards-farmacologia'],
  items: [
    { front: 'Qual é, aproximadamente, o potencial de repouso de um neurónio?', back: 'Cerca de −70 mV (interior negativo em relação ao exterior).' },
    { front: 'O que faz a bomba sódio-potássio em cada ciclo?', back: 'Expulsa 3 Na⁺ e introduz 2 K⁺ na célula, gastando 1 ATP.' },
    { front: 'Como se calcula o débito cardíaco?', back: 'Débito cardíaco = frequência cardíaca × volume sistólico.' },
    { front: 'Qual é o pacemaker natural do coração?', back: 'O nó sinoauricular (sinusal), na aurícula direita.' },
    { front: 'Que hormona baixa a glicemia e onde é produzida?', back: 'A insulina, pelas células beta dos ilhéus de Langerhans do pâncreas.' },
    { front: 'Qual é a unidade funcional do rim?', back: 'O nefrónio (glomérulo, cápsula de Bowman e túbulos).' },
    { front: 'Onde ocorrem as trocas gasosas no pulmão?', back: 'Nos alvéolos pulmonares, por difusão através da membrana alvéolo-capilar.' },
    { front: 'Qual é o efeito principal da ADH (vasopressina)?', back: 'Aumenta a reabsorção de água nos túbulos coletores, concentrando a urina.' },
    { front: 'Qual é a principal função da hemoglobina?', back: 'Transportar oxigénio dos pulmões para os tecidos (e parte do CO₂ no sentido inverso).' },
    { front: 'Dá três efeitos da ativação do sistema nervoso simpático.', back: 'Aumento da frequência cardíaca, broncodilatação e midríase (dilatação da pupila).' },
    { front: 'O que diz a lei de Frank-Starling?', back: 'Quanto maior o enchimento do ventrículo (pré-carga), maior a força de contração e o volume sistólico, dentro de limites fisiológicos.' },
    { front: 'Qual é o intervalo normal do pH do sangue arterial?', back: 'Entre 7,35 e 7,45.' },
  ],
  howTo: {
    h2: 'Como estudar Fisiologia',
    paragraphs: [
      'Em Fisiologia, percebe o mecanismo antes de decorar valores. Para cada sistema, pergunta: qual é a variável regulada, quem a deteta, quem responde e como se volta ao equilíbrio?',
      'Desenha os circuitos de regulação (por exemplo, glicemia com insulina e glucagina, ou volemia com ADH e aldosterona). Um esquema bem feito responde a várias perguntas de exame.',
      'Usa flashcards para os factos que têm mesmo de estar na ponta da língua: valores normais, fórmulas como o débito cardíaco e os efeitos simpáticos e parassimpáticos.',
    ],
  },
  faqs: [
    FLASH_FAQ_HOW,
    {
      q: 'Que matérias de Fisiologia saem mais em exame?',
      a: 'Potencial de membrana e sinapse, ciclo cardíaco e débito cardíaco, mecânica respiratória e trocas gasosas, função renal e regulação hormonal.',
    },
  ],
};

export const bioquimica = {
  slug: 'flashcards-bioquimica',
  area: 'ciencias',
  mode: 'flashcards',
  subject: 'Bioquímica',
  level: 'Ensino superior',
  kicker: 'Bioquímica',
  title: 'Flashcards de Bioquímica: 12 cartões grátis para rever | MicroGrind',
  description: 'Flashcards de Bioquímica: proteínas, enzimas, cinética de Michaelis-Menten, glicólise, ciclo de Krebs e ácidos nucleicos. Revê e conta os acertos.',
  h1: 'Flashcards de Bioquímica',
  lede: 'Doze flashcards de Bioquímica sobre proteínas, enzimas, metabolismo energético e ácidos nucleicos.',
  practiceHeading: 'Flashcards: Bioquímica',
  keywords: ['flashcards bioquímica', 'bioquímica perguntas', 'estudar bioquímica', 'ciclo de krebs', 'michaelis-menten'],
  related: ['flashcards-fisiologia', 'flashcards-farmacologia'],
  items: [
    { front: 'Como se chama a ligação entre dois aminoácidos numa proteína?', back: 'Ligação peptídica, entre o grupo carboxilo de um e o grupo amina do outro, com libertação de água.' },
    { front: 'Qual é o produto final da glicólise e o saldo energético por glucose?', back: 'Duas moléculas de piruvato, com saldo líquido de 2 ATP e 2 NADH.' },
    { front: 'Onde ocorre a glicólise?', back: 'No citosol.' },
    { front: 'Onde ocorre o ciclo de Krebs nas células eucarióticas?', back: 'Na matriz mitocondrial.' },
    { front: 'Como aceleram as enzimas uma reação?', back: 'Diminuem a energia de ativação, sem alterar o equilíbrio da reação.' },
    { front: 'O que representa o Km na cinética de Michaelis-Menten?', back: 'A concentração de substrato para a qual a velocidade é metade da velocidade máxima (Vmax/2).' },
    { front: 'Que efeito tem um inibidor competitivo no Km e na Vmax?', back: 'Aumenta o Km aparente e não altera a Vmax.' },
    { front: 'Quais são as bases azotadas do DNA? E qual muda no RNA?', back: 'DNA: adenina, timina, citosina e guanina. No RNA, o uracilo substitui a timina.' },
    { front: 'Quais são as estruturas secundárias mais comuns das proteínas?', back: 'Hélice alfa e folha beta, estabilizadas por pontes de hidrogénio do esqueleto peptídico.' },
    { front: 'O que distingue um ácido gordo saturado de um insaturado?', back: 'O saturado não tem ligações duplas entre carbonos; o insaturado tem uma ou mais.' },
    { front: 'Qual é o aceitador final de eletrões na cadeia respiratória?', back: 'O oxigénio, que é reduzido a água.' },
    { front: 'Que ligações tem o glicogénio?', back: 'Ligações glicosídicas α(1→4) na cadeia e α(1→6) nas ramificações, entre unidades de glucose.' },
  ],
  howTo: {
    h2: 'Como estudar Bioquímica',
    paragraphs: [
      'Começa pelas biomoléculas (glúcidos, lípidos, proteínas, ácidos nucleicos) e pela estrutura: muitas perguntas de metabolismo dependem de perceberes que grupos químicos reagem.',
      'No metabolismo, não decores todas as reações de uma vez. Para cada via, fixa primeiro onde ocorre, o que entra, o que sai, o saldo energético e os passos regulados. Só depois os intermediários.',
      'Faz um mapa que ligue as vias (glicólise, ciclo de Krebs, cadeia respiratória, gliconeogénese, beta-oxidação) e revê os pontos de controlo com flashcards.',
    ],
  },
  faqs: [
    FLASH_FAQ_HOW,
    {
      q: 'Tenho de decorar todos os intermediários do metabolismo?',
      a: 'Depende do programa da tua cadeira. Em geral, valem mais o local, o balanço energético, as enzimas reguladoras e a ligação entre vias do que a lista completa de intermediários.',
    },
  ],
};

export const farmacologia = {
  slug: 'flashcards-farmacologia',
  area: 'ciencias',
  mode: 'flashcards',
  subject: 'Farmacologia',
  level: 'Ensino superior',
  kicker: 'Farmacologia',
  title: 'Flashcards de Farmacologia: 12 cartões grátis para rever | MicroGrind',
  description: 'Flashcards de Farmacologia geral: farmacocinética, ADME, semivida, biodisponibilidade, agonistas e antagonistas, potência e eficácia.',
  h1: 'Flashcards de Farmacologia',
  lede: 'Doze flashcards de Farmacologia geral sobre farmacocinética e farmacodinâmica, os conceitos base de qualquer exame.',
  practiceHeading: 'Flashcards: Farmacologia',
  keywords: ['flashcards farmacologia', 'farmacologia geral perguntas', 'farmacocinética', 'semivida', 'estudar farmacologia'],
  related: ['flashcards-bioquimica', 'flashcards-fisiologia'],
  items: [
    { front: 'Qual a diferença entre farmacocinética e farmacodinâmica?', back: 'Farmacocinética: o que o organismo faz ao fármaco. Farmacodinâmica: o que o fármaco faz ao organismo.' },
    { front: 'O que significa ADME?', back: 'Absorção, Distribuição, Metabolização e Eliminação (excreção).' },
    { front: 'O que é a semivida de eliminação?', back: 'O tempo necessário para a concentração plasmática do fármaco diminuir para metade.' },
    { front: 'Ao fim de quantas semividas se atinge, aproximadamente, o estado estacionário?', back: 'Cerca de 4 a 5 semividas, com doses regulares.' },
    { front: 'Qual é a biodisponibilidade de um fármaco administrado por via intravenosa?', back: '100%: todo o fármaco chega à circulação sistémica.' },
    { front: 'O que é o efeito de primeira passagem?', back: 'A metabolização de parte do fármaco no intestino e no fígado, após administração oral, antes de chegar à circulação sistémica.' },
    { front: 'Qual a diferença entre agonista e antagonista?', back: 'O agonista liga-se ao recetor e ativa-o. O antagonista liga-se sem o ativar e bloqueia a ação do agonista.' },
    { front: 'O que mede o índice terapêutico?', back: 'A razão entre a dose tóxica e a dose eficaz (por exemplo, TD50/ED50). Quanto maior, maior a margem de segurança.' },
    { front: 'Qual é o principal órgão de metabolização dos fármacos?', back: 'O fígado, em grande parte pelas enzimas do citocromo P450.' },
    { front: 'O que faz um indutor enzimático a outros fármacos metabolizados pela mesma via?', back: 'Aumenta a sua metabolização e pode baixar a concentração plasmática e o efeito.' },
    { front: 'Qual a diferença entre potência e eficácia?', back: 'Potência: a dose necessária para um dado efeito (relaciona-se com a EC50). Eficácia: o efeito máximo que o fármaco consegue produzir.' },
    { front: 'Qual é a principal via de excreção da maioria dos fármacos?', back: 'A via renal (urina). A via biliar (fezes) é a segunda mais importante.' },
  ],
  howTo: {
    h2: 'Como estudar Farmacologia',
    paragraphs: [
      'Domina primeiro a Farmacologia geral: farmacocinética (ADME, semivida, biodisponibilidade, volume de distribuição) e farmacodinâmica (recetores, agonistas, antagonistas, curvas dose-resposta). Tudo o resto assenta nestes conceitos.',
      'Na Farmacologia por sistemas, estuda por classes e não fármaco a fármaco: mecanismo de ação, indicações, efeitos adversos e interações da classe, e depois as diferenças dos principais fármacos.',
      'Os flashcards são ideais para mecanismos, efeitos adversos típicos e interações, que são muitos factos curtos que precisam de repetição.',
    ],
  },
  faqs: [
    FLASH_FAQ_HOW,
    {
      q: 'Por onde começo a estudar Farmacologia?',
      a: 'Pela Farmacologia geral (farmacocinética e farmacodinâmica). Depois avança por classes de fármacos, sempre com mecanismo de ação, efeitos adversos e interações.',
    },
  ],
};
