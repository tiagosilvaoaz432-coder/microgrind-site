/** English versions of the Portuguese practice pages in ../practice/economia.mjs (`micro`, `macro`). */

export const microeconomics = {
  slug: 'microeconomics-exam-questions',
  ptSlug: 'microeconomia-perguntas-de-exame',
  area: 'economics',
  mode: 'quiz',
  subject: 'Microeconomics',
  level: 'Higher education',
  kicker: 'Microeconomics',
  title: 'Microeconomics exam questions with answers | MicroGrind',
  description: 'Supply and demand, elasticities, perfect competition, monopoly and opportunity cost: 10 microeconomics exam questions, each with the answer explained.',
  h1: 'Microeconomics exam questions',
  lede: 'Ten multiple-choice questions on demand, elasticities and market structures, with an explanation for each answer.',
  practiceHeading: 'Quick quiz: Microeconomics',
  keywords: ['microeconomics exam questions', 'microeconomics multiple choice questions', 'price elasticity of demand', 'perfect competition', 'monopoly'],
  related: ['macroeconomics-exam-questions'],
  items: [
    {
      q: 'According to the law of demand, ceteris paribus, when the price of a good rises:',
      right: 'The quantity demanded falls',
      wrong: ['The quantity demanded rises', 'The demand curve shifts to the right', 'Supply falls'],
      why: 'A change in the good’s own price is a movement along the demand curve. Shifts of the curve come from other factors (income, prices of other goods, tastes).',
    },
    {
      q: 'The price of a good rises by 10% and the quantity demanded falls by 20%. Demand is:',
      right: 'Elastic, with a price elasticity of 2 in absolute value',
      wrong: ['Inelastic, with an elasticity of 0.5', 'Unit elastic', 'Perfectly inelastic'],
      why: 'ε = (−20%) / (10%) = −2. Since |ε| > 1, demand is elastic: quantity responds more than proportionally to price.',
    },
    {
      q: 'If demand for a good is inelastic, a price rise makes total revenue:',
      right: 'Rise',
      wrong: ['Fall', 'Stay the same', 'Fall to zero'],
      why: 'With |ε| < 1, quantity falls proportionally less than price rises, so P × Q increases.',
    },
    {
      q: 'Two substitute goods have a cross-price elasticity that is:',
      right: 'Positive',
      wrong: ['Negative', 'Zero', 'Always equal to 1'],
      why: 'If the price of one rises, demand for the other increases. Complementary goods have a negative cross-price elasticity.',
    },
    {
      q: 'An inferior good has an income elasticity that is:',
      right: 'Negative',
      wrong: ['Positive and less than 1', 'Positive and greater than 1', 'Always zero'],
      why: 'When income rises, demand for an inferior good falls. Normal goods have a positive income elasticity (luxury goods, greater than 1).',
    },
    {
      q: 'In perfect competition, a firm maximises profit by producing where:',
      right: 'Price equals marginal cost',
      wrong: ['Price equals minimum average cost, always', 'Total revenue is at its maximum', 'Fixed cost is at its minimum'],
      why: 'The general condition is marginal revenue = marginal cost. In perfect competition the firm is a price taker, so marginal revenue equals price: P = MC.',
    },
    {
      q: 'A profit-maximising monopolist chooses the quantity at which:',
      right: 'Marginal revenue equals marginal cost, charging a price above marginal cost',
      wrong: ['Price equals marginal cost', 'Demand is inelastic', 'Total revenue is at its maximum'],
      why: 'Because the monopolist’s marginal revenue is below price, the condition MR = MC leads to P > MC and a smaller quantity than under perfect competition.',
    },
    {
      q: 'A price ceiling set below the equilibrium price causes:',
      right: 'Excess demand (a shortage)',
      wrong: ['Excess supply', 'No effect', 'A rise in the market price'],
      why: 'At the capped price, consumers want to buy more than producers want to sell. A price floor above equilibrium creates excess supply.',
    },
    {
      q: 'The opportunity cost of a choice is:',
      right: 'The value of the best alternative given up',
      wrong: ['The sum of all the alternatives', 'The price paid in money', 'The fixed cost of production'],
      why: 'It includes non-monetary costs, such as time. It is the idea behind the production possibility frontier.',
    },
    {
      q: 'In the short run, a perfectly competitive firm should shut down if the price falls below:',
      right: 'The minimum of average variable cost',
      wrong: ['The minimum of average total cost', 'Average fixed cost', 'The maximum of marginal cost'],
      why: 'Below minimum AVC the firm does not even cover its variable costs, so it loses less by shutting down (it loses only its fixed costs). Between minimum AVC and minimum ATC, it produces at a loss in the short run.',
    },
  ],
  howTo: {
    h2: 'How to study Microeconomics for your exam',
    paragraphs: [
      'Learn each topic with its graph alongside: supply and demand, cost curves, and equilibrium under perfect competition and under monopoly. In exams, almost every question can be solved by drawing the right graph.',
      'Always tell movements along a curve (a change in the good’s own price) apart from shifts of the curve (other factors). This is the most common source of wrong answers in multiple-choice questions.',
      'Practise short calculations: elasticities, total and marginal revenue, profit maximisation (MR = MC). Work through problems with simple numbers until the optimality condition becomes automatic.',
    ],
  },
  faqs: [
    {
      q: 'What is the profit-maximisation condition?',
      a: 'Marginal revenue equals marginal cost (MR = MC). In perfect competition this is the same as P = MC, because marginal revenue is the price.',
    },
    {
      q: 'How do I know if demand is elastic?',
      a: 'Calculate the price elasticity: the percentage change in quantity divided by the percentage change in price. If the absolute value is greater than 1, demand is elastic.',
    },
  ],
};

