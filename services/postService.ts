import { Post, Comment } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const postService = {
  getPosts: async (): Promise<Post[]> => {
    // Check if configured
    if (!isSupabaseConfigured()) {
      console.log('Using hardcoded fallback posts because Supabase is not configured.');
      return getFallbackPosts();
    }

    // Fetch real posts
    let realPostsData: any[] = [];
    try {
      // Exclude top_image and bottom_image to prevent statement timeout on massive base64 payloads
      const { data, error: realPostsError } = await supabase
        .from('posts')
        .select(`
          id, user_id, description, location, tags, transaction_type, likes_count, comments_count, created_at,
          profiles:user_id (name, avatar, level)
        `)
        .order('created_at', { ascending: false })
        .limit(10); 

      if (realPostsError) {
        // Silently handle if it's a timeout or network issue
        if (realPostsError.code === '57014' || realPostsError.message === 'TypeError: Failed to fetch') {
          return getFallbackPosts();
        }
        if (realPostsError.code === 'PGRST303') {
          console.warn('JWT expired, forcing sign out');
          supabase.auth.signOut();
          return getFallbackPosts();
        }
        console.error('Supabase error fetching real posts:', realPostsError);
        realPostsData = [];
      } else {
        realPostsData = data || [];
      }
    } catch (e) {
      // If any network glitch happens, return fallbacks immediately
      return getFallbackPosts();
    }

    // Fetch virtual posts - keep it light
    let virtualPostsData: any[] = [];
    try {
      const { data, error: virtualPostsError } = await supabase
        .from('virtual_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (virtualPostsError) {
        if (virtualPostsError.code === 'PGRST303') {
          console.warn('JWT expired, forcing sign out');
          supabase.auth.signOut();
          return getFallbackPosts();
        }
      } else {
        virtualPostsData = data || [];
      }
    } catch (e) {
      // Silently fail for secondary data
    }

    
    console.log('Virtual posts fetched:', virtualPostsData);

    const realPostsFormatted = (realPostsData || []).map((post: any) => ({
      id: post.id,
      user: {
        id: post.user_id,
        name: post.profiles?.name || 'Unknown',
        avatar: post.profiles?.avatar || 'U',
        level: post.profiles?.level || 'Member'
      },
      time: new Date(post.created_at).toLocaleString('vi-VN'),
      created_at: post.created_at, // Keep for sorting
      description: post.description || post.content || '',
      topImage: post.top_image,
      bottomImage: post.bottom_image,
      location: post.location,
      tags: post.tags || [],
      transactionType: post.transaction_type,
      stats: {
        likes: post.likes_count || 0,
        comments: post.comments_count || 0
      },
      sampleComments: (post.comments || []).map((c: any) => ({
        id: c.id,
        userName: c.profiles?.name || 'User',
        content: c.content
      })),
      isVirtual: false
    }));

    const virtualPostsFormatted = (virtualPostsData || []).map((post: any) => ({
      id: post.id,
      user: {
        id: 'virtual_' + post.id, // Fake ID for virtual user
        name: post.author_name || 'System Style',
        avatar: post.author_avatar || 'https://picsum.photos/seed/virtual/100',
        level: 'Hệ thống'
      },
      time: new Date(post.created_at).toLocaleString('vi-VN'),
      created_at: post.created_at, // Keep for sorting
      description: post.description || '',
      topImage: post.shirt_image_url,
      bottomImage: post.pants_image_url,
      location: 'Hệ thống',
      tags: ['Gợi ý', 'Xu hướng'],
      transactionType: post.action_type === 'buy' ? 'Mua' : post.action_type === 'rent' ? 'Thuê' : undefined,
      stats: {
        likes: Math.floor(Math.random() * 500) + 50, // Fake stats
        comments: Math.floor(Math.random() * 50) + 5
      },
      sampleComments: [],
      isVirtual: true
    }));

    // Merge and sort
    let allPosts = [...realPostsFormatted, ...virtualPostsFormatted].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Final fallback if everything failed (CORS, network, or empty DB)
    if (allPosts.length === 0) {
      console.warn('No posts found (real or virtual). Returning hardcoded fallback.');
      const now = new Date().toISOString();
      allPosts = [
        {
          id: 'fb-1',
          user: { id: 'sys-1', name: 'LuckyDream Admin', avatar: 'L', level: 'Hệ thống' },
          time: new Date().toLocaleString('vi-VN'),
          created_at: now,
          description: 'Chào mừng bạn đến với LuckyDream VN! Hệ thống đang tải dữ liệu. Nếu bạn thấy tin nhắn này quá lâu, vui lòng kiểm tra cấu hình Supabase.',
          topImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500',
          bottomImage: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=500',
          location: 'Hệ thống',
          tags: ['Chào mừng', 'Luxury'],
          transactionType: 'Chia sẻ',
          stats: { likes: 99, comments: 5 },
          sampleComments: [],
          isVirtual: true
        } as any
      ];
    }

    return allPosts;
  },

  createPost: async (postData: Partial<Post>, userId: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase chưa được cấu hình. Vui lòng thiết lập để đăng bài.');
    }
    if (!userId) throw new Error('User must be logged in to post');
    
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: userId,
          description: postData.description,
          top_image: postData.topImage,
          bottom_image: postData.bottomImage,
          location: postData.location,
          tags: postData.tags || [],
          transaction_type: postData.transactionType || 'Chia sẻ',
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    return data;
  },

  likePost: async (postId: string) => {
    // In a real app, we'd have a likes table to prevent multiple likes
    // For now, we just increment the count
    const { error } = await supabase.rpc('increment_likes', { post_id: postId });
    if (error) {
      // Fallback if RPC not defined
      const { data: post } = await supabase.from('posts').select('likes_count').eq('id', postId).single();
      await supabase.from('posts').update({ likes_count: (post?.likes_count || 0) + 1 }).eq('id', postId);
    }
  },

  deletePost: async (postId: string) => {
    console.log("postService.deletePost called for id:", postId);
    
    // 1. Xóa các comments liên quan trước để tránh lỗi Foreign Key Constraint
    // (Trong trường hợp database chưa cấu hình ON DELETE CASCADE)
    console.log("Deleting comments for post:", postId);
    const { error: commentsError } = await supabase
      .from('comments')
      .delete()
      .eq('post_id', postId);
      
    if (commentsError) {
      console.error('Lỗi khi xóa comments:', commentsError);
      // Vẫn tiếp tục thử xóa post, vì có thể bảng comments không có cột post_id như dự đoán
      // hoặc lỗi không nghiêm trọng.
    } else {
      console.log("Comments deleted successfully (if any)");
    }

    // Xóa likes nếu có bảng likes riêng
    console.log("Deleting likes for post:", postId);
    const { error: likesError } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId);
      
    if (likesError) {
      console.error('Lỗi khi xóa likes:', likesError);
    } else {
      console.log("Likes deleted successfully (if any)");
    }

    // 2. Xóa bài đăng và trả về dữ liệu đã xóa để kiểm tra
    console.log("Calling supabase.from('posts').delete().eq('id', postId).select()");
    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .select();

    console.log("Supabase response for delete post:", { data, error });

    if (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
    
    // Nếu không có data trả về (mảng rỗng), nghĩa là RLS đã chặn việc xóa
    // hoặc bài viết không tồn tại.
    if (!data || data.length === 0) {
      console.error("Delete failed: No data returned. RLS blocked or post not found.");
      throw new Error('Không thể xóa bài viết. Có thể bạn không có quyền (chưa chạy SQL Policy) hoặc bài viết không tồn tại.');
    }
    
    console.log("Post deleted successfully from database");
    return true;
  }
};

