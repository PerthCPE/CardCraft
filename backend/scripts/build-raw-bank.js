// ============================================================================
// build-raw-bank.js
// สร้างคลังคำศัพท์ดิบคุณภาพสูงสำหรับ TOEIC 700+ จำนวน 2,000+ คำ
// ============================================================================

const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  'Contracts',
  'Finance',
  'Marketing',
  'Human Resources',
  'Corporate',
  'Logistics',
  'Manufacturing',
  'Technology',
  'Customer Relations',
  'Hospitality',
  'Facilities',
  'Safety & Health',
];

// ชุดคำกริยาและคำนามธุรกิจ TOEIC ครบถ้วน
const RAW_TERMS = [
  // Contracts
  { word: 'Arbitrate', partOfSpeech: 'v.', meaningTh: 'ตัดสินชี้ขาดข้อพิพาทโดยอนุญาโตตุลาการ', exampleEn: 'The chamber was selected to arbitrate the commercial breach.', category: 'Contracts', manaCost: 4 },
  { word: 'Indemnity', partOfSpeech: 'n.', 'meaningTh': 'การชดใช้ค่าสินไหมทดแทน', exampleEn: 'The clause provides indemnity against intellectual property suits.', category: 'Contracts', manaCost: 5 },
  { word: 'Binding', partOfSpeech: 'adj.', meaningTh: 'มีผลผูกพันทางกฎหมาย', exampleEn: 'Both parties signed a legally binding agreement.', category: 'Contracts', manaCost: 3 },
  { word: 'Clause', partOfSpeech: 'n.', meaningTh: 'มาตราหรือข้อกำหนดย่อยในสัญญา', exampleEn: 'Review the confidentiality clause before signing.', category: 'Contracts', manaCost: 2 },
  { word: 'Stipulation', partOfSpeech: 'n.', meaningTh: 'ข้อตกลงหรือเงื่อนไขบังคับ', exampleEn: 'The seller agreed to the buyer’s delivery stipulations.', category: 'Contracts', manaCost: 3 },
  { word: 'Warrant', partOfSpeech: 'v.', meaningTh: 'รับประกันความถูกต้องหรือคุณภาพ', exampleEn: 'The contractor warrants that materials are free from defect.', category: 'Contracts', manaCost: 3 },
  { word: 'Null and void', partOfSpeech: 'adj.', meaningTh: 'เป็นโมฆะและไม่มีผลบังคับ', exampleEn: 'Failure to file within 30 days renders the claim null and void.', category: 'Contracts', manaCost: 4 },
  { word: 'Reciprocal', partOfSpeech: 'adj.', meaningTh: 'ซึ่งมีผลตอบแทนซึ่งกันและกัน', exampleEn: 'The nations agreed on reciprocal tariff exemptions.', category: 'Contracts', manaCost: 4 },
  { word: 'Severable', partOfSpeech: 'adj.', meaningTh: 'ซึ่งสามารถแยกส่วนบังคับใช้ได้', exampleEn: 'Invalid clauses shall be severable from the remaining contract.', category: 'Contracts', manaCost: 4 },
  { word: 'Bilateral', partOfSpeech: 'adj.', meaningTh: 'ระหว่างสองฝ่าย / ทวิภาคี', exampleEn: 'The bilateral pact boosted cross-border commerce.', category: 'Contracts', manaCost: 3 },
  { word: 'Unilateral', partOfSpeech: 'adj.', meaningTh: 'ฝ่ายเดียวโดยไม่มีข้อตกลงร่วม', exampleEn: 'A unilateral cancellation incurs financial penalties.', category: 'Contracts', manaCost: 4 },
  { word: 'Default', partOfSpeech: 'v.', meaningTh: 'ผิดนัดชำระหรือไม่ทำตามสัญญา', exampleEn: 'Borrowers who default forfeit their pledged collateral.', category: 'Contracts', manaCost: 4 },
  { word: 'Litigation', partOfSpeech: 'n.', 'meaningTh': 'การฟ้องร้องดำเนินคดีในศาล', exampleEn: 'The company resolved the dispute outside of costly litigation.', category: 'Contracts', manaCost: 4 },
  { word: 'Injunction', partOfSpeech: 'n.', meaningTh: 'คำสั่งศาลห้ามกระทำการ', exampleEn: 'The judge granted an injunction preventing the patent violation.', category: 'Contracts', manaCost: 5 },
  { word: 'Liability', partOfSpeech: 'n.', meaningTh: 'ความรับผิดชอบตามกฎหมาย', exampleEn: 'The insurer accepted liability for water damage expenses.', category: 'Contracts', manaCost: 3 },
  { word: 'Breach', partOfSpeech: 'n.', meaningTh: 'การละเมิดหรือไม่ปฏิบัติตามสัญญา', exampleEn: 'Leaking trade secrets constitutes a serious breach of contract.', category: 'Contracts', manaCost: 3 },
  { word: 'Signatory', partOfSpeech: 'n.', meaningTh: 'ผู้ลงนามในสนธิสัญญาหรือสัญญา', exampleEn: 'All authorized signatories must countersign the check.', category: 'Contracts', manaCost: 2 },
  { word: 'Tenure', partOfSpeech: 'n.', meaningTh: 'ระยะเวลาการถือครองสิทธิหรือตำแหน่ง', exampleEn: 'His long tenure as chairman fostered organizational stability.', category: 'Contracts', manaCost: 3 },
  { word: 'Disclaim', partOfSpeech: 'v.', meaningTh: 'ปฏิเสธความรับผิดชอบ', exampleEn: 'The vendor disclaims all implied warranties of merchantability.', category: 'Contracts', manaCost: 4 },
  { word: 'Non-disclosure', partOfSpeech: 'n.', meaningTh: 'การไม่เปิดเผยข้อมูลความลับ', exampleEn: 'Contractors must execute a non-disclosure agreement prior to entry.', category: 'Contracts', manaCost: 3 },
];

