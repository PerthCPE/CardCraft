import axios, { AxiosError } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// PixelLab API Configuration
const PIXELLAB_BASE_URL = process.env.PIXELLAB_BASE_URL || 'https://api.pixellab.ai/v2';
const PIXELLAB_API_KEY = process.env.PIXELLAB_API_KEY || 'dfc3fbff-e5b9-4f95-8c96-e08b43832b08';

const OUTPUT_DIRS = [
  path.resolve(__dirname, '../frontend/public/icons'),
  path.resolve(__dirname, '../frontend/public/sprites'),
];

interface IconConfig {
  name: string;
  filename: string;
  prompt: string;
}

const GAME_ICONS: IconConfig[] = [
  // Core System
  {
    name: 'Logo Deck',
    filename: 'icon-logo.png',
    prompt: '16-bit pixel art medieval game icon, an ancient ornate leather-bound card deck wrapped in golden filigree and glowing blue mana crystal band, floating magical sparks, crisp pixel edges, transparent background',
  },
  {
    name: 'Card Deck Vault',
    filename: 'icon-deck.png',
    prompt: '16-bit pixel art medieval game icon, a wooden adventurer card case holding three glowing parchment cards with golden edges, crisp pixel edges, transparent background',
  },
  {
    name: 'Boss Gate (Mock Test)',
    filename: 'icon-boss-gate.png',
    prompt: '16-bit pixel art medieval game icon, an ancient stone dungeon portal gate engraved with glowing blue runes and a menacing boss skull keystone on top, crisp pixel edges, transparent background',
  },
  {
    name: 'Target 700 Trophy',
    filename: 'icon-trophy-700.png',
    prompt: '16-bit pixel art medieval game icon, a royal gold paladin chalice with a large glowing emerald gem embedded in center, sparkling emerald victory particles, crisp pixel edges, transparent background',
  },
  {
    name: 'Card Back Texture',
    filename: 'icon-card-back.png',
    prompt: '16-bit pixel art trading card back design, royal midnight blue velvet texture with ornate medieval gold plate border, glowing compass star seal in center, vertical rectangle ratio, crisp pixel edges, transparent background',
  },

  // TOEIC Modes
  {
    name: 'Listening Horn',
    filename: 'icon-listening.png',
    prompt: '16-bit pixel art medieval game icon, a polished brass heraldic war horn with glowing blue acoustic soundwave runes, crisp pixel edges, transparent background',
  },
  {
    name: 'Reading Grimoire',
    filename: 'icon-reading.png',
    prompt: '16-bit pixel art medieval game icon, an open ancient leather-bound grimoire book with glowing golden text and a crimson bookmark ribbon, crisp pixel edges, transparent background',
  },
  {
    name: 'Grammar Speed Drill',
    filename: 'icon-part-speed.png',
    prompt: '16-bit pixel art medieval game icon, a swift silver rapier sword surrounded by wind slash particles and a tiny hourglass, crisp pixel edges, transparent background',
  },
  {
    name: 'Reading Passage Scroll',
    filename: 'icon-part-passage.png',
    prompt: '16-bit pixel art medieval game icon, an unfurled royal parchment scroll with wax seal and a feather quill pen dipped in ink, crisp pixel edges, transparent background',
  },

  // Actions & HUD
  {
    name: 'Swipe Mastered',
    filename: 'icon-swipe-known.png',
    prompt: '16-bit pixel art medieval game icon, a shining emerald shield with a golden checkmark emblem, radiant green glow, crisp pixel edges, transparent background',
  },
  {
    name: 'Swipe Learning',
    filename: 'icon-swipe-learning.png',
    prompt: '16-bit pixel art medieval game icon, an iron shield with an amber-orange sword scratch and swirling mana particles, crisp pixel edges, transparent background',
  },
  {
    name: 'Flip Card Magic',
    filename: 'icon-action-flip.png',
    prompt: '16-bit pixel art medieval game icon, two glowing circular magic arrows rotating around a floating mystic card, crisp pixel edges, transparent background',
  },
  {
    name: 'Flag Review Pin',
    filename: 'icon-action-flag.png',
    prompt: '16-bit pixel art medieval game icon, a royal crimson pennant battle flag on a brass pole, crisp pixel edges, transparent background',
  },
  {
    name: 'Boss Timer Hourglass',
    filename: 'icon-hud-timer.png',
    prompt: '16-bit pixel art medieval game icon, an ornate brass hourglass with glowing crimson sands of time, crisp pixel edges, transparent background',
  },
  {
    name: 'Mana Gem',
    filename: 'icon-hud-mana.png',
    prompt: '16-bit pixel art medieval game icon, a glowing multifaceted blue mana crystal gemstone with magical glint, crisp pixel edges, transparent background',
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
    timeout: 180000, // 3 minutes timeout
  });

  const requestBody = {
    description: config.prompt,
    image_size: {
      width: 32,
      height: 32,
    },
    no_background: true,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`\n🎨 [${config.filename}] Generating ${config.name} (32x32px)... (Attempt ${attempt}/${retries})`);
      console.log(`   Prompt: "${config.prompt.substring(0, 80)}..."`);

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
        const isConcurrency = errorDetail.includes('maximum number of concurrent jobs');
        const waitMs = isConcurrency ? 8000 : 5000;
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
  console.log('🎮 CardCraft: PixelLab 32x32 Game Icon Generator');
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

  console.log(`Found ${iconsToProcess.length} icon(s) to process.`);
  const results: { name: string; file: string; status: 'SUCCESS' | 'FAILED'; error?: string }[] = [];

  for (let i = 0; i < iconsToProcess.length; i++) {
    const iconConfig = iconsToProcess[i];

    // Check if already exists and skip unless --force
    const force = args.includes('--force');
    const firstDest = path.join(OUTPUT_DIRS[0], iconConfig.filename);
    if (!force && fs.existsSync(firstDest)) {
      console.log(`\n⏩ [${i + 1}/${iconsToProcess.length}] Skipping existing: ${iconConfig.filename} (use --force to overwrite)`);
      results.push({
        name: iconConfig.name,
        file: iconConfig.filename,
        status: 'SUCCESS',
      });
      continue;
    }

    try {
      console.log(`\n⏳ [${i + 1}/${iconsToProcess.length}] Processing ${iconConfig.name}...`);
      const buffer = await generateIconAsset(iconConfig);

      // Save to all target directories (icons and sprites)
      for (const dir of OUTPUT_DIRS) {
        const filePath = path.join(dir, iconConfig.filename);
        fs.writeFileSync(filePath, buffer);
        console.log(`💾 Saved: ${filePath} (${buffer.length} bytes)`);
      }

      results.push({
        name: iconConfig.name,
        file: iconConfig.filename,
        status: 'SUCCESS',
      });

      // Cooldown delay for PixelLab API free tier concurrency limit
      if (i < iconsToProcess.length - 1) {
        console.log('⏳ Cooldown 7s for next generation...');
        await new Promise((resolve) => setTimeout(resolve, 7000));
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
  console.log('📊 Generation Summary');
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