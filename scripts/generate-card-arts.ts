import axios, { AxiosError } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const PIXELLAB_BASE_URL = process.env.PIXELLAB_BASE_URL || 'https://api.pixellab.ai/v2';
const PIXELLAB_API_KEY = process.env.PIXELLAB_API_KEY || 'dfc3fbff-e5b9-4f95-8c96-e08b43832b08';

const OUTPUT_DIRS = [
  path.resolve(__dirname, '../frontend/public/cards'),
  path.resolve(__dirname, '../frontend/public/sprites'),
];

interface CardArtConfig {
  id: string;
  category: string;
  filename: string;
  prompt: string;
}

export const CARD_ARTS: CardArtConfig[] = [
  {
    id: 'hr',
    category: 'Human Resources',
    filename: 'card-art-hr.png',
    prompt:
      '16-bit pixel art medieval fantasy trading card illustration, a grand guild hall reception with an honorable guildmaster shaking hands with a new adventurer recruit, signing a royal contract, warm candle light, crisp pixel edges, transparent background',
  },
  {
    id: 'contracts',
    category: 'Contracts',
    filename: 'card-art-contracts.png',
    prompt:
      '16-bit pixel art medieval fantasy trading card illustration, an ancient ornate enchanted parchment scroll bound with crimson wax seal and floating golden runes of law, quill and inkwell, crisp pixel edges, transparent background',
  },
  {
    id: 'finance',
    category: 'Finance',
    filename: 'card-art-finance.png',
    prompt:
      '16-bit pixel art medieval fantasy trading card illustration, a merchant bank vault brimming with glittering golden coins, glowing emerald ledger book, and gemstone scales of wealth, crisp pixel edges, transparent background',
  },
  {
    id: 'marketing',
    category: 'Marketing',
    filename: 'card-art-marketing.png',
    prompt:
      '16-bit pixel art medieval fantasy trading card illustration, a town square herald bard standing on a wooden podium blowing a horn to announce festival news to gathering villagers, crisp pixel edges, transparent background',
  },
  {
    id: 'corporate',
    category: 'Corporate',
    filename: 'card-art-corporate.png',
    prompt:
      '16-bit pixel art medieval fantasy trading card illustration, high council chamber of royal lords seated around a round carved stone strategy table with a glowing tactical map, crisp pixel edges, transparent background',
  },
  {
    id: 'logistics',
    category: 'Logistics',
    filename: 'card-art-logistics.png',
    prompt:
      '16-bit pixel art medieval fantasy trading card illustration, an armored merchant caravan wagon loaded with wooden treasure crates traveling across a cobbled stone trade road, crisp pixel edges, transparent background',
  },
  {
    id: 'manufacturing',
    category: 'Manufacturing',
    filename: 'card-art-manufacturing.png',
    prompt:
      '16-bit pixel art medieval fantasy trading card illustration, a master blacksmith dwarf forging a glowing runesword at an anvil with molten sparks and fiery furnace bellows, crisp pixel edges, transparent background',
  },
  {
    id: 'technology',
    category: 'Technology',
    filename: 'card-art-technology.png',
    prompt:
      '16-bit pixel art medieval fantasy trading card illustration, an arcane artificer workshop with glowing clockwork brass automatons, spinning mana orbs, and alchemical blueprints, crisp pixel edges, transparent background',
  },
  {
    id: 'customer',
    category: 'Customer Relations',
    filename: 'card-art-customer.png',
    prompt:
      '16-bit pixel art medieval fantasy trading card illustration, a friendly cozy tavern innkeeper smiling and serving a foaming mug to a weary armored paladin customer by the hearth fire, crisp pixel edges, transparent background',
  },
  {
    id: 'facilities',
    category: 'Facilities',
    filename: 'card-art-facilities.png',
    prompt:
      '16-bit pixel art medieval fantasy trading card illustration, grand royal castle architecture with towering stone ramparts, blue banner flags fluttering, and a fortified citadel bridge, crisp pixel edges, transparent background',
  },
  {
    id: 'hospitality',
    category: 'Hospitality',
    filename: 'card-art-hospitality.png',
    prompt:
      '16-bit pixel art medieval fantasy trading card illustration, a luxurious royal grand hotel reception desk, a polite concierge bellhop in crimson uniform handing a golden engraved room key to a traveling guest, warm chandelier glow, crisp pixel edges, transparent background',
  },
  {
    id: 'safety',
    category: 'Safety & Health',
    filename: 'card-art-safety.png',
    prompt:
      '16-bit pixel art medieval fantasy trading card illustration, a holy battle cleric field medic wearing white-silver armor with emerald cross emblem, holding a glowing red health potion vial and a protective divine aegis shield, healing sparkles, crisp pixel edges, transparent background',
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

async function generateCardArt(config: CardArtConfig, retries = 3): Promise<Buffer> {
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
      width: 64,
      height: 64,
    },
    no_background: true,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`\n🎨 [${config.filename}] Generating ${config.category} (64x64px)... (Attempt ${attempt}/${retries})`);
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

async function main() {
  console.log('=====================================================');
  console.log('🎮 CardCraft: 10 Fantasy Card Arts Generator (64x64)');
  console.log('=====================================================');
  console.log(`API Base URL: ${PIXELLAB_BASE_URL}`);

  for (const dir of OUTPUT_DIRS) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const args = process.argv.slice(2);
  const specificFileArg = args.find((a) => a.startsWith('--id=') || a.startsWith('--file='));
  const targetId = specificFileArg ? specificFileArg.split('=')[1] : null;

  const cardsToProcess = targetId
    ? CARD_ARTS.filter((c) => c.id === targetId || c.filename === targetId)
    : CARD_ARTS;

  console.log(`Found ${cardsToProcess.length} card arts to process.`);
  const results: { category: string; file: string; status: 'SUCCESS' | 'FAILED'; error?: string }[] = [];

  for (let i = 0; i < cardsToProcess.length; i++) {
    const cardConfig = cardsToProcess[i];
    const force = args.includes('--force');
    const firstDest = path.join(OUTPUT_DIRS[0], cardConfig.filename);

    if (!force && fs.existsSync(firstDest)) {
      console.log(`⏩ [${i + 1}/${cardsToProcess.length}] Skipping existing: ${cardConfig.filename}`);
      results.push({ category: cardConfig.category, file: cardConfig.filename, status: 'SUCCESS' });
      continue;
    }

    try {
      console.log(`\n⏳ [${i + 1}/${cardsToProcess.length}] Processing ${cardConfig.category}...`);
      const buffer = await generateCardArt(cardConfig);

      for (const dir of OUTPUT_DIRS) {
        const filePath = path.join(dir, cardConfig.filename);
        fs.writeFileSync(filePath, buffer);
        console.log(`💾 Saved: ${filePath} (${buffer.length} bytes)`);
      }

      results.push({ category: cardConfig.category, file: cardConfig.filename, status: 'SUCCESS' });

      if (i < cardsToProcess.length - 1) {
        console.log('⏳ Cooldown 7s for next generation...');
        await new Promise((resolve) => setTimeout(resolve, 7000));
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      results.push({ category: cardConfig.category, file: cardConfig.filename, status: 'FAILED', error: errMsg });
    }
  }

  console.log('\n=====================================================');
  console.log('📊 Card Arts Generation Summary');
  console.log('=====================================================');
  for (const res of results) {
    const symbol = res.status === 'SUCCESS' ? '✅' : '❌';
    console.log(`${symbol} ${res.category} -> ${res.file} [${res.status}]`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
