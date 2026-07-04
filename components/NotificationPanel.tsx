import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification } from '../types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100]"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-[100dvh] w-full max-w-[320px] bg-brand-cream dark:bg-slate-950 z-[110] shadow-2xl border-l border-brand-gold/20 flex flex-col pt-12"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gold/10">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-bell text-brand-red dark:text-brand-gold"></i>
                <h2 className="text-sm font-black text-brand-red dark:text-brand-goldLight uppercase tracking-widest">Thông báo</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-red hover:bg-brand-red/10 transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 opacity-40 text-center px-8">
                  <i className="fa-solid fa-bell-slash text-4xl mb-4"></i>
                  <p className="text-[10px] font-black uppercase tracking-tighter">Bạn chưa có thông báo mới nào</p>
                </div>
              ) : (
                <div className="divide-y divide-brand-gold/5">
                  {notifications.map((notif) => (
                    <motion.div 
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`px-6 py-4 flex gap-4 hover:bg-brand-gold/5 transition-colors cursor-pointer group relative ${!notif.read ? 'bg-brand-gold/5' : ''}`}
                      onClick={() => onMarkAsRead(notif.id)}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-brand-gold/20 flex items-center justify-center overflow-hidden shadow-sm">
                          {notif.avatar ? (
                            <img src={notif.avatar} className="w-full h-full object-cover" alt="User" />
                          ) : (
                            <i className={`fa-solid ${notif.type === 'like' ? 'fa-heart text-red-500' : notif.type === 'comment' ? 'fa-comment text-blue-500' : 'fa-star text-brand-gold'} text-lg`}></i>
                          )}
                        </div>
                        {!notif.read && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-red rounded-full border-2 border-brand-cream dark:border-slate-950"></span>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <p className={`text-[11px] leading-tight ${notif.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white font-bold'}`}>
                          {notif.message}
                        </p>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">{notif.createdAt}</span>
                      </div>

                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <i className="fa-solid fa-chevron-right text-[10px] text-brand-gold"></i>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-brand-gold/10">
               <button className="w-full py-3 bg-brand-red text-brand-gold font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-lg border border-brand-gold/30 active:scale-95 transition-all">
                  Đánh dấu tất cả đã đọc
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
