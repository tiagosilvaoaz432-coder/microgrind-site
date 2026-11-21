/**
 * Practice pages (English) — Life sciences (flashcard decks).
 * English versions of the Portuguese pages anatomia, fisiologia, bioquimica and farmacologia
 * in ../practice/ciencias-vida.mjs. Card items: { front, back }.
 */

const FLASH_FAQ_HOW = {
  q: 'How should I use flashcards to study?',
  a: 'Try to answer from memory before you turn the card over, and set aside the ones you missed. Review those more often and on different days: spaced repetition makes things stick better than rereading your notes.',
};

export const anatomy = {
  slug: 'anatomy-flashcards',
  ptSlug: 'flashcards-anatomia',
  area: 'life-sciences',
  mode: 'flashcards',
  subject: 'Anatomy',
  level: 'Higher education',
  kicker: 'Anatomy',
  title: 'Anatomy flashcards: 12 free cards | MicroGrind',
  description: 'Human anatomy flashcards: bones, muscles, heart, lungs, nerves and anatomical planes. Flip each card, check the answer and count how many you got right.',
  h1: 'Anatomy flashcards',
  lede: 'Twelve human anatomy flashcards to review the essentials: skeleton, muscles, heart, lungs and anatomical planes.',
  practiceHeading: 'Flashcards: Anatomy',
  keywords: ['anatomy flashcards', 'human anatomy flashcards', 'anatomy questions and answers', 'anatomy revision', 'anatomy exam questions'],
  related: ['physiology-flashcards', 'biochemistry-flashcards'],
  items: [
    { front: 'What is the longest bone in the human body?', back: 'The femur, in the thigh.' },
    { front: 'How many cervical vertebrae does the spine have?', back: 'Seven (C1 to C7). C1 is the atlas and C2 is the axis.' },
    { front: 'How many bones does the adult skeleton usually have?', back: 'About 206.' },
    { front: 'What is the main muscle of inspiration?', back: 'The diaphragm. When it contracts, it moves down and increases the volume of the thoracic cavity.' },
    { front: 'Which valve separates the left atrium from the left ventricle?', back: 'The mitral (bicuspid) valve. On the right side is the tricuspid valve.' },
    { front: 'Which nerve supplies the diaphragm?', back: 'The phrenic nerve, from the C3 to C5 nerve roots.' },
    { front: 'How many lobes does the right lung have? And the left?', back: 'The right lung has three lobes (upper, middle and lower); the left has two.' },
    { front: 'What is the largest gland in the human body?', back: 'The liver.' },
    { front: 'What connects a muscle to a bone? And a bone to another bone?', back: 'A tendon connects muscle to bone. A ligament connects bone to bone.' },
    { front: 'Where is the thyroid gland?', back: 'At the front of the neck, below the larynx and in front of the trachea.' },
    { front: 'Which artery carries blood from the left ventricle to the systemic circulation?', back: 'The aorta. The pulmonary trunk leaves the right ventricle.' },
    { front: 'Which plane divides the body into right and left parts?', back: 'The sagittal plane (the median, or midsagittal, plane divides it into two equal halves).' },
  ],
  howTo: {
    h2: 'How to study anatomy',
    paragraphs: [
      'Study by system and by region, always with images: an atlas, models or diagrams you draw yourself. Saying out loud where each structure is and what it relates to helps more than rereading a list of names.',
      'Flashcards work well for anatomy because the subject is full of terms and short relationships: origin and insertion, nerve supply, blood supply. Keep the cards small, with one question per card.',
      'Review a little every day instead of everything the night before. In the week of the exam, mix image-identification questions with questions on how structures relate to each other.',
    ],
  },
  faqs: [
    FLASH_FAQ_HOW,
    {
      q: 'Can I make anatomy flashcards from my own notes?',
      a: 'Yes. In MicroGrind you upload your notes, handouts or slides, and flashcards and quizzes are prepared from that material so you can study in short sessions.',
    },
  ],
};

