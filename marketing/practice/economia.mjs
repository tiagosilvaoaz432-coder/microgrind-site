/** Practice pages — Economia e Gestão. */

export const micro = {
  slug: 'microeconomia-perguntas-de-exame',
  area: 'economia',
  mode: 'quiz',
  subject: 'Microeconomia',
  level: 'Ensino superior',
  kicker: 'Microeconomia',
  title: 'Microeconomia: 10 perguntas de exame com resposta explicada | MicroGrind',
  description: 'Procura e oferta, elasticidades, concorrência perfeita, monopólio e custo de oportunidade. 10 perguntas de exame de Microeconomia.',
  h1: 'Perguntas de exame de Microeconomia',
  lede: 'Dez perguntas de escolha múltipla sobre procura, elasticidades e estruturas de mercado, com a explicação de cada resposta.',
  practiceHeading: 'Mini-teste: Microeconomia',
  keywords: ['perguntas de exame microeconomia', 'microeconomia exame', 'elasticidade preço da procura', 'concorrência perfeita', 'monopólio'],
  related: ['macroeconomia-perguntas-de-exame', 'contabilidade-financeira-exercicios'],
  items: [
    {
      q: 'Segundo a lei da procura, ceteris paribus, quando o preço de um bem aumenta:',
      right: 'A quantidade procurada diminui',
      wrong: ['A quantidade procurada aumenta', 'A curva da procura desloca-se para a direita', 'A oferta diminui'],
      why: 'Uma variação do preço do próprio bem é um movimento ao longo da curva da procura. Deslocações da curva resultam de outros fatores (rendimento, preços de outros bens, gostos).',
    },
    {
      q: 'O preço de um bem sobe 10% e a quantidade procurada cai 20%. A procura é:',
      right: 'Elástica, com elasticidade-preço de valor absoluto 2',
      wrong: ['Inelástica, com elasticidade 0,5', 'Unitária', 'Perfeitamente inelástica'],
      why: 'ε = (−20%) / (10%) = −2. Como |ε| > 1, a procura é elástica: a quantidade reage mais do que proporcionalmente ao preço.',
    },
    {
      q: 'Se a procura de um bem é inelástica, um aumento do preço faz a receita total:',
      right: 'Aumentar',
      wrong: ['Diminuir', 'Manter-se constante', 'Anular-se'],
      why: 'Com |ε| < 1, a quantidade cai proporcionalmente menos do que o preço sobe, por isso P × Q aumenta.',
    },
    {
      q: 'Dois bens substitutos têm elasticidade-preço cruzada:',
      right: 'Positiva',
      wrong: ['Negativa', 'Nula', 'Sempre igual a 1'],
      why: 'Se o preço de um sobe, a procura do outro aumenta. Bens complementares têm elasticidade cruzada negativa.',
    },
    {
      q: 'Um bem inferior tem elasticidade-rendimento:',
      right: 'Negativa',
      wrong: ['Positiva e menor do que 1', 'Positiva e maior do que 1', 'Sempre nula'],
      why: 'Quando o rendimento aumenta, a procura de um bem inferior diminui. Bens normais têm elasticidade-rendimento positiva (bens de luxo, maior do que 1).',
    },
    {
      q: 'Em concorrência perfeita, uma empresa maximiza o lucro produzindo onde:',
      right: 'O preço é igual ao custo marginal',
      wrong: ['O preço é igual ao custo médio mínimo, sempre', 'A receita total é máxima', 'O custo fixo é mínimo'],
      why: 'A condição geral é receita marginal = custo marginal. Em concorrência perfeita a empresa é tomadora de preço, por isso a receita marginal é igual ao preço: P = CMg.',
    },
    {
      q: 'Um monopolista maximizador do lucro escolhe a quantidade em que:',
      right: 'A receita marginal iguala o custo marginal, cobrando um preço acima do custo marginal',
      wrong: ['O preço iguala o custo marginal', 'A procura é inelástica', 'A receita total é máxima'],
      why: 'Como a receita marginal do monopolista é inferior ao preço, a condição RMg = CMg leva a P > CMg e a uma quantidade menor do que em concorrência.',
    },
    {
      q: 'Um preço máximo fixado abaixo do preço de equilíbrio provoca:',
      right: 'Excesso de procura (escassez)',
      wrong: ['Excesso de oferta', 'Nenhum efeito', 'Uma subida do preço de mercado'],
      why: 'Ao preço fixado, os consumidores querem comprar mais do que os produtores querem vender. Um preço mínimo acima do equilíbrio cria excesso de oferta.',
    },
    {
      q: 'O custo de oportunidade de uma escolha é:',
      right: 'O valor da melhor alternativa de que se abdica',
      wrong: ['A soma de todas as alternativas', 'O preço pago em dinheiro', 'O custo fixo da produção'],
      why: 'Inclui custos não monetários, como o tempo. É o conceito por trás da fronteira de possibilidades de produção.',
    },
    {
      q: 'No curto prazo, uma empresa em concorrência perfeita deve encerrar se o preço for inferior:',
      right: 'Ao mínimo do custo variável médio',
      wrong: ['Ao mínimo do custo total médio', 'Ao custo fixo médio', 'Ao custo marginal máximo'],
      why: 'Abaixo do mínimo do CVMe a empresa nem cobre os custos variáveis e perde menos se encerrar (perde só os fixos). Entre o CVMe e o CTMe mínimos, produz com prejuízo no curto prazo.',
    },
  ],
  howTo: {
    h2: 'Como estudar Microeconomia para o exame',
    paragraphs: [
      'Aprende cada tema com o gráfico ao lado: procura e oferta, curvas de custos, equilíbrio em concorrência e em monopólio. Em exame, quase todas as perguntas se resolvem desenhando o gráfico certo.',
      'Distingue sempre movimentos ao longo da curva (variação do preço do próprio bem) de deslocações da curva (outros fatores). É a fonte mais comum de respostas erradas em escolha múltipla.',
      'Pratica cálculos curtos: elasticidades, receita total e marginal, maximização do lucro (RMg = CMg). Faz exercícios com números simples até a condição de ótimo sair de forma automática.',
    ],
  },
  faqs: [
    {
      q: 'Qual é a condição de maximização do lucro?',
      a: 'Receita marginal igual a custo marginal (RMg = CMg). Em concorrência perfeita isso equivale a P = CMg, porque a receita marginal é o preço.',
    },
    {
      q: 'Como sei se a procura é elástica?',
      a: 'Calcula a elasticidade-preço: variação percentual da quantidade a dividir pela variação percentual do preço. Se o valor absoluto for maior do que 1, a procura é elástica.',
    },
  ],
};

