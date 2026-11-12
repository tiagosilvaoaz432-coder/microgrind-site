/**
 * Practice pages — Estatística e Matemática (worked solutions in `why`).
 * Normal table values used: Φ(0,5)=0,6915 · Φ(1)=0,8413 · Φ(1,5)=0,9332 · Φ(1,645)=0,95 · Φ(1,96)=0,975 · Φ(2)=0,9772.
 */

export const normal = {
  slug: 'distribuicao-normal-exercicios-resolvidos',
  area: 'matematica',
  mode: 'quiz',
  subject: 'Distribuição normal (Estatística)',
  level: 'Ensino superior',
  kicker: 'Estatística',
  title: 'Distribuição normal: 10 exercícios resolvidos passo a passo | MicroGrind',
  description: 'Exercícios resolvidos de distribuição normal: padronização, probabilidades, percentis e média amostral. Escolhe a resposta e vê a resolução.',
  h1: 'Exercícios de distribuição normal resolvidos',
  lede: 'Dez exercícios de escolha múltipla sobre a distribuição normal. Em cada um, escolhe a resposta e abre a resolução passo a passo.',
  practiceHeading: 'Exercícios: distribuição normal',
  keywords: ['distribuição normal exercícios resolvidos', 'exercícios distribuição normal', 'padronização z', 'tabela normal', 'estatística exame'],
  related: ['testes-de-hipoteses-exercicios', 'calculo-limites-e-derivadas'],
  items: [
    {
      q: 'X ~ N(100; 15²). Qual é P(X < 115)?',
      right: '0,8413',
      wrong: ['0,1587', '0,6826', '0,9772'],
      why: 'Padroniza: z = (115 − 100) / 15 = 1. Pela tabela, P(Z < 1) = Φ(1) = 0,8413.',
    },
    {
      q: 'X ~ N(100; 15²). Qual é P(85 < X < 115)?',
      right: '0,6826',
      wrong: ['0,8413', '0,9544', '0,3413'],
      why: 'z₁ = (85 − 100) / 15 = −1 e z₂ = 1. P(−1 < Z < 1) = Φ(1) − Φ(−1) = 0,8413 − 0,1587 = 0,6826. É a regra dos 68%.',
    },
    {
      q: 'As notas de um exame seguem N(12; 2²). Qual a probabilidade de um aluno ter mais de 16 valores?',
      right: '0,0228',
      wrong: ['0,9772', '0,0456', '0,1587'],
      why: 'z = (16 − 12) / 2 = 2. P(Z > 2) = 1 − Φ(2) = 1 − 0,9772 = 0,0228.',
    },
    {
      q: 'Se Z ~ N(0; 1), quanto vale P(−1,96 < Z < 1,96)?',
      right: '0,95',
      wrong: ['0,975', '0,90', '0,99'],
      why: 'P(−1,96 < Z < 1,96) = Φ(1,96) − Φ(−1,96) = 0,975 − 0,025 = 0,95. É o valor usado nos intervalos de confiança a 95%.',
    },
    {
      q: 'X ~ N(50; 10²). Qual é o percentil 95 de X?',
      right: '66,45',
      wrong: ['69,6', '60', '83,5'],
      why: 'O percentil 95 da normal padrão é z = 1,645. Logo x = μ + z·σ = 50 + 1,645 × 10 = 66,45.',
    },
    {
      q: 'X ~ N(10; 4), onde 4 é a variância. Qual é o desvio-padrão de Y = 3X + 2?',
      right: '6',
      wrong: ['12', '36', '8'],
      why: 'Var(Y) = 3² × Var(X) = 9 × 4 = 36, logo σ_Y = 6. A constante 2 só desloca a média: E(Y) = 3 × 10 + 2 = 32. Y ~ N(32; 36).',
    },
    {
      q: 'X ~ N(70; 12²). Para uma amostra aleatória de n = 36, qual é P(X̄ > 72)?',
      right: '0,1587',
      wrong: ['0,4338', '0,8413', '0,0228'],
      why: 'A média amostral segue N(70; (12/√36)²) = N(70; 2²). z = (72 − 70) / 2 = 1. P(Z > 1) = 1 − 0,8413 = 0,1587.',
    },
    {
      q: 'Se Z ~ N(0; 1), quanto vale P(Z < −0,5)?',
      right: '0,3085',
      wrong: ['0,6915', '0,1915', '0,5'],
      why: 'Por simetria, P(Z < −0,5) = 1 − Φ(0,5) = 1 − 0,6915 = 0,3085.',
    },
    {
      q: 'Numa distribuição normal, qual destas afirmações é verdadeira?',
      right: 'A média, a mediana e a moda coincidem',
      wrong: ['A média é sempre maior do que a mediana', 'A distribuição é assimétrica à direita', 'A variância é sempre igual a 1'],
      why: 'A normal é simétrica em torno de μ, por isso média, mediana e moda são iguais. A variância só é 1 na normal padrão.',
    },
    {
      q: 'A altura numa população segue N(170; 8²) cm. Qual é P(158 < X < 182)?',
      right: '0,8664',
      wrong: ['0,9332', '0,6826', '0,7745'],
      why: 'z₁ = (158 − 170) / 8 = −1,5 e z₂ = (182 − 170) / 8 = 1,5. P = Φ(1,5) − Φ(−1,5) = 0,9332 − 0,0668 = 0,8664.',
    },
  ],
  howTo: {
    h2: 'Como resolver exercícios de distribuição normal',
    paragraphs: [
      'Quase todos os exercícios seguem três passos: identificar μ e σ (atenção se o enunciado dá a variância), padronizar com z = (x − μ) / σ e ler a probabilidade na tabela da normal padrão.',
      'Desenha sempre a curva e sombreia a área pedida. Ajuda a decidir se precisas de Φ(z), de 1 − Φ(z) ou de uma diferença Φ(z₂) − Φ(z₁), e evita erros de sinal com valores negativos de z.',
      'Treina também o caminho inverso (dado um percentil, encontrar x = μ + z·σ) e a distribuição da média amostral, com desvio-padrão σ/√n. São as duas variações que mais aparecem em exame.',
    ],
  },
  faqs: [
    {
      q: 'Como se padroniza uma variável normal?',
      a: 'Subtrai a média e divide pelo desvio-padrão: z = (x − μ) / σ. A variável Z resultante segue a normal padrão N(0; 1), cujas probabilidades estão tabeladas.',
    },
    {
      q: 'O que é a regra 68–95–99,7?',
      a: 'Numa distribuição normal, cerca de 68% dos valores estão a menos de 1 desvio-padrão da média, 95% a menos de 2 e 99,7% a menos de 3.',
    },
  ],
};

