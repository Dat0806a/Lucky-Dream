
import React, { useState, useEffect } from 'react';
import { Garment, TravelPlan, Post } from '../types';
import { generateTravelPlan } from '../services/geminiService';
import { TravelSection } from './TravelSection';
import { CreatePostModal } from './CreatePostModal';

interface OutfitResultProps {
  outfit: any;
  top: Garment;
  bottom: Garment;
  savedTravelPlan?: { plan: TravelPlan, sources: any[], city: string };
  onTravelPlanGenerated: (data: { plan: TravelPlan, sources: any[], city: string }) => void;
  onPostPublished: (post: Partial<Post>, onSuccess?: () => void) => void;
  isPublishing?: boolean;
  onShareClick: (data: { topImage: string, bottomImage: string, suggestedLocations: any[] }) => void;
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
  savedTravelPlan,
  onTravelPlanGenerated,
  onPostPublished,
  isPublishing = false,
  onShareClick
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
        {/* Card Header Section to fix the overlap issue */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gold/10 bg-brand-cream/20 dark:bg-slate-800/20">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black text-brand-red/70 dark:text-brand-gold/70 uppercase tracking-[0.15em]">LuckyDream AI Choice</span>
          </div>
          <button 
            onClick={() => onShareClick({
              topImage: top.image,
              bottomImage: bottom.image,
              suggestedLocations: allSuggestedLocations
            })}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full text-brand-red shadow-md border border-brand-gold/30 active:scale-90 transition-all group"
          >
            <i className="fa-solid fa-paper-plane group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-xs"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Chia sẻ</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:min-h-[400px]">
          {/* Visual Showcase */}
          <div className="p-5 bg-gradient-to-b from-brand-cream to-white dark:from-slate-950 dark:to-slate-900 flex gap-4 md:w-1/2">
            <div className="flex-1 aspect-[3/4] bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-brand-gold/10 p-3 flex items-center justify-center relative">
              <img src={top?.image} className="w-full h-full object-contain" alt="Top" onError={handleImageError} />
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-brand-red text-white text-[9px] font-black rounded shadow uppercase z-10">ÁO</div>
            </div>
            <div className="flex-1 aspect-[3/4] bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-brand-gold/10 p-3 flex items-center justify-center relative">
              <img src={bottom?.image} className="w-full h-full object-contain" alt="Bottom" onError={handleImageError} />
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-brand-red text-white text-[9px] font-black rounded shadow uppercase z-10">QUẦN</div>
            </div>
          </div>

          <div className="p-6 pt-2 md:pt-6 space-y-8 md:w-1/2 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-black bg-brand-red text-brand-goldLight px-3 py-1 rounded-full uppercase tracking-widest">Match Score: 98%</span>
                <span className="text-[10px] font-black bg-brand-gold/20 text-brand-red px-3 py-1 rounded-full uppercase tracking-widest italic">Style: {outfit.name}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-brand-red dark:text-slate-100 leading-none tracking-tighter uppercase">{outfit.name}</h3>
              <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium italic border-l-2 border-brand-gold pl-4 py-1 leading-relaxed mb-4">
                "{outfit.description}"
              </p>

              <div className="relative grid grid-cols-2 gap-x-10 pt-8 border-t border-brand-gold/10">
                <div className="absolute left-1/2 top-8 bottom-4 w-[1px] bg-brand-gold/10 -translate-x-1/2"></div>
                
                {/* Tính Cách */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-red dark:text-brand-gold">
                      <i className="fa-solid fa-user-tag text-[10px]"></i>
                    </div>
                    <h4 className="text-[11px] font-black text-brand-red dark:text-brand-gold uppercase tracking-[0.15em]">Tính cách</h4>
                  </div>
                  <p className="text-[12px] font-bold text-slate-700 dark:text-slate-300 italic leading-snug pl-8">{outfit.personality}</p>
                </div>

                {/* Bối Cảnh - FIXED SPACING */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-red dark:text-brand-gold">
                      <i className="fa-solid fa-map-pin text-[10px]"></i>
                    </div>
                    <h4 className="text-[11px] font-black text-brand-red dark:text-brand-gold uppercase tracking-[0.15em]">Bối cảnh</h4>
                  </div>
                  <div className="flex flex-wrap gap-2.5 pl-8">
                    {outfit.locations && outfit.locations.map((loc: string, i: number) => (
                      <span key={i} className="px-3.5 py-1.5 bg-brand-cream dark:bg-slate-800 border border-brand-gold/25 rounded-xl text-[10px] font-black text-brand-red dark:text-brand-goldLight uppercase tracking-normal shadow-sm">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {!savedTravelPlan && (
              <div className="pt-8 border-t border-brand-gold/10 dark:border-slate-800">
                {!showCityInput ? (
                  <button 
                    onClick={() => setShowCityInput(true)}
                    className="w-full p-3 bg-brand-red text-white rounded-[2.5rem] font-black flex items-center active:scale-95 transition-all shadow-2xl border border-brand-gold/40 group"
                  >
                    <div className="w-16 h-16 bg-brand-gold rounded-[1.8rem] flex items-center justify-center shrink-0 shadow-lg border border-white/10 relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      <i className="fa-solid fa-map-location-dot text-brand-red text-2xl relative z-10"></i>
                    </div>
                    <div className="flex-1 flex flex-col items-start justify-center pl-5 pr-2">
                      <span className="uppercase tracking-[0.2em] leading-none text-[9px] text-brand-goldLight opacity-80 mb-2">Travel Ecosystem</span>
                      <span className="uppercase tracking-tight leading-[1.2] text-sm md:text-base text-left">
                        Khám phá du lịch<br/>cùng bộ này
                      </span>
                    </div>
                    <div className="w-10 shrink-0 flex justify-center opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                      <i className="fa-solid fa-chevron-right text-lg"></i>
                    </div>
                  </button>
                ) : (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Nhập thành phố dự định ghé thăm..."
                      className="w-full bg-brand-cream dark:bg-slate-800 border-2 border-brand-gold/20 rounded-2xl px-5 py-4 text-sm font-bold text-brand-red focus:border-brand-red outline-none transition-all shadow-inner"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleGetTravelPlan()}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handleGetTravelPlan}
                        disabled={isLoadingTravel || !city.trim()}
                        className="flex-1 py-4 bg-brand-red text-white rounded-2xl font-black active:scale-95 flex items-center justify-center gap-3 shadow-lg border border-brand-gold/30 disabled:opacity-50"
                      >
                        <i className="fa-solid fa-paper-plane-departure text-brand-gold"></i>
                        KHỞI HÀNH
                      </button>
                      <button onClick={() => setShowCityInput(false)} className="w-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center">
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {savedTravelPlan && (
        <div className="pb-12 w-full">
          <TravelSection plan={savedTravelPlan.plan} city={savedTravelPlan.city} sources={savedTravelPlan.sources} />
        </div>
      )}
    </div>
  );
};
