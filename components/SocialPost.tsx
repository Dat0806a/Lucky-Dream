
import React, { useState, useEffect } from 'react';
import { Post, Comment } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface SocialPostProps {
  post: Post;
  onTransactionClick?: () => void;
  onAIChatClick?: () => void;
  isOwnPost?: boolean;
  onDelete?: (postId: string) => Promise<void>;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1594932224828-b4b059b6f6ee?q=80&w=500&auto=format&fit=crop';

export const SocialPost: React.FC<SocialPostProps> = ({ post, onTransactionClick, onAIChatClick, isOwnPost, onDelete }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>(post.sampleComments);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // States for lazy-loading images
  const [topImage, setTopImage] = useState<string>(post.topImage || '');
  const [bottomImage, setBottomImage] = useState<string>(post.bottomImage || '');
  const [imagesLoading, setImagesLoading] = useState<boolean>(
    !post.topImage && !post.bottomImage && !post.isVirtual && isSupabaseConfigured()
  );

  useEffect(() => {
    // If the post already has images or is virtual, we don't need to fetch
    if (post.isVirtual || (post.topImage && post.bottomImage)) {
      setTopImage(post.topImage || '');
      setBottomImage(post.bottomImage || '');
      setImagesLoading(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      setImagesLoading(false);
      return;
    }

    let isMounted = true;
    setImagesLoading(true);

    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('top_image, bottom_image')
          .eq('id', post.id)
          .single();

        if (error) {
          console.error(`Error loading lazy images for post ${post.id}:`, error.message);
        } else if (data && isMounted) {
          if (data.top_image) setTopImage(data.top_image);
          if (data.bottom_image) setBottomImage(data.bottom_image);
        }
      } catch (err) {
        console.error('Failed to load lazy images:', err);
      } finally {
        if (isMounted) {
          setImagesLoading(false);
        }
      }
    };

    fetchImages();

    return () => {
      isMounted = false;
    };
  }, [post.id, post.isVirtual, post.topImage, post.bottomImage]);

  const handleTransactionClick = () => {
    if (onTransactionClick) {
      onTransactionClick();
    } else {
      alert(`Đang kết nối chat với ${post.user.name} để ${post.transactionType?.toLowerCase()}...`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowOptions(false);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setShowConfirmDelete(false);
    console.log("Delete button pressed for post:", post.id);
    
    if (!onDelete) {
      console.error("onDelete prop is missing!");
      return;
    }
    
    console.log("User confirmed deletion. Deleting post with id:", post.id);
    setIsDeleting(true);
    try {
      await onDelete(post.id);
      console.log("Delete successful in SocialPost");
    } catch (err: any) {
      console.error("Delete failed in SocialPost:", err);
      alert('Không thể xóa bài viết. Lỗi: ' + (err.message || 'Vui lòng kiểm tra lại quyền (RLS) hoặc thử lại sau.'));
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    console.log("User cancelled deletion.");
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    const newComment: Comment = {
      id: `c-user-${Date.now()}`,
      userName: 'Bạn',
      content: commentText.trim()
    };
    
    setLocalComments(prev => [...prev, newComment]);
    setCommentText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddComment();
    }
  };

  const shouldShowTransactionButton = post.transactionType && post.transactionType !== 'Chia sẻ';

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-brand-gold/20 mb-8 animate-in fade-in duration-500 relative flex flex-col">
        
        {/* User Header Section - Optimized for spacing and preventing overflow */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 bg-brand-red rounded-2xl flex items-center justify-center text-brand-gold border border-brand-gold/30 shadow-inner overflow-hidden shrink-0">
              {post.user.avatar && post.user.avatar.startsWith('http') ? (
                <img src={post.user.avatar} alt={post.user.name} className="w-full h-full object-cover" />
              ) : (
                post.user.avatar && post.user.avatar !== 'U' ? <span className="font-black text-xs">{post.user.avatar}</span> : <i className="fa-solid fa-user-tie text-xs"></i>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="text-sm font-black text-brand-red dark:text-slate-100 uppercase tracking-tight truncate">
                {post.user.name}
              </h4>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold text-brand-gold uppercase tracking-widest shrink-0">{post.user.level}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full shrink-0"></span>
                <span className="text-[8px] text-slate-400 font-medium truncate opacity-70">{post.time}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAIChatClick?.();
              }}
              className="bg-brand-red px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full border border-brand-gold/30 flex items-center gap-1.5 active:scale-90 hover:scale-105 hover:brightness-110 transition-all duration-300 shadow-md group whitespace-nowrap shadow-brand-red/20"
              title="Trao đổi với AI"
            >
              <i className="fa-solid fa-robot text-[9px] sm:text-[10px] text-brand-gold"></i>
              <span className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-wider">Trao đổi với AI</span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="text-slate-400 hover:text-brand-red transition-colors p-1.5"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                ) : (
                  <i className="fa-solid fa-ellipsis-vertical text-lg"></i>
                )}
              </button>

            {showOptions && (
              <div className="absolute right-0 top-10 w-40 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-brand-gold/20 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                {isOwnPost ? (
                  <button 
                    onClick={handleDeleteClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-xs font-black uppercase"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                    Xóa bài viết
                  </button>
                ) : (
                  <button 
                    onClick={() => { alert('Tính năng báo cáo đang được phát triển'); setShowOptions(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs font-black uppercase"
                  >
                    <i className="fa-solid fa-flag"></i>
                    Báo cáo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Custom Confirm Delete Dialog */}
        {showConfirmDelete && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border border-brand-gold/20 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
              </div>
              <h3 className="text-lg font-black text-center text-brand-red dark:text-slate-100 uppercase tracking-tight mb-2">Xóa bài viết?</h3>
              <p className="text-sm text-center text-slate-600 dark:text-slate-400 font-medium mb-6">
                Bạn có chắc chắn muốn xóa bài viết này vĩnh viễn không? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={cancelDelete}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
                >
                  Hủy
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-md shadow-red-500/20"
                >
                  Xóa ngay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="px-6 pb-4">
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {post.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag, i) => (
              <span key={i} className="text-[9px] font-black text-brand-red/60 dark:text-brand-gold/60">#{tag}</span>
            ))}
          </div>
        </div>

        {/* Outfit Showcase */}
        <div className="px-5 pb-5">
          <div className="p-3 bg-brand-cream dark:bg-slate-800 rounded-[2rem] flex gap-3 border border-brand-gold/10">
            <div className="flex-1 flex flex-col gap-2">
              <div className="px-2 py-0.5 bg-brand-red/10 border border-brand-red/20 text-brand-red text-[8px] font-black rounded uppercase w-fit tracking-widest">ÁO</div>
              <div className="aspect-[3/4] bg-white dark:bg-slate-700 rounded-2xl shadow-sm overflow-hidden flex items-center justify-center relative">
                {imagesLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <img src={topImage || FALLBACK_IMAGE} className="w-full h-full object-cover animate-in fade-in duration-300" alt="Top" onError={handleImageError} />
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="px-2 py-0.5 bg-brand-red/10 border border-brand-red/20 text-brand-red text-[8px] font-black rounded uppercase w-fit tracking-widest">QUẦN</div>
              <div className="aspect-[3/4] bg-white dark:bg-slate-700 rounded-2xl shadow-sm overflow-hidden flex items-center justify-center relative">
                {imagesLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <img src={bottomImage || FALLBACK_IMAGE} className="w-full h-full object-cover animate-in fade-in duration-300" alt="Bottom" onError={handleImageError} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Location Tag */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 text-brand-red/80 dark:text-brand-gold/80">
            <i className="fa-solid fa-location-dot text-[10px]"></i>
            <span className="text-[10px] font-black uppercase tracking-tight">{post.location}</span>
          </div>
        </div>

        {/* Action Area */}
        <div className="px-6 pb-6 pt-2 border-t border-brand-gold/10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center gap-1.5 transition-all group ${isLiked ? 'text-brand-red' : 'text-slate-400'}`}
            >
              <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart text-lg group-active:scale-125 transition-transform`}></i>
              <span className="text-[10px] font-black">{post.stats.likes + (isLiked ? 1 : 0)}</span>
            </button>
            
            <button 
              onClick={() => setIsCommentModalOpen(true)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-brand-red transition-colors"
            >
              <i className="fa-regular fa-comment text-lg"></i>
              <span className="text-[10px] font-black">{localComments.length}</span>
            </button>

            <button 
              onClick={() => alert(`Đang chuẩn bị chia sẻ bài đăng của ${post.user.name}...`)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-brand-red transition-colors"
            >
              <i className="fa-solid fa-paper-plane text-[16px]"></i>
              <span className="text-[9px] font-black uppercase tracking-tighter">Gửi</span>
            </button>
          </div>

          {shouldShowTransactionButton && (
            <button 
              onClick={handleTransactionClick}
              className="bg-brand-red text-brand-goldLight px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-gold/30 shadow-md active:scale-95 transition-all"
            >
              {post.transactionType}
            </button>
          )}
        </div>
      </div>

      {/* COMMENT MODAL (BOTTOM SHEET STYLE) */}
      {isCommentModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-0 sm:p-4">
          <div 
            className="absolute inset-0 z-0" 
            onClick={() => setIsCommentModalOpen(false)}
          ></div>
          
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col relative z-10 animate-in slide-in-from-bottom duration-500 border-t border-brand-gold/30 h-[85dvh] sm:h-[70dvh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 flex items-center justify-between border-b border-brand-gold/10">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-comments text-brand-red dark:text-brand-gold"></i>
                <h3 className="text-sm font-black text-brand-red dark:text-slate-100 uppercase tracking-widest">Bình luận</h3>
              </div>
              <button 
                onClick={() => setIsCommentModalOpen(false)}
                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 active:scale-90 transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {localComments.length > 0 ? (
                localComments.map(comment => (
                  <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="w-9 h-9 bg-brand-red/10 dark:bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-red dark:text-brand-gold text-[10px] font-black flex-shrink-0 border border-brand-gold/20">
                      {comment.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl rounded-tl-none border border-brand-gold/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-[10px] text-brand-red dark:text-brand-gold uppercase tracking-tighter">{comment.userName}</span>
                        <span className="text-[8px] text-slate-400 font-bold">Vừa xong</span>
                      </div>
                      <p className="text-[12px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                  <i className="fa-regular fa-comment-dots text-5xl mb-4 text-brand-red"></i>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red">Chưa có bình luận nào</p>
                  <p className="text-[10px] italic mt-1">Hãy là người đầu tiên chia sẻ cảm nghĩ!</p>
                </div>
              )}
            </div>

            {/* Fixed Input Bar */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-brand-gold/10 safe-pb">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-brand-gold/20 shadow-inner">
                <input 
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Viết bình luận của bạn..."
                  className="flex-1 bg-transparent border-none px-3 py-2 text-[12px] font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                  autoFocus
                />
                <button 
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${commentText.trim() ? 'bg-brand-red text-brand-gold shadow-md active:scale-90' : 'bg-slate-200 text-slate-400 dark:bg-slate-700'}`}
                >
                  <i className="fa-solid fa-arrow-up text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
