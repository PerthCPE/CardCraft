// ============================================================================
// frontend/src/utils/toeic-synonyms.util.ts
// Authentic TOEIC Business English Synonyms (คำพ้องความหมายภาษาอังกฤษ)
// สำหรับมินิเกม Twin Blades: Synonym Strike
// - รับประกัน 100% ว่าคำตอบและตัวเลือกทั้งหมดเป็น "ภาษาอังกฤษ" (English only)
// - ตรวจสอบความไม่ซ้ำกันแบบ Case-insensitive
// ============================================================================

export interface SynonymPair {
  word: string;
  synonyms: string[];
}

// คลังคำพ้องความหมายออกสอบบ่อยในข้อสอบ TOEIC แบ่งตามหมวดธุรกิจ
const RAW_SYNONYM_GROUPS: string[][] = [
  // Contracts & Legal
  ['stipulate', 'specify', 'mandate', 'require'],
  ['abide by', 'comply with', 'adhere to', 'follow'],
  ['breach', 'violate', 'break', 'infringe'],
  ['contingent', 'dependent', 'conditional', 'reliant'],
  ['terminate', 'end', 'conclude', 'cease', 'cancel'],
  ['clause', 'provision', 'stipulation', 'condition'],
  ['obligatory', 'mandatory', 'compulsory', 'required'],
  ['valid', 'legitimate', 'binding', 'authorized'],
  ['waive', 'forgo', 'relinquish', 'drop'],
  ['arbitration', 'mediation', 'negotiation', 'settlement'],

  // Marketing & Sales
  ['lucrative', 'profitable', 'rewarding', 'gainful'],
  ['attract', 'draw', 'appeal to', 'engage'],
  ['promote', 'advertise', 'market', 'publicize'],
  ['consume', 'use', 'deplete', 'utilize'],
  ['campaign', 'initiative', 'drive', 'operation'],
  ['persuade', 'convince', 'influence', 'sway'],
  ['satisfaction', 'contentment', 'pleasure', 'approval'],
  ['subsequent', 'following', 'succeeding', 'later'],
  ['potential', 'prospective', 'possible', 'capable'],
  ['broaden', 'expand', 'widen', 'extend'],

  // Corporate & Management
  ['commence', 'begin', 'start', 'initiate', 'launch'],
  ['scrutinize', 'examine', 'inspect', 'audit', 'analyze'],
  ['collaborate', 'cooperate', 'team up', 'partner'],
  ['supervise', 'oversee', 'manage', 'direct'],
  ['implement', 'execute', 'enforce', 'apply'],
  ['postpone', 'delay', 'defer', 'reschedule'],
  ['delegate', 'assign', 'entrust', 'empower'],
  ['coordinate', 'organize', 'synchronize', 'arrange'],
  ['comply', 'adhere', 'conform', 'obey'],
  ['facilitate', 'assist', 'expedite', 'aid'],

  // Finance & Accounting
  ['reimburse', 'refund', 'compensate', 'repay'],
  ['allocate', 'distribute', 'assign', 'apportion', 'allot'],
  ['subsidize', 'fund', 'finance', 'sponsor', 'underwrite'],
  ['consolidate', 'combine', 'merge', 'unite', 'integrate'],
  ['revenue', 'income', 'earnings', 'proceeds'],
  ['expenditure', 'expense', 'outlay', 'cost'],
  ['audit', 'inspection', 'review', 'examination'],
  ['deficit', 'shortfall', 'deficiency', 'loss'],
  ['discrepancy', 'inconsistency', 'difference', 'variance'],
  ['fluctuate', 'vary', 'oscillate', 'alternate'],

  // Human Resources & Office
  ['recruit', 'hire', 'employ', 'enlist'],
  ['candidate', 'applicant', 'job seeker', 'contender'],
  ['compensation', 'salary', 'remuneration', 'pay'],
  ['evaluate', 'assess', 'appraise', 'judge'],
  ['resign', 'quit', 'step down', 'vacate'],
  ['probation', 'trial period', 'assessment', 'testing'],
  ['productive', 'efficient', 'prolific', 'fruitful'],
  ['mandatory', 'obligatory', 'required', 'essential'],
  ['proficient', 'skilled', 'expert', 'adept'],
  ['pension', 'retirement benefit', 'superannuation', 'allowance'],

  // Logistics & Supply Chain
  ['procure', 'acquire', 'obtain', 'purchase', 'secure'],
  ['expedite', 'accelerate', 'speed up', 'hasten'],
  ['inventory', 'stock', 'supplies', 'goods'],
  ['consign', 'deliver', 'ship', 'dispatch'],
  ['warehouse', 'depot', 'storage', 'storehouse'],
  ['transit', 'transport', 'carriage', 'conveyance'],
  ['cargo', 'freight', 'shipment', 'merchandise'],
  ['vendor', 'supplier', 'seller', 'merchant'],
  ['diminish', 'decrease', 'reduce', 'lessen'],
  ['fragile', 'delicate', 'breakable', 'brittle'],

  // Technology & Operations
  ['innovate', 'create', 'invent', 'revolutionize'],
  ['feasible', 'viable', 'achievable', 'practical', 'possible'],
  ['modify', 'alter', 'adjust', 'revise', 'adapt'],
  ['utilize', 'employ', 'use', 'apply'],
  ['configure', 'set up', 'customize', 'arrange'],
  ['obsolete', 'outdated', 'archaic', 'antiquated'],
  ['retrieve', 'recover', 'fetch', 'reclaim'],
  ['durable', 'sturdy', 'robust', 'long-lasting'],
  ['defect', 'flaw', 'fault', 'imperfection'],
  ['enhance', 'improve', 'boost', 'upgrade'],

  // General Business
  ['anticipate', 'expect', 'foresee', 'predict'],
  ['comprehend', 'understand', 'grasp', 'perceive'],
  ['demanding', 'exacting', 'challenging', 'arduous'],
  ['adequate', 'sufficient', 'enough', 'suitable'],
  ['paramount', 'supreme', 'foremost', 'crucial'],
  ['substantial', 'significant', 'considerable', 'sizable'],
  ['diligent', 'hardworking', 'meticulous', 'conscientious'],
  ['eliminate', 'remove', 'eradicate', 'expel'],
  ['notify', 'inform', 'alert', 'advise'],
  ['acquire', 'obtain', 'gain', 'attain'],
];

