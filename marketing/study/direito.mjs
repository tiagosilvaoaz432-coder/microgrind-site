/**
 * "Como estudar X" guides — Direito.
 * Schema in study/index.mjs. `practice` embeds the first `take` items of a /praticar/ page.
 */

export const penal = {
  slug: 'direito-penal',
  subject: 'Direito Penal',
  level: 'Ensino superior',
  title: 'Como estudar Direito Penal: guia, plano de 4 semanas e mini-teste | MicroGrind',
  description: 'Como estudar Direito Penal para o exame: matérias pela ordem certa, plano de 4 semanas, erros comuns e um mini-teste de teoria do crime.',
  h1: 'Como estudar Direito Penal',
  lede: 'Um guia prático para preparar o exame de Direito Penal: o que estudar primeiro, como treinar hipóteses práticas e um mini-teste para veres onde estás.',
  topics: [
    ['Princípios e lei penal', 'Legalidade, aplicação da lei no tempo e no espaço (arts. 1.º a 7.º do CP). É a base de tudo o resto.'],
    ['Estrutura do crime', 'Ação, tipicidade, ilicitude, culpa e punibilidade: a ordem pela qual resolves qualquer caso.'],
    ['Tipo objetivo e imputação', 'Resultado, nexo causal e imputação objetiva (art. 10.º), incluindo crimes por omissão.'],
    ['Dolo, negligência e erro', 'Formas de dolo (art. 14.º), negligência (art. 15.º) e erro sobre o tipo e sobre a ilicitude (arts. 16.º e 17.º).'],
    ['Causas de justificação', 'Legítima defesa, direito de necessidade, conflito de deveres e consentimento (arts. 31.º a 39.º).'],
    ['Culpa e desculpa', 'Imputabilidade (arts. 19.º e 20.º), estado de necessidade desculpante e excesso de legítima defesa.'],
    ['Tentativa e comparticipação', 'Atos preparatórios, tentativa e desistência (arts. 21.º a 25.º), autoria e cumplicidade (arts. 26.º e 27.º).'],
  ],
  plan: [
    ['Semana 1', 'Princípios, lei penal e estrutura do crime. Faz um esquema de uma página com os degraus da análise e os artigos de cada um.'],
    ['Semana 2', 'Tipo objetivo, imputação e dolo/negligência. Resolve 3 a 4 hipóteses curtas focadas só no tipo.'],
    ['Semana 3', 'Causas de justificação, culpa e erro. Treina as distinções que mais caem (ver erros comuns abaixo).'],
    ['Semana 4', 'Tentativa e comparticipação, e depois exames antigos completos com tempo contado. Revê só o que falhaste.'],
  ],
  method: [
    'Estuda sempre com o Código Penal aberto. Para cada figura, escreve os requisitos em lista e o artigo ao lado: nas hipóteses práticas, cada requisito é um parágrafo da resposta.',
    'Resolve hipóteses desde a primeira semana. Ler doutrina sem treinar a aplicação dá a sensação de que sabes a matéria, mas no exame o que conta é percorrer os degraus do crime por ordem e fundamentar cada passo.',
    'Faz perguntas a ti próprio em vez de reler: "Que diferença há entre dolo eventual e negligência consciente?" Se não consegues responder sem olhar, a matéria ainda não está consolidada.',
  ],
  mistakes: [
    'Saltar degraus: discutir a culpa antes de verificar se o facto é ilícito.',
    'Confundir dolo eventual com negligência consciente, ou direito de necessidade (art. 34.º) com estado de necessidade desculpante (art. 35.º).',
    'Citar artigos sem aplicar os requisitos aos factos concretos da hipótese.',
    'Esquecer a desistência na tentativa ou a posição de garante nos crimes por omissão.',
  ],
  practice: { slug: 'direito-penal-teoria-do-crime', take: 5 },
  practiceLinks: ['direito-penal-teoria-do-crime'],
  related: ['direito-constitucional', 'direito-civil'],
  faqs: [
    { q: 'Quanto tempo preciso para estudar Direito Penal?', a: 'Para a parte geral, conta com cerca de 4 semanas de estudo regular, com hipóteses práticas desde o início. Se a cadeira incluir a parte especial (crimes em espécie), acrescenta 1 a 2 semanas.' },
    { q: 'Como resolver uma hipótese prática de Direito Penal?', a: 'Identifica cada agente e cada facto, e para cada um percorre os degraus por ordem: ação, tipicidade (objetiva e subjetiva), ilicitude, culpa e punibilidade. Em cada degrau, cita o artigo e aplica os requisitos aos factos.' },
    { q: 'Que livros devo usar?', a: 'Os manuais indicados pelo regente da tua cadeira. Usa-os em conjunto com o Código Penal anotado e com os exames dos anos anteriores da tua faculdade.' },
  ],
};

