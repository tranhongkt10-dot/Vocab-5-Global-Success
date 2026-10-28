import React, { useState, useMemo } from 'react';
import { VocabItem, UserProgress } from '../types';
import { speakWord } from '../utils/speech';
import {
  Search,
  Volume2,
  CheckCircle2,
  Star,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  RotateCcw,
} from 'lucide-react';
import { CuteBookIcon, CuteFlowerIcon, CuteLeafIcon, MascotAvatar } from './CuteDecorations';

interface VocabListProps {
  words: VocabItem[];
  progress: UserProgress;
  onToggleLearned: (wordId: string) => void;
  onToggleBookmark: (wordId: string) => void;
  onAskAI: (word: VocabItem) => void;
}

export const VocabList: React.FC<VocabListProps> = ({
  words,
  progress,
  onToggleLearned,
  onToggleBookmark,
  onAskAI,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'unlearned' | 'learned' | 'bookmarked'>('all');
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);

  // Available units from words
  const units = useMemo(() => {
    const set = new Set<number>();
    words.forEach((w) => set.add(w.unit));
    return Array.from(set).sort((a, b) => a - b);
  }, [words]);

  // Filter words by search query, unit, and status
  const filteredWords = useMemo(() => {
    return words.filter((item) => {
      // Unit filter
      if (selectedUnit !== 'all' && item.unit !== selectedUnit) {
        return false;
      }

      // Status filter
      const isLearned = progress.learnedWordIds.includes(item.id);
      const isBookmarked = progress.bookmarkedWordIds.includes(item.id);

      if (filterType === 'learned' && !isLearned) return false;
      if (filterType === 'unlearned' && isLearned) return false;
      if (filterType === 'bookmarked' && !isBookmarked) return false;

      // Text search
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchWord = item.word.toLowerCase().includes(q);
      const matchMeaning = item.meaning_vi.toLowerCase().includes(q);
      const matchExampleEn = item.example_en.toLowerCase().includes(q);
      const matchExampleVi = item.example_vi.toLowerCase().includes(q);

      return matchWord || matchMeaning || matchExampleEn || matchExampleVi;
    });
  }, [words, searchQuery, selectedUnit, filterType, progress]);

  const handleSpeak = (wordItem: VocabItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeakingWordId(wordItem.id);
    speakWord(wordItem.word, 0.85, () => {
      setSpeakingWordId(null);
    });
  };

  const learnedCount = progress.learnedWordIds.length;
  const totalCount = words.length;
  const progressPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A] to-[#2563EB] rounded-3xl p-6 sm:p-8 text-white shadow-md">
        {/* Decorative background shapes */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-pink-500/10 pointer-events-none" />
        <div className="absolute top-4 right-24 opacity-20 pointer-events-none hidden sm:block">
          <CuteFlowerIcon className="w-12 h-12 text-pink-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <MascotAvatar size={76} className="bg-white/10 p-1 rounded-full ring-2 ring-white/20" />
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-pink-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tiếng Anh Lớp 5 Global Success</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
                Kho Từ Vựng Toàn Diện
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
                Luyện nghe phát âm chuẩn bản xứ, ghi nhớ từ vựng dễ dàng với bài tập phản xạ và trợ lý AI thông minh!
              </p>
            </div>
          </div>

          {/* Quick Progress Card */}
          <div className="w-full md:w-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[240px]">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-blue-100">Tiến độ ghi nhớ</span>
              <span className="text-pink-300 tabular-nums font-extrabold">{learnedCount} / {totalCount} từ ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-pink-400 to-pink-500 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-blue-200 mt-2 font-medium">
              <span>Đã học: {learnedCount}</span>
              <span>⭐ Đánh dấu: {progress.bookmarkedWordIds.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm từ tiếng Anh hoặc nghĩa tiếng Việt..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter: All / Unlearned / Learned / Bookmarked */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                filterType === 'all'
                  ? 'bg-white text-[#1E3A8A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({words.length})
            </button>
            <button
              onClick={() => setFilterType('unlearned')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                filterType === 'unlearned'
                  ? 'bg-white text-[#1E3A8A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chưa thuộc ({words.length - learnedCount})
            </button>
            <button
              onClick={() => setFilterType('learned')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                filterType === 'learned'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã thuộc ({learnedCount})
            </button>
            <button
              onClick={() => setFilterType('bookmarked')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                filterType === 'bookmarked'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⭐ Quan trọng ({progress.bookmarkedWordIds.length})
            </button>
          </div>
        </div>

        {/* Unit Selector Strip (Unit 1 to Unit 20) */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Chọn bài học (Unit):
            </span>
            {selectedUnit !== 'all' && (
              <button
                onClick={() => setSelectedUnit('all')}
                className="text-xs text-[#EC4899] font-bold hover:underline"
              >
                Xem tất cả các Unit
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedUnit('all')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-xl whitespace-nowrap transition-all shrink-0 ${
                selectedUnit === 'all'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả Unit
            </button>
            {units.map((u) => {
              const isSelected = selectedUnit === u;
              return (
                <button
                  key={u}
                  onClick={() => setSelectedUnit(u)}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-xl whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'bg-[#EC4899] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Unit {u}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Words Grid */}
      {filteredWords.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs">
          <div className="w-16 h-16 mx-auto mb-3 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy từ vựng phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Thử tìm kiếm với từ khóa khác hoặc chuyển bộ lọc về "Tất cả Unit".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedUnit('all');
              setFilterType('all');
            }}
            className="mt-4 px-4 py-2 bg-[#1E3A8A] text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition-colors"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((item) => {
            const isLearned = progress.learnedWordIds.includes(item.id);
            const isBookmarked = progress.bookmarkedWordIds.includes(item.id);
            const isSpeaking = speakingWordId === item.id;

            return (
              <div
                key={item.id}
                className={`group relative bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between ${
                  isLearned
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-100 hover:border-blue-200'
                }`}
              >
                <div>
                  {/* Card Header: Metadata + Actions */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-[#1E3A8A]">Unit {item.unit}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-500 uppercase tracking-wider">{item.pos}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Bookmark Star Button */}
                      <button
                        onClick={() => onToggleBookmark(item.id)}
                        title={isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu từ quan trọng'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBookmarked
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-slate-300 hover:text-amber-400 hover:bg-slate-50'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                      </button>

                      {/* Learned Checkmark Button */}
                      <button
                        onClick={() => onToggleLearned(item.id)}
                        title={isLearned ? 'Đánh dấu chưa thuộc' : 'Đã thuộc từ này'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isLearned
                            ? 'text-emerald-600 bg-emerald-100/60'
                            : 'text-slate-300 hover:text-emerald-500 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${isLearned ? 'fill-emerald-100' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Main Word + Speaker Button */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#1E3A8A] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight group-hover:text-blue-900 transition-colors">
                        {item.word}
                      </h3>
                      <div className="text-xs text-slate-400 font-mono tracking-wide mt-0.5">
                        {item.ipa}
                      </div>
                    </div>

                    {/* Pronounce Button */}
                    <button
                      onClick={(e) => handleSpeak(item, e)}
                      title="Nghe phát âm chuẩn (en-US)"
                      className={`p-2.5 rounded-xl transition-all ${
                        isSpeaking
                          ? 'bg-[#EC4899] text-white scale-110 shadow-xs'
                          : 'bg-blue-50 text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white'
                      }`}
                    >
                      <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-bounce' : ''}`} />
                    </button>
                  </div>

                  {/* Vietnamese Meaning (Pink #EC4899) */}
                  <div className="my-2.5">
                    <span className="inline-block text-base font-extrabold text-[#EC4899]">
                      {item.meaning_vi}
                    </span>
                  </div>

                  {/* Example Sentences */}
                  <div className="bg-[#F8FAFF] rounded-xl p-3 border border-slate-100 text-xs space-y-1">
                    <p className="font-semibold text-slate-700">
                      "{item.example_en}"
                    </p>
                    <p className="text-slate-500 italic">
                      "{item.example_vi}"
                    </p>
                  </div>
                </div>

                {/* Footer Quick Action: Ask AI */}
                <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs">
                  <span className={`text-[11px] font-bold ${isLearned ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isLearned ? '✓ Đã thuộc' : '○ Chưa thuộc'}
                  </span>

                  <button
                    onClick={() => onAskAI(item)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] hover:text-[#EC4899] py-1 px-2.5 rounded-lg hover:bg-pink-50 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
                    <span>Hỏi Cô/Thầy AI</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
