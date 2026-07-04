
import React, { useState, useEffect } from 'react';
import { Garment, TravelPlan, Post } from '../types';
import { generateTravelPlan } from '../services/geminiService';
import { TravelSection } from './TravelSection';
import { CreatePostModal } from './CreatePostModal';
import { motion, AnimatePresence } from 'motion/react';

interface OutfitResultProps {
  outfit: any;
  top?: Garment;
  bottom?: Garment;
  fullBody?: Garment;
  bodyAnalysis?: any;
  avatar?: any;
  smartTryOn?: any;
  userBodyImage?: string | null;
  savedTravelPlan?: { plan: TravelPlan, sources: any[], city: string };
  onTravelPlanGenerated: (data: { plan: TravelPlan, sources: any[], city: string }) => void;
  onPostPublished: (post: Partial<Post>, onSuccess?: () => void) => void;
  isPublishing?: boolean;
  onShareClick: (data: { topImage: string, bottomImage: string, suggestedLocations: any[], fullBodyImage?: string }) => void;
  onAIChatClick: () => void;
  onTryOnRequest: () => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1594932224828-b4b059b6f6ee?q=80&w=500&auto=format&fit=crop';

const LOADING_MESSAGES = [
  "Đang thiết lập hành trình thượng lưu...",
  "Tìm kiếm điểm đến đẳng cấp tại địa phương...",
  "Đang chọn lọc tinh hoa ẩm thực...",
  "Sắp xếp phương tiện di chuyển tối ưu...",
  "Hoàn thiện lịch trình dành riêng cho bạn..."
];

export const OutfitResult: React.FC<OutfitResultProps> = ({ 
  outfit, 
  top, 
  bottom, 
  fullBody,
  bodyAnalysis,
  avatar,
  smartTryOn,
  userBodyImage,
  savedTravelPlan,
  onTravelPlanGenerated,
  onPostPublished,
  isPublishing = false,
  onShareClick,
  onAIChatClick,
  onTryOnRequest
}) => {
  const [showCityInput, setShowCityInput] = useState(false);
  const [city, setCity] = useState(savedTravelPlan?.city || '');
  const [isLoadingTravel, setIsLoadingTravel] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isLoadingTravel) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isLoadingTravel]);

  const handleGetTravelPlan = async () => {
    if (!city.trim()) return;
    setIsLoadingTravel(true);
    setLoadingMsgIdx(0);
    try {
      const result = await generateTravelPlan(city, outfit.description, outfit.personality);
      if (result) {
        onTravelPlanGenerated({
          plan: result.plan,
          sources: result.sources,
          city: city
        });
        setShowCityInput(false);
      } else {
        alert("Hệ thống AI đang bận hoặc hết hạn mức (Quota). Vui lòng thử lại sau vài phút!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTravel(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  const allSuggestedLocations = savedTravelPlan 
    ? [...savedTravelPlan.plan.luxury, ...savedTravelPlan.plan.local]
    : [];

  return (
    <div className="space-y-6 w-full h-full">
      {/* LOADING OVERLAY VỚI HIỆU ỨNG RADAR VÀ TRAVEL ELEMENTS */}
      {isLoadingTravel && (
        <div className="fixed inset-0 bg-brand-red dark:bg-slate-950 z-[500] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 overflow-hidden">
          
          {/* Background Floating Icons */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
             <i className="fa-solid fa-plane absolute top-[15%] left-[10%] text-5xl animate-bounce" style={{ animationDuration: '4s' }}></i>
             <i className="fa-solid fa-hotel absolute top-[20%] right-[15%] text-4xl animate-pulse"></i>
             <i className="fa-solid fa-martini-glass-cocktail absolute bottom-[25%] left-[20%] text-5xl rotate-12"></i>
             <i className="fa-solid fa-camera-retro absolute bottom-[15%] right-[10%] text-4xl -rotate-12"></i>
             <i className="fa-solid fa-map-pin absolute top-[50%] left-[5%] text-3xl"></i>
             <i className="fa-solid fa-earth-asia absolute top-[40%] right-[5%] text-[100px] opacity-20"></i>
          </div>

          {/* Radar Sweep Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
             <div className="w-[800px] h-[800px] bg-[conic-gradient(from_0deg,transparent_0%,rgba(212,175,55,0.1)_50%,transparent_100%)] animate-[spin_5s_linear_infinite] rounded-full"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center w-full max-w-xs">
            {/* Compass with GPS Pulse */}
            <div className="relative mb-14">
               {/* Pulsing Rings */}
               <div className="absolute inset-0 rounded-full border border-brand-gold animate-[ping_2s_linear_infinite] opacity-30"></div>
               <div className="absolute inset-0 rounded-full border border-brand-gold animate-[ping_3s_linear_infinite] opacity-20" style={{ animationDelay: '0.5s' }}></div>
               
               <div className="w-28 h-28 bg-white/5 backdrop-blur-md rounded-[3rem] border-2 border-brand-gold flex items-center justify-center shadow-[0_0_60px_rgba(212,175,55,0.5)]">
                 <i className="fa-solid fa-compass text-5xl text-brand-gold animate-[spin_8s_linear_infinite]"></i>
               </div>

               {/* Location Marker Pulsing */}
               <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center shadow-lg border border-white animate-bounce">
                  <i className="fa-solid fa-location-dot text-[10px] text-brand-red"></i>
               </div>
            </div>
            
            <div className="space-y-6 w-full">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-brand-goldLight uppercase tracking-[0.2em] italic drop-shadow-lg">Đang Khởi Hành</h3>
                <div className="h-10 flex items-center justify-center">
                  <p className="text-white/90 text-sm font-semibold italic animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </p>
                </div>
              </div>

              {/* THANH CHẠY LIỰC (SHIMMER PROGRESS BAR) */}
              <div className="space-y-3">
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold to-transparent w-full animate-[shimmer_2s_infinite]"></div>
                </div>
                <div className="flex justify-center items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-ping"></div>
                   <p className="text-[10px] font-black text-brand-gold tracking-[0.3em] uppercase drop-shadow-md">LUCKYDREAM TRAVEL</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-gold/20 animate-in fade-in slide-in-from-bottom-8 duration-700 relative flex flex-col">
        {/* Card Header Section */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gold/10 bg-brand-cream/20 dark:bg-slate-800/20">
          <button 
            onClick={onAIChatClick}
            className="flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-brand-redBright text-white rounded-full shadow-lg hover:shadow-brand-red/40 border border-brand-gold/30 active:scale-95 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
          >
            <i className="fa-solid fa-robot text-xs text-brand-gold group-hover:rotate-12 transition-transform"></i>
            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Trao đổi với AI</span>
          </button>
          
          <button 
            onClick={() => onShareClick({
              topImage: top?.image || '',
              bottomImage: bottom?.image || '',
              fullBodyImage: fullBody?.image || '',
              suggestedLocations: allSuggestedLocations
            })}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full text-brand-red shadow-md border border-brand-gold/30 active:scale-90 transition-all group"
          >
            <i className="fa-solid fa-share-nodes group-hover:scale-110 transition-transform text-xs"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Chia sẻ</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:min-h-[450px]">
          {/* Visual Showcase */}
          {fullBody ? (
            <div className="p-5 bg-gradient-to-b from-brand-cream to-white dark:from-slate-950 dark:to-slate-900 flex gap-4 md:w-1/2 relative group justify-center items-center">
              <div className="flex-1 flex flex-col gap-2 max-w-[200px] mx-auto">
                <div className="px-2 py-0.5 bg-brand-red/10 border border-brand-red/20 text-brand-red text-[8px] font-black rounded uppercase w-fit tracking-widest mx-auto">ĐỒ LIỀN / ĐẦM</div>
                <div className="aspect-[3/4] bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-brand-gold/10 p-3 flex items-center justify-center relative overflow-hidden">
                  <img src={fullBody.image} className="w-full h-full object-contain" alt="Full Body" onError={handleImageError} />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-gradient-to-b from-brand-cream to-white dark:from-slate-950 dark:to-slate-900 flex gap-4 md:w-1/2 relative group">
              <div className="flex-1 flex flex-col gap-2">
                <div className="px-2 py-0.5 bg-brand-red/10 border border-brand-red/20 text-brand-red text-[8px] font-black rounded uppercase w-fit tracking-widest">ÁO</div>
                <div className="aspect-[3/4] bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-brand-gold/10 p-3 flex items-center justify-center relative overflow-hidden">
                  {top?.image ? (
                    <img src={top.image} className="w-full h-full object-contain" alt="Top" onError={handleImageError} />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 text-center p-2">
                      <i className="fa-solid fa-shirt text-2xl mb-1 text-slate-400"></i>
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Trống</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="px-2 py-0.5 bg-brand-red/10 border border-brand-red/20 text-brand-red text-[8px] font-black rounded uppercase w-fit tracking-widest">QUẦN</div>
                <div className="aspect-[3/4] bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-brand-gold/10 p-3 flex items-center justify-center relative overflow-hidden">
                  {bottom?.image ? (
                    <img 
                      src={bottom.image} 
                      className="w-full h-full object-contain" 
                      alt="Bottom" 
                      onError={handleImageError} 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 text-center p-2">
                      <i className="fa-solid fa-socks text-2xl mb-1 text-slate-400"></i>
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Trống</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="p-6 pt-2 md:pt-6 space-y-6 md:w-1/2 flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-black bg-brand-red text-brand-goldLight px-3 py-1 rounded-full uppercase tracking-widest">Premium Pick</span>
                <span className="text-[10px] font-black bg-brand-gold/20 text-brand-red px-3 py-1 rounded-full uppercase tracking-widest">{outfit.personality}</span>
              </div>
              <h3 className="text-2xl font-black text-brand-red dark:text-slate-100 uppercase tracking-tighter">{outfit.name}</h3>
              <p className="text-[12px] text-slate-600 dark:text-slate-400 font-medium italic border-l-2 border-brand-gold pl-4 py-0.5 leading-relaxed">
                "{outfit.description}"
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-brand-gold/10">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Hoàn cảnh</p>
                  <div className="flex flex-wrap gap-1">
                    {outfit.locations && outfit.locations.slice(0, 2).map((loc: string, i: number) => (
                      <span key={i} className="text-[10px] font-black text-brand-red dark:text-brand-goldLight uppercase">{loc}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phong cách</p>
                  <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">{outfit.personality || "Hiện đại"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Thần thái</p>
                  <p className="text-[10px] font-black text-brand-red dark:text-brand-gold uppercase">{outfit.mood || "Tự tin"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-brand-gold/10">
              {/* ACTION 1: THỬ ĐỒ NGAY */}
              <button 
                onClick={onTryOnRequest}
                disabled={!smartTryOn?.enabled}
                className="w-full p-3 bg-brand-red text-white rounded-[2rem] font-black flex items-center active:scale-95 transition-all shadow-xl group disabled:opacity-50"
              >
                <div className="w-14 h-14 bg-brand-gold rounded-full flex items-center justify-center shrink-0 shadow-lg border border-white/10 group-active:rotate-12 transition-transform">
                  <i className="fa-solid fa-person-rays text-brand-red text-xl"></i>
                </div>
                <div className="flex-1 flex flex-col items-start pl-4">
                  <span className="uppercase tracking-[0.2em] leading-none text-[8px] text-brand-goldLight opacity-80 mb-1">Step 4 — Smart Try-On</span>
                  <span className="uppercase tracking-tight leading-none text-sm">Thử đồ ngay</span>
                </div>
                <div className="w-8 flex justify-center opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  <i className="fa-solid fa-chevron-right text-sm"></i>
                </div>
              </button>

              {/* ACTION 2: KHÁM PHÁ DU LỊCH */}
              {!savedTravelPlan && !showCityInput && (
                <button 
                  onClick={() => setShowCityInput(true)}
                  className="w-full p-3 bg-white dark:bg-slate-800 text-brand-red dark:text-brand-gold rounded-[2rem] border-2 border-brand-gold/30 font-black flex items-center active:scale-95 transition-all shadow-md group"
                >
                  <div className="w-14 h-14 bg-brand-cream dark:bg-slate-700 rounded-full flex items-center justify-center shrink-0 border border-brand-gold/20">
                    <i className="fa-solid fa-map-location-dot text-brand-red dark:text-brand-gold text-xl"></i>
                  </div>
                  <div className="flex-1 flex flex-col items-start pl-4">
                    <span className="uppercase tracking-[0.2em] leading-none text-[8px] text-slate-400 mb-1">Travel Planning</span>
                    <span className="uppercase tracking-tight leading-none text-sm">Khám phá du lịch</span>
                  </div>
                </button>
              )}

              {showCityInput && !savedTravelPlan && (
                <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="flex gap-2 p-1 bg-brand-cream/50 dark:bg-slate-800 rounded-2xl border border-brand-gold/10">
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Nhập thành phố cần tới..."
                      className="flex-1 bg-transparent px-4 py-3 outline-none text-xs font-bold text-brand-red"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleGetTravelPlan()}
                    />
                    <button 
                      onClick={handleGetTravelPlan} 
                      disabled={isLoadingTravel || !city.trim()}
                      className="w-12 h-12 bg-brand-red text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                    <button onClick={() => setShowCityInput(false)} className="w-12 h-12 flex items-center justify-center text-slate-400">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                  {isLoadingTravel && (
                    <div className="flex items-center gap-2 px-2">
                       <i className="fa-solid fa-circle-notch animate-spin text-brand-gold text-[10px]"></i>
                       <span className="text-[10px] font-black text-brand-gold uppercase tracking-widest animate-pulse">Đang tìm bối cảnh đẹp...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {savedTravelPlan && (
        <div className="pb-12 w-full text-left">
          <TravelSection plan={savedTravelPlan.plan} city={savedTravelPlan.city} sources={savedTravelPlan.sources} />
        </div>
      )}
    </div>
  );
};
