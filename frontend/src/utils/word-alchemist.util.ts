// ============================================================================
// frontend/src/utils/word-alchemist.util.ts
// Pure utility functions for Word Alchemist (Part of Speech Drill)
// - Word Family derivation
// - Guaranteed case-insensitively unique 4 choices with consistent casing
// ============================================================================

export const KNOWN_WORD_FAMILIES: Record<
  string,
  { noun: string; verb: string; adj: string; adv: string; extra?: string[] }
> = {
  negotiate: { noun: 'negotiation', verb: 'negotiate', adj: 'negotiable', adv: 'negotiably', extra: ['negotiator', 'negotiating'] },
  manage: { noun: 'management', verb: 'manage', adj: 'managerial', adv: 'manageable', extra: ['manager', 'managing'] },
  compete: { noun: 'competition', verb: 'compete', adj: 'competitive', adv: 'competitively', extra: ['competitor', 'competing'] },
  apply: { noun: 'application', verb: 'apply', adj: 'applicable', adv: 'applicant', extra: ['applying', 'applied'] },
  produce: { noun: 'production', verb: 'produce', adj: 'productive', adv: 'productively', extra: ['producer', 'producing'] },
  expand: { noun: 'expansion', verb: 'expand', adj: 'expansive', adv: 'expandable', extra: ['expanding', 'expanded'] },
  decide: { noun: 'decision', verb: 'decide', adj: 'decisive', adv: 'decisively', extra: ['deciding', 'decided'] },
  conclude: { noun: 'conclusion', verb: 'conclude', adj: 'conclusive', adv: 'conclusively', extra: ['concluding'] },
  recommend: { noun: 'recommendation', verb: 'recommend', adj: 'recommended', adv: 'recommending', extra: ['recommendable'] },
  require: { noun: 'requirement', verb: 'require', adj: 'required', adv: 'requisite', extra: ['requiring'] },
  inform: { noun: 'information', verb: 'inform', adj: 'informative', adv: 'informatively', extra: ['informant', 'informing'] },
  operate: { noun: 'operation', verb: 'operate', adj: 'operational', adv: 'operationally', extra: ['operator', 'operating'] },
  perform: { noun: 'performance', verb: 'perform', adj: 'performing', adv: 'performed', extra: ['performer'] },
  invest: { noun: 'investment', verb: 'invest', adj: 'invested', adv: 'investor', extra: ['investing'] },
  innovate: { noun: 'innovation', verb: 'innovate', adj: 'innovative', adv: 'innovatively', extra: ['innovator'] },
  efficient: { noun: 'efficiency', verb: 'effect', adj: 'efficient', adv: 'efficiently', extra: ['efficacious'] },
  accurate: { noun: 'accuracy', verb: 'accurize', adj: 'accurate', adv: 'accurately', extra: ['inaccurate'] },
  complete: { noun: 'completion', verb: 'complete', adj: 'completed', adv: 'completely', extra: ['completing'] },
  reliable: { noun: 'reliability', verb: 'rely', adj: 'reliable', adv: 'reliably', extra: ['reliance', 'relying'] },
  success: { noun: 'success', verb: 'succeed', adj: 'successful', adv: 'successfully', extra: ['successor'] },
  strategic: { noun: 'strategy', verb: 'strategize', adj: 'strategic', adv: 'strategically', extra: ['strategist'] },
  comply: { noun: 'compliance', verb: 'comply', adj: 'compliant', adv: 'compliantly', extra: ['complying'] },
  finance: { noun: 'finance', verb: 'finance', adj: 'financial', adv: 'financially', extra: ['financier'] },
  economy: { noun: 'economy', verb: 'economize', adj: 'economic', adv: 'economically', extra: ['economical'] },
  create: { noun: 'creation', verb: 'create', adj: 'creative', adv: 'creatively', extra: ['creator', 'creativity'] },
  promote: { noun: 'promotion', verb: 'promote', adj: 'promotional', adv: 'promoted', extra: ['promoter'] },
  qualify: { noun: 'qualification', verb: 'qualify', adj: 'qualified', adv: 'qualifying', extra: ['qualifier'] },
  satisfy: { noun: 'satisfaction', verb: 'satisfy', adj: 'satisfactory', adv: 'satisfactorily', extra: ['satisfying'] },
  significant: { noun: 'significance', verb: 'signify', adj: 'significant', adv: 'significantly', extra: ['signifying'] },
  respond: { noun: 'response', verb: 'respond', adj: 'responsive', adv: 'responsively', extra: ['respondent'] },
  assist: { noun: 'assistance', verb: 'assist', adj: 'assistant', adv: 'assisting', extra: ['assisted'] },
  distribute: { noun: 'distribution', verb: 'distribute', adj: 'distributive', adv: 'distributor', extra: ['distributing'] },
  participate: { noun: 'participation', verb: 'participate', adj: 'participatory', adv: 'participant', extra: ['participating'] },
  evaluate: { noun: 'evaluation', verb: 'evaluate', adj: 'evaluative', adv: 'evaluating', extra: ['evaluator'] },
  authorize: { noun: 'authorization', verb: 'authorize', adj: 'authorized', adv: 'authoritative', extra: ['authorizer'] },
  collaborate: { noun: 'collaboration', verb: 'collaborate', adj: 'collaborative', adv: 'collaboratively', extra: ['collaborator'] },
  profession: { noun: 'profession', verb: 'professionalize', adj: 'professional', adv: 'professionally', extra: ['professionalism'] },
  maintenance: { noun: 'maintenance', verb: 'maintain', adj: 'maintainable', adv: 'maintaining', extra: ['maintained'] },
  agree: { noun: 'agreement', verb: 'agree', adj: 'agreeable', adv: 'agreeably', extra: ['agreeing', 'agreed'] },
  approve: { noun: 'approval', verb: 'approve', adj: 'approving', adv: 'approved', extra: ['approvingly'] },
  contract: { noun: 'contract', verb: 'contract', adj: 'contractual', adv: 'contractually', extra: ['contractor'] },
  develop: { noun: 'development', verb: 'develop', adj: 'developmental', adv: 'developing', extra: ['developer'] },
  employ: { noun: 'employment', verb: 'employ', adj: 'employable', adv: 'employer', extra: ['employee'] },
  establish: { noun: 'establishment', verb: 'establish', adj: 'established', adv: 'establishing', extra: ['establisher'] },
  extend: { noun: 'extension', verb: 'extend', adj: 'extensive', adv: 'extensively', extra: ['extending'] },
  indicate: { noun: 'indication', verb: 'indicate', adj: 'indicative', adv: 'indicator', extra: ['indicating'] },
  inspect: { noun: 'inspection', verb: 'inspect', adj: 'inspecting', adv: 'inspector', extra: ['inspected'] },
  intend: { noun: 'intention', verb: 'intend', adj: 'intended', adv: 'intentionally', extra: ['intense'] },
  introduce: { noun: 'introduction', verb: 'introduce', adj: 'introductory', adv: 'introducing', extra: ['introduced'] },
  measure: { noun: 'measurement', verb: 'measure', adj: 'measurable', adv: 'measured', extra: ['measuring'] },
  modify: { noun: 'modification', verb: 'modify', adj: 'modified', adv: 'modifying', extra: ['modifier'] },
  notify: { noun: 'notification', verb: 'notify', adj: 'notified', adv: 'notifying', extra: ['notifier'] },
  obtain: { noun: 'obtainment', verb: 'obtain', adj: 'obtainable', adv: 'obtaining', extra: ['obtained'] },
  organize: { noun: 'organization', verb: 'organize', adj: 'organizational', adv: 'organized', extra: ['organizer'] },
  predict: { noun: 'prediction', verb: 'predict', adj: 'predictable', adv: 'predictably', extra: ['predictive'] },
  prepare: { noun: 'preparation', verb: 'prepare', adj: 'preparatory', adv: 'prepared', extra: ['preparing'] },
  prevent: { noun: 'prevention', verb: 'prevent', adj: 'preventive', adv: 'preventable', extra: ['preventing'] },
  reduce: { noun: 'reduction', verb: 'reduce', adj: 'reducible', adv: 'reduced', extra: ['reducing'] },
  resolve: { noun: 'resolution', verb: 'resolve', adj: 'resolved', adv: 'resolving', extra: ['resolute'] },
  submit: { noun: 'submission', verb: 'submit', adj: 'submitted', adv: 'submitting', extra: ['submissive'] },
  sustain: { noun: 'sustainability', verb: 'sustain', adj: 'sustainable', adv: 'sustainably', extra: ['sustaining'] },
};

