// ============================================================================
// frontend/src/utils/pixellab.ts
// ยูทิลิตี้สำหรับเชื่อมต่อ Pixellab API เพื่อ Generate รูปภาพ Pixel Art & Icons
// รองรับการสร้าง Sprite, Item Badge, และ Boss Graphics สำหรับโปรเจกต์ CardCraft
// ============================================================================

export interface PixellabGenerateOptions {
  prompt: string;
  size?: '32x32' | '64x64' | '128x128';
  style?: 'pixel_art' | 'retro_rpg' | 'arcade_icon';
  transparentBackground?: boolean;
}

export interface PixellabGenerateResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * เรียกใช้งาน Pixellab API เพื่อ Generate ภาพ Pixel Art
 * สามารถกำหนด API Key ผ่าน process.env.PIXELLAB_API_KEY หรือส่งเข้ามาโดยตรง
 */
export async function generatePixelGraphic(
  options: PixellabGenerateOptions,
  apiKey?: string,
): Promise<PixellabGenerateResponse> {
  const resolvedKey =
    apiKey ||
    (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_PIXELLAB_API_KEY : undefined);

  if (!resolvedKey) {
    return {
      success: false,
      error:
        'Missing Pixellab API Key. กรุณากำหนด PIXELLAB_API_KEY ใน .env หรือส่ง apiKey มาในฟังก์ชันครับ',
    };
  }

  try {
    const response = await fetch('https://api.pixellab.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resolvedKey}`,
      },
      body: JSON.stringify({
        prompt: `${options.prompt}, 16-bit retro pixel art, crisp sharp pixels, game asset, neo-brutalist palette, no anti-aliasing`,
        resolution: options.size || '64x64',
        transparent: options.transparentBackground ?? true,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errData.message || `Pixellab API error status: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      imageUrl: data.image_url || data.url || data.output?.[0],
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error connecting to Pixellab API',
    };
  }
}

/**
 * ชุด Prompt มาตรฐานสำหรับ CardCraft RPG Assets
 */
export const CARDCRAFT_PIXEL_PROMPTS = {
  VOCAB_BLITZ: 'Arcade lightning thunder clock, speed hourglass, 16-bit golden pixel icon',
  BOSS_WYRM: 'Dark shadow void dragon wyrm boss, glowing crimson eyes, pixel rpg boss monster',
  COLLOCATION_RUSH: 'Two interlocking golden puzzle pieces, glowing blue rune energy, pixel icon',
  REALTIME_CLOCK: 'Stopwatch retro clock timer, pixel art, high contrast neon border',
  RUNE_KNIGHT_HELM: 'Paladin knight helmet with glowing gold visor, 16-bit RPG equip sprite',
};
