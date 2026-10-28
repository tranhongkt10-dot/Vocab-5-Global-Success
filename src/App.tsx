import React, { useState, useEffect } from 'react';
import vocabData from './data/vocab.json';
import pronunciationData from './data/pronunciation.json';
import { VocabItem, PronunciationTheory, PronunciationQuiz, UserProgress, ActiveNavTab } from './types';
import { Header } from './components/Header';
import { VocabList } from './components/VocabList';
import { SpellingQuiz } from './components/SpellingQuiz';
import { ListeningQuiz } from './components/ListeningQuiz';
import { MeaningQuiz } from './components/MeaningQuiz';
import { PronunciationHub } from './components/PronunciationHub';
import { AIAssistantModal } from './components/AIAssistantModal';
import { MascotAvatar, CuteBookIcon, CuteFlowerIcon, CuteLeafIcon } from './components/CuteDecorations';
import { Sparkles, MessageCircle, Heart, Star, Award, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'vocab5_global_success_progress_v1';

const defaultProgress: UserProgress = {
  learnedWordIds: [],
  bookmarkedWordIds: [],
  spellingScore: 0,
  listeningScore: 0,
  meaningScore: 0,
  pronunciationScore: 0,
  currentStreak: 0,
  bestStreak: 0,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('vocab');
  const [words] = useState<VocabItem[]>(vocabData.vocab);
  const [theories] = useState<PronunciationTheory[]>(pronunciationData.theory);
  const [quizzes] = useState<PronunciationQuiz[]>(pronunciationData.quizzes as PronunciationQuiz[]);

  // Persistent progress in localStorage
  const [progress, setProgress] = useState<UserProgress>(() => {
    if (typeof window === 'undefined') return defaultProgress;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultProgress, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return defaultProgress;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [progress]);

  // AI Assistant Modal state
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [activeWordContext, setActiveWordContext] = useState<VocabItem | null>(null);

  // Toggle learned status for a word
  const handleToggleLearned = (wordId: string) => {
    setProgress((prev) => {
      const exists = prev.learnedWordIds.includes(wordId);
      const updated = exists
        ? prev.learnedWordIds.filter((id) => id !== wordId)
        : [...prev.learnedWordIds, wordId];
      return { ...prev, learnedWordIds: updated };
    });
  };

  // Toggle bookmark ⭐ status for a word
  const handleToggleBookmark = (wordId: string) => {
    setProgress((prev) => {
      const exists = prev.bookmarkedWordIds.includes(wordId);
      const updated = exists
        ? prev.bookmarkedWordIds.filter((id) => id !== wordId)
        : [...prev.bookmarkedWordIds, wordId];
      return { ...prev, bookmarkedWordIds: updated };
    });
  };

  // Update score and streak from quizzes
  const handleUpdateQuizScore = (scoreDelta: number, newStreak: number) => {
    setProgress((prev) => {
      const updatedBestStreak = Math.max(prev.bestStreak, newStreak);
      return {
        ...prev,
        currentStreak: newStreak,
        bestStreak: updatedBestStreak,
      };
    });
  };

  // Open AI with context of a word
  const handleAskAIAboutWord = (word: VocabItem) => {
    setActiveWordContext(word);
    setIsAIOpen(true);
  };

  // Reset progress option
  const handleResetProgress = () => {
    if (window.confirm('Em có chắc chắn muốn đặt lại toàn bộ tiến độ học tập không?')) {
      setProgress(defaultProgress);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex flex-col selection:bg-pink-100 selection:text-pink-600">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        progress={progress}
        totalWords={words.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'vocab' && (
          <VocabList
            words={words}
            progress={progress}
            onToggleLearned={handleToggleLearned}
            onToggleBookmark={handleToggleBookmark}
            onAskAI={handleAskAIAboutWord}
          />
        )}

        {activeTab === 'spelling' && (
          <SpellingQuiz
            words={words}
            progress={progress}
            onUpdateScore={handleUpdateQuizScore}
            onAskAI={handleAskAIAboutWord}
          />
        )}

        {activeTab === 'listening' && (
          <ListeningQuiz
            words={words}
            progress={progress}
            onUpdateScore={handleUpdateQuizScore}
            onAskAI={handleAskAIAboutWord}
          />
        )}

        {activeTab === 'meaning' && (
          <MeaningQuiz
            words={words}
            progress={progress}
            onUpdateScore={handleUpdateQuizScore}
            onAskAI={handleAskAIAboutWord}
          />
        )}

        {activeTab === 'pronunciation' && (
          <PronunciationHub
            theories={theories}
            quizzes={quizzes}
            onQuizCompleted={(score) => handleUpdateQuizScore(score, progress.currentStreak + 1)}
          />
        )}
      </main>

      {/* Floating AI Assistant Chat Button (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => {
            setActiveWordContext(null);
            setIsAIOpen(true);
          }}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:from-[#172554] hover:to-[#1D4ED8] text-white p-2.5 pr-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 ring-4 ring-white/80"
          title="Hỏi cô/thầy Global Success AI"
        >
          <div className="relative">
            <MascotAvatar size={38} className="rounded-full ring-2 ring-pink-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EC4899]" />
            </span>
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-black block leading-none font-['Plus_Jakarta_Sans',sans-serif]">
              Hỏi Cô/Thầy AI
            </span>
            <span className="text-[10px] text-pink-200 font-semibold block leading-tight">
              Giải thích & Mẹo nhớ ✨
            </span>
          </div>
        </button>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        activeWordContext={activeWordContext}
        onClearWordContext={() => setActiveWordContext(null)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-100 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <MascotAvatar size={24} />
            <span className="font-extrabold text-[#1E3A8A]">Vocab 5 – Global Success</span>
            <span aria-hidden="true">·</span>
            <span>Bộ môn Tiếng Anh Lớp 5 Tiểu học</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetProgress}
              className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại tiến độ</span>
            </button>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-slate-400">
              Học vui mỗi ngày cùng <Heart className="w-3.5 h-3.5 text-[#EC4899] fill-pink-400 inline" />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
