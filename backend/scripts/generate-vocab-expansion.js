// ============================================================================
// generate-vocab-expansion.js
// สร้างคำศัพท์ TOEIC 700-990 ธุรกิจเพิ่มเติม 2,000+ คำ (รวมกับเดิม 1,230 เป็น 3,230+ คำ)
// ============================================================================

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const existingFile = path.join(__dirname, '../prisma/data/toeic-1000-words.json');
const frontendFile = path.join(__dirname, '../../frontend/src/data/toeic-1000-words.json');

const existingWords = JSON.parse(fs.readFileSync(existingFile, 'utf8'));
const existingSet = new Set(existingWords.map((w) => w.word.trim().toLowerCase()));

console.log(`Current words: ${existingWords.length}`);

// คลังคำศัพท์คุณภาพสูงและรากศัพท์ TOEIC 12 หมวด
const DOMAIN_DATA = [
  {
    category: 'Contracts',
    bases: [
      ['Adjudicate', 'v.', 'พิจารณาตัดสินชี้ขาดข้อพิพาท', 'The tribunal agreed to adjudicate the dispute promptly.', 4],
      ['Indemnify', 'v.', 'ชดใช้ค่าเสียหาย / คุ้มครองการประกัน', 'The vendor agreed to indemnify the firm against liabilities.', 5],
      ['Rescission', 'n.', 'การบอกเลิกสัญญาอย่างเป็นทางการ', 'The breach justified unilateral rescission of the agreement.', 4],
      ['Fiduciary', 'adj.', 'เกี่ยวกับความไว้วางใจในการดูแลผลประโยชน์', 'Directors have a fiduciary duty toward shareholders.', 5],
      ['Enforceability', 'n.', 'การมีผลบังคับใช้ได้ตามกฎหมาย', 'Legal counsel questioned the enforceability of the non-compete clause.', 3],
      ['Repudiation', 'n.', 'การปฏิเสธไม่ยอมปฏิบัติตามสัญญา', 'Late delivery was construed as an anticipatory repudiation.', 5],
      ['Severability', 'n.', 'การแยกส่วนของสัญญาที่ยังคงมีผล', 'The contract contains a severability clause protecting valid terms.', 4],
      ['Arbitrable', 'adj.', 'ซึ่งสามารถระงับข้อพิพาทด้วยอนุญาโตตุลาการได้', 'All monetary claims are arbitrable under international rules.', 3],
      ['Covenant', 'n.', 'ข้อสัญญาผูกพัน / ข้อตกลงร่วมกัน', 'The borrower agreed to a restrictive financial covenant.', 4],
      ['Discharge', 'v.', 'ปลดเปลื้องภาระหน้าที่ตามสัญญา', 'Both parties were discharged from further contractual duties.', 3],
      ['Signatory', 'n.', 'ผู้ลงนามในสัญญา', 'All principal signatories must execute the agreement in duplicate.', 2],
      ['Nullify', 'v.', 'ทำให้ตกเป็นโมฆะ', 'Any fraudulent disclosure will immediately nullify the policy.', 4],
      ['Remedy', 'n.', 'การเยียวยาแก้ไขข้อเสียหายทางกฎหมาย', 'Injunction is an equitable remedy for proprietary infringement.', 4],
      ['Waiver', 'n.', 'การสละสิทธิ์ตามที่ระบุไว้', 'Signing the waiver forfeits future indemnity rights.', 3],
      ['Surety', 'n.', 'ผู้ค้ำประกันการชำระหนี้', 'The contractor provided a corporate surety bond.', 4],
      ['Default', 'n.', 'การผิดนัดชำระหนี้หรือไม่ปฏิบัติตามสัญญา', 'Failure to pay on maturity constitutes a default.', 3],
      ['Jurisdiction', 'n.', 'เขตอำนาจศาลในการบังคับใช้กฎหมาย', 'Governing law is subject to Singapore jurisdiction.', 3],
      ['Liquidated damages', 'n.', 'ค่าเสียหายที่กำหนดไว้ล่วงหน้าในสัญญา', 'The clause imposes liquidated damages of $500 per day of delay.', 5],
      ['Stipulation', 'n.', 'เงื่อนไขหรือข้อกำหนดเฉพาะ', 'The client added a strict stipulation on delivery timelines.', 3],
      ['Easement', 'n.', 'ภาระจำยอมในสิทธิที่ดิน', 'The company obtained an easement for underground cabling.', 4],
      ['Deposition', 'n.', 'คำให้การเป็นลายลักษณ์อักษรต่อหน้าศาล', 'Witnesses submitted their depositions prior to the trial.', 4],
      ['Affidavit', 'n.', 'หนังสือให้การเป็นลายลักษณ์อักษรพร้อมคำสาบาน', 'The officer signed an official sworn affidavit.', 3],
      ['Annexation', 'n.', 'การแนบท้ายเอกสารสัญญา', 'Please review the schedule of fees in the annexation.', 2],
      ['Counterpart', 'n.', 'คู่ฉบับของเอกสารสัญญา', 'This contract may be executed in multiple counterparts.', 3],
      ['Sublease', 'v.', 'ให้เช่าช่วงต่อแก่บุคคลที่สาม', 'Tenants may not sublease the office without consent.', 2],
    ],
  },
  {
    category: 'Finance',
    bases: [
      ['Amortization', 'n.', 'การตัดจ่ายค่าใช้จ่ายตามงวดเวลา / การผ่อนชำระ', 'The schedule details loan amortization over five years.', 4],
      ['Solvency', 'n.', 'ความสามารถในการชำระหนี้ระยะยาว', 'Auditors verified the long-term solvency of the subsidiary.', 4],
      ['Liquidity', 'n.', 'สภาพคล่องทางการเงิน', 'The bank maintains adequate liquidity to buffer market shocks.', 3],
      ['Dividend', 'n.', 'เงินปันผลต่อหุ้น', 'Shareholders approved an interim dividend payout.', 2],
      ['Accrual', 'n.', 'การบันทึกรายการค้างรับค้างจ่ายทางบัญชี', 'Accrual accounting reflects incurred expenses accurately.', 4],
      ['Valuation', 'n.', 'การประเมินมูลค่าสินทรัพย์หรือกิจการ', 'The initial public offering was based on a conservative valuation.', 4],
      ['Disbursement', 'n.', 'การจ่ายเบิกจ่ายเงินทุน', 'Loan disbursement is scheduled upon construction milestones.', 3],
      ['Debenture', 'n.', 'หุ้นกู้ไม่มีหลักประกัน', 'The corporation issued fixed-rate debentures to institutional buyers.', 5],
      ['Remittance', 'n.', 'การโอนเงินข้ามประเทศหรือชำระเงิน', 'Wire transfer remittances are subject to compliance screening.', 3],
      ['Overhead', 'n.', 'ค่าใช้จ่ายในการดำเนินงานส่วนกลาง', 'Consolidating branch offices reduced administrative overhead.', 2],
      ['Insolvency', 'n.', 'ภาวะมีหนี้สินล้นพ้นตัวหรือไม่สามารถชำระหนี้', 'The retail chain filed for protection due to imminent insolvency.', 4],
      ['Underwrite', 'v.', 'รับประกันการจัดจำหน่ายหลักทรัพย์', 'Major investment banks agreed to underwrite the share issuance.', 4],
      ['Windfall', 'n.', 'ผลกำไรที่ได้รับมาอย่างไม่คาดหมาย', 'Surging commodity prices generated a significant tax windfall.', 3],
      ['Yield', 'n.', 'ผลตอบแทนจากการลงทุนหรือดอกเบี้ย', 'Government bonds offered an attractive annualized yield.', 3],
      ['Annuity', 'n.', 'เงินได้รายปีหรือการจ่ายเงินเป็นงวดสม่ำเสมอ', 'Retirement packages often incorporate a guaranteed annuity.', 4],
      ['Prospectus', 'n.', 'หนังสือชี้ชวนการลงทุน', 'Potential investors should scrutinize the fund prospectus carefully.', 3],
      ['Hedge', 'v.', 'ป้องกันความเสี่ยงจากความผันผวน', 'Importers use currency futures to hedge foreign exchange risk.', 4],
      ['Escrow', 'n.', 'บัญชีคนกลางเพื่อพักเงินรอส่งมอบ', 'Deposit funds are held in escrow pending title verification.', 4],
      ['Arbitrage', 'n.', 'การทำกำไรจากส่วนต่างราคาในสองตลาด', 'Traders exploited the fleeting price arbitrage between exchanges.', 5],
      ['Liabilities', 'n.', 'หนี้สินและภาระผูกพันทางการเงิน', 'Total current liabilities decreased following debt restructuring.', 2],
      ['Collateral', 'n.', 'ทรัพย์สินค้ำประกันเงินกู้', 'Commercial real estate served as collateral for the revolving credit.', 3],
      ['Depreciation', 'n.', 'ค่าเสื่อมราคาของสินทรัพย์ถาวร', 'Machinery depreciation was recorded in the quarterly ledger.', 3],
      ['Surplus', 'n.', 'ยอดส่วนเกิน / เงินเกินดุล', 'The operating budget yielded a healthy fiscal surplus.', 2],
      ['Deficit', 'n.', 'การขาดดุล / ส่วนที่ขาดแคลน', 'Spending cuts narrowed the projected revenue deficit.', 2],
      ['Ledger', 'n.', 'สมุดบัญชีแยกประเภททั่วไป', 'Every transaction is timestamped in the immutable digital ledger.', 3],
    ],
  },
  {
    category: 'Marketing',
    bases: [
      ['Demographic', 'n.', 'ลักษณะประชากรศาสตร์ของกลุ่มเป้าหมาย', 'The streaming platform targets the young urban demographic.', 3],
      ['Penetration', 'n.', 'การเจาะตลาดเข้าถึงกลุ่มผู้บริโภค', 'Aggressive pricing fostered rapid market penetration.', 4],
      ['Affiliate', 'n.', 'พันธมิตรเครือข่ายช่วยกระจายสินค้าหรือโฆษณา', 'Our affiliate network drove thirty percent of digital sales.', 3],
      ['Merchandise', 'v.', 'จัดวางและทำการตลาดส่งเสริมสินค้า', 'Department stores merchandise festive goods well in advance.', 2],
      ['Endorsement', 'n.', 'การรับรองสินค้าโดยบุคคลมีชื่อเสียง', 'Celebrity endorsements bolstered consumer confidence in the brand.', 3],
      ['Positioning', 'n.', 'การวางตำแหน่งทางการตลาดของแบรนด์', 'Strategic brand positioning set the eco-friendly model apart.', 3],
      ['Resonance', 'n.', 'การสร้างความประทับใจสะท้อนในใจผู้บริโภค', 'The campaign struck an emotional resonance with working parents.', 4],
      ['Conversion', 'n.', 'การเปลี่ยนผู้ชมให้กลายเป็นผู้ซื้อสินค้า', 'Optimizing checkout friction boosted the website conversion rate.', 3],
      ['Rollout', 'n.', 'การเปิดตัวผลิตภัณฑ์ใหม่ในวงกว้าง', 'A nationwide rollout is slated for early spring.', 2],
      ['Touchpoint', 'n.', 'จุดเชื่อมต่อสื่อสารระหว่างแบรนด์กับลูกค้า', 'Every service touchpoint shapes brand perception.', 3],
      ['Focus group', 'n.', 'กลุ่มผู้บริโภคตัวอย่างสำหรับการวิจัยตลาด', 'Insights gathered from the focus group refined the packaging.', 2],
      ['Syndicate', 'v.', 'กระจายเนื้อหาหรือสื่อโฆษณาผ่านหลายช่องทาง', 'Media agencies syndicate articles across regional portals.', 4],
      ['Monetize', 'v.', 'แปรเปลี่ยนการมีส่วนร่วมให้เป็นรายได้', 'Content creators monetize subscriber traffic through sponsorships.', 3],
      ['Retention', 'n.', 'การรักษาฐานลูกค้าเก่าให้อยู่กับแบรนด์', 'Customer retention rates improved following loyalty perks.', 3],
      ['Engagement', 'n.', 'การมีปฏิสัมพันธ์และผูกพันกับแบรนด์', 'Interactive quizzes spurred social media engagement.', 2],
      ['Rebranding', 'n.', 'การปรับภาพลักษณ์แบรนด์ใหม่', 'The corporate rebranding refreshed outdated market sentiment.', 3],
      ['Publicity', 'n.', 'การเผยแพร่ข่าวสารประชาสัมพันธ์', 'The charity gala generated favorable publicity for the sponsor.', 2],
      ['Impression', 'n.', 'การแสดงผลของโฆษณาต่อสายตาผู้ชม', 'Digital ads surpassed ten million impressions in week one.', 2],
      ['Collocation', 'n.', 'การจับคู่คำศัพท์หรือการวางสินค้าคู่กัน', 'Strategic collocation near cash registers encouraged impulse buys.', 3],
      ['Differentiation', 'n.', 'การสร้างจุดเด่นที่แตกต่างจากคู่แข่ง', 'Superior warranty terms provide vital product differentiation.', 4],
    ],
  },
  {
    category: 'Human Resources',
    bases: [
      ['Attrition', 'n.', 'อัตราการลาออกของพนักงานตามธรรมชาติ', 'Competitive benefits mitigated natural workforce attrition.', 4],
      ['Appraisal', 'n.', 'การประเมินผลการปฏิบัติงานประจำปี', 'Annual performance appraisals determine bonus allocations.', 3],
      ['Remuneration', 'n.', 'ค่าตอบแทนและผลประโยชน์รวม', 'Executive remuneration includes stock options and healthcare.', 5],
      ['Perquisite', 'n.', 'ผลประโยชน์พิเศษนอกเหนือจากเงินเดือน (Perk)', 'Company cars and club memberships are executive perquisites.', 4],
      ['Probationary', 'adj.', 'ซึ่งอยู่ในช่วงทดลองงาน', 'New recruits undergo a three-month probationary period.', 3],
      ['Absenteeism', 'n.', 'การขาดงานบ่อยครั้งโดยไม่มีเหตุอันควร', 'Flexible hours significantly reduced chronic absenteeism.', 4],
      ['Credential', 'n.', 'หนังสือรับรองคุณวุฒิหรือความสามารถ', 'The applicant holds impressive technical credentials.', 2],
      ['Onboarding', 'n.', 'กระบวนการรับและปฐมนิเทศพนักงานใหม่', 'Structured onboarding helps recruits assimilate into company culture.', 2],
      ['Grievance', 'n.', 'ข้อร้องทุกข์หรือความคับข้องใจในการทำงาน', 'Employees may lodge formal grievances with the HR ombudsman.', 3],
      ['Severance', 'n.', 'เงินชดเชยเมื่อเลิกจ้าง', 'Laid-off staff received six months of severance pay.', 3],
      ['Succession', 'n.', 'การวางแผนสืบทอดตำแหน่งสำคัญ', 'A clear succession plan ensures continuity in leadership.', 3],
      ['Telecommuting', 'n.', 'การทำงานทางไกลจากบ้าน', 'Policies accommodate telecommuting two days per week.', 2],
      ['Headhunter', 'n.', 'นายหน้าจัดหาผู้บริหารระดับสูง', 'The board retained an executive headhunter to find a CFO.', 3],
      ['Flextime', 'n.', 'ระบบเวลาการทำงานที่ยืดหยุ่น', 'Introducing flextime improved work-life balance for parents.', 2],
      ['Mediation', 'n.', 'การไกล่เกลี่ยข้อพิพาทภายในองค์กร', 'Workplace mediation resolved the interpersonal friction.', 3],
      ['Ombudsman', 'n.', 'ผู้ตรวจการรับเรื่องร้องเรียนที่เป็นกลาง', 'The corporate ombudsman investigates whistleblower complaints.', 4],
      ['Compensatory', 'adj.', 'ซึ่งเป็นการชดเชยค่าตอบแทนหรือเวลา', 'Staff working weekends earn compensatory time off.', 3],
      ['Curriculum', 'n.', 'หลักสูตรการฝึกอบรมพัฒนาพนักงาน', 'The leadership curriculum emphasizes emotional intelligence.', 2],
      ['Supervision', 'n.', 'การควบคุมดูแลการทำงานอย่างใกล้ชิด', 'Trainees work under direct managerial supervision.', 2],
      ['Disciplinary', 'adj.', 'เกี่ยวกับการลงโทษทางวินัย', 'Breaches of conduct will trigger formal disciplinary action.', 3],
    ],
  },
  {
    category: 'Corporate',
    bases: [
      ['Divestiture', 'n.', 'การขายทอดสินทรัพย์หรือบริษัทลูกออกไป', 'The conglomerate completed the divestiture of its retail arm.', 5],
      ['Synergy', 'n.', 'การผนึกกำลังเพื่อเพิ่มประสิทธิภาพร่วมกัน', 'The merger unleashed operational synergies across both divisions.', 4],
      ['Quorum', 'n.', 'องค์ประชุมขั้นต่ำในการลงมติ', 'A quorum was present to ratify the annual proxy votes.', 4],
      ['Restructuring', 'n.', 'การปรับโครงสร้างองค์กรหรือการเงิน', 'Corporate restructuring trimmed middle management overhead.', 3],
      ['Chairperson', 'n.', 'ประธานในที่ประชุมหรือประธานกรรมการ', 'The chairperson opened the extraordinary general meeting.', 2],
      ['Consortium', 'n.', 'กลุ่มกิจการร่วมค้าเพื่อดำเนินโครงการใหญ่', 'An international consortium was awarded the airport expansion.', 4],
      ['Turnaround', 'n.', 'การฟื้นฟูกิจการจากภาวะขาดทุนสู่กำไร', 'Strategic restructuring engineered a remarkable profit turnaround.', 4],
      ['Conglomerate', 'n.', 'กลุ่มบริษัทขนาดใหญ่ที่มีหลายธุรกิจในเครือ', 'The industrial conglomerate operates in twelve nations.', 4],
      ['Delegation', 'n.', 'การมอบหมายอำนาจหน้าที่ / คณะผู้แทน', 'Effective leadership requires the thoughtful delegation of tasks.', 3],
      ['Accountability', 'n.', 'ความรับผิดชอบที่พร้อมรับการตรวจสอบ', 'Audits reinforce corporate governance and managerial accountability.', 3],
      ['Subsidiary', 'n.', 'บริษัทย่อยที่มีบริษัทแม่ถือหุ้นใหญ่', 'The tech startup operates as an autonomous subsidiary.', 2],
      ['Acquisition', 'n.', 'การเข้าซื้อกิจการหรือสินทรัพย์', 'The recent acquisition expanded market footprint into Asia.', 3],
      ['Feasibility', 'n.', 'ความเป็นไปได้ในการดำเนินโครงการ', 'Consultants conducted a comprehensive feasibility study.', 3],
      ['Compliance', 'n.', 'การปฏิบัติตามกฎเกณฑ์ข้อบังคับ', 'The compliance team monitors cross-border trade transactions.', 2],
      ['Stakeholder', 'n.', 'ผู้มีส่วนได้ส่วนเสียในกิจการ', 'Community leaders are key stakeholders in factory development.', 2],
      ['Mandate', 'n.', 'อำนาจหน้าที่ที่ได้รับมอบหมายตามข้อตกลง', 'The committee holds a specific mandate to cut emissions.', 3],
      ['Takeover', 'n.', 'การเข้ายึดหรือครอบงำกิจการ', 'Management resisted the unsolicited hostile takeover bid.', 3],
      ['Downsizing', 'n.', 'การลดขนาดองค์กรเพื่อตัดลดค่าใช้จ่าย', 'Downsizing operations helped avert financial default.', 2],
      ['Unanimous', 'adj.', 'เป็นเอกฉันท์โดยไม่มีผู้คัดค้าน', 'The board passed a unanimous resolution supporting the CEO.', 3],
      ['Deliberation', 'n.', 'การปรึกษาหารืออย่างรอบคอบ', 'After hours of deliberation, the committee reached agreement.', 3],
    ],
  },
  {
    category: 'Logistics',
    bases: [
      ['Consignment', 'n.', 'สินค้าที่จัดส่งเป็นล็อต / การฝากขาย', 'The latest consignment of electronics reached port yesterday.', 3],
      ['Bill of lading', 'n.', 'ใบตราส่งสินค้าทางเรือหรือพาหนะ', 'Customs requires the original bill of lading for release.', 4],
      ['Demurrage', 'n.', 'ค่าธรรมเนียมปรับเมื่อขนถ่ายสินค้าล่าช้ากว่ากำหนด', 'Delays at the terminal incurred demurrage charges.', 5],
      ['Intermodal', 'adj.', 'การขนส่งหลายรูปแบบผสมผสาน', 'Intermodal transport combines rail, barge, and trucking.', 4],
      ['Manifest', 'n.', 'ใบแสดงรายการสินค้าหรือผู้โดยสารประจำพาหนะ', 'The cargo manifest listed over twelve thousand containers.', 4],
      ['Transit', 'n.', 'การขนส่งเดินทางระหว่างทาง', 'Cargo damaged in transit is covered under freight insurance.', 2],
      ['Clearance', 'n.', 'การผ่านพิธีการศุลกากรหรือการตรวจสอบ', 'Expedited clearance reduced seaport queue times.', 3],
      ['Procurement', 'n.', 'กระบวนการจัดซื้อจัดหาพัสดุและวัตถุดิบ', 'Centralized procurement lowered component acquisition costs.', 3],
      ['Bottleneck', 'n.', 'จุดคอขวดหรืออุปสรรคที่ทำให้การทำงานชะงัก', 'Port congestion created severe supply chain bottlenecks.', 3],
      ['Fulfillment', 'n.', 'การจัดการคำสั่งซื้อตั้งแต่บรรจุจนส่งมอบ', 'Automated fulfillment centers process thousands of orders hourly.', 2],
      ['Transshipment', 'n.', 'การขนถ่ายเปลี่ยนถ่ายยานพาหนะระหว่างทาง', 'Singapore serves as a pivotal transshipment hub.', 4],
      ['Tariff', 'n.', 'ภาษีศุลกากรสำหรับการนำเข้าส่งออก', 'Higher tariffs were imposed on imported steel billets.', 3],
      ['Expedite', 'v.', 'เร่งรัดกระบวนการให้รวดเร็วขึ้น', 'Please pay the premium surcharge to expedite air shipping.', 3],
      ['Freight', 'n.', 'การขนส่งสินค้าหรือค่าระวางขนส่ง', 'Ocean freight rates stabilized after holiday peaks.', 2],
      ['Inventory', 'n.', 'สินค้าคงคลังและพัสดุในคลัง', 'Barcode scanners streamlined real-time inventory counts.', 2],
      ['Haulage', 'n.', 'การลากจูงขนส่งสินค้าทางบก', 'Road haulage firms faced shortages of qualified drivers.', 4],
      ['Warehousing', 'n.', 'การจัดเก็บสินค้าในคลังสินค้า', 'Cold chain warehousing preserves temperature-sensitive vaccines.', 3],
      ['Drop-shipping', 'n.', 'การส่งสินค้าตรงจากผู้ผลิตถึงลูกค้าปลายทาง', 'E-commerce merchants utilize drop-shipping to eliminate inventory risk.', 3],
      ['Surcharge', 'n.', 'ค่าธรรมเนียมเพิ่มเติมพิเศษ', 'A bunker fuel surcharge was appended to shipping invoices.', 2],
      ['Consolidate', 'v.', 'รวมสินค้าจากหลายแหล่งไว้ในเที่ยวเดียวกัน', 'LCL shipments are consolidated into full container loads.', 3],
    ],
  },
  {
    category: 'Manufacturing',
    bases: [
      ['Throughput', 'n.', 'ปริมาณผลผลิตที่ผลิตได้ต่อหน่วยเวลา', 'Upgrading conveyor belts increased hourly plant throughput.', 4],
      ['Tolerance', 'n.', 'ค่าความคลาดเคลื่อนที่ยอมรับได้ในชิ้นงาน', 'Precision bearings are engineered to micrometer tolerances.', 4],
      ['Calibration', 'n.', 'การสอบเทียบเครื่องมือวัดให้เที่ยงตรง', 'Technicians perform daily calibration of digital scales.', 3],
      ['Prototype', 'n.', 'ชิ้นงานต้นแบบก่อนเริ่มการผลิตจริง', 'Engineers field-tested the prototype under extreme heat.', 3],
      ['Defect', 'n.', 'ตำหนิหรือจุดบกพร่องในชิ้นงาน', 'Quality inspectors flagged a surface defect on the casing.', 2],
      ['Overhaul', 'v.', 'ยกเครื่องซ่อมแซมปรับปรุงขนานใหญ่', 'The assembly line was shut down to overhaul hydraulic pumps.', 3],
      ['Fabrication', 'n.', 'การประดิษฐ์ขึ้นรูปโครงสร้างโลหะหรือชิ้นส่วน', 'The shipyard excels in custom steel fabrication.', 3],
      ['Subassembly', 'n.', 'ชุดประกอบย่อยของชิ้นส่วนเครื่องจักร', 'Engine subassemblies arrive pre-tested from Tier-1 suppliers.', 4],
      ['Downtime', 'n.', 'เวลาที่เครื่องจักรหรือระบบต้องหยุดทำงาน', 'Preventive lubrication prevented costly unscheduled downtime.', 2],
      ['Workmanship', 'n.', 'ฝีมือและความประณีตของช่าง', 'Handcrafted furniture is renowned for impeccable workmanship.', 3],
      ['Automation', 'n.', 'ระบบอัตโนมัติในการผลิต', 'Factory automation improved consistency and reduced labor costs.', 2],
      ['Batch', 'n.', 'การผลิตสินค้าเป็นชุดหรือล็อต', 'The entire batch of pharmaceuticals passed microbial screening.', 2],
      ['Quota', 'n.', 'โควตาหรือเป้าหมายปริมาณการผลิต', 'Workers surpassed the monthly output quota ahead of schedule.', 2],
      ['Specification', 'n.', 'รายละเอียดข้อกำหนดเฉพาะของชิ้นงาน', 'Parts must conform strictly to aerospace specifications.', 2],
      ['Assembly', 'n.', 'การประกอบชิ้นส่วนขึ้นเป็นผลิตภัณฑ์', 'Robotic arms accelerate electronic circuit board assembly.', 2],
      ['Wear and tear', 'n.', 'การสึกหรอตามสภาพการใช้งานปกติ', 'The warranty covers defects, excluding ordinary wear and tear.', 2],
      ['Plant', 'n.', 'โรงงานอุตสาหกรรมหรือโรงผลิต', 'The automaker inaugurated a state-of-the-art battery plant.', 2],
      ['Machining', 'n.', 'การตัดกลึงขึ้นรูปโลหะด้วยเครื่องจักร', 'CNC machining ensures tight dimensional accuracy.', 3],
      ['Output', 'n.', 'ปริมาณผลผลิตโดยรวม', 'Industrial output rebounded strongly following supply fixes.', 2],
      ['Yield', 'n.', 'สัดส่วนชิ้นงานดีที่ผลิตได้ต่อวัตถุดิบทั้งหมด', 'Wafer yield improvements drove down microchip manufacturing costs.', 3],
    ],
  },
  {
    category: 'Technology',
    bases: [
      ['Redundancy', 'n.', 'ระบบสำรองข้อมูลเพื่อความต่อเนื่องของบริการ', 'Dual data centers provide geographic redundancy.', 4],
      ['Scalability', 'n.', 'ความสามารถในการขยายขนาดรองรับการเติบโต', 'Microservices architecture guarantees horizontal scalability.', 3],
      ['Latency', 'n.', 'ระยะเวลาหน่วงในการตอบสนองของระบบ', 'Edge servers reduce video streaming latency for end users.', 4],
      ['Vulnerability', 'n.', 'ช่องโหว่ด้านความปลอดภัยของซอฟต์แวร์', 'A patch was deployed to resolve the critical API vulnerability.', 3],
      ['Encryption', 'n.', 'การเข้ารหัสข้อมูลเพื่อความปลอดภัย', 'Customer credentials are secure with end-to-end encryption.', 3],
      ['Bandwidth', 'n.', 'ความจุช่องสัญญาณในการส่งผ่านข้อมูล', 'High-bandwidth fiber connects remote regional offices.', 2],
      ['Deployment', 'n.', 'การติดตั้งปล่อยระบบหรือซอฟต์แวร์ขึ้นใช้งานจริง', 'Continuous integration pipelines automate software deployment.', 3],
      ['Firmware', 'n.', 'ซอฟต์แวร์ควบคุมการทำงานระดับฮาร์ดแวร์', 'The router rebooted after updating to the latest firmware.', 3],
      ['Architecture', 'n.', 'สถาปัตยกรรมโครงสร้างระบบสารสนเทศ', 'Cloud-native architecture enhances organizational agility.', 3],
      ['Repository', 'n.', 'คลังจัดเก็บซอร์สโค้ดและชุดข้อมูล', 'Developers submit pull requests to the central code repository.', 3],
      ['Outage', 'n.', 'เหตุขัดข้องที่ระบบหยุดทำงานชั่วคราว', 'A sudden power surge caused a two-hour server outage.', 2],
      ['Authentication', 'n.', 'การพิสูจน์ยืนยันตัวตนผู้ใช้งาน', 'Multi-factor authentication protects corporate workstations.', 3],
      ['Algorithm', 'n.', 'ชุดคำสั่งประมวลผลตามขั้นตอนทางคณิตศาสตร์', 'Search algorithms index new content within milliseconds.', 3],
      ['Interoperability', 'n.', 'ความสามารถในการทำงานเชื่อมต่อร่วมกันของระบบ', 'Open standards foster software interoperability across vendors.', 4],
      ['Downtime', 'n.', 'ช่วงเวลาที่ระบบไม่พร้อมให้บริการ', 'Scheduled maintenance was performed during off-peak downtime.', 2],
      ['Legacy', 'adj.', 'ระบบคอมพิวเตอร์รุ่นเก่าที่ยังใช้งานอยู่', 'Migrating off legacy databases reduced maintenance costs.', 3],
      ['Bandwidth', 'n.', 'ขีดความสามารถในการรับส่งข้อมูล', 'Streaming 4K video consumes significant network bandwidth.', 2],
      ['Repository', 'n.', 'ที่จัดเก็บไฟล์และซอฟต์แวร์ศูนย์กลาง', 'Source code revisions are tracked in a version-controlled repository.', 3],
      ['Bug', 'n.', 'ข้อผิดพลาดในโปรแกรมคอมพิวเตอร์', 'The development team squashed the memory leak bug.', 1],
      ['Patch', 'n.', 'โปรแกรมแก้ไขปรับปรุงซ่อมแซมช่องโหว่', 'Install the operating system security patch without delay.', 2],
    ],
  },
  {
    category: 'Customer Relations',
    bases: [
      ['Rapport', 'n.', 'สัมพันธภาพอันดีและความเข้าอกเข้าใจกัน', 'Frontline staff build immediate rapport with upset patrons.', 4],
      ['Escalation', 'n.', 'การส่งต่อเรื่องร้องเรียนสู่ระดับบริหารที่สูงขึ้น', 'Unresolved billing complaints require managerial escalation.', 3],
      ['Resolution', 'n.', 'การแก้ไขปัญหาหรือข้อร้องเรียนจนสำเร็จ', 'First-call resolution is our primary service metric.', 3],
      ['Empathy', 'n.', 'ความเข้าอกเข้าใจและเห็นใจความรู้สึกลูกค้า', 'Active listening conveys genuine empathy during service calls.', 3],
      ['Courteous', 'adj.', 'สุภาพนอบน้อมและให้เกียรติ', 'Representatives are trained to remain calm and courteous.', 2],
      ['Touchpoint', 'n.', 'จุดติดต่อสื่อสารที่ลูกค้ามีกับองค์กร', 'Each customer touchpoint should reinforce service excellence.', 3],
      ['Patron', 'n.', 'ลูกค้าประจำหรือผู้อุปถัมภ์ใช้บริการ', 'Loyal patrons enjoy priority booking and complimentary upgrades.', 2],
      ['Retention', 'n.', 'การรักษาลูกค้าเดิมให้อยู่กับบริการอย่างต่อเนื่อง', 'Personalized offers enhanced annual customer retention.', 3],
      ['Inquiry', 'n.', 'การสอบถามข้อมูลหรือข้อสงสัย', 'Helpdesk agents respond to online inquiries within one hour.', 2],
      ['Feedback', 'n.', 'ข้อเสนอแนะและคำติชมจากผู้ใช้บริการ', 'Customer survey feedback led to streamlined onboarding.', 2],
      ['Ticketing', 'n.', 'ระบบจัดการบัตรคิวข้อร้องเรียนของลูกค้า', 'The IT service desk implemented automated ticketing.', 2],
      ['Satisfaction', 'n.', 'ความพึงพอใจของลูกค้าต่อสินค้าหรือบริการ', 'Client satisfaction scores hit a five-year peak.', 2],
      ['Helpline', 'n.', 'สายด่วนให้ความช่วยเหลือลูกค้า', 'The toll-free helpline operates twenty-four hours daily.', 1],
      ['Advocacy', 'n.', 'การสนับสนุนและบอกต่อในทางที่ดีต่อแบรนด์', 'Exceptional service transforms users into brand advocates.', 3],
      ['Grievance', 'n.', 'เรื่องร้องเรียนเกี่ยวกับความบกพร่องของบริการ', 'The client expressed a formal grievance over billing errors.', 3],
      ['Reassurance', 'n.', 'คำยืนยันปลอบประโลมให้คลายความกังวล', 'Support agents provided reassurance regarding data protection.', 3],
      ['Proactive', 'adj.', 'ซึ่งเชิงรุกและคาดการณ์ป้องกันไว้ก่อน', 'Proactive communication preempts common billing disputes.', 3],
      ['Turnaround', 'n.', 'ระยะเวลาตั้งแต่รับเรื่องจนดำเนินการแล้วเสร็จ', 'The support team achieved a four-hour ticket turnaround.', 3],
      ['Dissatisfaction', 'n.', 'ความไม่พึงพอใจในคุณภาพสินค้าหรือบริการ', 'Prompt refunds alleviated customer dissatisfaction.', 3],
      ['Accommodating', 'adj.', 'ซึ่งให้ความร่วมมือและยินดีช่วยเหลือ', 'The hotel concierge was exceptionally accommodating with late checkout.', 3],
    ],
  },
  {
    category: 'Hospitality',
    bases: [
      ['Concierge', 'n.', 'เจ้าหน้าที่บริการอำนวยความสะดวกในโรงแรม', 'The concierge secured last-minute theater tickets for guests.', 4],
      ['Complimentary', 'adj.', 'อภินันทนาการฟรีโดยไม่คิดค่าใช้จ่าย', 'Guests enjoy complimentary breakfast buffet and high-speed Wi-Fi.', 2],
      ['Itinerary', 'n.', 'กำหนดการเดินทางท่องเที่ยวอย่างละเอียด', 'The travel agency provided a comprehensive tour itinerary.', 3],
      ['Accommodation', 'n.', 'ที่พักอาศัยชั่วคราวระหว่างเดินทาง', 'Corporate rates cover executive suite accommodations.', 2],
      ['Hospitality', 'n.', 'การต้อนรับขับสู้และการบริการที่อบอุ่น', 'Southern hospitality charmed international conference attendees.', 2],
      ['Excursion', 'n.', 'การท่องเที่ยวทัศนศึกษาช่วงสั้นๆ', 'The cruise offers guided shore excursions at each port of call.', 3],
      ['Banquet', 'n.', 'งานเลี้ยงอาหารค่ำอย่างเป็นทางการ', 'The annual gala banquet seated five hundred distinguished guests.', 3],
      ['Valet', 'n.', 'พนักงานบริการรับจอดรถหรือบริการซักรีด', 'Complimentary valet parking is available at the main entrance.', 2],
      ['Luggage', 'n.', 'กระเป๋าสัมภาระสำหรับเดินทาง', 'Baggage handlers transferred checked luggage to the connecting flight.', 2],
      ['Charter', 'v.', 'เช่าเหมาลำเครื่องบินหรือเรือ', 'The corporation decided to charter a private jet for executives.', 3],
      ['Reservation', 'n.', 'การจองห้องพักหรือโต๊ะล่วงหน้า', 'Please confirm your dinner reservation twenty-four hours in advance.', 1],
      ['Voucher', 'n.', 'คูปองหรือบัตรกำนัลแทนเงินสด', 'Displaced passengers received hotel and meal vouchers.', 2],
      ['Amenities', 'n.', 'สิ่งอำนวยความสะดวกในห้องพักและโรงแรม', 'In-room amenities include an espresso maker and plush bathrobes.', 3],
      ['Catering', 'n.', 'บริการจัดเลี้ยงอาหารและเครื่องดื่ม', 'Local gourmet caterers handled the executive luncheon.', 2],
      ['Continental', 'adj.', 'อาหารเช้าแบบยุโรปเบาๆ (ขนมปัง กาแฟ ผลไม้)', 'A continental breakfast is served daily in the atrium.', 2],
      ['Cancellation', 'n.', 'การขอยกเลิกการสำรองที่นั่งหรือห้องพัก', 'Check the hotel cancellation policy prior to booking.', 2],
      ['Transit', 'n.', 'การรอเปลี่ยนเที่ยวบินระหว่างทาง', 'Passengers relaxed in the airport transit lounge.', 2],
      ['Shuttle', 'n.', 'รถรับส่งรับผู้โดยสารตามเส้นทางประจำ', 'An airport shuttle departs from terminal three every fifteen minutes.', 1],
      ['Check-in', 'n.', 'การลงทะเบียนเข้าพักหรือรับบัตรโดยสาร', 'Express kiosks expedite flight check-in for travelers with carry-on bags.', 1],
      ['Boarding', 'n.', 'การขึ้นสู่อากาศยานหรือยานพาหนะ', 'Boarding commences forty-five minutes prior to departure.', 1],
    ],
  },
  {
    category: 'Facilities',
    bases: [
      ['Refurbishment', 'n.', 'การบูรณะตกแต่งปรับปรุงอาคารใหม่', 'The headquarters underwent an extensive interior refurbishment.', 4],
      ['Premises', 'n.', 'สถานที่ อาคาร และบริเวณโดยรอบ', 'Smoking is strictly prohibited anywhere on company premises.', 2],
      ['Occupancy', 'n.', 'อัตราการเข้าอยู่อาศัยหรือใช้อาคาร', 'Office occupancy rates stabilized at eighty-five percent.', 3],
      ['Zoning', 'n.', 'การกำหนดผังเมืองและการใช้ประโยชน์ที่ดิน', 'Municipal zoning regulations permit light commercial development.', 3],
      ['Leasehold', 'adj.', 'สิทธิการเช่าอสังหาริมทรัพย์ตามสัญญา', 'The retailer acquired long-term leasehold rights in the mall.', 4],
      ['Custodial', 'adj.', 'เกี่ยวกับการทำความสะอาดและดูแลรักษาอาคาร', 'Custodial staff sanitize conference rooms each evening.', 3],
      ['Ventilation', 'n.', 'ระบบระบายและถ่ายเทอากาศในอาคาร', 'Modern HVAC units provide superior fresh air ventilation.', 2],
      ['Spatial', 'adj.', 'เกี่ยวกับพื้นที่และระยะห่างในการจัดวาง', 'Open-concept offices require careful spatial planning.', 4],
      ['Renovation', 'n.', 'การปรับปรุงซ่อมแซมอาคารสถานที่', 'Store renovations forced temporary relocation across the street.', 2],
      ['Maintenance', 'n.', 'การบำรุงรักษาซ่อมแซมเชิงป้องกัน', 'Routine elevator maintenance is scheduled for Sunday morning.', 2],
      ['Utility', 'n.', 'ระบบสาธารณูปโภค (น้ำ ไฟฟ้า แก๊ส)', 'Energy-saving fixtures significantly curtailed monthly utility bills.', 2],
      ['HVAC', 'n.', 'ระบบปรับอากาศ ระบายอากาศ และทำความร้อน', 'Building managers replaced aging filters in the central HVAC.', 3],
      ['Square footage', 'n.', 'พื้นที่ใช้สอยเป็นตารางฟุตหรือขนาดพื้นที่', 'The expansion added ten thousand square feet of warehousing.', 2],
      ['Fixture', 'n.', 'เครื่องติดตั้งประจำที่ เช่น หลอดไฟ สุขภัณฑ์', 'All lighting fixtures were upgraded to energy-efficient LEDs.', 2],
      ['Access', 'n.', 'ทางเข้าออกหรือสิทธิการเข้าถึงพื้นที่', 'Keycards grant twenty-four-hour access to the laboratory.', 2],
      ['Blueprint', 'n.', 'พิมพ์เขียวแบบแปลนก่อสร้าง', 'Architects reviewed structural blueprints with civil contractors.', 3],
      ['Inspection', 'n.', 'การตรวจสอบสภาพอาคารและความปลอดภัย', 'The municipal building passed its annual fire inspection.', 2],
      ['Demolition', 'n.', 'การรื้อถอนทุบทำลายสิ่งปลูกสร้างเดิม', 'Demolition permits must be secured before groundbreaking.', 3],
      ['Signage', 'n.', 'ป้ายบอกทางและสัญลักษณ์ในอาคาร', 'Directional signage guided visitors to the main conference hall.', 2],
      ['Plumbing', 'n.', 'ระบบท่อประปาและสุขาภิบาล', 'A licensed plumber repaired the leaking basement pipes.', 2],
    ],
  },
  {
    category: 'Safety & Health',
    bases: [
      ['Ergonomics', 'n.', 'การยศาสตร์ (การออกแบบอุปกรณ์ให้เข้ากับสรีระ)', 'Ergonomics workshops taught employees proper desk posture.', 4],
      ['Mitigation', 'n.', 'การบรรเทาหรือลดความรุนแรงของอันตราย', 'Hazard mitigation plans prevent factory chemical spills.', 4],
      ['Evacuation', 'n.', 'การอพยพผู้คนออกจากพื้นที่อันตราย', 'The safety officer conducted a surprise fire evacuation drill.', 2],
      ['Sanitation', 'n.', 'สุขอนามัยและการรักษาสุขภาพอนามัย', 'Food processing plants adhere to stringent sanitation protocols.', 3],
      ['Hazardous', 'adj.', 'ที่เป็นอันตรายร้ายแรงต่อสุขภาพหรือความปลอดภัย', 'Workers must wear respirators when handling hazardous solvents.', 2],
      ['Adherence', 'n.', 'การปฏิบัติตามกฎเกณฑ์ความปลอดภัยอย่างเคร่งครัด', 'Strict adherence to safety guidelines eliminated zero-injury records.', 4],
      ['Precaution', 'n.', 'ข้อควรระวังเพื่อป้องกันอุบัติเหตุ', 'Wearing protective eyewear is an essential lab precaution.', 2],
      ['Decontamination', 'n.', 'การกำจัดสารปนเปื้อนหรือเชื้อโรค', 'Hazmat teams completed bio-decontamination of the ward.', 5],
      ['Fatigue', 'n.', 'ความเหนื่อยล้าสะสมจากการทำงานหนัก', 'Long shift rotations induce physical and mental fatigue.', 3],
      ['Protective', 'adj.', 'ซึ่งป้องกันหรือคุ้มครองความปลอดภัย', 'Steel-toed boots are mandatory protective gear on site.', 2],
      ['Compliance', 'n.', 'การปฏิบัติตามมาตรฐานความปลอดภัย', 'Occupational health compliance is audited semi-annually.', 3],
      ['Respirator', 'n.', 'หน้ากากกรองอากาศป้องกันฝุ่นควันสารเคมี', 'Painters must wear fitted respirators inside spray booths.', 3],
      ['First aid', 'n.', 'การปฐมพยาบาลเบื้องต้นเมื่อเกิดอุบัติเหตุ', 'Designated employees hold certified first aid credentials.', 1],
      ['Extinguisher', 'n.', 'ถังดับเพลิงเคมีประจำอาคาร', 'Verify that fire extinguisher pressure gauges indicate full charge.', 2],
      ['Protocol', 'n.', 'ระเบียบปฏิบัติและขั้นตอนความปลอดภัย', 'Follow standard biohazard protocols during chemical cleanups.', 2],
      ['Contaminant', 'n.', 'สิ่งเจือปนหรือสารพิษตกค้าง', 'Air scrubbers filter out toxic industrial contaminants.', 3],
      ['Briefing', 'n.', 'การสรุปชี้แจงคำแนะนำก่อนเริ่มงาน', 'The site foreman held a five-minute morning safety briefing.', 2],
      ['Occupational', 'adj.', 'เกี่ยวเนื่องกับการทำงานหรืออาชีพ', 'Ergonomic chairs prevent chronic occupational back strain.', 3],
      ['Wellbeing', 'n.', 'สุขภาวะที่ดีทั้งทางกายและจิตใจของพนักงาน', 'The corporate wellness initiative promotes employee wellbeing.', 2],
      ['Defibrillator', 'n.', 'เครื่องกระตุกหัวใจไฟฟ้าอัตโนมัติ (AED)', 'Automated external defibrillators are mounted in all elevator lobbies.', 4],
    ],
  },
];

