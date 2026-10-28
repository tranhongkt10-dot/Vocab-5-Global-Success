export interface VocabItem {
  id: string;
  unit: number;
  word: string;
  pos: string;
  ipa: string;
  meaning_vi: string;
  example_en: string;
  example_vi: string;
}

export interface PronunciationRule {
  sound: string;
  rule: string;
  examples: string;
}

export interface PronunciationTheory {
  id: string;
  title: string;
  rules: PronunciationRule[];
}

export interface PronunciationQuiz {
  id: string;
  type: 'es_quiz' | 'ed_quiz' | 'stress_quiz';
  question: string;
  options: string[];
  answer: string;
  explain?: string;
}

export interface UserProgress {
  learnedWordIds: string[];
  bookmarkedWordIds: string[];
  spellingScore: number;
  listeningScore: number;
  meaningScore: number;
  pronunciationScore: number;
  currentStreak: number;
  bestStreak: number;
}

export type ActiveNavTab = 'vocab' | 'spelling' | 'listening' | 'meaning' | 'pronunciation';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  wordContext?: VocabItem;
}