export const constitucional = {
  slug: 'direito-constitucional',
  subject: 'Direito Constitucional',
  level: 'Ensino superior',
  title: 'Como estudar Direito Constitucional: guia, plano e mini-teste | MicroGrind',
  description: 'Como estudar Direito Constitucional: matérias pela ordem certa, plano de 4 semanas, erros comuns no exame e mini-teste de direitos fundamentais.',
  h1: 'Como estudar Direito Constitucional',
  lede: 'O que estudar, por que ordem e como treinar para o exame de Direito Constitucional, com um mini-teste sobre direitos fundamentais.',
  topics: [
    ['Constituição e poder constituinte', 'Conceito de Constituição, poder constituinte e revisão constitucional (arts. 284.º a 289.º da CRP).'],
    ['Princípios fundamentais', 'Estado de direito democrático, separação de poderes, soberania popular e unidade do Estado.'],
    ['Direitos fundamentais', 'Regime geral e regime dos direitos, liberdades e garantias (arts. 12.º a 23.º), com destaque para os arts. 18.º e 19.º.'],
    ['Organização do poder político', 'Presidente da República, Assembleia da República, Governo e tribunais: composição, competências e relações entre órgãos.'],
    ['Atos normativos', 'Leis, decretos-leis e decretos legislativos regionais; reserva absoluta e relativa da AR (arts. 164.º e 165.º).'],
    ['Fiscalização da constitucionalidade', 'Preventiva, sucessiva abstrata, concreta e por omissão: legitimidade, prazos e efeitos (arts. 277.º a 283.º).'],
  ],
  plan: [
    ['Semana 1', 'Constituição, princípios fundamentais e leitura atenta dos arts. 1.º a 23.º da CRP.'],
    ['Semana 2', 'Direitos fundamentais: regime, restrições e suspensão. Treina o teste de proporcionalidade em casos curtos.'],
    ['Semana 3', 'Órgãos de soberania e atos normativos. Faz uma tabela de competências e de reservas da Assembleia.'],
    ['Semana 4', 'Fiscalização da constitucionalidade e exames antigos com tempo contado.'],
  ],
  method: [
    'Lê a Constituição, não só os resumos. Muitas perguntas de escolha múltipla dependem de uma palavra do artigo ("em caso algum", "só nos casos expressamente previstos").',
    'Organiza as competências em tabelas comparativas: quem pode fazer o quê, com que maioria, com que prazo. São matérias de memória que ficam muito mais fáceis lado a lado.',
    'Nos casos práticos sobre restrições de direitos, segue sempre o mesmo guião: autorização constitucional, lei geral e abstrata, não retroatividade, proporcionalidade e conteúdo essencial.',
  ],
  mistakes: [
    'Confundir restrição (art. 18.º) com suspensão (art. 19.º) de direitos.',
    'Trocar a legitimidade na fiscalização preventiva e na sucessiva abstrata.',
    'Esquecer que a reserva relativa da Assembleia admite autorização legislativa ao Governo e a absoluta não.',
    'Responder com doutrina geral sem citar o artigo da CRP aplicável.',
  ],
  practice: { slug: 'direito-constitucional-direitos-fundamentais', take: 5 },
  practiceLinks: ['direito-constitucional-direitos-fundamentais'],
  related: ['direito-penal', 'direito-civil'],
  faqs: [
    { q: 'Por onde começo a estudar Direito Constitucional?', a: 'Pelos princípios fundamentais e pelos direitos fundamentais (arts. 1.º a 23.º da CRP). Dão o vocabulário e a lógica que depois usas na organização do poder político e na fiscalização.' },
    { q: 'É preciso decorar a Constituição?', a: 'Não toda. Mas deves saber localizar rapidamente os artigos centrais (18.º, 19.º, 164.º, 165.º, 277.º a 283.º) e conhecer as palavras exatas das normas que mais caem.' },
    { q: 'Como estudar a fiscalização da constitucionalidade?', a: 'Com uma tabela por tipo de fiscalização: quem pede, sobre que atos, em que prazo, quem decide e com que efeitos. Depois treina com casos práticos.' },
  ],
};

