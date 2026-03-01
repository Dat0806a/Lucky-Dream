
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === 'register' && !name) return;
    
    setLoading(true);
    setError(null);
    try {
      let user;
      if (mode === 'login') {
        user = await authService.signInEmail(email, password);
      } else {
        user = await authService.signUpEmail(name, email, password);
      }
      onLoginSuccess(user);
    } catch (e: any) {
      console.error(e);
      let msg = e.message || 'Đã xảy ra lỗi';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Email hoặc mật khẩu không chính xác';
      } else if (msg.includes('User already registered')) {
        msg = 'Email này đã được đăng ký';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-brand-cream dark:bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-brand-gold rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[250px] h-[250px] bg-brand-red rounded-full blur-[80px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm px-8 flex flex-col items-center text-center">
        {/* Logo Section */}
        <div className="mb-12 animate-in fade-in zoom-in duration-700">
          <div className="w-20 h-20 bg-brand-red rounded-[2rem] border-2 border-brand-gold flex items-center justify-center shadow-2xl mb-4 mx-auto transition-transform hover:scale-110 duration-500">
            <i className="fa-solid fa-user-tie text-3xl text-brand-gold"></i>
          </div>
          <h1 className="text-4xl font-black text-brand-red dark:text-brand-gold uppercase tracking-tighter italic">LuckyDream</h1>
          <p className="text-[10px] font-black text-brand-gold/60 uppercase tracking-[0.4em] mt-1">Việt Nam Edition</p>
        </div>

        {error && (
          <div className="w-full mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tight flex items-center justify-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-6 animate-pulse">
            <div className="w-12 h-12 border-4 border-brand-gold border-t-brand-red rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-brand-red uppercase tracking-widest">Đang xác thực phong cách...</p>
          </div>
        ) : mode === 'welcome' ? (
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight uppercase tracking-tight">
              Mỗi bộ đồ<br />một câu chuyện phù hợp
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 px-4 font-medium italic">Tham gia cộng đồng phối đồ và du lịch thông minh lớn nhất Việt Nam.</p>
            
            <button 
              onClick={() => { setMode('login'); setError(null); }}
              className="w-full h-14 bg-brand-red text-brand-goldLight rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all border border-brand-gold/30"
            >
              <span className="text-xs font-black uppercase">Đăng nhập</span>
            </button>

            <button 
              onClick={() => { setMode('register'); setError(null); }}
              className="w-full h-14 text-brand-red dark:text-brand-gold text-xs font-black uppercase hover:underline"
            >
              Tạo tài khoản mới
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuthAction} className="w-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-left space-y-4">
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-brand-red uppercase tracking-widest ml-2">Họ và tên</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-14 bg-white dark:bg-slate-900 border border-brand-gold/20 rounded-2xl px-5 text-sm font-bold text-brand-red dark:text-white outline-none focus:border-brand-red transition-all" 
                    placeholder="Nhập tên của bạn"
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-brand-red uppercase tracking-widest ml-2">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-white dark:bg-slate-900 border border-brand-gold/20 rounded-2xl px-5 text-sm font-bold text-brand-red dark:text-white outline-none focus:border-brand-red transition-all" 
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-brand-red uppercase tracking-widest ml-2">Mật khẩu</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-white dark:bg-slate-900 border border-brand-gold/20 rounded-2xl px-5 text-sm font-bold text-brand-red dark:text-white outline-none focus:border-brand-red transition-all" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full h-14 bg-brand-red text-brand-goldLight rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all border border-brand-gold/30 mt-4"
            >
              {mode === 'login' ? 'Đăng nhập' : 'Hoàn tất Đăng ký'}
            </button>

            <button 
              type="button"
              onClick={() => setMode('welcome')}
              className="w-full h-10 text-slate-400 text-[10px] font-black uppercase"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i> Quay lại
            </button>
          </form>
        )}
      </div>

      <div className="absolute bottom-12 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
        Luxury Fashion & Travel Ecosystem
      </div>
    </div>
  );
};
