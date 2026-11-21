/**
 * English versions of the Portuguese practice pages in ../practice/matematica.mjs
 * (`normal`, `hipoteses`, `calculo`), with worked solutions in `why`.
 * Normal table values used: Φ(0.5)=0.6915 · Φ(1)=0.8413 · Φ(1.5)=0.9332 · Φ(1.645)=0.95 · Φ(1.96)=0.975 · Φ(2)=0.9772.
 */

export const normalDistribution = {
  slug: 'normal-distribution-practice-problems',
  ptSlug: 'distribuicao-normal-exercicios-resolvidos',
  area: 'statistics',
  mode: 'quiz',
  subject: 'Normal distribution (Statistics)',
  level: 'Higher education',
  kicker: 'Statistics',
  title: 'Normal distribution: 10 practice problems | MicroGrind',
  description: 'Normal distribution practice problems with worked solutions: z-scores, probabilities, percentiles and the sample mean. Pick an answer, see the steps.',
  h1: 'Normal distribution practice problems with solutions',
  lede: 'Ten multiple-choice problems on the normal distribution. For each one, pick an answer and open the step-by-step solution.',
  practiceHeading: 'Practice problems: normal distribution',
  keywords: ['normal distribution practice problems', 'normal distribution worked examples', 'z score practice', 'standard normal table', 'statistics exam questions'],
  related: ['hypothesis-testing-practice-problems', 'limits-and-derivatives-practice-problems'],
  items: [
    {
      q: 'X ~ N(100, 15²). What is P(X < 115)?',
      right: '0.8413',
      wrong: ['0.1587', '0.6826', '0.9772'],
      why: 'Standardise: z = (115 − 100) / 15 = 1. From the table, P(Z < 1) = Φ(1) = 0.8413.',
    },
    {
      q: 'X ~ N(100, 15²). What is P(85 < X < 115)?',
      right: '0.6826',
      wrong: ['0.8413', '0.9544', '0.3413'],
      why: 'z₁ = (85 − 100) / 15 = −1 and z₂ = 1. P(−1 < Z < 1) = Φ(1) − Φ(−1) = 0.8413 − 0.1587 = 0.6826. This is the 68% rule.',
    },
    {
      q: 'Scores on an exam marked out of 100 follow N(60, 10²). What is the probability that a student scores more than 80 marks?',
      right: '0.0228',
      wrong: ['0.9772', '0.0456', '0.1587'],
      why: 'z = (80 − 60) / 10 = 2. P(Z > 2) = 1 − Φ(2) = 1 − 0.9772 = 0.0228.',
    },
    {
      q: 'If Z ~ N(0, 1), what is P(−1.96 < Z < 1.96)?',
      right: '0.95',
      wrong: ['0.975', '0.90', '0.99'],
      why: 'P(−1.96 < Z < 1.96) = Φ(1.96) − Φ(−1.96) = 0.975 − 0.025 = 0.95. This is the value used for 95% confidence intervals.',
    },
    {
      q: 'X ~ N(50, 10²). What is the 95th percentile of X?',
      right: '66.45',
      wrong: ['69.6', '60', '83.5'],
      why: 'The 95th percentile of the standard normal is z = 1.645. So x = μ + z·σ = 50 + 1.645 × 10 = 66.45.',
    },
    {
      q: 'X ~ N(10, 4), where 4 is the variance. What is the standard deviation of Y = 3X + 2?',
      right: '6',
      wrong: ['12', '36', '8'],
      why: 'Var(Y) = 3² × Var(X) = 9 × 4 = 36, so σ_Y = 6. The constant 2 only shifts the mean: E(Y) = 3 × 10 + 2 = 32. Y ~ N(32, 36).',
    },
    {
      q: 'X ~ N(70, 12²). For a random sample of n = 36, what is P(X̄ > 72)?',
      right: '0.1587',
      wrong: ['0.4338', '0.8413', '0.0228'],
      why: 'The sample mean follows N(70, (12/√36)²) = N(70, 2²). z = (72 − 70) / 2 = 1. P(Z > 1) = 1 − 0.8413 = 0.1587.',
    },
    {
      q: 'If Z ~ N(0, 1), what is P(Z < −0.5)?',
      right: '0.3085',
      wrong: ['0.6915', '0.1915', '0.5'],
      why: 'By symmetry, P(Z < −0.5) = 1 − Φ(0.5) = 1 − 0.6915 = 0.3085.',
    },
    {
      q: 'Which of these statements is true of a normal distribution?',
      right: 'The mean, median and mode are equal',
      wrong: ['The mean is always greater than the median', 'The distribution is skewed to the right', 'The variance is always 1'],
      why: 'The normal distribution is symmetric about μ, so the mean, median and mode are equal. The variance is 1 only for the standard normal.',
    },
    {
      q: 'Height in a population follows N(170, 8²) cm. What is P(158 < X < 182)?',
      right: '0.8664',
      wrong: ['0.9332', '0.6826', '0.7745'],
      why: 'z₁ = (158 − 170) / 8 = −1.5 and z₂ = (182 − 170) / 8 = 1.5. P = Φ(1.5) − Φ(−1.5) = 0.9332 − 0.0668 = 0.8664.',
    },
  ],
  howTo: {
    h2: 'How to solve normal distribution problems',
    paragraphs: [
      'Almost every problem follows three steps: identify μ and σ (watch out if the question gives the variance), standardise with z = (x − μ) / σ, and read the probability from the standard normal table.',
      'Always sketch the curve and shade the area you need. It helps you decide whether you need Φ(z), 1 − Φ(z) or a difference Φ(z₂) − Φ(z₁), and it avoids sign errors with negative values of z.',
      'Also practise the reverse problem (given a percentile, find x = μ + z·σ) and the distribution of the sample mean, with standard deviation σ/√n. These are the two variations that come up most often in exams.',
    ],
  },
  faqs: [
    {
      q: 'How do you standardise a normal variable?',
      a: 'Subtract the mean and divide by the standard deviation: z = (x − μ) / σ. The resulting variable Z follows the standard normal distribution N(0, 1), whose probabilities are tabulated.',
    },
    {
      q: 'What is the 68–95–99.7 rule?',
      a: 'In a normal distribution, about 68% of values lie within 1 standard deviation of the mean, 95% within 2 and 99.7% within 3.',
    },
  ],
};

