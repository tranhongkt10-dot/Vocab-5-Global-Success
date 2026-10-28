/**
 * Web Speech API helper for en-US pronunciation
 */

let cachedVoice: SpeechSynthesisVoice | null = null;

function loadVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  // Prefer natural English voices (Google US English, Samantha, Microsoft Zira, en-US)
  const enVoices = voices.filter(v => v.lang.startsWith('en'));
  const preferred = enVoices.find(v => 
    v.name.includes('Google') || 
    v.name.includes('Natural') || 
    v.name.includes('Samantha') || 
    v.lang === 'en-US'
  ) || enVoices[0] || null;

  cachedVoice = preferred;
  return preferred;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoice();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoice();
    };
  }
}

export function speakWord(text: string, rate: number = 0.9, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate; // 0.9 for natural, 0.65 for slow
    utterance.pitch = 1.05; // Slightly cheerful pitch for elementary kids

    const voice = cachedVoice || loadVoice();
    if (voice) {
      utterance.voice = voice;
    }

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis error:', err);
    if (onEnd) onEnd();
    return false;
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
