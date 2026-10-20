// ============================================================================
// frontend/src/data/questions/generate-p4.js
// 50 Authentic TOEIC Part 4 (Short Talks) Questions
// 17 Realistic Business Monologues with complete talk passage text
// ============================================================================

const fs = require('fs');
const path = require('path');

const talks = [
  {
    talkId: "t01",
    passage: `[Audio Monologue - Airport Gate Announcement]
Attention passengers on Horizon Air flight 418 with nonstop service to Seattle. Due to scheduled runway resurfacing at our destination airport, our departure time has been pushed back by forty-five minutes to 3:15 PM. Additionally, our boarding location has been moved from Gate B12 to Gate C24. Passengers traveling with small children or requiring special boarding assistance should report to the customer service counter at Gate C24 now. We apologize for any inconvenience.`,
    questions: [
      {
        q: "What is the primary purpose of the announcement?",
        a: "To announce a departure delay and gate change",
        b: "To call passengers for immediate final boarding",
        c: "To report lost baggage at the carousel",
        d: "To offer ticket vouchers for an overbooked flight",
        correct: "A",
        exp: "ประกาศแจ้งเลื่อนเวลาออกบิน 45 นาที และย้ายเกทจาก B12 ไป C24 ตรงกับ (A)",
        tag: "Part 4 - Announcement Purpose"
      },
      {
        q: "What caused the schedule modification?",
        a: "Runway resurfacing at the destination airport",
        b: "A mechanical defect on the landing gear",
        c: "Severe thunderstorm activity over Seattle",
        d: "A lack of available flight crew personnel",
        correct: "A",
        exp: "ผู้ประกาศระบุ 'Due to scheduled runway resurfacing at our destination airport...'",
        tag: "Part 4 - Cause of Delay"
      },
      {
        q: "Who is asked to report to the counter immediately?",
        a: "Passengers needing special boarding assistance",
        b: "First-class ticket holders only",
        c: "Airline pilots and cabin crew",
        d: "Passengers who missed their connection",
        correct: "A",
        exp: "ผู้ประกาศระบุ '...requiring special boarding assistance should report to the customer service counter...'",
        tag: "Part 4 - Target Audience"
      }
    ]
  },
  {
    talkId: "t02",
    passage: `[Audio Monologue - Real Estate Voicemail]
Hello Ms. Vance, this is Arthur Pendelton calling from Highland Commercial Realty. I am calling to confirm that the lease agreement for your new office suite on the ninth floor of the Apex Tower has been formally approved by the building owner. Before we can hand over the electronic keycards, we need your physical signature on page six of the contract. Please drop by our leasing office anytime between 9:00 AM and 5:00 PM tomorrow. Thank you, and congratulations on your new location.`,
    questions: [
      {
        q: "Who is the speaker most likely?",
        a: "A commercial real estate agent",
        b: "A building maintenance technician",
        c: "An interior decorating consultant",
        d: "A corporate legal attorney",
        correct: "A",
        exp: "ผู้พูดแนะนำตัวว่าโทรมาจาก 'Highland Commercial Realty' จึงเป็นนายหน้าอสังหาริมทรัพย์เพื่อการพาณิชย์",
        tag: "Part 4 - Speaker Identity"
      },
      {
        q: "What milestone does the speaker announce?",
        a: "A commercial lease agreement was approved.",
        b: "A property inspection was completed.",
        c: "A rental payment was received.",
        d: "An office renovation was finalized.",
        correct: "A",
        exp: "ผู้พูดแจ้งว่าสัญญาเช่าออฟฟิศชั้น 9 ได้รับการอนุมัติแล้ว ('lease agreement... has been formally approved')",
        tag: "Part 4 - Milestone"
      },
      {
        q: "What must Ms. Vance do tomorrow?",
        a: "Visit the leasing office to sign the contract",
        b: "Inspect the electrical wiring of the suite",
        c: "Wire the first month's security deposit",
        d: "Return expired electronic keycards",
        correct: "A",
        exp: "ผู้พูดบอก 'Please drop by our leasing office... to sign page six...'",
        tag: "Part 4 - Required Action"
      }
    ]
  },
  {
    talkId: "t03",
    passage: `[Audio Monologue - Keynote Speaker Introduction]
Good morning, ladies and gentlemen, and welcome to the CleanTech Global Summit. It is my great honor to introduce our keynote speaker, Dr. Aris Thorne. Dr. Thorne has spent over fifteen years leading renewable energy research at Solstice Power, where his team patented flexible solar cells that cut commercial installation costs by thirty percent. Today, Dr. Thorne will discuss practical roadmaps for transforming factory manufacturing footprints into carbon-neutral facilities. Please join me in giving Dr. Thorne a warm welcome.`,
    questions: [
      {
        q: "Where is the speech taking place?",
        a: "At a clean technology conference",
        b: "At a university graduation ceremony",
        c: "At a local solar panel retail store",
        d: "At a company retirement banquet",
        correct: "A",
        exp: "ผู้พูดกล่าวต้อนรับสู่ 'CleanTech Global Summit' ตรงกับ (A)",
        tag: "Part 4 - Event Context"
      },
      {
        q: "What achievement of Dr. Thorne is highlighted?",
        a: "Patenting cost-effective flexible solar technology",
        b: "Publishing a bestselling book on urban wind farms",
        c: "Managing the largest hydroelectric dam in Asia",
        d: "Founding an international environmental charity",
        correct: "A",
        exp: "ผู้พูดกล่าวถึงผลงาน '...patented flexible solar cells that cut commercial installation costs...'",
        tag: "Part 4 - Speaker Achievement"
      },
      {
        q: "What topic will Dr. Thorne present today?",
        a: "Achieving carbon-neutral factory manufacturing",
        b: "Subsidizing electric vehicle batteries",
        c: "Negotiating international carbon credit treaties",
        d: "Installing rooftop wind turbines on homes",
        correct: "A",
        exp: "หัวข้อบรรยายคือ '...transforming factory manufacturing footprints into carbon-neutral facilities.'",
        tag: "Part 4 - Presentation Topic"
      }
    ]
  },
  {
    talkId: "t04",
    passage: `[Audio Monologue - Cybersecurity Staff Meeting]
Good afternoon everyone. Before we adjourn today's department meeting, I want to emphasize that our annual corporate cybersecurity audit begins next Tuesday. As part of ISO compliance, every employee must complete the forty-five-minute online phishing awareness module on the intranet before 5:00 PM this Friday. Employees who do not finish the module by the deadline will have their remote VPN credentials temporarily suspended until their certificate of completion is logged.`,
    questions: [
      {
        q: "What event begins next Tuesday?",
        a: "An annual corporate cybersecurity audit",
        b: "A system-wide server hardware upgrade",
        c: "A company software coding competition",
        d: "An international trade exhibition",
        correct: "A",
        exp: "ผู้พูดเน้นย้ำว่า '...annual corporate cybersecurity audit begins next Tuesday.'",
        tag: "Part 4 - Upcoming Event"
      },
      {
        q: "What are staff required to complete by Friday at 5:00 PM?",
        a: "An online phishing awareness training module",
        b: "A physical hardware inventory audit",
        c: "A customer privacy survey questionnaire",
        d: "A quarterly personal performance review",
        correct: "A",
        exp: "พนักงานทุกคนต้องเรียนบทเรียนออนไลน์ 'forty-five-minute online phishing awareness module'",
        tag: "Part 4 - Requirement"
      },
      {
        q: "What consequence is mentioned for missing the deadline?",
        a: "Remote VPN access credentials will be suspended.",
        b: "Annual salary bonuses will be forfeited.",
        c: "Company laptops will be confiscated.",
        d: "Employees will face a formal disciplinary hearing.",
        correct: "A",
        exp: "ผู้พูดเตือนว่า '...will have their remote VPN credentials temporarily suspended...'",
        tag: "Part 4 - Consequence"
      }
    ]
  },
  {
    talkId: "t05",
    passage: `[Audio Monologue - Factory Assembly Tour]
Welcome to the automated packaging facility of Apex Electronics. As we walk across the gantry above the robotics floor, please ensure your hard hats and protective safety goggles remain on at all times. You will notice that our robotic arms assemble and package over sixty thousand circuit boards per shift with zero human intervention. For safety reasons, photography is strictly prohibited inside the testing bay. If you have questions, please hold them until our Q&A session in the visitor lobby.`,
    questions: [
      {
        q: "Where is the tour being conducted?",
        a: "In an automated electronics packaging plant",
        b: "In a medical pharmaceutical laboratory",
        c: "In an automotive design showroom",
        d: "In a commercial distribution airport",
        correct: "A",
        exp: "ผู้พูดต้อนรับสู่ 'automated packaging facility of Apex Electronics'",
        tag: "Part 4 - Tour Location"
      },
      {
        q: "What safety equipment must visitors wear throughout the tour?",
        a: "Hard hats and protective goggles",
        b: "Steel-toed boots and heavy gloves",
        c: "Fluorescent neon vests and earplugs",
        d: "Full-body hazardous material suits",
        correct: "A",
        exp: "ผู้พูดระบุ '...ensure your hard hats and protective safety goggles remain on...'",
        tag: "Part 4 - Safety Gear"
      },
      {
        q: "What activity is strictly prohibited in the testing bay?",
        a: "Taking photographs",
        b: "Drinking water",
        c: "Wearing safety glasses",
        d: "Asking questions to the guide",
        correct: "A",
        exp: "ผู้พูดประกาศ '...photography is strictly prohibited inside the testing bay.'",
        tag: "Part 4 - Rule & Restriction"
      }
    ]
  },
  {
    talkId: "t06",
    passage: `[Audio Monologue - Radio Advertisement]
Are you tired of shipping delays and damaged freight eating into your company's profits? Vanguard Logistics provides temperature-controlled cargo transportation across all fifty states and Canada. With our state-of-the-art GPS tracking app, you can monitor your shipment's exact location and internal temperature in real time. Visit vanguardlogistics.com today and use promo code EXPEDITE20 to receive twenty percent off your first chartered shipment.`,
    questions: [
      {
        q: "What service is being advertised?",
        a: "Temperature-controlled freight shipping",
        b: "Automated warehouse construction",
        c: "Corporate vehicle fleet leasing",
        d: "Industrial packaging equipment sales",
        correct: "A",
        exp: "โฆษณาเสนอบริการ 'temperature-controlled cargo transportation' (การขนส่งสินค้าควบคุมอุณหภูมิ)",
        tag: "Part 4 - Product/Service"
      },
      {
        q: "What feature of Vanguard's mobile app is highlighted?",
        a: "Real-time location and temperature monitoring",
        b: "Instant customs tariff calculations",
        c: "Automatic driver payroll processing",
        d: "Complimentary barcode printing",
        correct: "A",
        exp: "ผู้พูดบอกว่าแอปตรวจ 'exact location and internal temperature in real time'",
        tag: "Part 4 - Feature Detail"
      },
      {
        q: "How can listeners claim a twenty percent discount?",
        a: "By using a promotional code on the company website",
        b: "By calling an operator before 5:00 PM today",
        c: "By scheduling a shipment exceeding five tons",
        d: "By registering for a multi-year commercial contract",
        correct: "A",
        exp: "ผู้พูดบอก '...use promo code EXPEDITE20 to receive twenty percent off...'",
        tag: "Part 4 - Discount Offer"
      }
    ]
  },
  {
    talkId: "t07",
    passage: `[Audio Monologue - Morning Commuter Traffic Report]
This is Sandra Lopez with your 8:00 AM Metro Commuter Update. Commuters traveling westbound on Interstate 94 should expect heavy delays of up to thirty minutes due to an overturned delivery truck near Exit 14. Emergency crews are on the scene, but only one lane is open. We recommend taking the Lakeview Expressway as an alternate route. In public transit news, the Blue Line commuter rail is operating on time with no reported disruptions.`,
    questions: [
      {
        q: "What problem is causing traffic delays on Interstate 94?",
        a: "An overturned delivery truck blocking lanes",
        b: "Scheduled bridge resurfacing construction",
        c: "Dense morning fog and heavy thunderstorms",
        d: "A broken-down passenger bus at the toll booth",
        correct: "A",
        exp: "ผู้รายงานแจ้งเหตุ '...overturned delivery truck near Exit 14'",
        tag: "Part 4 - Traffic Incident"
      },
      {
        q: "What does the speaker recommend drivers do?",
        a: "Use the Lakeview Expressway as an alternate route",
        b: "Wait on the highway until all lanes reopen",
        c: "Exit immediately and take the ferry boat",
        d: "Cancel their morning business meetings",
        correct: "A",
        exp: "ผู้ประกาศแนะนำ 'We recommend taking the Lakeview Expressway as an alternate route.'",
        tag: "Part 4 - Recommendation"
      },
      {
        q: "What is mentioned about the Blue Line train service?",
        a: "It is operating on schedule without disruptions.",
        b: "It has been suspended due to track repairs.",
        c: "It is experiencing twenty-minute delays.",
        d: "It has added extra weekend passenger cars.",
        correct: "A",
        exp: "ผู้ประกาศระบุ '...Blue Line commuter rail is operating on time with no reported disruptions.'",
        tag: "Part 4 - Transit Status"
      }
    ]
  },
  {
    talkId: "t08",
    passage: `[Audio Monologue - Executive Retirement Tribute]
Good evening everyone. We are gathered here tonight to celebrate the extraordinary career of our Vice President of Operations, Margaret Chen. Over her twenty-two years with CardCraft, Margaret helped scale our manufacturing capabilities from a single regional plant to five high-efficiency facilities across three continents. On behalf of the entire executive committee, Margaret, we present you with this engraved crystal globe and our deepest gratitude for your visionary leadership.`,
    questions: [
      {
        q: "What is the occasion for the gathering?",
        a: "A retirement celebration for an executive",
        b: "An annual shareholder financial meeting",
        c: "A press conference for a corporate merger",
        d: "An orientation dinner for new employees",
        correct: "A",
        exp: "ผู้พูดเปิดงานว่ารวมตัวกันเพื่อ 'celebrate the extraordinary career of our Vice President of Operations, Margaret Chen'",
        tag: "Part 4 - Event Occasion"
      },
      {
        q: "How long has Margaret Chen worked at the company?",
        a: "Twenty-two years",
        b: "Fifteen years",
        c: "Thirty years",
        d: "Five years",
        correct: "A",
        exp: "ผู้พูดระบุ 'Over her twenty-two years with CardCraft...'",
        tag: "Part 4 - Tenure Detail"
      },
      {
        q: "What gift is presented to Margaret?",
        a: "An engraved crystal globe",
        b: "A gold luxury wristwatch",
        c: "A framed architectural blueprint",
        d: "A first-class around-the-world cruise ticket",
        correct: "A",
        exp: "ของขวัญคือ 'engraved crystal globe' (ลูกโลกคริสตัลสลักข้อความ)",
        tag: "Part 4 - Gift Detail"
      }
    ]
  },
  {
    talkId: "t09",
    passage: `[Audio Monologue - Department Store Storewide Sale]
Attention valued shoppers at Kensington Department Store. As we prepare for our upcoming seasonal inventory restock, we are offering storewide discounts of up to fifty percent on all designer winter apparel, leather footwear, and travel luggage. Additionally, shoppers who spend over one hundred dollars today will receive a complimentary twenty-dollar gift voucher at the checkout counter. Please note our customer service desk will close at 8:30 PM tonight. Happy shopping!`,
    questions: [
      {
        q: "Why is Kensington Department Store offering discounts?",
        a: "To prepare for a seasonal inventory restock",
        b: "To celebrate the opening of a second branch",
        c: "Because the store is closing permanently",
        d: "To compensate customers for parking inconveniences",
        correct: "A",
        exp: "ผู้ประกาศระบุ 'As we prepare for our upcoming seasonal inventory restock...'",
        tag: "Part 4 - Promotion Reason"
      },
      {
        q: "What merchandise is discounted up to fifty percent?",
        a: "Winter apparel, footwear, and luggage",
        b: "Kitchen appliances and home furniture",
        c: "Electronic laptops and mobile smartphones",
        d: "Cosmetics, perfumes, and jewelry",
        correct: "A",
        exp: "สินค้าลดราคาคือ 'winter apparel, leather footwear, and travel luggage'",
        tag: "Part 4 - Merchandise Detail"
      },
      {
        q: "How can shoppers receive a complimentary gift voucher?",
        a: "By spending more than one hundred dollars",
        b: "By applying for a store credit card today",
        c: "By filling out a customer satisfaction questionnaire",
        d: "By returning used apparel for recycling",
        correct: "A",
        exp: "ผู้ประกาศระบุ '...shoppers who spend over one hundred dollars today will receive a complimentary twenty-dollar gift voucher...'",
        tag: "Part 4 - Bonus Incentive"
      }
    ]
  },
  {
    talkId: "t10",
    passage: `[Audio Monologue - Business Podcast Interview]
Welcome back to Founders Spotlight, the weekly podcast where we interview leaders shaping modern commerce. Today, I am joined by Elena Rostova, the founder of GreenPack Solutions. Starting in her garage six years ago, Elena designed biodegradable packaging made entirely from agricultural mushroom waste, which is now utilized by over two hundred major retail brands. In today's episode, Elena will share how she secured venture funding without giving up controlling equity in her startup.`,
    questions: [
      {
        q: "What type of media broadcast is this?",
        a: "A weekly business interview podcast",
        b: "A live television news broadcast",
        c: "An executive board meeting recording",
        d: "A university economics lecture",
        correct: "A",
        exp: "ผู้พูดเปิดรายการ 'Welcome back to Founders Spotlight, the weekly podcast...'",
        tag: "Part 4 - Broadcast Format"
      },
      {
        q: "What product does Elena Rostova's company manufacture?",
        a: "Biodegradable mushroom-based packaging",
        b: "Organic vegetarian food ingredients",
        c: "Solar-powered agricultural harvesting tractors",
        d: "Recycled cardboard delivery crates",
        correct: "A",
        exp: "บริษัทผลิต 'biodegradable packaging made entirely from agricultural mushroom waste'",
        tag: "Part 4 - Product Innovation"
      },
      {
        q: "What topic will Elena discuss during the interview?",
        a: "Securing venture funding while retaining equity control",
        b: "Negotiating patent lawsuits with multinational rivals",
        c: "Relocating production factories overseas",
        d: "Downsizing staff during an economic downturn",
        correct: "A",
        exp: "หัวข้อพูดคุยคือ '...how she secured venture funding without giving up controlling equity...'",
        tag: "Part 4 - Interview Focus"
      }
    ]
  },
  {
    talkId: "t11",
    passage: `[Audio Monologue - Hotel Convention Welcome]
Good morning and welcome to the Grand Pacific Hotel and Suites. We are delighted to host the 18th Annual Pediatric Cardiology Conference. Our grand ballroom on the second level has been outfitted with high-definition projection displays for all keynote sessions. Breakfast and luncheon buffets will be served daily in the Promenade Atrium. If you need assistance with transportation bookings, printing services, or local dining recommendations, our dedicated concierge team is at your service in the main lobby.`,
    questions: [
      {
        q: "Who is the audience for this welcome talk?",
        a: "Medical conference attendees",
        b: "Hotel housekeeping employees",
        c: "Airline flight crew members",
        d: "Local real estate investors",
        correct: "A",
        exp: "ผู้พูดต้อนรับผู้เข้าร่วมงาน '18th Annual Pediatric Cardiology Conference' ซึ่งเป็นแพทย์โรคหัวใจในเด็ก",
        tag: "Part 4 - Audience"
      },
      {
        q: "Where will keynote presentations be held?",
        a: "In the second-level grand ballroom",
        b: "In the Promenade Atrium",
        c: "In the outdoor courtyard patio",
        d: "In the executive penthouse lounge",
        correct: "A",
        exp: "ห้องบรรยายหลักคือ 'grand ballroom on the second level'",
        tag: "Part 4 - Facility Location"
      },
      {
        q: "What service does the lobby concierge offer?",
        a: "Transportation bookings and dining recommendations",
        b: "Complimentary medical examinations",
        c: "Exchange of foreign traveler checks",
        d: "Luggage repair and garment tailoring",
        correct: "A",
        exp: "เคาน์เตอร์คอนเซียร์จในล็อบบี้ช่วยเรื่อง 'transportation bookings, printing services, or local dining recommendations'",
        tag: "Part 4 - Concierge Services"
      }
    ]
  },
  {
    talkId: "t12",
    passage: `[Audio Monologue - Train Station Service Alert]
Attention passengers at Central Commuter Station. Due to emergency track repairs near Oakwood Crossing, southbound regional train service on the Hudson Line is experiencing severe thirty-minute delays. Passengers traveling to Riverdale or White Plains are encouraged to take the subway Line 4 to Grand Avenue, where complimentary shuttle buses are running every ten minutes to transfer commuters. Ticket holders may request a full refund at the ticket windows in Concourse B.`,
    questions: [
      {
        q: "What issue is being announced at Central Station?",
        a: "Delays on southbound trains due to track repairs",
        b: "A complete power outage across all subway lines",
        c: "The permanent closure of Concourse B",
        d: "An unexpected railway workers strike",
        correct: "A",
        exp: "ประกาศแจ้งเหตุ '...track repairs... southbound regional train service... experiencing severe thirty-minute delays.'",
        tag: "Part 4 - Service Disruption"
      },
      {
        q: "How can affected passengers continue their journey?",
        a: "By taking the subway to access free shuttle buses",
        b: "By renting private vehicles at the station",
        c: "By waiting for the evening express train",
        d: "By walking two miles to the nearest station",
        correct: "A",
        exp: "แนะนำให้นั่งรถไฟใต้ดินสาย 4 ไปต่อรถชัตเทิลบัสฟรี ('complimentary shuttle buses')",
        tag: "Part 4 - Transit Alternative"
      },
      {
        q: "Where can ticket holders claim a refund?",
        a: "At the ticket windows in Concourse B",
        b: "Through the mobile ticketing app only",
        c: "At the destination station customer desk",
        d: "By mailing their physical ticket to headquarters",
        correct: "A",
        exp: "ขอคืนเงินได้ที่ 'ticket windows in Concourse B'",
        tag: "Part 4 - Refund Location"
      }
    ]
  },
  {
    talkId: "t13",
    passage: `[Audio Monologue - Corporate Art Exhibition Guide]
Welcome to the City Modern Art Gallery. This evening, we are honored to showcase the 'Visions of Industry' retrospective, generously sponsored by the CardCraft Foundation. This exhibition features seventy-five contemporary paintings and sculptures that interpret the rise of automated commerce over the past century. As you explore the galleries, please remember that flash photography and touching artwork are strictly prohibited. The artist Q&A panel will commence at 7:30 PM in the sculpture garden.`,
    questions: [
      {
        q: "What is the theme of the art exhibition?",
        a: "The rise of automated commerce over the past century",
        b: "Classical European portraiture of royalty",
        c: "Prehistoric architectural stone carvings",
        d: "Traditional landscape oil paintings of nature",
        correct: "A",
        exp: "นิทรรศการแสดงงานที่สะท้อน 'the rise of automated commerce over the past century'",
        tag: "Part 4 - Exhibition Theme"
      },
      {
        q: "Who is the primary sponsor of the event?",
        a: "The CardCraft Foundation",
        b: "The Municipal Transit Authority",
        c: "The International Chamber of Commerce",
        d: "The Global Banking Consortium",
        correct: "A",
        exp: "ผู้สนับสนุนหลักคือ 'The CardCraft Foundation'",
        tag: "Part 4 - Event Sponsor"
      },
      {
        q: "What event will take place at 7:30 PM?",
        a: "An artist Q&A panel in the sculpture garden",
        b: "A private charity auction of paintings",
        c: "A formal dinner banquet in the gallery cafe",
        d: "The closing of the main admission gates",
        correct: "A",
        exp: "เวลา 19:30 น. จะมี 'artist Q&A panel will commence at 7:30 PM in the sculpture garden'",
        tag: "Part 4 - Scheduled Program"
      }
    ]
  },
  {
    talkId: "t14",
    passage: `[Audio Monologue - Healthcare Clinic Voicemail Greeting]
Thank you for calling Northside Health and Wellness Clinic. Our offices are currently closed. Regular clinic hours are Monday through Friday, 8:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 1:00 PM. If you are calling to schedule or reschedule an appointment, you may do so at any time using our secure patient portal at northsideclinic.com. For urgent prescription refill requests, please press two to leave a message for our nursing coordinator. If this is a medical emergency, please hang up and dial 911 immediately.`,
    questions: [
      {
        q: "What business was contacted?",
        a: "A healthcare and wellness clinic",
        b: "A commercial retail pharmacy",
        c: "A medical insurance billing office",
        d: "A veterinary animal hospital",
        correct: "A",
        exp: "ระบบตอบรับของ 'Northside Health and Wellness Clinic' (คลินิกสุขภาพ)",
        tag: "Part 4 - Organization Type"
      },
      {
        q: "How can patients manage appointments while the office is closed?",
        a: "Through a secure online patient portal",
        b: "By sending an email to the head physician",
        c: "By visiting the clinic entrance in person",
        d: "By waiting on the phone line for an on-call operator",
        correct: "A",
        exp: "สามารถจัดการนัดหมายได้ตลอดเวลาผ่าน 'secure patient portal at northsideclinic.com'",
        tag: "Part 4 - Digital Service"
      },
      {
        q: "What option should callers select for urgent prescription refills?",
        a: "Press two to leave a message for a nurse coordinator",
        b: "Press zero to speak with the emergency operator",
        c: "Press four to transfer to a partner hospital",
        d: "Press nine to listen to pharmacy business hours",
        correct: "A",
        exp: "สำหรับขอเติมยาเร่งด่วน '...press two to leave a message for our nursing coordinator'",
        tag: "Part 4 - Phone Menu Option"
      }
    ]
  },
  {
    talkId: "t15",
    passage: `[Audio Monologue - Earnings Call CEO Address]
Good morning and thank you for joining CardCraft's third-quarter earnings conference call. I am pleased to report that total consolidated revenues reached 142 million dollars, representing a nineteen percent year-over-year increase. This growth was driven primarily by rapid enterprise adoption of our AI-powered language training platform in Southeast Asia and Europe. Operating margins expanded by 240 basis points as automated grading efficiencies lowered our cloud computing overhead. Our chief financial officer will now walk through our regional division balance sheets.`,
    questions: [
      {
        q: "What financial milestone does the CEO announce?",
        a: "Consolidated revenues grew nineteen percent year-over-year.",
        b: "The company acquired its largest competitor for cash.",
        c: "Research spending doubled compared to last quarter.",
        d: "The board approved a forty percent dividend increase.",
        correct: "A",
        exp: "CEO รายงานรายได้รวมโตขึ้น 19% เมื่อเทียบกับปีก่อน ('nineteen percent year-over-year increase')",
        tag: "Part 4 - Financial Milestone"
      },
      {
        q: "What was the main driver of the revenue expansion?",
        a: "Enterprise adoption of the language platform in Asia and Europe",
        b: "High commercial interest rates in North America",
        c: "Selling unused real estate and office buildings",
        d: "A steep reduction in employee health benefits",
        correct: "A",
        exp: "การเติบโตขับเคลื่อนโดย 'rapid enterprise adoption of our AI-powered language training platform in Southeast Asia and Europe'",
        tag: "Part 4 - Growth Driver"
      },
      {
        q: "Who will speak next on the conference call?",
        a: "The chief financial officer",
        b: "The vice president of human resources",
        c: "An independent external auditor",
        d: "A representative from an investment bank",
        correct: "A",
        exp: "ผู้พูดคนต่อไปคือ CFO ('Our chief financial officer will now walk through...')",
        tag: "Part 4 - Next Speaker"
      }
    ]
  },
  {
    talkId: "t16",
    passage: `[Audio Monologue - Trade Conference Panel Remarks]
Welcome to the panel session on 'Automating Global Supply Chains' here at the World Logistics Congress. My name is Carlos Ruiz, and I will be moderating today's discussion. We have brought together five senior supply chain executives from maritime shipping, rail freight, and air cargo. Each panelist will give a five-minute opening presentation outlining their key supply chain bottleneck solutions, followed by thirty minutes of open audience Q&A. Please ensure all cellular phones are set to silent mode.`,
    questions: [
      {
        q: "What is Carlos Ruiz's role at the event?",
        a: "He is moderating the panel discussion.",
        b: "He is the keynote guest speaker.",
        c: "He is the conference facility manager.",
        d: "He is an audio technician setting up microphones.",
        correct: "A",
        exp: "Carlos Ruiz แนะนำตัวว่า '...and I will be moderating today's discussion.'",
        tag: "Part 4 - Role Identification"
      },
      {
        q: "How will the panel session be structured?",
        a: "Brief opening remarks followed by audience Q&A",
        b: "A two-hour debate between competing executives",
        c: "A silent video presentation followed by a written exam",
        d: "An award ceremony followed by a luncheon banquet",
        correct: "A",
        exp: "โครงสร้างงานคือ บรรยายเปิด 5 นาทีต่อคน ตามด้วยตอบคำถามผู้ฟัง 30 นาที",
        tag: "Part 4 - Session Structure"
      },
      {
        q: "What are attendees requested to do?",
        a: "Set mobile phones to silent mode",
        b: "Submit questions on paper index cards",
        c: "Leave the room before the Q&A segment",
        d: "Remain seated until all panelists exit",
        correct: "A",
        exp: "ผู้จัดขอให้ผู้ฟังตั้งค่ามือถือเป็นโหมดเงียบ ('cellular phones are set to silent mode')",
        tag: "Part 4 - Audience Instruction"
      }
    ]
  },
  {
    talkId: "t17",
    passage: `[Audio Monologue - Charity Food Drive Orientation]
Good morning volunteers, and thank you for dedicating your Saturday to the annual Holiday Food Drive. Today, our goal is to sort and pack eight thousand pounds of nonperishable groceries into family food baskets for local distribution. Table one and two will handle canned goods, while table three and four will package grains and pasta. Please inspect all packaging seals carefully to ensure nothing is punctured or expired. Cold bottled water and granola bars are available at the back of the volunteer hall. Let's get started!`,
    questions: [
      {
        q: "What is the volunteers' primary objective today?",
        a: "Sorting and packing groceries into family food baskets",
        b: "Cooking hot meals for a community luncheon",
        c: "Collecting cash donations outside supermarkets",
        d: "Planting organic vegetables in a community garden",
        correct: "A",
        exp: "เป้าหมายหลักคือคัดแยกและแพ็กของแห้งลงตะกร้า ('sort and pack eight thousand pounds of nonperishable groceries...')",
        tag: "Part 4 - Volunteer Objective"
      },
      {
        q: "What instruction is emphasized when packaging items?",
        a: "Inspect seals to ensure items are intact and unexpired.",
        b: "Label each basket with the volunteer's signature.",
        c: "Weigh each individual can before placing it in the box.",
        d: "Only pack items produced in the local city.",
        correct: "A",
        exp: "ย้ำให้ตรวจสอบรอยซีลว่าไม่รั่วหรือหมดอายุ ('inspect all packaging seals carefully...')",
        tag: "Part 4 - Quality Instruction"
      }
    ]
  }
];

let counter = 1;
const formattedQuestions = [];

talks.forEach((t) => {
  t.questions.forEach((q) => {
    formattedQuestions.push({
      id: `q-list-p4-ext-${String(counter).padStart(2, '0')}`,
      section: 'LISTENING',
      part: 4,
      audioUrl: `/audio/part4-ext-${t.talkId}.mp3`,
      imageUrl: null,
      passageText: t.passage,
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
  path.join(__dirname, 'part4-extended.json'),
  JSON.stringify(formattedQuestions, null, 2),
  'utf8'
);

console.log(`Generated ${formattedQuestions.length} Part 4 extended questions.`);
