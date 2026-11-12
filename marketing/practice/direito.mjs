/**
 * Practice pages — Direito (Portuguese law: Código Penal, Constituição, Código Civil).
 * Quiz items: { q, right, wrong: [3], why }. index.mjs places the right answer.
 * Review by someone from the field before each production publish.
 */

export const penal = {
  slug: 'direito-penal-teoria-do-crime',
  area: 'direito',
  mode: 'quiz',
  subject: 'Direito Penal',
  level: 'Ensino superior',
  kicker: 'Direito Penal',
  title: 'Direito Penal: 10 perguntas de exame sobre teoria do crime | MicroGrind',
  description: 'Testa-te em teoria do crime: legalidade, dolo, negligência, legítima defesa, tentativa e omissão. 10 perguntas com resposta explicada.',
  h1: 'Prepara o teu exame de Direito Penal',
  lede: 'Testa os teus conhecimentos com dez perguntas de escolha múltipla sobre teoria do crime, com a resposta explicada e o artigo do Código Penal.',
  practiceHeading: 'Mini-teste: teoria do crime',
  keywords: ['direito penal', 'teoria do crime', 'exame direito penal', 'perguntas direito penal', 'código penal'],
  related: ['direito-constitucional-direitos-fundamentais', 'direito-civil-teoria-geral'],
  items: [
    {
      q: 'Qual é a finalidade do princípio da legalidade criminal?',
      right: 'Garantir que só é punido o facto descrito e declarado passível de pena por lei anterior à sua prática',
      wrong: [
        'Permitir ao juiz punir, por analogia, condutas graves que a lei não prevê',
        'Assegurar que se aplica sempre a pena máxima prevista para o crime',
        'Dispensar a prova da culpa quando o facto é ilícito',
      ],
      why: 'Art. 1.º do Código Penal e art. 29.º da Constituição: nullum crimen, nulla poena sine lege. A lei tem de ser prévia, escrita e certa, e é proibida a analogia para qualificar um facto como crime (art. 1.º, n.º 3).',
    },
    {
      q: 'Na construção dogmática dominante, o crime é um facto:',
      right: 'Típico, ilícito, culposo e punível',
      wrong: ['Imoral e praticado com intenção', 'Que causa um dano a outra pessoa, seja qual for a lei', 'Previsto em regulamento administrativo e punido com coima'],
      why: 'A análise faz-se por degraus: primeiro a tipicidade (o facto corresponde a um tipo legal), depois a ilicitude (não há causa de justificação), a culpa (o agente é censurável) e, por fim, a punibilidade.',
    },
    {
      q: 'Há dolo eventual quando o agente:',
      right: 'Representa a realização do facto como consequência possível da sua conduta e atua conformando-se com ela',
      wrong: [
        'Atua com a intenção direta de realizar o facto',
        'Representa a realização do facto como consequência necessária da conduta',
        'Nem sequer chega a representar a possibilidade de realizar o facto',
      ],
      why: 'Art. 14.º, n.º 3, do CP. A intenção direta é dolo direto (n.º 1) e a consequência necessária é dolo necessário (n.º 2). Não representar a possibilidade é negligência inconsciente.',
    },
    {
      q: 'O que distingue a negligência consciente do dolo eventual?',
      right: 'Na negligência consciente o agente representa o facto como possível, mas atua sem se conformar com essa realização',
      wrong: [
        'Na negligência consciente o agente não representa o facto como possível',
        'A negligência consciente exige intenção de causar o resultado',
        'A lei não distingue as duas figuras',
      ],
      why: 'Art. 15.º, alínea a), do CP. Em ambas há representação da possibilidade; a diferença está na conformação: quem se conforma age com dolo eventual, quem confia que o facto não se realiza age com negligência consciente.',
    },
    {
      q: 'A legítima defesa pressupõe uma agressão:',
      right: 'Atual e ilícita de interesses juridicamente protegidos do agente ou de terceiro',
      wrong: ['Futura, mas provável', 'Já consumada e terminada', 'Lícita, mas sentida como injusta'],
      why: 'Art. 32.º do CP: o facto praticado como meio necessário para repelir a agressão atual e ilícita é justificado. Uma agressão já terminada ou apenas futura não abre a legítima defesa.',
    },
    {
      q: 'Para o direito de necessidade (art. 34.º do CP) excluir a ilicitude, o interesse a salvaguardar deve ser:',
      right: 'Sensivelmente superior ao interesse sacrificado',
      wrong: ['Igual ao interesse sacrificado', 'Inferior ao interesse sacrificado', 'Qualquer um, desde que o agente esteja em perigo'],
      why: 'Art. 34.º, alínea b), do CP exige a sensível superioridade do interesse a salvaguardar. Se não houver essa superioridade, pode ainda haver estado de necessidade desculpante (art. 35.º), que exclui a culpa e não a ilicitude.',
    },
    {
      q: 'Em razão da idade, são inimputáveis em Portugal os menores de:',
      right: '16 anos',
      wrong: ['12 anos', '14 anos', '18 anos'],
      why: 'Art. 19.º do CP. Entre os 12 e os 16 anos aplica-se a Lei Tutelar Educativa; entre os 16 e os 21 há um regime especial para jovens adultos.',
    },
    {
      q: 'Em regra, os atos preparatórios:',
      right: 'Não são puníveis, salvo disposição em contrário',
      wrong: ['São sempre punidos com a pena da tentativa', 'São punidos com a pena do crime consumado', 'São puníveis apenas nos crimes negligentes'],
      why: 'Art. 21.º do CP. A punição começa, em regra, com os atos de execução (tentativa, art. 22.º). Há exceções em que a lei pune autonomamente certos atos preparatórios.',
    },
    {
      q: 'A tentativa deixa de ser punível quando o agente:',
      right: 'Voluntariamente desiste de prosseguir na execução ou impede a consumação',
      wrong: ['É descoberto pela polícia antes da consumação', 'Falha o resultado por erro na execução', 'Arrepende-se depois de o crime estar consumado'],
      why: 'Art. 24.º do CP (desistência). A desistência tem de ser voluntária: se o agente para porque foi descoberto ou porque não conseguiu, não há desistência relevante.',
    },
    {
      q: 'Quando é punível a comissão de um resultado por omissão?',
      right: 'Quando sobre o omitente recai um dever jurídico que pessoalmente o obrigue a evitar esse resultado',
      wrong: ['Sempre que alguém assiste ao resultado sem intervir', 'Apenas nos crimes negligentes', 'Nunca: o Direito Penal português só pune ações'],
      why: 'Art. 10.º, n.º 2, do CP: é a posição de garante. Sem dever de garante pode haver, em certos casos, o crime autónomo de omissão de auxílio (art. 200.º).',
    },
  ],
  howTo: {
    h2: 'Como estudar Direito Penal para o exame',
    paragraphs: [
      'Começa pela estrutura do crime: tipicidade, ilicitude, culpa e punibilidade. Quase todas as hipóteses práticas pedem que percorras estes degraus por ordem, e cada matéria (dolo, causas de justificação, imputabilidade) encaixa num deles.',
      'Estuda com o Código Penal aberto. Para cada figura, anota o artigo e os requisitos em lista: legítima defesa (art. 32.º), direito de necessidade (art. 34.º), tentativa (arts. 22.º a 25.º). Nas perguntas de escolha múltipla, a diferença entre opções costuma estar num só requisito.',
      'Treina distinções que caem sempre: dolo eventual vs negligência consciente, direito de necessidade vs estado de necessidade desculpante, atos preparatórios vs atos de execução. Depois resolve hipóteses práticas com tempo contado.',
    ],
  },
  faqs: [
    {
      q: 'Quais são as matérias de teoria do crime que mais saem em exame?',
      a: 'Princípio da legalidade, formas de dolo e negligência, causas de justificação (legítima defesa e direito de necessidade), imputabilidade, tentativa e desistência, e comissão por omissão.',
    },
    {
      q: 'Estas perguntas substituem a matéria da minha faculdade?',
      a: 'Não. São perguntas de exemplo para treino. Confirma sempre com o programa, os manuais indicados e a jurisprudência que o teu regente valoriza.',
    },
  ],
};