export const physiology = {
  slug: 'physiology-flashcards',
  ptSlug: 'flashcards-fisiologia',
  area: 'life-sciences',
  mode: 'flashcards',
  subject: 'Physiology',
  level: 'Higher education',
  kicker: 'Physiology',
  title: 'Physiology flashcards: 12 free cards | MicroGrind',
  description: 'Physiology flashcards on membrane potential, the heart, kidney, breathing, hormones and the autonomic nervous system. Review them and count your right answers.',
  h1: 'Physiology flashcards',
  lede: 'Twelve human physiology flashcards on neurons, the heart, breathing, the kidney and hormonal regulation.',
  practiceHeading: 'Flashcards: Physiology',
  keywords: ['physiology flashcards', 'human physiology flashcards', 'physiology questions and answers', 'physiology revision', 'cardiac output formula'],
  related: ['anatomy-flashcards', 'pharmacology-flashcards'],
  items: [
    { front: 'What is the approximate resting membrane potential of a neuron?', back: 'About −70 mV (the inside is negative relative to the outside).' },
    { front: 'What does the sodium–potassium pump do in each cycle?', back: 'It moves 3 Na⁺ out of the cell and 2 K⁺ into it, using 1 ATP.' },
    { front: 'How is cardiac output calculated?', back: 'Cardiac output = heart rate × stroke volume.' },
    { front: 'What is the natural pacemaker of the heart?', back: 'The sinoatrial (SA) node, in the right atrium.' },
    { front: 'Which hormone lowers blood glucose, and where is it produced?', back: 'Insulin, made by the beta cells of the islets of Langerhans in the pancreas.' },
    { front: 'What is the functional unit of the kidney?', back: 'The nephron (glomerulus, Bowman’s capsule and tubules).' },
    { front: 'Where does gas exchange take place in the lungs?', back: 'In the alveoli, by diffusion across the alveolar–capillary membrane.' },
    { front: 'What is the main effect of ADH (vasopressin)?', back: 'It increases water reabsorption in the collecting ducts, which concentrates the urine.' },
    { front: 'What is the main function of haemoglobin?', back: 'Carrying oxygen from the lungs to the tissues (and some CO₂ in the opposite direction).' },
    { front: 'Give three effects of sympathetic nervous system activation.', back: 'Increased heart rate, bronchodilation and mydriasis (dilation of the pupil).' },
    { front: 'What does the Frank–Starling law state?', back: 'The more the ventricle fills (preload), the greater the force of contraction and the stroke volume, within physiological limits.' },
    { front: 'What is the normal pH range of arterial blood?', back: '7.35 to 7.45.' },
  ],
  howTo: {
    h2: 'How to study physiology',
    paragraphs: [
      'In physiology, understand the mechanism before you memorise values. For each system, ask: what is the regulated variable, what detects it, what responds and how is balance restored?',
      'Draw the control loops (for example, blood glucose with insulin and glucagon, or blood volume with ADH and aldosterone). One good diagram answers several exam questions.',
      'Use flashcards for the facts you really need at your fingertips: normal values, formulas such as cardiac output, and sympathetic and parasympathetic effects.',
    ],
  },
  faqs: [
    FLASH_FAQ_HOW,
    {
      q: 'Which physiology topics come up most often in exams?',
      a: 'It depends on your module, but the usual ones are membrane potential and synapses, the cardiac cycle and cardiac output, respiratory mechanics and gas exchange, renal function and hormonal regulation.',
    },
  ],
};

export const biochemistry = {
  slug: 'biochemistry-flashcards',
  ptSlug: 'flashcards-bioquimica',
  area: 'life-sciences',
  mode: 'flashcards',
  subject: 'Biochemistry',
  level: 'Higher education',
  kicker: 'Biochemistry',
  title: 'Biochemistry flashcards: 12 free cards | MicroGrind',
  description: 'Biochemistry flashcards on proteins, enzymes, Michaelis–Menten kinetics, glycolysis, the Krebs cycle and nucleic acids. Review them and count your right answers.',
  h1: 'Biochemistry flashcards',
  lede: 'Twelve biochemistry flashcards on proteins, enzymes, energy metabolism and nucleic acids.',
  practiceHeading: 'Flashcards: Biochemistry',
  keywords: ['biochemistry flashcards', 'biochemistry questions and answers', 'biochemistry revision', 'krebs cycle flashcards', 'michaelis-menten kinetics'],
  related: ['physiology-flashcards', 'pharmacology-flashcards'],
  items: [
    { front: 'What is the bond between two amino acids in a protein called?', back: 'A peptide bond, formed between the carboxyl group of one and the amino group of the other, with the release of water.' },
    { front: 'What is the end product of glycolysis, and what is the net energy yield per glucose?', back: 'Two molecules of pyruvate, with a net yield of 2 ATP and 2 NADH.' },
    { front: 'Where does glycolysis take place?', back: 'In the cytosol.' },
    { front: 'Where does the Krebs cycle take place in eukaryotic cells?', back: 'In the mitochondrial matrix.' },
    { front: 'How do enzymes speed up a reaction?', back: 'They lower the activation energy, without changing the equilibrium of the reaction.' },
    { front: 'What does Km represent in Michaelis–Menten kinetics?', back: 'The substrate concentration at which the reaction rate is half the maximum rate (Vmax/2).' },
    { front: 'What effect does a competitive inhibitor have on Km and Vmax?', back: 'It increases the apparent Km and leaves Vmax unchanged.' },
    { front: 'What are the nitrogenous bases of DNA? And which one is different in RNA?', back: 'DNA: adenine, thymine, cytosine and guanine. In RNA, uracil replaces thymine.' },
    { front: 'What are the most common secondary structures of proteins?', back: 'The alpha helix and the beta sheet, stabilised by hydrogen bonds in the peptide backbone.' },
    { front: 'What distinguishes a saturated fatty acid from an unsaturated one?', back: 'A saturated fatty acid has no carbon–carbon double bonds; an unsaturated one has one or more.' },
    { front: 'What is the final electron acceptor in the electron transport chain?', back: 'Oxygen, which is reduced to water.' },
    { front: 'What glycosidic bonds are found in glycogen?', back: 'α(1→4) bonds along the chains and α(1→6) bonds at the branch points, between glucose units.' },
  ],
  howTo: {
    h2: 'How to study biochemistry',
    paragraphs: [
      'Start with the biomolecules (carbohydrates, lipids, proteins and nucleic acids) and their structure: many metabolism questions depend on understanding which chemical groups react.',
      'In metabolism, do not try to memorise every reaction at once. For each pathway, first learn where it happens, what goes in, what comes out, the energy yield and the regulated steps. Only then move on to the intermediates.',
      'Make a map that links the pathways (glycolysis, Krebs cycle, electron transport chain, gluconeogenesis, beta-oxidation) and review the control points with flashcards.',
    ],
  },
  faqs: [
    FLASH_FAQ_HOW,
    {
      q: 'Do I have to memorise every metabolic intermediate?',
      a: 'It depends on your module. In general, where each pathway happens, the energy balance, the regulatory enzymes and the links between pathways matter more than the full list of intermediates.',
    },
  ],
};

