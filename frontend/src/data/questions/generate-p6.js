// ============================================================================
// frontend/src/data/questions/generate-p6.js
// 50 Authentic TOEIC Part 6 (Text Completion) Questions
// 13 Business Documents with embedded blanks [1] - [50]
// Complete full passage on every single question
// ============================================================================

const fs = require('fs');
const path = require('path');

const documents = [
  {
    docId: "doc01",
    passage: `MEMORANDUM
To: All Corporate Staff
From: Human Resources Department
Date: November 3
Subject: Revised Remote Work & Equipment Stipend Policy

We are pleased to announce that our updated flexible work policy will take effect _____ [1] on December 1st. Under these new guidelines, eligible employees may work remotely up to three days per business week.
To ensure ergonomic safety, each full-time remote worker will receive an annual equipment stipend of six hundred dollars to _____ [2] qualifying home office furniture and computer peripherals.
_____ [3].
Please note that all equipment purchases must be pre-approved by your immediate departmental supervisor. Should you have any questions, HR will host an informational Q&A session this Thursday in the main auditorium. We appreciate your continued dedication and _____ [4] as we modernize our workplace environment.`,
    blanks: [
      {
        blankNum: 1,
        q: "Select the best word to fill blank [1].",
        a: "officially",
        b: "official",
        c: "officer",
        d: "officialize",
        correct: "A",
        exp: "ตำแหน่งขยายกริยาวลี 'will take effect' ต้องการกริยาวิเศษณ์ (Adverb) คือ 'officially' (อย่างเป็นทางการ)",
        tag: "Part 6 - Word Family (Adverb)"
      },
      {
        blankNum: 2,
        q: "Select the best word to fill blank [2].",
        a: "procure",
        b: "procured",
        c: "procuring",
        d: "procurement",
        correct: "A",
        exp: "โครงสร้าง 'in order to + V.inf' ต้องการกริยารูปแท้ไม่ผัน คือ 'procure' (จัดซื้อ/จัดหามา)",
        tag: "Part 6 - Infinitive Verb"
      },
      {
        blankNum: 3,
        q: "Select the best sentence to fill blank [3].",
        a: "Receipts must be submitted through the employee portal within thirty days of purchase.",
        b: "The cafeteria will be closed for holiday cleaning on Friday.",
        c: "Flight tickets to London must be booked through our travel agency.",
        d: "The company headquarters will be relocated to Seattle next year.",
        correct: "A",
        exp: "ประโยคบริบทกำลังพูดถึงเงินสนับสนุนการซื้ออุปกรณ์ (stipend) ข้อ (A) ที่ระบุว่า 'ต้องส่งใบเสร็จผ่านพอร์ทัลพนักงานภายใน 30 วัน' จึงเชื่อมโยงความต่อเนื่องของเนื้อหาได้ดีที่สุด",
        tag: "Part 6 - Sentence Insertion"
      },
      {
        blankNum: 4,
        q: "Select the best word to fill blank [4].",
        a: "flexibility",
        b: "flexible",
        c: "flexibly",
        d: "flex",
        correct: "A",
        exp: "โครงสร้างคู่ขนานหลังคำนาม 'dedication and _______' ต้องการคำนาม (Noun) คือ 'flexibility' (ความยืดหยุ่น)",
        tag: "Part 6 - Parallel Structure Noun"
      }
    ]
  },
  {
    docId: "doc02",
    passage: `NOTICE TO ALL TENANTS
Highland Commercial Tower Management
Date: October 18
Subject: Modernization of South Passenger Elevators

Please be advised that the passenger elevators in the south wing will undergo essential mechanical upgrades beginning next Monday. Modernization technicians will arrive at 7:00 AM to _____ [5] the primary hoisting cables and digital control panels.
During this maintenance window, service in the south wing will be reduced from four cars to two. We _____ [6] recommend allowing extra commuting time when arriving for morning meetings.
_____ [7].
We apologize for any temporary inconvenience and thank you for your cooperation as we strive to improve building safety and _____ [8].`,
    blanks: [
      {
        blankNum: 5,
        q: "Select the best word to fill blank [5].",
        a: "replace",
        b: "replacement",
        c: "replacing",
        d: "replaced",
        correct: "A",
        exp: "โครงสร้าง 'to + V.inf' ต้องการกริยารูปแท้ไม่ผัน คือ 'replace' (เปลี่ยนอะไหล่/แทนที่)",
        tag: "Part 6 - Infinitive Verb"
      },
      {
        blankNum: 6,
        q: "Select the best word to fill blank [6].",
        a: "strongly",
        b: "strong",
        c: "strength",
        d: "strengthen",
        correct: "A",
        exp: "ทำหน้าที่ขยายกริยา 'recommend' ต้องใช้กริยาวิเศษณ์ (Adverb) คือ 'strongly' (ขอแนะนำอย่างยิ่ง)",
        tag: "Part 6 - Word Family (Adverb)"
      },
      {
        blankNum: 7,
        q: "Select the best sentence to fill blank [7].",
        a: "Freight elevators located near the loading dock may also be utilized by staff.",
        b: "All parking passes will expire at the end of the current month.",
        c: "The heating system was successfully inspected yesterday afternoon.",
        d: "A new Italian restaurant is opening on the ground floor next week.",
        correct: "A",
        exp: "บริบทกล่าวถึงลิฟต์โดยสารที่ลดจำนวนลง ข้อ (A) ที่บอกว่า 'สามารถใช้ลิฟต์ขนของบริเวณท่าขนถ่ายสินค้าช่วยได้' จึงเป็นทางออกเสริมที่สอดคล้องที่สุด",
        tag: "Part 6 - Sentence Insertion"
      },
      {
        blankNum: 8,
        q: "Select the best word to fill blank [8].",
        a: "efficiency",
        b: "efficient",
        c: "efficiently",
        d: "effect",
        correct: "A",
        exp: "โครงสร้างคู่ขนานเชื่อมด้วย 'and' หลังคำนาม 'safety' ต้องการคำนาม คือ 'efficiency' (ความมีประสิทธิภาพ)",
        tag: "Part 6 - Parallel Noun"
      }
    ]
  },
  {
    docId: "doc03",
    passage: `FOR IMMEDIATE RELEASE
CardCraft and NovaTech Announce Strategic Merger

CHICAGO — CardCraft Corporation announced today that it has signed a definitive agreement to merge with NovaTech Systems, a leading developer of enterprise cloud analytics. The combined entity will _____ [9] operations under the CardCraft global brand umbrella.
Under the terms of the merger, NovaTech shareholders will receive cash and common stock valued at approximately two hundred million dollars. The transaction is _____ [10] to close in the second quarter of next year, subject to regulatory clearance.
_____ [11].
Dr. Aris Thorne, who will serve as Chief Executive Officer of the combined entity, expressed tremendous _____ [12] regarding the expansion into European educational software markets.`,
    blanks: [
      {
        blankNum: 9,
        q: "Select the best word to fill blank [9].",
        a: "consolidate",
        b: "consolidation",
        c: "consolidated",
        d: "consolidating",
        correct: "A",
        exp: "หลัง Modal verb 'will' ต้องตามด้วยกริยารูปแท้ไม่ผัน (V.inf) คือ 'consolidate' (รวมกิจการเข้าด้วยกัน)",
        tag: "Part 6 - Modal Verb"
      },
      {
        blankNum: 10,
        q: "Select the best word to fill blank [10].",
        a: "expected",
        b: "expecting",
        c: "expect",
        d: "expectation",
        correct: "A",
        exp: "โครงสร้าง Passive Voice 'is expected to + V.inf' แปลว่า 'คาดว่าจะ...' (ธุรกรรมถูกคาดหมายว่าจะแล้วเสร็จในไตรมาส 2)",
        tag: "Part 6 - Passive Participle"
      },
      {
        blankNum: 11,
        q: "Select the best sentence to fill blank [11].",
        a: "No immediate layoffs or facility closures are planned as part of the integration.",
        b: "The manufacturing plant in Detroit caught fire last Wednesday.",
        c: "Airline ticket prices have risen dramatically over the past quarter.",
        d: "The cafeteria menu has been updated with healthy vegetarian options.",
        correct: "A",
        exp: "ในการแถลงข่าวการควบรวมกิจการ ข้อ (A) ที่ระบุว่า 'ไม่มีแผนปลดพนักงานหรือปิดโรงงานในทันที' เป็นข้อมูลสำคัญที่สร้างความมั่นใจแก่ผู้ถือหุ้นและพนักงาน",
        tag: "Part 6 - Sentence Insertion"
      },
      {
        blankNum: 12,
        q: "Select the best word to fill blank [12].",
        a: "enthusiasm",
        b: "enthusiastic",
        c: "enthusiastically",
        d: "enthuse",
        correct: "A",
        exp: "หลังคำคุณศัพท์ 'tremendous' ต้องการคำนาม (Noun) คือ 'enthusiasm' (ความกระตือรือร้น/ความยินดีอย่างยิ่ง)",
        tag: "Part 6 - Word Family (Noun)"
      }
    ]
  },
  {
    docId: "doc04",
    passage: `Dear Valued Customer,

Thank you for choosing Horizon Broadband as your primary enterprise internet service provider. We are writing to inform you that our client portal has been _____ [13] with multi-factor authentication security protocols.
This critical upgrade will provide an extra layer of defense against unauthorized account access and potential data _____ [14]. Starting November 15th, all account administrators will be prompted to register a mobile verification device upon login.
_____ [15].
Our technical assistance helpline remains _____ [16] twenty-four hours a day should you experience any difficulty setting up your authentication credentials.`,
    blanks: [
      {
        blankNum: 13,
        q: "Select the best word to fill blank [13].",
        a: "enhanced",
        b: "enhances",
        c: "enhancing",
        d: "enhancement",
        correct: "A",
        exp: "โครงสร้าง Present Perfect Passive 'has been + V.3' จึงต้องใช้ 'enhanced' (ได้รับการยกระดับ)",
        tag: "Part 6 - Passive Voice"
      },
      {
        blankNum: 14,
        q: "Select the best word to fill blank [14].",
        a: "breaches",
        b: "breaching",
        c: "breached",
        d: "breachable",
        correct: "A",
        exp: "คำประสม 'data breaches' แปลว่า 'การละเมิดข้อมูล/ข้อมูลรั่วไหล' เป็นคำนามที่ถูกต้องตามบริบท",
        tag: "Part 6 - Business Collocation"
      },
      {
        blankNum: 15,
        q: "Select the best sentence to fill blank [15].",
        a: "A step-by-step video tutorial has been uploaded to our help center for your convenience.",
        b: "Our downtown customer service branch will relocate to Elm Street next month.",
        c: "The annual holiday discount promotion ended yesterday at midnight.",
        d: "All international flights were delayed due to severe thunderstorms.",
        correct: "A",
        exp: "บริบทพูดถึงการตั้งค่าการยืนยันตัวตนแบบใหม่ ข้อ (A) ที่ระบุว่า 'มีวิดีโอแนะนำทีละขั้นตอนอัปโหลดไว้ที่ศูนย์ช่วยเหลือ' จึงเชื่อมโยงได้ตรงประเด็น",
        tag: "Part 6 - Sentence Insertion"
      },
      {
        blankNum: 16,
        q: "Select the best word to fill blank [16].",
        a: "available",
        b: "availably",
        c: "availability",
        d: "avail",
        correct: "A",
        exp: "หลัง Linking verb 'remains' ต้องการคำคุณศัพท์ (Adjective) คือ 'available' (พร้อมให้บริการตลอด 24 ชม.)",
        tag: "Part 6 - Predicate Adjective"
      }
    ]
  },
  {
    docId: "doc05",
    passage: `POLICY DIRECTIVE
Corporate Accounting Department
Subject: Business Travel Expense Reimbursement Guidelines

All employees traveling on behalf of the company must adhere strictly to the following reimbursement procedures. Travel expense reports must be submitted _____ [17] thirty days following the conclusion of any authorized trip.
Original itemized receipts must accompany all expense claims. Meal expenditures exceeding sixty dollars per day will require written _____ [18] from your regional division director.
_____ [19].
Approved reimbursement funds will be deposited directly into your designated payroll bank account within two billing cycles. We appreciate your diligent attention to these _____ [20] accounting requirements.`,
    blanks: [
      {
        blankNum: 17,
        q: "Select the best word to fill blank [17].",
        a: "within",
        b: "during",
        c: "between",
        d: "among",
        correct: "A",
        exp: "สำนวนบอกกรอบเวลา 'within thirty days' (ภายใน 30 วัน) ถูกต้องตามหลักไวยากรณ์",
        tag: "Part 6 - Time Preposition"
      },
      {
        blankNum: 18,
        q: "Select the best word to fill blank [18].",
        a: "authorization",
        b: "authorize",
        c: "authorizing",
        d: "authoritative",
        correct: "A",
        exp: "หลังคำคุณศัพท์ 'written' ต้องการคำนาม (Noun) คือ 'authorization' (การอนุมัติเป็นลายลักษณ์อักษร)",
        tag: "Part 6 - Word Family (Noun)"
      },
      {
        blankNum: 19,
        q: "Select the best sentence to fill blank [19].",
        a: "Claims submitted without original receipts will be rejected automatically.",
        b: "The hotel swimming pool is closed for annual tiling maintenance.",
        c: "New company vehicles will be purchased from local dealerships.",
        d: "Our executive board approved a three percent salary dividend.",
        correct: "A",
        exp: "บริบทพูดถึงการแนบใบเสร็จตัวจริง ข้อ (A) ที่เตือนว่า 'การเบิกจ่ายที่ไม่มีใบเสร็จตัวจริงจะถูกปฏิเสธโดยอัตโนมัติ' จึงเข้ากับกฎระเบียบอย่างสมบูรณ์",
        tag: "Part 6 - Sentence Insertion"
      },
      {
        blankNum: 20,
        q: "Select the best word to fill blank [20].",
        a: "mandatory",
        b: "mandatorily",
        c: "mandate",
        d: "mandating",
        correct: "A",
        exp: "อยู่หน้าคำนาม 'accounting requirements' ต้องการคำคุณศัพท์ คือ 'mandatory' (ที่เป็นข้อบังคับ/หลีกเลี่ยงไม่ได้)",
        tag: "Part 6 - Word Family (Adjective)"
      }
    ]
  },
  {
    docId: "doc06",
    passage: `Dear Dr. Thorne,

On behalf of the Organizing Committee for the International CleanTech Conference, I am honored to invite you as our keynote speaker for our annual symposium in Berlin.
Your pioneering research on commercial solar energy storage has received _____ [21] acclaim throughout the engineering community. We would be delighted if you would deliver a forty-minute address on sustainable factory infrastructure on June 14th.
_____ [22].
The conference committee will provide round-trip business class airfare and four nights of luxury hotel _____ [23] at the Grand Hotel Berlin.
Please confirm your _____ [24] by replying to this email before April 15th so we may finalize the printed symposium program.`,
    blanks: [
      {
        blankNum: 21,
        q: "Select the best word to fill blank [21].",
        a: "widespread",
        b: "widely",
        c: "widen",
        d: "width",
        correct: "A",
        exp: "อยู่หน้าคำนาม 'acclaim' (การยกย่องสรรเสริญ) ต้องการคำคุณศัพท์ คือ 'widespread' (อย่างแพร่หลาย/กว้างขวาง)",
        tag: "Part 6 - Word Family (Adjective)"
      },
      {
        blankNum: 22,
        q: "Select the best sentence to fill blank [22].",
        a: "An audience of over eight hundred clean technology executives is expected to attend.",
        b: "The airport express train will be delayed due to snow removal operations.",
        c: "Our software development team released a mobile application update yesterday.",
        d: "The conference cafeteria will only serve cold sandwiches during the break.",
        correct: "A",
        exp: "ในจดหมายเชิญผู้บรรยาย ข้อ (A) ที่กล่าวถึง 'คาดว่าจะมีผู้บริหารระดับสูงกว่า 800 คนเข้าร่วมรับฟัง' ช่วยเน้นความสำคัญของงานสัมมนาได้อย่างยอดเยี่ยม",
        tag: "Part 6 - Sentence Insertion"
      },
      {
        blankNum: 23,
        q: "Select the best word to fill blank [23].",
        a: "accommodations",
        b: "accommodate",
        c: "accommodating",
        d: "accommodated",
        correct: "A",
        exp: "คำนาม 'hotel accommodations' แปลว่า 'ที่พักในโรงแรม' ตรงตามโครงสร้าง",
        tag: "Part 6 - Business Collocation"
      },
      {
        blankNum: 24,
        q: "Select the best word to fill blank [24].",
        a: "availability",
        b: "available",
        c: "availably",
        d: "avail",
        correct: "A",
        exp: "หลัง Possessive adjective 'your' ต้องการคำนาม (Noun) คือ 'availability' (ความพร้อม/ความสะดวกในการเข้าร่วม)",
        tag: "Part 6 - Word Family (Noun)"
      }
    ]
  },
  {
    docId: "doc07",
    passage: `STAFF ANNOUNCEMENT
Corporate Facilities Management
Subject: Temporary Cafeteria Closure and Alternative Dining Options

Starting next Monday, November 10th, the main ground-floor employee cafeteria will close for extensive renovations. Contractors will install an updated ventilation hood, energy-efficient refrigeration units, and a modern salad bar. The remodel is _____ [25] to take approximately three weeks.
_____ [26].
To ensure staff have convenient dining options during the construction period, management has arranged for four gourmet food trucks to park outside the east lobby entrance daily between 11:30 AM and 1:30 PM.
Food truck operators will offer a fifteen percent discount to all CardCraft employees who _____ [27] their company identification badges.
We appreciate your patience and understanding as we work to _____ [28] our on-site dining experience.`,
    blanks: [
      {
        blankNum: 25,
        q: "Select the best word to fill blank [25].",
        a: "projected",
        b: "project",
        c: "projecting",
        d: "projection",
        correct: "A",
        exp: "โครงสร้าง Passive 'is projected to + V.inf' แปลว่า 'ถูกคาดการณ์ว่าจะใช้เวลาประมาณ 3 สัปดาห์'",
        tag: "Part 6 - Passive Participle"
      },
      {
        blankNum: 26,
        q: "Select the best sentence to fill blank [26].",
        a: "During this time, the dining hall seating area will be completely inaccessible.",
        b: "The annual cybersecurity audit has been postponed until the new year.",
        c: "Flight reservations must be booked at least two weeks in advance.",
        d: "New office chairs have been ordered for all software developers.",
        correct: "A",
        exp: "ประโยคก่อนหน้าพูดถึงการปิดปรับปรุงโรงอาหาร ข้อ (A) ที่ระบุว่า 'ในช่วงเวลานี้ พื้นที่ที่นั่งรับประทานอาหารจะไม่สามารถเข้าใช้งานได้เลย' จึงต่อเนื่องกันอย่างสมบูรณ์",
        tag: "Part 6 - Sentence Insertion"
      },
      {
        blankNum: 27,
        q: "Select the best word to fill blank [27].",
        a: "display",
        b: "displayed",
        c: "displaying",
        d: "displays",
        correct: "A",
        exp: "ใน Relative clause 'employees who display...' ประธานเป็นพหูพจน์ (employees) กริยา Present Simple จึงไม่เติม -s คือ 'display'",
        tag: "Part 6 - Relative Clause Verb"
      },
      {
        blankNum: 28,
        q: "Select the best word to fill blank [28].",
        a: "enhance",
        b: "enhancement",
        c: "enhancing",
        d: "enhanced",
        correct: "A",
        exp: "โครงสร้าง 'in order to + V.inf' ต้องการกริยารูปแท้ไม่ผัน คือ 'enhance' (พัฒนา/ยกระดับ)",
        tag: "Part 6 - Infinitive Verb"
      }
    ]
  },
  {
    docId: "doc08",
    passage: `MEMORANDUM
To: Department Supervisors
From: Human Resources Evaluation Committee
Subject: Implementation of the New Performance Appraisal Rubric

We are writing to introduce our updated employee performance evaluation rubric, which will be utilized for the upcoming annual review cycle.
This revised framework is designed to provide more _____ [29] and actionable feedback to team members regarding their professional development goals.
Key performance indicators will now be assessed across four core competency areas: project delivery, collaborative teamwork, technical proficiency, and problem-solving initiative.
_____ [30].
All supervisors are required to attend a mandatory training workshop on Tuesday at 10:00 AM in Conference Room B.
During this session, HR specialists will _____ [31] the scoring criteria and demonstrate how to enter ratings into the online HR portal.
Your prompt attendance is greatly _____ [32].`,
    blanks: [
      {
        blankNum: 29,
        q: "Select the best word to fill blank [29].",
        a: "objective",
        b: "objectively",
        c: "objectivity",
        d: "object",
        correct: "A",
        exp: "หลัง 'more' และหน้า 'and actionable feedback' ต้องการคำคุณศัพท์ (Adjective) คือ 'objective' (ที่เป็นภววิสัย/ยุติธรรมตามเกณฑ์)",
        tag: "Part 6 - Word Family (Adjective)"
      },
      {
        blankNum: 30,
        q: "Select the best sentence to fill blank [30].",
        a: "A digital copy of the evaluation rubric has been attached to this email.",
        b: "The commercial building lease expires at the end of the fiscal year.",
        c: "All factory packaging lines must be shut down during the holiday.",
        d: "Customer refund requests must include the original purchase receipt.",
        correct: "A",
        exp: "หลังกล่าวถึงหัวข้อเกณฑ์การประเมิน ข้อ (A) ที่ระบุว่า 'ได้แนบสำเนาดิจิทัลของเกณฑ์การประเมินมาพร้อมกับอีเมลฉบับนี้แล้ว' เป็นเนื้อหาที่สอดคล้องที่สุด",
        tag: "Part 6 - Sentence Insertion"
      },
      {
        blankNum: 31,
        q: "Select the best word to fill blank [31].",
        a: "clarify",
        b: "clarified",
        c: "clarifying",
        d: "clarification",
        correct: "A",
        exp: "หลัง Modal verb 'will' ต้องตามด้วยกริยารูปแท้ไม่ผัน (V.inf) คือ 'clarify' (อธิบายให้กระจ่างชัดเจน)",
        tag: "Part 6 - Modal Verb"
      },
      {
        blankNum: 32,
        q: "Select the best word to fill blank [32].",
        a: "appreciated",
        b: "appreciate",
        c: "appreciating",
        d: "appreciation",
        correct: "A",
        exp: "โครงสร้างสำนวนสุภาพท้ายจดหมาย 'is greatly appreciated' (ได้รับความขอบคุณเป็นอย่างยิ่ง)",
        tag: "Part 6 - Passive Participle"
      }
    ]
  },
  {
    docId: "doc09",
    passage: `CUSTOMER ADVISORY
Brighton Logistics Distribution Network
Subject: Year-End Inventory Audit and Shipping Cutoff Dates

Dear Commercial Partners,

As we approach the end of the fiscal calendar, Brighton Logistics will conduct our annual comprehensive warehouse inventory audit from December 27th through December 30th.
During this four-day period, normal cargo dispatch operations will be temporarily suspended to ensure absolute inventory _____ [33].
_____ [34].
To prevent supply chain bottlenecks, we urge all retail clients to submit outbound freight orders _____ [35] December 20th at 5:00 PM.
Shipments booked after this cutoff date will be held in secure, temperature-controlled storage and processed _____ [36] on January 3rd. We thank you for your ongoing partnership.`,
    blanks: [
      {
        blankNum: 33,
        q: "Select the best word to fill blank [33].",
        a: "accuracy",
        b: "accurate",
        c: "accurately",
        d: "accurateness",
        correct: "A",
        exp: "หลังคำคุณศัพท์ 'absolute' ต้องการคำนาม (Noun) คือ 'accuracy' (ความถูกต้องแม่นยำของสต็อกสินค้า)",
        tag: "Part 6 - Word Family (Noun)"
      },
      {
        blankNum: 34,
        q: "Select the best sentence to fill blank [34].",
        a: "Emergency freight dispatches will be handled on a case-by-case basis.",
        b: "The employee health insurance webinar is scheduled for Thursday.",
        c: "All software licenses will expire unless renewed by the administrator.",
        d: "The airport runway will be resurfaced during the summer months.",
        correct: "A",
        exp: "หลังจากแจ้งว่าจะระงับการจัดส่งปกติชั่วคราว ข้อ (A) ที่ระบุว่า 'การส่งสินค้าฉุกเฉินเร่งด่วนจะพิจารณาเป็นรายกรณี' จึงเป็นข้อยกเว้นทางธุรกิจที่สอดรับกันดีที่สุด",
        tag: "Part 6 - Sentence Insertion"
      },
      {
        blankNum: 35,
        q: "Select the best word to fill blank [35].",
        a: "prior to",
        b: "apart from",
        c: "due to",
        d: "in spite of",
        correct: "A",
        exp: "สำนวนบอกกำหนดเวลาก่อนหน้า 'prior to December 20th' (ก่อนวันที่ 20 ธันวาคม)",
        tag: "Part 6 - Compound Preposition"
      },
      {
        blankNum: 36,
        q: "Select the best word to fill blank [36].",
        a: "promptly",
        b: "prompt",
        c: "promptness",
        d: "prompting",
        correct: "A",
        exp: "ขยายกริยา 'processed' ต้องการกริยาวิเศษณ์ (Adverb) คือ 'promptly' (อย่างรวดเร็วฉับไว)",
        tag: "Part 6 - Word Family (Adverb)"
      }
    ]
  },
  {
    docId: "doc10",
    passage: `PRESS RELEASE
GreenPack Solutions Announces Zero-Waste Packaging Initiative

PORTLAND — GreenPack Solutions today unveiled its groundbreaking compostable shipping carton line, engineered to eliminate single-use plastics from consumer e-commerce.
Manufactured entirely from upcycled agricultural plant fibers, the new packaging decomposes _____ [37] within ninety days in municipal compost facilities.
Independent laboratory testing confirmed that the cartons possess higher tensile strength than conventional cardboard, making them highly _____ [38] during long-distance transit.
_____ [39].
Commercial inquiries regarding bulk enterprise supply contracts should be directed to our sustainable business development division at partnerships@greenpack.com. GreenPack remains dedicated to creating innovative solutions that are _____ [40] to environmental conservation.`,
    blanks: [
      {
        blankNum: 37,
        q: "Select the best word to fill blank [37].",
        a: "naturally",
        b: "natural",
        c: "nature",
        d: "naturalize",
        correct: "A",
        exp: "ขยายกริยา 'decomposes' (ย่อยสลาย) ต้องการกริยาวิเศษณ์ (Adverb) คือ 'naturally' (อย่างเป็นธรรมชาติ)",
        tag: "Part 6 - Word Family (Adverb)"
      },
      {
        blankNum: 38,
        q: "Select the best word to fill blank [38].",
        a: "durable",
        b: "durably",
        c: "durability",
        d: "duration",
        correct: "A",
        exp: "หลัง 'highly' ต้องการคำคุณศัพท์ (Adjective) คือ 'durable' (ทนทานแข็งแรง)",
        tag: "Part 6 - Word Family (Adjective)"
      },
      {
        blankNum: 39,
        q: "Select the best sentence to fill blank [39].",
        a: "Several major online retailers have already agreed to adopt the cartons nationwide.",
        b: "The hotel conference room has been reserved for a medical convention.",
        c: "Heavy thunderstorms caused commuter rail delays throughout the morning.",
        d: "Employees must complete the annual cybersecurity module before Friday.",
        correct: "A",
        exp: "ในข่าวประชาสัมพันธ์สินค้าใหม่ ข้อ (A) ที่ระบุว่า 'ผู้ค้าปลีกออนไลน์รายใหญ่หลายรายตกลงนำกล่องนี้ไปใช้ทั่วประเทศแล้ว' แสดงถึงความสำเร็จทางการค้าของสินค้า",
        tag: "Part 6 - Sentence Insertion"
      },
      {
        blankNum: 40,
        q: "Select the best word to fill blank [40].",
        a: "conducive",
        b: "reluctant",
        c: "capable",
        d: "adjacent",
        correct: "A",
        exp: "สำนวน 'conducive to...' แปลว่า 'ส่งผลดีต่อ/ช่วยส่งเสริมให้เกิด...' ใช้คู่กับบุพบท 'to'",
        tag: "Part 6 - Advanced Business Adjective"
      }
    ]
  },
  {
    docId: "doc11",
    passage: `FACILITIES NOTICE
Apex Corporate Headquarters
Subject: Scheduled Power System Inspection and Network Outage

Please be advised that the municipal power grid authority will perform critical high-voltage transformer maintenance on Saturday, November 22nd.
As a consequence, the main electrical feed to the headquarters building will be _____ [41] disconnected from 6:00 AM until 2:00 PM.
Emergency backup generators will power life-safety systems and emergency hallway lighting; however, all office desktop workstations and network routers will be _____ [42].
_____ [43].
IT specialists will inspect all server racks once grid power is _____ [44] restored at approximately 2:30 PM. We thank you for your cooperation.`,
    blanks: [
      {
        blankNum: 41,
        q: "Select the best word to fill blank [41].",
        a: "temporarily",
        b: "temporary",
        c: "temporariness",
        d: "temporize",
        correct: "A",
        exp: "อยู่ระหว่างกริยาช่วย 'will be' และกริยาแท้ 'disconnected' ทำหน้าที่ขยาย ต้องใช้กริยาวิเศษณ์ คือ 'temporarily' (ชั่วคราว)",
        tag: "Part 6 - Word Family (Adverb)"
      },
      {
        blankNum: 42,
        q: "Select the best word to fill blank [42].",
        a: "inaccessible",
        b: "inaccessibly",
        c: "inaccessibility",
        d: "access",
        correct: "A",
        exp: "หลัง Linking verb 'will be' ต้องการคำคุณศัพท์ คือ 'inaccessible' (ไม่สามารถเข้าใช้งานได้)",
        tag: "Part 6 - Predicate Adjective"
      },
      {
        blankNum: 43,
        q: "Select the best sentence to fill blank [43].",
        a: "All staff are instructed to power down and unplug their computer equipment before leaving Friday.",
        b: "The marketing department achieved a fifteen percent increase in sales revenue.",
        c: "A new Italian bistro opened on the ground floor next to the fountain.",
        d: "All international travel expense reports must include original receipts.",
        correct: "A",
        exp: "ข้อควรปฏิบัติก่อนตัดไฟ ข้อ (A) ที่สั่งให้ 'พนักงานทุกคนปิดและถอดปลั๊กคอมพิวเตอร์ก่อนเลิกงานวันศุกร์' สอดคล้องกับมาตรการความปลอดภัยอย่างสมบูรณ์",
        tag: "Part 6 - Sentence Insertion"
      },
      {
        blankNum: 44,
        q: "Select the best word to fill blank [44].",
        a: "fully",
        b: "full",
        c: "fullness",
        d: "fullest",
        correct: "A",
        exp: "ขยายกริยา 'restored' ต้องการกริยาวิเศษณ์ (Adverb) คือ 'fully' (อย่างเต็มรูปแบบ/สมบูรณ์)",
        tag: "Part 6 - Word Family (Adverb)"
      }
    ]
  },
  {
    docId: "doc12",
    passage: `Dear Margaret,

On behalf of the Board of Directors and the entire CardCraft family, I want to express our deepest gratitude for your outstanding service as Vice President of Global Logistics.
Over the past two decades, your visionary leadership _____ [45] transformed our distribution network into an industry benchmark for punctuality and cost efficiency.
Your remarkable ability to navigate complex international trade regulations has been _____ [46] to our overseas expansion.
_____ [47].
We wish you health, happiness, and fulfillment in your well-deserved retirement. You will always be _____ [48] regarded by your colleagues here.

Warmest personal regards,
David Sterling, CEO`,
    blanks: [
      {
        blankNum: 45,
        q: "Select the best word to fill blank [45].",
        a: "has",
        b: "have",
        c: "is",
        d: "was",
        correct: "A",
        exp: "ประธาน 'leadership' เป็นนามนับไม่ได้เอกพจน์ โครงสร้าง Present Perfect จึงใช้ 'has transformed'",
        tag: "Part 6 - Subject-Verb Agreement"
      },
      {
        blankNum: 46,
        q: "Select the best word to fill blank [46].",
        a: "vital",
        b: "vitally",
        c: "vitality",
        d: "vitalize",
        correct: "A",
        exp: "หลัง 'has been' ต้องการคำคุณศัพท์ (Adjective) คือ 'vital' (จำเป็นยิ่ง/สำคัญยิ่ง)",
        tag: "Part 6 - Predicate Adjective"
      },
      {
        blankNum: 47,
        q: "Select the best sentence to fill blank [47].",
        a: "A farewell dinner in your honor will be held at the Metropolitan Club next Thursday.",
        b: "The printer in accounting ran out of color toner cartridges yesterday.",
        c: "Please review the attached invoice before forwarding it to the billing department.",
        d: "Flight departures have been delayed due to dense morning fog.",
        correct: "A",
        exp: "ในจดหมายขอบคุณผู้เกษียณอายุ ข้อ (A) ที่แจ้งว่า 'จะมีงานเลี้ยงอำลาเพื่อเป็นเกียรติแก่คุณที่ Metropolitan Club ในวันพฤหัสบดีหน้า' สอดคล้องกับโอกาสอย่างซาบซึ้ง",
        tag: "Part 6 - Sentence Insertion"
      },
      {
        blankNum: 48,
        q: "Select the best word to fill blank [48].",
        a: "warmly",
        b: "warm",
        c: "warmth",
        d: "warming",
        correct: "A",
        exp: "ขยายกริยา 'regarded' (ได้รับการยกย่อง) ต้องการกริยาวิเศษณ์ คือ 'warmly' (อย่างอบอุ่น/ด้วยความจริงใจ)",
        tag: "Part 6 - Word Family (Adverb)"
      }
    ]
  },
  {
    docId: "doc13",
    passage: `PARKING PERMIT RENEWAL INSTRUCTIONS
Tenant Services Office — Apex Tower

All vehicle owners utilizing the underground tenant parking structure must renew their digital parking credentials before January 1st.
Permit applications may be completed online through the tenant services portal. Please verify that your vehicle license plate number and contact information are entered _____ [49].
Vehicles parked in reserved spaces without valid permits after the deadline will be subject to _____ [50] towing at the owner's expense. Thank you for your cooperation.`,
    blanks: [
      {
        blankNum: 49,
        q: "Select the best word to fill blank [49].",
        a: "accurately",
        b: "accurate",
        c: "accuracy",
        d: "accurateness",
        correct: "A",
        exp: "ขยายกริยา 'entered' ต้องการกริยาวิเศษณ์ (Adverb) คือ 'accurately' (อย่างถูกต้องแม่นยำ)",
        tag: "Part 6 - Word Family (Adverb)"
      },
      {
        blankNum: 50,
        q: "Select the best word to fill blank [50].",
        a: "immediate",
        b: "immediately",
        c: "immediacy",
        d: "immediateness",
        correct: "A",
        exp: "อยู่หน้าคำนาม 'towing' (การลากจูงรถ) ต้องการคำคุณศัพท์ (Adjective) คือ 'immediate' (ทันที)",
        tag: "Part 6 - Word Family (Adjective)"
      }
    ]
  }
];

let counter = 1;
const formattedQuestions = [];

documents.forEach((doc) => {
  doc.blanks.forEach((b) => {
    formattedQuestions.push({
      id: `q-read-p6-ext-${String(counter).padStart(2, '0')}`,
      section: 'READING',
      part: 6,
      audioUrl: null,
      imageUrl: null,
      passageText: doc.passage,
      questionText: b.q,
      optionA: b.a,
      optionB: b.b,
      optionC: b.c,
      optionD: b.d,
      correctOption: b.correct,
      explanationTh: b.exp,
      tag: b.tag,
    });
    counter++;
  });
});

fs.writeFileSync(
  path.join(__dirname, 'part6-extended.json'),
  JSON.stringify(formattedQuestions, null, 2),
  'utf8'
);

console.log(`Generated ${formattedQuestions.length} Part 6 extended questions.`);
