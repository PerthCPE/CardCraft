const fs = require('fs');
const path = require('path');

const imagesDir = path.resolve(__dirname, '../../../public/images/toeic');

// Helper to create Neo-Brutalist CardCraft style SVG illustrations
function createSvg(title, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" fill="none">
  <!-- CardCraft Neo-Brutalist Frame -->
  <rect width="640" height="360" fill="#F8F5EC"/>
  <rect x="16" y="16" width="608" height="328" fill="#E2E8F0" stroke="#0F172A" stroke-width="5"/>
  <rect x="24" y="24" width="592" height="36" fill="#0F172A"/>
  <text x="36" y="47" fill="#FDE047" font-family="monospace" font-weight="bold" font-size="14" letter-spacing="1">TOEIC PART 1 • ${title.toUpperCase()}</text>
  <!-- Scene Elements -->
  ${content}
</svg>`;
}

// 53 custom SVG visual scenes
const svgScenes = {
  'part1-desk-typing.svg': createSvg('Office Desk Typing', `
    <rect x="140" y="80" width="360" height="180" fill="#CBD5E1" stroke="#0F172A" stroke-width="4"/>
    <rect x="220" y="110" width="120" height="80" fill="#38BDF8" stroke="#0F172A" stroke-width="3"/>
    <rect x="360" y="110" width="120" height="80" fill="#0284C7" stroke="#0F172A" stroke-width="3"/>
    <circle cx="190" cy="150" r="28" fill="#FDE68A" stroke="#0F172A" stroke-width="4"/>
    <path d="M150 240 C150 190 230 190 230 240 Z" fill="#6366F1" stroke="#0F172A" stroke-width="4"/>
    <rect x="190" y="210" width="100" height="18" fill="#475569" stroke="#0F172A" stroke-width="3"/>
    <rect x="100" y="240" width="440" height="24" fill="#B45309" stroke="#0F172A" stroke-width="4"/>
  `),
  'part1-engineers-blueprint.svg': createSvg('Consulting Building Plan', `
    <rect x="80" y="90" width="480" height="190" fill="#CBD5E1" stroke="#0F172A" stroke-width="4"/>
    <!-- Hardhat 1 -->
    <path d="M190 140 A26 26 0 0 1 242 140 Z" fill="#FACC15" stroke="#0F172A" stroke-width="4"/>
    <circle cx="216" cy="165" r="20" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M180 230 C180 195 252 195 252 230 Z" fill="#F97316" stroke="#0F172A" stroke-width="4"/>
    <!-- Hardhat 2 -->
    <path d="M390 140 A26 26 0 0 1 442 140 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="4"/>
    <circle cx="416" cy="165" r="20" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M380 230 C380 195 452 195 452 230 Z" fill="#F97316" stroke="#0F172A" stroke-width="4"/>
    <!-- Large Blueprint Table -->
    <rect x="120" y="215" width="400" height="40" fill="#0284C7" stroke="#0F172A" stroke-width="4"/>
    <line x1="150" y1="230" x2="350" y2="230" stroke="#FFFFFF" stroke-width="2"/>
    <line x1="150" y1="240" x2="280" y2="240" stroke="#FFFFFF" stroke-width="2"/>
  `),
  'part1-library-bookshelves.svg': createSvg('Library Bookshelves', `
    <rect x="80" y="80" width="480" height="230" fill="#92400E" stroke="#0F172A" stroke-width="4"/>
    <!-- Shelves -->
    <rect x="95" y="130" width="450" height="14" fill="#78350F" stroke="#0F172A" stroke-width="3"/>
    <rect x="95" y="195" width="450" height="14" fill="#78350F" stroke="#0F172A" stroke-width="3"/>
    <rect x="95" y="260" width="450" height="14" fill="#78350F" stroke="#0F172A" stroke-width="3"/>
    <!-- Books Row 1 -->
    <rect x="110" y="94" width="22" height="36" fill="#DC2626" stroke="#0F172A" stroke-width="2"/>
    <rect x="134" y="90" width="18" height="40" fill="#2563EB" stroke="#0F172A" stroke-width="2"/>
    <rect x="154" y="96" width="26" height="34" fill="#16A34A" stroke="#0F172A" stroke-width="2"/>
    <rect x="182" y="92" width="20" height="38" fill="#F59E0B" stroke="#0F172A" stroke-width="2"/>
    <rect x="204" y="88" width="24" height="42" fill="#9333EA" stroke="#0F172A" stroke-width="2"/>
    <!-- Books Row 2 -->
    <rect x="110" y="156" width="24" height="39" fill="#0D9488" stroke="#0F172A" stroke-width="2"/>
    <rect x="136" y="152" width="20" height="43" fill="#EA580C" stroke="#0F172A" stroke-width="2"/>
    <rect x="158" y="158" width="28" height="37" fill="#4F46E5" stroke="#0F172A" stroke-width="2"/>
    <rect x="188" y="150" width="22" height="45" fill="#E11D48" stroke="#0F172A" stroke-width="2"/>
  `),
  'part1-harbor-containers.svg': createSvg('Shipping Containers at Harbor', `
    <rect x="60" y="180" width="520" height="130" fill="#0284C7" stroke="#0F172A" stroke-width="4"/>
    <!-- Containers -->
    <rect x="80" y="190" width="140" height="50" fill="#DC2626" stroke="#0F172A" stroke-width="3"/>
    <rect x="80" y="140" width="140" height="50" fill="#2563EB" stroke="#0F172A" stroke-width="3"/>
    <rect x="230" y="190" width="140" height="50" fill="#16A34A" stroke="#0F172A" stroke-width="3"/>
    <rect x="230" y="140" width="140" height="50" fill="#F59E0B" stroke="#0F172A" stroke-width="3"/>
    <rect x="230" y="90" width="140" height="50" fill="#0D9488" stroke="#0F172A" stroke-width="3"/>
    <rect x="380" y="190" width="140" height="50" fill="#9333EA" stroke="#0F172A" stroke-width="3"/>
    <!-- Crane Lines -->
    <line x1="500" y1="80" x2="550" y2="240" stroke="#0F172A" stroke-width="5"/>
    <line x1="440" y1="80" x2="560" y2="80" stroke="#F59E0B" stroke-width="6"/>
  `),
  'part1-auditorium-audience.svg': createSvg('Auditorium Presentation', `
    <rect x="80" y="80" width="480" height="100" fill="#1E293B" stroke="#0F172A" stroke-width="4"/>
    <!-- Stage -->
    <rect x="200" y="120" width="240" height="50" fill="#F8FAFC" stroke="#0F172A" stroke-width="3"/>
    <!-- Speaker on Stage -->
    <circle cx="320" cy="135" r="12" fill="#FDE68A" stroke="#0F172A" stroke-width="2"/>
    <rect x="312" y="147" width="16" height="20" fill="#3B82F6"/>
    <!-- Audience Rows -->
    <ellipse cx="140" cy="240" rx="20" ry="16" fill="#64748B" stroke="#0F172A" stroke-width="3"/>
    <ellipse cx="220" cy="235" rx="20" ry="16" fill="#475569" stroke="#0F172A" stroke-width="3"/>
    <ellipse cx="300" cy="230" rx="20" ry="16" fill="#64748B" stroke="#0F172A" stroke-width="3"/>
    <ellipse cx="380" cy="235" rx="20" ry="16" fill="#475569" stroke="#0F172A" stroke-width="3"/>
    <ellipse cx="460" cy="240" rx="20" ry="16" fill="#64748B" stroke="#0F172A" stroke-width="3"/>
    <ellipse cx="180" cy="285" rx="22" ry="18" fill="#334155" stroke="#0F172A" stroke-width="3"/>
    <ellipse cx="260" cy="280" rx="22" ry="18" fill="#1E293B" stroke="#0F172A" stroke-width="3"/>
    <ellipse cx="340" cy="280" rx="22" ry="18" fill="#334155" stroke="#0F172A" stroke-width="3"/>
    <ellipse cx="420" cy="285" rx="22" ry="18" fill="#1E293B" stroke="#0F172A" stroke-width="3"/>
  `),
  'part1-table-settings.svg': createSvg('Restaurant Table Settings', `
    <rect x="100" y="100" width="440" height="180" fill="#FFFFFF" stroke="#0F172A" stroke-width="4"/>
    <!-- Plates -->
    <circle cx="210" cy="180" r="45" fill="#F1F5F9" stroke="#0F172A" stroke-width="3"/>
    <circle cx="210" cy="180" r="32" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
    <circle cx="430" cy="180" r="45" fill="#F1F5F9" stroke="#0F172A" stroke-width="3"/>
    <circle cx="430" cy="180" r="32" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
    <!-- Silverware -->
    <rect x="145" y="145" width="8" height="70" fill="#94A3B8" stroke="#0F172A" stroke-width="2"/>
    <rect x="270" y="145" width="8" height="70" fill="#94A3B8" stroke="#0F172A" stroke-width="2"/>
    <rect x="365" y="145" width="8" height="70" fill="#94A3B8" stroke="#0F172A" stroke-width="2"/>
    <rect x="490" y="145" width="8" height="70" fill="#94A3B8" stroke="#0F172A" stroke-width="2"/>
    <!-- Wine Glass -->
    <circle cx="280" cy="120" r="14" fill="#BAE6FD" stroke="#0F172A" stroke-width="2"/>
    <circle cx="500" cy="120" r="14" fill="#BAE6FD" stroke="#0F172A" stroke-width="2"/>
  `),
  'part1-parking-lot.svg': createSvg('Vehicles in Parking Spaces', `
    <rect x="60" y="80" width="520" height="230" fill="#475569" stroke="#0F172A" stroke-width="4"/>
    <!-- White Parking Lines -->
    <line x1="170" y1="90" x2="170" y2="290" stroke="#FFFFFF" stroke-width="6"/>
    <line x1="280" y1="90" x2="280" y2="290" stroke="#FFFFFF" stroke-width="6"/>
    <line x1="390" y1="90" x2="390" y2="290" stroke="#FFFFFF" stroke-width="6"/>
    <line x1="500" y1="90" x2="500" y2="290" stroke="#FFFFFF" stroke-width="6"/>
    <!-- Parked Cars -->
    <rect x="90" y="130" width="65" height="120" rx="12" fill="#3B82F6" stroke="#0F172A" stroke-width="3"/>
    <rect x="200" y="125" width="65" height="125" rx="12" fill="#EF4444" stroke="#0F172A" stroke-width="3"/>
    <rect x="310" y="135" width="65" height="115" rx="12" fill="#F8FAFC" stroke="#0F172A" stroke-width="3"/>
    <rect x="420" y="120" width="65" height="130" rx="12" fill="#10B981" stroke="#0F172A" stroke-width="3"/>
  `),
  'part1-office-corridor.svg': createSvg('Office Hallway Walkers', `
    <!-- Corridor Perspective -->
    <polygon points="60,80 580,80 440,180 200,180" fill="#E2E8F0" stroke="#0F172A" stroke-width="3"/>
    <polygon points="60,80 200,180 200,300 60,310" fill="#CBD5E1" stroke="#0F172A" stroke-width="3"/>
    <polygon points="580,80 440,180 440,300 580,310" fill="#CBD5E1" stroke="#0F172A" stroke-width="3"/>
    <polygon points="200,180 440,180 500,310 140,310" fill="#F1F5F9" stroke="#0F172A" stroke-width="3"/>
    <!-- Walking Person -->
    <circle cx="310" cy="205" r="16" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M290 270 C290 230 330 230 330 270 Z" fill="#2563EB" stroke="#0F172A" stroke-width="3"/>
  `),
  'part1-board-chart.svg': createSvg('Financial Chart on Board', `
    <rect x="120" y="80" width="400" height="210" fill="#FFFFFF" stroke="#0F172A" stroke-width="4"/>
    <!-- Bar Chart -->
    <rect x="170" y="190" width="40" height="80" fill="#3B82F6" stroke="#0F172A" stroke-width="2"/>
    <rect x="230" y="150" width="40" height="120" fill="#10B981" stroke="#0F172A" stroke-width="2"/>
    <rect x="290" y="130" width="40" height="140" fill="#F59E0B" stroke="#0F172A" stroke-width="2"/>
    <rect x="350" y="100" width="40" height="170" fill="#8B5CF6" stroke="#0F172A" stroke-width="2"/>
    <line x1="150" y1="270" x2="470" y2="270" stroke="#0F172A" stroke-width="3"/>
  `),
  'part1-timeline-pointing.svg': createSvg('Project Timeline Review', `
    <rect x="100" y="80" width="440" height="200" fill="#F8FAFC" stroke="#0F172A" stroke-width="4"/>
    <!-- Timeline milestones -->
    <line x1="140" y1="160" x2="500" y2="160" stroke="#0F172A" stroke-width="4"/>
    <circle cx="180" cy="160" r="14" fill="#3B82F6" stroke="#0F172A" stroke-width="3"/>
    <circle cx="280" cy="160" r="14" fill="#10B981" stroke="#0F172A" stroke-width="3"/>
    <circle cx="380" cy="160" r="14" fill="#F59E0B" stroke="#0F172A" stroke-width="3"/>
    <circle cx="470" cy="160" r="14" fill="#EC4899" stroke="#0F172A" stroke-width="3"/>
  `),
  'part1-meeting-standing.svg': createSvg('Colleagues Beside Board', `
    <rect x="180" y="80" width="280" height="170" fill="#FFFFFF" stroke="#0F172A" stroke-width="4"/>
    <circle cx="130" cy="150" r="26" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M95 240 C95 195 165 195 165 240 Z" fill="#0EA5E9" stroke="#0F172A" stroke-width="4"/>
    <circle cx="510" cy="150" r="26" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M475 240 C475 195 545 195 545 240 Z" fill="#8B5CF6" stroke="#0F172A" stroke-width="4"/>
  `),
  'part1-warehouse-racks.svg': createSvg('High Warehouse Racks', `
    <rect x="60" y="80" width="520" height="230" fill="#E2E8F0" stroke="#0F172A" stroke-width="4"/>
    <!-- Steel Beams -->
    <line x1="100" y1="80" x2="100" y2="310" stroke="#0F172A" stroke-width="6"/>
    <line x1="260" y1="80" x2="260" y2="310" stroke="#0F172A" stroke-width="6"/>
    <line x1="420" y1="80" x2="420" y2="310" stroke="#0F172A" stroke-width="6"/>
    <line x1="580" y1="80" x2="580" y2="310" stroke="#0F172A" stroke-width="6"/>
    <!-- Pallet Shelves -->
    <rect x="110" y="120" width="140" height="30" fill="#B45309" stroke="#0F172A" stroke-width="2"/>
    <rect x="110" y="190" width="140" height="30" fill="#B45309" stroke="#0F172A" stroke-width="2"/>
    <rect x="270" y="120" width="140" height="30" fill="#D97706" stroke="#0F172A" stroke-width="2"/>
    <rect x="270" y="190" width="140" height="30" fill="#D97706" stroke="#0F172A" stroke-width="2"/>
  `),
  'part1-safety-vest.svg': createSvg('High-Visibility Safety Vest', `
    <circle cx="320" cy="130" r="32" fill="#FDE68A" stroke="#0F172A" stroke-width="4"/>
    <path d="M260 250 C260 180 380 180 380 250 Z" fill="#F97316" stroke="#0F172A" stroke-width="4"/>
    <!-- Reflective Stripes -->
    <rect x="290" y="180" width="16" height="70" fill="#FACC15" stroke="#0F172A" stroke-width="2"/>
    <rect x="334" y="180" width="16" height="70" fill="#FACC15" stroke="#0F172A" stroke-width="2"/>
  `),
  'part1-pallet-transport.svg': createSvg('Pallet Transport in Transit', `
    <rect x="160" y="160" width="220" height="80" fill="#B45309" stroke="#0F172A" stroke-width="3"/>
    <rect x="180" y="100" width="80" height="60" fill="#D97706" stroke="#0F172A" stroke-width="3"/>
    <rect x="280" y="100" width="80" height="60" fill="#D97706" stroke="#0F172A" stroke-width="3"/>
    <!-- Pallet Jack Handle -->
    <line x1="380" y1="210" x2="480" y2="150" stroke="#0F172A" stroke-width="6"/>
    <circle cx="480" cy="150" r="10" fill="#0F172A"/>
  `),
  'part1-tall-shelving.svg': createSvg('Aisle Flanked by Shelving', `
    <!-- Symmetrical Shelves Aisle -->
    <polygon points="60,80 180,140 180,310 60,310" fill="#CBD5E1" stroke="#0F172A" stroke-width="4"/>
    <polygon points="580,80 460,140 460,310 580,310" fill="#CBD5E1" stroke="#0F172A" stroke-width="4"/>
    <polygon points="180,140 460,140 520,310 120,310" fill="#F1F5F9" stroke="#0F172A" stroke-width="3"/>
  `),
  'part1-hard-hats.svg': createSvg('Two Hard Hat Wearers', `
    <!-- Worker 1 -->
    <path d="M210 130 A30 30 0 0 1 270 130 Z" fill="#FACC15" stroke="#0F172A" stroke-width="4"/>
    <circle cx="240" cy="160" r="22" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M200 240 C200 195 280 195 280 240 Z" fill="#3B82F6" stroke="#0F172A" stroke-width="4"/>
    <!-- Worker 2 -->
    <path d="M370 130 A30 30 0 0 1 430 130 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="4"/>
    <circle cx="400" cy="160" r="22" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M360 240 C360 195 440 195 440 240 Z" fill="#10B981" stroke="#0F172A" stroke-width="4"/>
  `),
  'part1-steel-structure.svg': createSvg('Steel Framework Construction', `
    <rect x="60" y="80" width="520" height="230" fill="#BAE6FD" stroke="#0F172A" stroke-width="4"/>
    <!-- Steel Beams X Lattice -->
    <line x1="120" y1="80" x2="120" y2="310" stroke="#334155" stroke-width="8"/>
    <line x1="280" y1="80" x2="280" y2="310" stroke="#334155" stroke-width="8"/>
    <line x1="440" y1="80" x2="440" y2="310" stroke="#334155" stroke-width="8"/>
    <line x1="120" y1="120" x2="280" y2="240" stroke="#334155" stroke-width="5"/>
    <line x1="280" y1="120" x2="120" y2="240" stroke="#334155" stroke-width="5"/>
    <line x1="280" y1="120" x2="440" y2="240" stroke="#334155" stroke-width="5"/>
    <line x1="440" y1="120" x2="280" y2="240" stroke="#334155" stroke-width="5"/>
  `),
  'part1-document-gesture.svg': createSvg('Pointing at Architectural Plan', `
    <rect x="140" y="100" width="360" height="180" fill="#FEF3C7" stroke="#0F172A" stroke-width="4"/>
    <line x1="180" y1="140" x2="460" y2="140" stroke="#0F172A" stroke-width="3"/>
    <line x1="180" y1="180" x2="400" y2="180" stroke="#0F172A" stroke-width="3"/>
    <!-- Hand / Pencil pointing -->
    <polygon points="320,170 370,140 375,150 330,180" fill="#F59E0B" stroke="#0F172A" stroke-width="2"/>
  `),
  'part1-reflective-vests.svg': createSvg('Surveyors in Reflective Vests', `
    <rect x="100" y="180" width="30" height="120" fill="#64748B" stroke="#0F172A" stroke-width="3"/>
    <polygon points="90,180 140,180 125,140 105,140" fill="#F59E0B" stroke="#0F172A" stroke-width="3"/>
    <!-- Tripod Legs -->
    <line x1="115" y1="180" x2="70" y2="300" stroke="#0F172A" stroke-width="4"/>
    <line x1="115" y1="180" x2="160" y2="300" stroke="#0F172A" stroke-width="4"/>
    <!-- Surveyor Person -->
    <circle cx="340" cy="140" r="24" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M300 230 C300 185 380 185 380 230 Z" fill="#F97316" stroke="#0F172A" stroke-width="4"/>
  `),
  'part1-volumes-vertical.svg': createSvg('Volumes Organized Vertically', `
    <rect x="80" y="120" width="480" height="170" fill="#92400E" stroke="#0F172A" stroke-width="4"/>
    <!-- Vertical Book Spines -->
    <rect x="120" y="140" width="28" height="140" fill="#DC2626" stroke="#0F172A" stroke-width="3"/>
    <rect x="152" y="135" width="22" height="145" fill="#2563EB" stroke="#0F172A" stroke-width="3"/>
    <rect x="178" y="142" width="32" height="138" fill="#16A34A" stroke="#0F172A" stroke-width="3"/>
    <rect x="214" y="130" width="26" height="150" fill="#F59E0B" stroke="#0F172A" stroke-width="3"/>
    <rect x="244" y="145" width="30" height="135" fill="#8B5CF6" stroke="#0F172A" stroke-width="3"/>
  `),
  'part1-illuminated-aisle.svg': createSvg('Brightly Illuminated Library Aisle', `
    <polygon points="120,80 520,80 400,240 240,240" fill="#FEF08A" stroke="#0F172A" stroke-width="2"/>
    <circle cx="320" cy="110" r="20" fill="#FDE047" stroke="#0F172A" stroke-width="3"/>
    <line x1="320" y1="80" x2="320" y2="100" stroke="#0F172A" stroke-width="3"/>
  `),
  'part1-browsing-titles.svg': createSvg('Browsing Book Titles', `
    <rect x="360" y="80" width="200" height="230" fill="#78350F" stroke="#0F172A" stroke-width="4"/>
    <circle cx="240" cy="140" r="26" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M200 240 C200 185 280 185 280 240 Z" fill="#0EA5E9" stroke="#0F172A" stroke-width="4"/>
    <!-- Book in Hand -->
    <rect x="270" y="170" width="40" height="50" fill="#DC2626" stroke="#0F172A" stroke-width="2"/>
  `),
  'part1-neat-rows-books.svg': createSvg('Neat Rows of Shelving Books', `
    <rect x="80" y="90" width="480" height="210" fill="#FEF3C7" stroke="#0F172A" stroke-width="4"/>
    <!-- 3 Shelves with books -->
    <line x1="90" y1="150" x2="550" y2="150" stroke="#0F172A" stroke-width="4"/>
    <line x1="90" y1="220" x2="550" y2="220" stroke="#0F172A" stroke-width="4"/>
  `),
  'part1-overhead-screens.svg': createSvg('Overhead Flight Screens', `
    <!-- Ceiling Mounts -->
    <rect x="180" y="80" width="120" height="70" fill="#0F172A" stroke="#38BDF8" stroke-width="3"/>
    <rect x="340" y="80" width="120" height="70" fill="#0F172A" stroke="#38BDF8" stroke-width="3"/>
    <text x="195" y="115" fill="#38BDF8" font-family="monospace" font-size="11">DEPARTURES</text>
    <text x="355" y="115" fill="#4ADE80" font-family="monospace" font-size="11">ON TIME</text>
  `),
  'part1-polished-floor.svg': createSvg('Polished Marble Terminal Floor', `
    <polygon points="60,180 580,180 620,310 20,310" fill="#E2E8F0" stroke="#0F172A" stroke-width="4"/>
    <!-- Floor Reflection Lines -->
    <line x1="120" y1="240" x2="200" y2="240" stroke="#94A3B8" stroke-width="3"/>
    <line x1="320" y1="220" x2="440" y2="220" stroke="#94A3B8" stroke-width="3"/>
    <line x1="240" y1="270" x2="380" y2="270" stroke="#94A3B8" stroke-width="3"/>
  `),
  'part1-terminal-corridor.svg': createSvg('Airport Terminal Hall', `
    <polygon points="60,80 580,80 440,200 200,200" fill="#BAE6FD" stroke="#0F172A" stroke-width="3"/>
    <polygon points="200,200 440,200 500,310 140,310" fill="#F8FAFC" stroke="#0F172A" stroke-width="4"/>
    <circle cx="320" cy="220" r="16" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M300 280 C300 245 340 245 340 280 Z" fill="#6366F1" stroke="#0F172A" stroke-width="3"/>
  `),
  'part1-travelers-luggage.svg': createSvg('Luggage Transporting Travelers', `
    <!-- Rolling Suitcase -->
    <rect x="220" y="180" width="50" height="70" rx="8" fill="#1E293B" stroke="#0F172A" stroke-width="3"/>
    <line x1="245" y1="180" x2="245" y2="130" stroke="#0F172A" stroke-width="4"/>
    <!-- Traveler -->
    <circle cx="340" cy="130" r="24" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M300 230 C300 180 380 180 380 230 Z" fill="#2563EB" stroke="#0F172A" stroke-width="4"/>
  `),
  'part1-open-bins.svg': createSvg('Supermarket Open Produce Bins', `
    <rect x="80" y="160" width="480" height="130" fill="#78350F" stroke="#0F172A" stroke-width="4"/>
    <!-- Apples & Oranges -->
    <circle cx="160" cy="190" r="16" fill="#EF4444" stroke="#0F172A" stroke-width="2"/>
    <circle cx="200" cy="190" r="16" fill="#EF4444" stroke="#0F172A" stroke-width="2"/>
    <circle cx="280" cy="190" r="16" fill="#F97316" stroke="#0F172A" stroke-width="2"/>
    <circle cx="320" cy="190" r="16" fill="#F97316" stroke="#0F172A" stroke-width="2"/>
    <circle cx="400" cy="190" r="16" fill="#22C55E" stroke="#0F172A" stroke-width="2"/>
    <circle cx="440" cy="190" r="16" fill="#22C55E" stroke="#0F172A" stroke-width="2"/>
  `),
  'part1-selecting-items.svg': createSvg('Selecting Fresh Grocery Items', `
    <rect x="280" y="160" width="280" height="120" fill="#B45309" stroke="#0F172A" stroke-width="4"/>
    <circle cx="180" cy="140" r="26" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M140 240 C140 185 220 185 220 240 Z" fill="#EC4899" stroke="#0F172A" stroke-width="4"/>
    <!-- Holding fruit -->
    <circle cx="240" cy="170" r="14" fill="#22C55E" stroke="#0F172A" stroke-width="2"/>
  `),
  'part1-overhead-lighting.svg': createSvg('Overhead Supermarket Lights', `
    <rect x="80" y="80" width="480" height="230" fill="#F8FAFC" stroke="#0F172A" stroke-width="4"/>
    <!-- Fluorescent Tubes -->
    <rect x="120" y="100" width="160" height="14" fill="#FEF08A" stroke="#0F172A" stroke-width="2"/>
    <rect x="360" y="100" width="160" height="14" fill="#FEF08A" stroke="#0F172A" stroke-width="2"/>
  `),
  'part1-fruits-vegetables.svg': createSvg('Fruits and Vegetables on Sale', `
    <rect x="100" y="120" width="440" height="170" fill="#FEF3C7" stroke="#0F172A" stroke-width="4"/>
    <circle cx="180" cy="180" r="24" fill="#EF4444" stroke="#0F172A" stroke-width="3"/>
    <circle cx="260" cy="180" r="24" fill="#F59E0B" stroke="#0F172A" stroke-width="3"/>
    <circle cx="340" cy="180" r="24" fill="#10B981" stroke="#0F172A" stroke-width="3"/>
    <circle cx="420" cy="180" r="24" fill="#8B5CF6" stroke="#0F172A" stroke-width="3"/>
  `),
  'part1-beverage-cups.svg': createSvg('Beverage Cups on Cafe Table', `
    <circle cx="320" cy="200" r="100" fill="#D97706" stroke="#0F172A" stroke-width="4"/>
    <!-- Coffee Cups -->
    <circle cx="280" cy="180" r="22" fill="#FFFFFF" stroke="#0F172A" stroke-width="3"/>
    <circle cx="280" cy="180" r="16" fill="#78350F"/>
    <circle cx="360" cy="220" r="22" fill="#FFFFFF" stroke="#0F172A" stroke-width="3"/>
    <circle cx="360" cy="220" r="16" fill="#78350F"/>
  `),
  'part1-conversing-tables.svg': createSvg('Patrons Conversing at Cafe', `
    <circle cx="240" cy="130" r="24" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M205 210 C205 170 275 170 275 210 Z" fill="#3B82F6" stroke="#0F172A" stroke-width="3"/>
    <circle cx="400" cy="130" r="24" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M365 210 C365 170 435 170 435 210 Z" fill="#10B981" stroke="#0F172A" stroke-width="3"/>
    <!-- Table between them -->
    <rect x="260" y="200" width="120" height="20" fill="#B45309" stroke="#0F172A" stroke-width="3"/>
  `),
  'part1-pedestrian-walkway.svg': createSvg('Walkway Sidewalk Cafe', `
    <polygon points="60,160 580,160 620,310 20,310" fill="#E2E8F0" stroke="#0F172A" stroke-width="4"/>
    <!-- Row of tables and chairs -->
    <circle cx="160" cy="220" r="28" fill="#F59E0B" stroke="#0F172A" stroke-width="3"/>
    <circle cx="320" cy="220" r="28" fill="#F59E0B" stroke="#0F172A" stroke-width="3"/>
    <circle cx="480" cy="220" r="28" fill="#F59E0B" stroke="#0F172A" stroke-width="3"/>
  `),
  'part1-large-umbrellas.svg': createSvg('Patio Umbrellas Shade', `
    <!-- Large Canvas Umbrellas -->
    <polygon points="200,90 80,170 320,170" fill="#F8FAFC" stroke="#0F172A" stroke-width="4"/>
    <line x1="200" y1="170" x2="200" y2="280" stroke="#0F172A" stroke-width="6"/>
    <polygon points="440,90 320,170 560,170" fill="#F8FAFC" stroke="#0F172A" stroke-width="4"/>
    <line x1="440" y1="170" x2="440" y2="280" stroke="#0F172A" stroke-width="6"/>
  `),
  'part1-visual-slide.svg': createSvg('Slide on Projection Screen', `
    <rect x="140" y="80" width="360" height="200" fill="#1E293B" stroke="#0F172A" stroke-width="5"/>
    <!-- Projected Pie and Line -->
    <circle cx="250" cy="170" r="45" fill="#38BDF8" stroke="#0F172A" stroke-width="3"/>
    <path d="M250 170 L295 170 A45 45 0 0 1 250 215 Z" fill="#F59E0B"/>
    <line x1="340" y1="210" x2="440" y2="130" stroke="#4ADE80" stroke-width="4"/>
  `),
  'part1-audience-seated.svg': createSvg('Audience Seated Facing Front', `
    <rect x="80" y="80" width="480" height="120" fill="#F8FAFC" stroke="#0F172A" stroke-width="4"/>
    <!-- Audience back heads -->
    <circle cx="160" cy="250" r="24" fill="#334155" stroke="#0F172A" stroke-width="3"/>
    <circle cx="240" cy="250" r="24" fill="#1E293B" stroke="#0F172A" stroke-width="3"/>
    <circle cx="320" cy="250" r="24" fill="#334155" stroke="#0F172A" stroke-width="3"/>
    <circle cx="400" cy="250" r="24" fill="#1E293B" stroke="#0F172A" stroke-width="3"/>
    <circle cx="480" cy="250" r="24" fill="#334155" stroke="#0F172A" stroke-width="3"/>
  `),
  'part1-laptops-table.svg': createSvg('Laptops on Boardroom Table', `
    <rect x="80" y="150" width="480" height="130" fill="#78350F" stroke="#0F172A" stroke-width="4"/>
    <!-- 3 Laptops -->
    <polygon points="150,180 210,180 220,210 140,210" fill="#94A3B8" stroke="#0F172A" stroke-width="2"/>
    <polygon points="290,180 350,180 360,210 280,210" fill="#94A3B8" stroke="#0F172A" stroke-width="2"/>
    <polygon points="430,180 490,180 500,210 420,210" fill="#94A3B8" stroke="#0F172A" stroke-width="2"/>
  `),
  'part1-standing-speaker.svg': createSvg('Speaker Delivering Remarks', `
    <!-- Lectern -->
    <polygon points="360,180 430,180 420,280 370,280" fill="#B45309" stroke="#0F172A" stroke-width="4"/>
    <!-- Speaker -->
    <circle cx="280" cy="130" r="26" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M240 230 C240 175 320 175 320 230 Z" fill="#0EA5E9" stroke="#0F172A" stroke-width="4"/>
  `),
  'part1-glassware-workbench.svg': createSvg('Laboratory Glassware', `
    <rect x="80" y="190" width="480" height="90" fill="#F1F5F9" stroke="#0F172A" stroke-width="4"/>
    <!-- Beakers & Flasks -->
    <polygon points="180,190 220,190 230,240 170,240" fill="#BAE6FD" stroke="#0F172A" stroke-width="3"/>
    <rect x="270" y="160" width="28" height="80" rx="4" fill="#BBF7D0" stroke="#0F172A" stroke-width="3"/>
    <polygon points="360,180 400,180 420,240 340,240" fill="#FED7AA" stroke="#0F172A" stroke-width="3"/>
  `),
  'part1-white-labcoat.svg': createSvg('Researcher in White Lab Coat', `
    <circle cx="320" cy="130" r="28" fill="#FDE68A" stroke="#0F172A" stroke-width="4"/>
    <path d="M260 250 C260 180 380 180 380 250 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="4"/>
    <!-- Blue nitrile gloves -->
    <circle cx="250" cy="210" r="12" fill="#38BDF8" stroke="#0F172A" stroke-width="2"/>
    <circle cx="390" cy="210" r="12" fill="#38BDF8" stroke="#0F172A" stroke-width="2"/>
  `),
  'part1-scientific-instruments.svg': createSvg('Scientific Equipment Setup', `
    <rect x="100" y="180" width="440" height="100" fill="#E2E8F0" stroke="#0F172A" stroke-width="4"/>
    <rect x="160" y="130" width="90" height="50" fill="#334155" stroke="#0F172A" stroke-width="3"/>
    <rect x="340" y="120" width="120" height="60" fill="#0F172A" stroke="#0F172A" stroke-width="3"/>
    <circle cx="400" cy="150" r="16" fill="#22C55E"/>
  `),
  'part1-optical-instrument.svg': createSvg('Adjusting Optical Instrument', `
    <circle cx="260" cy="130" r="26" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M220 220 C220 175 300 175 300 220 Z" fill="#475569" stroke="#0F172A" stroke-width="4"/>
    <!-- Microscope Knobs -->
    <rect x="360" y="140" width="50" height="100" fill="#0F172A" stroke="#0F172A" stroke-width="3"/>
    <circle cx="385" cy="190" r="14" fill="#F59E0B" stroke="#0F172A" stroke-width="2"/>
  `),
  'part1-machinery-line.svg': createSvg('Manufacturing Assembly Line', `
    <rect x="60" y="170" width="520" height="80" fill="#64748B" stroke="#0F172A" stroke-width="4"/>
    <!-- Conveyor rollers -->
    <circle cx="120" cy="210" r="14" fill="#0F172A"/>
    <circle cx="200" cy="210" r="14" fill="#0F172A"/>
    <circle cx="280" cy="210" r="14" fill="#0F172A"/>
    <circle cx="360" cy="210" r="14" fill="#0F172A"/>
    <circle cx="440" cy="210" r="14" fill="#0F172A"/>
    <circle cx="520" cy="210" r="14" fill="#0F172A"/>
  `),
  'part1-operator-control.svg': createSvg('Plant Control Panel Operator', `
    <!-- Operator -->
    <circle cx="180" cy="140" r="26" fill="#FDE68A" stroke="#0F172A" stroke-width="3"/>
    <path d="M140 230 C140 185 220 185 220 230 Z" fill="#1E293B" stroke="#0F172A" stroke-width="4"/>
    <!-- Panel -->
    <rect x="300" y="90" width="220" height="180" fill="#0F172A" stroke="#38BDF8" stroke-width="4"/>
    <circle cx="350" cy="140" r="12" fill="#EF4444"/>
    <circle cx="400" cy="140" r="12" fill="#22C55E"/>
    <circle cx="450" cy="140" r="12" fill="#FACC15"/>
  `),
  'part1-protective-gear.svg': createSvg('Industrial Worker Safety Gear', `
    <circle cx="320" cy="130" r="30" fill="#FDE68A" stroke="#0F172A" stroke-width="4"/>
    <path d="M260 250 C260 180 380 180 380 250 Z" fill="#F97316" stroke="#0F172A" stroke-width="4"/>
    <!-- Earmuffs & Goggles -->
    <rect x="280" y="115" width="80" height="18" rx="6" fill="#38BDF8" stroke="#0F172A" stroke-width="2"/>
    <circle cx="280" cy="130" r="12" fill="#0F172A"/>
    <circle cx="360" cy="130" r="12" fill="#0F172A"/>
  `),
  'part1-clean-production.svg': createSvg('Clean Orderly Production Floor', `
    <polygon points="60,160 580,160 620,310 20,310" fill="#E2E8F0" stroke="#0F172A" stroke-width="4"/>
    <line x1="320" y1="160" x2="320" y2="310" stroke="#FACC15" stroke-dasharray="16 12" stroke-width="6"/>
  `)
};

// Write all SVGs to images/toeic/
Object.entries(svgScenes).forEach(([filename, svgContent]) => {
  const filePath = path.join(imagesDir, filename);
  fs.writeFileSync(filePath, svgContent.trim(), 'utf8');
});

console.log(`Generated and saved ${Object.keys(svgScenes).length} custom SVG illustrations.`);
