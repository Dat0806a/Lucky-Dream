
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Post } from '../types';
import { chatWithAI } from '../services/geminiService';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfitContext?: any;
  postContext?: Post;
  source?: 'public_social_post' | 'ai_recommendation';
  owner?: { username?: string, displayName?: string };
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ 
  isOpen, 
  onClose, 
  outfitContext,
  postContext,
  source,
  owner
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          role: "assistant",
          content: outfitContext || postContext 
            ? "Xin chào! Tôi đã nhận được thông tin về phong cách này. Bạn muốn tôi tư vấn thêm điều gì không?"
            : "Chào mừng bạn đến với LuckyDream AI! Tôi có thể hỗ trợ gì cho phong cách của bạn hôm nay?"
        }
      ]);
    }
  }, [isOpen, outfitContext, postContext]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: inputText.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatWithAI(newMessages, { 
        outfit: outfitContext, 
        post: postContext,
        source: source,
        owner: owner
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response || "Tôi đã nhận được thông tin, bạn cần tôi tư vấn thêm gì không?"
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Xin lỗi, tôi đang bận phối đồ một chút. Bạn thử lại sau nhé!"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-lg bg-brand-cream dark:bg-slate-950 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col relative z-[610] border border-brand-gold/30 h-[80dvh] sm:h-[75dvh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-brand-red dark:bg-slate-900 border-b border-brand-gold/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-gold rounded-2xl flex items-center justify-center text-brand-red shadow-lg">
                  <i className="fa-solid fa-robot text-xl"></i>
                </div>
                <div>
                  <h3 className="text-sm font-black text-brand-goldLight uppercase tracking-widest">Trợ lý AI Fashion</h3>
                  <p className="text-[9px] text-brand-gold/60 font-bold uppercase tracking-tighter">Đang trực tuyến • Chuyên gia phong cách</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-goldLight border border-brand-gold/40 active:scale-90 transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Context Summary (Optional) */}
            {(outfitContext || postContext) && (
              <div className="px-6 py-3 bg-brand-gold/5 border-b border-brand-gold/10 flex items-center gap-3 overflow-x-auto scrollbar-hide">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-brand-gold/20 flex-shrink-0 overflow-hidden">
                  <img 
                    src={outfitContext?.topImage || postContext?.topImage} 
                    className="w-full h-full object-cover" 
                    alt="Context" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black text-brand-red dark:text-brand-gold uppercase truncate">
                    {outfitContext?.name || postContext?.description || 'Outfit Hiện Tại'}
                  </p>
                </div>
                <span className="text-[8px] font-bold text-slate-400 uppercase whitespace-nowrap bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">Đang trao đổi</span>
              </div>
            )}

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-brand-cream/30 dark:bg-slate-900/30">
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-3xl ${
                    msg.role === 'user' 
                    ? 'bg-brand-red text-white rounded-tr-none shadow-md border border-brand-red/1 relative' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none shadow-sm border border-brand-gold/10'
                  }`}>
                    <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <span className={`text-[7px] font-black uppercase mt-2 block ${msg.role === 'user' ? 'text-white/60 text-right' : 'text-slate-400'}`}>
                      {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none shadow-sm border border-brand-gold/10 flex items-center gap-2">
                    <div className="w-1 h-1 bg-brand-gold rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-brand-gold rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1 h-1 bg-brand-gold rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-brand-gold/10 safe-pb">
              <div className="flex items-center gap-3 bg-brand-cream dark:bg-slate-800 p-2 rounded-2xl border border-brand-gold/20 shadow-inner">
                <button className="w-10 h-10 rounded-xl flex items-center justify-center text-brand-gold hover:bg-brand-gold/10 transition-colors">
                  <i className="fa-solid fa-image"></i>
                </button>
                <input 
                  type="text"
                  value={inputText}
                  disabled={isLoading}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Hỏi AI về outfit này..."
                  className="flex-1 bg-transparent border-none px-2 py-2 text-[12px] font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-400 disabled:opacity-50"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    inputText.trim() && !isLoading
                    ? 'bg-brand-red text-brand-gold shadow-md active:scale-90' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  {isLoading ? (
                    <i className="fa-solid fa-spinner animate-spin text-xs"></i>
                  ) : (
                    <i className="fa-solid fa-paper-plane text-xs"></i>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