export const constitucional = {
  slug: 'direito-constitucional-direitos-fundamentais',
  area: 'direito',
  mode: 'quiz',
  subject: 'Direito Constitucional',
  level: 'Ensino superior',
  kicker: 'Direito Constitucional',
  title: 'Direito Constitucional: perguntas de exame sobre direitos fundamentais | MicroGrind',
  description: 'Regime dos direitos, liberdades e garantias, restrições, estado de sítio e fiscalização. 10 perguntas de exame com resposta explicada.',
  h1: 'Perguntas de exame de Direito Constitucional',
  lede: 'Dez perguntas de escolha múltipla sobre direitos fundamentais na Constituição da República Portuguesa, com o artigo e a explicação de cada resposta.',
  practiceHeading: 'Mini-teste: direitos fundamentais',
  keywords: ['direito constitucional', 'direitos fundamentais', 'exame direito constitucional', 'constituição da república portuguesa', 'artigo 18.º CRP'],
  related: ['direito-penal-teoria-do-crime', 'direito-civil-teoria-geral'],
  items: [
    {
      q: 'Segundo o art. 18.º, n.º 1, da CRP, os preceitos sobre direitos, liberdades e garantias:',
      right: 'São diretamente aplicáveis e vinculam as entidades públicas e privadas',
      wrong: ['Só se aplicam depois de regulamentados por lei', 'Vinculam apenas o Estado', 'São normas programáticas sem eficácia imediata'],
      why: 'A aplicabilidade direta e a vinculação de entidades públicas e privadas são as duas marcas do regime específico dos DLG.',
    },
    {
      q: 'Que princípio exige que a restrição de um direito fundamental seja adequada, necessária e proporcional em sentido estrito?',
      right: 'Princípio da proporcionalidade (proibição do excesso)',
      wrong: ['Princípio da universalidade', 'Princípio da separação de poderes', 'Princípio da tipicidade'],
      why: 'Decorre do art. 18.º, n.º 2, da CRP: as restrições limitam-se ao necessário para salvaguardar outros direitos ou interesses constitucionalmente protegidos.',
    },
    {
      q: 'As leis restritivas de direitos, liberdades e garantias não podem:',
      right: 'Ter efeito retroativo',
      wrong: ['Ter carácter geral', 'Ser aprovadas pela Assembleia da República', 'Ter carácter abstrato'],
      why: 'Art. 18.º, n.º 3, da CRP: as leis restritivas têm de revestir carácter geral e abstrato, não podem ter efeito retroativo nem diminuir o conteúdo essencial dos preceitos constitucionais.',
    },
    {
      q: 'O exercício dos direitos, liberdades e garantias só pode ser suspenso:',
      right: 'Em estado de sítio ou de estado de emergência, declarados nos termos da Constituição',
      wrong: ['Por decisão do Governo em caso de crise económica', 'Por lei ordinária aprovada por maioria simples', 'Por decisão de qualquer tribunal'],
      why: 'Art. 19.º, n.º 1, da CRP. A declaração cabe ao Presidente da República, ouvido o Governo e com autorização da Assembleia da República (art. 138.º).',
    },
    {
      q: 'Qual destes direitos não pode, em caso algum, ser afetado pela declaração do estado de sítio?',
      right: 'O direito à vida',
      wrong: ['A liberdade de deslocação', 'O direito de reunião', 'A inviolabilidade do domicílio'],
      why: 'Art. 19.º, n.º 6, da CRP: a declaração nunca pode afetar, entre outros, os direitos à vida, à integridade pessoal, à identidade pessoal, a não retroatividade da lei criminal, o direito de defesa dos arguidos e a liberdade de consciência e de religião.',
    },
    {
      q: 'O art. 13.º da CRP consagra o princípio da:',
      right: 'Igualdade',
      wrong: ['Universalidade', 'Legalidade', 'Proporcionalidade'],
      why: 'Todos os cidadãos têm a mesma dignidade social e são iguais perante a lei; ninguém pode ser privilegiado ou prejudicado por razões como ascendência, sexo, raça ou religião. A universalidade está no art. 12.º.',
    },
    {
      q: 'O que diz a Constituição sobre a pena de morte?',
      right: 'Em caso algum haverá pena de morte',
      wrong: ['Só pode existir em tempo de guerra', 'Pode ser prevista para crimes de terrorismo', 'Depende de referendo'],
      why: 'Art. 24.º, n.º 2, da CRP. A vida humana é inviolável (n.º 1), sem exceções.',
    },
    {
      q: 'A quem podem os cidadãos apresentar queixas por ações ou omissões dos poderes públicos, que as aprecia sem poder decisório?',
      right: 'Ao Provedor de Justiça',
      wrong: ['Ao Tribunal Constitucional', 'Ao Presidente da Assembleia da República', 'Ao Procurador-Geral da República'],
      why: 'Art. 23.º da CRP. O Provedor dirige recomendações aos órgãos competentes para prevenir e reparar injustiças.',
    },
    {
      q: 'Em regra, quem pode requerer a fiscalização preventiva da constitucionalidade de um decreto enviado para promulgação?',
      right: 'O Presidente da República',
      wrong: ['Qualquer cidadão', 'O Provedor de Justiça', 'O Procurador-Geral da República'],
      why: 'Art. 278.º da CRP. Para as leis orgânicas, também o Primeiro-Ministro ou um quinto dos deputados (n.º 4). O Provedor e o PGR intervêm na fiscalização sucessiva abstrata (art. 281.º).',
    },
    {
      q: 'O regime dos direitos, liberdades e garantias aplica-se também:',
      right: 'Aos direitos fundamentais de natureza análoga',
      wrong: ['Apenas aos direitos do Título II', 'A todos os direitos económicos, sociais e culturais, sem distinção', 'Só aos direitos previstos em tratados internacionais'],
      why: 'Art. 17.º da CRP. Um direito fora do Título II (por exemplo, certos direitos dos trabalhadores) pode beneficiar do regime dos DLG se tiver estrutura análoga.',
    },
  ],
  howTo: {
    h2: 'Como estudar Direito Constitucional para o exame',
    paragraphs: [
      'Organiza a matéria à volta dos artigos 12.º a 23.º e 18.º e 19.º da CRP: são a base do regime dos direitos fundamentais e aparecem em quase todos os exames, tanto em perguntas diretas como em casos práticos.',
      'Para cada restrição de um direito, treina o teste completo: há autorização constitucional? A lei é geral e abstrata, não retroativa? A medida é adequada, necessária e proporcional? Respeita o conteúdo essencial?',
      'Fixa as competências na fiscalização da constitucionalidade (preventiva, sucessiva abstrata e concreta): quem pode pedir, em que prazo e com que efeitos. São detalhes que separam as opções de escolha múltipla.',
    ],
  },
  faqs: [
    {
      q: 'Que artigos da Constituição devo saber para direitos fundamentais?',
      a: 'No mínimo, os arts. 12.º e 13.º (universalidade e igualdade), 16.º e 17.º (âmbito e regime), 18.º (força jurídica e restrições), 19.º (suspensão) e o catálogo dos DLG a partir do art. 24.º.',
    },
    {
      q: 'Qual a diferença entre restrição e suspensão de um direito?',
      a: 'A restrição é feita por lei, de forma permanente e limitada (art. 18.º). A suspensão é temporária e só pode acontecer em estado de sítio ou de emergência (art. 19.º).',
    },
  ],
};