export function deriveWordFamily(word: string, pos: string) {
  const clean = word.toLowerCase().trim();

  // Check direct known dictionary first
  if (KNOWN_WORD_FAMILIES[clean]) {
    return KNOWN_WORD_FAMILIES[clean];
  }

  // Algorithmic stem extraction
  const root = clean
    .replace(/(tion|sion|ment|ance|ence|ing|ed|ly|able|ible|ive|al|ize|ise|ity|ness|er|or|ful|less)$/, '')
    .replace(/e$/, '');
  const stem = root.length >= 3 ? root : clean;

  let noun = `${stem}ion`;
  let verb = `${stem}ize`;
  let adj = `${stem}ive`;
  let adv = `${stem}ively`;

  if (pos.includes('v')) {
    verb = clean;
    noun = `${stem}tion`;
    adj = `${stem}able`;
    adv = `${stem}ably`;
  } else if (pos.includes('n')) {
    noun = clean;
    verb = `${stem}ify`;
    adj = `${stem}al`;
    adv = `${stem}ally`;
  } else if (pos.includes('adj')) {
    adj = clean;
    noun = `${stem}ness`;
    adv = `${clean}ly`;
    verb = `${stem}ize`;
  } else if (pos.includes('adv')) {
    adv = clean;
    adj = clean.replace(/ly$/, '');
    noun = `${adj}ness`;
    verb = `${adj}ize`;
  }

  return {
    noun,
    verb,
    adj,
    adv,
    extra: [`${stem}ment`, `${stem}ing`, `${stem}ed`, `${stem}er`],
  };
}

