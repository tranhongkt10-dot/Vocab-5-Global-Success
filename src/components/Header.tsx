import React from 'react';
import { ActiveNavTab, UserProgress } from '../types';
import { MascotAvatar } from './CuteDecorations';
import { BookOpen, PenTool, Headphones, Brain, Volume2, Star } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  progress: UserProgress;
  totalWords: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  progress,
  totalWords,
}) => {
  const learnedCount = progress.learnedWordIds.length;
  const percent = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;

  const navItems: { id: ActiveNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'vocab', label: 'Từ Vựng', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'spelling', label: 'Chính Tả', icon: <PenTool className="w-4 h-4" /> },
    { id: 'listening', label: 'Luyện Nghe', icon: <Headphones className="w-4 h-4" /> },
    { id: 'meaning', label: 'Nghĩa Từ', icon: <Brain className="w-4 h-4" /> },
    { id: 'pronunciation', label: 'Phát Âm', icon: <Volume2 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Wordmark & Mascot */}
          <button
            onClick={() => onSelectTab('vocab')}
            className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-none"
          >
            <MascotAvatar size={38} className="transition-transform group-hover:scale-105" />
            <div>
              <span className="text-lg font-extrabold tracking-tight text-[#1E3A8A] block leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
                Vocab 5
              </span>
              <span className="text-[11px] font-bold text-[#EC4899] block leading-none tracking-wide">
                Global Success
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links / Segmented Buttons */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-white text-[#1E3A8A] shadow-xs'
                      : 'text-slate-600 hover:text-[#1E3A8A] hover:bg-white/60'
                  }`}
                >
                  <span className={isActive ? 'text-[#EC4899]' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Progress & Star Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-[#F8FAFF] border border-blue-100/80 px-3 py-1.5 rounded-2xl shadow-xs">
              <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span className="tabular-nums">{progress.currentStreak > 0 ? `${progress.currentStreak} 🔥` : `${learnedCount}/${totalWords}`}</span>
              </div>
              <div className="w-16 hidden sm:block bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#1E3A8A] to-[#EC4899] h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-500 hidden sm:inline tabular-nums">
                {percent}%
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around gap-1 py-2 border-t border-slate-100 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2.5 text-[11px] font-bold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'text-[#1E3A8A] bg-blue-50/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className={`mb-0.5 ${isActive ? 'text-[#EC4899]' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
