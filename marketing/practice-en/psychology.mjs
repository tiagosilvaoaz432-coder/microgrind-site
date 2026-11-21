/**
 * Practice page (English) — Psychology.
 * English version of the Portuguese page psicologia in ../practice/outras.mjs.
 * Quiz items: { q, right, wrong: [3], why }.
 */

export const developmentalPsychology = {
  slug: 'developmental-psychology-exam-questions',
  ptSlug: 'psicologia-do-desenvolvimento-perguntas',
  area: 'psychology',
  mode: 'quiz',
  subject: 'Developmental psychology',
  level: 'Higher education',
  kicker: 'Developmental psychology',
  title: 'Developmental psychology: 10 exam questions | MicroGrind',
  description: 'Piaget, Vygotsky, Erikson, Kohlberg and attachment: 10 developmental psychology exam questions, each with the right answer explained in plain words.',
  h1: 'Developmental psychology exam questions',
  lede: 'Ten multiple-choice questions on the main theories of development, with an explanation for each answer.',
  practiceHeading: 'Mini quiz: Developmental psychology',
  keywords: ['developmental psychology exam questions', 'piaget stages of cognitive development', 'erikson stages', 'zone of proximal development', 'attachment theory questions'],
  related: ['physiology-flashcards'],
  items: [
    {
      q: 'What is the correct order of Piaget’s stages of cognitive development?',
      right: 'Sensorimotor, preoperational, concrete operational, formal operational',
      wrong: [
        'Preoperational, sensorimotor, formal operational, concrete operational',
        'Sensorimotor, concrete operational, preoperational, formal operational',
        'Oral, anal, phallic, genital',
      ],
      why: 'Piaget’s stages run from birth to adolescence. Oral, anal, phallic and genital are Freud’s psychosexual stages.',
    },
    {
      q: 'In which of Piaget’s stages is object permanence acquired?',
      right: 'Sensorimotor',
      wrong: ['Preoperational', 'Concrete operational', 'Formal operational'],
      why: 'During the first two years, the child comes to understand that objects continue to exist when they are out of sight.',
    },
    {
      q: 'Egocentrism and symbolic thought are characteristic of which stage?',
      right: 'Preoperational',
      wrong: ['Sensorimotor', 'Concrete operational', 'Formal operational'],
      why: 'From roughly 2 to 7 years of age, children use symbols and language but find it hard to take another person’s point of view.',
    },
    {
      q: 'In which stage does conservation (for example, of a quantity of liquid) appear?',
      right: 'Concrete operational',
      wrong: ['Sensorimotor', 'Preoperational', 'Formal operational'],
      why: 'From roughly 7 to 11 years of age, children understand that a quantity stays the same despite changes in shape, thanks to the reversibility of thought.',
    },
    {
      q: 'What is Vygotsky’s central concept for learning with help from others?',
      right: 'Zone of proximal development',
      wrong: ['Equilibration', 'Critical period', 'Operant conditioning'],
      why: 'It is the gap between what a child can do alone and what they can do with help from an adult or a more capable peer. Help that is adjusted to the child’s level is often called scaffolding.',
    },
    {
      q: 'According to Erikson, what is the typical psychosocial crisis of adolescence?',
      right: 'Identity versus role confusion',
      wrong: ['Intimacy versus isolation', 'Trust versus mistrust', 'Generativity versus stagnation'],
      why: 'In adolescence, young people try to build a coherent identity. Intimacy versus isolation is the crisis of young adulthood.',
    },
    {
      q: 'Which procedure, developed by Mary Ainsworth, assesses attachment in infants?',
      right: 'The Strange Situation',
      wrong: ['The marshmallow test', 'The three mountains task', 'The Heinz dilemma'],
      why: 'The Strange Situation observes how an infant reacts to separation from, and reunion with, the attachment figure. The three mountains task is Piaget’s and the Heinz dilemma is Kohlberg’s.',
    },
    {
      q: 'In the Strange Situation, a securely attached infant typically:',
      right: 'Is distressed by the separation, and seeks and accepts comfort at reunion',
      wrong: ['Ignores the attachment figure at reunion', 'Shows no reaction to either the separation or the reunion', 'Shows anger and rejects comfort at reunion'],
      why: 'Ignoring the attachment figure at reunion is typical of insecure-avoidant attachment; seeking contact while resisting comfort is typical of insecure-ambivalent (resistant) attachment.',
    },
    {
      q: 'Lawrence Kohlberg mainly studied:',
      right: 'Moral development',
      wrong: ['Motor development', 'Language development', 'Psychosexual development'],
      why: 'Kohlberg proposed three levels of moral reasoning (preconventional, conventional and postconventional), based on responses to dilemmas such as the Heinz dilemma.',
    },
    {
      q: 'According to Erikson, what is the first psychosocial crisis, in the first year of life?',
      right: 'Trust versus mistrust',
      wrong: ['Autonomy versus shame and doubt', 'Initiative versus guilt', 'Industry versus inferiority'],
      why: 'Its outcome depends on how predictable and good the care is. The other options are the next crises of childhood, in that order.',
    },
  ],
  howTo: {
    h2: 'How to study developmental psychology',
    paragraphs: [
      'Make a comparison table by theorist: Piaget, Vygotsky, Erikson, Kohlberg, Bowlby and Ainsworth. For each one, note the type of development studied, the stages or key concepts and the approximate ages.',
      'Exam questions often test the order of the stages and matching a concrete example to the right concept. Practise with examples: a child who thinks there is more water in the tall glass is in which stage?',
      'Also review the criticisms of each theory, which often come up in short-answer and essay questions.',
    ],
  },
  faqs: [
    {
      q: 'What is the difference between Piaget and Vygotsky?',
      a: 'Piaget puts more weight on the individual construction of knowledge, through stages. Vygotsky puts more weight on social interaction and culture, with the concept of the zone of proximal development.',
    },
    {
      q: 'How many stages are there in Erikson’s theory?',
      a: 'Eight, from birth to old age, each defined by a psychosocial crisis (for example, trust versus mistrust, or identity versus role confusion).',
    },
  ],
};
