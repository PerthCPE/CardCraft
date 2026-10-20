// ============================================================================
// frontend/src/utils/speech-synthesis.util.ts
// CardCraft Natural Human-like English Speech Synthesis Engine
// - Calibrated speech rate (0.82) to mimic natural human cadence for TOEIC learning
// - Selects best available high-fidelity natural/neural voice (e.g. Google, Natural, Jenny, Guy, Samantha)
// - Handles punctuation pacing, voice loading, and clean playback cancellation
// ============================================================================

export interface SpeakOptions {
  rate?: number; // Default: 0.82 (calm, clear human cadence; lowered from 0.92)
  pitch?: number; // Default: 1.0
  volume?: number; // Default: 1.0
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

/**
 * Retrieve and cache available browser voices, prioritizing human-like natural voices.
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

/**
 * Pick the best, most human-sounding English voice available on the user's OS/browser.
 */
export function getBestEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  // 1. High-fidelity Natural / Neural English Voices (Edge, Chrome, Safari, iOS, macOS)
  const naturalKeywords = [
    'natural',
    'online',
    'neural',
    'google us english',
    'jenny',
    'guy',
    'aria',
    'samantha',
    'ava',
    'serena',
    'allison',
  ];

  for (const kw of naturalKeywords) {
    const match = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('en') &&
        v.name.toLowerCase().includes(kw),
    );
    if (match) return match;
  }

  // 2. Any en-US voice
  const enUSVoice = voices.find(
    (v) => v.lang.replace('_', '-').toLowerCase() === 'en-us',
  );
  if (enUSVoice) return enUSVoice;

  // 3. Any English voice
  const anyEnglish = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
  if (anyEnglish) return anyEnglish;

  return voices[0] || null;
}

// Pre-load voices on browser ready
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getAvailableVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    getAvailableVoices();
  };
}

/**
 * Speak English text with a natural, human-like cadence and speed.
 */
export function speakEnglish(text: string, options?: SpeakOptions): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onError?.();
    return false;
  }

  // Cancel any previous audio immediately
  window.speechSynthesis.cancel();

  // Natural punctuation formatting: ensure pauses between question parts or statements
  const formattedText = text
    .replace(/\s*\.\.\.\s*/g, '. ')
    .replace(/\s*;\s*/g, '; ')
    .trim();

  if (!formattedText) {
    options?.onEnd?.();
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(formattedText);
  utterance.lang = 'en-US';

  // Rate: lowered to 0.82 (from 0.92/0.95) for clear, comfortable human enunciation
  utterance.rate = options?.rate ?? 0.82;
  utterance.pitch = options?.pitch ?? 1.0;
  utterance.volume = options?.volume ?? 1.0;

  const bestVoice = getBestEnglishVoice();
  if (bestVoice) {
    utterance.voice = bestVoice;
  }

  utterance.onstart = () => {
    options?.onStart?.();
  };

  utterance.onend = () => {
    options?.onEnd?.();
  };

  utterance.onerror = (e) => {
    // Interrupted speech cancel is not an error
    if (e.error !== 'interrupted' && e.error !== 'canceled') {
      console.warn('SpeechSynthesis error:', e.error);
    }
    options?.onError?.();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Cancel any ongoing speech synthesis playback.
 */
export function cancelSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
