
import React from 'react';
import { TravelPlan } from '../types';

interface TravelSectionProps {
  plan: TravelPlan;
  city: string;
  sources: any[];
}

export const TravelSection: React.FC<TravelSectionProps> = ({ plan, city, sources }) => {
  // Đảm bảo plan luôn có cấu trúc tối thiểu để map không bị lỗi
  const luxury = plan?.luxury || [];
  const local = plan?.local || [];
  const transportation = plan?.transportation || [];

  const openInGoogleMaps = (name: string, address: string) => {
    const query = encodeURIComponent(`${name} ${address}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      {/* Visual Identity for the City */}
      <div className="bg-brand-red dark:bg-indigo-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border-b-4 border-brand-gold/50">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-[2px] bg-brand-gold"></span>
            <span className="text-[10px] font-black text-brand-goldLight uppercase tracking-[0.3em]">HÀNH TRÌNH THƯỢNG LƯU</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase text-brand-goldLight">{city}</h2>
          <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-brand-gold/20">
            <p className="text-xs text-white/90 leading-relaxed font-semibold italic">
              <i className="fa-solid fa-quote-left mr-2 opacity-50 text-brand-gold"></i>
              {plan?.culturalNote || "Chúc bạn có một chuyến đi tuyệt vời!"}
            </p>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none rotate-12 text-brand-gold">
          <i className="fa-solid fa-city text-[200px]"></i>
        </div>
      </div>

      {/* Places & Food Recommendation Engine */}
      <section className="space-y-10">
        
        {/* Category 1: Luxury Experience */}
        {luxury.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black text-brand-red dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-crown text-brand-gold"></i> Trải nghiệm Sang Trọng
              </h3>
              <span className="text-[8px] font-black text-brand-gold/40 uppercase">GOLD CLASS</span>
            </div>
            <div className="space-y-4">
              {luxury.map((loc, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-md border border-brand-gold/20 dark:border-slate-800 space-y-4 relative group active:scale-[0.98] transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-brand-red dark:text-brand-gold text-lg leading-tight uppercase tracking-tight break-words">{loc.name}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold flex items-center gap-1 mt-1 truncate">
                        <i className="fa-solid fa-location-dot text-brand-gold flex-shrink-0"></i> {loc.address}
                      </p>
                    </div>
                  </div>

                  {/* Google Maps Shortcut Button */}
                  <button 
                    onClick={() => openInGoogleMaps(loc.name, loc.address)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-cream dark:bg-slate-800 border border-brand-gold/30 rounded-full text-[10px] font-black text-brand-red dark:text-brand-goldLight uppercase tracking-tighter hover:bg-brand-gold/10 transition-colors shadow-sm"
                  >
                    <i className="fa-solid fa-map-location-dot"></i>
                    Địa điểm chi tiết
                  </button>

                  <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed font-semibold break-words">{loc.description}</p>
                  
                  <div className="p-4 bg-brand-red/5 dark:bg-brand-red/10 rounded-2xl border border-brand-gold/20 flex gap-4 items-center">
                    <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center text-brand-gold shadow-md flex-shrink-0">
                      <i className="fa-solid fa-utensils"></i>
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-[9px] font-black text-brand-red uppercase">Gợi ý ẩm thực</p>
                      <p className="text-xs font-black text-slate-900 dark:text-slate-200 tracking-tight break-words line-clamp-2">{loc.specialtyFood}</p>
                      <p className="text-[9px] text-slate-500 dark:text-slate-600 font-medium truncate">{loc.foodAddress}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category 2: Local Connection */}
        {local.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black text-brand-red dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-street-view text-brand-gold"></i> Tinh hoa bản địa
              </h3>
              <span className="text-[8px] font-black text-brand-gold/40 uppercase">AUTHENTIC</span>
            </div>
            <div className="space-y-4">
              {local.map((loc, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-md border border-brand-gold/20 dark:border-slate-800 space-y-4 active:scale-[0.98] transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-brand-red dark:text-brand-gold text-lg leading-tight uppercase tracking-tight break-words">{loc.name}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold flex items-center gap-1 mt-1 truncate">
                        <i className="fa-solid fa-location-dot text-brand-gold flex-shrink-0"></i> {loc.address}
                      </p>
                    </div>
                  </div>

                  {/* Google Maps Shortcut Button */}
                  <button 
                    onClick={() => openInGoogleMaps(loc.name, loc.address)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-cream dark:bg-slate-800 border border-brand-gold/30 rounded-full text-[10px] font-black text-brand-red dark:text-brand-goldLight uppercase tracking-tighter hover:bg-brand-gold/10 transition-colors shadow-sm"
                  >
                    <i className="fa-solid fa-map-location-dot"></i>
                    Địa điểm chi tiết
                  </button>

                  <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed font-semibold break-words">{loc.description}</p>
                  
                  <div className="p-4 bg-brand-gold/5 dark:bg-slate-800 rounded-2xl border border-brand-gold/20 flex gap-4 items-center">
                    <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center text-brand-gold shadow-md flex-shrink-0">
                      <i className="fa-solid fa-bowl-food"></i>
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-[9px] font-black text-brand-red uppercase">Món ngon nên thử</p>
                      <p className="text-xs font-black text-slate-900 dark:text-slate-200 tracking-tight break-words line-clamp-2">{loc.specialtyFood}</p>
                      <p className="text-[9px] text-slate-500 dark:text-slate-600 font-medium truncate">{loc.foodAddress}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Smart Transportation Infrastructure */}
      {transportation.length > 0 && (
        <section className="bg-brand-red dark:bg-slate-900/60 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl border-t-2 border-brand-gold/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-red text-xs border border-white/20">
              <i className="fa-solid fa-car-rear"></i>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-brand-goldLight">Phương tiện di chuyển</h3>
          </div>
          <div className="space-y-4">
            {transportation.map((t, i) => (
              <div key={i} className="bg-white/10 p-5 rounded-[1.5rem] border border-brand-gold/20 group active:bg-white/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase text-brand-goldLight tracking-wider">{t.service}</span>
                  <i className="fa-solid fa-chevron-right text-[8px] text-brand-gold opacity-50 group-hover:opacity-100"></i>
                </div>
                <p className="text-[11px] text-white/80 mb-4 leading-relaxed font-semibold">{t.description}</p>
                <div className="text-[10px] font-mono bg-brand-gold/20 py-2 px-3 rounded-xl flex items-center gap-2 overflow-hidden border border-brand-gold/10">
                  <i className="fa-solid fa-link text-brand-gold opacity-70"></i>
                  <span className="truncate opacity-90">{t.contactInfo}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-brand-goldLight/40 text-center italic">Đẳng cấp trong từng điểm đến cùng LuckyDream.</p>
        </section>
      )}

      {/* Verified Web Sources */}
      {sources.length > 0 && (
        <div className="px-6 pt-2 pb-8">
          <div className="flex items-center gap-2 mb-4">
             <i className="fa-brands fa-google text-brand-red/20 dark:text-slate-700"></i>
             <p className="text-[8px] text-brand-red/40 dark:text-slate-600 uppercase font-black tracking-[0.2em]">Thông tin được bảo chứng</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {sources.map((s, i) => s.web && (
              <a key={i} href={s.web.uri} target="_blank" rel="noopener noreferrer" className="text-[8px] bg-white dark:bg-slate-900 border border-brand-gold/20 hover:bg-brand-gold/5 dark:hover:bg-slate-800 px-3 py-1.5 rounded-full text-brand-red dark:text-slate-400 font-black transition-colors truncate max-w-[120px] shadow-sm">
                {s.web.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