export const hipoteses = {
  slug: 'testes-de-hipoteses-exercicios',
  area: 'matematica',
  mode: 'quiz',
  subject: 'Testes de hipóteses (Estatística)',
  level: 'Ensino superior',
  kicker: 'Estatística',
  title: 'Testes de hipóteses: 10 exercícios resolvidos | MicroGrind',
  description: 'Erros do tipo I e II, p-valor, estatística de teste, valores críticos e potência. 10 exercícios de testes de hipóteses com resolução.',
  h1: 'Exercícios de testes de hipóteses',
  lede: 'Dez perguntas de escolha múltipla sobre testes de hipóteses, dos conceitos ao cálculo da estatística de teste, com resolução em cada uma.',
  practiceHeading: 'Exercícios: testes de hipóteses',
  keywords: ['testes de hipóteses exercícios', 'p-valor', 'erro tipo I', 'estatística de teste', 'exame estatística'],
  related: ['distribuicao-normal-exercicios-resolvidos', 'calculo-limites-e-derivadas'],
  items: [
    {
      q: 'O que é um erro do tipo I?',
      right: 'Rejeitar H₀ quando H₀ é verdadeira',
      wrong: ['Não rejeitar H₀ quando H₀ é falsa', 'Rejeitar H₁ quando H₁ é verdadeira', 'Usar a estatística de teste errada'],
      why: 'O erro do tipo I é um falso positivo. Não rejeitar H₀ quando é falsa é o erro do tipo II.',
    },
    {
      q: 'O nível de significância α é:',
      right: 'A probabilidade de cometer um erro do tipo I',
      wrong: ['A probabilidade de H₀ ser verdadeira', 'A probabilidade de cometer um erro do tipo II', 'A potência do teste'],
      why: 'α = P(rejeitar H₀ | H₀ verdadeira). É fixado antes de recolher os dados, tipicamente 5% ou 1%.',
    },
    {
      q: 'Num teste com α = 0,05 obtém-se p-valor = 0,03. Qual é a decisão?',
      right: 'Rejeitar H₀',
      wrong: ['Não rejeitar H₀', 'Aceitar H₀ como verdadeira', 'Não é possível decidir sem a amostra'],
      why: 'Rejeita-se H₀ sempre que p-valor ≤ α. Como 0,03 ≤ 0,05, rejeita-se H₀ ao nível de 5%.',
    },
    {
      q: 'O p-valor é:',
      right: 'A probabilidade, supondo H₀ verdadeira, de obter um resultado tão ou mais extremo do que o observado',
      wrong: ['A probabilidade de H₀ ser verdadeira', 'A probabilidade de H₁ ser verdadeira', 'O nível de significância escolhido'],
      why: 'O p-valor mede a compatibilidade dos dados com H₀. Não é a probabilidade de a hipótese ser verdadeira: esta é a confusão mais frequente em exame.',
    },
    {
      q: 'H₀: μ = 50 vs H₁: μ ≠ 50, com σ = 10 conhecido, n = 25 e x̄ = 54. Qual é a decisão a α = 0,05?',
      right: 'z = 2; rejeitar H₀',
      wrong: ['z = 0,4; não rejeitar H₀', 'z = 2; não rejeitar H₀', 'z = 10; rejeitar H₀'],
      why: 'z = (54 − 50) / (10/√25) = 4 / 2 = 2. No teste bilateral a 5%, o valor crítico é 1,96. Como |2| > 1,96, rejeita-se H₀.',
    },
    {
      q: 'Com os mesmos dados (z = 2), qual é a decisão a α = 0,01, teste bilateral?',
      right: 'Não rejeitar H₀',
      wrong: ['Rejeitar H₀', 'Aceitar H₁', 'Mudar para teste unilateral'],
      why: 'A 1% bilateral, o valor crítico é 2,576. Como |2| < 2,576, não se rejeita H₀. Mudar de teste depois de ver os dados não é válido.',
    },
    {
      q: 'A potência de um teste é:',
      right: 'A probabilidade de rejeitar H₀ quando H₁ é verdadeira',
      wrong: ['A probabilidade de rejeitar H₀ quando H₀ é verdadeira', 'O complementar de α', 'A probabilidade de não rejeitar H₀'],
      why: 'Potência = 1 − β, em que β é a probabilidade de erro do tipo II.',
    },
    {
      q: 'Para testar a média de uma população normal com σ desconhecido e amostra pequena, usa-se:',
      right: 'A distribuição t de Student com n − 1 graus de liberdade',
      wrong: ['A distribuição normal padrão, sempre', 'A distribuição qui-quadrado', 'A distribuição F'],
      why: 'Estima-se σ pelo desvio-padrão amostral s e a estatística (x̄ − μ₀) / (s/√n) segue t com n − 1 graus de liberdade.',
    },
    {
      q: 'Num teste unilateral à direita com α = 0,05 e estatística normal, qual é o valor crítico?',
      right: '1,645',
      wrong: ['1,96', '2,326', '1,282'],
      why: 'Procura-se z tal que P(Z > z) = 0,05, isto é, Φ(z) = 0,95: z = 1,645. O 1,96 é o valor bilateral a 5%.',
    },
    {
      q: 'Mantendo α, o que acontece à potência quando a dimensão da amostra aumenta?',
      right: 'Aumenta',
      wrong: ['Diminui', 'Não se altera', 'Passa a ser igual a α'],
      why: 'Com n maior, o erro-padrão σ/√n diminui e é mais fácil detetar uma diferença real: β diminui e a potência 1 − β aumenta.',
    },
  ],
  howTo: {
    h2: 'Como estudar testes de hipóteses',
    paragraphs: [
      'Segue sempre a mesma estrutura: formular H₀ e H₁, escolher a estatística de teste e a sua distribuição, calcular o valor observado, e decidir pelo valor crítico ou pelo p-valor. Escrever os passos garante cotação mesmo quando há erros de conta.',
      'Decora poucos valores críticos e sabe de onde vêm: 1,645 (unilateral 5%), 1,96 (bilateral 5%), 2,326 (unilateral 1%) e 2,576 (bilateral 1%).',
      'Nas perguntas teóricas, o que mais se testa é a interpretação: o que é o p-valor, o que significa não rejeitar H₀ e como α, β, potência e n se relacionam.',
    ],
  },
  faqs: [
    {
      q: 'Não rejeitar H₀ é o mesmo que aceitar H₀?',
      a: 'Não. Significa que os dados não dão evidência suficiente contra H₀ ao nível escolhido. H₀ pode continuar a ser falsa (erro do tipo II).',
    },
    {
      q: 'Quando uso z e quando uso t?',
      a: 'Usa z quando σ é conhecido (ou a amostra é grande). Usa t de Student quando σ é desconhecido e a população é aproximadamente normal, sobretudo em amostras pequenas.',
    },
  ],
};

