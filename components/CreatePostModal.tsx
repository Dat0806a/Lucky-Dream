
import React, { useState } from 'react';
import { Post, TransactionType, TravelLocation } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  topImage: string;
  bottomImage: string;
  suggestedLocations: TravelLocation[];
  onPublish: (postData: Partial<Post>) => void;
  isPublishing?: boolean;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen, onClose, topImage, bottomImage, suggestedLocations, onPublish, isPublishing = false
}) => {
  const [description, setDescription] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>('Chia sẻ');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  
  if (!isOpen) return null;

  const handlePublish = () => {
    onPublish({
      description,
      transactionType,
      location: selectedLocation || 'Địa điểm bí mật',
      tags: ['LuckyDream', 'FashionTravel', transactionType]
    });
    // We don't close the modal here anymore, App.tsx will handle it on success
    // or the user can close it manually if it fails.
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[3rem] shadow-2xl flex flex-col max-h-[92dvh] animate-in slide-in-from-bottom duration-500 border-t border-brand-gold/30 overflow-hidden">
        <div className="p-6 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <h3 className="text-xl font-black text-brand-red dark:text-brand-gold uppercase tracking-tighter italic">Đăng bài phối đồ</h3>
            <button onClick={onClose} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-6">
            {/* Visual Preview */}
            <div className="flex gap-3 p-3 bg-brand-cream dark:bg-slate-800 rounded-2xl border border-brand-gold/10">
              <img src={topImage} className="w-20 h-24 object-cover rounded-xl border border-brand-gold/20 shadow-sm" alt="Top" />
              <img src={bottomImage} className="w-20 h-24 object-cover rounded-xl border border-brand-gold/20 shadow-sm" alt="Bottom" />
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-[10px] font-black text-brand-gold uppercase">Bản xem trước</p>
                <p className="text-[9px] text-slate-400 italic">Phong cách thượng lưu từ LuckyDream</p>
              </div>
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-red dark:text-brand-goldLight uppercase tracking-widest ml-1">Lời nhắn của bạn</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chia sẻ cảm hứng phối đồ của bạn..."
                className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-2 border-brand-gold/10 rounded-3xl p-5 text-sm font-medium outline-none focus:border-brand-red dark:focus:border-brand-gold transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            {/* Transaction Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-red dark:text-brand-goldLight uppercase tracking-widest ml-1">Mục đích bài viết</label>
              <div className="flex flex-wrap gap-2">
                {['Chia sẻ', 'Bán', 'Thuê'].map((label) => (
                  <button 
                    key={label}
                    onClick={() => setTransactionType(label === 'Bán' ? 'Mua' : label as TransactionType)}
                    className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase transition-all ${
                      (label === 'Bán' && transactionType === 'Mua') || transactionType === label 
                      ? 'bg-brand-red text-brand-goldLight border border-brand-gold/40 shadow-lg' 
                      : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Location Integration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-brand-red dark:text-brand-goldLight uppercase tracking-widest">Gắn thẻ địa điểm từ gợi ý AI</label>
                <i className="fa-solid fa-wand-magic-sparkles text-brand-gold animate-pulse text-[10px]"></i>
              </div>
              
              {suggestedLocations.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {suggestedLocations.map((loc, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedLocation(`${loc.name} - ${loc.address}`)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                        selectedLocation.includes(loc.name)
                        ? 'bg-brand-gold/10 border-brand-gold'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <i className={`fa-solid fa-location-dot ${selectedLocation.includes(loc.name) ? 'text-brand-red' : 'text-slate-300'}`}></i>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase truncate">{loc.name}</p>
                        <p className="text-[9px] text-slate-500 truncate">{loc.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase italic">Chưa có gợi ý địa điểm.<br/>Hãy khởi hành để nhận đề xuất!</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 pb-8 md:pb-4 flex-shrink-0">
            <button 
              onClick={handlePublish}
              disabled={!description.trim() || isPublishing}
              className="w-full py-5 bg-brand-red text-brand-goldLight rounded-3xl font-black uppercase shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 border border-brand-gold/30"
            >
              {isPublishing ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin text-brand-gold"></i>
                  Đang chia sẻ outfit...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane text-brand-gold"></i>
                  Chia sẻ bài đăng
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
