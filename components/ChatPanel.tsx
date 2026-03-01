
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ChatConversation, Message, Post } from '../types';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ChatConversation[];
  initialChatId?: string | null;
  contextPost?: Post | null;
  onSendMessage: (chatId: string, text: string, messageIdToEdit?: string, replyTo?: Message['replyTo']) => void;
  onRecallMessage: (chatId: string, messageId: string) => void;
  onDeleteMessage: (chatId: string, messageId: string) => void;
  onReactToMessage: (chatId: string, messageId: string, reaction: string) => void;
  onSelectConversation?: (chatId: string) => void;
}

const REACTIONS = ['❤️', '🔥', '👍', '😂', '😮', '😢'];

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
  isOpen, onClose, conversations, initialChatId, contextPost,
  onSendMessage, onRecallMessage, onDeleteMessage, onReactToMessage,
  onSelectConversation
}) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msg: Message } | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesCountRef = useRef<number>(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedChat = conversations.find(c => c.id === selectedChatId) || null;
  const currentMessages = selectedChat?.messages || [];

  useEffect(() => {
    if (isOpen) {
      setSelectedChatId(initialChatId || null);
    }
  }, [isOpen, initialChatId]);

  useEffect(() => {
    if (selectedChatId && onSelectConversation) {
      onSelectConversation(selectedChatId);
    }
  }, [selectedChatId]);

  useLayoutEffect(() => {
    if (!selectedChatId || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const isNewChat = prevMessagesCountRef.current === 0;
    const hasNewMessage = currentMessages.length > prevMessagesCountRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isNewChat || (hasNewMessage && isNearBottom)) {
      scrollToBottom('smooth');
    }
    prevMessagesCountRef.current = currentMessages.length;
  }, [currentMessages.length, selectedChatId]);

  useEffect(() => {
    prevMessagesCountRef.current = 0;
  }, [selectedChatId]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const isScrolledUp = container.scrollHeight - container.scrollTop - container.clientHeight > 300;
    setShowScrollButton(isScrolledUp);
  };

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputValue.trim() || !selectedChatId) return;
    let replyData: Message['replyTo'] | undefined;
    if (replyingToMessage) {
      replyData = {
        userName: replyingToMessage.isMe ? "Tôi" : (selectedChat?.userName || "Người dùng"),
        text: replyingToMessage.text
      };
    }
    onSendMessage(selectedChatId, inputValue.trim(), editingMessageId || undefined, replyData);
    setInputValue('');
    setEditingMessageId(null);
    setReplyingToMessage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleStartPress = (e: React.MouseEvent | React.TouchEvent, msg: Message) => {
    if (msg.isRecalled) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    longPressTimer.current = setTimeout(() => {
      setContextMenu({ x: clientX, y: clientY, msg });
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 500);
  };

  const handleEndPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleAction = (type: 'reply' | 'edit' | 'recall' | 'delete' | 'react', payload?: any) => {
    if (!contextMenu || !selectedChatId) return;
    const { msg } = contextMenu;
    switch (type) {
      case 'reply':
        setReplyingToMessage(msg);
        setEditingMessageId(null);
        break;
      case 'edit':
        setInputValue(msg.text);
        setEditingMessageId(msg.id);
        setReplyingToMessage(null);
        break;
      case 'recall':
        onRecallMessage(selectedChatId, msg.id);
        break;
      case 'delete':
        onDeleteMessage(selectedChatId, msg.id);
        break;
      case 'react':
        onReactToMessage(selectedChatId, msg.id, payload);
        break;
    }
    setContextMenu(null);
  };

  const getMenuStyles = () => {
    if (!contextMenu) return {};
    const menuWidth = 240;
    const menuHeight = 320;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    let left = contextMenu.x - 110;
    let top = contextMenu.y - 150;
    if (left + menuWidth > screenWidth - 16) left = screenWidth - menuWidth - 16;
    if (left < 16) left = 16;
    if (top + menuHeight > screenHeight - 100) top = screenHeight - menuHeight - 100;
    if (top < 80) top = 80;
    return { top, left };
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-brand-cream dark:bg-slate-950 animate-in slide-in-from-right duration-300">
      {contextMenu && (
        <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-[3px] transition-all" onClick={() => setContextMenu(null)}>
          <div 
            className="absolute bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-brand-gold/30 p-1 min-w-[220px] animate-in zoom-in-95 duration-200"
            style={getMenuStyles()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center gap-1 p-5 mb-1">
              {REACTIONS.map(r => (
                <button key={r} onClick={() => handleAction('react', r)} className={`text-2xl hover:scale-125 transition-transform duration-200 ${contextMenu.msg.reaction === r ? 'scale-125 brightness-110 drop-shadow-md' : ''}`}>
                  {r}
                </button>
              ))}
            </div>
            <div className="h-[1px] bg-brand-gold/10 mx-5 mb-1"></div>
            <div className="flex flex-col p-2">
              <button onClick={() => handleAction('reply')} className="flex items-center gap-4 px-5 py-4 text-[11px] font-black text-brand-red dark:text-brand-gold uppercase hover:bg-brand-red/5 rounded-[1.5rem]">
                <i className="fa-solid fa-reply text-sm"></i> Trả lời
              </button>
              {contextMenu.msg.isMe && !contextMenu.msg.isRecalled && (
                <>
                  <button onClick={() => handleAction('edit')} className="flex items-center gap-4 px-5 py-4 text-[11px] font-black text-brand-red dark:text-brand-gold uppercase hover:bg-brand-red/5 rounded-[1.5rem]">
                    <i className="fa-solid fa-pen-to-square text-sm"></i> Chỉnh sửa
                  </button>
                  <button onClick={() => handleAction('recall')} className="flex items-center gap-4 px-5 py-4 text-[11px] font-black text-brand-red dark:text-brand-gold uppercase hover:bg-brand-red/5 rounded-[1.5rem]">
                    <i className="fa-solid fa-rotate-left text-sm"></i> Thu hồi
                  </button>
                </>
              )}
              <button onClick={() => handleAction('delete')} className="flex items-center gap-4 px-5 py-4 text-[11px] font-black uppercase hover:bg-red-50 text-orange-600 rounded-[1.5rem]">
                <i className="fa-solid fa-trash-can text-sm"></i> Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="bg-brand-red dark:bg-slate-900 px-6 pt-12 pb-5 flex items-center gap-4 border-b-2 border-brand-gold/40 shadow-lg relative z-[50]">
        <button onClick={selectedChat ? () => setSelectedChatId(null) : onClose} className="text-brand-goldLight text-xl">
          <i className={`fa-solid ${selectedChat ? 'fa-chevron-left' : 'fa-xmark'}`}></i>
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-black text-brand-goldLight uppercase tracking-tight">{selectedChat ? selectedChat.userName : 'Hộp thư tin nhắn'}</h2>
          {selectedChat && <p className="text-[10px] text-brand-gold/70 font-bold uppercase leading-none">{selectedChat.userLevel} • Hoạt động</p>}
        </div>
      </header>
      <main 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-hide relative flex flex-col"
      >
        {!selectedChat ? (
          <div className="p-4 space-y-2">
            {conversations.map(chat => (
              <button key={chat.id} onClick={() => {
                setSelectedChatId(chat.id);
                if (onSelectConversation) onSelectConversation(chat.id);
              }} className="w-full bg-white dark:bg-slate-900 p-5 rounded-[2rem] flex items-center gap-4 border border-brand-gold/10 dark:border-slate-800 active:scale-[0.98] transition-all shadow-sm">
                <div className="w-12 h-12 bg-brand-red rounded-2xl flex items-center justify-center text-brand-gold font-black border border-brand-gold/30 shadow-md overflow-hidden">
                  {chat.avatar.startsWith('http') ? <img src={chat.avatar} alt={chat.userName} className="w-full h-full object-cover" /> : chat.avatar}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-black text-brand-red dark:text-slate-100 uppercase text-xs">{chat.userName}</h4>
                    <span className="text-[8px] text-slate-400">{chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].time : ''}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">{chat.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <>
            {selectedChat.isVirtual && selectedChat.virtualPost && (
              <div className="sticky top-0 z-40 bg-brand-cream/90 dark:bg-slate-950/90 backdrop-blur-md px-4 py-2 border-b border-brand-gold/20 shadow-sm">
                <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-brand-gold/30 shadow-lg overflow-hidden flex flex-row items-center h-16">
                  <div className="flex gap-0.5 h-full p-1 bg-brand-cream dark:bg-slate-800">
                    <img src={selectedChat.virtualPost.topImage} className="w-8 h-full object-cover rounded-lg" alt="Top" />
                    <img src={selectedChat.virtualPost.bottomImage} className="w-8 h-full object-cover rounded-lg" alt="Bottom" />
                  </div>
                  <div className="flex-1 px-3 min-w-0">
                    <p className="text-[8px] font-black text-brand-gold uppercase mb-0.5">Đang thảo luận</p>
                    <p className="text-[10px] font-bold text-slate-800 dark:text-slate-100 truncate italic">"{selectedChat.virtualPost.description.substring(0, 30)}..."</p>
                  </div>
                  <button className="h-full px-4 bg-brand-red text-brand-goldLight text-[9px] font-black uppercase min-w-[70px]">
                    {selectedChat.virtualPost.actionType === 'Mua' ? 'MUA NGAY' : 'THUÊ'}
                  </button>
                </div>
              </div>
            )}
            {!selectedChat.isVirtual && contextPost && contextPost.user.name === selectedChat.userName && (
              <div className="sticky top-0 z-40 bg-brand-cream/90 dark:bg-slate-950/90 backdrop-blur-md px-4 py-2 border-b border-brand-gold/20 shadow-sm">
                <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-brand-gold/30 shadow-lg overflow-hidden flex flex-row items-center h-16">
                  <div className="flex gap-0.5 h-full p-1 bg-brand-cream dark:bg-slate-800">
                    <img src={contextPost.topImage} className="w-8 h-full object-cover rounded-lg" alt="Top" />
                    <img src={contextPost.bottomImage} className="w-8 h-full object-cover rounded-lg" alt="Bottom" />
                  </div>
                  <div className="flex-1 px-3 min-w-0">
                    <p className="text-[8px] font-black text-brand-gold uppercase mb-0.5">Đang thảo luận</p>
                    <p className="text-[10px] font-bold text-slate-800 dark:text-slate-100 truncate italic">"{contextPost.description.substring(0, 30)}..."</p>
                  </div>
                  <button className="h-full px-4 bg-brand-red text-brand-goldLight text-[9px] font-black uppercase min-w-[70px]">
                    {contextPost.transactionType === 'Mua' ? 'MUA NGAY' : 'THUÊ'}
                  </button>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-4 p-4 pb-4">
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-brand-red rounded-[1.5rem] flex items-center justify-center text-brand-gold text-2xl font-black border-2 border-brand-gold/30 mx-auto shadow-xl mb-3 overflow-hidden">
                  {selectedChat.avatar.startsWith('http') ? <img src={selectedChat.avatar} alt={selectedChat.userName} className="w-full h-full object-cover" /> : selectedChat.avatar}
                </div>
                <p className="text-[10px] font-black text-brand-gold uppercase tracking-widest">{selectedChat.userLevel}</p>
              </div>
              {currentMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} select-none`} onMouseDown={(e) => handleStartPress(e, msg)} onMouseUp={handleEndPress} onMouseLeave={handleEndPress} onTouchStart={(e) => handleStartPress(e, msg)} onTouchEnd={handleEndPress}>
                  <div className={`relative max-w-[80%] p-4 rounded-[2rem] shadow-sm text-xs font-semibold transition-all ${msg.isRecalled ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 italic border border-slate-200 opacity-60' : msg.isMe ? 'bg-brand-red text-brand-goldLight rounded-tr-none border border-brand-gold/20' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-brand-gold/10'}`}>
                    {msg.replyTo && !msg.isRecalled && (
                      <div className={`mb-2 p-2 rounded-xl text-[10px] border-l-2 border-brand-gold bg-black/5 dark:bg-white/5 opacity-80`}>
                        <p className="font-black uppercase tracking-tighter text-[8px] mb-0.5">{msg.replyTo.userName}</p>
                        <p className="italic truncate">{msg.replyTo.text}</p>
                      </div>
                    )}
                    <p className="leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center gap-1.5 mt-1 opacity-50 text-[8px] ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      {msg.isEdited && <span>(đã chỉnh sửa)</span>}
                      <span>{msg.time}</span>
                    </div>
                    {msg.reaction && (
                      <div onDoubleClick={(e) => { e.stopPropagation(); if (selectedChatId) onReactToMessage(selectedChatId, msg.id, msg.reaction!); }} className={`absolute -bottom-2 ${msg.isMe ? '-left-1' : '-right-1'} bg-white dark:bg-slate-700 shadow-md border border-brand-gold/30 rounded-full px-1.5 py-0.5 text-[10px] animate-in zoom-in-50 cursor-pointer active:scale-90 transition-transform`}>
                        {msg.reaction}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
        {selectedChat && showScrollButton && (
          <button onClick={() => scrollToBottom('smooth')} className="fixed bottom-24 left-1/2 -translate-x-1/2 w-10 h-10 bg-brand-red/80 dark:bg-brand-gold/80 backdrop-blur-md text-brand-goldLight dark:text-brand-red rounded-full flex items-center justify-center shadow-lg border border-brand-gold/40 animate-in fade-in zoom-in-50 duration-300 z-[60]">
            <i className="fa-solid fa-chevron-down text-sm"></i>
          </button>
        )}
      </main>
      {selectedChat && (
        <div className="px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-brand-gold/20 safe-pb z-50">
          {editingMessageId && (
            <div className="px-4 py-3 mb-3 bg-brand-cream dark:bg-slate-800 rounded-2xl flex items-center justify-between border-l-4 border-brand-gold shadow-sm animate-in slide-in-from-bottom-2">
              <div className="flex-1 pr-4 overflow-hidden">
                <p className="text-[9px] font-black text-brand-red dark:text-brand-gold uppercase">Đang chỉnh sửa tin nhắn</p>
                <p className="text-[10px] text-slate-500 truncate italic">"{currentMessages.find(m => m.id === editingMessageId)?.text}"</p>
              </div>
              <button onClick={() => { setEditingMessageId(null); setInputValue(''); }} className="w-6 h-6 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center">
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>
          )}
          {replyingToMessage && !editingMessageId && (
            <div className="px-4 py-3 mb-3 bg-brand-cream dark:bg-slate-800 rounded-2xl flex items-center justify-between border-l-4 border-brand-gold shadow-sm animate-in slide-in-from-bottom-2">
              <div className="flex-1 pr-4 overflow-hidden">
                <p className="text-[9px] font-black text-brand-red dark:text-brand-gold uppercase">Trả lời {replyingToMessage.isMe ? "chính mình" : selectedChat.userName}</p>
                <p className="text-[10px] text-slate-500 truncate italic">"{replyingToMessage.text}"</p>
              </div>
              <button onClick={() => setReplyingToMessage(null)} className="w-6 h-6 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center">
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button className="text-brand-red"><i className="fa-solid fa-circle-plus text-xl"></i></button>
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Aa..." className="flex-1 bg-brand-cream dark:bg-slate-800 border border-brand-gold/30 rounded-full px-5 py-3 text-xs font-bold outline-none text-slate-900 dark:text-white placeholder:text-slate-400" />
            <button onClick={handleSend} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${inputValue.trim() ? 'bg-brand-red text-brand-gold shadow-md' : 'text-slate-300'}`} disabled={!inputValue.trim()}>
              <i className={editingMessageId ? "fa-solid fa-check" : "fa-solid fa-paper-plane"}></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
