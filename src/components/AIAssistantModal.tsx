import React, { useState, useEffect, useRef } from 'react';
import { VocabItem, ChatMessage } from '../types';
import { MascotAvatar } from './CuteDecorations';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Volume2,
  BookOpen,
} from 'lucide-react';
import { speakWord } from '../utils/speech';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWordContext: VocabItem | null;
  onClearWordContext: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  activeWordContext,
  onClearWordContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Chào em yêu quý! 🌟 Cô/Thầy là Global Success AI đây. Em muốn giải thích từ vựng nào, tìm mẹo ghi nhớ hay cần cô/thầy đặt ví dụ vui vẻ thì cứ hỏi nhé! Chúc em học thật vui! 🦉✨',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // When activeWordContext changes, suggest inquiry about this word
  useEffect(() => {
    if (activeWordContext && isOpen) {
      const prompt = `Cô/Thầy ơi, giải thích giúp em từ "${activeWordContext.word}" (${activeWordContext.meaning_vi}) và cho em mẹo ghi nhớ dễ thương nhé! 🌸`;
      // Don't auto-send, let student click chip or send
    }
  }, [activeWordContext, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
      wordContext: activeWordContext || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          wordContext: activeWordContext,
          history: messages.slice(-4).map((m) => ({ role: m.sender, content: m.text })),
        }),
      });

      if (!response.ok) throw new Error('API response failed');

      const data = await response.json();
      const aiReply = data.reply || 'Cô/Thầy đây rồi! Em hãy tự tin tiếp tục nhé 🌟';

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn('AI call fallback active:', err);
      // Fallback friendly reply
      let fallbackText = 'Em giỏi lắm! 🌟 ';
      if (activeWordContext) {
        fallbackText += `Từ **"${activeWordContext.word}"** nghĩa là **"${activeWordContext.meaning_vi}"** (${activeWordContext.pos}). Phát âm là *${activeWordContext.ipa}*. Ví dụ: "${activeWordContext.example_en}"! Mẹo nhỏ là hãy tập nói câu này to 3 lần trước gương nhé! 🏆`;
      } else {
        fallbackText += 'Hãy tiếp tục rèn luyện mỗi ngày, thầy cô tin chắc điểm 10 tiếng Anh sẽ sớm thuộc về em! ✨';
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = activeWordContext
    ? [
        `Giải thích từ "${activeWordContext.word}" thật chi tiết`,
        `Cho em câu ví dụ vui vẻ với "${activeWordContext.word}"`,
        `Mẹo nhớ từ "${activeWordContext.word}" siêu nhanh`,
        'Khen và động viên em học tốt nào!',
      ]
    : [
        'Làm sao để nhớ từ vựng lâu không quên ạ?',
        'Cách phân biệt phát âm đuôi -s và -es dễ nhất?',
        'Quy tắc trọng âm từ 2 âm tiết là gì ạ?',
        'Thầy/Cô động viên em học bài đi ạ! 💖',
      ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[620px] max-h-[90vh] overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <MascotAvatar size={42} className="bg-white/10 p-0.5 rounded-full" />
            <div>
              <h3 className="text-sm font-extrabold flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                <span>Global Success AI</span>
                <span className="text-[10px] bg-pink-500/80 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  Trợ lý học tập
                </span>
              </h3>
              <p className="text-[11px] text-blue-200">Cô/Thầy tiếng Anh thân thiện lớp 5</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'reset',
                    sender: 'ai',
                    text: 'Chúng mình bắt đầu lại nhé! Em cần cô/thầy hỗ trợ gì nào? 🌟',
                    timestamp: Date.now(),
                  },
                ]);
              }}
              title="Làm mới cuộc trò chuyện"
              className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Word Context Bar (if a word is being investigated) */}
        {activeWordContext && (
          <div className="bg-pink-50/90 border-b border-pink-100 px-4 py-2 flex items-center justify-between text-xs text-[#1E3A8A]">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[#1E3A8A] font-mono">
                {activeWordContext.word}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">{activeWordContext.ipa}</span>
              <span className="text-[#EC4899] font-bold">({activeWordContext.meaning_vi})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => speakWord(activeWordContext.word, 0.9)}
                className="p-1 text-[#1E3A8A] hover:bg-pink-100 rounded-lg transition-colors"
                title="Nghe phát âm"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClearWordContext}
                className="text-slate-400 hover:text-slate-600 text-xs px-1"
                title="Bỏ ngữ cảnh từ"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F8FAFF]">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shrink-0 border border-pink-200 mt-0.5">
                    <Sparkles className="w-4 h-4 text-[#EC4899]" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                    isAi
                      ? 'bg-white text-slate-800 shadow-xs border border-slate-100 rounded-tl-sm'
                      : 'bg-[#1E3A8A] text-white rounded-tr-sm shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center shrink-0 border border-pink-100">
                <Sparkles className="w-4 h-4 text-[#EC4899] animate-spin" />
              </div>
              <div className="bg-white rounded-2xl py-2 px-3 border border-slate-100 shadow-xs">
                <span>Cô/Thầy đang suy nghĩ câu trả lời hay nhất cho em... 🌸</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-pink-50 hover:text-[#EC4899] hover:border-pink-200 transition-colors whitespace-nowrap shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Hỏi cô/thầy bất cứ điều gì về từ vựng..."
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
          />
          <button
            disabled={!inputValue.trim() || isLoading}
            onClick={() => handleSendMessage()}
            className="p-2.5 bg-[#1E3A8A] text-white rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-40 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
