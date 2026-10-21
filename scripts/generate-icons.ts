import axios, { AxiosError } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// PixelLab API Configuration
const PIXELLAB_BASE_URL = process.env.PIXELLAB_BASE_URL || 'https://api.pixellab.ai/v2';
const PIXELLAB_API_KEY = process.env.PIXELLAB_API_KEY || '123a5bcc-2996-4583-a502-d45ca0a0734c';

const OUTPUT_DIRS = [
  path.resolve(__dirname, '../frontend/public/icons'),
  path.resolve(__dirname, '../frontend/public/sprites'),
];

const FAVICON_PATH = path.resolve(__dirname, '../frontend/src/app/icon.png');

interface IconConfig {
  name: string;
  filename: string;
  aliases?: string[];
  isWebsiteLogo?: boolean;
  prompt: string;
}

// ============================================================================
// CardCraft v2.0 Medieval Fantasy Game & Website Icons
// Strictly follows /cardcraft-pixel-ui:
// - 16-bit crisp pixel art, transparent background
// - Deep Guild Ink (#0F172A), Royal Gold (#FBBF24), Paladin Emerald (#10B981)
// - Octopath Traveler / Golden Sun aesthetic
// ============================================================================
const GAME_ICONS: IconConfig[] = [
  // 1. Core Brand & Website Logo
  {
    name: 'CardCraft Website Brand Logo',
    filename: 'icon-logo.png',
    aliases: ['logo-deck.png'],
    isWebsiteLogo: true,
    prompt:
      '16-bit pixel art medieval fantasy game logo emblem, an ancient royal gilded card deck bound in navy blue velvet and golden crystal band, adorned with a radiant emerald-gold 700 star crest, surrounded by floating golden stardust sparks, crisp pixel edges, transparent background, octopath traveler icon style',
  },

  // 2. Core Game Modes & Hubs
  {
    name: 'Card Deck Vault (Flashcards Hub)',
    filename: 'icon-deck.png',
    aliases: ['deck.png'],
    prompt:
      '16-bit pixel art medieval game icon, an ornate mahogany adventurer card vault box with polished gold corners, three glowing parchment cards with golden edges emerging from top, subtle cyan mana shimmer, crisp pixel edges, transparent background',
  },
  {
    name: 'Boss Gate (Mock Exam Boss Raid)',
    filename: 'icon-boss-gate.png',
    aliases: ['boss-gate.png'],
    prompt:
      '16-bit pixel art medieval game icon, an ancient heavy stone dungeon portal gate engraved with glowing emerald magic runes and a menacing boss skull keystone with golden 700 numeral, crisp pixel edges, transparent background',
  },
  {
    name: 'Target 700+ Paladin Trophy',
    filename: 'icon-trophy-700.png',
    aliases: ['trophy-700.png'],
    prompt:
      '16-bit pixel art medieval game icon, a legendary royal gold paladin chalice grail with a brilliant glowing emerald jewel embedded in center, sparkling emerald victory particles, crisp pixel edges, transparent background',
  },
  {
    name: '3D Trading Card Back Texture',
    filename: 'icon-card-back.png',
    aliases: ['card-back.png'],
    prompt:
      '16-bit pixel art trading card back design, royal midnight blue velvet texture with ornate medieval gold plate filigree border, glowing golden compass star seal in center, vertical rectangle ratio, crisp pixel edges, transparent background',
  },

  // 3. TOEIC Drill Modes
  {
    name: 'Listening Horn (Part 1-4 Listening Drill)',
    filename: 'icon-listening.png',
    prompt:
      '16-bit pixel art medieval game icon, a heraldic polished brass war horn with glowing blue acoustic soundwave runes and golden light accents, crisp pixel edges, transparent background',
  },
  {
    name: 'Reading Grimoire (Part 5-7 Reading Drill)',
    filename: 'icon-reading.png',
    prompt:
      '16-bit pixel art medieval game icon, an open ancient royal leather-bound grimoire book with glowing golden illuminated runes and a royal crimson ribbon bookmark, crisp pixel edges, transparent background',
  },
  {
    name: 'Grammar Speed Drill (Speed Attack)',
    filename: 'icon-part-speed.png',
    prompt:
      '16-bit pixel art medieval game icon, a swift silver rapier sword slashing with wind slash particles and a tiny brass hourglass of time, crisp pixel edges, transparent background',
  },
  {
    name: 'Reading Passage Scroll (Part 7 Passage Quest)',
    filename: 'icon-part-passage.png',
    prompt:
      '16-bit pixel art medieval game icon, an unfurled royal parchment scroll with official red wax seal, feather quill pen, and a small brass magnifying monocle, crisp pixel edges, transparent background',
  },

  // 4. Actions, Swipes & HUD Elements
  {
    name: 'Swipe Mastered (Known Status)',
    filename: 'icon-swipe-known.png',
    prompt:
      '16-bit pixel art medieval game icon, a radiant paladin emerald green kite shield with a polished golden checkmark emblem, divine green glow, crisp pixel edges, transparent background',
  },
  {
    name: 'Swipe Learning (Review Status)',
    filename: 'icon-swipe-learning.png',
    prompt:
      '16-bit pixel art medieval game icon, an ancient forged iron heater shield with an amber-orange sword scratch mark and swirling ember mana sparks, crisp pixel edges, transparent background',
  },
  {
    name: 'Flip Card Magic (Interactive Flip)',
    filename: 'icon-action-flip.png',
    prompt:
      '16-bit pixel art medieval game icon, two glowing circular magic arrows rotating around a hovering mystic golden card, cyan and gold sparks, crisp pixel edges, transparent background',
  },
  {
    name: 'Flag Review Pin (Error Vault Bookmark)',
    filename: 'icon-action-flag.png',
    prompt:
      '16-bit pixel art medieval game icon, a royal crimson pennant battle flag with golden trim mounted on a polished brass pike, crisp pixel edges, transparent background',
  },
  {
    name: 'Boss Timer Hourglass (HUD Timer)',
    filename: 'icon-hud-timer.png',
    prompt:
      '16-bit pixel art medieval game icon, an ornate gothic brass hourglass filled with glowing crimson sands of time, crisp pixel edges, transparent background',
  },
  {
    name: 'HUD Mana Gem (Mana & Difficulty)',
    filename: 'icon-hud-mana.png',
    prompt:
      '16-bit pixel art medieval game icon, a glowing multifaceted royal blue mana crystal gemstone with brilliant glint reflections, crisp pixel edges, transparent background',
  },
];

