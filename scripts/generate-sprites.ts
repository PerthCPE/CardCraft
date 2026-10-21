import axios, { AxiosError } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// PixelLab API Configuration
const PIXELLAB_BASE_URL = process.env.PIXELLAB_BASE_URL || 'https://api.pixellab.ai/v2';
const PIXELLAB_API_KEY = process.env.PIXELLAB_API_KEY || '123a5bcc-2996-4583-a502-d45ca0a0734c';
const OUTPUT_DIR = path.resolve(__dirname, '../frontend/public/sprites');

interface CharacterTierConfig {
  tier: number;
  name: string;
  scoreRange: string;
  filename: string;
  aliasFilename: string;
  prompt: string;
}

// ============================================================================
// Hero's Evolution Design DNA (Medieval High-Fantasy RPG)
// Base Anchor: Young swordsman hero with messy silver-blond hair, resolute blue eyes,
// south-facing heroic 3/4 battle stance, crisp pixel edges, transparent background,
// highly detailed Octopath Traveler / Golden Sun aesthetic.
// ============================================================================
const CHARACTER_TIERS: CharacterTierConfig[] = [
  {
    tier: 1,
    name: 'Wandering Page',
    scoreRange: '0 – 245 คะแนน',
    filename: 'tier-1-novice.png',
    aliasFilename: 'tier-1.png',
    prompt:
      '16-bit pixel art medieval fantasy RPG character sprite, same young swordsman hero with messy silver-blond hair and resolute blue eyes, south-facing heroic battle stance, wearing humble brown traveler linen tunic with leather arm bracers and worn sturdy leather boots, holding a rustic wooden practice sword in right hand and a small leather-bound spellbook in left hand, tiny magical dust particles floating around, crisp pixel edges, transparent background, highly detailed octopath traveler style',
  },
  {
    tier: 2,
    name: 'Rune Scout',
    scoreRange: '250 – 395 คะแนน (+150)',
    filename: 'tier-2-scout.png',
    aliasFilename: 'tier-2.png',
    prompt:
      '16-bit pixel art medieval fantasy RPG character sprite, same young swordsman hero with messy silver-blond hair and resolute blue eyes, south-facing heroic battle stance, wearing reinforced boiled leather scout armor with navy cloth lining and steel knee guards, short emerald green hooded capelet, wielding a sharp polished steel shortsword in right hand and a glowing parchment card scroll in left hand, subtle cyan wind aura swirl around boots, crisp pixel edges, transparent background, highly detailed octopath traveler style',
  },
  {
    tier: 3,
    name: 'Spell Squire',
    scoreRange: '400 – 595 คะแนน (+200)',
    filename: 'tier-3-squire.png',
    aliasFilename: 'tier-3.png',
    prompt:
      '16-bit pixel art medieval fantasy RPG character sprite, same young swordsman hero with messy silver-blond hair and resolute blue eyes, south-facing heroic battle stance, wearing gleaming polished iron knight chestplate, steel gauntlets, and a royal blue velvet cape, wielding a sharp steel arming sword glowing with blue mana runes in right hand, holding an open floating ancient grimoire with a levitating blue spell card in left hand, rising mana spark vapor, crisp pixel edges, transparent background, highly detailed octopath traveler style',
  },
  {
    tier: 4,
    name: 'Rune Vanguard',
    scoreRange: '600 – 695 คะแนน (+100 - หน้าด่านก่อน 700)',
    filename: 'tier-4-knight.png',
    aliasFilename: 'tier-4.png',
    prompt:
      '16-bit pixel art medieval fantasy RPG character sprite, same young swordsman hero with messy silver-blond hair and resolute blue eyes, south-facing heroic battle stance, wearing ornate silver and indigo knight plate armor intricately etched with glowing cyan power runes, billowing royal blue cape, wielding a majestic rune broadsword enveloped in crackling cyan lightning energy, three floating glowing magic rune cards orbiting around, radiant blue shockwave particle aura, crisp pixel edges, transparent background, highly detailed octopath traveler style',
  },
  {
    tier: 5,
    name: 'High Paladin (Goal 700+)',
    scoreRange: '700 – 795 คะแนน (+100 - 🎯 เป้าหมาย 700+)',
    filename: 'tier-5-paladin.png',
    aliasFilename: 'tier-5.png',
    prompt:
      '16-bit pixel art medieval fantasy RPG character sprite, same young swordsman hero with messy silver-blond hair and resolute blue eyes, south-facing victorious battle stance, wearing radiant white-gold paladin plate armor with emerald gemstone inlays, magnificent royal emerald-green velvet cape trimmed with golden embroidery, wielding a dazzling golden holy excalibur sword in right hand, ornate golden lion crest aegis shield in left hand, four glowing golden magic cards floating around, pillar of brilliant golden holy light rays bursting at feet, crisp pixel edges, transparent background, highly detailed octopath traveler style',
  },
  {
    tier: 6,
    name: 'Grand Astral Archon',
    scoreRange: '800 – 895 คะแนน (+100)',
    filename: 'tier-6-archmage.png',
    aliasFilename: 'tier-6.png',
    prompt:
      '16-bit pixel art medieval fantasy RPG character sprite, same young swordsman hero with messy silver-blond hair and resolute blue eyes, transcendent expression, hovering levitating slightly above ground in south-facing majestic battle stance, wearing mythical midnight-blue and royal gold celestial knight plate armor, dramatic flowing dual-layered cape, wielding a blazing crystalline cosmic rune blade in right hand, an intricate spinning golden magical summoning circle and six radiant floating spell cards orbiting behind his back, cosmic star stardust sparkles, crisp pixel edges, transparent background, highly detailed octopath traveler style',
  },
  {
    tier: 7,
    name: 'CardCraft Sovereign Deity',
    scoreRange: '900 – 990 คะแนน (+100 - ร่างเทพสูงสุด)',
    filename: 'tier-7-deity.png',
    aliasFilename: 'tier-7.png',
    prompt:
      '16-bit pixel art medieval fantasy RPG character sprite, supreme ascended deity of knowledge, same young swordsman hero ascended to godhood with radiant silver-blond hair, levitating high above ground in majestic south-facing sovereign stance, wearing ornate sacred gold and polished white-diamond plate armor with glowing cyan runes, royal white cape with gold embroidery, massive majestic glowing pixel archangel wings made of golden celestial light unfurled from back, radiant sunburst halo orbiting with eight glowing golden magic spell cards and cosmic star particles, holding a magnificent glowing divine holy sword crackling with golden light beams in right hand, glowing celestial aegis shield in left hand, swirling holy golden victory aura around feet, ultimate max-level god tier, crisp pixel edges, transparent background, highly detailed octopath traveler style',
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
async function generateCharacterSprite(config: CharacterTierConfig, retries = 3): Promise<Buffer> {
  const client = axios.create({
    baseURL: PIXELLAB_BASE_URL,
    headers: {
      Authorization: `Bearer ${PIXELLAB_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 300000, // 5 minutes timeout for image generation
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

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`\n🎨 [Tier ${config.tier}] Generating ${config.name}... (Attempt ${attempt}/${retries})`);
      console.log(`   Prompt: "${config.prompt.substring(0, 85)}..."`);

      const response = await client.post<PixelLabImageResponse>('/create-image-pixen', requestBody);

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

      if (attempt < retries) {
        const isConcurrency = errorMsg.includes('concurrent');
        const waitMs = isConcurrency ? 10000 : 6000;
        console.log(`⏳ Waiting ${waitMs / 1000} seconds before retrying...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      } else {
        throw new Error(`Failed to generate Tier ${config.tier} sprite after ${retries} attempts: ${errorMsg}`);
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
  console.log('⚔️  CardCraft: Hero\'s Evolution 7-Tier Character Generator');
  console.log('=====================================================');
  console.log(`Target directory: ${OUTPUT_DIR}`);
  console.log(`API Base URL:     ${PIXELLAB_BASE_URL}`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(`📁 Creating directory: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

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

  for (let i = 0; i < tiersToProcess.length; i++) {
    const tierConfig = tiersToProcess[i];
    const primaryFilePath = path.join(OUTPUT_DIR, tierConfig.filename);
    const aliasFilePath = path.join(OUTPUT_DIR, tierConfig.aliasFilename);

    try {
      const buffer = await generateCharacterSprite(tierConfig);

      fs.writeFileSync(primaryFilePath, buffer);
      console.log(`💾 Saved: ${primaryFilePath} (${buffer.length} bytes)`);

      fs.writeFileSync(aliasFilePath, buffer);
      console.log(`💾 Saved Alias: ${aliasFilePath}`);

      results.push({
        tier: tierConfig.tier,
        name: tierConfig.name,
        file: tierConfig.filename,
        status: 'SUCCESS',
      });

      if (i < tiersToProcess.length - 1) {
        console.log('⏳ Cooldown 8s for next generation...');
        await new Promise((resolve) => setTimeout(resolve, 8000));
      }
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

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
