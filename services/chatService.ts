import { ChatConversation, Message } from '../types';
import { supabase } from '../lib/supabase';

export const chatService = {
  startVirtualConversation: async (userId: string, virtualPostId: string) => {
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
    // Fetch real conversations
    const { data: realData, error: realError } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1_profile:profiles!conversations_participant_1_fkey(name, avatar, level),
        participant_2_profile:profiles!conversations_participant_2_fkey(name, avatar, level),
        messages (
          id,
          text,
          created_at,
          sender_id,
          is_edited,
          is_recalled,
          reaction,
          is_deleted
        )
      `)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (realError) {
      console.error('Error fetching real conversations:', realError);
    }

    // Fetch virtual conversations
    const { data: virtualData, error: virtualError } = await supabase
      .from('virtual_conversations')
      .select(`
        *,
        virtual_posts (
          id,
          author_name,
          author_avatar,
          shirt_image_url,
          pants_image_url,
          description,
          action_type
        ),
        virtual_messages (
          id,
          text,
          created_at,
          sender_type,
          is_recalled,
          is_edited,
          is_deleted
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (virtualError) {
      console.error('Error fetching virtual conversations:', virtualError);
    }

    const realConversations = (realData || []).map((conv: any) => {
      const isP1 = conv.participant_1 === userId;
      const otherProfile = isP1 ? conv.participant_2_profile : conv.participant_1_profile;
      
      return {
        id: conv.id,
        userName: otherProfile?.name || 'Unknown',
        userLevel: otherProfile?.level || 'Member',
        avatar: otherProfile?.avatar || 'U',
        lastMessage: conv.last_message || '',
        messages: (conv.messages || [])
          .filter((m: any) => !m.is_deleted)
          .map((m: any) => ({
            id: m.id,
            text: m.text,
            time: new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            isMe: m.sender_id === userId,
            isEdited: m.is_edited,
            isRecalled: m.is_recalled,
            reaction: m.reaction
          })),
        isVirtual: false
      };
    });

    const virtualConversations = (virtualData || []).map((conv: any) => {
      const post = conv.virtual_posts;
      return {
        id: conv.id,
        userName: post?.author_name || 'System Style',
        userLevel: 'Hệ thống',
        avatar: post?.author_avatar || 'https://picsum.photos/seed/virtual/100',
        lastMessage: conv.last_message || '',
        messages: (conv.virtual_messages || [])
          .filter((m: any) => !m.is_deleted)
          .map((m: any) => ({
            id: m.id,
            text: m.text,
            time: new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            isMe: m.sender_type === 'real_user',
            isEdited: m.is_edited || false,
            isRecalled: m.is_recalled || false
          })),
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

    // Merge and sort by updated_at
    const allConversations = [...realConversations, ...virtualConversations].sort((a, b) => {
      return 0; 
    });

    return allConversations;
  },

  sendMessage: async (conversationId: string, senderId: string, text: string, isVirtual: boolean = false) => {
    if (isVirtual) {
      const { data, error } = await supabase
        .from('virtual_messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_type: 'real_user',
            text: text
          }
        ])
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('virtual_conversations')
        .update({ 
          last_message: text,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      return data;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: senderId,
          text: text
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Update conversation last message
    await supabase
      .from('conversations')
      .update({ 
        last_message: text,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    return data;
  },

  deleteMessage: async (messageId: string, isVirtual: boolean = false) => {
    const table = isVirtual ? 'virtual_messages' : 'messages';
    const { error } = await supabase
      .from(table)
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', messageId);
      
    if (error) throw error;
  },

  editMessage: async (messageId: string, newText: string, isVirtual: boolean = false) => {
    const table = isVirtual ? 'virtual_messages' : 'messages';
    const { data, error } = await supabase
      .from(table)
      .update({ 
        text: newText, 
        is_edited: true, 
        edited_at: new Date().toISOString() 
      })
      .eq('id', messageId)
      .select()
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  recallMessage: async (messageId: string, isVirtual: boolean = false) => {
    const table = isVirtual ? 'virtual_messages' : 'messages';
    const { error } = await supabase
      .from(table)
      .update({ is_recalled: true, text: 'Tin nhắn đã được thu hồi' })
      .eq('id', messageId);
      
    if (error) throw error;
  },

  startConversation: async (userId: string, otherUserId: string) => {
    // Check if exists
    const { data: existing, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking conversation:', fetchError);
    }

    if (existing) return existing.id;

    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          participant_1: userId,
          participant_2: otherUserId
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }
};
