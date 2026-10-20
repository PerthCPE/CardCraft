---
name: cardcraft-pixel-ui
description: Hybrid Pixel-RPG & Neo-Brutalist EdTech UI/UX design system and anti-AI-slop rules for CardCraft v2.0 (TOEIC 700+ Web App), covering Selection Hubs, 7-Part Drills, 6 Vocab Arcade Mini-Games, Supportive 5-Band Readiness Forecasts, and Mock Exam Boss Raids.
---

# CardCraft v2.0: Pixel-RPG & Studio Typography Design Skill

This skill combines **CardCraft's Hybrid Pixel-RPG & Neo-Brutalist EdTech** identity with the studio-grade typographic discipline of **`frontend-design`**. Every frontend component, modal, mini-game, and page in v2.0 MUST strictly follow these rules so the interface reads as a deliberate, human-crafted product rather than an AI template.

---

## 1. Core Aesthetic & Anti-AI Slop Rules (STRICTLY ENFORCED)

1. **NO Emojis in UI Code:** NEVER render Unicode emojis anywhere in JSX/TSX (no 🎯, 🚀, ✨, 🔥, 🏆). Always use crisp pixel assets from `/sprites/` and `/icons/` paired with `lucide-react` icons (`strokeWidth={2}`).
2. **NO Dark Neon Purple / Cyberpunk Gradients:** Never use violet/magenta/cyan glowing blurs, glassmorphism (`backdrop-blur`), or generic dark-mode SaaS templates.
3. **Eliminate Common AI-Generated Layout Tells:**
   - **No ALL-CAPS Eyebrow Slop:** Do NOT slap tracked-out ALL-CAPS labels above every heading or inside every card (e.g., avoid `"THAI MEANING:"`, `"PRACTICE CONFIGURATION:"`, `"OFFICIAL MOCK EXAM"`). Let typographic scale, weight, and placement establish hierarchy naturally.
   - **No Fake Numbered Lists:** Do NOT number cards (`01 / 02 / 03`) unless the items represent a genuine sequential progression (such as the 7-Tier Evolution Roadmap, TOEIC Parts 1–7, or Question numbers `1–200`).
   - **No Spaced Em-Dashes or Middle-Dot Soup:** Avoid `WORD — fragment` headlines, `A · B · C` meta strings, and appending `→` to every button label.
   - **Spend Boldness in One Place:** Let the pixel art sprites and tactile Neo-Brutalist card frames be the hero; keep surrounding metadata quiet, left-aligned, and disciplined.
4. **Named Color Tokens (Core Palette + Semantic v2.0 Tokens):**
   - **Warm Parchment Canvas:** `#F8F5EC` (Main page background)
   - **Paper Card Surface:** `#FFFDF7` (Elevated card & passage background)
   - **Deep Guild Ink (Slate 900):** `#0F172A` (Borders, shadows, and primary text)
   - **Royal Gold (EXP & Active Focus):** `#FBBF24` (Primary interactive highlights & Mock Exam rank)
   - **Paladin Emerald (700+ Target Goal):** `#10B981` (Mastered states & 700+ goal passed)
   - **Forecast Sky (Practice Readiness Only):** `#0284C7` (Used strictly for Practice Part Forecast bars so users never confuse them with Golden Hero EXP)

---

## 2. Studio Typography System (Human-Crafted Hierarchy)

Load four coordinated Google Fonts in `app/layout.tsx`:
1. **`Plus Jakarta Sans` + `IBM Plex Sans Thai`** (`--font-body` / `font-sans`)
   - **Primary workhorse** for all English and Thai UI copy, TOEIC reading passages, question stems, answer choices, supportive feedback descriptions, and explanations.
   - Enforce comfortable reading measure (`max-w-[65ch]`) and generous line height (`leading-relaxed` / `1.65`) for Thai + English mixed text.
2. **`Chakra Petch`** (`--font-thai` / `font-thai`)
   - Used for **Display Headings** (`h1`, `h2`, `h3`), Hub section titles, and RPG Rank titles in sentence case with optical weight (`font-bold tracking-tight`).
3. **`Silkscreen`** (`--font-pixel` / `font-pixel`)
   - **Strictly reserved for numeric HUD readouts, score counters (`745 / 990`), timers (`29:59`), question counts (`15 Qs`), and compact tier tags (`Tier 5`).**
   - NEVER use `Silkscreen` for multi-word English sentences, passage text, or long button labels.

---

## 3. Pixel Rendering & Sprite Rules

1. **Razor-Sharp Pixel Scaling:**
   Every pixel sprite or custom game icon `<img>` MUST include `className="[image-rendering:pixelated] select-none"`.
2. **Built-in SVG Pixel Fallback:**
   `PixelCharacterAvatar` and custom game icons must gracefully fall back to a crisp pixel-aligned SVG or `lucide-react` icon inside a Neo-Brutalist badge frame if an external PNG asset fails to load.
3. **Locked Tier Silhouette Rule:**
   In the 7-Stage Evolution Roadmap, locked tiers render with `className="[image-rendering:pixelated] brightness-0 opacity-40 contrast-200 select-none"`.

---

## 4. v2.0 Hub-First Architecture & Pre-Game Configuration UI