// โครงสร้างคำศัพท์จำลองคุณภาพสูง 12 หมวด ครอบคลุมคำศัพท์ธุรกิจ TOEIC 700 - 990
// สร้างคำศัพท์เสริมให้ถึงเป้าหมาย 2,000+ คำ
const PREFIXES = [
  'Pre', 'Re', 'De', 'Inter', 'Over', 'Under', 'Sub', 'Trans', 'Non', 'Semi',
  'Multi', 'Auto', 'Cross', 'Co', 'Counter', 'Super', 'Hyper', 'Pro', 'Anti', 'Bio'
];

const BUSINESS_ROOTS = [
  { root: 'audit', def: 'ตรวจสอบบัญชีหรือความถูกต้อง', pos: 'v.', cat: 'Finance' },
  { root: 'allocate', def: 'จัดสรรปันส่วนงบประมาณหรือทรัพยากร', pos: 'v.', cat: 'Finance' },
  { root: 'liquidat', def: 'ชำระสะสางบัญชีหรือแปลงเป็นเงินสด', pos: 'v.', cat: 'Finance' },
  { root: 'diversif', def: 'กระจายการลงทุนหรือผลิตภัณฑ์', pos: 'v.', cat: 'Finance' },
  { root: 'appreciat', def: 'เพิ่มมูลค่าตามกาลเวลา', pos: 'v.', cat: 'Finance' },
  { root: 'amortiz', def: 'ผ่อนชำระหนี้หรือตัดค่าจ่ายตามงวด', pos: 'v.', cat: 'Finance' },
  { root: 'fiscal', def: 'เกี่ยวกับการเงินการคลังของรัฐหรือองค์กร', pos: 'adj.', cat: 'Finance' },
  { root: 'solven', def: 'ความสามารถในการชำระหนี้', pos: 'n.', cat: 'Finance' },
  { root: 'fluctuat', def: 'ผันผวนขึ้นๆ ลงๆ', pos: 'v.', cat: 'Finance' },
  { root: 'compensat', def: 'ชดเชยค่าเสียหายหรือตอบแทน', pos: 'v.', cat: 'Finance' },
  { root: 'negotiat', def: 'เจรจาต่อรองเงื่อนไข', pos: 'v.', cat: 'Contracts' },
  { root: 'arbitrat', def: 'ระงับข้อพิพาทโดยคนกลาง', pos: 'v.', cat: 'Contracts' },
  { root: 'stipulat', def: 'ระบุเงื่อนไขในข้อตกลง', pos: 'v.', cat: 'Contracts' },
  { root: 'authoriz', def: 'มอบอำนาจหรืออนุญาตอย่างเป็นทางการ', pos: 'v.', cat: 'Contracts' },
  { root: 'terminat', def: 'สิ้นสุดหรือบอกเลิกสัญญา', pos: 'v.', cat: 'Contracts' },
  { root: 'ratif', def: 'ให้สัตยาบันหรืออนุมัติข้อตกลง', pos: 'v.', cat: 'Contracts' },
  { root: 'obligat', def: 'ผูกพันตามหน้าที่หรือกฎหมาย', pos: 'v.', cat: 'Contracts' },
  { root: 'promot', def: 'ส่งเสริมการขายหรือเลื่อนตำแหน่ง', pos: 'v.', cat: 'Marketing' },
  { root: 'distribut', def: 'กระจายสินค้าหรือเผยแพร่', pos: 'v.', cat: 'Logistics' },
  { root: 'transport', def: 'ขนส่งลำเลียงสินค้า', pos: 'v.', cat: 'Logistics' },
  { root: 'customiz', def: 'ปรับแต่งตามความต้องการลูกค้า', pos: 'v.', cat: 'Manufacturing' },
  { root: 'automat', def: 'ทำให้เป็นระบบอัตโนมัติ', pos: 'v.', cat: 'Technology' },
  { root: 'synchroniz', def: 'ปรับข้อมูลให้ตรงกันพร้อมกัน', pos: 'v.', cat: 'Technology' },
  { root: 'collaborat', def: 'ร่วมมือทำงานกับทีมอื่น', pos: 'v.', cat: 'Corporate' },
  { root: 'consolidat', def: 'รวบรวมควบรวมให้เป็นหนึ่งเดียว', pos: 'v.', cat: 'Corporate' },
  { root: 'streamlin', def: 'ปรับปรุงขั้นตอนให้กระชับรวดเร็ว', pos: 'v.', cat: 'Corporate' },
  { root: 'evaluat', def: 'ประเมินคุณค่าหรือผลการปฏิบัติงาน', pos: 'v.', cat: 'Human Resources' },
  { root: 'accommodat', def: 'จัดหาที่พักหรืออำนวยความสะดวก', pos: 'v.', cat: 'Hospitality' },
  { root: 'refurbish', def: 'บูรณะปรับปรุงสภาพอาคาร', pos: 'v.', cat: 'Facilities' },
  { root: 'decontaminat', def: 'ชำระล้างสารพิษหรือสิ่งปนเปื้อน', pos: 'v.', cat: 'Safety & Health' },
];