export const civil = {
  slug: 'direito-civil',
  subject: 'Teoria Geral do Direito Civil',
  level: 'Ensino superior',
  title: 'Como estudar Direito Civil (Teoria Geral): guia e mini-teste | MicroGrind',
  description: 'Como estudar Teoria Geral do Direito Civil: matérias pela ordem certa, plano de 4 semanas, erros comuns e mini-teste sobre invalidades e vícios.',
  h1: 'Como estudar Direito Civil',
  lede: 'Um guia para a Teoria Geral do Direito Civil, a cadeira que dá a base a todo o Direito Privado, com um plano de estudo e um mini-teste.',
  topics: [
    ['Relação jurídica', 'Sujeitos, objeto, facto jurídico e garantia: a estrutura que organiza toda a cadeira.'],
    ['Pessoas singulares', 'Personalidade jurídica (art. 66.º CC), capacidade de gozo e de exercício, menoridade e maior acompanhado.'],
    ['Pessoas coletivas', 'Associações, fundações e sociedades: personalidade, capacidade e órgãos.'],
    ['Negócio jurídico', 'Declaração negocial, interpretação (arts. 236.º a 238.º), forma (arts. 219.º e 220.º) e conteúdo.'],
    ['Vícios da vontade e divergências', 'Simulação, reserva mental, erro, dolo e coação (arts. 240.º a 257.º).'],
    ['Invalidades', 'Nulidade e anulabilidade, confirmação, redução e conversão (arts. 285.º a 294.º).'],
    ['Tempo e relações jurídicas', 'Prescrição e caducidade (arts. 296.º a 333.º).'],
  ],
  plan: [
    ['Semana 1', 'Relação jurídica, personalidade e capacidade. Resume os regimes da menoridade e do maior acompanhado.'],
    ['Semana 2', 'Negócio jurídico: declaração, interpretação, forma e conteúdo. Treina interpretação com casos curtos.'],
    ['Semana 3', 'Vícios da vontade e invalidades. Faz a tabela nulidade vs anulabilidade e liga cada vício ao seu regime.'],
    ['Semana 4', 'Prescrição e caducidade, pessoas coletivas e exames antigos completos.'],
  ],
  method: [
    'Constrói um mapa da cadeira a partir da relação jurídica: cada capítulo responde a uma das suas peças. Isto ajuda a perceber onde encaixa cada artigo.',
    'Faz tabelas comparativas para as figuras parecidas: simulação vs reserva mental, erro vs dolo, nulidade vs anulabilidade, prescrição vs caducidade.',
    'Nas hipóteses, identifica primeiro o problema (há divergência entre vontade e declaração? há um vício?) e só depois procura o artigo. É assim que se chega à consequência jurídica certa.',
  ],
  mistakes: [
    'Dizer que um negócio é "inválido" sem precisar se é nulo ou anulável.',
    'Confundir simulação (acordo para enganar terceiros) com reserva mental (sem acordo).',
    'Esquecer prazos e legitimidade quando se fala de anulabilidade.',
    'Confundir capacidade de gozo com capacidade de exercício.',
  ],
  practice: { slug: 'direito-civil-teoria-geral', take: 5 },
  practiceLinks: ['direito-civil-teoria-geral'],
  related: ['direito-penal', 'direito-constitucional'],
  faqs: [
    { q: 'Teoria Geral do Direito Civil é difícil?', a: 'É uma cadeira extensa e muito conceptual, mas lógica. Com tabelas comparativas e treino de hipóteses desde cedo, torna-se muito mais previsível.' },
    { q: 'Que artigos do Código Civil devo dominar?', a: 'Os da personalidade e capacidade (66.º e seguintes, 122.º e seguintes), do negócio jurídico (217.º a 294.º) e da prescrição e caducidade (296.º a 333.º).' },
    { q: 'Como estudar os vícios da vontade?', a: 'Para cada vício, fixa a definição, os requisitos e a consequência. Depois resolve casos em que tens de escolher entre vícios parecidos.' },
  ],
};