export const macro = {
  slug: 'macroeconomia-perguntas-de-exame',
  area: 'economia',
  mode: 'quiz',
  subject: 'Macroeconomia',
  level: 'Ensino superior',
  kicker: 'Macroeconomia',
  title: 'Macroeconomia: 10 perguntas de exame com resposta explicada | MicroGrind',
  description: 'PIB, inflação, desemprego, multiplicador, política monetária e orçamental. 10 perguntas de exame de Macroeconomia com explicação.',
  h1: 'Perguntas de exame de Macroeconomia',
  lede: 'Dez perguntas de escolha múltipla sobre contas nacionais, inflação, desemprego e política económica, com a explicação de cada resposta.',
  practiceHeading: 'Mini-teste: Macroeconomia',
  keywords: ['perguntas de exame macroeconomia', 'macroeconomia exame', 'PIB ótica da despesa', 'multiplicador keynesiano', 'política monetária BCE'],
  related: ['microeconomia-perguntas-de-exame', 'contabilidade-financeira-exercicios'],
  items: [
    {
      q: 'O PIB mede:',
      right: 'O valor dos bens e serviços finais produzidos num território num dado período',
      wrong: ['O valor de todas as transações, incluindo bens intermédios', 'O rendimento dos residentes, onde quer que produzam', 'A riqueza acumulada de um país'],
      why: 'Contam-se só bens finais para evitar dupla contagem. O critério territorial distingue o PIB do PNB/RNB, que segue os residentes.',
    },
    {
      q: 'Na ótica da despesa, o PIB é igual a:',
      right: 'C + I + G + (X − M)',
      wrong: ['C + I + G + X + M', 'C − I + G − X', 'Salários + lucros'],
      why: 'Consumo privado, investimento, consumo público e exportações líquidas. As importações subtraem-se porque foram produzidas no estrangeiro. Salários e lucros correspondem à ótica do rendimento.',
    },
    {
      q: 'Qual é a diferença entre PIB nominal e PIB real?',
      right: 'O PIB real é calculado a preços constantes e retira o efeito da variação dos preços',
      wrong: ['O PIB real inclui a economia paralela', 'O PIB nominal exclui os impostos', 'Não há diferença'],
      why: 'O crescimento real mede a variação das quantidades produzidas. O quociente PIB nominal / PIB real dá o deflator do PIB.',
    },
    {
      q: 'Inflação é:',
      right: 'Um aumento generalizado e sustentado do nível geral de preços',
      wrong: ['O aumento do preço de um único bem', 'A descida do nível geral de preços', 'O aumento do PIB real'],
      why: 'Mede-se habitualmente pela variação do índice de preços no consumidor (IPC/IHPC). A descida generalizada de preços chama-se deflação.',
    },
    {
      q: 'No modelo keynesiano simples, com propensão marginal a consumir de 0,8, o multiplicador da despesa é:',
      right: '5',
      wrong: ['0,8', '1,25', '8'],
      why: 'Multiplicador = 1 / (1 − c) = 1 / 0,2 = 5. Um aumento autónomo da despesa de 1 aumenta o rendimento de equilíbrio em 5.',
    },
    {
      q: 'A taxa de desemprego calcula-se como:',
      right: 'Desempregados a dividir pela população ativa',
      wrong: ['Desempregados a dividir pela população total', 'Desempregados a dividir pela população inativa', 'Empregados a dividir pela população ativa'],
      why: 'A população ativa é a soma de empregados e desempregados. Inativos (estudantes, reformados, quem não procura emprego) não entram no denominador.',
    },
    {
      q: 'Na área do euro, a política monetária é conduzida:',
      right: 'Pelo Banco Central Europeu, no âmbito do Eurosistema',
      wrong: ['Por cada banco central nacional de forma independente', 'Pela Comissão Europeia', 'Pelos governos nacionais'],
      why: 'O BCE define as taxas de juro diretoras para toda a área do euro, com o objetivo principal de estabilidade dos preços. Os bancos centrais nacionais, como o Banco de Portugal, fazem parte do Eurosistema.',
    },
    {
      q: 'Qual destas medidas é de política orçamental expansionista?',
      right: 'Aumentar a despesa pública ou reduzir impostos',
      wrong: ['Subir as taxas de juro', 'Aumentar impostos para reduzir o défice', 'Vender títulos de dívida pelo banco central'],
      why: 'A política orçamental usa despesa pública e impostos. Taxas de juro e operações de mercado aberto são instrumentos de política monetária.',
    },
    {
      q: 'Uma subida das taxas de juro pelo banco central tende a:',
      right: 'Reduzir a procura agregada e a pressão inflacionista',
      wrong: ['Aumentar o investimento', 'Aumentar a inflação', 'Não ter efeito no consumo'],
      why: 'Crédito mais caro reduz investimento e consumo financiado. É por isso que os bancos centrais sobem juros para combater a inflação.',
    },
    {
      q: 'A curva de Phillips de curto prazo descreve uma relação:',
      right: 'Inversa entre inflação e desemprego',
      wrong: ['Direta entre inflação e desemprego', 'Inversa entre PIB e investimento', 'Direta entre juros e consumo'],
      why: 'No curto prazo, menor desemprego tende a vir com mais inflação. No longo prazo, com expectativas ajustadas, a curva tende a ser vertical na taxa natural de desemprego.',
    },
  ],
  howTo: {
    h2: 'Como estudar Macroeconomia para o exame',
    paragraphs: [
      'Começa pelas contas nacionais: as três óticas do PIB, nominal vs real e o deflator. São conceitos curtos que valem pontos fáceis e servem de base ao resto da matéria.',
      'Depois treina os modelos com gráfico: a cruz keynesiana e o multiplicador, IS-LM e procura e oferta agregadas. Para cada choque (subida da despesa, dos juros, do preço do petróleo), escreve o efeito em cadeia sobre produto, preços e emprego.',
      'Distingue sempre política orçamental (governo: despesa e impostos) de política monetária (banco central: juros e liquidez). Na área do euro, a monetária é do BCE.',
    ],
  },
  faqs: [
    {
      q: 'Como se calcula o multiplicador keynesiano?',
      a: 'No modelo simples, sem Estado nem exterior, o multiplicador é 1 / (1 − c), em que c é a propensão marginal a consumir. Com impostos proporcionais e importações, o multiplicador fica mais pequeno.',
    },
    {
      q: 'Qual é a diferença entre PIB e PNB?',
      a: 'O PIB mede a produção no território do país. O PNB (ou RNB) mede o rendimento dos residentes, incluindo o que obtêm no estrangeiro e excluindo o que é pago a não residentes.',
    },
  ],
};