// ขยายคำศัพท์ด้วยรูปแปลงคำ (Word Family Derivations) และคำศัพท์ทางธุรกิจที่จำเป็น
const SUFFIX_RULES = [
  { suffix: 'ly', pos: 'adv.', thPrefix: 'อย่าง', costDelta: 0 },
  { suffix: 'ness', pos: 'n.', thPrefix: 'ความ', costDelta: 1 },
  { suffix: 'ment', pos: 'n.', thPrefix: 'การ', costDelta: 1 },
  { suffix: 'tion', pos: 'n.', thPrefix: 'การ', costDelta: 1 },
  { suffix: 'able', pos: 'adj.', thPrefix: 'ซึ่งสามารถ...ได้', costDelta: 1 },
  { suffix: 'ive', pos: 'adj.', thPrefix: 'ซึ่งมีลักษณะเชิง', costDelta: 1 },
];

// รวบรวมคำศัพท์ใหม่ทั้งหมด
const newCards = [];
let nextIdNum = 1231;

// 1. เพิ่มชุดคำหลักก่อน
DOMAIN_DATA.forEach((domain) => {
  domain.bases.forEach(([word, pos, meaning, example, mana]) => {
    const key = word.trim().toLowerCase();
    if (!existingSet.has(key)) {
      existingSet.add(key);
      newCards.push({
        id: `card-${String(nextIdNum).padStart(4, '0')}`,
        word,
        partOfSpeech: pos,
        meaningTh: meaning,
        exampleEn: example,
        category: domain.category,
        manaCost: Math.min(5, Math.max(1, mana)),
      });
      nextIdNum++;
    }
  });
});

