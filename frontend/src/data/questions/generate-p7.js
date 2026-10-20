// ============================================================================
// frontend/src/data/questions/generate-p7.js
// 50 Authentic TOEIC Part 7 (Reading Comprehension) Questions
// 17 Realistic Business Reading Sets (Emails, Chats, Notices, Articles, Forms)
// Complete full passage text on every single question
// ============================================================================

const fs = require('fs');
const path = require('path');

const sets = [
  {
    setId: "set01",
    passage: `[Email Exchange - Invoice Discrepancy]
To: billing@highlandsupplies.com
From: d.chen@cardcraft.com
Date: October 14
Subject: Invoice #4892 Discrepancy — Order #CC-8821

Dear Highland Supplies Billing Department,

I am writing regarding Invoice #4892, which we received yesterday for our bulk office supply delivery.
According to Purchase Order #CC-8821, we ordered twenty boxes of recycled copy paper at $32.00 per box and five heavy-duty staplers at $18.00 each, totaling $730.00. However, the invoice lists a total charge of $880.00, reflecting a unit price of $39.50 per box of paper.
Our sales contract explicitly guarantees a locked promotional price of $32.00 per box through December 31st.
Please issue a revised invoice reflecting the contracted rate so our accounting department can process payment before the net-30 due date.

Sincerely,
David Chen, Purchasing Coordinator
CardCraft Corporation`,
    questions: [
      {
        q: "Why did David Chen write the email?",
        a: "To dispute a price discrepancy on an invoice",
        b: "To cancel an office supply order",
        c: "To request a catalog of ergonomic furniture",
        d: "To inquire about job openings in billing",
        correct: "A",
        exp: "อีเมลเขียนขึ้นเพื่อทักท้วงเรื่องราคาในใบแจ้งหนี้ที่ไม่ตรงกับสัญญา ('dispute a price discrepancy')",
        tag: "Part 7 - Email Purpose"
      },
      {
        q: "What price was David guaranteed for a box of paper?",
        a: "$32.00",
        b: "$39.50",
        c: "$18.00",
        d: "$730.00",
        correct: "A",
        exp: "ในจดหมายระบุชัดเจนว่าสัญญาการันตีราคาโปรโมชั่น 'promotional price of $32.00 per box'",
        tag: "Part 7 - Detail Lookup"
      },
      {
        q: "What does David ask Highland Supplies to do?",
        a: "Issue a revised invoice with the correct rate",
        b: "Send five additional heavy-duty staplers",
        c: "Cancel the paper delivery immediately",
        d: "Refund the entire order in cash",
        correct: "A",
        exp: "เดวิดขอให้ 'issue a revised invoice reflecting the contracted rate' (ออกใบแจ้งหนี้ฉบับแก้ไข)",
        tag: "Part 7 - Action Request"
      }
    ]
  },
  {
    setId: "set02",
    passage: `[Conference Schedule & Seminar Announcement]
12th Annual Global Logistics & Supply Chain Expo
Messe Frankfurt Convention Center — Hall 4
November 18–19

Schedule of Keynote Sessions:
• 9:00 AM – 10:15 AM: Keynote Address: 'Navigating Maritime Freight Bottlenecks'
  Speaker: Captain Henrik Lindqvist, Baltic Shipping Line
• 10:30 AM – 11:45 AM: Workshop A: 'Implementing AI in Automated Warehousing'
  Speaker: Dr. Maya Lin, Robotics Institute of Technology
• 12:00 PM – 1:30 PM: Networking Luncheon & Exhibition Floor Walkthrough
  Sponsored by Vanguard Global Logistics
• 1:45 PM – 3:00 PM: Panel Discussion: 'Cold-Chain Storage for Pharmaceuticals'
  Moderator: Elena Rostova, GreenPack Solutions
• 3:15 PM – 4:30 PM: Workshop B: 'Customs Compliance & Cross-Border Tariffs'
  Speaker: Marcus Vance, International Trade Legal Counsel

Registration Notice:
Workshop attendance is limited to fifty participants per session. Advance reservations must be made via the official expo mobile application. Badges must be scanned at the entrance of each seminar room.`,
    questions: [
      {
        q: "Who will present the workshop on automated warehousing?",
        a: "Dr. Maya Lin",
        b: "Captain Henrik Lindqvist",
        c: "Elena Rostova",
        d: "Marcus Vance",
        correct: "A",
        exp: "ตามตารางเวลา 10:30 น. ผู้บรรยายคือ 'Dr. Maya Lin, Robotics Institute of Technology'",
        tag: "Part 7 - Speaker Schedule"
      },
      {
        q: "What session begins immediately after the networking luncheon?",
        a: "A panel discussion on pharmaceutical cold-chain storage",
        b: "A keynote speech on maritime freight bottlenecks",
        c: "A workshop on customs compliance tariffs",
        d: "An exhibition floor closing ceremony",
        correct: "A",
        exp: "หลังมื้อเที่ยง (12:00-13:30) คือเวลา 13:45 น. หัวข้อ 'Panel Discussion: Cold-Chain Storage for Pharmaceuticals'",
        tag: "Part 7 - Schedule Sequence"
      },
      {
        q: "How must attendees register for limited-capacity workshops?",
        a: "Through the official expo mobile application",
        b: "By phoning the convention center ticket desk",
        c: "By standing in line outside Hall 4 at 8:00 AM",
        d: "By mailing a paper registration card",
        correct: "A",
        exp: "ในข้อความระบุ 'Advance reservations must be made via the official expo mobile application.'",
        tag: "Part 7 - Registration Requirement"
      }
    ]
  },
  {
    setId: "set03",
    passage: `[Product Description & Customer Review]
APEX GRIND-MASTER 8000 COMMERCIAL ESPRESSO GRINDER
Product Features:
• 64mm titanium-coated flat burrs engineered for ultra-fine espresso extraction
• Digital dosing timer accurate to one-tenth of a second
• High-torque 450W quiet-drive motor prevents bean overheating during rush hours
• Backed by Apex Commercial's 2-Year Full Replacement Warranty

Customer Review:
Rating: ★★★★★ (5 out of 5 stars)
Reviewer: Marcus Thorne, Owner of Blue Harbor Coffeehouse
Date: September 28
"We replaced our old grinders with two Grind-Master 8000 units three months ago. Our morning rush averages over 180 espresso drinks per hour, and these machines have performed flawlessly. The grind consistency is exceptional, and the motor runs remarkably cool and quiet. When one hopper lid arrived with a minor cosmetic scratch, Apex customer support couriered a replacement part within 24 hours. Highly recommended for any serious cafe owner."`,
    questions: [
      {
        q: "What feature of the Grind-Master 8000 prevents beans from overheating?",
        a: "A high-torque quiet-drive motor",
        b: "A pressurized water cooling chamber",
        c: "An automatic ice-dispensing hopper",
        d: "A low-speed manual hand crank",
        correct: "A",
        exp: "ในคุณสมบัติระบุ 'High-torque 450W quiet-drive motor prevents bean overheating...'",
        tag: "Part 7 - Product Feature"
      },
      {
        q: "Why did Marcus Thorne praise Apex customer support?",
        a: "They sent a replacement hopper lid within 24 hours.",
        b: "They offered a fifty percent discount on beans.",
        c: "They provided free barista training sessions.",
        d: "They installed the machines in his cafe for free.",
        correct: "A",
        exp: "รีวิวระบุ 'Apex customer support couriered a replacement part within 24 hours.'",
        tag: "Part 7 - Review Detail"
      },
      {
        q: "What is the warranty coverage period for the grinder?",
        a: "Two years",
        b: "Six months",
        c: "One year",
        d: "Five years",
        correct: "A",
        exp: "ระบุในรายละเอียดสินค้า 'Backed by Apex Commercial's 2-Year Full Replacement Warranty'",
        tag: "Part 7 - Warranty Duration"
      }
    ]
  },
  {
    setId: "set04",
    passage: `[Business News Article]
FRANKFURT BUSINESS CHRONICLE
CardCraft Establishes European Headquarters in Frankfurt
By Anja Weber, Technology Correspondent

FRANKFURT — Educational technology giant CardCraft announced yesterday that it has signed a ten-year commercial lease for three floors in Frankfurt's MainTower, establishing its permanent European headquarters.
The expansion is backed by a 45-million-euro capital investment and is anticipated to create over 160 high-skilled positions in software engineering, curriculum design, and enterprise corporate sales.
CardCraft's CEO, David Sterling, cited Frankfurt's robust digital infrastructure, central European rail connectivity, and proximity to major international financial institutions as the deciding factors.
Renovations on the 40,000-square-foot office space will begin next month, with the official ribbon-cutting ceremony scheduled for March 15th. Recruitment for local engineering leads will open online next Monday.`,
    questions: [
      {
        q: "What major decision did CardCraft announce?",
        a: "Establishing its European headquarters in Frankfurt",
        b: "Selling its European language assets to a rival",
        c: "Closing five manufacturing plants in Germany",
        d: "Launching a luxury hotel chain across Europe",
        correct: "A",
        exp: "พาดหัวข่าวและเนื้อหาระบุชัดเจนว่า CardCraft ตั้งสำนักงานใหญ่ยุโรปที่แฟรงก์เฟิร์ต",
        tag: "Part 7 - Main News Story"
      },
      {
        q: "How many jobs is the expansion expected to create?",
        a: "Over 160 positions",
        b: "Forty-five positions",
        c: "Approximately three hundred positions",
        d: "Fewer than fifty positions",
        correct: "A",
        exp: "ในเนื้อข่าวระบุ '...anticipated to create over 160 high-skilled positions...'",
        tag: "Part 7 - Numerical Detail"
      },
      {
        q: "When will the official opening ceremony take place?",
        a: "March 15th",
        b: "Next Monday",
        c: "In ten years",
        d: "At the end of this month",
        correct: "A",
        exp: "ข่าวระบุ '...official ribbon-cutting ceremony scheduled for March 15th.'",
        tag: "Part 7 - Date Lookup"
      }
    ]
  },
  {
    setId: "set05",
    passage: `[Internal Team Chat - Slack Channel #design-team]
10:14 AM — Sarah Jenkins (Lead Designer):
Hey team, we just received feedback from the marketing director on the v2.0 brochure proofs. The client loves the layout, but they want all font sizes on the technical spec tables increased from 8pt to 10pt for legibility.

10:16 AM — Kevin Park (Graphic Artist):
I can update the InDesign files easily, but increasing the font size will push the table into the bottom legal disclaimer box on page 4. We'll need to trim about three lines of text from the feature overview.

10:18 AM — Lisa Gomez (Copywriter):
I'm on it. I can tighten the prose in the feature overview section to free up vertical space without losing any key selling points. Give me 20 minutes.

10:20 AM — Sarah Jenkins:
Perfect. Once Lisa updates the copy, Kevin, please export a fresh PDF proof and send it to me. The marketing team needs the finalized version before their 1:00 PM print deadline.`,
    questions: [
      {
        q: "What change did the marketing director request?",
        a: "Increasing the font size on technical specification tables",
        b: "Replacing the corporate logo with a red banner",
        c: "Changing the brochure background from white to black",
        d: "Adding ten pages of customer testimonials",
        correct: "A",
        exp: "Sarah แจ้งว่าลูกค้าต้องการขยายขนาดฟอนต์ของตารางสเปกจาก 8pt เป็น 10pt เพื่อให้อ่านง่าย",
        tag: "Part 7 - Chat Request"
      },
      {
        q: "What issue did Kevin point out?",
        a: "The larger font will overlap with the legal disclaimer box.",
        b: "The graphic design software license has expired.",
        c: "The color printers in the office are out of toner.",
        d: "The client refused to pay the design deposit.",
        correct: "A",
        exp: "Kevin ทักว่าฟอนต์ใหญ่ขึ้นจะล้นไปทับกล่องข้อความกฎหมายด้านล่างหน้า 4",
        tag: "Part 7 - Problem Identification"
      },
      {
        q: "What deadline must the team meet?",
        a: "1:00 PM today",
        b: "10:20 AM today",
        c: "Tomorrow morning at 9:00 AM",
        d: "Friday afternoon",
        correct: "A",
        exp: "Sarah ย้ำว่าฝ่ายการตลาดต้องการไฟล์ฉบับสมบูรณ์ก่อนกำหนดส่งโรงพิมพ์เวลา 13:00 น. วันนี้",
        tag: "Part 7 - Deadline Detail"
      }
    ]
  },
  {
    setId: "set06",
    passage: `[Commercial Lease Notice & Building Regulations]
APEX COMMERCIAL TOWER — SUITE 900
TENANT ALTERATION DIRECTIVE

Tenant: Meridian Financial Partners
Premises: Suite 900, 9th Floor (12,500 sq. ft.)
Effective Date: November 1

Section 4.2: Interior Architectural Modifications
Tenants wishing to make structural or electrical alterations, including partition wall construction, plumbing additions, or hardwired audiovisual installations, must comply with the following:
1. Architectural blueprints must be submitted to Building Engineering at least fifteen business days prior to the proposed start of work.
2. All construction work generating noise in excess of 60 decibels (such as drilling or demolition) is strictly confined to non-business hours: Monday through Friday from 6:00 PM to 7:00 AM, and all day on weekends.
3. Contractors must maintain a minimum of two million dollars in commercial general liability insurance, naming Apex Properties as an additional insured party.
Failure to obtain written authorization prior to commencing work will result in immediate stoppage and a fine of $1,500 per day.`,
    questions: [
      {
        q: "What is the primary topic of the document?",
        a: "Rules governing tenant interior office renovations",
        b: "Guidelines for employee parking space allocation",
        c: "Procedures for terminating a commercial lease early",
        d: "Fire evacuation protocols for the 9th floor",
        correct: "A",
        exp: "เอกสารระบุข้อบังคับเกี่ยวกับการปรับปรุงต่อเติมตกแต่งภายในออฟฟิศของผู้เช่า",
        tag: "Part 7 - Document Purpose"
      },
      {
        q: "When is loud construction work permitted in the building?",
        a: "During non-business hours on weekday evenings and weekends",
        b: "Anytime during normal weekday business hours",
        c: "Only on national holiday weekends",
        d: "Between 9:00 AM and 5:00 PM on Mondays",
        correct: "A",
        exp: "งานก่อสร้างที่มีเสียงดังอนุญาตเฉพาะนอกเวลาทำการ (จันทร์-ศุกร์ 18:00-07:00 น. และวันหยุดสุดสัปดาห์)",
        tag: "Part 7 - Permitted Hours"
      },
      {
        q: "What penalty is imposed for unauthorized construction work?",
        a: "A fine of $1,500 per day and work stoppage",
        b: "Immediate cancellation of the commercial lease",
        c: "Confiscation of the contractor's equipment",
        d: "Suspension of water and electric utilities",
        correct: "A",
        exp: "ท้ายเอกสารระบุบทลงโทษ '...fine of $1,500 per day and immediate stoppage.'",
        tag: "Part 7 - Penalty Clause"
      }
    ]
  },
  {
    setId: "set07",
    passage: `[Corporate Wellness Benefit Policy]
CardCraft Employee Benefits Program
ANNUAL HEALTH & WELLNESS SUBSIDY

Overview:
CardCraft believes that physical well-being fosters workplace creativity and focus. All full-time employees who have completed their initial ninety-day probationary period are eligible for an annual health and wellness reimbursement of up to $500 per calendar year.

Eligible Expenses:
• Commercial fitness center memberships (gyms, yoga studios, climbing centers)
• Purchase of home exercise equipment (treadmills, stationary bicycles, free weights)
• Ergonomic home office accessories (lumbar supports, balance ball chairs)
• Registration fees for community athletic competitions (5K marathons, triathlons)

Ineligible Expenses:
• Athletic clothing and footwear
• Dietary meal replacement shakes and nutritional supplements
• Personal smartwatches and general consumer electronics

Submission Deadline:
All claims for the current year must be submitted through the HR Employee Portal with attached itemized receipts no later than December 15th.`,
    questions: [
      {
        q: "Who is eligible for the annual wellness subsidy?",
        a: "Full-time employees past their 90-day probationary period",
        b: "Senior executive vice presidents only",
        c: "Part-time summer interns in engineering",
        d: "Any employee who registers for a marathon",
        correct: "A",
        exp: "พนักงานประจำที่ผ่านการทดลองงาน 90 วันจึงจะมีสิทธิ์ ('completed initial ninety-day probationary period')",
        tag: "Part 7 - Eligibility Criteria"
      },
      {
        q: "Which of the following purchases is eligible for reimbursement?",
        a: "A home stationary exercise bicycle",
        b: "A pair of designer athletic running shoes",
        c: "A daily protein meal replacement shake",
        d: "A high-end smartwatch with cellular data",
        correct: "A",
        exp: "ในหมวดสินค้าที่เบิกได้ระบุ 'home exercise equipment (treadmills, stationary bicycles...)'",
        tag: "Part 7 - Eligible Items"
      },
      {
        q: "What is the final deadline to submit reimbursement claims?",
        a: "December 15th",
        b: "December 31st",
        c: "Within ninety days of hire",
        d: "At the end of each calendar month",
        correct: "A",
        exp: "กำหนดส่งใบเสร็จเบิกเงินวันสุดท้ายคือวันที่ 15 ธันวาคม ('no later than December 15th')",
        tag: "Part 7 - Deadline Lookup"
      }
    ]
  },
  {
    setId: "set08",
    passage: `[Job Advertisement & Candidate Cover Letter]
Apex Financial Systems — Job Posting
Position: Senior Financial Planning Analyst
Location: Chicago, IL (Hybrid: 3 days in office, 2 days remote)

Key Responsibilities:
• Build comprehensive quarterly financial forecast models for corporate clients
• Lead budget consolidation and variance analysis across international subsidiaries
• Present financial insights to executive leadership and external auditors

Required Qualifications:
• Bachelor's degree in Finance, Accounting, or Economics; CPA or MBA preferred
• Minimum of 5 years of professional experience in corporate financial planning
• Advanced proficiency in financial modeling and enterprise ERP platforms (SAP/Oracle)

Candidate Letter:
From: r.harrison@gmail.com
To: careers@apexfinancial.com
Date: October 20
"Dear Hiring Committee,
I am writing to express my strong interest in the Senior Financial Planning Analyst role. Over the past six years at Highland Holdings, I directed quarterly financial forecasting and variance analysis across eight European subsidiaries. I hold an MBA in Corporate Finance from Northwestern University and possess deep expertise in SAP enterprise accounting. I look forward to the opportunity to discuss how my analytical background aligns with Apex Financial's growth."`,
    questions: [
      {
        q: "What work arrangement does the job offer?",
        a: "A hybrid schedule with three days in the office",
        b: "A fully remote position based anywhere worldwide",
        c: "Full-time on-site work in New York City",
        d: "Weekend-only shifts in corporate auditing",
        correct: "A",
        exp: "ประกาศงานระบุ 'Hybrid: 3 days in office, 2 days remote' ตรงกับ (A)",
        tag: "Part 7 - Work Arrangement"
      },
      {
        q: "How many years of experience does Mr. Harrison have?",
        a: "Six years",
        b: "Five years",
        c: "Two years",
        d: "Ten years",
        correct: "A",
        exp: "ผู้สมัครระบุในจดหมาย 'Over the past six years at Highland Holdings...'",
        tag: "Part 7 - Candidate Experience"
      },
      {
        q: "What advanced degree does Mr. Harrison hold?",
        a: "An MBA in Corporate Finance",
        b: "A Ph.D. in Macroeconomics",
        c: "A Bachelor's in Graphic Design",
        d: "A Master's in Computer Science",
        correct: "A",
        exp: "ผู้สมัครระบุ 'I hold an MBA in Corporate Finance from Northwestern University...'",
        tag: "Part 7 - Candidate Degree"
      }
    ]
  },
  {
    setId: "set09",
    passage: `[Hotel Reservation & Guest Service Request]
GRAND METROPOLITAN HOTEL & SUITES
Reservation Confirmation #GM-9024

Guest Name: Ms. Rebecca Vance
Check-in: Thursday, November 6 (after 3:00 PM)
Check-out: Sunday, November 9 (by 11:00 AM)
Room Type: Deluxe Executive King Suite — High Floor (Non-Smoking)
Total Room Rate: $645.00 (3 nights @ $215/night, taxes included)

Special Inclusions:
• Complimentary access to Executive Lounge (Continental breakfast & evening hors d'oeuvres)
• High-speed fiber Wi-Fi throughout the hotel premises

Guest Email Inquiry:
Date: November 2
"Dear Grand Metropolitan Concierge,
I am arriving on Horizon Air flight 418 at 4:30 PM on November 6th. Does the hotel operate a shuttle service from O'Hare International Airport? If so, what is the pickup location at Terminal 2, and what is the schedule?"

Concierge Response:
Date: November 3
"Dear Ms. Vance,
Yes, our complimentary airport shuttles depart Terminal 2 outside Door 2A every thirty minutes at quarter past and quarter to the hour. Our driver will hold a green Grand Metropolitan tablet. We look forward to welcoming you."`,
    questions: [
      {
        q: "How long will Ms. Vance stay at the hotel?",
        a: "Three nights",
        b: "One night",
        c: "Five nights",
        d: "One full week",
        correct: "A",
        exp: "เข้าพักตั้งแต่วันที่ 6-9 พฤศจิกายน รวมทั้งหมด 3 คืน (3 nights)",
        tag: "Part 7 - Duration of Stay"
      },
      {
        q: "Where does the airport shuttle pick up guests at Terminal 2?",
        a: "Outside Door 2A",
        b: "Near the baggage carousel #4",
        c: "At the taxi dispatch center",
        d: "Inside the rental car pavilion",
        correct: "A",
        exp: "เจ้าหน้าที่คอนเซียร์จระบุว่ารถรับส่งจอดรับผู้โดยสารที่ 'outside Door 2A'",
        tag: "Part 7 - Pickup Location"
      },
      {
        q: "How frequently does the airport shuttle operate?",
        a: "Every thirty minutes",
        b: "Once every hour",
        c: "Only upon telephone call request",
        d: "Twice a day in the morning and evening",
        correct: "A",
        exp: "รถวิ่งทุกๆ 30 นาที ('every thirty minutes at quarter past and quarter to the hour')",
        tag: "Part 7 - Shuttle Frequency"
      }
    ]
  },
  {
    setId: "set10",
    passage: `[Press Release & Technical Abstract]
Solstice Power Unveils Breakthrough Solid-State Solar Battery
Press Release — Austin, TX
October 24

Solstice Power today announced that it has successfully completed field trials for its next-generation commercial energy storage system, the TerraVault 500.
Utilizing non-flammable solid-state electrolytes, the TerraVault 500 achieves forty percent greater energy density than traditional lithium-ion batteries while reducing manufacturing costs by twenty-five percent.
Crucially, the unit can operate in extreme temperatures ranging from -30°C to 55°C without requiring active liquid cooling systems.
Commercial deliveries to manufacturing plants and hospital microgrids will commence in March of next year.

Technical Abstract:
Model: TerraVault 500
Storage Capacity: 500 kWh per module (scalable up to 10 MWh)
Cycle Life: 8,000 full recharge cycles (estimated 20-year operational lifespan)
Safety Certifications: UL 9540A fire safety standard certified`,
    questions: [
      {
        q: "What major advantage does the TerraVault 500 have over traditional batteries?",
        a: "40% greater energy density and lower manufacturing costs",
        b: "It is small enough to fit inside a consumer smartphone",
        c: "It requires active liquid nitrogen cooling at all times",
        d: "It operates exclusively using wind turbine power",
        correct: "A",
        exp: "แถลงข่าวระบุมีความหนาแน่นพลังงานมากกว่าเดิม 40% และลดต้นทุนการผลิตลง 25%",
        tag: "Part 7 - Technical Advantage"
      },
      {
        q: "When will commercial deliveries of the battery begin?",
        a: "March of next year",
        b: "October 24th",
        c: "In twenty years",
        d: "Immediately upon request",
        correct: "A",
        exp: "ในข่าวระบุ 'Commercial deliveries... will commence in March of next year.'",
        tag: "Part 7 - Delivery Schedule"
      },
      {
        q: "What is the estimated operational lifespan of the TerraVault 500?",
        a: "Twenty years",
        b: "Five years",
        c: "Ten years",
        d: "Fifty years",
        correct: "A",
        exp: "ในส่วนสเปกเทคนิคระบุ '...estimated 20-year operational lifespan'",
        tag: "Part 7 - Lifespan Specification"
      }
    ]
  },
  {
    setId: "set11",
    passage: `[Store Return Policy & Customer Receipt]
TECHMART ELECTRONICS — STORE #402
1420 Michigan Avenue, Chicago, IL

Sales Receipt #TM-8942
Date of Purchase: October 10
Item: ProBook Elite 15-inch Laptop ($1,199.00)
Payment Method: Visa ending in 4421

Return & Exchange Policy:
1. Unopened merchandise in original packaging may be returned within 30 days for a full refund to the original method of payment.
2. Defective electronic hardware reported within 14 days of purchase qualifies for immediate on-site exchange or full refund, provided the original sales receipt is presented.
3. Software, downloaded digital products, and opened headphones are strictly non-refundable.

Customer Service Log:
Customer: Arthur Miller
Date of Return: October 16
Reason: Laptop internal display flickers intermittently when running battery power.
Action Taken: Hardware diagnostic confirmed display ribbon cable defect. Immediate replacement unit issued from warehouse stock.`,
    questions: [
      {
        q: "What item did Arthur Miller purchase on October 10th?",
        a: "A ProBook Elite 15-inch laptop",
        b: "A pair of wireless headphones",
        c: "Accounting software on USB drive",
        d: "A high-speed desktop laser printer",
        correct: "A",
        exp: "ใบเสร็จระบุรายการซื้อ 'ProBook Elite 15-inch Laptop ($1,199.00)'",
        tag: "Part 7 - Receipt Details"
      },
      {
        q: "Why was Arthur Miller eligible for an immediate replacement on October 16th?",
        a: "He reported hardware defect within 14 days and had the receipt.",
        b: "He purchased an extended three-year commercial warranty.",
        c: "He works as a technician for TechMart Electronics.",
        d: "He returned an unopened cardboard box.",
        correct: "A",
        exp: "วันที่ 16 ตุลาคม ห่างจากวันที่ซื้อ (10 ต.ค.) เพียง 6 วัน ซึ่งอยู่ในกรอบ 14 วันสำหรับสินค้ามีตำหนิพร้อมใบเสร็จ",
        tag: "Part 7 - Policy Application"
      },
      {
        q: "How was the customer's issue resolved?",
        a: "He received an immediate replacement unit from stock.",
        b: "He was issued a store credit voucher.",
        c: "His laptop was sent to California for a three-week repair.",
        d: "He was given a cash refund of $500.",
        correct: "A",
        exp: "บันทึกการบริการระบุ 'Immediate replacement unit issued from warehouse stock.'",
        tag: "Part 7 - Resolution Detail"
      }
    ]
  },
  {
    setId: "set12",
    passage: `[Executive Travel Itinerary & Flight Confirmation]
CardCraft Corporation — Executive Travel Itinerary
Traveler: David Sterling, Chief Executive Officer
Purpose: East Asia Partner Summit & Regional Facility Tour

Flight Details:
• Segment 1: Tuesday, November 11
  Flight: Pacific Rim Airlines #402
  Depart: Chicago O'Hare (ORD) at 11:30 AM
  Arrive: Tokyo Narita (NRT) at 3:45 PM (+1 day)
  Seat: 2A (Business Class)
• Segment 2: Friday, November 14
  Flight: Asiana Express #214
  Depart: Tokyo Haneda (HND) at 9:15 AM
  Arrive: Seoul Incheon (ICN) at 11:50 AM
  Seat: 3D (Business Class)
• Segment 3: Monday, November 17
  Flight: Singapore Airlines #812
  Depart: Seoul Incheon (ICN) at 2:20 PM
  Arrive: Singapore Changi (SIN) at 8:05 PM
  Seat: 1F (Business Class)

Accommodation:
• Tokyo: The Imperial Hotel Tokyo (3 nights)
• Seoul: Grand Hyatt Seoul (3 nights)
• Singapore: Marina Bay Sands (2 nights)`,
    questions: [
      {
        q: "What is the primary purpose of David Sterling's trip?",
        a: "An East Asia partner summit and facility tour",
        b: "A family vacation to historical monuments",
        c: "Attending a medical healthcare conference",
        d: "Conducting university guest lectures",
        correct: "A",
        exp: "หัวเอกสารระบุ 'Purpose: East Asia Partner Summit & Regional Facility Tour'",
        tag: "Part 7 - Travel Purpose"
      },
      {
        q: "When does David Sterling arrive in Tokyo?",
        a: "Wednesday afternoon at 3:45 PM",
        b: "Tuesday morning at 11:30 AM",
        c: "Friday at 9:15 AM",
        d: "Monday at 8:05 PM",
        correct: "A",
        exp: "ออกบินวันอังคาร ถึงโตเกียวเวลา 15:45 น. วันถัดไป (+1 day) ซึ่งคือวันพุธ",
        tag: "Part 7 - Time Zone & Date"
      },
      {
        q: "Where will David stay while in Seoul?",
        a: "Grand Hyatt Seoul",
        b: "The Imperial Hotel",
        c: "Marina Bay Sands",
        d: "The Westin Chosun",
        correct: "A",
        exp: "ในหมวดโรงแรมระบุ 'Seoul: Grand Hyatt Seoul (3 nights)'",
        tag: "Part 7 - Hotel Lookup"
      }
    ]
  },
  {
    setId: "set13",
    passage: `[Commercial Real Estate Listing & Email Inquiry]
DOWNTOWN COMMERCIAL REALTY
Featured Office Property — Listing #OFC-772
Location: 220 Market Street, 6th Floor, Philadelphia, PA
Size: 8,500 rentable square feet
Lease Rate: $28.00 per sq. ft. annually (Triple Net)

Property Highlights:
• Move-in ready open layout with 6 private executive offices and 2 conference rooms
• Dedicated server room with independent 5-ton HVAC cooling system
• Floor-to-ceiling glass windows offering abundant natural daylight
• Direct elevator access with keycard security

Email Inquiry:
To: leasing@downtownrealty.com
From: c.hastings@novatech.com
Date: October 22
"Dear Leasing Agent,
Our technology consultancy is looking to relocate its regional headquarters by January 1st. Listing #OFC-772 appears very suitable for our 45-person team. Could we arrange a walkthrough inspection this Thursday afternoon around 2:00 PM? Furthermore, does the building have reserved underground parking spaces available for tenants?"`,
    questions: [
      {
        q: "What is the annual lease rate for the Market Street office space?",
        a: "$28.00 per square foot",
        b: "$220.00 per square foot",
        c: "$8,500 per month",
        d: "$45.00 per square foot",
        correct: "A",
        exp: "ประกาศระบุ 'Lease Rate: $28.00 per sq. ft. annually'",
        tag: "Part 7 - Pricing Detail"
      },
      {
        q: "What specific facility is included in the office suite?",
        a: "A dedicated server room with independent HVAC cooling",
        b: "A full commercial restaurant kitchen with ovens",
        c: "An outdoor swimming pool for employees",
        d: "A private underground bank vault",
        correct: "A",
        exp: "จุดเด่นระบุ 'Dedicated server room with independent 5-ton HVAC cooling system'",
        tag: "Part 7 - Facility Feature"
      },
      {
        q: "What does Cheryl Hastings inquire about in her email?",
        a: "A walkthrough inspection and parking availability",
        b: "A reduction in the monthly rental price",
        c: "Purchasing the building outright",
        d: "Canceling an existing commercial lease",
        correct: "A",
        exp: "Cheryl สอบถามขอนัดดูสถานที่วันพฤหัสบดีเวลา 14:00 น. และถามเรื่องที่จอดรถใต้ดิน",
        tag: "Part 7 - Inquiry Intent"
      }
    ]
  },
  {
    setId: "set14",
    passage: `[Customer Survey Analysis Report]
CardCraft Mobile Learning Platform v2.0
Quarterly User Satisfaction Survey Summary
Sample Size: 4,200 Active Enterprise Users
Survey Period: September 1 – September 30

Overall Satisfaction Rating: 91% Positive (Up 6% from Q2)

Key Survey Findings:
1. Feature Popularity:
   • 7-Part TOEIC Drills: 94% rated 'Extremely Helpful' for exam readiness.
   • Vocab Arcade Mini-Games: 89% reported that Rune Match and Anagram Forge made vocabulary retention substantially faster compared to traditional flashcards.
2. Usability & UI Performance:
   • 96% praised the clean Pixel-RPG aesthetic and absence of distracting neon gradients.
   • Mobile responsiveness scored 93% on smartphones and tablets.
3. Top User Feature Requests:
   • 42% requested expanded reading passage questions for Part 7.
   • 38% requested offline audio synchronization for commuter practice.

Next Steps:
Engineering has prioritized adding 50 new questions per part to the mock exam question pool by late October.`,
    questions: [
      {
        q: "What percentage of surveyed users gave a positive satisfaction rating?",
        a: "91%",
        b: "94%",
        c: "89%",
        d: "42%",
        correct: "A",
        exp: "หัวรายงานระบุ 'Overall Satisfaction Rating: 91% Positive'",
        tag: "Part 7 - Survey Statistics"
      },
      {
        q: "Which feature was praised for speeding up vocabulary retention?",
        a: "Vocab Arcade Mini-Games (Rune Match & Anagram Forge)",
        b: "Paper dictionary flashcards",
        c: "Weekly grammar lectures on video",
        d: "Printed textbook reading drills",
        correct: "A",
        exp: "ผู้ใช้ระบุว่ามินิเกมใน Vocab Arcade ช่วยให้จำศัพท์ได้ไวกว่าเดิมอย่างมาก",
        tag: "Part 7 - Feature Feedback"
      },
      {
        q: "What action did engineering prioritize based on user requests?",
        a: "Adding 50 new questions per part to the question pool",
        b: "Replacing all pixel art avatars with photographic portraits",
        c: "Increasing monthly subscription prices by ten percent",
        d: "Eliminating the 7-Part TOEIC drill section",
        correct: "A",
        exp: "ในหัวข้อ Next Steps ระบุ 'Engineering has prioritized adding 50 new questions per part...'",
        tag: "Part 7 - Action Item"
      }
    ]
  },
  {
    setId: "set15",
    passage: `[Online Engineering Team Chat - Slack Channel #cloud-migration]
8:45 PM — Marcus Vance (Infrastructure Lead):
Team, we are sixty minutes away from commencing the AWS database migration window. All automated pre-migration database snapshots have completed successfully.

8:48 PM — Elena Rostova (DevOps Engineer):
Confirmed. Web services will go into read-only mode at 9:55 PM. The maintenance banner is already live on the homepage alerting users that login will be paused from 10:00 PM to 2:00 AM.

8:51 PM — David Kim (Lead DBA):
I've checked the replication lag between our local PostgreSQL database and the cloud RDS instance; it's currently under two milliseconds. We're in prime condition for the cutover.

8:54 PM — Marcus Vance:
Great. Once the cutover completes around 1:30 AM, our QA team will execute thirty automated test suites to verify data integrity before we re-enable public user logins. Let's do this!`,
    questions: [
      {
        q: "What technical operation is the team preparing to execute?",
        a: "A cloud database migration",
        b: "An office network rewiring project",
        c: "A redesign of the user interface logo",
        d: "A server hardware replacement in the basement",
        correct: "A",
        exp: "ทีมกำลังเตรียมการย้ายฐานข้อมูลสู่คลาวด์ ('AWS database migration')",
        tag: "Part 7 - Operation Description"
      },
      {
        q: "During what hours will user login services be paused?",
        a: "From 10:00 PM to 2:00 AM",
        b: "All weekend from Friday to Sunday",
        c: "From 8:45 PM to 9:55 PM",
        d: "Between 1:30 AM and 3:00 AM",
        correct: "A",
        exp: "Elena แจ้งว่าระบบล็อกอินจะหยุดชั่วคราว 'from 10:00 PM to 2:00 AM'",
        tag: "Part 7 - Downtime Hours"
      },
      {
        q: "What will the QA team do after the database cutover?",
        a: "Execute automated test suites to verify data integrity",
        b: "Delete all previous database backup files",
        c: "Email all customers to reset their passwords",
        d: "Order pizza for the morning shift",
        correct: "A",
        exp: "Marcus ระบุ '...QA team will execute thirty automated test suites to verify data integrity...'",
        tag: "Part 7 - Post-Cutover Task"
      }
    ]
  },
  {
    setId: "set16",
    passage: `[Product Warranty & Operating Instructions]
AERO-PURE COMMERCIAL AIR FILTRATION SYSTEM
Model: AP-400 Industrial
Warranty Terms & Maintenance Guide

Congratulations on purchasing the Aero-Pure AP-400 commercial air filtration unit. Engineered for hospitals, manufacturing cleanrooms, and executive office suites, the AP-400 removes 99.97% of airborne particulates down to 0.3 microns.

Maintenance Schedule:
• Pre-Filter: Inspect monthly. Wash under lukewarm water and allow to dry completely before reinserting. Replace every 6 months.
• True HEPA Filter: Must not be washed. Replace every 12 months, or when the digital filter indicator light illuminates red.
• Activated Carbon Filter: Replace every 6 to 9 months depending on environmental volatile organic compound (VOC) levels.

Warranty Coverage:
Aero-Pure warrants this unit against defects in materials and workmanship for a period of 3 years from the original purchase date. This warranty does not cover damage caused by unauthorized alterations, immersion in water, or operating with unapproved generic replacement filters.`,
    questions: [
      {
        q: "What is the particle filtration efficiency of the AP-400?",
        a: "99.97% of particulates down to 0.3 microns",
        b: "50% of airborne dust and smoke",
        c: "80% of outdoor pollen and moisture",
        d: "100% of all chemical gases",
        correct: "A",
        exp: "ในคู่มือระบุ '...removes 99.97% of airborne particulates down to 0.3 microns'",
        tag: "Part 7 - Technical Efficiency"
      },
      {
        q: "How should the Pre-Filter be cleaned?",
        a: "Washed with lukewarm water and dried completely",
        b: "Wiped with an alcohol disinfectant cloth",
        c: "Cleaned inside an automated dishwasher",
        d: "Vacuumed with a high-power industrial blower",
        correct: "A",
        exp: "คำแนะนำระบุ 'Wash under lukewarm water and allow to dry completely...'",
        tag: "Part 7 - Cleaning Instruction"
      },
      {
        q: "What action would void the 3-year product warranty?",
        a: "Operating the unit with unapproved generic replacement filters",
        b: "Washing the pre-filter once a month",
        c: "Installing the unit in an executive office suite",
        d: "Replacing the HEPA filter after 12 months",
        correct: "A",
        exp: "เงื่อนไขการรับประกันระบุว่าไม่ครอบคลุม '...operating with unapproved generic replacement filters.'",
        tag: "Part 7 - Warranty Exclusion"
      }
    ]
  },
  {
    setId: "set17",
    passage: `[Community Volunteer Day Announcement]
CardCraft Corporate Social Responsibility
ANNUAL COMMUNITY VOLUNTEER DAY — NOVEMBER 22

Join your colleagues as we partner with the Greater Chicago Food Depository for our annual corporate day of service!
Date: Saturday, November 22
Shift A: 9:00 AM – 12:30 PM (Packing nonperishable family food boxes)
Shift B: 1:30 PM – 5:00 PM (Sorting fresh produce and warehouse palletizing)
Location: 4141 South Claremont Avenue, Chicago, IL

Transportation & Attire:
Complimentary chartered buses will depart from CardCraft headquarters at 8:15 AM and 12:45 PM.
Volunteers must wear closed-toe athletic footwear or work boots. Loose clothing, dangling jewelry, and open sandals are prohibited on the warehouse floor for safety reasons.
All participants will receive a commemorative volunteer T-shirt and complimentary boxed lunch.`,
    questions: [
      {
        q: "What activity will volunteers in Shift A perform?",
        a: "Packing nonperishable family food boxes",
        b: "Sorting fresh agricultural produce",
        c: "Driving chartered delivery buses",
        d: "Cooking hot meals for community centers",
        correct: "A",
        exp: "กะเช้า (Shift A) ทำกิจกรรม 'Packing nonperishable family food boxes'",
        tag: "Part 7 - Volunteer Shift Detail"
      },
      {
        q: "What footwear requirement is mandated for volunteers?",
        a: "Closed-toe athletic footwear or work boots",
        b: "Waterproof rubber fishing waders",
        c: "Formal black leather dress shoes",
        d: "Open-toe beach sandals",
        correct: "A",
        exp: "ข้อกำหนดความปลอดภัยระบุ 'Volunteers must wear closed-toe athletic footwear or work boots.'",
        tag: "Part 7 - Safety Attire"
      }
    ]
  }
];

let counter = 1;
const formattedQuestions = [];

sets.forEach((s) => {
  s.questions.forEach((q) => {
    formattedQuestions.push({
      id: `q-read-p7-ext-${String(counter).padStart(2, '0')}`,
      section: 'READING',
      part: 7,
      audioUrl: null,
      imageUrl: null,
      passageText: s.passage,
      questionText: q.q,
      optionA: q.a,
      optionB: q.b,
      optionC: q.c,
      optionD: q.d,
      correctOption: q.correct,
      explanationTh: q.exp,
      tag: q.tag,
    });
    counter++;
  });
});

fs.writeFileSync(
  path.join(__dirname, 'part7-extended.json'),
  JSON.stringify(formattedQuestions, null, 2),
  'utf8'
);

console.log(`Generated ${formattedQuestions.length} Part 7 extended questions.`);
