import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { VocabItem, UserProgress } from '../types';
import { speakWord } from '../utils/speech';
import { playCorrectSound, playWrongSound, playStreakCelebration } from '../utils/soundEffects';
import {
  Volume2,
  Volume1,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  Flame,
  ArrowRight,
  Headphones,
  Sparkles,
} from 'lucide-react';

interface ListeningQuizProps {
  words: VocabItem[];
  progress: UserProgress;
  onUpdateScore: (scoreDelta: number, newStreak: number) => void;
  onAskAI: (word: VocabItem) => void;
}

export const ListeningQuiz: React.FC<ListeningQuizProps> = ({
  words,
  progress,
  onUpdateScore,
  onAskAI,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [status, setStatus] = useState<'correct' | 'wrong' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [playSpeed, setPlaySpeed] = useState<'normal' | 'slow'>('normal');

  // Shuffle quiz questions
  const quizPool = useMemo(() => {
    return [...words].sort(() => 0.5 - Math.random());
  }, [words]);

  const currentWord = quizPool[currentIndex % (quizPool.length || 1)];

  // Generate 4 word options (1 correct + 3 plausible distractors)
  const options = useMemo(() => {
    if (!currentWord) return [];
    const set = new Set<string>([currentWord.word]);
    const remaining = words.filter((w) => w.word !== currentWord.word);
    const shuffledRemaining = [...remaining].sort(() => 0.5 - Math.random());

    for (const item of shuffledRemaining) {
      if (set.size >= 4) break;
      set.add(item.word);
    }
    return Array.from(set).sort(() => 0.5 - Math.random());
  }, [currentWord, words]);

  const playAudio = useCallback((speedOverride?: 'normal' | 'slow') => {
    if (!currentWord) return;
    setIsPlaying(true);
    const rate = (speedOverride || playSpeed) === 'slow' ? 0.65 : 0.88;
    speakWord(currentWord.word, rate, () => {
      setIsPlaying(false);
    });
  }, [currentWord, playSpeed]);

  // When question changes, reset selection and auto play the audio
  useEffect(() => {
    setStatus(null);
    setSelectedWord(null);
    const timer = setTimeout(() => {
      playAudio();
    }, 250);
    return () => clearTimeout(timer);
  }, [currentIndex, playAudio]);

  const handleSelectOption = (wordChoice: string) => {
    if (status !== null || !currentWord) return;
    setSelectedWord(wordChoice);

    if (wordChoice === currentWord.word) {
      setStatus('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore((s) => s + 10);
      playCorrectSound();
      if (newStreak % 5 === 0) {
        playStreakCelebration();
      }
      onUpdateScore(10, newStreak);

      // Auto-advance if enabled
      if (autoPlayNext) {
        setTimeout(() => {
          handleNext();
        }, 1400);
      }
    } else {
      setStatus('wrong');
      setStreak(0);
      playWrongSound();
      onUpdateScore(0, 0);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  if (!currentWord) {
    return <div className="text-center p-8 bg-white rounded-2xl">Đang tải câu hỏi...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Top Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-50 text-[#EC4899] rounded-xl">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#1E3A8A]">Thử Thách Luyện Nghe</h2>
            <p className="text-[11px] text-slate-400">Nghe từ và chọn đáp án chính xác</p>
          </div>
        </div>

        {/* Score & Streak */}
        <div className="flex items-center gap-2 text-xs font-extrabold">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="tabular-nums">{score}</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-100">
            <Flame className="w-4 h-4 text-rose-500" />
            <span className="tabular-nums">{streak}</span>
          </div>
        </div>
      </div>

      {/* Main Listening Stage */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-100 text-center space-y-8 relative">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold text-[#1E3A8A]">Unit {currentWord.unit}</span>
          {/* Speed Toggle & Auto-play toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoPlayNext}
                onChange={(e) => setAutoPlayNext(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#EC4899] rounded"
              />
              <span>Tự chuyển câu</span>
            </label>
          </div>
        </div>

        {/* Giant Animated Speaker Card */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <button
            onClick={() => playAudio('normal')}
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
              isPlaying
                ? 'bg-gradient-to-tr from-[#EC4899] to-pink-400 text-white scale-110 ring-8 ring-pink-100'
                : 'bg-gradient-to-tr from-[#1E3A8A] to-blue-600 text-white hover:scale-105 hover:shadow-lg active:scale-95'
            }`}
          >
            <Volume2 className={`w-12 h-12 ${isPlaying ? 'animate-bounce' : ''}`} />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playAudio('normal')}
              className="px-3.5 py-1.5 bg-blue-50 text-[#1E3A8A] text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>Nghe tốc độ thường</span>
            </button>
            <button
              onClick={() => playAudio('slow')}
              className="px-3.5 py-1.5 bg-pink-50 text-[#EC4899] text-xs font-bold rounded-xl hover:bg-pink-100 transition-colors flex items-center gap-1.5"
            >
              <Volume1 className="w-4 h-4" />
              <span>Nghe chậm (0.65x)</span>
            </button>
          </div>
        </div>

        {/* 4 Word Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          {options.map((opt) => {
            const isSelected = selectedWord === opt;
            const isCorrect = opt === currentWord.word;

            let cardStyle =
              'bg-slate-50 border-2 border-slate-100 text-[#1E3A8A] hover:bg-blue-50/60 hover:border-blue-200';

            if (status !== null) {
              if (isCorrect) {
                cardStyle = 'bg-emerald-500 text-white border-2 border-emerald-500 shadow-sm';
              } else if (isSelected) {
                cardStyle = 'bg-rose-500 text-white border-2 border-rose-500 shadow-sm';
              } else {
                cardStyle = 'bg-slate-50 border-2 border-slate-100 text-slate-400 opacity-50';
              }
            }

            return (
              <button
                key={opt}
                disabled={status !== null}
                onClick={() => handleSelectOption(opt)}
                className={`py-4 px-5 rounded-2xl text-lg font-black font-['Plus_Jakarta_Sans',sans-serif] tracking-tight transition-all active:scale-98 disabled:cursor-not-allowed ${cardStyle}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback Section */}
        {status && (
          <div
            className={`p-4 rounded-2xl border text-sm text-left flex flex-col sm:flex-row items-center justify-between gap-3 ${
              status === 'correct'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {status === 'correct' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-black text-sm block">
                  {status === 'correct' ? 'Tai thính quá! Chính xác 100%!' : 'Chưa đúng rồi! Hãy nghe lại nhé!'}
                </span>
                <span className="text-xs">
                  Từ được đọc là: <strong className="uppercase font-mono">{currentWord.word}</strong> — {currentWord.meaning_vi} ({currentWord.ipa})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onAskAI(currentWord)}
                className="px-3 py-1.5 bg-white text-xs font-bold rounded-xl border border-slate-200 text-[#1E3A8A] hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>Mẹo học</span>
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[#1E3A8A] text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-1.5"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