const getFallbackPosts = (): Post[] => {
  const now = new Date().toISOString();
  return [
    {
      id: 'fb-1',
      user: { id: 'sys-1', name: 'LuckyDream Admin', avatar: 'L', level: 'Hệ thống' },
      time: new Date().toLocaleString('vi-VN'),
      created_at: now,
      description: 'Chào mừng bạn đến với LuckyDream VN! Hệ thống đang ở chế độ offline hoặc Supabase chưa được cấu hình. Bạn vẫn có thể trải nghiệm tính năng phối đồ AI ở tab "Phối đồ".',
      topImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500',
      bottomImage: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=500',
      location: 'Hệ thống',
      tags: ['Chào mừng', 'Luxury'],
      transactionType: 'Chia sẻ',
      stats: { likes: 99, comments: 5 },
      sampleComments: [],
      isVirtual: true
    } as any,
    {
      id: 'fb-2',
      user: { id: 'sys-2', name: 'Style Guide', avatar: 'S', level: 'Stylist' },
      time: new Date().toLocaleString('vi-VN'),
      created_at: now,
      description: 'Gợi ý hôm nay: Áo thun trắng basic kết hợp cùng quần jean xanh là set đồ không bao giờ lỗi mốt.',
      topImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500',
      bottomImage: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=500',
      location: 'Sài Gòn',
      tags: ['Basic', 'Clean'],
      transactionType: 'Chia sẻ',
      stats: { likes: 156, comments: 12 },
      sampleComments: [],
      isVirtual: true
    } as any
  ];
};
