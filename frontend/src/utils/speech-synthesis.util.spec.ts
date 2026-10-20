import {
  speakEnglish,
  cancelSpeech,
  getBestEnglishVoice,
  getAvailableVoices,
} from './speech-synthesis.util';

describe('SpeechSynthesisUtil', () => {
  let mockSpeak: jest.Mock;
  let mockCancel: jest.Mock;

  beforeEach(() => {
    mockSpeak = jest.fn();
    mockCancel = jest.fn();

    const mockVoices: any[] = [
      { name: 'Microsoft David Desktop', lang: 'en-US' },
      { name: 'Microsoft Jenny Online (Natural) - English (United States)', lang: 'en-US' },
      { name: 'Google US English', lang: 'en-US' },
    ];

    (global as any).window = {
      speechSynthesis: {
        speak: mockSpeak,
        cancel: mockCancel,
        getVoices: jest.fn(() => mockVoices),
      },
    };

    (global as any).SpeechSynthesisUtterance = class {
      text: string;
      lang = '';
      rate = 1;
      pitch = 1;
      volume = 1;
      voice = null;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor(text: string) {
        this.text = text;
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('selects the most natural, human-like voice', () => {
    const voice = getBestEnglishVoice();
    expect(voice).toBeDefined();
    expect(voice?.name).toContain('Natural');
  });

  it('speaks text with calibrated human-like rate (0.82)', () => {
    let capturedUtterance: any;
    mockSpeak.mockImplementation((utterance) => {
      capturedUtterance = utterance;
      if (utterance.onend) utterance.onend();
    });

    const onEnd = jest.fn();
    const result = speakEnglish('Welcome to CardCraft.', { onEnd });

    expect(result).toBe(true);
    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
    expect(capturedUtterance.rate).toBe(0.82);
    expect(capturedUtterance.lang).toBe('en-US');
    expect(onEnd).toHaveBeenCalled();
  });

  it('cancels speech cleanly', () => {
    cancelSpeech();
    expect(mockCancel).toHaveBeenCalled();
  });
});