interface PixelLabImageResponse {
  image?: {
    type?: string;
    base64?: string;
    format?: string;
    url?: string;
  };
  enhanced_prompt?: string;
  usage?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Generate a single icon asset using PixelLab API
 */
async function generateIconAsset(config: IconConfig, retries = 3): Promise<Buffer> {
  const client = axios.create({
    baseURL: PIXELLAB_BASE_URL,
    headers: {
      Authorization: `Bearer ${PIXELLAB_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 180000,
  });

  const requestBody = {
    description: config.prompt,
    image_size: {
      width: 32,
      height: 32,
    },
    no_background: true,
    detail: 'highly detailed',
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`\n🎨 [${config.filename}] Generating ${config.name} (32x32px)... (Attempt ${attempt}/${retries})`);
      console.log(`   Prompt: "${config.prompt.substring(0, 85)}..."`);

      const response = await client.post<PixelLabImageResponse>('/create-image-pixen', requestBody);

      if (response.data?.image?.base64) {
        return Buffer.from(response.data.image.base64, 'base64');
      }

      if (response.data?.image?.url) {
        console.log(`   Downloading image from URL: ${response.data.image.url}`);
        const imageDownload = await axios.get<Buffer>(response.data.image.url, {
          responseType: 'arraybuffer',
          timeout: 30000,
        });
        return Buffer.from(imageDownload.data);
      }

      throw new Error(`Unexpected response structure: ${JSON.stringify(response.data).substring(0, 200)}`);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string; detail?: string | unknown }>;
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message || String(error);

      console.error(`❌ [${config.filename}] Attempt ${attempt} failed: ${errorDetail}`);

      if (attempt < retries) {
        const isConcurrency = errorDetail.includes('concurrent');
        const waitMs = isConcurrency ? 10000 : 6000;
        console.log(`⏳ Waiting ${waitMs / 1000}s before retrying...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      } else {
        throw new Error(`Failed to generate ${config.filename} after ${retries} attempts: ${errorDetail}`);
      }
    }
  }

  throw new Error(`Unreachable state for ${config.filename}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('=====================================================');
  console.log('🛡️  CardCraft: Medieval Game & Website Logo Generator');
  console.log('=====================================================');
  console.log(`API Base URL: ${PIXELLAB_BASE_URL}`);

  // Ensure output directories exist
  for (const dir of OUTPUT_DIRS) {
    if (!fs.existsSync(dir)) {
      console.log(`📁 Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Parse optional command line args (e.g., --file=icon-logo.png)
  const args = process.argv.slice(2);
  const specificFileArg = args.find((a) => a.startsWith('--file=') || a.startsWith('--id='));
  const targetFile = specificFileArg ? specificFileArg.split('=')[1] : null;

  const iconsToProcess = targetFile
    ? GAME_ICONS.filter((i) => i.filename === targetFile || i.name.toLowerCase().includes(targetFile.toLowerCase()))
    : GAME_ICONS;

  if (iconsToProcess.length === 0) {
    console.error(`⚠️ No valid icon found matching criteria: ${targetFile}`);
    process.exit(1);
  }

  console.log(`Processing ${iconsToProcess.length} icon(s)...`);
  const results: { name: string; file: string; status: 'SUCCESS' | 'FAILED'; error?: string }[] = [];

  for (let i = 0; i < iconsToProcess.length; i++) {
    const iconConfig = iconsToProcess[i];

    try {
      console.log(`\n⏳ [${i + 1}/${iconsToProcess.length}] Redesigning ${iconConfig.name}...`);
      const buffer = await generateIconAsset(iconConfig);

      // Save to primary output directories (icons and sprites)
      for (const dir of OUTPUT_DIRS) {
        const filePath = path.join(dir, iconConfig.filename);
        fs.writeFileSync(filePath, buffer);
        console.log(`💾 Saved: ${filePath} (${buffer.length} bytes)`);

        // Save aliases if any (e.g., logo-deck.png, boss-gate.png)
        if (iconConfig.aliases) {
          for (const alias of iconConfig.aliases) {
            const aliasPath = path.join(dir, alias);
            fs.writeFileSync(aliasPath, buffer);
            console.log(`💾 Saved Alias: ${aliasPath}`);
          }
        }
      }

      // If this is the website logo, also update the favicon at frontend/src/app/icon.png
      if (iconConfig.isWebsiteLogo) {
        fs.writeFileSync(FAVICON_PATH, buffer);
        console.log(`✨ Saved Website Favicon: ${FAVICON_PATH}`);
      }

      results.push({
        name: iconConfig.name,
        file: iconConfig.filename,
        status: 'SUCCESS',
      });

      // Cooldown delay for PixelLab API free tier concurrency limit
      if (i < iconsToProcess.length - 1) {
        console.log('⏳ Cooldown 8s for next generation...');
        await new Promise((resolve) => setTimeout(resolve, 8000));
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      results.push({
        name: iconConfig.name,
        file: iconConfig.filename,
        status: 'FAILED',
        error: errMsg,
      });
    }
  }

  console.log('\n=====================================================');
  console.log('📊 Logo & Icon Redesign Summary');
  console.log('=====================================================');
  for (const res of results) {
    const symbol = res.status === 'SUCCESS' ? '✅' : '❌';
    console.log(`${symbol} ${res.name} -> ${res.file} [${res.status}]`);
    if (res.error) {
      console.log(`   Error: ${res.error}`);
    }
  }
  console.log('=====================================================\n');
}

// Execute
main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
