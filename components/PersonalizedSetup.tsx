
import React, { useState, useMemo } from 'react';
import { onboardingManager } from '../services/onboardingManager';

interface PersonalizedSetupProps {
  onComplete: (settings: any) => void;
  onThemeChange: (isDark: boolean) => void;
}

export const PersonalizedSetup: React.FC<PersonalizedSetupProps> = ({ onComplete, onThemeChange }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [data, setData] = useState({
    isFirstTime: true,
    goal: '' as string,
    theme: 'light'
  });

  const nextStep = () => {
    setDirection('next');
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setDirection('prev');
    setStep(s => s - 1);
  };
  
  const finish = () => {
    onboardingManager.complete(data);
    onComplete(data);
  };

  const selectGoal = (goal: string) => {
    setData(prev => ({ ...prev, goal }));
  };

  // Logic định danh người dùng dựa trên các lựa chọn cập nhật theo yêu cầu
  const userPersona = useMemo(() => {
    if (data.isFirstTime) {
      if (data.goal === 'Phối đồ Outfit') return { title: 'Style Starter', sub: 'Khởi đầu phong cách', icon: 'fa-wand-magic-sparkles' };
      if (data.goal === 'Tìm địa điểm du lịch') return { title: 'Travel Explorer', sub: 'Khám phá hành trình', icon: 'fa-earth-asia' };
      return { title: 'Lifestyle Explorer', sub: 'Khám phá phong cách sống', icon: 'fa-gem' };
    } else {
      if (data.goal === 'Phối đồ Outfit') return { title: 'Style Pro', sub: 'Chuyên gia phong cách', icon: 'fa-star' };
      if (data.goal === 'Tìm địa điểm du lịch') return { title: 'Travel Pro', sub: 'Chuyên gia lữ hành', icon: 'fa-plane-departure' };
      return { title: 'Lifestyle Pro', sub: 'Chuyên gia phong cách sống', icon: 'fa-crown' };
    }
  }, [data.isFirstTime, data.goal]);

  const animationClass = direction === 'next' 
    ? 'animate-in slide-in-from-right duration-500' 
    : 'animate-in slide-in-from-left duration-500';

  return (
    <div className="fixed inset-0 z-[3000] bg-brand-cream dark:bg-slate-950 flex flex-col items-center py-16 px-8 overflow-hidden transition-colors duration-500">
      
      {/* Top Header: Back Button & Progress Bar */}
      {step < 4 && (
        <div className="w-full max-w-xs flex flex-col gap-6 mb-12">
          <div className="flex items-center justify-between">
            {step > 1 ? (
              <button 
                onClick={prevStep}
                className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-brand-red dark:text-brand-gold shadow-md border border-brand-gold/20 active:scale-90 transition-all"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
            ) : (
              <div className="w-10 h-10" />
            )}
            
            <div className="flex-1 px-8">
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-brand-gold' : 'bg-slate-200 dark:bg-slate-800'}`} />
                ))}
              </div>
            </div>
            
            <div className="w-10 h-10" />
          </div>
        </div>
      )}

      <div className={`flex-1 w-full max-w-xs flex flex-col items-center justify-center text-center space-y-10 ${animationClass}`}>
        
        {step === 1 && (
          <div className="space-y-10 w-full">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-brand-red dark:text-brand-gold uppercase italic tracking-tighter leading-tight">Chào mừng<br/>đến LuckyDream</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Bạn đã từng sử dụng ứng dụng này chưa?</p>
            </div>
            <div className="grid grid-cols-1 gap-4 w-full">
              <button 
                onClick={() => { setData({...data, isFirstTime: true}); nextStep(); }}
                className="p-6 bg-white dark:bg-slate-900 border-2 border-brand-gold/10 rounded-[2.5rem] flex items-center gap-4 hover:border-brand-gold transition-all group shadow-sm"
              >
                <div className="w-14 h-14 bg-brand-red/5 rounded-2xl flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-brand-gold transition-all flex-shrink-0">
                  <i className="fa-solid fa-user-plus text-xl"></i>
                </div>
                <div className="text-left">
                  <p className="font-black text-brand-red dark:text-slate-100 uppercase text-xs">Tôi là người mới</p>
                  <p className="text-[9px] text-slate-400 font-bold leading-tight mt-0.5">Bắt đầu trải nghiệm thời trang AI</p>
                </div>
              </button>
              <button 
                onClick={() => { setData({...data, isFirstTime: false}); nextStep(); }}
                className="p-6 bg-white dark:bg-slate-900 border-2 border-brand-gold/10 rounded-[2.5rem] flex items-center gap-4 hover:border-brand-gold transition-all group shadow-sm"
              >
                <div className="w-14 h-14 bg-brand-gold/5 rounded-2xl flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-red transition-all flex-shrink-0">
                  <i className="fa-solid fa-user-check text-xl"></i>
                </div>
                <div className="text-left">
                  <p className="font-black text-brand-red dark:text-slate-100 uppercase text-xs">Đã từng sử dụng</p>
                  <p className="text-[9px] text-slate-400 font-bold leading-tight mt-0.5">Tiếp tục hành trình thượng lưu</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 w-full flex flex-col">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-brand-red dark:text-brand-gold uppercase italic tracking-tighter leading-tight">Mục tiêu<br/>của bạn</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Bạn muốn trải nghiệm điều gì?</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 w-full">
              <button 
                onClick={() => selectGoal('Phối đồ Outfit')}
                className={`p-5 bg-white dark:bg-slate-900 border-2 rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-sm active:scale-95 ${
                  data.goal === 'Phối đồ Outfit' ? 'border-brand-red ring-1 ring-brand-red' : 'border-brand-gold/10'
                }`}
              >
                <i className={`fa-solid fa-shirt ${data.goal === 'Phối đồ Outfit' ? 'text-brand-red' : 'text-brand-red/50'}`}></i>
                <span className={`font-black uppercase text-[11px] tracking-widest ${data.goal === 'Phối đồ Outfit' ? 'text-brand-red' : 'text-brand-red/50'}`}>Phối đồ Outfit</span>
              </button>

              <button 
                onClick={() => selectGoal('Tìm địa điểm du lịch')}
                className={`p-5 bg-white dark:bg-slate-900 border-2 rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-sm active:scale-95 ${
                  data.goal === 'Tìm địa điểm du lịch' ? 'border-brand-red ring-1 ring-brand-red' : 'border-brand-gold/10'
                }`}
              >
                <i className={`fa-solid fa-map-location-dot ${data.goal === 'Tìm địa điểm du lịch' ? 'text-brand-red' : 'text-brand-red/50'}`}></i>
                <span className={`font-black uppercase text-[11px] tracking-widest ${data.goal === 'Tìm địa điểm du lịch' ? 'text-brand-red' : 'text-brand-red/50'}`}>Tìm địa điểm du lịch</span>
              </button>

              <button 
                onClick={() => selectGoal('Cả hai')}
                className={`p-6 rounded-[2rem] flex flex-col items-center justify-center gap-1 shadow-2xl active:scale-95 transition-all group relative overflow-hidden border-2 ${
                  data.goal === 'Cả hai' ? 'bg-brand-red border-brand-gold' : 'bg-brand-red/90 border-transparent opacity-80'
                }`}
              >
                <div className="absolute inset-0 bg-brand-gold opacity-5 animate-pulse"></div>
                <div className="relative z-10 flex items-center gap-2">
                   <i className="fa-solid fa-crown text-brand-gold"></i>
                   <span className="font-black text-brand-goldLight uppercase text-[12px] tracking-widest">Cả hai trải nghiệm</span>
                </div>
                <span className="relative z-10 text-[9px] font-black text-white uppercase italic tracking-[0.4em]">
                  (KHUYẾN KHÍCH)
                </span>
              </button>
            </div>

            <button 
              onClick={nextStep}
              disabled={!data.goal}
              className={`w-full py-5 rounded-[1.8rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all border border-brand-gold/30 mt-10 flex items-center justify-center gap-2 ${
                data.goal ? 'bg-brand-gold text-brand-red' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
              }`}
            >
              Tiếp tục
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 w-full flex flex-col">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-brand-red dark:text-brand-gold uppercase italic tracking-tighter leading-tight">Phong cách<br/>giao diện</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Chọn chế độ hiển thị</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { setData({...data, theme: 'light'}); onThemeChange(false); }}
                className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center gap-4 transition-all ${data.theme === 'light' ? 'bg-white border-brand-red shadow-2xl scale-105' : 'bg-slate-50/50 border-transparent opacity-50 dark:bg-slate-800'}`}
              >
                <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center shadow-inner">
                  <i className="fa-solid fa-sun text-2xl"></i>
                </div>
                <span className="text-[10px] font-black uppercase text-brand-red tracking-widest">Sáng</span>
              </button>
              <button 
                onClick={() => { setData({...data, theme: 'dark'}); onThemeChange(true); }}
                className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center gap-4 transition-all ${data.theme === 'dark' ? 'bg-slate-900 border-brand-gold shadow-2xl scale-105' : 'bg-slate-800/50 border-transparent opacity-50'}`}
              >
                <div className="w-14 h-14 bg-indigo-900/40 text-indigo-400 rounded-2xl flex items-center justify-center shadow-inner">
                  <i className="fa-solid fa-moon text-2xl"></i>
                </div>
                <span className="text-[10px] font-black uppercase text-brand-gold tracking-widest">Tối</span>
              </button>
            </div>
            
            <button 
              onClick={nextStep}
              className="w-full py-5 bg-brand-red text-brand-goldLight rounded-[1.8rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all border border-brand-gold/30 mt-8"
            >
              Hoàn tất thiết lập
              <i className="fa-solid fa-check ml-3"></i>
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-12 w-full flex flex-col items-center animate-in zoom-in duration-700">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-gold/20 rounded-full blur-[80px] -z-10 animate-pulse"></div>

            <div className="relative">
              <div className="w-40 h-40 bg-brand-red rounded-[3.5rem] flex items-center justify-center text-brand-gold shadow-[0_0_50px_rgba(212,175,55,0.3)] border-4 border-brand-gold transition-transform hover:scale-105 duration-500">
                <i className={`fa-solid ${userPersona.icon} text-6xl`}></i>
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                <i className="fa-solid fa-crown text-brand-red"></i>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.5em]">{userPersona.sub}</p>
                <h2 className="text-4xl font-black text-brand-red dark:text-brand-gold uppercase italic tracking-tighter leading-none">
                  {userPersona.title}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold max-w-[240px] leading-relaxed mx-auto">
                LuckyDream đã sẵn sàng đồng hành cùng bạn trên hành trình khẳng định bản sắc.
              </p>
            </div>

            <button 
              onClick={finish}
              className="w-full py-5 bg-brand-red text-brand-goldLight rounded-[1.8rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all border border-brand-gold/30 mt-10"
            >
              Bắt đầu hành trình
              <i className="fa-solid fa-arrow-right ml-3"></i>
            </button>
          </div>
        )}
      </div>

      {/* Footer Identity */}
      <div className="mt-auto pt-10 text-[8px] font-black text-slate-400 uppercase tracking-[0.6em] opacity-50">
        Tailored Ecosystem • LuckyDream
      </div>
    </div>
  );
};