export const hypothesisTesting = {
  slug: 'hypothesis-testing-practice-problems',
  ptSlug: 'testes-de-hipoteses-exercicios',
  area: 'statistics',
  mode: 'quiz',
  subject: 'Hypothesis testing (Statistics)',
  level: 'Higher education',
  kicker: 'Statistics',
  title: 'Hypothesis testing: 10 practice problems | MicroGrind',
  description: 'Type I and II errors, p-values, test statistics, critical values and power: 10 hypothesis testing practice problems, each with a worked solution.',
  h1: 'Hypothesis testing practice problems',
  lede: 'Ten multiple-choice questions on hypothesis testing, from the key concepts to calculating the test statistic, each with a worked solution.',
  practiceHeading: 'Practice problems: hypothesis testing',
  keywords: ['hypothesis testing practice problems', 'p value practice questions', 'type I and type II errors', 'test statistic', 'statistics exam questions'],
  related: ['normal-distribution-practice-problems', 'limits-and-derivatives-practice-problems'],
  items: [
    {
      q: 'What is a Type I error?',
      right: 'Rejecting H₀ when H₀ is true',
      wrong: ['Failing to reject H₀ when H₀ is false', 'Rejecting H₁ when H₁ is true', 'Using the wrong test statistic'],
      why: 'A Type I error is a false positive. Failing to reject H₀ when it is false is a Type II error.',
    },
    {
      q: 'The significance level α is:',
      right: 'The probability of making a Type I error',
      wrong: ['The probability that H₀ is true', 'The probability of making a Type II error', 'The power of the test'],
      why: 'α = P(reject H₀ | H₀ true). It is set before the data are collected, typically at 5% or 1%.',
    },
    {
      q: 'A test with α = 0.05 gives a p-value of 0.03. What is the decision?',
      right: 'Reject H₀',
      wrong: ['Do not reject H₀', 'Accept H₀ as true', 'You cannot decide without the sample'],
      why: 'Reject H₀ whenever p-value ≤ α. Since 0.03 ≤ 0.05, H₀ is rejected at the 5% level.',
    },
    {
      q: 'The p-value is:',
      right: 'The probability, assuming H₀ is true, of getting a result at least as extreme as the one observed',
      wrong: ['The probability that H₀ is true', 'The probability that H₁ is true', 'The chosen significance level'],
      why: 'The p-value measures how compatible the data are with H₀. It is not the probability that the hypothesis is true: this is the most common mix-up in exams.',
    },
    {
      q: 'H₀: μ = 50 vs H₁: μ ≠ 50, with known σ = 10, n = 25 and x̄ = 54. What is the decision at α = 0.05?',
      right: 'z = 2; reject H₀',
      wrong: ['z = 0.4; do not reject H₀', 'z = 2; do not reject H₀', 'z = 10; reject H₀'],
      why: 'z = (54 − 50) / (10/√25) = 4 / 2 = 2. For a two-tailed test at 5%, the critical value is 1.96. Since |2| > 1.96, H₀ is rejected.',
    },
    {
      q: 'With the same data (z = 2), what is the decision at α = 0.01, two-tailed?',
      right: 'Do not reject H₀',
      wrong: ['Reject H₀', 'Accept H₁', 'Switch to a one-tailed test'],
      why: 'At 1% two-tailed, the critical value is 2.576. Since |2| < 2.576, H₀ is not rejected. Switching tests after seeing the data is not valid.',
    },
    {
      q: 'The power of a test is:',
      right: 'The probability of rejecting H₀ when H₁ is true',
      wrong: ['The probability of rejecting H₀ when H₀ is true', 'The complement of α', 'The probability of not rejecting H₀'],
      why: 'Power = 1 − β, where β is the probability of a Type II error.',
    },
    {
      q: 'To test the mean of a normal population with unknown σ and a small sample, you use:',
      right: 'Student’s t distribution with n − 1 degrees of freedom',
      wrong: ['The standard normal distribution, always', 'The chi-square distribution', 'The F distribution'],
      why: 'σ is estimated by the sample standard deviation s, and the statistic (x̄ − μ₀) / (s/√n) follows a t distribution with n − 1 degrees of freedom.',
    },
    {
      q: 'In a right-tailed test with α = 0.05 and a normal test statistic, what is the critical value?',
      right: '1.645',
      wrong: ['1.96', '2.326', '1.282'],
      why: 'Find z such that P(Z > z) = 0.05, that is, Φ(z) = 0.95: z = 1.645. 1.96 is the two-tailed value at 5%.',
    },
    {
      q: 'Keeping α fixed, what happens to the power when the sample size increases?',
      right: 'It increases',
      wrong: ['It decreases', 'It does not change', 'It becomes equal to α'],
      why: 'With a larger n, the standard error σ/√n gets smaller and a real difference is easier to detect: β falls and the power 1 − β rises.',
    },
  ],
  howTo: {
    h2: 'How to study hypothesis testing',
    paragraphs: [
      'Always follow the same structure: state H₀ and H₁, choose the test statistic and its distribution, calculate the observed value, and decide using the critical value or the p-value. Writing out the steps earns method marks even if you make an arithmetic slip.',
      'Memorise just a few critical values and know where they come from: 1.645 (one-tailed 5%), 1.96 (two-tailed 5%), 2.326 (one-tailed 1%) and 2.576 (two-tailed 1%).',
      'In theory questions, interpretation is what gets tested most: what the p-value is, what failing to reject H₀ means, and how α, β, power and n are related.',
    ],
  },
  faqs: [
    {
      q: 'Is failing to reject H₀ the same as accepting H₀?',
      a: 'No. It means the data do not give enough evidence against H₀ at the chosen level. H₀ may still be false (a Type II error).',
    },
    {
      q: 'When do I use z and when do I use t?',
      a: 'Use z when σ is known (or the sample is large). Use Student’s t when σ is unknown and the population is approximately normal, especially with small samples.',
    },
  ],
};