export const macroeconomics = {
  slug: 'macroeconomics-exam-questions',
  ptSlug: 'macroeconomia-perguntas-de-exame',
  area: 'economics',
  mode: 'quiz',
  subject: 'Macroeconomics',
  level: 'Higher education',
  kicker: 'Macroeconomics',
  title: 'Macroeconomics exam questions with answers | MicroGrind',
  description: 'GDP, inflation, unemployment, the multiplier, and monetary and fiscal policy: 10 macroeconomics exam questions, each with the answer explained.',
  h1: 'Macroeconomics exam questions',
  lede: 'Ten multiple-choice questions on national accounts, inflation, unemployment and economic policy, with an explanation for each answer.',
  practiceHeading: 'Quick quiz: Macroeconomics',
  keywords: ['macroeconomics exam questions', 'macroeconomics multiple choice questions', 'GDP expenditure approach', 'keynesian multiplier', 'monetary and fiscal policy'],
  related: ['microeconomics-exam-questions'],
  items: [
    {
      q: 'GDP measures:',
      right: 'The value of final goods and services produced within a territory in a given period',
      wrong: ['The value of all transactions, including intermediate goods', 'The income of residents, wherever they produce', 'The accumulated wealth of a country'],
      why: 'Only final goods are counted, to avoid double counting. The territorial criterion distinguishes GDP from GNP/GNI, which follows residents.',
    },
    {
      q: 'Using the expenditure approach, GDP equals:',
      right: 'C + I + G + (X − M)',
      wrong: ['C + I + G + X + M', 'C − I + G − X', 'Wages + profits'],
      why: 'Private consumption, investment, government spending and net exports. Imports are subtracted because they were produced abroad. Wages and profits belong to the income approach.',
    },
    {
      q: 'What is the difference between nominal GDP and real GDP?',
      right: 'Real GDP is calculated at constant prices and removes the effect of price changes',
      wrong: ['Real GDP includes the shadow economy', 'Nominal GDP excludes taxes', 'There is no difference'],
      why: 'Real growth measures the change in the quantities produced. The ratio nominal GDP / real GDP gives the GDP deflator.',
    },
    {
      q: 'Inflation is:',
      right: 'A general and sustained rise in the overall price level',
      wrong: ['A rise in the price of a single good', 'A fall in the overall price level', 'A rise in real GDP'],
      why: 'It is usually measured by the change in a consumer price index (CPI, or the HICP in the euro area). A general fall in prices is called deflation.',
    },
    {
      q: 'In the simple Keynesian model, with a marginal propensity to consume of 0.8, the expenditure multiplier is:',
      right: '5',
      wrong: ['0.8', '1.25', '8'],
      why: 'Multiplier = 1 / (1 − c) = 1 / 0.2 = 5. An autonomous increase in spending of 1 raises equilibrium income by 5.',
    },
    {
      q: 'The unemployment rate is calculated as:',
      right: 'The unemployed divided by the labour force',
      wrong: ['The unemployed divided by the total population', 'The unemployed divided by the economically inactive population', 'The employed divided by the labour force'],
      why: 'The labour force is the employed plus the unemployed. People who are economically inactive (students, retirees, people not looking for work) are not in the denominator.',
    },
    {
      q: 'In the euro area, monetary policy is conducted by:',
      right: 'The European Central Bank, within the Eurosystem',
      wrong: ['Each national central bank independently', 'The European Commission', 'National governments'],
      why: 'The ECB sets the key interest rates for the whole euro area, with price stability as its primary objective. National central banks, such as the Deutsche Bundesbank or the Banque de France, are part of the Eurosystem.',
    },
    {
      q: 'Which of these is an expansionary fiscal policy measure?',
      right: 'Increasing government spending or cutting taxes',
      wrong: ['Raising interest rates', 'Raising taxes to reduce the deficit', 'The central bank selling government bonds'],
      why: 'Fiscal policy uses government spending and taxes. Interest rates and open market operations are monetary policy tools.',
    },
    {
      q: 'A rise in interest rates by the central bank tends to:',
      right: 'Reduce aggregate demand and inflationary pressure',
      wrong: ['Increase investment', 'Increase inflation', 'Have no effect on consumption'],
      why: 'More expensive credit reduces investment and borrowing-financed consumption. That is why central banks raise interest rates to fight inflation.',
    },
    {
      q: 'The short-run Phillips curve describes:',
      right: 'An inverse relationship between inflation and unemployment',
      wrong: ['A direct relationship between inflation and unemployment', 'An inverse relationship between GDP and investment', 'A direct relationship between interest rates and consumption'],
      why: 'In the short run, lower unemployment tends to come with higher inflation. In the long run, once expectations adjust, the curve tends to be vertical at the natural rate of unemployment.',
    },
  ],
  howTo: {
    h2: 'How to study Macroeconomics for your exam',
    paragraphs: [
      'Start with national accounts: the three approaches to GDP, nominal vs real, and the deflator. These are short concepts that earn easy marks and form the basis for the rest of your course.',
      'Then practise the models with graphs: the Keynesian cross and the multiplier, IS-LM, and aggregate demand and supply. For each shock (a rise in spending, in interest rates, in the oil price), write down the chain of effects on output, prices and employment.',
      'Always distinguish fiscal policy (government: spending and taxes) from monetary policy (central bank: interest rates and liquidity). In the euro area, monetary policy is set by the ECB; in the UK, by the Bank of England; in the US, by the Federal Reserve.',
    ],
  },
  faqs: [
    {
      q: 'How do you calculate the Keynesian multiplier?',
      a: 'In the simple model, with no government or foreign trade, the multiplier is 1 / (1 − c), where c is the marginal propensity to consume. With proportional taxes and imports, the multiplier is smaller.',
    },
    {
      q: 'What is the difference between GDP and GNP?',
      a: 'GDP measures production within a country’s territory. GNP (or GNI) measures the income of residents, including what they earn abroad and excluding what is paid to non-residents.',
    },
  ],
};