// 2. เสริมคำศัพท์ TOEIC 700+ ออกสอบบ่อยในแต่ละหมวด ให้ครบ 2,000+ คำใหม่
// นำเข้าพจนานุกรมคำศัพท์ธุรกิจระบบระดับสากล
const VOCAB_BANK_EXPANSIONS = require('./vocab-raw-bank.json');

VOCAB_BANK_EXPANSIONS.forEach((item) => {
  const key = item.word.trim().toLowerCase();
  if (!existingSet.has(key)) {
    existingSet.add(key);
    newCards.push({
      id: `card-${String(nextIdNum).padStart(4, '0')}`,
      word: item.word,
      partOfSpeech: item.partOfSpeech || 'v.',
      meaningTh: item.meaningTh,
      exampleEn: item.exampleEn,
      category: item.category || 'Corporate',
      manaCost: item.manaCost || 3,
    });
    nextIdNum++;
  }
});

console.log(`Generated ${newCards.length} brand new distinct TOEIC flashcards.`);

// รวมกับของเดิม
const totalCards = [...existingWords, ...newCards];
console.log(`Total combined cards: ${totalCards.length} (Target: 3000+)`);

// บันทึกลงทั้ง backend และ frontend JSON
fs.writeFileSync(existingFile, JSON.stringify(totalCards, null, 2), 'utf8');
fs.writeFileSync(frontendFile, JSON.stringify(totalCards, null, 2), 'utf8');

console.log('Saved to backend and frontend JSON files successfully!');

// อัปเดตเข้าฐานข้อมูล PostgreSQL ผ่าน Prisma
async function syncDatabase() {
  console.log(`Inserting ${newCards.length} new flashcards into PostgreSQL...`);
  // แบ่ง batch ละ 500 ป้องกัน payload เกิน
  const BATCH_SIZE = 500;
  for (let i = 0; i < newCards.length; i += BATCH_SIZE) {
    const batch = newCards.slice(i, i + BATCH_SIZE);
    await prisma.flashcard.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(`Inserted batch ${i + 1} - ${Math.min(i + BATCH_SIZE, newCards.length)}`);
  }
  const dbCount = await prisma.flashcard.count();
  console.log(`Verified DB Flashcard Count: ${dbCount}`);
  await prisma.$disconnect();
}

syncDatabase().catch((e) => {
  console.error('Error syncing DB:', e);
  process.exit(1);
});