// เพิ่มเติมคำศัพท์มาตรฐานเพื่อเติมเต็มให้ครบ 2,000+ คำ
const rawBank = [];
const seen = new Set();

// เพิ่ม RAW_TERMS ก่อน
RAW_TERMS.forEach((item) => {
  const k = item.word.toLowerCase();
  if (!seen.has(k)) {
    seen.add(k);
    rawBank.push(item);
  }
});

// อ่านพจนานุกรมคำศัพท์ธุรกิจระบบระดับสากลที่มีอยู่เดิมเพื่อสร้างฐานความรู้
const existingJson = require('../prisma/data/toeic-1000-words.json');
existingJson.forEach((w) => seen.add(w.word.toLowerCase()));

// รายชื่อคำศัพท์ธุรกิจ 700+ TOEIC ที่จำเป็นและคำเฉพาะด้าน
const VOCABULARY_LIST = [
  // A
  ['Abbreviate', 'v.', 'ย่อคำหรือข้อความให้สั้นลง', 'Please abbreviate the department names on the corporate badge.', 'Corporate', 2],
  ['Abundance', 'n.', 'ความอุดมสมบูรณ์หรือมีปริมาณมาก', 'The region enjoys an abundance of natural agricultural resources.', 'Logistics', 3],
  ['Accelerate', 'v.', 'เร่งความเร็วหรือผลักดันโครงการ', 'The CFO urged the project team to accelerate implementation.', 'Corporate', 3],
  ['Accentuate', 'v.', 'เน้นย้ำหรือทำให้เด่นชัดขึ้น', 'The redesigned logo accentuates our eco-friendly commitment.', 'Marketing', 4],
  ['Accessible', 'adj.', 'สามารถเข้าถึงได้โดยสะดวก', 'The building ramp makes the lobby accessible for wheelchairs.', 'Facilities', 2],
  ['Accommodate', 'v.', 'รองรับผู้คนหรือปรับตามความต้องการ', 'The boardroom can accommodate up to twenty executives.', 'Facilities', 3],
  ['Accompany', 'v.', 'ไปเป็นเพื่อนหรือแนบเอกสารไปด้วย', 'A detailed catalog must accompany the formal business proposal.', 'Marketing', 2],
  ['Accomplish', 'v.', 'ทำภารกิจหรือเป้าหมายให้สำเร็จลุล่วง', 'She accomplished the sales quota in less than two weeks.', 'Corporate', 2],
  ['Accumulate', 'v.', 'สะสมหรือพอกพูนขึ้นเรื่อยๆ', 'Unpaid interest charges accumulate over prolonged delay periods.', 'Finance', 3],
  ['Accurate', 'adj.', 'ถูกต้องแม่นยำไร้ข้อผิดพลาด', 'Ensure accurate inventory numbers before the annual audit.', 'Finance', 2],
  ['Accustom', 'v.', 'ทำให้คุ้นเคยหรือปรับตัวเข้ากับสภาพ', 'It took several days to accustom himself to the new software.', 'Technology', 2],
  ['Acknowledge', 'v.', 'ตอบรับทราบหรือยืนยันการรับสาร', 'Please acknowledge receipt of this email at your earliest convenience.', 'Corporate', 2],
  ['Acquire', 'v.', 'ได้มาหรือเข้าซื้อกิจการ', 'The tech giant plans to acquire two artificial intelligence startups.', 'Corporate', 3],
  ['Adaptable', 'adj.', 'สามารถปรับตัวได้ดีในสถานการณ์ต่างๆ', 'Agile organizations require an adaptable workforce.', 'Human Resources', 3],
  ['Adequate', 'adj.', 'เพียงพอและได้มาตรฐานขั้นต่ำ', 'The backup generators provide adequate power during blackouts.', 'Facilities', 2],
  ['Adhere', 'v.', 'ยึดมั่นหรือปฏิบัติตามกฎอย่างเคร่งครัด', 'All laboratory chemists must adhere strictly to safety rules.', 'Safety & Health', 3],
  ['Adjacent', 'adj.', 'อยู่ติดกันหรืออยู่ประชิดกัน', 'The cafeteria is located adjacent to the main auditorium.', 'Facilities', 3],
  ['Adjourn', 'v.', 'เลื่อนการประชุมออกไปชั่วคราว', 'The chairperson decided to adjourn the session until tomorrow.', 'Corporate', 4],
  ['Adjustable', 'adj.', 'สามารถปรับระดับหรือตั้งค่าได้', 'The new office chairs feature fully adjustable lumbar support.', 'Facilities', 2],
  ['Administer', 'v.', 'บริหารจัดการหรือกำกับดูแลโครงการ', 'A specialized agency will administer the employee benefits scheme.', 'Human Resources', 3],
  ['Admirable', 'adj.', 'น่ายกย่องและควรค่าแก่การชมเชย', 'Her dedication during the server outage was truly admirable.', 'Human Resources', 3],
  ['Adopt', 'v.', 'รับเอาวิธีหรือนโยบายใหม่มาใช้', 'The factory adopted green manufacturing practices to save energy.', 'Manufacturing', 2],
  ['Advancement', 'n.', 'ความก้าวหน้าในหน้าที่การงาน', 'Career advancement relies on leadership qualities and results.', 'Human Resources', 2],
  ['Adverse', 'adj.', 'ส่งผลเสียหรือเป็นผลลบต่อสถานการณ์', 'Adverse weather conditions halted international flight departures.', 'Hospitality', 4],
  ['Advisable', 'adj.', 'สมควรหรือเป็นสิ่งที่แนะนำให้ทำ', 'It is advisable to review the contract terms with an attorney.', 'Contracts', 2],
  ['Advocate', 'v.', 'สนับสนุนหรือรณรงค์เห็นชอบ', 'Consumer watchdogs advocate for transparent product labeling.', 'Marketing', 3],
  ['Affiliate', 'v.', 'เข้าร่วมเป็นพันธมิตรหรือสาขาในเครือ', 'Local travel agencies affiliate with international booking networks.', 'Hospitality', 3],
  ['Affordable', 'adj.', 'ราคาสมเหตุสมผลที่สามารถจับจ่ายได้', 'The company offers affordable health insurance for all staff.', 'Human Resources', 2],
  ['Aggressive', 'adj.', 'เชิงรุกหรือรวดเร็วและเด็ดขาด', 'The brand launched an aggressive marketing push before Black Friday.', 'Marketing', 3],
  ['Agile', 'adj.', 'คล่องตัวและปรับเปลี่ยนทิศทางได้ไว', 'Our agile development sprint delivered the prototype on time.', 'Technology', 3],
  ['Agreement', 'n.', 'ข้อตกลงหรือสัญญาความร่วมมือ', 'Both parties reached an agreement on licensing royalties.', 'Contracts', 1],
  ['Aisle', 'n.', 'ทางเดินระหว่างแถวที่นั่งหรือชั้นวางของ', 'Please keep the emergency exit aisle clear of boxes at all times.', 'Facilities', 2],
  ['Alienate', 'v.', 'ทำให้ห่างเหินหรือไม่เป็นมิตรต่อกัน', 'Aggressive marketing calls can easily alienate prospective buyers.', 'Customer Relations', 4],
  ['Alleviate', 'v.', 'บรรเทาหรือทำให้อุปสรรคเบาบางลง', 'Opening more lanes helped alleviate customs congestion at the dock.', 'Logistics', 4],
  ['Alliance', 'n.', 'พันธมิตรความร่วมมือทางธุรกิจ', 'The airlines formed a strategic global alliance to share routes.', 'Hospitality', 3],
  ['Allocate', 'v.', 'จัดสรรงบประมาณหรือทรัพยากร', 'Management allocated substantial funds toward digital research.', 'Finance', 3],
  ['Allowance', 'n.', 'เบี้ยเลี้ยงหรือเงินช่วยเหลือเฉพาะกิจ', 'Employees receive a daily travel allowance on international trips.', 'Finance', 2],
  ['Alteration', 'n.', 'การแก้ไขเปลี่ยนแปลงรายละเอียด', 'Any alteration to building blueprints requires architect approval.', 'Facilities', 3],
  ['Alternative', 'n.', 'ทางเลือกอื่นที่ใช้ทดแทนกันได้', 'Biofuels offer a sustainable alternative to conventional diesel.', 'Manufacturing', 2],
  ['Ambassador', 'n.', 'ทูตสันถวไมตรีหรือตัวแทนภาพลักษณ์แบรนด์', 'The athletic star acts as a brand ambassador for sporting gear.', 'Marketing', 3],
  ['Ambiguity', 'n.', 'ความคลุมเครือไม่ชัดเจนในความหมาย', 'Contract drafting must eliminate all ambiguity regarding duties.', 'Contracts', 4],
  ['Amend', 'v.', 'แก้ไขเพิ่มเติมข้อความในกฎหมายหรือสัญญา', 'The board voted to amend the corporate bylaws yesterday.', 'Contracts', 3],
  ['Amenity', 'n.', 'สิ่งอำนวยความสะดวกในโรงแรมหรือสำนักงาน', 'The residential complex includes luxury amenities like a rooftop pool.', 'Hospitality', 3],
  ['Amicable', 'adj.', 'ฉันมิตรและประนีประนอมด้วยดี', 'The business partners reached an amicable settlement.', 'Contracts', 3],
  ['Amplify', 'v.', 'ขยายเสียงหรือเพิ่มผลกระทบให้กว้างขวาง', 'Social media shares amplify our public campaign reach.', 'Marketing', 3],
  ['Analyze', 'v.', 'วิเคราะห์แยกแยะข้อมูลอย่างละเอียด', 'Analysts will analyze the third-quarter financial ratios.', 'Finance', 2],
  ['Ancillary', 'adj.', 'เป็นส่วนเสริมหรือส่งเสริมธุรกิจหลัก', 'The airline earns healthy profits from ancillary baggage fees.', 'Finance', 4],
  ['Anniversary', 'n.', 'วันครบรอบปีของเหตุการณ์สำคัญ', 'The bank celebrated its fiftieth anniversary with a client reception.', 'Corporate', 2],
  ['Annotate', 'v.', 'ทำบันทึกคำอธิบายประกอบเอกสาร', 'Engineers annotate CAD drawings with precise measurements.', 'Manufacturing', 4],
  ['Anonymous', 'adj.', 'ไม่ระบุชื่อตัวตนผู้กระทำ', 'Employees can submit concerns via an anonymous suggestion box.', 'Human Resources', 3],
  ['Anticipate', 'v.', 'คาดการณ์ล่วงหน้าถึงแนวโน้ม', 'Retailers anticipate high consumer demand during the holidays.', 'Marketing', 3],
  ['Apparent', 'adj.', 'เห็นได้ชัดเจนแจ่มแจ้ง', 'It became apparent that the production schedule needed adjustment.', 'Manufacturing', 2],
  ['Applaud', 'v.', 'ปรบมือยกย่องแสดงความชื่นชม', 'The board applauded the managing director for record revenues.', 'Corporate', 2],
  ['Applicable', 'adj.', 'สามารถนำไปปรับใช้ได้จริงหรือเกี่ยวข้อง', 'Attach all applicable receipts when claiming reimbursement.', 'Finance', 2],
  ['Applicant', 'n.', 'ผู้สมัครงานหรือผู้ยื่นคำขอ', 'Each applicant must present two professional references.', 'Human Resources', 1],
  ['Appoint', 'v.', 'แต่งตั้งบุคคลให้ดำรงตำแหน่ง', 'The committee appointed Sarah as the chief compliance officer.', 'Human Resources', 2],
  ['Appraisal', 'n.', 'การประเมินค่าหรือประเมินผลงาน', 'The annual performance appraisal determines salary increments.', 'Human Resources', 3],
  ['Appreciate', 'v.', 'เห็นคุณค่าหรือเพิ่มมูลค่าขึ้น', 'Property values appreciate rapidly in prime business districts.', 'Finance', 2],
  ['Apprentice', 'n.', 'เด็กฝึกงานหรือช่างฝึกหัด', 'The master electrician trained three apprentices on the site.', 'Manufacturing', 3],
  ['Approach', 'n.', 'วิธีการหรือแนวทางเข้าจัดการปัญหา', 'We adopted a client-centric approach to software development.', 'Corporate', 2],
  ['Appropriate', 'adj.', 'เหมาะสมและถูกต้องตามกาลเทศะ', 'Wear appropriate safety footwear when entering the plant floor.', 'Safety & Health', 2],
  ['Approval', 'n.', 'การอนุมัติเห็นชอบอย่างเป็นทางการ', 'The capital expenditure proposal is awaiting board approval.', 'Finance', 2],
  ['Approximate', 'adj.', 'โดยประมาณหรือใกล้เคียงความเป็นจริง', 'The approximate travel time to the downtown terminal is 25 minutes.', 'Hospitality', 2],
  ['Aptitude', 'n.', 'ความถนัดหรือพรสวรรค์ตามธรรมชาติ', 'The candidate demonstrated a keen aptitude for algorithmic logic.', 'Human Resources', 3],
  ['Arbitrary', 'adj.', 'ตามอำเภอใจหรือไร้หลักเกณฑ์ที่แน่นอน', 'The union challenged the supervisor’s arbitrary dismissal decision.', 'Human Resources', 4],
  ['Archive', 'n.', 'คลังจัดเก็บเอกสารและบันทึกประวัติศาสตร์', 'Past payroll registers are cataloged securely in the digital archive.', 'Corporate', 3],
  ['Aspiration', 'n.', 'ความปรารถนาอันแรงกล้าที่จะบรรลุเป้าหมาย', 'Her corporate aspiration is to become vice president before forty.', 'Human Resources', 3],
  ['Assemble', 'v.', 'รวบรวมคนหรือประกอบชิ้นส่วนเข้าด้วยกัน', 'Technicians assemble fifty smartphones per hour on the line.', 'Manufacturing', 2],
  ['Assert', 'v.', 'ยืนยันอย่างมั่นใจในข้อเท็จจริงหรือสิทธิ์', 'The patent holder asserted ownership rights against the copycat.', 'Contracts', 3],
  ['Assess', 'v.', 'ประเมินราคาหรือตรวจสอบสถานการณ์', 'Inspectors will assess the factory roof after the hail storm.', 'Facilities', 2],
  ['Asset', 'n.', 'สินทรัพย์ที่มีมูลค่าของกิจการ', 'Intellectual property represents our most lucrative corporate asset.', 'Finance', 2],
  ['Assignment', 'n.', 'งานหรือหน้าที่ที่ได้รับมอบหมาย', 'His new overseas assignment begins next month in Tokyo.', 'Corporate', 2],
  ['Assimilate', 'v.', 'กลมกลืนปรับตัวเข้ากับสภาพแวดล้อม', 'New joiners assimilate faster with active mentoring programs.', 'Human Resources', 4],
  ['Associate', 'n.', 'เพื่อนร่วมงานหรือหุ้นส่วนทางธุรกิจ', 'She introduced her legal associates during the joint seminar.', 'Corporate', 2],
  ['Assumption', 'n.', 'สมมติฐานหรือข้อสันนิษฐานเบื้องต้น', 'Financial forecasts are based on the assumption of steady inflation.', 'Finance', 3],
  ['Assurance', 'n.', 'การสร้างความมั่นใจหรือการรับประกัน', 'Quality assurance engineers perform rigorous stress testing.', 'Manufacturing', 2],
  ['Astonish', 'v.', 'ทำให้ประหลาดใจเป็นอย่างมาก', 'The unprecedented sales figures astonished the board of directors.', 'Marketing', 3],
  ['Attainable', 'adj.', 'สามารถบรรลุถึงเป้าหมายได้จริง', 'Managers should establish challenging yet attainable sales quotas.', 'Corporate', 3],
  ['Attendance', 'n.', 'การเข้าเรียน การเข้าฟัง หรือการมาร่วมงาน', 'Conference attendance topped three thousand global delegates.', 'Hospitality', 2],
  ['Attentive', 'adj.', 'ใส่ใจและตั้งอกตั้งใจให้บริการ', 'The attentive flight attendants catered to every traveler’s comfort.', 'Hospitality', 2],
  ['Attraction', 'n.', 'สิ่งดึงดูดใจหรือสถานที่ท่องเที่ยวสำคัญ', 'The historical museum remains the city’s top tourist attraction.', 'Hospitality', 1],
  ['Attribute', 'v.', 'ยกให้เป็นผลมาจากหรือให้เครดิตแก่', 'The CEO attributed third-quarter profits to rigorous cost discipline.', 'Corporate', 3],
  ['Audience', 'n.', 'กลุ่มผู้รับฟัง ผู้ชม หรือกลุ่มเป้าหมาย', 'Tailor your presentation style to suit a non-technical audience.', 'Marketing', 1],
  ['Audit', 'n.', 'การตรวจสอบบัญชีและระบบการเงิน', 'The external audit revealed no irregularities in financial statements.', 'Finance', 3],
  ['Authenticate', 'v.', 'พิสูจน์ยืนยันความแท้จริงของเอกสารหรือบุคคล', 'Two-factor tokens authenticate remote user logins.', 'Technology', 3],
  ['Authorize', 'v.', 'มอบอำนาจหรืออนุมัติให้กระทำการ', 'Only the finance director is authorized to sign purchase orders.', 'Corporate', 2],
  ['Automate', 'v.', 'แปลงกระบวนการให้ทำงานด้วยระบบอัตโนมัติ', 'Warehouses automate sorting using robotic conveyor lines.', 'Technology', 2],
  ['Autonomous', 'adj.', 'สามารถปกครองตนเองหรือทำงานอย่างอิสระ', 'The subsidiary operates as an autonomous business unit.', 'Corporate', 4],
  ['Availability', 'n.', 'ความพร้อมใช้งานหรือความว่างของสินค้า/บุคคล', 'Check technician availability on the dispatch calendar.', 'Customer Relations', 2],
  ['Avenue', 'n.', 'ลู่ทาง วิธีการ หรือถนนสายหลัก', 'Management is exploring every avenue to reduce overhead expenses.', 'Corporate', 3],
  ['Avert', 'v.', 'หลีกเลี่ยงหรือป้องกันภัยพิบัติได้ทันท่วงที', 'Early intervention averted a prolonged transport strike.', 'Logistics', 4],
  ['Awareness', 'n.', 'ความตระหนักรู้และความเข้าใจ', 'Public awareness of data privacy has heightened significantly.', 'Technology', 2],
  ['Awkward', 'adj.', 'เคอะเขิน งุ่มง่าม หรือวางตัวลำบาก', 'An awkward silence ensued after the controversial budget cut.', 'Corporate', 3],
];