1. **Hub-First Navigation (Zero Auto-Start):**
   - Both `/practice` and `/mock-test` MUST open to a structured **Selection Hub**, never directly into an active question.
   - Organize `/practice` into two distinct visual zones using clean tab or section switches: **"ฝึกแยก 7 พาร์ท (TOEIC Parts 1–7)"** and **"มินิเกมคำศัพท์ (Vocab Arcade 6 Games)"**.
2. **Tactile Pre-Game Configuration Drawer / Modal:**
   - Selecting any drill or mini-game opens a focused configuration card (`bg-[#FFFDF7] border-2 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a]`).
   - **7-Part Drill Constraints UI:** Display tactile stepper buttons or range pills for Question Count (`min: 15`) and Time Limit (`min: 5 นาที`). If the user is at the minimum bound (`15 ข้อ` or `5 นาที`), visually lock the decrement button and show a subtle helper note in Thai (`ขั้นต่ำ 15 ข้อ และ 5 นาที เพื่อความแม่นยำในการคาดการณ์คะแนน`).
   - **Vocab Game Category Pill Selector:** Provide a clean wrap-grid of tactile category pills (*ทั้งหมด / คละหมวดหมู่*, *Contracts*, *Marketing*, *Finance*, *Office*, *Travel*, *HR*, *Technology*) where the active pill snaps down with `#FBBF24` fill.
3. **Mock Exam Package Cards (`/mock-test`):**
   - Present the 7 exam packages (`50`, `75`, `100`, `125`, `150`, `175`, `200` ข้อ) as tiered "Boss Raid Contracts". Clearly badge that **only Mock Exam completions grant Hero Evolution XP**.

---

## 5. UI Standards for the 6 Vocab Arcade Mini-Games & 7-Part Drills

1. **Distinct Game Board Layouts (No Repetitive Quiz Clones):**
   - **Rune Match:** 4x3 tactile stone/paper grid (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3`). Matched pairs animate out smoothly without shifting surrounding grid cells.
   - **Anagram Forge:** Render individual letter tiles as physical keyboard keycaps (`w-11 h-12 border-2 border-slate-900 bg-white shadow-[2px_3px_0px_0px_#0f172a] font-bold text-lg`) that snap into answer slots when clicked or typed.
   - **Bard's Echo:** Center a prominent tactile Audio Speaker totem button (`กด Space เพื่อฟังเสียงคำศัพท์อีกครั้ง`) before revealing look-alike word choices.
   - **Word Alchemist, Twin Blades & Context Cloze:** Highlight the target blank (`_____`) or root word inside a recessed parchment well (`bg-[#F8F5EC] border-2 border-dashed border-slate-400 px-3 py-1 rounded`).
2. **Authentic TOEIC Part Layouts:**
   - **Part 2:** Render strictly 3 answer buttons (`[A]`, `[B]`, `[C]`). Never render an empty or disabled `[D]` button.
   - **Part 3, 4, 6 & 7 (Grouped Questions):** Keep the shared Audio Player or Reading Passage pinned in a left/top sticky container (`md:grid-cols-12`, passage `md:col-span-7`, questions `md:col-span-5`) with independent scrollbars.

---

## 6. Visual Separation of "Official Hero Rank" vs. "Practice Forecast"

1. **Official Hero HUD (Mock Exam Driven Only):**
   - Framed in **Royal Gold (`#FBBF24`)** and **Paladin Emerald (`#10B981`)**. Displays the 7-Tier Pixel Sprite (`Novice Villager` to `CardCraft Deity`) and official Mock Exam score.
2. **Practice Readiness Forecast Panel & 5 Supportive Mastery Badges:**
   - Framed in clean **Paper & Sky/Indigo accents** with a clear label: *"คะแนนคาดการณ์รายพาร์ทจากการฝึกซ้อม (ไม่นับรวมในเลเวลตัวละคร)"*.
   - **Supportive 5-Band Badge Styling (Never use harsh red/failure aesthetics for low practice scores):**
     1. `0–35%` **ระดับปูรากฐาน (Seedling Stage):** Warm Stone badge (`bg-stone-100 text-stone-800 border-stone-900`) — encouraging copy focused on building fundamentals.
     2. `36–50%` **ระดับเริ่มจับจังหวะได้ (Awakening Stage):** Soft Amber badge (`bg-amber-100 text-amber-900 border-slate-900`).
     3. `51–68%` **ระดับมาตรฐานนักผจญภัย (Steady Adventurer):** Sky Blue badge (`bg-sky-100 text-sky-900 border-slate-900`).
     4. `69–84%` **ระดับผู้ท้าชิงที่แข็งแกร่ง (High Challenger):** Indigo badge (`bg-indigo-100 text-indigo-900 border-slate-900`).
     5. `85–100%` **ระดับปรมาจารย์ไร้เทียมทาน (Grand Master):** Emerald badge (`bg-emerald-100 text-emerald-950 border-slate-900`).

---

## 7. Tactile Controls, Micro-Interactions & Copywriting

- **Tactile Framing:** `border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a]` with physical press feedback (`active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#0f172a]`).
- **Active, Conversational Copywriting:** Use plain, encouraging Thai verbs in sentence case on buttons (`ตั้งค่าการฝึกซ้อม`, `เริ่มทำโจทย์`, `พลิกดูคำแปล`, `ส่งกระดาษคำตอบ`).
- **Keyboard-First UX:** Support `Space` (flip/replay audio), `ArrowLeft`/`ArrowRight` (navigate), `1-4`/`A-D` (select choice), and `F` (flag question) with clean `<kbd>` badges.