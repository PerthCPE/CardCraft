// ============================================================================
// frontend/src/data/questions/generate-p3.js
// 50 Authentic TOEIC Part 3 (Conversations) Questions
// 17 Realistic Business Dialogues with complete dialogue passage text
// ============================================================================

const fs = require('fs');
const path = require('path');

const dialogues = [
  {
    dialogueId: "d01",
    passage: `[Audio Dialogue - Conference Catering Contract]
Man: Hi Lisa, did you finish reviewing the catering contract for next week's annual shareholder banquet?
Woman: I just went over the final draft, David. The dinner menu looks great, but the vendor added an unexpected delivery surcharge of four hundred dollars.
Man: That definitely wasn't in our initial price quote. Let's call their sales representative before signing so we can negotiate waiving that extra fee.`,
    questions: [
      {
        q: "What event are the speakers organizing?",
        a: "An annual shareholder banquet",
        b: "A new product demonstration",
        c: "An executive retirement party",
        d: "A charity golf fundraiser",
        correct: "A",
        exp: "ผู้ชายถามว่า '...banquet for next week's annual shareholder banquet?' จึงตรงกับข้อ (A)",
        tag: "Part 3 - Main Purpose"
      },
      {
        q: "What issue does the woman point out regarding the contract?",
        a: "An unexpected delivery surcharge was added.",
        b: "The venue has insufficient seating.",
        c: "The vegetarian options are missing.",
        d: "The event date was printed incorrectly.",
        correct: "A",
        exp: "ผู้หญิงระบุว่า '...the vendor added an unexpected delivery surcharge of four hundred dollars' ตรงกับข้อ (A)",
        tag: "Part 3 - Problem Identification"
      },
      {
        q: "What does the man suggest doing next?",
        a: "Calling the vendor's representative to negotiate the fee",
        b: "Canceling the catering agreement immediately",
        c: "Signing the document without changes",
        d: "Looking for an entirely new caterer",
        correct: "A",
        exp: "ผู้ชายแนะนำ 'Let's call their sales representative before signing so we can negotiate waiving that extra fee.' ตรงกับข้อ (A)",
        tag: "Part 3 - Action Suggestion"
      }
    ]
  },
  {
    dialogueId: "d02",
    passage: `[Audio Dialogue - Office Ergonomic Equipment]
Woman: Mark, several programmers in the development department have complained about chronic back pain from their old office chairs.
Man: I noticed that too. Facilities has twenty thousand dollars remaining in this quarter's equipment budget. We should order ergonomic chairs and adjustable standing desks.
Woman: Great idea. I'll ask Apex Office Supplies to send over their commercial catalog and pricing schedule by this afternoon.`,
    questions: [
      {
        q: "Why does the woman speak with Mark?",
        a: "To report workplace comfort concerns from programmers",
        b: "To schedule an annual physical exam",
        c: "To request a budget increase from the board",
        d: "To complain about office temperature",
        correct: "A",
        exp: "ผู้หญิงรายงานว่าโปรแกรมเมอร์หลายคนบ่นเรื่องปวดหลังเรื้อรังจากเก้าอี้ตัวเก่า จึงตรงกับ (A)",
        tag: "Part 3 - Reason for Speaking"
      },
      {
        q: "What does the man mention about the department budget?",
        a: "There are remaining funds available this quarter.",
        b: "The budget has already been exhausted.",
        c: "All capital spending is frozen until next year.",
        d: "The board rejected their financing request.",
        correct: "A",
        exp: "ผู้ชายระบุ 'Facilities has twenty thousand dollars remaining in this quarter's equipment budget' แสดงว่ายังมีงบเหลือ",
        tag: "Part 3 - Detail Extraction"
      },
      {
        q: "What will the woman do this afternoon?",
        a: "Request a commercial catalog and pricing from a supplier",
        b: "Deliver new chairs to the engineering floor",
        c: "Interview applicants for a facilities position",
        d: "Install adjustable standing desks",
        correct: "A",
        exp: "ผู้หญิงกล่าว 'I'll ask Apex Office Supplies to send over their commercial catalog and pricing schedule...' ตรงกับ (A)",
        tag: "Part 3 - Next Action"
      }
    ]
  },
  {
    dialogueId: "d03",
    passage: `[Audio Dialogue - Client Presentation & Flight Delay]
Man: Rachel, bad news. Our flight to Chicago was just delayed by three hours because of severe thunderstorms over the Midwest.
Woman: Oh no, that means we won't land until 4 PM. Our presentation to the Meridian client is scheduled for 3:30!
Man: I'll phone Mr. Sterling right away and ask if we can push the meeting back to 5:30 or conduct it tomorrow morning over breakfast.`,
    questions: [
      {
        q: "Why were the speakers' travel plans disrupted?",
        a: "Severe weather caused a flight delay.",
        b: "Their tickets were accidentally canceled.",
        c: "The airport security terminal was closed.",
        d: "The pilot was unavailable for departure.",
        correct: "A",
        exp: "ผู้ชายบอกว่าเที่ยวบินดีเลย์ 3 ชั่วโมงเนื่องจากพายุฝนฟ้าคะนองรุนแรง ('severe thunderstorms') ตรงกับ (A)",
        tag: "Part 3 - Cause of Delay"
      },
      {
        q: "What was originally planned for 3:30 PM?",
        a: "A client presentation with Meridian",
        b: "A flight check-in deadline",
        c: "An executive dinner reception",
        d: "A hotel check-out inspection",
        correct: "A",
        exp: "ผู้หญิงบอก 'Our presentation to the Meridian client is scheduled for 3:30!' ตรงกับ (A)",
        tag: "Part 3 - Time & Schedule"
      },
      {
        q: "What will the man do immediately?",
        a: "Contact Mr. Sterling to adjust the meeting time",
        b: "Book a flight on a different airline",
        c: "Cancel the client presentation completely",
        d: "Return to the corporate headquarters",
        correct: "A",
        exp: "ผู้ชายจะโทรหาคุณ Sterling ทันทีเพื่อขอเลื่อนเวลาประชุมไป 17:30 น. หรือคุยช่วงอาหารเช้าวันถัดไป",
        tag: "Part 3 - Immediate Next Step"
      }
    ]
  },
  {
    dialogueId: "d04",
    passage: `[Audio Dialogue - Laser Printer Jam & Service Call]
Woman: James, the color laser printer in Accounting keeps displaying an error code E-42 whenever anyone tries to print double-sided reports.
Man: That usually indicates a paper feed roller misalignment. Have you tried power cycling the machine?
Woman: Yes, twice, but the error persists. We have the quarterly audit starting tomorrow, so we really need it fixed today.
Man: Alright, I'll call the certified technician from Canon. Our service contract guarantees a four-hour response window.`,
    questions: [
      {
        q: "What problem is the woman describing?",
        a: "An office printer is malfunctioning repeatedly.",
        b: "The accounting software license expired.",
        c: "There is no paper left in the supply room.",
        d: "The network router lost internet connection.",
        correct: "A",
        exp: "ผู้หญิงแจ้งว่าเครื่องพิมพ์เลเซอร์สีในแผนกบัญชีขึ้น error code ตลอดเวลา ตรงกับ (A)",
        tag: "Part 3 - Problem Diagnosis"
      },
      {
        q: "Why is fixing the equipment urgent?",
        a: "A quarterly audit begins tomorrow.",
        b: "The branch manager is visiting today.",
        c: "Tax filing documents must be mailed by noon.",
        d: "The office is closing early for the weekend.",
        correct: "A",
        exp: "ผู้หญิงระบุ 'We have the quarterly audit starting tomorrow, so we really need it fixed today.'",
        tag: "Part 3 - Urgency Detail"
      },
      {
        q: "What benefit of the service contract does the man mention?",
        a: "A guaranteed four-hour technician response time",
        b: "Free replacement cartridges every month",
        c: "Complimentary paper supplies",
        d: "An unlimited warranty on hardware damage",
        correct: "A",
        exp: "ผู้ชายบอก 'Our service contract guarantees a four-hour response window.'",
        tag: "Part 3 - Contract Detail"
      }
    ]
  },
  {
    dialogueId: "d05",
    passage: `[Audio Dialogue - Software Engineer Onboarding]
Man: Good morning Sandra, did Human Resources finish processing the paperwork for our two new software engineers?
Woman: Yes, their orientation begins this Monday at 9:00 AM. However, the IT department said their dedicated laptops won't arrive until Wednesday.
Man: That won't do. I'll speak to the IT director and arrange for them to use temporary loaner machines so they can start code walkthroughs on day one.`,
    questions: [
      {
        q: "Who is joining the company on Monday?",
        a: "Two software engineers",
        b: "A new human resources director",
        c: "Three marketing interns",
        d: "A senior financial auditor",
        correct: "A",
        exp: "ผู้ชายถามถึงเอกสารของ 'our two new software engineers' ตรงกับ (A)",
        tag: "Part 3 - Personnel Detail"
      },
      {
        q: "What issue did the IT department report?",
        a: "The assigned laptops won't arrive on time.",
        b: "The network login passwords were lost.",
        c: "The conference room has no internet.",
        d: "The engineering software is incompatible.",
        correct: "A",
        exp: "ผู้หญิงบอกว่าโน้ตบุ๊กประจำตำแหน่งจะไม่มาถึงจนกว่าจะถึงวันพุธ",
        tag: "Part 3 - Hardware Issue"
      },
      {
        q: "How will the man resolve the problem?",
        a: "By arranging temporary loaner laptops",
        b: "By delaying the orientation until Wednesday",
        c: "By purchasing laptops from a retail store",
        d: "By canceling the engineers' onboarding",
        correct: "A",
        exp: "ผู้ชายบอก 'I'll speak to the IT director and arrange for them to use temporary loaner machines...' ตรงกับ (A)",
        tag: "Part 3 - Solution Proposal"
      }
    ]
  },
  {
    dialogueId: "d06",
    passage: `[Audio Dialogue - Regional Sales Presentation]
Woman: Kevin, our quarterly sales presentation to the executive board is at 2:00 PM today. Are the regional charts finalized?
Man: The East Coast and Midwest graphs look great, but I'm still waiting for the West Coast retail numbers from Mr. Martinez in Los Angeles.
Woman: I talked to him twenty minutes ago; he just emailed the spreadsheet. Let's incorporate those numbers and print twelve slide decks.`,
    questions: [
      {
        q: "When is the executive presentation scheduled?",
        a: "At 2:00 PM today",
        b: "Tomorrow morning at 9:00 AM",
        c: "Next Monday afternoon",
        d: "On Friday at noon",
        correct: "A",
        exp: "ผู้หญิงระบุ '...presentation to the executive board is at 2:00 PM today.'",
        tag: "Part 3 - Time Detail"
      },
      {
        q: "What data was initially missing?",
        a: "West Coast retail sales figures",
        b: "Midwest customer survey results",
        c: "The international shipping tariff report",
        d: "The marketing advertising budget",
        correct: "A",
        exp: "ผู้ชายบอกว่ากำลังรอ 'West Coast retail numbers from Mr. Martinez'",
        tag: "Part 3 - Missing Information"
      },
      {
        q: "What does the woman instruct the man to do?",
        a: "Incorporate the data and print twelve slide decks",
        b: "Call Mr. Martinez for further explanation",
        c: "Postpone the executive meeting by an hour",
        d: "Send the presentation via registered mail",
        correct: "A",
        exp: "ผู้หญิงสั่ง 'Let's incorporate those numbers and print twelve slide decks.'",
        tag: "Part 3 - Directive"
      }
    ]
  },
  {
    dialogueId: "d07",
    passage: `[Audio Dialogue - Warehouse Customs Delay]
Man: Brenda, our logistics partner notified us that fifty crates of microchips are being held at the customs port in Long Beach.
Woman: Why? Did our freight forwarder fail to attach the revised certificate of origin?
Man: Exactly. Customs flagged the documentation discrepancy. If we don't submit the updated paperwork by 4:00 PM, they will hold the shipment over the entire weekend.
Woman: I'll reach out to our trade compliance attorney immediately to generate and expedite the stamp.`,
    questions: [
      {
        q: "What cargo is currently held at the port?",
        a: "Microchips in shipping crates",
        b: "Automobile replacement batteries",
        c: "Commercial kitchen appliances",
        d: "Bulk agricultural grain",
        correct: "A",
        exp: "ผู้ชายระบุ 'fifty crates of microchips are being held at the customs port'",
        tag: "Part 3 - Cargo Identification"
      },
      {
        q: "What caused customs to hold the shipment?",
        a: "A documentation discrepancy regarding origin certification",
        b: "Damage detected on the shipping container seals",
        c: "Unpaid shipping tariffs and port docking fees",
        d: "Suspected hazardous materials in the cargo",
        correct: "A",
        exp: "ผู้ชายตอบ 'Exactly. Customs flagged the documentation discrepancy.'",
        tag: "Part 3 - Root Cause"
      },
      {
        q: "What does the woman promise to do?",
        a: "Contact a compliance attorney to expedite the paperwork",
        b: "Travel to Long Beach port in person",
        c: "Request a refund from the freight forwarder",
        d: "Cancel the shipment contract",
        correct: "A",
        exp: "ผู้หญิงกล่าว 'I'll reach out to our trade compliance attorney immediately...'",
        tag: "Part 3 - Commitment"
      }
    ]
  },
  {
    dialogueId: "d08",
    passage: `[Audio Dialogue - Cafeteria Renovation]
Woman: Tom, I heard that the main employee cafeteria on the ground floor is closing for renovations starting next Monday.
Man: Yes, they're upgrading the kitchen ventilation and installing a modern salad bar. The remodel is expected to take three weeks.
Woman: Where are staff supposed to eat lunch in the meantime?
Man: Management arranged for four gourmet food trucks to park outside the east entrance every weekday from 11:30 to 1:30.`,
    questions: [
      {
        q: "What facility will undergo renovation next week?",
        a: "The employee cafeteria",
        b: "The executive boardroom",
        c: "The underground parking garage",
        d: "The fitness and wellness center",
        correct: "A",
        exp: "ผู้หญิงพูดถึง 'the main employee cafeteria on the ground floor'",
        tag: "Part 3 - Location"
      },
      {
        q: "How long will the renovation project last?",
        a: "Three weeks",
        b: "Two months",
        c: "Five business days",
        d: "The entire summer",
        correct: "A",
        exp: "ผู้ชายระบุ 'The remodel is expected to take three weeks.'",
        tag: "Part 3 - Duration"
      },
      {
        q: "What temporary arrangement has management made?",
        a: "Food trucks will park outside the east entrance.",
        b: "Free catered meals will be delivered to each desk.",
        c: "Employees will be given longer lunch vouchers.",
        d: "A temporary snack bar will open on the fourth floor.",
        correct: "A",
        exp: "ผู้ชายบอกว่าฝ่ายบริหารจัด 'four gourmet food trucks to park outside the east entrance'",
        tag: "Part 3 - Temporary Solution"
      }
    ]
  },
  {
    dialogueId: "d09",
    passage: `[Audio Dialogue - Marketing Rebranding Brochure]
Man: Clara, our marketing agency just sent over the draft proofs for the new product catalog.
Woman: How do they look? Did they use the updated navy blue and gold color scheme we agreed upon?
Man: The color palette is spot-on, but the font size on the technical specification tables is far too small to read comfortably.
Woman: Good catch. Let's write up a consolidated revision list and send it back to their lead graphic designer before noon.`,
    questions: [
      {
        q: "What document are the speakers reviewing?",
        a: "Draft proofs for a new product catalog",
        b: "An employment application portfolio",
        c: "A quarterly balance sheet report",
        d: "A lease agreement for office space",
        correct: "A",
        exp: "ผู้ชายบอก '...draft proofs for the new product catalog.'",
        tag: "Part 3 - Document Type"
      },
      {
        q: "What flaw does the man find with the draft?",
        a: "The font size on technical tables is too small.",
        b: "The corporate logo was omitted from the cover.",
        c: "The wrong color scheme was implemented.",
        d: "The product prices are printed incorrectly.",
        correct: "A",
        exp: "ผู้ชายระบุ '...the font size on the technical specification tables is far too small...'",
        tag: "Part 3 - Flaw Identification"
      },
      {
        q: "What is the agreed next step?",
        a: "Send a consolidated revision list before noon",
        b: "Fire the graphic design agency",
        c: "Print five thousand copies immediately",
        d: "Schedule an in-person meeting for next week",
        correct: "A",
        exp: "ผู้หญิงเสนอ 'Let's write up a consolidated revision list and send it back... before noon.'",
        tag: "Part 3 - Action Plan"
      }
    ]
  },
  {
    dialogueId: "d10",
    passage: `[Audio Dialogue - Factory Assembly Maintenance]
Woman: Eric, line three in the packaging section has been running thirty percent slower than usual all morning.
Man: The hydraulic conveyor belt sensors are triggering false alarms, which automatically decelerates the line.
Woman: We can't afford a bottleneck today because the pharmaceutical shipment must leave by 6:00 PM.
Man: I'll shut down line three for twenty minutes during the lunch shift to recalibrate the optical sensors.`,
    questions: [
      {
        q: "What issue is affecting packaging line three?",
        a: "It is operating significantly slower than usual.",
        b: "It caught fire due to an electrical short.",
        c: "The workers walked off the job in protest.",
        d: "The packaging materials ran out of stock.",
        correct: "A",
        exp: "ผู้หญิงระบุว่าไลน์ 3 วิ่งช้ากว่าปกติถึง 30% ('running thirty percent slower than usual')",
        tag: "Part 3 - Operational Issue"
      },
      {
        q: "What is causing the slowdown?",
        a: "Sensors are triggering false alarms on the conveyor belt.",
        b: "The hydraulic fluid pressure is completely depleted.",
        c: "The motor was installed backwards by technicians.",
        d: "The emergency stop button was pressed accidentally.",
        correct: "A",
        exp: "ผู้ชายอธิบาย 'The hydraulic conveyor belt sensors are triggering false alarms...'",
        tag: "Part 3 - Technical Cause"
      },
      {
        q: "When will the man perform the sensor recalibration?",
        a: "During the lunch shift",
        b: "Tomorrow morning before work",
        c: "After the plant closes at midnight",
        d: "During the weekend maintenance window",
        correct: "A",
        exp: "ผู้ชายระบุ '...during the lunch shift to recalibrate the optical sensors.'",
        tag: "Part 3 - Scheduled Action"
      }
    ]
  },
  {
    dialogueId: "d11",
    passage: `[Audio Dialogue - Healthcare Plan Open Enrollment]
Man: Karen, have you submitted your health insurance selection for the upcoming plan year?
Woman: Not yet. I'm torn between the comprehensive PPO plan and the High Deductible Health Plan with a Health Savings Account.
Man: HR is hosting a thirty-minute informational webinar this Thursday at 11:00 AM to compare the out-of-pocket costs.
Woman: That sounds very helpful. I'll register on the employee portal today so I can make an informed choice before Friday's deadline.`,
    questions: [
      {
        q: "What topic are the speakers discussing?",
        a: "Annual health insurance benefit selection",
        b: "Submitting a dental reimbursement claim",
        c: "Applying for parental leave benefits",
        d: "Scheduling an executive annual health checkup",
        correct: "A",
        exp: "ทั้งสองคุยเรื่องการเลือกแผนประกันสุขภาพประจำปี ('health insurance selection')",
        tag: "Part 3 - Main Subject"
      },
      {
        q: "What event will take place on Thursday at 11:00 AM?",
        a: "An HR informational webinar comparing healthcare plans",
        b: "A department head budget allocation meeting",
        c: "An executive board retirement ceremony",
        d: "A quarterly staff wellness training seminar",
        correct: "A",
        exp: "ผู้ชายแจ้งว่าฝ่ายบุคคลจัดเว็บบินาร์เปรียบเทียบค่าใช้จ่ายแผนประกัน",
        tag: "Part 3 - Event Announcement"
      },
      {
        q: "What deadline must the woman meet?",
        a: "Friday",
        b: "Wednesday",
        c: "Next Monday",
        d: "End of the month",
        correct: "A",
        exp: "ผู้หญิงพูดถึง 'before Friday's deadline' กำหนดส่งคือวันศุกร์",
        tag: "Part 3 - Deadline Extraction"
      }
    ]
  },
  {
    dialogueId: "d12",
    passage: `[Audio Dialogue - Office Lease Renewal]
Woman: Robert, our commercial lease for floors four and five expires in five months. The building landlord sent a renewal proposal with an eight percent rent increase.
Man: Eight percent is much higher than the current local market rate. We should definitely counter with a three percent cap.
Woman: I agree, especially since we've been tenants here for seven years and always pay on time.
Man: Let's schedule a meeting with our commercial leasing broker on Thursday to draft an official counteroffer letter.`,
    questions: [
      {
        q: "What did the building landlord propose?",
        a: "A lease renewal with an eight percent rent increase",
        b: "An immediate eviction to renovate the building",
        c: "A reduction in allocated parking spaces",
        d: "A five-year mandatory lease extension",
        correct: "A",
        exp: "ผู้หญิงแจ้งว่าเจ้าของตึกส่งข้อเสนอต่อสัญญาโดยขึ้นค่าเช่า 8%",
        tag: "Part 3 - Proposal Terms"
      },
      {
        q: "Why do the speakers believe they have leverage to negotiate?",
        a: "They have a seven-year record of on-time payments.",
        b: "They own shares in the landlord's real estate firm.",
        c: "The building has severe structural defects.",
        d: "They plan to downsize by half their office space.",
        correct: "A",
        exp: "ผู้หญิงกล่าว '...tenants here for seven years and always pay on time.'",
        tag: "Part 3 - Negotiation Leverage"
      },
      {
        q: "What will the speakers do on Thursday?",
        a: "Meet with their commercial leasing broker",
        b: "Move their office to a new building",
        c: "Sign the landlord's original proposal",
        d: "Consult with a corporate tax accountant",
        correct: "A",
        exp: "ผู้ชายเสนอ 'Let's schedule a meeting with our commercial leasing broker on Thursday...'",
        tag: "Part 3 - Planned Activity"
      }
    ]
  },
  {
    dialogueId: "d13",
    passage: `[Audio Dialogue - IT Server Migration]
Man: Patricia, IT is migrating our main database servers to AWS cloud infrastructure this Saturday starting at 10:00 PM.
Woman: Will customer-facing portals and checkout services be interrupted during the migration?
Man: Yes, we expect approximately four hours of maintenance downtime. All transactions will be paused between 10:00 PM Saturday and 2:00 AM Sunday.
Woman: I'll make sure our customer support team posts a conspicuous maintenance banner on the homepage by tomorrow noon.`,
    questions: [
      {
        q: "What project is scheduled for Saturday night?",
        a: "A database server migration to the cloud",
        b: "An office network cable rewiring project",
        c: "A cybersecurity penetration test",
        d: "An installation of new office desktop computers",
        correct: "A",
        exp: "ผู้ชายแจ้งเรื่อง 'migrating our main database servers to AWS cloud infrastructure'",
        tag: "Part 3 - Project Description"
      },
      {
        q: "How long is the service downtime expected to last?",
        a: "Approximately four hours",
        b: "All weekend",
        c: "Thirty minutes",
        d: "Until Monday morning",
        correct: "A",
        exp: "ผู้ชายระบุ '...approximately four hours of maintenance downtime.' (22:00 ถึง 02:00 น.)",
        tag: "Part 3 - Downtime Duration"
      },
      {
        q: "What will the woman have customer support do?",
        a: "Post a maintenance announcement banner on the homepage",
        b: "Call all corporate customers individually",
        c: "Issue refunds for pending purchases",
        d: "Shut down customer email accounts",
        correct: "A",
        exp: "ผู้หญิงจะให้ฝ่ายสนับสนุนลูกค้าขึ้นแบนเนอร์แจ้งเตือนการบำรุงรักษาบนหน้าเว็บ",
        tag: "Part 3 - Customer Communication"
      }
    ]
  },
  {
    dialogueId: "d14",
    passage: `[Audio Dialogue - Customer Return & Warranty]
Woman: Customer service desk, this is Angela speaking. How may I assist you today?
Man: Hello, I bought a commercial espresso grinder from your downtown store last week, but the motor overheats and shuts off after grinding only two shots of coffee.
Woman: I'm very sorry to hear that, sir. Since you purchased it within thirty days and have the original receipt, you are eligible for an immediate replacement or a full refund.
Man: An exchange for a working unit would be perfect. I'll bring it to the store this evening.`,
    questions: [
      {
        q: "What product did the man purchase?",
        a: "A commercial espresso grinder",
        b: "An automatic dishwasher",
        c: "An industrial microwave oven",
        d: "A countertop refrigerator",
        correct: "A",
        exp: "ผู้ชายแจ้งว่าซื้อ 'commercial espresso grinder' (เครื่องบดกาแฟเอสเปรสโซ)",
        tag: "Part 3 - Product Inquiry"
      },
      {
        q: "What is wrong with the appliance?",
        a: "The motor overheats and turns off quickly.",
        b: "The electrical cord is frayed and damaged.",
        c: "The coffee hopper is cracked.",
        d: "The digital display is completely blank.",
        correct: "A",
        exp: "ผู้ชายอธิบายอาการ '...motor overheats and shuts off after grinding only two shots...'",
        tag: "Part 3 - Defect Description"
      },
      {
        q: "What solution did the man choose?",
        a: "Exchanging the defective item for a replacement unit",
        b: "Requesting a full monetary cash refund",
        c: "Filing a formal legal complaint",
        d: "Paying for a technician repair service",
        correct: "A",
        exp: "ผู้ชายตอบ 'An exchange for a working unit would be perfect.' (ขอเปลี่ยนเครื่องใหม่)",
        tag: "Part 3 - Customer Resolution"
      }
    ]
  },
  {
    dialogueId: "d15",
    passage: `[Audio Dialogue - Charity Golf Sponsorship]
Man: Denise, the city chamber of commerce invited CardCraft to be a diamond sponsor for their annual charity golf classic next month.
Woman: That costs ten thousand dollars, doesn't it? What promotional benefits are included?
Man: Our company logo would be displayed prominently on all event banners, promotional merchandise, and the tournament program booklet.
Woman: Plus, it supports youth STEM education in the local community. I'll present the proposal to our executive committee for approval on Monday.`,
    questions: [
      {
        q: "What opportunity is the company considering?",
        a: "Sponsoring a charity golf tournament",
        b: "Hosting an international software hackathon",
        c: "Building a private employee recreation park",
        d: "Organizing an executive tennis championship",
        correct: "A",
        exp: "ผู้ชายพูดถึงการเป็นสปอนเซอร์งานแข่งกอล์ฟการกุศล ('charity golf classic')",
        tag: "Part 3 - Business Sponsorship"
      },
      {
        q: "What cause does the tournament support?",
        a: "Youth STEM education in the local community",
        b: "Wildlife preservation and forest conservation",
        c: "Disaster relief funds for small businesses",
        d: "Public library digital book expansions",
        correct: "A",
        exp: "ผู้หญิงระบุ '...supports youth STEM education in the local community.'",
        tag: "Part 3 - Charitable Cause"
      },
      {
        q: "What will the woman do on Monday?",
        a: "Present the sponsorship proposal to executives",
        b: "Wire the ten thousand dollar sponsorship fee",
        c: "Design the golf tournament banners",
        d: "Sign up as a competitive golf player",
        correct: "A",
        exp: "ผู้หญิงกล่าว 'I'll present the proposal to our executive committee for approval on Monday.'",
        tag: "Part 3 - Committee Presentation"
      }
    ]
  },
  {
    dialogueId: "d16",
    passage: `[Audio Dialogue - Trade Show Booth & Merchandise]
Woman: Brian, the International Tech Expo in Berlin is only three weeks away. Did we receive the customized USB flash drives and promotional pens?
Man: The vendor shipped them yesterday via air express. They should arrive at our logistics warehouse by Thursday morning.
Woman: Excellent. Once they arrive, please inspect twenty sample units to ensure the engraved CardCraft logo meets our brand standards.
Man: Will do. I'll inspect them as soon as the delivery truck unloads.`,
    questions: [
      {
        q: "Where will the trade show take place?",
        a: "In Berlin",
        b: "In Tokyo",
        c: "In Chicago",
        d: "In London",
        correct: "A",
        exp: "ผู้หญิงระบุ 'The International Tech Expo in Berlin is only three weeks away.'",
        tag: "Part 3 - Event Location"
      },
      {
        q: "When are the promotional items expected to arrive?",
        a: "By Thursday morning",
        b: "Next Monday afternoon",
        c: "Late Friday evening",
        d: "In three weeks",
        correct: "A",
        exp: "ผู้ชายแจ้งว่าของจะมาถึงคลังสินค้า 'by Thursday morning'",
        tag: "Part 3 - Arrival Date"
      },
      {
        q: "What does the woman request the man to do upon delivery?",
        a: "Inspect sample units for logo engraving quality",
        b: "Pack all items into carry-on luggage",
        c: "Mail the merchandise directly to Berlin",
        d: "Issue a final payment check to the supplier",
        correct: "A",
        exp: "ผู้หญิงขอให้ตรวจตัวอย่าง 20 ชิ้นดูคุณภาพโลโก้ ('inspect twenty sample units...')",
        tag: "Part 3 - Inspection Request"
      }
    ]
  },
  {
    dialogueId: "d17",
    passage: `[Audio Dialogue - Overseas Branch Audit Budget]
Man: Evelyn, the board gave final authorization for our internal audit of the Singapore regional branch.
Woman: Great. Our audit team of four will need flight reservations, hotel accommodations for ten nights, and local per diem allowances.
Man: Let's book the business class flights today through our corporate travel agency to lock in the early-bird corporate discount.`,
    questions: [
      {
        q: "What project received board authorization?",
        a: "An internal audit of the Singapore branch",
        b: "The closure of an underperforming warehouse",
        c: "A merger with a regional telecommunications firm",
        d: "The hiring of fifty local retail sales agents",
        correct: "A",
        exp: "ผู้ชายระบุ '...authorization for our internal audit of the Singapore regional branch.'",
        tag: "Part 3 - Project Approval"
      },
      {
        q: "What does the man recommend doing today?",
        a: "Booking business class flights to secure discounts",
        b: "Purchasing local currency for per diem cash",
        c: "Contacting the Singapore office manager",
        d: "Drafting the final audit summary report",
        correct: "A",
        exp: "ผู้ชายแนะนำ 'Let's book the business class flights today... to lock in the early-bird corporate discount.'",
        tag: "Part 3 - Financial Recommendation"
      }
    ]
  }
];

let counter = 1;
const formattedQuestions = [];

dialogues.forEach((d) => {
  d.questions.forEach((q) => {
    formattedQuestions.push({
      id: `q-list-p3-ext-${String(counter).padStart(2, '0')}`,
      section: 'LISTENING',
      part: 3,
      audioUrl: `/audio/part3-ext-${d.dialogueId}.mp3`,
      imageUrl: null,
      passageText: d.passage,
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
  path.join(__dirname, 'part3-extended.json'),
  JSON.stringify(formattedQuestions, null, 2),
  'utf8'
);

console.log(`Generated ${formattedQuestions.length} Part 3 extended questions.`);
