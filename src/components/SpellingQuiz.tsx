import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { VocabItem, UserProgress } from '../types';
import { speakWord } from '../utils/speech';
import { playCorrectSound, playWrongSound, playStreakCelebration } from '../utils/soundEffects';
import {
  Sparkles,
  RotateCcw,
  Volume2,
  CheckCircle2,
  XCircle,
  Flame,
  ArrowRight,
  HelpCircle,
  Trophy,
} from 'lucide-react';

interface SpellingQuizProps {
  words: VocabItem[];
  progress: UserProgress;
  onUpdateScore: (scoreDelta: number, newStreak: number) => void;
  onAskAI: (word: VocabItem) => void;
}

export const SpellingQuiz: React.FC<SpellingQuizProps> = ({
  words,
  progress,
  onUpdateScore,
  onAskAI,
}) => {
  const [mode, setMode] = useState<'missing_letter' | 'scrambled'>('missing_letter');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');

  // Filtered quiz pool
  const quizWords = useMemo(() => {
    let pool = words;
    if (selectedUnit !== 'all') {
      pool = words.filter((w) => w.unit === selectedUnit);
    }
    // Shuffle pool for excitement
    return [...pool].sort(() => 0.5 - Math.random());
  }, [words, selectedUnit]);

  const currentWord = quizWords[currentIndex % (quizWords.length || 1)];

  // Mode A: Missing letter state
  const [missingIndex, setMissingIndex] = useState<number>(0);
  const [missingOptions, setMissingOptions] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Mode B: Scrambled word state
  const [scrambledLetters, setScrambledLetters] = useState<{ char: string; id: number }[]>([]);
  const [userLetters, setUserLetters] = useState<{ char: string; id: number }[]>([]);
  const [typedInput, setTypedInput] = useState('');

  // Answer status: null | 'correct' | 'wrong'
  const [status, setStatus] = useState<'correct' | 'wrong' | null>(null);

  // Initialize question for currentWord & mode
  const setupQuestion = useCallback(() => {
    if (!currentWord) return;
    setStatus(null);
    setSelectedLetter(null);
    setUserLetters([]);
    setTypedInput('');

    const wordClean = currentWord.word.toLowerCase();

    if (mode === 'missing_letter') {
      // Pick a random index (vowel or consonant)
      const validIndices = [];
      for (let i = 0; i < wordClean.length; i++) {
        if (/[a-z]/i.test(wordClean[i])) validIndices.push(i);
      }
      const targetIdx = validIndices.length > 0
        ? validIndices[Math.floor(Math.random() * validIndices.length)]
        : 0;
      setMissingIndex(targetIdx);

      const correctChar = wordClean[targetIdx];
      // Generate 4 plausible options
      const alphabet = 'abcdefghijklmnopqrstuvwxyz';
      const optionsSet = new Set<string>([correctChar]);
      while (optionsSet.size < 4) {
        const rand = alphabet[Math.floor(Math.random() * alphabet.length)];
        optionsSet.add(rand);
      }
      setMissingOptions(Array.from(optionsSet).sort(() => 0.5 - Math.random()));
    } else {
      // Scrambled mode
      const letters = wordClean.split('').map((char, id) => ({ char, id }));
      // Ensure it is actually scrambled
      let shuffled = [...letters].sort(() => 0.5 - Math.random());
      if (shuffled.map((l) => l.char).join('') === wordClean && wordClean.length > 2) {
        shuffled = [...letters].reverse();
      }
      setScrambledLetters(shuffled);
    }
  }, [currentWord, mode]);

  useEffect(() => {
    setupQuestion();
  }, [setupQuestion]);

  // Mode A: check chosen letter
  const handlePickLetter = (letter: string) => {
    if (status !== null || !currentWord) return;
    setSelectedLetter(letter);

    const correctChar = currentWord.word.toLowerCase()[missingIndex];
    if (letter.toLowerCase() === correctChar) {
      handleSuccess();
    } else {
      handleFailure();
    }
  };

  // Mode B: click scrambled tile
  const handleSelectTile = (tile: { char: string; id: number }) => {
    if (status !== null) return;
    setUserLetters((prev) => [...prev, tile]);
    setScrambledLetters((prev) => prev.filter((t) => t.id !== tile.id));
  };

  const handleRemoveTile = (tile: { char: string; id: number }) => {
    if (status !== null) return;
    setUserLetters((prev) => prev.filter((t) => t.id !== tile.id));
    setScrambledLetters((prev) => [...prev, tile]);
  };

  // Check Mode B answer (either by assembled tiles or typed string)
  const handleCheckScramble = () => {
    if (status !== null || !currentWord) return;

    const target = currentWord.word.toLowerCase().trim();
    const assembled = (
      userLetters.length > 0 ? userLetters.map((l) => l.char).join('') : typedInput
    ).toLowerCase().trim();

    if (assembled === target) {
      handleSuccess();
    } else {
      handleFailure();
    }
  };

  const handleSuccess = () => {
    setStatus('correct');
    const newStreak = streak + 1;
    setStreak(newStreak);
    setScore((s) => s + 10);
    playCorrectSound();
    if (newStreak % 5 === 0) {
      playStreakCelebration();
    }
    onUpdateScore(10, newStreak);
    // Speak word so student hears correct pronunciation
    if (currentWord) {
      speakWord(currentWord.word, 0.9);
    }
  };

  const handleFailure = () => {
    setStatus('wrong');
    setStreak(0);
    playWrongSound();
    onUpdateScore(0, 0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  if (!currentWord) {
    return <div className="text-center p-8 bg-white rounded-2xl">Đang chuẩn bị câu hỏi...</div>;
  }

  // Display masked word for Mode A
  const wordLetters = currentWord.word.split('');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Top Controls & Mode Switcher */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setMode('missing_letter')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'missing_letter'
                ? 'bg-white text-[#1E3A8A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            A. Điền chữ cái còn thiếu
          </button>
          <button
            onClick={() => setMode('scrambled')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'scrambled'
                ? 'bg-white text-[#1E3A8A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            B. Sắp xếp lại từ xáo trộn
          </button>
        </div>

        {/* Score & Streak Counters */}
        <div className="flex items-center gap-3 text-xs font-extrabold w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Điểm: <span className="tabular-nums text-sm">{score}</span></span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-100">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Chuỗi: <span className="tabular-nums text-sm">{streak}</span></span>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 text-center space-y-6 relative overflow-hidden">
        {/* Unit & Clue Header */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold text-[#1E3A8A]">Unit {currentWord.unit}</span>
          <span className="text-slate-400">Câu hỏi số {currentIndex + 1}</span>
        </div>

        {/* Vietnamese Meaning Clue (Pink) */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Gợi ý nghĩa tiếng Việt:
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#EC4899] font-['Plus_Jakarta_Sans',sans-serif]">
            {currentWord.meaning_vi}
          </h2>
          <div className="text-xs text-slate-400 font-mono mt-1">
            {currentWord.ipa} ({currentWord.pos})
          </div>
        </div>

        {/* Audio helper button */}
        <div className="flex justify-center">
          <button
            onClick={() => speakWord(currentWord.word, 0.9)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-[#1E3A8A] text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-[#EC4899]" />
            <span>Nghe phát âm gợi ý</span>
          </button>
        </div>

        {/* MODE A: MISSING LETTER */}
        {mode === 'missing_letter' && (
          <div className="space-y-6">
            {/* Word Display with Missing Slot */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              {wordLetters.map((char, idx) => {
                const isTarget = idx === missingIndex;
                if (!isTarget) {
                  return (
                    <span
                      key={idx}
                      className="w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center text-2xl sm:text-3xl font-black text-[#1E3A8A] bg-slate-50 border-2 border-slate-200 rounded-2xl font-mono uppercase"
                    >
                      {char}
                    </span>
                  );
                }

                return (
                  <span
                    key={idx}
                    className={`w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center text-2xl sm:text-3xl font-black rounded-2xl font-mono uppercase transition-all ${
                      status === 'correct'
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-400 scale-105'
                        : status === 'wrong'
                        ? 'bg-rose-100 text-rose-700 border-2 border-rose-400 animate-shake'
                        : 'bg-pink-50 text-[#EC4899] border-2 border-dashed border-[#EC4899] animate-pulse'
                    }`}
                  >
                    {selectedLetter || '?'}
                  </span>
                );
              })}
            </div>

            {/* Choices for Missing Letter */}
            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
              {missingOptions.map((letter) => {
                const isSelected = selectedLetter === letter;
                const isCorrect = letter.toLowerCase() === currentWord.word.toLowerCase()[missingIndex];

                let btnStyle = 'bg-slate-50 text-[#1E3A8A] border border-slate-200 hover:bg-blue-50 hover:border-blue-300';
                if (status === 'correct' && isCorrect) {
                  btnStyle = 'bg-emerald-500 text-white border-emerald-500 shadow-sm';
                } else if (status === 'wrong' && isSelected) {
                  btnStyle = 'bg-rose-500 text-white border-rose-500 shadow-sm';
                }

                return (
                  <button
                    key={letter}
                    disabled={status !== null}
                    onClick={() => handlePickLetter(letter)}
                    className={`h-14 text-2xl font-black uppercase rounded-2xl transition-all active:scale-95 disabled:cursor-not-allowed ${btnStyle}`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE B: SCRAMBLED WORD */}
        {mode === 'scrambled' && (
          <div className="space-y-6">
            {/* User Assembled Slots */}
            <div className="min-h-16 flex items-center justify-center gap-2 flex-wrap p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              {userLetters.length === 0 ? (
                <span className="text-xs text-slate-400 font-medium">
                  Chạm vào các chữ cái bên dưới hoặc gõ trực tiếp từ đúng
                </span>
              ) : (
                userLetters.map((tile) => (
                  <button
                    key={tile.id}
                    disabled={status !== null}
                    onClick={() => handleRemoveTile(tile)}
                    className="w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-black text-[#1E3A8A] bg-white border-2 border-blue-200 rounded-2xl shadow-xs hover:border-pink-300 transition-all uppercase"
                  >
                    {tile.char}
                  </button>
                ))
              )}
            </div>

            {/* Scrambled Available Letters */}
            {scrambledLetters.length > 0 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {scrambledLetters.map((tile) => (
                  <button
                    key={tile.id}
                    disabled={status !== null}
                    onClick={() => handleSelectTile(tile)}
                    className="w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-black text-[#1E3A8A] bg-blue-50/80 border-2 border-blue-200 rounded-2xl shadow-xs hover:bg-[#1E3A8A] hover:text-white transition-all active:scale-95 uppercase"
                  >
                    {tile.char}
                  </button>
                ))}
              </div>
            )}

            {/* Alternative Keyboard Input */}
            <div className="flex items-center gap-2 max-w-sm mx-auto">
              <input
                type="text"
                disabled={status !== null}
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCheckScramble();
                }}
                placeholder="Hoặc gõ từ tại đây..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm font-bold uppercase tracking-wider text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
              />
              <button
                disabled={status !== null || (userLetters.length === 0 && !typedInput.trim())}
                onClick={handleCheckScramble}
                className="px-4 py-2.5 bg-[#1E3A8A] text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-40"
              >
                Kiểm tra
              </button>
            </div>
          </div>
        )}

        {/* Feedback Banner */}
        {status && (
          <div
            className={`p-4 rounded-2xl border text-sm animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-3 ${
              status === 'correct'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2.5 text-left">
              {status === 'correct' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div>
                <span className="font-extrabold block">
                  {status === 'correct' ? '🎉 Chính xác rồi! Em giỏi lắm!' : 'Chưa đúng rồi! Cố gắng câu sau nhé!'}
                </span>
                <span className="text-xs">
                  Từ đúng là: <strong className="font-mono uppercase">{currentWord.word}</strong> — "{currentWord.example_en}"
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onAskAI(currentWord)}
                className="px-3 py-1.5 bg-white text-xs font-bold rounded-xl border border-slate-200 text-[#1E3A8A] hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>Hỏi AI mẹo nhớ</span>
              </button>

              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[#1E3A8A] text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-1.5"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