export const limitsDerivatives = {
  slug: 'limits-and-derivatives-practice-problems',
  ptSlug: 'calculo-limites-e-derivadas',
  area: 'statistics',
  mode: 'quiz',
  subject: 'Calculus (limits and derivatives)',
  level: 'Higher education',
  kicker: 'Calculus',
  title: 'Limits and derivatives: 10 practice problems | MicroGrind',
  description: 'Limits and derivatives practice problems with worked solutions: indeterminate forms, standard limits, chain and product rules, extrema and tangent lines.',
  h1: 'Limits and derivatives practice problems with solutions',
  lede: 'Ten multiple-choice problems in differential calculus. Pick an answer and open the solution to see the full reasoning.',
  practiceHeading: 'Practice problems: limits and derivatives',
  keywords: ['limits practice problems', 'derivatives practice problems', 'chain rule practice', 'standard limits', 'calculus exam questions'],
  related: ['normal-distribution-practice-problems', 'hypothesis-testing-practice-problems'],
  items: [
    {
      q: 'Find lim (x→2) of (x² − 4) / (x − 2).',
      right: '4',
      wrong: ['0', '2', 'Does not exist'],
      why: 'Substituting gives 0/0. Factorise: (x² − 4) = (x − 2)(x + 2). After cancelling, this becomes lim (x→2) (x + 2) = 4.',
    },
    {
      q: 'What is lim (x→0) of sin(x) / x?',
      right: '1',
      wrong: ['0', '+∞', 'Does not exist'],
      why: 'This is a standard limit. It can be justified with the squeeze theorem or as the derivative of sin(x) at 0, which is cos(0) = 1.',
    },
    {
      q: 'Find lim (x→+∞) of (3x² + 1) / (x² − 5).',
      right: '3',
      wrong: ['0', '+∞', '−1/5'],
      why: 'Divide the numerator and denominator by x²: (3 + 1/x²) / (1 − 5/x²) → 3/1 = 3. When the degrees are equal, the limit is the ratio of the leading coefficients.',
    },
    {
      q: 'What is the derivative of f(x) = x³?',
      right: '3x²',
      wrong: ['x²', '3x³', 'x⁴/4'],
      why: 'Power rule: (xⁿ)′ = n·xⁿ⁻¹. With n = 3, f′(x) = 3x². x⁴/4 is an antiderivative, not the derivative.',
    },
    {
      q: 'What is the derivative of f(x) = e^(2x)?',
      right: '2e^(2x)',
      wrong: ['e^(2x)', '2x·e^(2x−1)', 'e^(2x)/2'],
      why: 'Chain rule: (e^u)′ = u′·e^u. With u = 2x, u′ = 2, so f′(x) = 2e^(2x).',
    },
    {
      q: 'What is the derivative of f(x) = ln(x² + 1)?',
      right: '2x / (x² + 1)',
      wrong: ['1 / (x² + 1)', '2x·ln(x² + 1)', '1 / (2x)'],
      why: '(ln u)′ = u′/u. With u = x² + 1, u′ = 2x, so f′(x) = 2x / (x² + 1).',
    },
    {
      q: 'What is the derivative of f(x) = x·sin(x)?',
      right: 'sin(x) + x·cos(x)',
      wrong: ['cos(x)', 'x·cos(x)', 'sin(x) − x·cos(x)'],
      why: 'Product rule: (u·v)′ = u′v + uv′. With u = x and v = sin(x): 1·sin(x) + x·cos(x).',
    },
    {
      q: 'f(x) = x² − 4x + 1. At what point does f have a minimum?',
      right: 'x = 2',
      wrong: ['x = −2', 'x = 4', 'x = 1'],
      why: 'f′(x) = 2x − 4 = 0 ⇔ x = 2. Since f″(x) = 2 > 0, it is a minimum. The minimum value is f(2) = 4 − 8 + 1 = −3.',
    },
    {
      q: 'What is the equation of the tangent line to the graph of y = x² at x = 1?',
      right: 'y = 2x − 1',
      wrong: ['y = 2x + 1', 'y = x', 'y = 2x'],
      why: 'Gradient: y′ = 2x, which is 2 at x = 1. Point: (1, 1). Line: y − 1 = 2(x − 1) ⇔ y = 2x − 1.',
    },
    {
      q: 'What is lim (x→0) of (1 + x)^(1/x)?',
      right: 'e',
      wrong: ['1', '0', '+∞'],
      why: 'This is a standard limit that defines Euler’s number: lim (x→0) (1 + x)^(1/x) = e ≈ 2.718. It is an indeterminate form of type 1^∞.',
    },
  ],
  howTo: {
    h2: 'How to study limits and derivatives for your exam',
    paragraphs: [
      'With limits, always start by substituting. If you get an indeterminate form (0/0, ∞/∞, ∞ − ∞, 1^∞), choose a technique: factorise, divide by the highest-degree term, multiply by the conjugate or use a standard limit.',
      'With derivatives, master the basic rules (power, product, quotient) and above all the chain rule, which appears in almost every problem with exponentials, logarithms and trigonometric functions.',
      'Finish with applications: monotonicity and extrema (the sign of f′), concavity (f″) and tangent lines. These questions usually carry the most marks in tests.',
    ],
  },
  faqs: [
    {
      q: 'What is the chain rule?',
      a: 'It is the rule for differentiating composite functions: (f(g(x)))′ = f′(g(x))·g′(x). For example, the derivative of sin(3x) is 3cos(3x).',
    },
    {
      q: 'Which standard limits are used most?',
      a: 'lim (x→0) sin(x)/x = 1, lim (x→0) (eˣ − 1)/x = 1, lim (x→0) ln(1 + x)/x = 1 and lim (x→+∞) (1 + 1/x)ˣ = e.',
    },
  ],
};
