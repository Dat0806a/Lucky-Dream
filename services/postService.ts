import { Post, Comment } from '../types';
import { supabase } from '../lib/supabase';

export const postService = {
  getPosts: async (): Promise<Post[]> => {
    // Fetch real posts
    const { data: realPostsData, error: realPostsError } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          name,
          avatar,
          level
        ),
        comments (
          id,
          content,
          profiles (
            name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (realPostsError) {
      console.error('Error fetching real posts:', realPostsError);
    }

    // Fetch virtual posts
    const { data: virtualPostsData, error: virtualPostsError } = await supabase
      .from('virtual_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (virtualPostsError) {
      console.error('Error fetching virtual posts:', virtualPostsError);
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
    const allPosts = [...realPostsFormatted, ...virtualPostsFormatted].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return allPosts;
  },

  createPost: async (postData: Partial<Post>, userId: string) => {
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
