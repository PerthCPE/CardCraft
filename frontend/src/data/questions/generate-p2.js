// ============================================================================
// frontend/src/data/questions/generate-p2.js
// 50 Authentic TOEIC Part 2 (Question-Response) Questions
// Strictly 3 choices (optionA, optionB, optionC), optionD: null
// ============================================================================

const fs = require('fs');
const path = require('path');

const part2Data = [
  {
    num: 1,
    q: "Where is the annual marketing conference being held this year?",
    a: "At the convention center in Denver.",
    b: "Yes, I attended it last October.",
    c: "Every Tuesday afternoon.",
    correct: "A",
    tag: "Part 2 - Where Question",
    exp: "คำถาม 'Where' ถามสถานที่ ข้อ (A) ระบุสถานที่จัดงาน 'At the convention center in Denver' ถูกต้องที่สุด ส่วน (B) ตอบ Yes กับคำถาม Wh- ซึ่งผิดไวยากรณ์ และ (C) ตอบความถี่ของเวลา"
  },
  {
    num: 2,
    q: "When will the quarterly revenue reports be finalized?",
    a: "By Friday afternoon at the latest.",
    b: "Our accounting team did a great job.",
    c: "In conference room B.",
    correct: "A",
    tag: "Part 2 - When Question",
    exp: "คำถาม 'When' ถามเวลา ข้อ (A) 'By Friday afternoon at the latest' ตอบเวลาตามกำหนดเส้นตายชัดเจน ส่วน (B) เป็นคำชมไม่ใช่เวลา และ (C) ตอบสถานที่"
  },
  {
    num: 3,
    q: "Who is responsible for authorizing travel expense claims?",
    a: "Ms. Tanaka in Human Resources.",
    b: "It was a three-day business trip.",
    c: "No, I haven't received my ticket yet.",
    correct: "A",
    tag: "Part 2 - Who Question",
    exp: "คำถาม 'Who' ถามบุคคลผู้รับผิดชอบ ข้อ (A) ตอบชื่อบุคคลและแผนก 'Ms. Tanaka in Human Resources' ตรงประเด็นที่สุด ส่วน (C) ตอบ No กับคำถาม Wh- ซึ่งไม่ถูกต้อง"
  },
  {
    num: 4,
    q: "Why has the product launch date been rescheduled?",
    a: "Because the software packaging was delayed.",
    b: "At 10:00 AM sharp tomorrow.",
    c: "Yes, the product is very popular.",
    correct: "A",
    tag: "Part 2 - Why Question",
    exp: "คำถาม 'Why' ถามเหตุผล ข้อ (A) ใช้ 'Because...' อธิบายสาเหตุความล่าช้าของบรรจุภัณฑ์ซอฟต์แวร์ ส่วน (B) ตอบเวลา และ (C) ตอบ Yes กับคำถาม Why"
  },
  {
    num: 5,
    q: "How can I access the company's shared drive from home?",
    a: "You need to log in through the secure VPN.",
    b: "About fifteen gigabytes.",
    c: "He drove home around five o'clock.",
    correct: "A",
    tag: "Part 2 - How Question",
    exp: "คำถาม 'How' ถามวิธีการเข้าถึงระบบ ข้อ (A) อธิบายขั้นตอนการล็อกอินผ่าน VPN ส่วน (C) เป็นกับดักเสียงพ้อง 'drove home' ซึ่งเล่นคำกับ 'shared drive' และ 'from home'"
  },
  {
    num: 6,
    q: "What time does the last express train to Chicago depart?",
    a: "Platform number four.",
    b: "At approximately nine thirty tonight.",
    c: "A round-trip ticket, please.",
    correct: "B",
    tag: "Part 2 - What Time Question",
    exp: "คำถาม 'What time' ถามเวลา ข้อ (B) ระบุเวลา 21:30 น. อย่างชัดเจน ส่วน (A) ตอบชานชาลา และ (C) เป็นการสั่งซื้อตั๋ว"
  },
  {
    num: 7,
    q: "How long will the technical maintenance take?",
    a: "It should take about two hours.",
    b: "The technician arrived yesterday.",
    c: "Yes, the system is working well.",
    correct: "A",
    tag: "Part 2 - How Long Question",
    exp: "คำถาม 'How long' ถามระยะเวลา ข้อ (A) ระบุช่วงเวลา 'about two hours' ถูกต้องที่สุด ส่วน (C) ตอบ Yes กับคำถาม Wh-"
  },
  {
    num: 8,
    q: "How much did the new office furniture cost?",
    a: "We purchased twelve ergonomic desks.",
    b: "Just under four thousand dollars.",
    c: "The delivery is scheduled for Tuesday.",
    correct: "B",
    tag: "Part 2 - How Much Question",
    exp: "คำถาม 'How much' ถามราคาค่าใช้จ่าย ข้อ (B) ระบุจำนวนเงิน 'under four thousand dollars' ชัดเจน ส่วน (A) บอกจำนวนชิ้นโต๊ะไม่ใช่ราคา"
  },
  {
    num: 9,
    q: "How often do safety inspectors visit the manufacturing plant?",
    a: "Once every six months.",
    b: "They inspected the boilers thoroughly.",
    c: "Safety glasses are required on the floor.",
    correct: "A",
    tag: "Part 2 - How Often Question",
    exp: "คำถาม 'How often' ถามความถี่ ข้อ (A) 'Once every six months' (ทุกๆ 6 เดือน) ระบุความถี่ได้ตรงคำถามที่สุด"
  },
  {
    num: 10,
    q: "Which caterer did you choose for the client reception?",
    a: "The one that specializes in Mediterranean cuisine.",
    b: "About fifty guests have confirmed.",
    c: "Yes, the food was delicious.",
    correct: "A",
    tag: "Part 2 - Which Question",
    exp: "คำถาม 'Which caterer' ให้เลือกผู้จัดเลี้ยง ข้อ (A) ระบุร้านที่เชี่ยวชาญอาหารเมดิเตอร์เรเนียน ส่วน (B) บอกจำนวนแขกไม่ใช่ร้านอาหาร"
  },
  {
    num: 11,
    q: "Could you help me set up the audiovisual projector in Hall 3?",
    a: "Certainly, I'll be right over with the cables.",
    b: "The project deadline is next Friday.",
    c: "It was a very inspiring documentary.",
    correct: "A",
    tag: "Part 2 - Request for Assistance",
    exp: "ประโยคขอความช่วยเหลือ 'Could you help me...?' ข้อ (A) ตอบรับอย่างสุภาพ 'Certainly, I'll be right over...' ส่วน (B) เป็นกับดักคำว่า 'project' ที่คล้ายกับ 'projector'"
  },
  {
    num: 12,
    q: "Would you like me to review your presentation slides before Monday?",
    a: "Thanks, I would really appreciate your feedback.",
    b: "The slideshow starts in five minutes.",
    c: "Yes, I bought a new laptop yesterday.",
    correct: "A",
    tag: "Part 2 - Offer of Help",
    exp: "ประโยคเสนอความช่วยเหลือ 'Would you like me to...?' ข้อ (A) ตอบรับขอบคุณ 'Thanks, I would really appreciate your feedback' เป็นธรรมชาติและถูกต้องที่สุด"
  },
  {
    num: 13,
    q: "Why don't we take a short break for lunch now?",
    a: "Good idea, I'll close my laptop.",
    b: "Because it was raining heavily.",
    c: "No, he broke the glass by accident.",
    correct: "A",
    tag: "Part 2 - Suggestion",
    exp: "โครงสร้าง 'Why don't we...?' เป็นการชวน/เสนอแนะ ไม่ใช่ถามเหตุผล ข้อ (A) 'Good idea...' เป็นการตอบรับข้อเสนอ ส่วน (B) ตอบ 'Because' ซึ่งหลงทางคิดว่าเป็นคำถาม Why ธรรมดา และ (C) เป็นกับดักคำว่า 'broke' (แตก) เทียบกับ 'break' (พักผ่อน)"
  },
  {
    num: 14,
    q: "Do you happen to know where Ms. Henderson parked her vehicle?",
    a: "She left it on the third level of the parking garage.",
    b: "No, she doesn't work here anymore.",
    c: "A green sedan with four doors.",
    correct: "A",
    tag: "Part 2 - Indirect Where Question",
    exp: "คำถามทางอ้อมถามตำแหน่งที่จอดรถ ข้อ (A) ระบุตำแหน่งชั้น 3 ของอาคารจอดรถได้อย่างตรงจุด"
  },
  {
    num: 15,
    q: "Have you submitted your quarterly budget proposal yet?",
    a: "Not yet, I'm still verifying the travel expenses.",
    b: "The budget committee meets twice a year.",
    c: "Yes, I proposed to her last weekend.",
    correct: "A",
    tag: "Part 2 - Have You Submitted",
    exp: "คำถาม 'Have you submitted... yet?' ข้อ (A) 'Not yet, I'm still verifying...' ตอบได้สมจริงและตรงประเด็น ส่วน (C) เป็นกับดักเล่นคำว่า 'proposed' ในเชิงขอแต่งงาน"
  },
  {
    num: 16,
    q: "Did anyone call while I was attending the board meeting?",
    a: "Yes, Mr. Vance from legal left a message for you.",
    b: "The meeting room has twelve chairs.",
    c: "I'll call you as soon as I arrive.",
    correct: "A",
    tag: "Part 2 - Yes/No Past Inquiry",
    exp: "ถามว่ามีใครโทรมาไหมตอนประชุม ข้อ (A) แจ้งว่าคุณ Vance จากฝ่ายกฎหมายฝากข้อความไว้ เป็นคำตอบที่ถูกต้องตรงสถานการณ์"
  },
  {
    num: 17,
    q: "Are you planning to drive to the regional convention or fly?",
    a: "I decided to take the high-speed train instead.",
    b: "Yes, the flight was delayed by two hours.",
    c: "The convention takes place every summer.",
    correct: "A",
    tag: "Part 2 - Alternative Question",
    exp: "คำถามเลือกอย่างใดอย่างหนึ่ง '...or...' (ขับรถหรือบินไป) ข้อ (A) ตอบทางเลือกอื่น 'I decided to take the train instead' เป็นคำตอบแบบ Real-world TOEIC ที่นิยมออกสอบ ส่วน (B) ตอบ Yes กับคำถาม or ซึ่งผิดหลักไวยากรณ์"
  },
  {
    num: 18,
    q: "Should we order additional printer toner today or wait until Friday?",
    a: "We should order it now so we don't run out.",
    b: "Yes, the printer is very fast.",
    c: "About thirty pages per minute.",
    correct: "A",
    tag: "Part 2 - Alternative Question",
    exp: "คำถามเลือก 'วันนี้หรือรอวันศุกร์' ข้อ (A) ตัดสินใจสั่งวันนี้เพื่อไม่ให้หมึกหมด ส่วน (B) ตอบ Yes กับคำถาม Alternative or ซึ่งผิด"
  },
  {
    num: 19,
    q: "Isn't the new marketing director starting next Monday?",
    a: "Actually, her start date was pushed back to the first of the month.",
    b: "The marketing department is on the fifth floor.",
    c: "Yes, she directed a short commercial.",
    correct: "A",
    tag: "Part 2 - Negative Question",
    exp: "คำถามปฏิเสธ 'Isn't she starting next Monday?' ข้อ (A) ชี้แจงข้อมูลจริงว่าเลื่อนวันเริ่มงานไปต้นเดือน ส่วน (B) ตอบตำแหน่งชั้น และ (C) กับดักคำว่า 'directed' (กำกับหนัง)"
  },
  {
    num: 20,
    q: "You've reviewed the updated vendor contract, haven't you?",
    a: "Yes, and I highlighted a few clauses to discuss.",
    b: "No, the vendor's price was too expensive.",
    c: "The contract is thirty pages long.",
    correct: "A",
    tag: "Part 2 - Tag Question",
    exp: "คำถาม Tag Question ตรวจสอบว่าตรวจสัญญาหรือยัง ข้อ (A) ตอบรับว่าตรวจแล้วพร้อมไฮไลต์ข้อสัญญาไว้พูดคุย ส่วน (B) ตอบเรื่องราคาไม่ใช่การตรวจเอกสาร"
  },
  {
    num: 21,
    q: "The air conditioning in the west conference room seems to be malfunctioning.",
    a: "I'll submit an urgent work order to Facilities right away.",
    b: "The room seats about twenty attendees.",
    c: "Yes, the weather is very pleasant outside.",
    correct: "A",
    tag: "Part 2 - Statement & Problem",
    exp: "ประโยคบอกเล่าแจ้งปัญหา 'แอร์ในห้องประชุมฝั่งตะวันตกเสีย' ข้อ (A) เสนอแนวทางแก้ไข 'เดี๋ยวจะรีบแจ้งใบแจ้งซ่อมไปยังฝ่ายอาคารทันที' ตรงสถานการณ์ที่สุด"
  },
  {
    num: 22,
    q: "Our department exceeded its quarterly sales target by fifteen percent.",
    a: "That's fantastic news! Congratulations to everyone.",
    b: "The sales office is down the corridor.",
    c: "I bought it at a fifteen percent discount.",
    correct: "A",
    tag: "Part 2 - Statement & Good News",
    exp: "ประโยคแจ้งข่าวดี 'ยอดขายเกินเป้า 15%' ข้อ (A) ร่วมยินดี 'That's fantastic news!' ส่วน (C) กับดักคำว่า 'fifteen percent discount' ที่มีตัวเลข 15% เหมือนกัน"
  },
  {
    num: 23,
    q: "I thought the staff orientation was supposed to be held in the auditorium.",
    a: "It was moved to conference room C due to maintenance.",
    b: "Yes, all new employees must attend.",
    c: "The orientation lasted approximately three hours.",
    correct: "A",
    tag: "Part 2 - Statement & Clarification",
    exp: "ประโยคทักท้วงเรื่องสถานที่จัดอบรม ข้อ (A) ชี้แจงว่าย้ายไปห้อง C เพราะมีการซ่อมบำรุงในหอประชุม"
  },
  {
    num: 24,
    q: "Could you recommend a reliable courier service for urgent international packages?",
    a: "Global Express has never let us down on expedited delivery.",
    b: "The package weighs nearly five kilograms.",
    c: "Yes, I received your email yesterday morning.",
    correct: "A",
    tag: "Part 2 - Recommendation Request",
    exp: "ขอคำแนะนำบริษัทส่งพัสดุด่วนระหว่างประเทศ ข้อ (A) แนะนำบริษัท Global Express ที่ไว้ใจได้เรื่องส่งด่วน"
  },
  {
    num: 25,
    q: "Why is the underground parking structure closed this morning?",
    a: "They are resurfacing the concrete on levels one and two.",
    b: "About twenty minutes before nine.",
    c: "No, I parked on the street.",
    correct: "A",
    tag: "Part 2 - Why Question",
    exp: "ถามเหตุผลที่ลานจอดรถชั้นใต้ดินปิด ข้อ (A) อธิบายว่ากำลังเทผิวคอนกรีตใหม่ที่ชั้น 1 และ 2"
  },
  {
    num: 26,
    q: "How many copies of the quarterly financial statement do we need for the meeting?",
    a: "Just print fifteen copies; the rest will join via video call.",
    b: "Yes, the statement was audited yesterday.",
    c: "About thirty dollars per copy.",
    correct: "A",
    tag: "Part 2 - How Many Question",
    exp: "คำถาม 'How many copies' ถามจำนวนชุดเอกสาร ข้อ (A) ระบุพิมพ์ 15 ชุด ส่วนที่เหลือเข้าประชุมผ่านวิดีโอคอล"
  },
  {
    num: 27,
    q: "Who was selected to represent our branch at the international trade summit?",
    a: "Mr. Harrison from the export division was chosen.",
    b: "The summit starts on September 15th.",
    c: "In Geneva, Switzerland.",
    correct: "A",
    tag: "Part 2 - Who Question",
    exp: "ถามว่า 'ใครได้รับเลือกเป็นตัวแทนสาขา' ข้อ (A) ตอบชื่อคุณ Harrison จากแผนกส่งออก ส่วน (B) ตอบวันที่ และ (C) ตอบสถานที่"
  },
  {
    num: 28,
    q: "When is the deadline to submit healthcare benefit enrollment forms?",
    a: "All paperwork is due before 5 PM on Friday.",
    b: "The company offers comprehensive dental coverage.",
    c: "In the Human Resources file cabinet.",
    correct: "A",
    tag: "Part 2 - When Deadline",
    exp: "ถามเส้นตายการส่งแบบฟอร์มสวัสดิการ ข้อ (A) ระบุกำหนดส่ง 'ก่อน 17:00 น. วันศุกร์' ชัดเจน"
  },
  {
    num: 29,
    q: "Where should I file these signed nondisclosure agreements?",
    a: "In the locked metal cabinet behind the reception desk.",
    b: "Both parties signed the document yesterday.",
    c: "Yes, the terms are completely confidential.",
    correct: "A",
    tag: "Part 2 - Where Filing",
    exp: "ถามว่าควรเก็บเอกสาร NDA ไว้ที่ไหน ข้อ (A) ตอบตู้เก็บเอกสารล็อกกุญแจหลังเคาน์เตอร์ต้อนรับ"
  },
  {
    num: 30,
    q: "Do we have enough printed brochures for tomorrow's exhibition?",
    a: "I just checked the storage closet, and we have four boxes left.",
    b: "The exhibition hall opens at 9 AM.",
    c: "Yes, the graphics were designed professionally.",
    correct: "A",
    tag: "Part 2 - Yes/No Inventory",
    exp: "ถามว่าแผ่นพับมีพอไหม ข้อ (A) แจ้งว่าเพิ่งไปตรวจตู้เก็บของมา มีเหลืออยู่ 4 กล่อง"
  },
  {
    num: 31,
    q: "Would you prefer to sit near the window or by the aisle on the flight?",
    a: "An aisle seat would be ideal so I can stretch my legs.",
    b: "Yes, I have already checked in online.",
    c: "The flight departure is on schedule.",
    correct: "A",
    tag: "Part 2 - Alternative Preference",
    exp: "ถามความชอบที่นั่งบนเครื่องบิน (ริมหน้าต่างหรือริมทางเดิน) ข้อ (A) เลือกที่นั่งริมทางเดิน (aisle seat)"
  },
  {
    num: 32,
    q: "Has the technician repaired the elevator in the south wing yet?",
    a: "Not yet, he is still waiting for a replacement cable to arrive.",
    b: "The south wing houses the accounting department.",
    c: "It stops on every floor up to the tenth.",
    correct: "A",
    tag: "Part 2 - Has/Have Status",
    exp: "ถามว่าช่างซ่อมลิฟต์เสร็จหรือยัง ข้อ (A) บอกว่ายัง เพราะกำลังรอสายเคเบิลอะไหล่อยู่"
  },
  {
    num: 33,
    q: "Why didn't you attend the training seminar on cybersecurity?",
    a: "I was dealing with an urgent client server outage at the time.",
    b: "The seminar was held in conference room B.",
    c: "Yes, cybersecurity is vital for our company.",
    correct: "A",
    tag: "Part 2 - Why Past Negative",
    exp: "ถามเหตุผลว่าทำไมไม่เข้าอบรม ข้อ (A) ชี้แจงเหตุผลว่าติดแก้ปัญหาเซิร์ฟเวอร์ลูกค้าล่มอยู่"
  },
  {
    num: 34,
    q: "Could you please forward the invoice from the catering company to Accounting?",
    a: "Sure, I'll scan it and email it over immediately.",
    b: "The banquet served chicken and vegetarian pasta.",
    c: "Accounting is located on the second floor.",
    correct: "A",
    tag: "Part 2 - Polite Request",
    exp: "ขอความกรุณาส่งใบแจ้งหนี้ไปยังฝ่ายบัญชี ข้อ (A) ตอบรับอย่างสุภาพ 'Sure, I'll scan it and email it over immediately'"
  },
  {
    num: 35,
    q: "The client asked whether we could expedite the shipment by two days.",
    a: "Let me check with our warehouse supervisor first.",
    b: "Yes, the shipment contains forty boxes.",
    c: "Expedited shipping costs more than standard freight.",
    correct: "A",
    tag: "Part 2 - Indirect Inquiry Response",
    exp: "บอกเล่าว่าลูกค้าถามว่าจะเร่งการส่งได้ไหม ข้อ (A) ตอบแบบมืออาชีพ 'ขอตรวจสอบกับหัวหน้าคลังสินค้าก่อน'"
  },
  {
    num: 36,
    q: "What is the Wi-Fi password for guests in the executive lounge?",
    a: "It's printed on the small card next to the coffee maker.",
    b: "The lounge closes at eight in the evening.",
    c: "Yes, the internet connection is very stable.",
    correct: "A",
    tag: "Part 2 - What Password",
    exp: "ถามรหัส Wi-Fi สำหรับแขก ข้อ (A) แจ้งว่าพิมพ์อยู่บนการ์ดใบเล็กข้างเครื่องชงกาแฟ"
  },
  {
    num: 37,
    q: "How did you find the keynote address at yesterday's conference?",
    a: "I found it extremely informative, especially the case studies.",
    b: "I took a taxi from the airport to the venue.",
    c: "The keynote speaker was Dr. Aris Thorne.",
    correct: "A",
    tag: "Part 2 - How Opinion Question",
    exp: "สำนวน 'How did you find...?' แปลว่า 'คุณมีความคิดเห็นอย่างไรกับ...' ข้อ (A) ตอบความรู้สึกว่าได้ประโยชน์มาก ส่วน (B) เข้าใจผิดว่าถามวิธีการเดินทาง"
  },
  {
    num: 38,
    q: "Who should I contact if I have questions about my paycheck deduction?",
    a: "Speak with Mr. Perez in the payroll department.",
    b: "Paychecks are deposited every other Thursday.",
    c: "Yes, taxes were deducted automatically.",
    correct: "A",
    tag: "Part 2 - Who Contact",
    exp: "ถามว่าควรติดต่อใครเรื่องการหักเงินเดือน ข้อ (A) แนะนำให้คุยกับคุณ Perez ที่ฝ่ายบัญชีเงินเดือน (payroll)"
  },
  {
    num: 39,
    q: "Isn't the quarterly board meeting scheduled for this Thursday?",
    a: "No, it was postponed until next Tuesday.",
    b: "The board members are very experienced.",
    c: "Yes, I joined the committee last month.",
    correct: "A",
    tag: "Part 2 - Negative Tag Question",
    exp: "ถามเชิงยืนยันว่าการประชุมบอร์ดไม่ได้มีวันพฤหัสนี้เหรอ ข้อ (A) ชี้แจงว่าเลื่อนไปเป็นวันอังคารหน้า"
  },
  {
    num: 40,
    q: "Where can I find additional copies of the employee handbook?",
    a: "They are available for download on the company intranet.",
    b: "All new hires must read the handbook thoroughly.",
    c: "Yes, the handbook covers our vacation policy.",
    correct: "A",
    tag: "Part 2 - Where Digital/Physical",
    exp: "ถามว่าจะหาสำเนาคู่มือพนักงานเพิ่มได้จากที่ไหน ข้อ (A) แจ้งว่าดาวน์โหลดได้จากระบบอินทราเน็ตของบริษัท"
  },
  {
    num: 41,
    q: "Would you mind reviewing the revised budget numbers before I send them to the director?",
    a: "Not at all, leave the spreadsheet on my desk.",
    b: "Yes, the budget was approved last week.",
    c: "The director is currently out of town.",
    correct: "A",
    tag: "Part 2 - Would You Mind",
    exp: "โครงสร้าง 'Would you mind...?' (คุณจะรังเกียจไหมถ้า...) การตอบตกลงช่วยต้องใช้ 'Not at all' (ไม่รังเกียจเลย/ยินดีช่วย) ในข้อ (A)"
  },
  {
    num: 42,
    q: "Are we going to hire an outside contractor or use our in-house maintenance staff?",
    a: "Our internal team should be able to handle it.",
    b: "Yes, the contractor quoted a reasonable price.",
    c: "The building maintenance was completed yesterday.",
    correct: "A",
    tag: "Part 2 - Alternative Choice",
    exp: "ถามว่าจะจ้างคนนอกหรือใช้ทีมช่างภายใน ข้อ (A) เลือกทีมภายใน 'Our internal team should be able to handle it'"
  },
  {
    num: 43,
    q: "Why are there so many boxes piled up in the hallway?",
    a: "The Facilities team is clearing out the fourth-floor storage room.",
    b: "About twenty feet long and six feet wide.",
    c: "Yes, cardboard boxes are recyclable.",
    correct: "A",
    tag: "Part 2 - Why Question",
    exp: "ถามเหตุผลว่าทำไมมีกล่องกองอยู่เต็มทางเดิน ข้อ (A) ให้เหตุผลว่าฝ่ายอาคารกำลังเคลียร์ห้องเก็บของชั้น 4"
  },
  {
    num: 44,
    q: "When will the shuttle bus to the international airport arrive?",
    a: "It should pull up outside the lobby in ten minutes.",
    b: "A one-way fare costs twelve dollars.",
    c: "Terminal 2 handles international flights.",
    correct: "A",
    tag: "Part 2 - When Arrival",
    exp: "ถามเวลารถชัตเทิลบัสไปสนามบิน ข้อ (A) บอกว่าจะมาถึงหน้าล็อบบี้ในอีก 10 นาที"
  },
  {
    num: 45,
    q: "Who is coordinating the volunteer community clean-up this weekend?",
    a: "Sarah from Public Relations is taking the lead.",
    b: "The clean-up starts at eight on Saturday morning.",
    c: "In the central community park.",
    correct: "A",
    tag: "Part 2 - Who Coordinating",
    exp: "ถามว่าใครเป็นผู้ประสานงานกิจกรรม ข้อ (A) ตอบชื่อคุณ Sarah จากแผนกประชาสัมพันธ์"
  },
  {
    num: 46,
    q: "The color photocopier in the marketing department is jamming again.",
    a: "Let me open the side door and inspect the feed rollers.",
    b: "About forty color copies per minute.",
    c: "Yes, the marketing campaign was successful.",
    correct: "A",
    tag: "Part 2 - Problem & Action",
    exp: "บอกเล่าปัญหาเครื่องถ่ายเอกสารกระดาษติด ข้อ (A) เสนอตัวช่วยเปิดดูและตรวจสอบลูกกลิ้งดึงกระดาษ"
  },
  {
    num: 47,
    q: "How soon do you expect the overseas client to reply to our proposal?",
    a: "Their representative promised to email us by tomorrow afternoon.",
    b: "The proposal is eighty-five pages long.",
    c: "Yes, we sent it via registered courier.",
    correct: "A",
    tag: "Part 2 - How Soon Time",
    exp: "ถามว่าคาดว่าลูกค้าต่างประเทศจะตอบกลับเร็วแค่ไหน ข้อ (A) แจ้งว่าตัวแทนสัญญาว่าจะตอบกลับทางอีเมลภายในบ่ายวันพรุ่งนี้"
  },
  {
    num: 48,
    q: "Haven't you received the login instructions for the new payroll system?",
    a: "Actually, it ended up in my spam folder, but I found it.",
    b: "The payroll department is on the second floor.",
    c: "Yes, paychecks are issued twice a month.",
    correct: "A",
    tag: "Part 2 - Negative Inquiry",
    exp: "ถามว่ายังไม่ได้รับคำแนะนำการล็อกอินใช่ไหม ข้อ (A) ตอบตามจริงว่าอีเมลหลุดไปอยู่ในโฟลเดอร์สแปมแต่เจอแล้ว"
  },
  {
    num: 49,
    q: "What should we do with the leftover food from the client luncheon?",
    a: "Please place it in the staff lounge refrigerator.",
    b: "The luncheon was catered by Gourmet Deli.",
    c: "About thirty executives attended.",
    correct: "A",
    tag: "Part 2 - What Action",
    exp: "ถามว่าควรทำอย่างไรกับอาหารที่เหลือจากการเลี้ยงรับรอง ข้อ (A) บอกให้นำไปเก็บในตู้เย็นห้องพักพนักงาน"
  },
  {
    num: 50,
    q: "We could hold the press conference in the main auditorium or the courtyard.",
    a: "Let's check the weather forecast before deciding on the courtyard.",
    b: "Yes, many journalists have registered.",
    c: "The press release will be distributed at noon.",
    correct: "A",
    tag: "Part 2 - Suggestion Response",
    exp: "ประโยคเสนอแนะเรื่องสถานที่จัดแถลงข่าว ข้อ (A) ตอบอย่างมีวิจารณญาณ 'เช็กพยากรณ์อากาศก่อนดีกว่าก่อนจะเลือกลานกลางแจ้ง'"
  }
];

const formattedQuestions = part2Data.map((item) => ({
  id: `q-list-p2-ext-${String(item.num).padStart(2, '0')}`,
  section: 'LISTENING',
  part: 2,
  audioUrl: `/audio/part2-ext-${String(item.num).padStart(2, '0')}.mp3`,
  imageUrl: null,
  passageText: null,
  questionText: item.q,
  optionA: item.a,
  optionB: item.b,
  optionC: item.c,
  optionD: null,
  correctOption: item.correct,
  explanationTh: item.exp,
  tag: item.tag,
}));

fs.writeFileSync(
  path.join(__dirname, 'part2-extended.json'),
  JSON.stringify(formattedQuestions, null, 2),
  'utf8'
);

console.log(`Generated ${formattedQuestions.length} Part 2 extended questions.`);
