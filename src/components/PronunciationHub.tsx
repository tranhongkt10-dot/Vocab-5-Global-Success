import React, { useState, useMemo } from 'react';
import { PronunciationTheory, PronunciationQuiz } from '../types';
import { speakWord } from '../utils/speech';
import { playCorrectSound, playWrongSound } from '../utils/soundEffects';
import {
  Volume2,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { CuteBookIcon, CuteFlowerIcon } from './CuteDecorations';

interface PronunciationHubProps {
  theories: PronunciationTheory[];
  quizzes: PronunciationQuiz[];
  onQuizCompleted?: (score: number) => void;
}

export const PronunciationHub: React.FC<PronunciationHubProps> = ({
  theories,
  quizzes,
  onQuizCompleted,
}) => {
  const [subTab, setSubTab] = useState<'theory' | 'quiz'>('theory');

  // Theory active accordion or section
  const [activeTheoryId, setActiveTheoryId] = useState<string>(theories[0]?.id || 's_es');

  // Quiz state
  const [quizFilter, setQuizFilter] = useState<'all' | 'es_quiz' | 'ed_quiz' | 'stress_quiz'>('all');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizStatus, setQuizStatus] = useState<'correct' | 'wrong' | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  // Filter quizzes
  const filteredQuizzes = useMemo(() => {
    if (quizFilter === 'all') return quizzes;
    return quizzes.filter((q) => q.type === quizFilter);
  }, [quizzes, quizFilter]);

  const currentQuiz = filteredQuizzes[currentQuizIndex % (filteredQuizzes.length || 1)];

  const handleSelectQuizAnswer = (opt: string) => {
    if (quizStatus !== null || !currentQuiz) return;
    setSelectedAnswer(opt);

    if (opt === currentQuiz.answer) {
      setQuizStatus('correct');
      setQuizScore((s) => s + 10);
      playCorrectSound();
      if (onQuizCompleted) onQuizCompleted(10);
    } else {
      setQuizStatus('wrong');
      playWrongSound();
    }
  };

  const handleNextQuiz = () => {
    setQuizStatus(null);
    setSelectedAnswer(null);
    setCurrentQuizIndex((prev) => prev + 1);
  };

  const handlePlayWord = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speakWord(word.replace(/[^a-zA-Z]/g, ''), 0.85);
  };

  return (
    <div className="space-y-6">
      {/* Hub Header & Navigation Switcher */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#1E3A8A] font-['Plus_Jakarta_Sans',sans-serif]">
            Góc Phát Âm & Ngữ Điệu (Pronunciation Hub)
          </h2>
          <p className="text-xs text-slate-500">
            Nắm chắc quy tắc phát âm đuôi -s/es, -ed và trọng âm chuẩn xác theo SGK Lớp 5
          </p>
        </div>

        {/* Sub-tab segmented control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setSubTab('theory')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              subTab === 'theory'
                ? 'bg-white text-[#1E3A8A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📖 Lý thuyết & Mẹo nhớ
          </button>
          <button
            onClick={() => setSubTab('quiz')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              subTab === 'quiz'
                ? 'bg-white text-[#1E3A8A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎯 Trắc nghiệm ({quizzes.length} câu)
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: THEORY */}
      {subTab === 'theory' && (
        <div className="space-y-6">
          {/* Theory Topics Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {theories.map((t) => {
              const isActive = activeTheoryId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTheoryId(t.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#1E3A8A] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  {t.title}
                </button>
              );
            })}
          </div>

          {/* Theory Detail Cards */}
          {theories
            .filter((t) => t.id === activeTheoryId)
            .map((item) => (
              <div key={item.id} className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50/60 to-pink-50/60 rounded-2xl p-5 border border-blue-100/60">
                  <h3 className="text-base sm:text-lg font-black text-[#1E3A8A]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Chạm vào biểu tượng loa cạnh từng ví dụ để nghe người bản xứ phát âm chuẩn nhé!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {item.rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between hover:border-blue-200 transition-colors"
                    >
                      <div>
                        {/* Sound Badge */}
                        <div className="inline-block px-3 py-1 bg-pink-50 border border-pink-200/80 rounded-xl text-[#EC4899] font-black text-sm mb-3">
                          {rule.sound}
                        </div>

                        {/* Rule Explanation */}
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed mb-4">
                          {rule.rule}
                        </p>
                      </div>

                      {/* Examples with speaker clicks */}
                      <div className="bg-[#F8FAFF] rounded-xl p-3 border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">
                          Ví dụ minh họa:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {rule.examples.split(',').map((ex, exIdx) => {
                            const trimmed = ex.trim();
                            return (
                              <button
                                key={exIdx}
                                onClick={(e) => handlePlayWord(trimmed, e)}
                                title={`Nghe: ${trimmed}`}
                                className="group flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#1E3A8A] hover:bg-blue-50 hover:border-blue-300 transition-all"
                              >
                                <span>{trimmed}</span>
                                <Volume2 className="w-3 h-3 text-slate-400 group-hover:text-[#EC4899]" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* SUB-TAB 2: QUIZ */}
      {subTab === 'quiz' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Quiz Filter Bar */}
          <div className="flex items-center justify-between gap-2 p-1 bg-slate-100 rounded-xl">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => {
                  setQuizFilter('all');
                  setCurrentQuizIndex(0);
                  setQuizStatus(null);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  quizFilter === 'all' ? 'bg-white text-[#1E3A8A] shadow-xs' : 'text-slate-600'
                }`}
              >
                Tất cả ({quizzes.length})
              </button>
              <button
                onClick={() => {
                  setQuizFilter('es_quiz');
                  setCurrentQuizIndex(0);
                  setQuizStatus(null);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  quizFilter === 'es_quiz' ? 'bg-white text-[#1E3A8A] shadow-xs' : 'text-slate-600'
                }`}
              >
                Đuôi -s/-es
              </button>
              <button
                onClick={() => {
                  setQuizFilter('ed_quiz');
                  setCurrentQuizIndex(0);
                  setQuizStatus(null);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  quizFilter === 'ed_quiz' ? 'bg-white text-[#1E3A8A] shadow-xs' : 'text-slate-600'
                }`}
              >
                Đuôi -ed
              </button>
              <button
                onClick={() => {
                  setQuizFilter('stress_quiz');
                  setCurrentQuizIndex(0);
                  setQuizStatus(null);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  quizFilter === 'stress_quiz' ? 'bg-white text-[#1E3A8A] shadow-xs' : 'text-slate-600'
                }`}
              >
                Trọng âm
              </button>
            </div>

            <div className="px-3 py-1 text-xs font-extrabold text-[#1E3A8A] shrink-0">
              Điểm: <span className="text-[#EC4899] tabular-nums">{quizScore}</span>
            </div>
          </div>

          {/* Quiz Card */}
          {currentQuiz ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 text-center space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-[#1E3A8A]">
                  {currentQuiz.type === 'es_quiz'
                    ? 'Phát âm -s/-es'
                    : currentQuiz.type === 'ed_quiz'
                    ? 'Phát âm -ed'
                    : 'Trọng âm từ'}
                </span>
                <span>
                  Câu {(currentQuizIndex % filteredQuizzes.length) + 1} / {filteredQuizzes.length}
                </span>
              </div>

              {/* Question */}
              <div className="py-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
                  {currentQuiz.question}
                </h3>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
                {currentQuiz.options.map((opt) => {
                  const isSelected = selectedAnswer === opt;
                  const isCorrect = opt === currentQuiz.answer;

                  let style =
                    'bg-slate-50 border-2 border-slate-100 text-[#1E3A8A] hover:bg-blue-50 hover:border-blue-200';

                  if (quizStatus !== null) {
                    if (isCorrect) {
                      style = 'bg-emerald-500 text-white border-2 border-emerald-500 shadow-sm';
                    } else if (isSelected) {
                      style = 'bg-rose-500 text-white border-2 border-rose-500 shadow-sm';
                    } else {
                      style = 'bg-slate-50 border-2 border-slate-100 text-slate-400 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      disabled={quizStatus !== null}
                      onClick={() => handleSelectQuizAnswer(opt)}
                      className={`py-4 px-4 rounded-2xl text-lg font-black transition-all active:scale-95 disabled:cursor-not-allowed ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {quizStatus && (
                <div
                  className={`p-4 rounded-2xl border text-sm text-left flex flex-col sm:flex-row items-center justify-between gap-3 ${
                    quizStatus === 'correct'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {quizStatus === 'correct' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-black text-sm block">
                        {quizStatus === 'correct' ? '🎉 Giỏi lắm! Đáp án chuẩn xác!' : 'Chưa đúng rồi! Cùng xem giải thích:'}
                      </span>
                      <span className="text-xs">{currentQuiz.explain}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleNextQuiz}
                    className="px-4 py-2 bg-[#1E3A8A] text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <span>Câu tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl">Không có câu hỏi nào.</div>
          )}
        </div>
      )}
    </div>
  );
};
