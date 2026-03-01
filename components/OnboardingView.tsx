
import React, { useState } from 'react';

interface OnboardingViewProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    title: "AI FASHION STYLIST",
    subtitle: "Trí tuệ nhân tạo phối đồ",
    description: "Sử dụng Gemini AI để phân tích tủ đồ của bạn và đưa ra những gợi ý phối đồ thời thượng nhất.",
    icon: "fa-wand-magic-sparkles",
    bg: "bg-brand-red"
  },
  {
    title: "TRAVEL EXPLORER",
    subtitle: "Hành trình thực tế",
    description: "Khám phá các điểm đến, quán cafe và nhà hàng phù hợp với phong cách bộ đồ bạn đang mặc.",
    icon: "fa-map-location-dot",
    bg: "bg-brand-dark"
  },
  {
    title: "ELITE COMMUNITY",
    subtitle: "Cộng đồng thượng lưu",
    description: "Kết nối, chia sẻ, mua hoặc cho thuê trang phục trong cộng đồng thời trang đẳng cấp.",
    icon: "fa-crown",
    bg: "bg-brand-red"
  }
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className={`fixed inset-0 z-[2000] ${slide.bg} transition-colors duration-1000 flex flex-col items-center py-16 px-8 overflow-hidden`}>
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-gold rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Top Header Section (Progress Dots) */}
      <div className="w-full max-w-xs flex flex-col items-center mb-12 relative z-10">
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-brand-gold' : 'w-2 bg-white/30'}`}
            />
          ))}
        </div>
      </div>

      {/* Middle Content Section (Icon & Text) - centered like Setup screens */}
      <div className="flex-1 w-full max-w-xs flex flex-col items-center justify-center text-center space-y-10 relative z-10">
        <div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-[3rem] border-2 border-brand-gold flex items-center justify-center shadow-2xl animate-in zoom-in duration-700">
          <i className={`fa-solid ${slide.icon} text-5xl text-brand-gold`}></i>
        </div>

        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em]">{slide.subtitle}</h3>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{slide.title}</h2>
          </div>
          <p className="text-sm text-white/70 font-medium leading-relaxed">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Bottom Action Section - Positioning aligned with Setup screens */}
      <div className="w-full max-w-xs flex flex-col gap-4 relative z-10 mt-10">
        <button 
          onClick={handleNext}
          className="w-full py-5 bg-brand-gold text-brand-red rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/20"
        >
          {currentSlide === SLIDES.length - 1 ? "Bắt đầu ngay" : "Tiếp theo"}
          <i className="fa-solid fa-arrow-right text-xs"></i>
        </button>
        
        {currentSlide < SLIDES.length - 1 ? (
          <button 
            onClick={onComplete}
            className="w-full py-4 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
          >
            Bỏ qua giới thiệu
          </button>
        ) : (
          <div className="h-12" /> /* Spacer to keep "Bắt đầu ngay" at same height as previous buttons */
        )}
      </div>

      {/* Footer Identity */}
      <div className="mt-auto pt-10 text-[8px] font-black text-white/20 uppercase tracking-[0.8em] text-center">
        LuckyDream VN Edition
      </div>
    </div>
  );
};