// สร้าง Dictionary เชื่อมโยง 2 ทาง (Bidirectional Synonym Map)
export const TOEIC_SYNONYMS_MAP: Record<string, string[]> = {};

RAW_SYNONYM_GROUPS.forEach((group) => {
  group.forEach((word) => {
    const key = word.toLowerCase().trim();
    const synonyms = group
      .map((w) => w.toLowerCase().trim())
      .filter((w) => w !== key);
    if (!TOEIC_SYNONYMS_MAP[key]) {
      TOEIC_SYNONYMS_MAP[key] = [];
    }
    synonyms.forEach((syn) => {
      if (!TOEIC_SYNONYMS_MAP[key].includes(syn)) {
        TOEIC_SYNONYMS_MAP[key].push(syn);
      }
    });
  });
});

/**
 * ดึงคำพ้องความหมายภาษาอังกฤษของคำเป้าหมาย
 */
export function getEnglishSynonym(word: string): string | null {
  const clean = word.toLowerCase().trim();
  const list = TOEIC_SYNONYMS_MAP[clean];
  if (list && list.length > 0) {
    // สุ่มเลือก synonym 1 คำ
    return list[Math.floor(Math.random() * list.length)];
  }
  return null;
}

/**
 * ตรวจสอบว่าคำนี้มีคำพ้องภาษาอังกฤษในระบบหรือไม่
 */
export function hasEnglishSynonym(word: string): boolean {
  const clean = word.toLowerCase().trim();
  return Boolean(TOEIC_SYNONYMS_MAP[clean] && TOEIC_SYNONYMS_MAP[clean].length > 0);
}

/**
 * สร้าง 4 ตัวเลือกภาษาอังกฤษที่ไม่ซ้ำกัน 100% (Case-Insensitively Unique)
 */
export function buildEnglishSynonymChoices(
  targetWord: string,
  correctSynonym: string,
  poolWords: string[] = [],
): string[] {
  const seen = new Set<string>();
  const choices: string[] = [];

  const add = (candidate?: string) => {
    if (!candidate) return;
    const clean = candidate.trim().toLowerCase();
    if (clean.length >= 2 && !seen.has(clean) && clean !== targetWord.toLowerCase().trim()) {
      seen.add(clean);
      // Format with consistent lowercase
      choices.push(clean);
    }
  };

  // 1. เพิ่มคำตอบที่ถูกต้องก่อน
  add(correctSynonym);

  // 2. สุ่มเลือกตัวลวงภาษาอังกฤษจากคลังคำพ้องอื่น ๆ
  const allKnownKeys = Object.keys(TOEIC_SYNONYMS_MAP).sort(() => Math.random() - 0.5);
  for (const key of allKnownKeys) {
    if (choices.length >= 4) break;
    add(key);
  }

  // 3. Fallback จาก poolWords (ซึ่งเป็นภาษาอังกฤษทั้งหมด)
  if (choices.length < 4) {
    for (const w of poolWords) {
      if (choices.length >= 4) break;
      add(w);
    }
  }

  return choices.slice(0, 4);
}