export const calculo = {
  slug: 'calculo-limites-e-derivadas',
  area: 'matematica',
  mode: 'quiz',
  subject: 'Cálculo (limites e derivadas)',
  level: 'Ensino secundário e superior',
  kicker: 'Cálculo',
  title: 'Limites e derivadas: 10 exercícios resolvidos | MicroGrind',
  description: 'Exercícios resolvidos de limites e derivadas: indeterminações, limites notáveis, regra da cadeia, produto, extremos e reta tangente.',
  h1: 'Exercícios de limites e derivadas resolvidos',
  lede: 'Dez exercícios de escolha múltipla de cálculo diferencial. Escolhe a resposta e abre a resolução para ver o raciocínio completo.',
  practiceHeading: 'Exercícios: limites e derivadas',
  keywords: ['exercícios limites resolvidos', 'exercícios derivadas resolvidos', 'regra da cadeia', 'limites notáveis', 'cálculo exame'],
  related: ['distribuicao-normal-exercicios-resolvidos', 'testes-de-hipoteses-exercicios'],
  items: [
    {
      q: 'Calcula lim (x→2) de (x² − 4) / (x − 2).',
      right: '4',
      wrong: ['0', '2', 'Não existe'],
      why: 'Substituir dá 0/0. Fatoriza: (x² − 4) = (x − 2)(x + 2). Simplificando, fica lim (x→2) (x + 2) = 4.',
    },
    {
      q: 'Quanto vale lim (x→0) de sen(x) / x?',
      right: '1',
      wrong: ['0', '+∞', 'Não existe'],
      why: 'É um limite notável. Pode justificar-se pelo teorema das funções enquadradas ou pela derivada de sen(x) em 0, que é cos(0) = 1.',
    },
    {
      q: 'Calcula lim (x→+∞) de (3x² + 1) / (x² − 5).',
      right: '3',
      wrong: ['0', '+∞', '−1/5'],
      why: 'Divide numerador e denominador por x²: (3 + 1/x²) / (1 − 5/x²) → 3/1 = 3. Com graus iguais, o limite é o quociente dos coeficientes de maior grau.',
    },
    {
      q: 'Qual é a derivada de f(x) = x³?',
      right: '3x²',
      wrong: ['x²', '3x³', 'x⁴/4'],
      why: 'Regra da potência: (xⁿ)′ = n·xⁿ⁻¹. Com n = 3, f′(x) = 3x². x⁴/4 é uma primitiva, não a derivada.',
    },
    {
      q: 'Qual é a derivada de f(x) = e^(2x)?',
      right: '2e^(2x)',
      wrong: ['e^(2x)', '2x·e^(2x−1)', 'e^(2x)/2'],
      why: 'Regra da cadeia: (e^u)′ = u′·e^u. Com u = 2x, u′ = 2, logo f′(x) = 2e^(2x).',
    },
    {
      q: 'Qual é a derivada de f(x) = ln(x² + 1)?',
      right: '2x / (x² + 1)',
      wrong: ['1 / (x² + 1)', '2x·ln(x² + 1)', '1 / (2x)'],
      why: '(ln u)′ = u′/u. Com u = x² + 1, u′ = 2x, logo f′(x) = 2x / (x² + 1).',
    },
    {
      q: 'Qual é a derivada de f(x) = x·sen(x)?',
      right: 'sen(x) + x·cos(x)',
      wrong: ['cos(x)', 'x·cos(x)', 'sen(x) − x·cos(x)'],
      why: 'Regra do produto: (u·v)′ = u′v + uv′. Com u = x e v = sen(x): 1·sen(x) + x·cos(x).',
    },
    {
      q: 'f(x) = x² − 4x + 1. Em que ponto f tem um mínimo?',
      right: 'x = 2',
      wrong: ['x = −2', 'x = 4', 'x = 1'],
      why: 'f′(x) = 2x − 4 = 0 ⇔ x = 2. Como f″(x) = 2 > 0, é um mínimo. O valor mínimo é f(2) = 4 − 8 + 1 = −3.',
    },
    {
      q: 'Qual é a equação da reta tangente ao gráfico de y = x² no ponto de abcissa 1?',
      right: 'y = 2x − 1',
      wrong: ['y = 2x + 1', 'y = x', 'y = 2x'],
      why: 'Declive: y′ = 2x, em x = 1 dá 2. Ponto: (1, 1). Reta: y − 1 = 2(x − 1) ⇔ y = 2x − 1.',
    },
    {
      q: 'Quanto vale lim (x→0) de (1 + x)^(1/x)?',
      right: 'e',
      wrong: ['1', '0', '+∞'],
      why: 'É um limite notável que define o número de Neper: lim (x→0) (1 + x)^(1/x) = e ≈ 2,718. É uma indeterminação do tipo 1^∞.',
    },
  ],
  howTo: {
    h2: 'Como estudar limites e derivadas para o exame',
    paragraphs: [
      'Nos limites, começa sempre por substituir. Se der uma indeterminação (0/0, ∞/∞, ∞ − ∞, 1^∞), escolhe a técnica: fatorizar, dividir pelo termo de maior grau, multiplicar pelo conjugado ou recorrer a um limite notável.',
      'Nas derivadas, domina as regras base (potência, produto, quociente) e sobretudo a regra da cadeia, que aparece em quase todos os exercícios com exponenciais, logaritmos e funções trigonométricas.',
      'Termina com aplicações: monotonia e extremos (estudo do sinal de f′), concavidades (f″) e reta tangente. São as perguntas com mais cotação nos testes.',
    ],
  },
  faqs: [
    {
      q: 'O que é a regra da cadeia?',
      a: 'É a regra para derivar funções compostas: (f(g(x)))′ = f′(g(x))·g′(x). Por exemplo, a derivada de sen(3x) é 3cos(3x).',
    },
    {
      q: 'Quais são os limites notáveis mais usados?',
      a: 'lim (x→0) sen(x)/x = 1, lim (x→0) (eˣ − 1)/x = 1, lim (x→0) ln(1 + x)/x = 1 e lim (x→+∞) (1 + 1/x)ˣ = e.',
    },
  ],
};