export const contabilidade = {
  slug: 'contabilidade-financeira-exercicios',
  area: 'economia',
  mode: 'quiz',
  subject: 'Contabilidade Financeira',
  level: 'Ensino superior',
  kicker: 'Contabilidade Financeira',
  title: 'Contabilidade Financeira: 10 exercícios resolvidos (SNC) | MicroGrind',
  description: 'Equação fundamental, lançamentos, depreciações, acréscimo, classes do SNC e CMVMC. 10 exercícios de Contabilidade Financeira com resolução.',
  h1: 'Exercícios de Contabilidade Financeira',
  lede: 'Dez exercícios de escolha múltipla sobre o balanço, lançamentos e o SNC, com a resolução de cada um.',
  practiceHeading: 'Exercícios: Contabilidade Financeira',
  keywords: ['exercícios contabilidade financeira', 'contabilidade financeira exame', 'SNC', 'depreciações', 'CMVMC'],
  related: ['microeconomia-perguntas-de-exame', 'macroeconomia-perguntas-de-exame'],
  items: [
    {
      q: 'Qual é a equação fundamental da contabilidade?',
      right: 'Ativo = Passivo + Capital Próprio',
      wrong: ['Ativo + Passivo = Capital Próprio', 'Rendimentos = Gastos + Ativo', 'Capital Próprio = Ativo + Passivo'],
      why: 'Tudo o que a entidade controla (ativo) é financiado por terceiros (passivo) ou pelos sócios (capital próprio).',
    },
    {
      q: 'Uma compra de mercadorias a crédito:',
      right: 'Aumenta os inventários (ativo) e aumenta a dívida a fornecedores (passivo)',
      wrong: ['Diminui o ativo e aumenta o passivo', 'Aumenta o ativo e o capital próprio', 'Não altera o balanço'],
      why: 'Débito em Compras/Mercadorias e crédito em Fornecedores. O balanço continua equilibrado: ativo e passivo sobem o mesmo valor.',
    },
    {
      q: 'Um equipamento custa 10 000 €, tem vida útil de 5 anos e valor residual nulo. Qual é a depreciação anual pelo método linear?',
      right: '2 000 €',
      wrong: ['5 000 €', '1 000 €', '2 500 €'],
      why: 'Depreciação = (custo − valor residual) / vida útil = (10 000 − 0) / 5 = 2 000 € por ano.',
    },
    {
      q: 'Segundo o regime do acréscimo (periodização económica):',
      right: 'Rendimentos e gastos reconhecem-se quando ocorrem, independentemente do recebimento ou pagamento',
      wrong: [
        'Só se reconhece um gasto quando é pago',
        'Só se reconhece um rendimento quando é recebido',
        'Rendimentos e gastos reconhecem-se no fim do ano seguinte',
      ],
      why: 'É um dos pressupostos da estrutura conceptual do SNC. Por exemplo, a renda de dezembro paga em janeiro é gasto de dezembro.',
    },
    {
      q: 'No código de contas do SNC, a classe 6 corresponde a:',
      right: 'Gastos',
      wrong: ['Rendimentos', 'Inventários', 'Capital, reservas e resultados transitados'],
      why: 'Classe 6 — Gastos; classe 7 — Rendimentos; classe 3 — Inventários e ativos biológicos; classe 5 — Capital, reservas e resultados transitados.',
    },
    {
      q: 'Que demonstração financeira apresenta os rendimentos e gastos de um período?',
      right: 'A demonstração dos resultados',
      wrong: ['O balanço', 'A demonstração dos fluxos de caixa', 'O anexo'],
      why: 'A demonstração dos resultados mostra o desempenho do período. O balanço mostra a posição financeira numa data.',
    },
    {
      q: 'Em que classe do SNC se encontra a conta Clientes?',
      right: 'Classe 2 — Contas a receber e a pagar',
      wrong: ['Classe 1 — Meios financeiros líquidos', 'Classe 4 — Investimentos', 'Classe 7 — Rendimentos'],
      why: 'A conta 21 Clientes está na classe 2, tal como a 22 Fornecedores e a 24 Estado e outros entes públicos.',
    },
    {
      q: 'O pagamento de uma dívida a um fornecedor por transferência bancária:',
      right: 'Diminui o ativo e diminui o passivo',
      wrong: ['Diminui o ativo e aumenta o passivo', 'Aumenta o ativo e diminui o passivo', 'Diminui o capital próprio'],
      why: 'Débito em Fornecedores (o passivo diminui) e crédito em Depósitos à ordem (o ativo diminui). Não há gasto: a dívida já estava registada.',
    },
    {
      q: 'Uma empresa tem ativo de 120 000 € e capital próprio de 50 000 €. Qual é o passivo?',
      right: '70 000 €',
      wrong: ['170 000 €', '50 000 €', '2,4'],
      why: 'Pela equação fundamental: Passivo = Ativo − Capital Próprio = 120 000 − 50 000 = 70 000 €.',
    },
    {
      q: 'Inventário inicial 5 000 €, compras 20 000 €, inventário final 4 000 €. Qual é o CMVMC?',
      right: '21 000 €',
      wrong: ['29 000 €', '19 000 €', '25 000 €'],
      why: 'CMVMC = Inventário inicial + Compras − Inventário final = 5 000 + 20 000 − 4 000 = 21 000 €.',
    },
  ],
  howTo: {
    h2: 'Como estudar Contabilidade Financeira',
    paragraphs: [
      'Antes de decorar contas, garante que percebes a equação fundamental e o efeito de cada operação no balanço. Para cada lançamento, pergunta: que conta é debitada, qual é creditada, e o ativo, passivo ou capital próprio sobem ou descem?',
      'Tem o código de contas do SNC à mão enquanto resolves exercícios. Com o tempo vais saber as classes e as contas mais usadas sem consultar.',
      'Treina as operações de fim de período, que valem mais pontos: depreciações, acréscimos e diferimentos, imparidades e o apuramento do CMVMC e do resultado.',
    ],
  },
  faqs: [
    {
      q: 'Qual a diferença entre gasto e pagamento?',
      a: 'Um gasto reconhece-se quando ocorre (regime do acréscimo). O pagamento é a saída de dinheiro, que pode acontecer antes, ao mesmo tempo ou depois do gasto.',
    },
    {
      q: 'O que é o CMVMC?',
      a: 'É o custo das mercadorias vendidas e das matérias consumidas: inventário inicial + compras − inventário final. Entra na demonstração dos resultados como gasto.',
    },
  ],
};