// สร้างคำศัพท์เพิ่มเติมอีกประมาณ 1,900 คำตามโครงสร้าง TOEIC 700+
// ผสมผสานรากศัพท์คำกริยา นาม คุณศัพท์ และคำบุพบท/สำนวนธุรกิจ
const DOMAIN_EXPANSIONS = [
  'Contracts', 'Finance', 'Marketing', 'Human Resources',
  'Corporate', 'Logistics', 'Manufacturing', 'Technology',
  'Customer Relations', 'Hospitality', 'Facilities', 'Safety & Health'
];

let generatedCount = 0;
const finalNewCards = [];

// เติม VOCABULARY_LIST ก่อน
VOCABULARY_LIST.forEach(([w, pos, th, en, cat, mana]) => {
  if (!seen.has(w.toLowerCase())) {
    seen.add(w.toLowerCase());
    finalNewCards.push({
      word: w,
      partOfSpeech: pos,
      meaningTh: th,
      exampleEn: en,
      category: cat,
      manaCost: mana,
    });
  }
});

// สร้างคำศัพท์ธุรกิจและสำนวน TOEIC อีก 1,900+ คำตามแบบแผน
const SEED_TERMS = [
  // B
  ['Backlog', 'n.', 'งานคั่งค้างหรืองานสั่งซื้อรอส่งมอบ', 'The factory works weekend overtime to clear the manufacturing backlog.', 'Manufacturing', 3],
  ['Bailout', 'n.', 'เงินช่วยเหลือฉุกเฉินกู้วิกฤติต่อลมหายใจ', 'The government approved a financial bailout for distressed airlines.', 'Finance', 4],
  ['Balance sheet', 'n.', 'งบแสดงฐานะทางการเงิน (งบดุล)', 'The balance sheet highlights healthy liquidity and low debt.', 'Finance', 3],
  ['Bandwidth', 'n.', 'ความกว้างของช่องสัญญาณหรือความสามารถในการรับงาน', 'Our development team currently lacks the bandwidth for another project.', 'Technology', 3],
  ['Bankrupt', 'adj.', 'ล้มละลายจนไม่สามารถชำระหนี้', 'Unchecked expansion pushed the boutique retail chain bankrupt.', 'Finance', 2],
  ['Bargain', 'v.', 'ต่อรองราคาเพื่อให้ได้ข้อเสนอที่ดีกว่า', 'Purchasing agents bargain for volume discounts on bulk orders.', 'Contracts', 2],
  ['Barometer', 'n.', 'ดัชนีชี้วัดสถานการณ์หรือแนวโน้ม', 'Consumer spending serves as a dependable economic barometer.', 'Marketing', 4],
  ['Barricade', 'n.', 'แผงกั้นรักษาความปลอดภัย', 'Security erected barricades along the marathon parade route.', 'Facilities', 3],
  ['Benchmark', 'n.', 'เกณฑ์มาตรฐานเปรียบเทียบในอุตสาหกรรม', 'Our turnaround times set the benchmark for parcel logistics.', 'Logistics', 3],
  ['Benefactor', 'n.', 'ผู้มีอุปการคุณหรือผู้บริจาคทุน', 'The research center was endowed by a generous corporate benefactor.', 'Corporate', 4],
  ['Beneficial', 'adj.', 'เป็นประโยชน์และส่งผลดี', 'Regular exercise breaks are beneficial to desk worker focus.', 'Safety & Health', 2],
  ['Beneficiary', 'n.', 'ผู้รับผลประโยชน์ตามกรมธรรม์หรือพินัยกรรม', 'Employees must designate a primary beneficiary for life insurance.', 'Human Resources', 3],
  ['Bidder', 'n.', 'ผู้ประมูลราคาในโครงการ', 'The lowest compliant bidder will be awarded the construction contract.', 'Contracts', 3],
  ['Bilingual', 'adj.', 'สามารถสื่อสารได้คล่องแคล่วสองภาษา', 'Customer support seeks bilingual candidates fluent in Spanish and English.', 'Human Resources', 2],
  ['Blanket', 'adj.', 'ครอบคลุมทั้งหมดทุกกรณีโดยไม่มีข้อยกเว้น', 'The board issued a blanket ban on international non-essential travel.', 'Corporate', 3],
  ['Blueprint', 'n.', 'พิมพ์เขียวหรือแผนแม่บทการดำเนินงาน', 'Architects rolled out the structural blueprints for the datacentre.', 'Facilities', 2],
  ['Boardroom', 'n.', 'ห้องประชุมคณะกรรมการบริษัท', 'Heated discussions occurred in the executive boardroom all morning.', 'Corporate', 2],
  ['Boast', 'v.', 'มีความภูมิใจนำเสนอหรือคุยโอ้อวด', 'The flagship resort boasts ocean-view balconies in every room.', 'Hospitality', 3],
  ['Bond', 'n.', 'พันธบัตรหรือข้อผูกพันทางการเงิน', 'Treasury bonds offer a secure hedge during periods of inflation.', 'Finance', 3],
  ['Bonus', 'n.', 'เงินรางวัลพิเศษหรือโบนัสผลงาน', 'Staff receiving top appraisal marks were granted an annual bonus.', 'Human Resources', 1],
  ['Boom', 'v.', 'เติบโตอย่างรวดเร็วและรุ่งเรือง', 'E-commerce deliveries boomed during the fourth quarter holiday peak.', 'Logistics', 2],
  ['Boost', 'v.', 'เพิ่มพูนหรือส่งเสริมให้ก้าวหน้า', 'Targeted social media ads helped boost our website conversion rate.', 'Marketing', 2],
  ['Boot', 'v.', 'เริ่มเปิดการทำงานของระบบคอมพิวเตอร์', 'The workstation boots into the encrypted corporate environment.', 'Technology', 1],
  ['Bottleneck', 'n.', 'จุดคอขวดที่ทำให้การดำเนินงานล่าช้า', 'Manual document signing created a major bottleneck in approvals.', 'Corporate', 3],
  ['Bottom line', 'n.', 'ผลกำไรสุทธิหรือประเด็นสรุปสำคัญที่สุด', 'Energy efficiency measures improved the firm’s quarterly bottom line.', 'Finance', 3],
  ['Bounce rate', 'n.', 'อัตราผู้เยี่ยมชมเว็บไซต์แล้วกดออกทันที', 'Redesigning the landing page significantly lowered the bounce rate.', 'Marketing', 3],
  ['Boutique', 'n.', 'ร้านค้าหรือบริษัทที่เน้นสินค้าเฉพาะทางระดับพรีเมียม', 'A boutique investment firm acquired equity in the biotech lab.', 'Finance', 3],
  ['Branding', 'n.', 'การสร้างเอกลักษณ์และภาพลักษณ์ตราสินค้า', 'Consistent branding across packaging builds strong consumer loyalty.', 'Marketing', 2],
  ['Breach', 'v.', 'ละเมิดข้อตกลงหรือทำผิดเงื่อนไขสัญญา', 'Disclosing internal prototypes will breach the non-disclosure terms.', 'Contracts', 3],
  ['Breakdown', 'n.', 'การแยกแยะรายการละเอียดหรือการหยุดชะงัก', 'The invoice provides a transparent breakdown of labor and materials.', 'Finance', 2],
  ['Breakthrough', 'n.', 'การค้นพบหรือความก้าวหน้าครั้งสำคัญ', 'The laboratory celebrated a major scientific breakthrough in battery life.', 'Technology', 3],
  ['Bribe', 'n.', 'สินบนหรือสิ่งตอบแทนเพื่อการทุจริต', 'Anti-corruption policies strictly forbid accepting any commercial bribes.', 'Corporate', 3],
  ['Bridge', 'v.', 'เชื่อมโยงหรือลดช่องว่างความแตกต่าง', 'Cross-functional training bridges communication gaps between units.', 'Human Resources', 3],
  ['Briefing', 'n.', 'การสรุปชี้แจงคำแนะนำงานช่วงสั้นๆ', 'The chief architect gave a morning briefing to all site engineers.', 'Corporate', 2],
  ['Broadband', 'n.', 'อินเทอร์เน็ตความเร็วสูง', 'The rural office upgraded to high-speed fiber broadband.', 'Technology', 2],
  ['Brochure', 'n.', 'แผ่นพับหรือหนังสือแนะนำสินค้าและบริการ', 'Hand out full-color product brochures at our convention booth.', 'Marketing', 2],
  ['Broker', 'n.', 'นายหน้าซื้อขายหลักทรัพย์หรืออสังหาริมทรัพย์', 'A licensed broker facilitated the commercial warehouse lease.', 'Finance', 3],
  ['Budget', 'v.', 'จัดสรรงบประมาณล่วงหน้า', 'We must budget carefully for unexpected freight surcharges.', 'Finance', 2],
  ['Buffer', 'n.', 'ส่วนสำรองเผื่อฉุกเฉินหรือกันชน', 'Keep a three-day buffer of raw materials to prevent line shutdowns.', 'Manufacturing', 3],
  ['Bulletin', 'n.', 'แถลงการณ์ข่าวสารหรือประกาศฉุกเฉิน', 'HR published a health bulletin concerning influenza vaccinations.', 'Human Resources', 2],
  ['Bureaucracy', 'n.', 'ระบบราชการหรือขั้นตอนเอกสารที่ยืดยาด', 'Streamlining workflows removed excessive corporate bureaucracy.', 'Corporate', 4],
  ['Burnout', 'n.', 'ภาวะหมดไฟในการทำงานจากความเครียดเรื้อรัง', 'Mandatory paid leave policies aim to mitigate employee burnout.', 'Human Resources', 3],
  ['Bylaws', 'n.', 'ข้อบังคับหรือกฎเกณฑ์การดำเนินงานภายในบริษัท', 'The corporate bylaws require shareholder approval for mergers.', 'Corporate', 4],
  ['Bystander', 'n.', 'ผู้พบเห็นเหตุการณ์หรือบุคคลภายนอก', 'Fortunately, no innocent bystanders were injured in the equipment spill.', 'Safety & Health', 3],
];

SEED_TERMS.forEach(([w, pos, th, en, cat, mana]) => {
  if (!seen.has(w.toLowerCase())) {
    seen.add(w.toLowerCase());
    finalNewCards.push({
      word: w,
      partOfSpeech: pos,
      meaningTh: th,
      exampleEn: en,
      category: cat,
      manaCost: mana,
    });
  }
});

// อ่านชุดคำศัพท์คลังขยายเพื่อสร้างคำเพิ่มเติมให้ถึงเป้าหมาย 2,050 คำ
console.log(`Building additional business vocabulary up to target 2,050 words...`);
const DOMAIN_VOCAB_PACKS = require('./vocab-domain-packs.json');
DOMAIN_VOCAB_PACKS.forEach((card) => {
  const k = card.word.toLowerCase();
  if (!seen.has(k)) {
    seen.add(k);
    finalNewCards.push(card);
  }
});

console.log(`Total raw new cards compiled: ${finalNewCards.length}`);
fs.writeFileSync(path.join(__dirname, 'vocab-raw-bank.json'), JSON.stringify(finalNewCards, null, 2), 'utf8');
console.log('Saved vocab-raw-bank.json successfully!');
