import React from 'react';
import { motion } from 'motion/react';
import { FashionStyle } from '../types';

interface FashionStyleDetailProps {
  style: FashionStyle;
  onClose: () => void;
}

export const FashionStyleDetail: React.FC<FashionStyleDetailProps> = ({ style, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[300] bg-brand-cream dark:bg-slate-950 flex flex-col"
    >
      {/* Header Image & Close Button */}
      <div className="relative h-[40vh] md:h-[45vh] w-full shrink-0">
        <img 
          src={style.bannerImage} 
          alt={style.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-brand-cream dark:to-slate-950"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-10 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 active:scale-90 transition-all z-10"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>

        <div className="absolute bottom-6 left-6 right-6">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="w-12 h-12 bg-brand-red rounded-2xl flex items-center justify-center text-brand-gold border border-brand-gold/30 shadow-lg">
              <i className={`fa-solid ${style.icon} text-xl`}></i>
            </div>
            <h1 className="text-3xl font-black text-brand-red dark:text-brand-goldLight uppercase tracking-tight drop-shadow-sm">
              {style.name}
            </h1>
          </motion.div>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed max-w-lg"
          >
            {style.description}
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-12 pt-4 smooth-scroll scrollbar-hide">
        <div className="max-w-2xl mx-auto space-y-10">
          
          {/* Section: Knowledge */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-brand-red rounded-full"></div>
              <h3 className="text-xs font-black text-brand-red dark:text-slate-200 uppercase tracking-widest">Kiến thức thời trang</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm">
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic">
                "{style.knowledge}"
              </p>
            </div>
          </section>

          {/* Section: Characteristics */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-brand-red rounded-full"></div>
              <h3 className="text-xs font-black text-brand-red dark:text-slate-200 uppercase tracking-widest">Đặc điểm nhận diện</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {style.characteristics.map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-brand-gold/5">
                  <div className="w-8 h-8 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
                    <i className="fa-solid fa-check text-[10px]"></i>
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Key Items */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-brand-red rounded-full"></div>
              <h3 className="text-xs font-black text-brand-red dark:text-slate-200 uppercase tracking-widest">Items đặc trưng</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {style.characteristicItems.map((item, i) => (
                <span key={i} className="px-4 py-2 bg-brand-gold/10 text-brand-red dark:text-brand-goldLight text-[10px] font-black uppercase rounded-full border border-brand-gold/20">
                  {item}
                </span>
              ))}
            </div>
          </section>

          {/* Section: Representative Outfit */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-brand-red rounded-full"></div>
              <h3 className="text-xs font-black text-brand-red dark:text-slate-200 uppercase tracking-widest">Outfit tiêu biểu</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-xl border border-brand-gold/10">
              <div className="aspect-[4/5] w-full relative">
                <img src={style.representativeOutfit.image} alt={style.representativeOutfit.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-red/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h4 className="text-xl font-black text-brand-goldLight uppercase mb-1">{style.representativeOutfit.name}</h4>
                  <p className="text-white/80 text-xs font-medium">{style.representativeOutfit.description}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Gallery */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-brand-red rounded-full"></div>
              <h3 className="text-xs font-black text-brand-red dark:text-slate-200 uppercase tracking-widest">Gallery ảnh</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {style.gallery.map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-brand-gold/10">
                  <img src={img} className="w-full h-full object-cover active:scale-110 transition-transform duration-500" alt={`Style gallery ${i}`} referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </section>

          {/* Section: Tips & Accessories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-brand-red rounded-full"></div>
                <h3 className="text-xs font-black text-brand-red dark:text-slate-200 uppercase tracking-widest">Tips phối đồ</h3>
              </div>
              <div className="space-y-3">
                {style.stylingTips.map((tip, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-brand-gold font-black italic">0{i+1}.</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-brand-red rounded-full"></div>
                <h3 className="text-xs font-black text-brand-red dark:text-slate-200 uppercase tracking-widest">Gợi ý phụ kiện</h3>
              </div>
              <div className="bg-brand-red/5 dark:bg-brand-gold/5 p-6 rounded-[2rem] border border-brand-gold/10">
                <ul className="space-y-3">
                  {style.accessories.map((acc, i) => (
                    <li key={i} className="flex items-center gap-3 text-[11px] font-black text-brand-red dark:text-brand-goldLight uppercase tracking-tight">
                      <div className="w-1.5 h-1.5 bg-brand-gold rounded-full"></div>
                      {acc}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* Bottom Action */}
          <div className="pt-8 text-center">
            <button 
              onClick={onClose}
              className="px-12 py-5 bg-brand-red text-brand-gold font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Quay lại khám phá
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
