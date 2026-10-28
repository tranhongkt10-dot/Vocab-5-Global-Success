import React, { useState, useEffect, useMemo } from 'react';
import { VocabItem, UserProgress } from '../types';
import { speakWord } from '../utils/speech';
import { playCorrectSound, playWrongSound, playStreakCelebration } from '../utils/soundEffects';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  Trophy,
  Flame,
  ArrowRight,
  ArrowLeftRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface MeaningQuizProps {
  words: VocabItem[];
  progress: UserProgress;
  onUpdateScore: (scoreDelta: number, newStreak: number) => void;
  onAskAI: (word: VocabItem) => void;
}

export const MeaningQuiz: React.FC<MeaningQuizProps> = ({
  words,
  progress,
  onUpdateScore,
  onAskAI,
}) => {
  const [direction, setDirection] = useState<'en_to_vi' | 'vi_to_en'>('en_to_vi');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState<'correct' | 'wrong' | null>(null);

  // Shuffle questions
  const quizPool = useMemo(() => {
    return [...words].sort(() => 0.5 - Math.random());
  }, [words]);

  const currentWord = quizPool[currentIndex % (quizPool.length || 1)];

  // Generate 4 options according to direction
  const options = useMemo(() => {
    if (!currentWord) return [];

    const correctAnswer = direction === 'en_to_vi' ? currentWord.meaning_vi : currentWord.word;
    const set = new Set<string>([correctAnswer]);
    const others = words.filter((w) => w.id !== currentWord.id);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random());

    for (const item of shuffledOthers) {
      if (set.size >= 4) break;
      const ans = direction === 'en_to_vi' ? item.meaning_vi : item.word;
      set.add(ans);
    }

    return Array.from(set).sort(() => 0.5 - Math.random());
  }, [currentWord, words, direction]);

  useEffect(() => {
    setStatus(null);
    setSelectedAnswer(null);
  }, [currentIndex, direction]);

  const handleSelectOption = (choice: string) => {
    if (status !== null || !currentWord) return;
    setSelectedAnswer(choice);

    const correctAnswer = direction === 'en_to_vi' ? currentWord.meaning_vi : currentWord.word;
    if (choice === correctAnswer) {
      setStatus('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore((s) => s + 10);
      playCorrectSound();
      if (newStreak % 5 === 0) {
        playStreakCelebration();
      }
      onUpdateScore(10, newStreak);
      speakWord(currentWord.word, 0.9);
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

  const promptQuestion = direction === 'en_to_vi' ? currentWord.word : currentWord.meaning_vi;
  const promptSub =
    direction === 'en_to_vi'
      ? `${currentWord.ipa} (${currentWord.pos})`
      : `Chọn từ tiếng Anh phù hợp (Unit ${currentWord.unit})`;
  const correctAnswer = direction === 'en_to_vi' ? currentWord.meaning_vi : currentWord.word;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Bar with Direction Toggle & Scores */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Toggle Mode */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setDirection('en_to_vi')}
            className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
              direction === 'en_to_vi'
                ? 'bg-white text-[#1E3A8A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tiếng Anh ➔ Tiếng Việt
          </button>
          <button
            onClick={() => setDirection('vi_to_en')}
            className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
              direction === 'vi_to_en'
                ? 'bg-white text-[#1E3A8A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tiếng Việt ➔ Tiếng Anh
          </button>
        </div>

        {/* Score & Streak Counters */}
        <div className="flex items-center gap-2 text-xs font-extrabold w-full sm:w-auto justify-end">
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

      {/* Main Question Stage */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 text-center space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold text-[#1E3A8A]">Unit {currentWord.unit}</span>
          <span className="text-slate-400">Câu {currentIndex + 1}</span>
        </div>

        {/* Word Display */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {direction === 'en_to_vi' ? 'Nghĩa của từ này là gì?' : 'Từ tiếng Anh tương ứng là gì?'}
          </span>
          <h2
            className={`text-3xl sm:text-4xl font-black font-['Plus_Jakarta_Sans',sans-serif] tracking-tight ${
              direction === 'en_to_vi' ? 'text-[#1E3A8A]' : 'text-[#EC4899]'
            }`}
          >
            {promptQuestion}
          </h2>
          <div className="text-xs text-slate-400 font-mono">
            {promptSub}
          </div>

          {direction === 'en_to_vi' && (
            <div className="pt-1">
              <button
                onClick={() => speakWord(currentWord.word, 0.9)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1E3A8A] text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>Nghe phát âm</span>
              </button>
            </div>
          )}
        </div>

        {/* 4 Multiple Choice Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto pt-2">
          {options.map((opt) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = opt === correctAnswer;

            let cardStyle =
              'bg-slate-50 border-2 border-slate-100 text-slate-800 hover:bg-blue-50/70 hover:border-blue-200';

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
                className={`py-3.5 px-4 rounded-2xl text-base font-extrabold transition-all active:scale-98 disabled:cursor-not-allowed ${cardStyle}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback Area */}
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
                  {status === 'correct' ? '🌟 Tuyệt vời! Bạn nhớ bài rất tốt!' : 'Chưa chính xác rồi! Cùng xem lại nhé!'}
                </span>
                <span className="text-xs">
                  <strong>{currentWord.word}</strong>: {currentWord.meaning_vi}
                  <br />
                  <span className="italic">Ví dụ: "{currentWord.example_en}" ({currentWord.example_vi})</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onAskAI(currentWord)}
                className="px-3 py-1.5 bg-white text-xs font-bold rounded-xl border border-slate-200 text-[#1E3A8A] hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>Giải thích</span>
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