export const pharmacology = {
  slug: 'pharmacology-flashcards',
  ptSlug: 'flashcards-farmacologia',
  area: 'life-sciences',
  mode: 'flashcards',
  subject: 'Pharmacology',
  level: 'Higher education',
  kicker: 'Pharmacology',
  title: 'Pharmacology flashcards: 12 free cards | MicroGrind',
  description: 'General pharmacology flashcards: pharmacokinetics, ADME, half-life, bioavailability, agonists and antagonists, potency and efficacy. Flip and check each card.',
  h1: 'Pharmacology flashcards',
  lede: 'Twelve general pharmacology flashcards on pharmacokinetics and pharmacodynamics, the core concepts behind any pharmacology exam.',
  practiceHeading: 'Flashcards: Pharmacology',
  keywords: ['pharmacology flashcards', 'pharmacokinetics flashcards', 'pharmacology questions and answers', 'drug half-life', 'pharmacology revision'],
  related: ['biochemistry-flashcards', 'physiology-flashcards'],
  items: [
    { front: 'What is the difference between pharmacokinetics and pharmacodynamics?', back: 'Pharmacokinetics: what the body does to the drug. Pharmacodynamics: what the drug does to the body.' },
    { front: 'What does ADME stand for?', back: 'Absorption, Distribution, Metabolism and Excretion (elimination).' },
    { front: 'What is the elimination half-life?', back: 'The time it takes for the plasma concentration of the drug to fall by half.' },
    { front: 'After roughly how many half-lives is steady state reached?', back: 'About 4 to 5 half-lives, with regular dosing.' },
    { front: 'What is the bioavailability of a drug given intravenously?', back: '100%: all of the drug reaches the systemic circulation.' },
    { front: 'What is the first-pass effect?', back: 'First-pass metabolism: after oral administration, part of the drug is metabolised in the gut and liver before it reaches the systemic circulation.' },
    { front: 'What is the difference between an agonist and an antagonist?', back: 'An agonist binds to a receptor and activates it. An antagonist binds without activating it and blocks the action of the agonist.' },
    { front: 'What does the therapeutic index measure?', back: 'The ratio of the toxic dose to the effective dose (for example, TD50/ED50). The higher it is, the wider the safety margin.' },
    { front: 'What is the main organ of drug metabolism?', back: 'The liver, largely through cytochrome P450 enzymes.' },
    { front: 'What does an enzyme inducer do to other drugs metabolised by the same pathway?', back: 'It speeds up their metabolism and can lower their plasma concentration and effect.' },
    { front: 'What is the difference between potency and efficacy?', back: 'Potency: the dose needed to produce a given effect (related to the EC50). Efficacy: the maximum effect the drug can produce.' },
    { front: 'What is the main route of excretion for most drugs?', back: 'The kidneys (urine). Biliary excretion (faeces) is the second most important route.' },
  ],
  howTo: {
    h2: 'How to study pharmacology',
    paragraphs: [
      'Master general pharmacology first: pharmacokinetics (ADME, half-life, bioavailability, volume of distribution) and pharmacodynamics (receptors, agonists, antagonists, dose–response curves). Everything else builds on these concepts.',
      'In systems pharmacology, study by drug class rather than drug by drug: the mechanism of action, indications, adverse effects and interactions of the class, and then how the main drugs in it differ.',
      'Flashcards are ideal for mechanisms, typical adverse effects and interactions: lots of short facts that need repetition.',
    ],
  },
  faqs: [
    FLASH_FAQ_HOW,
    {
      q: 'Where should I start with pharmacology?',
      a: 'With general pharmacology (pharmacokinetics and pharmacodynamics). Then work through the drug classes, always covering the mechanism of action, adverse effects and interactions.',
    },
  ],
};