export function buildAlchemistChoices(
  word: string,
  pos: string,
  isStartOfSentence: boolean,
  poolWords: string[] = [],
): string[] {
  const formatWord = (w: string): string => {
    const trimmed = w.trim();
    if (!trimmed) return '';
    if (isStartOfSentence) {
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    }
    return trimmed.toLowerCase();
  };

  const family = deriveWordFamily(word, pos);
  const seenLower = new Set<string>();
  const candidateChoices: string[] = [];

  const addChoice = (rawWord?: string) => {
    if (!rawWord) return;
    const lower = rawWord.toLowerCase().trim();
    if (lower.length >= 3 && !seenLower.has(lower)) {
      seenLower.add(lower);
      candidateChoices.push(formatWord(lower));
    }
  };

  // 1. ใส่คำที่ถูกต้องเป็นคำแรกเสมอ
  addChoice(word);

  // 2. ใส่รูปคำใน Word Family
  addChoice(family.noun);
  addChoice(family.verb);
  addChoice(family.adj);
  addChoice(family.adv);
  if (family.extra) {
    family.extra.forEach(addChoice);
  }

  // 3. Fallback Suffix Derivatives หากยังไม่ครบ 4 ตัวเลือก
  const stem = word
    .toLowerCase()
    .replace(/(tion|sion|ment|ance|ence|ing|ed|ly|able|ible|ive|al|ize|ise|ity|ness|er|or)$/, '')
    .replace(/e$/, '');
  const safeStem = stem.length >= 3 ? stem : word.toLowerCase();

  const fallbackSuffixes = [
    'tion',
    'ment',
    'able',
    'ive',
    'ly',
    'ing',
    'ed',
    'er',
    'ance',
    'al',
    'ity',
  ];
  for (const suffix of fallbackSuffixes) {
    if (candidateChoices.length >= 4) break;
    addChoice(`${safeStem}${suffix}`);
  }

  // 4. กรณีสำรองสุดท้าย: ดึงคำศัพท์หมวดเดียวกันมาเป็นตัวลวงเพื่อรับประกันครบ 4 ช้อยส์ไม่ซ้ำกัน
  if (candidateChoices.length < 4) {
    for (const other of poolWords) {
      if (candidateChoices.length >= 4) break;
      addChoice(other);
    }
  }

  return candidateChoices.slice(0, 4);
}
