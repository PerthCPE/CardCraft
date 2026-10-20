import axios, { AxiosError } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// PixelLab API Configuration
const PIXELLAB_BASE_URL = process.env.PIXELLAB_BASE_URL || 'https://api.pixellab.ai/v2';
const PIXELLAB_API_KEY = process.env.PIXELLAB_API_KEY || 'dfc3fbff-e5b9-4f95-8c96-e08b43832b08';
const OUTPUT_DIR = path.resolve(__dirname, '../frontend/public/sprites');

interface CharacterTierConfig {
  tier: number;
  name: string;
  scoreRange: string;
  filename: string;
  aliasFilename: string;
  prompt: string;
}

const CHARACTER_TIERS: CharacterTierConfig[] = [
  // {
  //   tier: 1,
  //   name: 'Novice Villager',
  //   scoreRange: '0 – 245 คะแนน',
  //   filename: 'tier-1-novice.png',
  //   aliasFilename: 'tier-1.png',
  //   prompt:
  //     '16-bit pixel art medieval RPG sprite, young male knight with messy blond hair, determined expression, standing south-facing idle battle stance, wearing simple brown peasant linen tunic, leather arm guards, plain brown boots, holding a rustic wooden sword in right hand and a small worn dictionary booklet in left hand, clean silhouette, no magic effects, transparent background, crisp pixel edges',
  // },
  // {
  //   tier: 2,
  //   name: 'Word Scout',
  //   scoreRange: '250 – 395 คะแนน (+150)',
  //   filename: 'tier-2-scout.png',
  //   aliasFilename: 'tier-2.png',
  //   prompt:
  //     '16-bit pixel art medieval RPG sprite, same young male knight with messy blond hair, determined expression, standing south-facing idle battle stance, upgraded to reinforced boiled leather armor with navy blue cloth lining, studded leather boots, holding a polished iron shortsword in right hand and a glowing parchment card scroll in left hand, faint blue spark particles, transparent background, crisp pixel edges',
  // },
  // {
  //   tier: 3,
  //   name: 'Spell Squire',
  //   scoreRange: '400 – 595 คะแนน (+200)',
  //   filename: 'tier-3-squire.png',
  //   aliasFilename: 'tier-3.png',
  //   prompt:
  //     '16-bit pixel art medieval RPG sprite, same young male knight with messy blond hair, determined expression, standing south-facing idle battle stance, wearing polished steel chestplate armor, steel gauntlets, and a short royal blue cape, holding a gleaming steel longsword in right hand and a floating glowing blue spell card in left hand, swirling mana vapor aura around feet, transparent background, crisp pixel edges',
  // },
  // {
  //   tier: 4,
  //   name: 'Rune Knight',
  //   scoreRange: '600 – 695 คะแนน (+100 - หน้าด่านก่อน 700)',
  //   filename: 'tier-4-knight.png',
  //   aliasFilename: 'tier-4.png',
  //   prompt:
  //     '16-bit pixel art medieval RPG sprite, same young male knight with messy blond hair, determined expression, standing south-facing idle battle stance, wearing full ornate silver knight plate armor engraved with glowing cyan runes, flowing royal blue cape, holding a massive rune-carved broadsword glowing with electric blue energy in right hand, three floating glowing rune cards orbiting left hand, intense glowing blue particle aura, transparent background, crisp pixel edges',
  // },
  // {
  //   tier: 5,
  //   name: 'High Paladin (Goal 700+)',
  //   scoreRange: '700 – 795 คะแนน (+100 - 🎯 เป้าหมาย 700+)',
  //   filename: 'tier-5-paladin.png',
  //   aliasFilename: 'tier-5.png',
  //   prompt:
  //     '16-bit pixel art medieval RPG sprite, same young male knight with messy blond hair, triumphant heroic expression, standing south-facing idle battle stance, wearing shining white-gold paladin plate armor, majestic emerald-green royal velvet cape with gold trims, holding a glowing golden holy grandsword in right hand, four radiant golden cards hovering around left hand, vibrant emerald green and gold victory aura radiating from beneath feet, transparent background, crisp pixel edges',
  // },
  // {
  //   tier: 6,
  //   name: 'Grand Archon',
  //   scoreRange: '800 – 895 คะแนน (+100)',
  //   filename: 'tier-6-archmage.png',
  //   aliasFilename: 'tier-6.png',
  //   prompt:
  //     '16-bit pixel art medieval RPG sprite, same young male knight with messy blond hair, transcendent expression, hovering slightly above ground in south-facing battle stance, wearing intricate gold and midnight-blue enchanted celestial plate armor, dramatic flowing dual-layered cape, holding a crystalline energy blade in right hand, a spinning circular ring of six radiant spell cards and an intricate glowing golden magic circle behind his back, bursting holy light rays, transparent background, crisp pixel edges',
  // },
  {
    tier: 7,
    name: 'CardCraft Deity',
    scoreRange: '900 – 990 คะแนน (+100 - ร่างเทพสูงสุด)',
    filename: 'tier-7-deity.png',
    aliasFilename: 'tier-7.png',
    prompt:
      '16-bit pixel art medieval fantasy RPG character sprite, supreme ascended deity of knowledge, legendary grand sovereign knight levitating above ground in south-facing majestic battle stance, wearing ornate sacred gold and polished white-diamond plate armor with glowing cyan runes, dramatic flowing royal white cape with gold embroidery, massive majestic glowing pixel archangel wings made of golden celestial light unfurled from back, radiant sunburst halo orbiting with eight glowing golden magic spell cards and cosmic star particles, holding a magnificent glowing divine holy sword crackling with golden light beams in right hand, glowing celestial aegis shield in left hand, swirling holy golden victory aura around feet, ultimate max-level god tier, crisp pixel edges, transparent background, highly detailed octopath traveler style',
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
 * Generate a single character sprite using PixelLab API
 */
async function generateCharacterSprite(config: CharacterTierConfig, retries = 2): Promise<Buffer> {
  const client = axios.create({
    baseURL: PIXELLAB_BASE_URL,
    headers: {
      Authorization: `Bearer ${PIXELLAB_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 300000, // 3 minutes timeout for image generation
  });

  const requestBody: Record<string, unknown> = {
    description: config.prompt,
    image_size: {
      width: 128,
      height: 128,
    },
    no_background: true,
    detail: 'highly detailed',
  };

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      console.log(`\n🎨 [Tier ${config.tier}] Generating ${config.name}... (Attempt ${attempt}/${retries + 1})`);
      console.log(`   Prompt: "${config.prompt.substring(0, 80)}..."`);

      const endpoint = requestBody.init_image ? '/create-image-pixflux' : '/create-image-pixen';
      console.log(`   Calling endpoint: ${endpoint}`);
      const response = await client.post<PixelLabImageResponse>(endpoint, requestBody);

      if (response.data?.image?.base64) {
        const imageBuffer = Buffer.from(response.data.image.base64, 'base64');
        return imageBuffer;
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
      const error = err as AxiosError<{ message?: string; detail?: unknown }>;
      const errorMsg = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message || String(error);

      console.error(`❌ [Tier ${config.tier}] Attempt ${attempt} failed: ${errorMsg}`);

      if (attempt <= retries) {
        console.log(`⏳ Waiting 10 seconds before retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
      } else {
        throw new Error(`Failed to generate Tier ${config.tier} sprite after ${retries + 1} attempts: ${errorMsg}`);
      }
    }
  }

  throw new Error(`Unreachable state for Tier ${config.tier}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('=====================================================');
  console.log('🎮 CardCraft: PixelLab Character Sprite Generator');
  console.log('=====================================================');
  console.log(`Target directory: ${OUTPUT_DIR}`);
  console.log(`API Base URL:     ${PIXELLAB_BASE_URL}`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(`📁 Creating directory: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Parse optional command line args (e.g., --tier=1 or --force)
  const args = process.argv.slice(2);
  const specificTierArg = args.find((a) => a.startsWith('--tier='));
  const targetTier = specificTierArg ? parseInt(specificTierArg.split('=')[1], 10) : null;

  const tiersToProcess = targetTier
    ? CHARACTER_TIERS.filter((t) => t.tier === targetTier)
    : CHARACTER_TIERS;

  if (tiersToProcess.length === 0) {
    console.error(`⚠️ No valid tier found matching criteria.`);
    process.exit(1);
  }

  const results: { tier: number; name: string; file: string; status: 'SUCCESS' | 'FAILED'; error?: string }[] = [];

  for (const tierConfig of tiersToProcess) {
    const primaryFilePath = path.join(OUTPUT_DIR, tierConfig.filename);
    const aliasFilePath = path.join(OUTPUT_DIR, tierConfig.aliasFilename);

    try {
      const buffer = await generateCharacterSprite(tierConfig);

      // Save primary file (e.g. tier-1-novice.png)
      fs.writeFileSync(primaryFilePath, buffer);
      console.log(`💾 Saved: ${primaryFilePath} (${buffer.length} bytes)`);

      // Save alias file (e.g. tier-1.png)
      fs.writeFileSync(aliasFilePath, buffer);
      console.log(`💾 Saved Alias: ${aliasFilePath}`);

      results.push({
        tier: tierConfig.tier,
        name: tierConfig.name,
        file: tierConfig.filename,
        status: 'SUCCESS',
      });

      // Cooldown delay for PixelLab API concurrency limit
      console.log('⏳ Cooldown 6s for next generation...');
      await new Promise((resolve) => setTimeout(resolve, 6000));
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      results.push({
        tier: tierConfig.tier,
        name: tierConfig.name,
        file: tierConfig.filename,
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
    console.log(`${symbol} Tier ${res.tier} [${res.name}]: ${res.status} -> ${res.file}`);
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
