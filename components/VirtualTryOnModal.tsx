
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateAITryOn } from '../services/geminiService';

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  bodyImage: string | null;
  topImage?: string;
  bottomImage?: string;
  fullBodyImage?: string;
  fitScore: number;
  styleMatch: number;
  analysis: string;
  recommendation: string;
  silhouette: string;
  offsets?: any;
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  isOpen,
  onClose,
  bodyImage,
  topImage,
  bottomImage,
  fullBodyImage,
  fitScore,
  styleMatch,
  analysis,
  recommendation,
  silhouette,
  offsets
}) => {
  const [bgMode, setBgMode] = React.useState<'studio' | 'dark' | 'minimal' | 'street' | 'transparent'>('studio');
  const [showOriginal, setShowOriginal] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      handleGenerateAI();
    } else {
      setGeneratedImage(null);
    }
  }, [isOpen, bodyImage, topImage, bottomImage, fullBodyImage]);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      console.log("Starting real AI Try-On generation...");
      console.log("Body Image present:", !!bodyImage);
      console.log("Top Image present:", !!topImage);
      console.log("Bottom Image present:", !!bottomImage);
      console.log("Full Body Image present:", !!fullBodyImage);
      
      const result = await generateAITryOn(bodyImage, topImage || null, bottomImage || null, bgMode, fullBodyImage || null);
      if (result) {
        console.log("Successfully generated AI image");
        setGeneratedImage(result);
      } else {
        console.warn("AI generation returned null result");
      }
    } catch (err) {
      console.error("Critical AI generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.download = `luckydream-tryon-${Date.now()}.png`;
      link.href = generatedImage;
      link.click();
      return;
    }
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `luckydream-ai-fit-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const bgConfig = {
    studio: 'bg-white dark:bg-slate-900',
    dark: 'bg-slate-950',
    minimal: 'bg-brand-cream/30 dark:bg-slate-800/50',
    street: 'bg-slate-100 dark:bg-slate-900',
    transparent: 'bg-transparent'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border border-brand-gold/20 flex flex-col max-h-[90vh] mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b border-brand-gold/10 shrink-0">
               <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-red rounded-xl md:rounded-2xl flex items-center justify-center text-brand-gold shadow-lg shadow-brand-red/20 shrink-0">
                     <i className="fa-solid fa-wand-magic-sparkles text-sm md:text-xl"></i>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm md:text-lg font-black text-brand-red dark:text-brand-gold uppercase tracking-tighter leading-none truncate">AI Fitting Lab</h2>
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">Neural Graphics Engine v3.0</p>
                  </div>
               </div>
               <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                 <button 
                   onClick={handleDownload}
                   className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-500 transition-all active:scale-90"
                   title="Tải ảnh xuống"
                 >
                   <i className="fa-solid fa-download text-xs md:text-base"></i>
                 </button>
                 <button 
                   onClick={onClose}
                   className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-red transition-all active:scale-90"
                   aria-label="Đóng"
                 >
                   <i className="fa-solid fa-xmark text-xs md:text-base"></i>
                 </button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
              {/* Main Preview Container */}
              <div className="relative group/canvas">
                {/* Status Badges - Moved above image to avoid face overlap */}
                {!isGenerating && (
                  <div className="flex items-center justify-between mb-3 px-2">
                    <div className="px-3 py-1.5 bg-brand-red text-white text-[9px] font-black rounded-xl shadow-lg flex items-center gap-2 border border-brand-gold/20">
                      <i className="fa-solid fa-bolt text-brand-gold animate-pulse"></i>
                      <span>PROCESSED: {silhouette.toUpperCase()}</span>
                    </div>
                    <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-brand-gold/10 text-slate-500 dark:text-slate-400 text-[9px] font-black rounded-xl">
                      REALISM: 98.4%
                    </div>
                  </div>
                )}

                <div className={`relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-gold/10 transition-colors duration-500 ${bgConfig[bgMode]}`}>
                  {isGenerating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-slate-900">
                       <div className="w-20 h-20 relative">
                          <div className="absolute inset-0 border-4 border-brand-gold/20 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
                          <i className="fa-solid fa-shirt absolute inset-0 flex items-center justify-center text-brand-red text-2xl animate-pulse"></i>
                       </div>
                       <div className="text-center space-y-2">
                          <p className="text-xs font-black text-brand-red uppercase tracking-widest">Aura Scan & Fitting</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase animate-pulse max-w-[200px] text-center">AI đang mô phỏng chất liệu và fit đồ lên cơ thể...</p>
                       </div>
                       
                       <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                       </div>
                    </div>
                  ) : (showOriginal && bodyImage) ? (
                    <img src={bodyImage} className="w-full h-full object-cover" alt="Original Body" />
                  ) : (generatedImage || bodyImage) ? (
                    <div className="relative w-full h-full">
                       {bodyImage && <img src={bodyImage} className="w-full h-full object-cover" alt="Body Base" />}
                       
                       {/* 2D Overlay Fallback if no generated image */}
                       {!generatedImage && bodyImage && offsets && (
                         <>
                           {/* Bottom first for layering */}
                           {offsets.bottom && bottomImage && (
                             <img 
                               src={bottomImage} 
                               className="absolute pointer-events-none transition-all duration-700" 
                               style={{
                                 left: `${offsets.bottom.x}%`,
                                 top: `${offsets.bottom.y}%`,
                                 transform: `translate(-50%, -50%) scale(${offsets.bottom.scale}) rotate(${offsets.bottom.rotation || 0}deg) skewX(${offsets.bottom.skewX || 0}deg)`,
                                 width: '100%',
                                 zIndex: offsets.bottom.zIndex || 1
                               }}
                               alt="Top Overlay"
                             />
                           )}
                           {offsets.top && topImage && (
                             <img 
                               src={topImage} 
                               className="absolute pointer-events-none transition-all duration-700" 
                               style={{
                                 left: `${offsets.top.x}%`,
                                 top: `${offsets.top.y}%`,
                                 transform: `translate(-50%, -50%) scale(${offsets.top.scale}) rotate(${offsets.top.rotation || 0}deg) skewX(${offsets.top.skewX || 0}deg)`,
                                 width: '100%',
                                 zIndex: offsets.top.zIndex || 2
                               }}
                               alt="Top Overlay"
                             />
                           )}
                            {/* Full body overlay */}
                            {offsets.full_body && fullBodyImage && (
                              <img 
                                src={fullBodyImage} 
                                className="absolute pointer-events-none transition-all duration-700" 
                                style={{
                                  left: `${offsets.full_body.x}%`,
                                  top: `${offsets.full_body.y}%`,
                                  transform: `translate(-50%, -50%) scale(${offsets.full_body.scale}) rotate(${offsets.full_body.rotation || 0}deg) skewX(${offsets.full_body.skewX || 0}deg)`,
                                  width: '100%',
                                  zIndex: offsets.full_body.zIndex || 1
                                }}
                                alt="Full Body Overlay"
                              />
                            )}
                         </>
                       )}

                       {generatedImage && <img src={generatedImage} className="absolute inset-0 w-full h-full object-cover" alt="AI Try On Result" />}
                       
                       {!generatedImage && (
                         <div className="absolute top-4 right-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
                            <span className="text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                               <i className="fa-solid fa-microchip text-brand-gold animate-pulse"></i>
                               Smart 2D Overlay Mode
                            </span>
                         </div>
                       )}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800">
                       <i className="fa-solid fa-triangle-exclamation text-brand-red text-3xl mb-4"></i>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center px-8">
                         Không thể tạo ảnh phối đồ thật. Hãy kiểm tra kết nối và thử lại.
                       </p>
                    </div>
                  )}
                  
                  {/* Overlay Controls */}
                  {!isGenerating && (
                    <>
                      {/* Comparison Toggle Button */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                        <button 
                          onMouseDown={() => setShowOriginal(true)}
                          onMouseUp={() => setShowOriginal(false)}
                          onTouchStart={() => setShowOriginal(true)}
                          onTouchEnd={() => setShowOriginal(false)}
                          className="px-6 py-3 bg-white/20 backdrop-blur-xl border border-white/30 text-white text-[11px] font-black uppercase rounded-full shadow-2xl active:scale-90 transition-all flex items-center gap-2 group"
                        >
                          <i className="fa-solid fa-eye text-brand-gold group-active:text-brand-red"></i>
                          Xem ảnh gốc
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Environment Simulation</h4>
                    <p className="text-[9px] font-bold text-brand-red uppercase">Live Rendering</p>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                      { id: 'studio', name: 'Studio White', icon: 'fa-camera-retro' },
                      { id: 'dark', name: 'Elite Dark', icon: 'fa-moon' },
                      { id: 'minimal', name: 'Minimal', icon: 'fa-couch' },
                      { id: 'street', name: 'Urban Street', icon: 'fa-city' },
                      { id: 'transparent', name: 'Mask Only', icon: 'fa-user-ninja' },
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setBgMode(mode.id as any)}
                        className={`flex-shrink-0 px-4 py-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                          bgMode === mode.id 
                            ? 'bg-brand-red border-brand-gold text-white shadow-lg scale-95' 
                            : 'bg-white dark:bg-slate-800 border-brand-gold/10 text-slate-500'
                        }`}
                      >
                         <i className={`fa-solid ${mode.icon} text-xs`}></i>
                         <span className="text-[10px] font-black uppercase tracking-tight whitespace-nowrap">{mode.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Analysis Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-brand-cream/50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-brand-gold/10 space-y-3 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-brand-red/5 text-6xl group-hover:scale-125 transition-transform">
                      <i className="fa-solid fa-shirt"></i>
                    </div>
                    <div className="flex items-center gap-2">
                       <i className="fa-solid fa-dna text-brand-red text-xs"></i>
                       <h5 className="text-[10px] font-black text-brand-red dark:text-brand-gold uppercase tracking-widest">Fit Optimization</h5>
                    </div>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed relative z-10">"{analysis}"</p>
                  </div>

                  <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-5 rounded-[2rem] border border-emerald-500/20 space-y-3 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-emerald-500/5 text-6xl group-hover:scale-125 transition-transform">
                      <i className="fa-solid fa-sparkles"></i>
                    </div>
                    <div className="flex items-center gap-2">
                       <i className="fa-solid fa-brain text-emerald-500 text-xs"></i>
                       <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">AI Stylist Verdict</h5>
                    </div>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-emerald-300 leading-relaxed italic relative z-10">{recommendation}</p>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-[2rem] border border-brand-gold/20 flex items-center justify-between shadow-xl">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                         <i className="fa-solid fa-microchip text-xl"></i>
                      </div>
                      <div>
                         <p className="text-[12px] font-black uppercase leading-none tracking-tight">Neural Match Confidence</p>
                         <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest mt-1">Based on global style trends</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-2xl font-black text-white">{styleMatch}%</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 pt-2 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3">
               <button 
                 onClick={onClose}
                 className="flex-1 py-5 bg-white dark:bg-slate-900 border-2 border-brand-gold/20 text-brand-red dark:text-brand-gold text-[12px] font-black uppercase rounded-[1.5rem] active:scale-95 transition-all shadow-sm"
               >
                 Tùy chỉnh thêm
               </button>
               <button className="flex-[2] py-5 bg-brand-red text-brand-gold text-[12px] font-black uppercase rounded-[1.5rem] active:scale-95 transition-all shadow-2xl shadow-brand-red/30 flex items-center justify-center gap-3">
                  <i className="fa-solid fa-credit-card"></i>
                  Đặt mua ngay
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
