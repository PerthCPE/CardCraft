// ============================================================================
// frontend/src/data/questions/generate-p5.js
// 50 Authentic TOEIC Part 5 (Incomplete Sentences) Questions
// Grammar, Word Families, Collocations, Prepositions, and Business Vocabulary
// ============================================================================

const fs = require('fs');
const path = require('path');

const part5Data = [
  {
    num: 1,
    sentence: "The executive committee reached a final _______ regarding the proposed factory expansion in Vietnam.",
    a: "decide",
    b: "decision",
    c: "decisive",
    d: "decisively",
    correct: "B",
    tag: "Part 5 - Word Family (Noun)",
    exp: "โครงสร้างหลังคำคุณศัพท์ 'final' ต้องการคำนาม (Noun) คือ 'decision' (การตัดสินใจ) เพื่อทำหน้าที่เป็นกรรมของกริยา 'reached'"
  },
  {
    num: 2,
    sentence: "All personnel must strictly _______ with the revised occupational health and safety protocols.",
    a: "comply",
    b: "compliance",
    c: "compliant",
    d: "compliantly",
    correct: "A",
    tag: "Part 5 - Word Family (Verb)",
    exp: "หลัง Modal verb 'must' และกริยาวิเศษณ์ 'strictly' ต้องตามด้วยกริยารูปแท้ไม่ผัน (V.inf) คือ 'comply' (ปฏิบัติตามกฎ) ใช้คู่กับบุพบท 'with'"
  },
  {
    num: 3,
    sentence: "The senior accountant reviewed the ledger _______ to ensure no discrepancies remained undetected.",
    a: "careful",
    b: "carefully",
    c: "carefulness",
    d: "caring",
    correct: "B",
    tag: "Part 5 - Word Family (Adverb)",
    exp: "ตำแหน่งท้ายประโยคทำหน้าที่ขยายกริยา 'reviewed' จึงต้องการกริยาวิเศษณ์ (Adverb) คือ 'carefully' (อย่างละเอียดรอบคอบ)"
  },
  {
    num: 4,
    sentence: "CardCraft offers an _______ training program designed to prepare candidates for executive roles.",
    a: "extensive",
    b: "extend",
    c: "extension",
    d: "extensively",
    correct: "A",
    tag: "Part 5 - Word Family (Adjective)",
    exp: "ตำแหน่งอยู่หน้าคำนาม 'training program' จึงต้องการคำคุณศัพท์ (Adjective) คือ 'extensive' (ครอบคลุม/กว้างขวาง)"
  },
  {
    num: 5,
    sentence: "The director requested that all department heads _______ their annual budget proposals before Friday.",
    a: "submit",
    b: "submits",
    c: "submitted",
    d: "submitting",
    correct: "A",
    tag: "Part 5 - Subjunctive Mood",
    exp: "โครงสร้าง Subjunctive 'requested that + Subject + [should] + V.inf' บังคับใช้กริยารูปแท้ไม่ผันเสมอ คือ 'submit'"
  },
  {
    num: 6,
    sentence: "The merger between the two telecommunications firms is _______ upon regulatory approval from the antitrust commission.",
    a: "contingent",
    b: "reluctant",
    c: "adjacent",
    d: "persistent",
    correct: "A",
    tag: "Part 5 - Business Collocation",
    exp: "สำนวน 'contingent upon' แปลว่า 'ขึ้นอยู่กับ/มีเงื่อนไขผูกพันกับ' เป็นสำนวนออกสอบบ่อยที่สุดในข้อสอบ TOEIC"
  },
  {
    num: 7,
    sentence: "_______ the severe blizzard caused widespread airport closures, our shipment arrived on schedule.",
    a: "Although",
    b: "Despite",
    c: "Because",
    d: "Unless",
    correct: "A",
    tag: "Part 5 - Conjunction vs Preposition",
    exp: "ข้างหลังเป็นอนุประโยคสมบูรณ์ (S + V: 'the blizzard caused...') และมีความหมายขัดแย้ง จึงต้องใช้สันธาน 'Although' (แม้ว่า) ในขณะที่ 'Despite' ต้องตามด้วยกลุ่มคำนาม"
  },
  {
    num: 8,
    sentence: "Ms. Patel will oversee the product launch _______ Mr. Zhao is away on paternity leave.",
    a: "while",
    b: "during",
    c: "despite",
    d: "between",
    correct: "A",
    tag: "Part 5 - Time Conjunction",
    exp: "ตามด้วยประโยค (S + V: 'Mr. Zhao is away...') จึงต้องใช้ Conjunction คือ 'while' (ในระหว่างที่) ส่วน 'during' ต้องตามด้วยคำนามเท่านั้น"
  },
  {
    num: 9,
    sentence: "Employees who work overtime on national holidays are _______ to receive double their regular hourly wage.",
    a: "eligible",
    b: "capable",
    c: "possible",
    d: "probable",
    correct: "A",
    tag: "Part 5 - Collocation (eligible to)",
    exp: "สำนวน 'be eligible to + V.inf' แปลว่า 'มีสิทธิ์/มีคุณสมบัติเหมาะสมที่จะ...' เป็นคำศัพท์ยอดฮิตในพาร์ทสวัสดิการพนักงาน"
  },
  {
    num: 10,
    sentence: "The marketing department conducted an exhaustive survey _______ determine consumer buying patterns.",
    a: "in order to",
    b: "so that",
    c: "because of",
    d: "in case",
    correct: "A",
    tag: "Part 5 - Infinitive of Purpose",
    exp: "ตามด้วยกริยาไม่ผัน 'determine' เพื่อบอกวัตถุประสงค์ ต้องใช้ 'in order to + V.inf' (เพื่อที่จะ) ส่วน 'so that' ต้องตามด้วย S + Modal + V"
  },
  {
    num: 11,
    sentence: "A new automated security badge system _______ installed throughout the headquarters next weekend.",
    a: "will be",
    b: "has",
    c: "was being",
    d: "were",
    correct: "A",
    tag: "Part 5 - Future Passive Voice",
    exp: "ตัวบอกเวลา 'next weekend' แสดงอนาคต และประธานเป็นสิ่งของ (security badge system) ที่ถูกติดตั้ง จึงต้องใช้ Future Passive 'will be installed'"
  },
  {
    num: 12,
    sentence: "Neither the regional branch manager _______ the assistant supervisors were aware of the revised policy.",
    a: "nor",
    b: "or",
    c: "and",
    d: "both",
    correct: "A",
    tag: "Part 5 - Correlative Conjunction",
    exp: "คำเชื่อมคู่ขนาน 'Neither... nor...' (ไม่ทั้ง...และ...) เป็นกฎไวยากรณ์คู่ที่แน่นอน"
  },
  {
    num: 13,
    sentence: "Our engineering department has consistently _______ innovative solutions to reduce production waste.",
    a: "develop",
    b: "developed",
    c: "developing",
    d: "development",
    correct: "B",
    tag: "Part 5 - Present Perfect Tense",
    exp: "โครงสร้าง Present Perfect 'has + Adverb (consistently) + V.3' จึงต้องใช้ 'developed'"
  },
  {
    num: 14,
    sentence: "The board members commended Ms. Alvarez for her _______ contribution to the company's annual growth.",
    a: "substantially",
    b: "substantial",
    c: "substance",
    d: "substantiate",
    correct: "B",
    tag: "Part 5 - Word Family (Adjective)",
    exp: "อยู่หน้าคำนาม 'contribution' ต้องใช้คำคุณศัพท์ (Adjective) คือ 'substantial' (ยิ่งใหญ่/เป็นกอบเป็นกำ)"
  },
  {
    num: 15,
    sentence: "Dr. Thorne will present his research findings _______ the annual renewable energy conference in Berlin.",
    a: "at",
    b: "on",
    c: "to",
    d: "by",
    correct: "A",
    tag: "Part 5 - Preposition of Place/Event",
    exp: "ใช้บุพบท 'at' กับงานสัมมนา การประชุม หรืองานอีเวนต์เฉพาะ ('at the conference')"
  },
  {
    num: 16,
    sentence: "All travel reimbursement vouchers must be submitted _______ thirty days of completing the business trip.",
    a: "within",
    b: "during",
    c: "among",
    d: "between",
    correct: "A",
    tag: "Part 5 - Preposition of Time Limit",
    exp: "สำนวนบอกกรอบระยะเวลา 'within thirty days of...' (ภายใน 30 วันนับจาก...) ถูกต้องและตรงโครงสร้างที่สุด"
  },
  {
    num: 17,
    sentence: "The contract _______ that all deliverables must be inspected by an independent quality auditor.",
    a: "stipulates",
    b: "stipulate",
    c: "stipulating",
    d: "stipulation",
    correct: "A",
    tag: "Part 5 - Subject-Verb Agreement",
    exp: "ประธาน 'The contract' เป็นเอกพจน์บุรุษที่ 3 กริยาใน Present Simple จึงต้องเติม -s คือ 'stipulates' (ระบุเงื่อนไขในสัญญา)"
  },
  {
    num: 18,
    sentence: "The newly hired administrative assistant showed great _______ in reorganizing the corporate archive.",
    a: "initiate",
    b: "initiative",
    c: "initiator",
    d: "initially",
    correct: "B",
    tag: "Part 5 - Word Family (Noun)",
    exp: "คำว่า 'initiative' แม้ลงท้ายด้วย -ive แต่เป็นคำนามแปลว่า 'ความคิดริเริ่มสร้างสรรค์/ความกระตือรือร้น' หลังคำคุณศัพท์ 'great' จึงต้องใช้ 'initiative'"
  },
  {
    num: 19,
    sentence: "Customers are advised to review their billing invoices _______ to detect any unauthorized charges.",
    a: "periodically",
    b: "periodic",
    c: "period",
    d: "periodical",
    correct: "A",
    tag: "Part 5 - Word Family (Adverb)",
    exp: "ตำแหน่งนี้ขยายการกระทำของกริยา 'review' จึงต้องการกริยาวิเศษณ์ (Adverb) คือ 'periodically' (เป็นระยะๆ/สม่ำเสมอ)"
  },
  {
    num: 20,
    sentence: "The company's investment in automated robotics led to a _______ increase in manufacturing output.",
    a: "remarkable",
    b: "remarkably",
    c: "remark",
    d: "remarking",
    correct: "A",
    tag: "Part 5 - Word Family (Adjective)",
    exp: "อยู่หน้าคำนาม 'increase' ต้องใช้รูปคำคุณศัพท์ 'remarkable' (โดดเด่น/น่าทึ่ง)"
  },
  {
    num: 21,
    sentence: "Please make sure that the conference projector is switched off _______ the end of the presentation.",
    a: "at",
    b: "on",
    c: "with",
    d: "from",
    correct: "A",
    tag: "Part 5 - Prepositional Phrase",
    exp: "สำนวน 'at the end of...' แปลว่า 'เมื่อสิ้นสุด/ตอนท้ายของ...' ใช้คู่กับบุพบท 'at' เสมอ"
  },
  {
    num: 22,
    sentence: "The keynote speaker thanked the organizers for _______ her with such a warm and gracious welcome.",
    a: "providing",
    b: "provide",
    c: "provides",
    d: "provision",
    correct: "A",
    tag: "Part 5 - Gerund after Preposition",
    exp: "หลังบุพบท 'for' คำกริยาต้องอยู่ในรูป Gerund (V-ing) คือ 'providing' (provide someone with something = มอบสิ่งใดให้แก่ใคร)"
  },
  {
    num: 23,
    sentence: "The warranty covers parts and labor, _______ it does not protect against accidental water damage.",
    a: "but",
    b: "so",
    c: "or",
    d: "for",
    correct: "A",
    tag: "Part 5 - Coordinating Conjunction",
    exp: "ประโยคหน้าและหลังขัดแย้งกัน (ประกันครอบคลุมค่าแรงและอะไหล่ แต่ไม่ครอบคลุมความเสียหายจากน้ำ) จึงต้องใช้ 'but'"
  },
  {
    num: 24,
    sentence: "We need to find a _______ solution to our warehouse storage shortage before the peak holiday season.",
    a: "permanent",
    b: "permanently",
    c: "permanence",
    d: "permanency",
    correct: "A",
    tag: "Part 5 - Word Family (Adjective)",
    exp: "อยู่หน้าคำนาม 'solution' ต้องการคำคุณศัพท์ (Adjective) คือ 'permanent' (ถาวร/ยั่งยืน)"
  },
  {
    num: 25,
    sentence: "The research team spent months analyzing data _______ they finalized the clinical trials.",
    a: "before",
    b: "during",
    c: "between",
    d: "among",
    correct: "A",
    tag: "Part 5 - Time Conjunction",
    exp: "ตามด้วยประโยค (S + V: 'they finalized...') เพื่อบอกลำดับเวลาก่อน-หลัง ต้องใช้ 'before' (ก่อนที่)"
  },
  {
    num: 26,
    sentence: "Staff members wishing to enroll in the retirement savings plan should consult _______ their human resources representative.",
    a: "with",
    b: "at",
    c: "for",
    d: "to",
    correct: "A",
    tag: "Part 5 - Preposition Collocation",
    exp: "กริยา 'consult with someone' แปลว่า 'ปรึกษาหารือกับบุคคล' ใช้คู่กับบุพบท 'with'"
  },
  {
    num: 27,
    sentence: "The newly renovated auditorium is _______ larger than our previous meeting facility.",
    a: "significantly",
    b: "significant",
    c: "significance",
    d: "signify",
    correct: "A",
    tag: "Part 5 - Adverb modifying Comparative",
    exp: "ตำแหน่งหน้าคุณศัพท์ขั้นกว่า 'larger' ทำหน้าที่ขยายระดับ ต้องใช้กริยาวิเศษณ์ (Adverb) คือ 'significantly' (อย่างเห็นได้ชัด/อย่างมีนัยสำคัญ)"
  },
  {
    num: 28,
    sentence: "Mr. Sterling is the executive _______ was appointed to lead our international expansion initiative.",
    a: "who",
    b: "which",
    c: "whose",
    d: "whom",
    correct: "A",
    tag: "Part 5 - Relative Pronoun (Subject)",
    exp: "สรรพนามเชื่อมขยายบุคคล 'the executive' และทำหน้าที่เป็นประธานของกริยา 'was appointed' จึงต้องใช้ 'who'"
  },
  {
    num: 29,
    sentence: "The company's legal counsel advised _______ signing the exclusive distribution agreement without further modifications.",
    a: "against",
    b: "upon",
    c: "under",
    d: "from",
    correct: "A",
    tag: "Part 5 - Verb Collocation",
    exp: "สำนวน 'advise against + V-ing' แปลว่า 'แนะนำให้คัดค้าน/เตือนไม่ให้ทำสิ่งนั้น' (ตรงข้ามกับ advise in favor of)"
  },
  {
    num: 30,
    sentence: "All visitors must display their guest security badges _______ entering the laboratory premises.",
    a: "prior to",
    b: "apart from",
    c: "due to",
    d: "in spite of",
    correct: "A",
    tag: "Part 5 - Compound Preposition",
    exp: "สำนวน 'prior to + V-ing/Noun' แปลว่า 'ก่อนหน้าที่จะ...' มีความหมายเท่ากับ 'before'"
  },
  {
    num: 31,
    sentence: "The customer was thoroughly _______ with the prompt resolution of her billing discrepancy.",
    a: "satisfied",
    b: "satisfy",
    c: "satisfaction",
    d: "satisfying",
    correct: "A",
    tag: "Part 5 - Participle Adjective (Emotion)",
    exp: "ประธานเป็นบุคคลรู้สึกพึงพอใจ 'be satisfied with...' ต้องใช้รูป V.3/Participle adjective คือ 'satisfied'"
  },
  {
    num: 32,
    sentence: "Despite the steep rise in raw material prices, the company maintained a _______ profit margin.",
    a: "healthy",
    b: "healthily",
    c: "health",
    d: "healthiness",
    correct: "A",
    tag: "Part 5 - Word Family (Adjective)",
    exp: "อยู่หน้าคำนาม 'profit margin' (อัตรากำไร) ต้องการคุณศัพท์ขยาย คือ 'healthy' (ในเชิงธุรกิจหมายถึง แข็งแกร่ง/งดงาม)"
  },
  {
    num: 33,
    sentence: "The warehouse manager insisted that every package _______ weighed before being loaded onto delivery vans.",
    a: "be",
    b: "is",
    c: "was",
    d: "are",
    correct: "A",
    tag: "Part 5 - Subjunctive Passive",
    exp: "โครงสร้าง Subjunctive 'insisted that + Subject + [should] be + V.3' กริยาช่วย be ต้องอยู่ในรูป base form เสมอ คือ 'be'"
  },
  {
    num: 34,
    sentence: "The director thanked the software development team for their _______ dedication throughout the project.",
    a: "unwavering",
    b: "unwaveringly",
    c: "waver",
    d: "wavered",
    correct: "A",
    tag: "Part 5 - Participial Adjective",
    exp: "อยู่หน้าคำนาม 'dedication' ต้องการคำคุณศัพท์ คือ 'unwavering' (ที่ไม่เปลี่ยนแปลง/แน่วแน่มั่นคง)"
  },
  {
    num: 35,
    sentence: "_______ the CEO nor the Chief Financial Officer was available to comment on the rumor.",
    a: "Neither",
    b: "Either",
    c: "Both",
    d: "Not",
    correct: "A",
    tag: "Part 5 - Correlative Conjunction",
    exp: "ใช้คู่กับ 'nor' ในประโยค จึงต้องขึ้นต้นด้วย 'Neither' ('Neither A nor B')"
  },
  {
    num: 36,
    sentence: "The city council unanimously _______ the building permit for the commercial logistics center.",
    a: "approved",
    b: "approval",
    c: "approving",
    d: "approvingly",
    correct: "A",
    tag: "Part 5 - Main Verb Past Tense",
    exp: "ประธาน 'The city council' และกริยาวิเศษณ์ 'unanimously' ต้องการกริยาแท้ของประโยคในรูปอดีต คือ 'approved' (อนุมัติอย่างเป็นเอกฉันท์)"
  },
  {
    num: 37,
    sentence: "Please verify that all personal belongings are _______ from the overhead compartments before disembarking.",
    a: "removed",
    b: "removing",
    c: "remove",
    d: "removal",
    correct: "A",
    tag: "Part 5 - Passive Voice",
    exp: "ประธาน 'personal belongings' (สัมภาระส่วนตัว) ถูกนำออกไป จึงต้องใช้ Passive Voice 'are removed'"
  },
  {
    num: 38,
    sentence: "The corporate legal department will _______ the proposed merger agreement before executive signing.",
    a: "scrutinize",
    b: "scrutiny",
    c: "scrutinized",
    d: "scrutinizing",
    correct: "A",
    tag: "Part 5 - Modal + Verb Inf",
    exp: "หลัง Modal verb 'will' ต้องตามด้วยกริยารูปแท้ไม่ผัน คือ 'scrutinize' (ตรวจสอบอย่างละเอียดถี่ถ้วน)"
  },
  {
    num: 39,
    sentence: "Sales figures for the electric vehicle division were _______ higher than projected in initial forecasts.",
    a: "substantially",
    b: "substantial",
    c: "substance",
    d: "substantiate",
    correct: "A",
    tag: "Part 5 - Adverb modifying Comparative",
    exp: "ทำหน้าที่ขยายคุณศัพท์ขั้นกว่า 'higher' จึงต้องใช้กริยาวิเศษณ์ (Adverb) คือ 'substantially' (อย่างมีนัยสำคัญ)"
  },
  {
    num: 40,
    sentence: "The human resources department announced that employee performance reviews will begin _______ Monday.",
    a: "on",
    b: "at",
    c: "in",
    d: "to",
    correct: "A",
    tag: "Part 5 - Preposition of Days",
    exp: "ใช้นำหน้าวันในสัปดาห์ (Monday, Tuesday, etc.) ต้องใช้บุพบท 'on' เสมอ"
  },
  {
    num: 41,
    sentence: "The company will _______ all travel expenses incurred by candidates invited for on-site interviews.",
    a: "reimburse",
    b: "reimbursement",
    c: "reimbursable",
    d: "reimbursing",
    correct: "A",
    tag: "Part 5 - Modal + Verb Inf",
    exp: "หลัง Modal verb 'will' ต้องตามด้วยกริยารูปแท้ไม่ผัน (V.inf) คือ 'reimburse' (จ่ายเงินชดเชย/เบิกจ่ายคืน)"
  },
  {
    num: 42,
    sentence: "Our technical support hotline is operated _______ twenty-four hours a day, seven days a week.",
    a: "continuously",
    b: "continuous",
    c: "continuity",
    d: "continue",
    correct: "A",
    tag: "Part 5 - Word Family (Adverb)",
    exp: "ทำหน้าที่ขยายกริยา 'operated' จึงต้องการกริยาวิเศษณ์ (Adverb) คือ 'continuously' (อย่างต่อเนื่องไม่หยุดหย่อน)"
  },
  {
    num: 43,
    sentence: "The international shipping contract is _______ for final review by the senior board of directors.",
    a: "ready",
    b: "readily",
    c: "readiness",
    d: "reading",
    correct: "A",
    tag: "Part 5 - Predicate Adjective",
    exp: "หลัง Linking verb 'is' ต้องการคำคุณศัพท์ (Adjective) คือ 'ready' (พร้อมสำหรับ...)"
  },
  {
    num: 44,
    sentence: "The project coordinator demonstrated an _______ ability to resolve interpersonal disputes among team members.",
    a: "exceptional",
    b: "exceptionally",
    c: "exception",
    d: "except",
    correct: "A",
    tag: "Part 5 - Word Family (Adjective)",
    exp: "อยู่หน้าคำนาม 'ability' (ความสามารถ) ต้องการคำคุณศัพท์ คือ 'exceptional' (ยอดเยี่ยม/เป็นเลิศ)"
  },
  {
    num: 45,
    sentence: "The newly hired logistics coordinator proved to be _______ dependable during peak shipping volumes.",
    a: "highly",
    b: "high",
    c: "height",
    d: "heighten",
    correct: "A",
    tag: "Part 5 - Adverb modifying Adjective",
    exp: "ทำหน้าที่ขยายคำคุณศัพท์ 'dependable' (พึ่งพาได้) ต้องใช้กริยาวิเศษณ์ 'highly' (อย่างยิ่ง/อย่างสูง)"
  },
  {
    num: 46,
    sentence: "The warranty certificate must be presented _______ with the original sales receipt to claim a refund.",
    a: "together",
    b: "apart",
    c: "beside",
    d: "nearly",
    correct: "A",
    tag: "Part 5 - Collocation (together with)",
    exp: "สำนวน 'together with...' แปลว่า 'พร้อมกันกับ/ควบคู่กับ' ใช้คู่กับบุพบท 'with'"
  },
  {
    num: 47,
    sentence: "The executive committee will convene tomorrow morning to discuss the _______ of the regional branch office.",
    a: "relocation",
    b: "relocate",
    c: "relocating",
    d: "relocated",
    correct: "A",
    tag: "Part 5 - Word Family (Noun)",
    exp: "อยู่หลัง Article 'the' และหน้า Preposition 'of' ต้องการคำนาม (Noun) คือ 'relocation' (การย้ายสถานที่ตั้ง)"
  },
  {
    num: 48,
    sentence: "Under the revised guidelines, managers are encouraged to provide constructive feedback _______.",
    a: "regularly",
    b: "regular",
    c: "regularity",
    d: "regulate",
    correct: "A",
    tag: "Part 5 - Word Family (Adverb)",
    exp: "ตำแหน่งท้ายประโยคขยายกริยา 'provide feedback' จึงต้องการกริยาวิเศษณ์ คือ 'regularly' (อย่างสม่ำเสมอ)"
  },
  {
    num: 49,
    sentence: "The procurement team was instructed to purchase office supplies _______ from certified green vendors.",
    a: "exclusively",
    b: "exclusive",
    c: "exclusion",
    d: "excluding",
    correct: "A",
    tag: "Part 5 - Word Family (Adverb)",
    exp: "ขยายการกระทำของกริยา 'purchase' ต้องการกริยาวิเศษณ์ คือ 'exclusively' (โดยเฉพาะเจาะจงเท่านั้น)"
  },
  {
    num: 50,
    sentence: "The new mobile banking application features an intuitive interface that is _______ navigation.",
    a: "conducive to",
    b: "adjacent with",
    c: "capable of",
    d: "reliant for",
    correct: "A",
    tag: "Part 5 - Advanced Business Idiom",
    exp: "สำนวน 'conducive to + Noun' แปลว่า 'เอื้ออำนวยต่อ/ช่วยส่งเสริมให้เกิด...' ตรงกับบริบทการออกแบบอินเทอร์เฟซที่เอื้อต่อการใช้งาน"
  }
];

const formattedQuestions = part5Data.map((item) => ({
  id: `q-read-p5-ext-${String(item.num).padStart(2, '0')}`,
  section: 'READING',
  part: 5,
  audioUrl: null,
  imageUrl: null,
  passageText: null,
  questionText: item.sentence,
  optionA: item.a,
  optionB: item.b,
  optionC: item.c,
  optionD: item.d,
  correctOption: item.correct,
  explanationTh: item.exp,
  tag: item.tag,
}));

fs.writeFileSync(
  path.join(__dirname, 'part5-extended.json'),
  JSON.stringify(formattedQuestions, null, 2),
  'utf8'
);

console.log(`Generated ${formattedQuestions.length} Part 5 extended questions.`);
