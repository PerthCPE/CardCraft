---
name: cardcraft-pixel-ui
description: Hybrid Pixel-RPG & Neo-Brutalist EdTech UI/UX design system and anti-AI-slop rules for the CardCraft TOEIC 700+ web application, unified with studio-grade typography principles from frontend-design.
---

# CardCraft Pixel-RPG & Studio Typography Design Skill

This skill combines **CardCraft's Hybrid Pixel-RPG & Neo-Brutalist EdTech** identity with the studio-grade typographic discipline of **`frontend-design`**. Every frontend component and page MUST strictly follow these rules so the interface reads as a deliberate, human-crafted product rather than an AI template.

---

## 1. Core Aesthetic & Anti-AI Slop Rules (STRICTLY ENFORCED)

1. **NO Emojis in UI Code:** NEVER render Unicode emojis anywhere in JSX/TSX. Use crisp pixel assets from `/icons/` and `/sprites/` paired with `lucide-react` icons.
2. **NO Dark Neon Purple / Cyberpunk Gradients:** Never use violet/magenta/cyan glowing blurs or glassmorphism.
3. **Eliminate Common AI-Generated Layout Tells (from `frontend-design`):**
   - **No ALL-CAPS Eyebrow Slop:** Do NOT slap tracked-out ALL-CAPS labels above every heading or inside every card (e.g., avoid `"THAI MEANING:"`, `"TOEIC BUSINESS CONTEXT:"`, `"OFFICIAL DOCUMENT"`). Let typographic scale, weight, and placement establish hierarchy naturally.
   - **No Fake Numbered Lists:** Do NOT number cards (`01 / 02 / 03` or `1. / 2. / 3. / 4.`) unless the items are a genuine sequential progression (like the 7-Tier Evolution Roadmap or Question 1–15).
   - **No Spaced Em-Dashes or Middle-Dot Soup:** Avoid `WORD — fragment` headlines, `A · B · C` meta strings, and appending `→` to every button label.
   - **Spend Boldness in One Place:** Let the pixel art sprites and tactile Neo-Brutalist card frames be the hero; keep surrounding metadata quiet, left-aligned, and disciplined.
4. **Named Color Tokens (5 Core Hex Values):**
   - **Warm Parchment Canvas:** `#F8F5EC`
   - **Paper Card Surface:** `#FFFDF7`
   - **Deep Guild Ink (Slate 900):** `#0F172A`
   - **Royal Gold (EXP & Active Focus):** `#FBBF24`
   - **Paladin Emerald (700+ Target Goal):** `#10B981`

---

## 2. Studio Typography System (Human-Crafted Hierarchy)

Load four coordinated Google Fonts in `app/layout.tsx`:
1. **`Plus Jakarta Sans` + `IBM Plex Sans Thai`** (`--font-body` / `font-sans`)
   - **Primary workhorse** for all English and Thai UI copy, TOEIC reading passages, question stems, answer choices, and explanations.
   - Enforce comfortable reading measure (`max-w-[65ch]`) and generous line height (`leading-relaxed` / `1.65`) for Thai + English mixed text.
2. **`Chakra Petch`** (`--font-thai` / `font-thai`)
   - Used for **Display Headings** (`h1`, `h2`, `h3`) and section titles in sentence case with optical weight (`font-bold tracking-tight`).
3. **`Silkscreen`** (`--font-pixel` / `font-pixel`)
   - **Strictly reserved for numeric HUD readouts, score counters (`625 / 990`), timers (`14:59`), and compact tier tags (`Tier 4`, `Mana 3`).**
   - NEVER use `Silkscreen` for multi-word English sentences, table headers, or long button labels.

---

## 3. Pixel Rendering & Sprite Rules

1. **Razor-Sharp Pixel Scaling:**
   Every pixel sprite `<img>` MUST include `className="[image-rendering:pixelated] select-none"`.
2. **Built-in SVG Pixel Fallback:**
   `PixelCharacterAvatar` falls back to a crisp 16x16 SVG pixel sprite if an external image fails to load.
3. **Locked Tier Silhouette Rule:**
   In the 7-Stage Evolution Roadmap, locked tiers render with `className="[image-rendering:pixelated] brightness-0 opacity-40 contrast-200 select-none"`.

---

## 4. Tactile Game Cards, Arcade Controls & Copywriting

- **Tactile Framing:** `border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a]` with physical press feedback (`active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#0f172a]`).
- **Active, Conversational Copywriting:** Use plain verbs and sentence case on buttons (`พลิกดูคำแปล`, `จำแม่นแล้ว`, `ส่งกระดาษคำตอบ`, `บันทึกคำศัพท์`) so every written element does one clear job.
- **Keyboard-First UX:** Support `Space` (flip), `ArrowLeft`/`ArrowRight` (swipe/navigate), `1-4`/`A-D` (answer), and `F` (flag) with clean `<kbd>` badges.