export const civil = {
  slug: 'direito-civil-teoria-geral',
  area: 'direito',
  mode: 'quiz',
  subject: 'Teoria Geral do Direito Civil',
  level: 'Ensino superior',
  kicker: 'Teoria Geral do Direito Civil',
  title: 'Teoria Geral do Direito Civil: 10 perguntas de exame | MicroGrind',
  description: 'Personalidade, capacidade, nulidade e anulabilidade, simulação, dolo e prescrição: 10 perguntas de Teoria Geral com resposta explicada.',
  h1: 'Perguntas de Teoria Geral do Direito Civil',
  lede: 'Dez perguntas de escolha múltipla sobre personalidade, capacidade, invalidades e vícios da vontade, com o artigo do Código Civil em cada resposta.',
  practiceHeading: 'Mini-teste: Teoria Geral do Direito Civil',
  keywords: ['teoria geral do direito civil', 'perguntas teoria geral', 'nulidade e anulabilidade', 'código civil', 'exame direito civil'],
  related: ['direito-penal-teoria-do-crime', 'direito-constitucional-direitos-fundamentais'],
  items: [
    {
      q: 'Em que momento se adquire a personalidade jurídica?',
      right: 'No momento do nascimento completo e com vida',
      wrong: ['No momento da conceção', 'Com o registo do nascimento', 'Aos 18 anos'],
      why: 'Art. 66.º, n.º 1, do Código Civil. Os direitos que a lei reconhece aos nascituros dependem do seu nascimento (n.º 2).',
    },
    {
      q: 'Em que idade se atinge a maioridade?',
      right: '18 anos',
      wrong: ['16 anos', '21 anos', '14 anos'],
      why: 'Art. 130.º do CC: aos 18 anos a pessoa fica habilitada a reger a sua pessoa e a dispor dos seus bens.',
    },
    {
      q: 'Em regra, os negócios jurídicos celebrados por menores são:',
      right: 'Anuláveis',
      wrong: ['Nulos', 'Inexistentes', 'Plenamente válidos'],
      why: 'Art. 125.º do CC. A anulabilidade pode ser arguida, por exemplo, pelo progenitor ou pelo próprio menor dentro dos prazos legais. Há exceções no art. 127.º (atos da vida corrente, por exemplo).',
    },
    {
      q: 'A nulidade:',
      right: 'É invocável a todo o tempo por qualquer interessado e pode ser declarada oficiosamente pelo tribunal',
      wrong: [
        'Só pode ser invocada pela pessoa protegida, no prazo de um ano',
        'Sana-se automaticamente ao fim de cinco anos',
        'Só pode ser declarada a pedido do Ministério Público',
      ],
      why: 'Art. 286.º do CC. É o regime oposto ao da anulabilidade (art. 287.º).',
    },
    {
      q: 'A anulabilidade, em regra, deve ser arguida:',
      right: 'Dentro do ano subsequente à cessação do vício que lhe serve de fundamento',
      wrong: ['A todo o tempo', 'No prazo de 20 anos', 'Nos 30 dias seguintes à celebração do negócio'],
      why: 'Art. 287.º, n.º 1, do CC. Só têm legitimidade as pessoas em cujo interesse a lei estabelece a anulabilidade.',
    },
    {
      q: 'O negócio simulado é:',
      right: 'Nulo',
      wrong: ['Anulável', 'Válido entre as partes', 'Ineficaz apenas perante o Estado'],
      why: 'Art. 240.º, n.º 2, do CC. Há simulação quando, por acordo entre declarante e declaratário e para enganar terceiros, a declaração diverge da vontade real. Se houver um negócio dissimulado, pode valer (art. 241.º).',
    },
    {
      q: 'A reserva mental:',
      right: 'Não prejudica a validade da declaração, salvo se for conhecida do declaratário',
      wrong: ['Torna sempre o negócio nulo', 'Torna sempre o negócio anulável', 'Exige acordo com o declaratário'],
      why: 'Art. 244.º do CC. Há reserva mental quando se emite uma declaração contrária à vontade real com o intuito de enganar o declaratário; ao contrário da simulação, não há acordo.',
    },
    {
      q: 'Qual é a regra quanto à forma dos negócios jurídicos?',
      right: 'Liberdade de forma, salvo quando a lei a exigir',
      wrong: ['Todos exigem escritura pública', 'Todos exigem documento escrito', 'A forma é sempre escolhida pelo notário'],
      why: 'Art. 219.º do CC (princípio da consensualidade). Quando a lei exige forma e ela falta, o negócio é, em regra, nulo (art. 220.º).',
    },
    {
      q: 'Qual é o prazo ordinário de prescrição?',
      right: '20 anos',
      wrong: ['5 anos', '10 anos', '30 anos'],
      why: 'Art. 309.º do CC. Há prazos mais curtos para certos créditos, como os de 5 anos do art. 310.º.',
    },
    {
      q: 'O dolo, como vício da vontade, consiste em:',
      right: 'Qualquer sugestão ou artifício para induzir ou manter em erro o autor da declaração',
      wrong: ['Ameaça de um mal para obter a declaração', 'Divergência acordada entre a declaração e a vontade', 'Falta de consciência de estar a fazer uma declaração'],
      why: 'Art. 253.º do CC. O declarante cuja vontade foi determinada por dolo pode anular a declaração (art. 254.º). A ameaça é coação moral (art. 255.º).',
    },
  ],
  howTo: {
    h2: 'Como estudar Teoria Geral do Direito Civil',
    paragraphs: [
      'Segue a lógica da relação jurídica: sujeitos (personalidade e capacidade), objeto, facto jurídico (negócio jurídico) e garantia. Cada capítulo da matéria responde a uma destas peças.',
      'Faz uma tabela das invalidades: nulidade e anulabilidade lado a lado, com legitimidade, prazo, conhecimento oficioso e possibilidade de confirmação (arts. 285.º a 294.º). Depois liga cada vício da vontade ao regime que produz.',
      'Nas hipóteses práticas, identifica primeiro o tipo de divergência ou vício (simulação, reserva mental, erro, dolo, coação) e só depois procura o artigo. As perguntas de escolha múltipla testam exatamente essa distinção.',
    ],
  },
  faqs: [
    {
      q: 'Qual a diferença entre nulidade e anulabilidade?',
      a: 'A nulidade é invocável a todo o tempo por qualquer interessado e de conhecimento oficioso (art. 286.º). A anulabilidade só pode ser arguida por quem a lei protege, em regra no ano seguinte à cessação do vício (art. 287.º), e pode ser confirmada.',
    },
    {
      q: 'Qual a diferença entre simulação e reserva mental?',
      a: 'Na simulação há acordo entre as partes para enganar terceiros e o negócio é nulo. Na reserva mental só o declarante sabe da divergência, e a declaração vale salvo se o declaratário a conhecer.',
    },
  ],
};
