import { ChatConversation, Message } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const chatService = {
  startVirtualConversation: async (userId: string, virtualPostId: string) => {
    if (!isSupabaseConfigured()) return 'mock_virtual_chat';

    // Check if exists
    const { data: existing, error: fetchError } = await supabase
      .from('virtual_conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('virtual_post_id', virtualPostId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking virtual conversation:', fetchError);
    }

    if (existing) return existing.id;

    const { data, error } = await supabase
      .from('virtual_conversations')
      .insert([
        {
          user_id: userId,
          virtual_post_id: virtualPostId
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  getConversations: async (userId: string): Promise<ChatConversation[]> => {
    if (!isSupabaseConfigured()) return [];
    
    try {
      // 1. Fetch Real Conversations using the new schema
      const { data: realData, error: realError } = await supabase
        .from('conversations')
        .select(`
          *,
          buyer_profile:profiles!conversations_buyer_id_fkey(name, avatar, level),
          seller_profile:profiles!conversations_seller_id_fkey(name, avatar, level),
          posts!conversations_post_id_fkey(description, top_image, bottom_image, transaction_type)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (realError) {
        console.error('Error fetching real conversations:', realError);
      }

      // 2. Fetch Virtual Conversations (Keeping existing flow as requested)
      const { data: virtualData, error: virtualError } = await supabase
        .from('virtual_conversations')
        .select(`
          *,
          virtual_posts (
            id, author_name, author_avatar, shirt_image_url, pants_image_url, description, action_type
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (virtualError) {
        console.error('Error fetching virtual conversations:', virtualError);
      }

      // 3. Helper to format real conversations
      const realConversations: ChatConversation[] = await Promise.all((realData || []).map(async (conv: any) => {
        const isBuyer = conv.buyer_id === userId;
        const otherProfile = isBuyer ? conv.seller_profile : conv.buyer_profile;
        const otherUserId = isBuyer ? conv.seller_id : conv.buyer_id;
        
        // Fetch last message text separately if needed, or if we join it above
        // For simplicity and matching the schema, we'll fetch the messages for each conversation
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true });

        const lastMsg = msgs && msgs.length > 0 ? msgs[msgs.length - 1] : null;

        return {
          id: conv.id,
          userName: otherProfile?.name || 'Unknown',
          userLevel: otherProfile?.level || 'Thành viên',
          avatar: otherProfile?.avatar || 'U',
          lastMessage: lastMsg?.message || 'Chưa có tin nhắn',
          isVirtual: false,
          messages: (msgs || []).map((m: any) => ({
            id: m.id,
            text: m.message,
            time: new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            isMe: m.sender_id === userId,
            isEdited: false,
            isRecalled: false
          }))
        };
      }));

      const virtualConversations = (virtualData || []).map((conv: any) => {
        const post = conv.virtual_posts;
        return {
          id: conv.id,
          userName: post?.author_name || 'System Style',
          userLevel: 'Hệ thống',
          avatar: post?.author_avatar || 'https://picsum.photos/seed/virtual/100',
          lastMessage: conv.last_message || '',
          messages: [],
          isVirtual: true,
          virtualPost: post ? {
            id: post.id,
            topImage: post.shirt_image_url,
            bottomImage: post.pants_image_url,
            description: post.description,
            actionType: post.action_type === 'buy' ? 'Mua' : post.action_type === 'rent' ? 'Thuê' : 'Chi tiết'
          } : undefined
        };
      });

      return [...realConversations, ...virtualConversations];
    } catch (e) {
      console.error('Critical failure in getConversations:', e);
      return [];
    }
  },

  sendMessage: async (conversationId: string, senderId: string, text: string, isVirtual: boolean = false) => {
    if (isVirtual) {
      const { data, error } = await supabase
        .from('virtual_messages')
        .insert([{ conversation_id: conversationId, sender_type: 'real_user', text: text }])
        .select().single();
      if (error) throw error;
      await supabase.from('virtual_conversations').update({ last_message: text, updated_at: new Date().toISOString() }).eq('id', conversationId);
      return data;
    }

    // 1. Get conversation to find receiver
    const { data: conv } = await supabase.from('conversations').select('*').eq('id', conversationId).single();
    if (!conv) throw new Error('Conversation not found');
    const receiverId = conv.buyer_id === senderId ? conv.seller_id : conv.buyer_id;

    // 2. Insert message
    const { data: msg, error: msgError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          message: text,
          text: text // Support legacy 'text' column if it has NOT NULL constraint
        }
      ])
      .select()
      .single();

    if (msgError) throw msgError;

    // 3. Update conversation last message ref
    await supabase.from('conversations').update({ 
      last_message_id: msg.id,
      last_message_at: new Date().toISOString()
    }).eq('id', conversationId);

    return {
      id: msg.id,
      text: msg.message,
      created_at: msg.created_at
    };
  },

  startConversation: async (buyerId: string, sellerId: string, postId: string) => {
    // 1. Check if exists
    const { data: existing, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('post_id', postId)
      .eq('buyer_id', buyerId)
      .eq('seller_id', sellerId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking conversation:', fetchError);
    }

    if (existing) return existing.id;

    // 2. Create new - Adding legacy columns participant_1/2 for compatibility
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          post_id: postId,
          buyer_id: buyerId,
          seller_id: sellerId,
          participant_1: buyerId, // Map to legacy col
          participant_2: sellerId  // Map to legacy col
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  deleteMessage: async (messageId: string, isVirtual: boolean = false) => {
    const table = isVirtual ? 'virtual_messages' : 'messages';
    const { error } = await supabase.from(table).delete().eq('id', messageId);
    if (error) throw error;
  },

  editMessage: async (messageId: string, newText: string, isVirtual: boolean = false) => {
    const table = isVirtual ? 'virtual_messages' : 'messages';
    const field = isVirtual ? 'text' : 'message';
    const { data, error } = await supabase.from(table).update({ [field]: newText }).eq('id', messageId).select().maybeSingle();
    if (error) throw error;
    return data;
  },

  recallMessage: async (messageId: string, isVirtual: boolean = false) => {
    // Schema logic for recall can be adapted if needed, or just delete
    return chatService.deleteMessage(messageId, isVirtual);
  },

  subscribeToMessages: (conversationId: string, onNewMessage: (msg: any) => void) => {
    return supabase
      .channel(`room:${conversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        onNewMessage(payload.new);
      })
      .subscribe();
  },

  subscribeToNotifications: (userId: string, onNewNotification: (notif: any) => void) => {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        onNewNotification(payload.new);
      })
      .subscribe();
  },

  getNotifications: async (userId: string) => {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return data;
  },

  markAsRead: async (conversationId: string, userId: string) => {
    // Mark messages as read
    await supabase.from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId);
    
    // Mark notifications as read
    await supabase.from('notifications')
      .update({ is_read: true })
      .eq('reference_id', conversationId)
      .eq('user_id', userId);
  }
};
