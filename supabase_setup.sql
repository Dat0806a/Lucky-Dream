
-- LUCKYDREAM VN - SUPABASE DATABASE SETUP
-- Chạy script này trong SQL Editor của Supabase để khởi tạo bảng và chính sách bảo mật

-- 1. Bảng Profiles (Lưu thông tin người dùng)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar TEXT,
  level TEXT DEFAULT 'Member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng Posts (Bài đăng cộng đồng)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT,
  top_image TEXT,
  bottom_image TEXT,
  location TEXT,
  tags TEXT[],
  transaction_type TEXT DEFAULT 'Chia sẻ',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng Comments (Bình luận bài đăng)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bảng Virtual Posts (Gợi ý từ hệ thống AI)
CREATE TABLE IF NOT EXISTS public.virtual_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT DEFAULT 'AI Stylist',
  author_avatar TEXT,
  shirt_image_url TEXT,
  pants_image_url TEXT,
  description TEXT,
  action_type TEXT DEFAULT 'buy',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Bảng Conversations (Chat giữa người dùng)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Đảm bảo các cột mới tồn tại trong bảng conversations
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='buyer_id') THEN
    ALTER TABLE public.conversations ADD COLUMN buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='seller_id') THEN
    ALTER TABLE public.conversations ADD COLUMN seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='post_id') THEN
    ALTER TABLE public.conversations ADD COLUMN post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='last_message_id') THEN
    ALTER TABLE public.conversations ADD COLUMN last_message_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='last_message_at') THEN
    ALTER TABLE public.conversations ADD COLUMN last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 6. Bảng Messages (Tin nhắn chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Đảm bảo các cột mới tồn tại trong bảng messages
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='receiver_id') THEN
    ALTER TABLE public.messages ADD COLUMN receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='message') THEN
    ALTER TABLE public.messages ADD COLUMN message TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='is_read') THEN
    ALTER TABLE public.messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='is_edited') THEN
    ALTER TABLE public.messages ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='is_recalled') THEN
    ALTER TABLE public.messages ADD COLUMN is_recalled BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='is_deleted') THEN
    ALTER TABLE public.messages ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='reaction') THEN
    ALTER TABLE public.messages ADD COLUMN reaction TEXT;
  END IF;
END $$;

-- 7. Bảng Notifications (Mới)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  body TEXT,
  reference_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Bảng Virtual Conversations (Chat với AI về bộ đồ)
CREATE TABLE IF NOT EXISTS public.virtual_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  virtual_post_id UUID REFERENCES public.virtual_posts(id) ON DELETE CASCADE,
  last_message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Bảng Virtual Messages (Nội dung chat với AI)
CREATE TABLE IF NOT EXISTS public.virtual_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.virtual_conversations(id) ON DELETE CASCADE,
  sender_type TEXT, -- 'real_user' hoặc 'ai'
  text TEXT,
  is_edited BOOLEAN DEFAULT FALSE,
  is_recalled BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HÀM TIỆN ÍCH (RPC): Tăng lượt thích
CREATE OR REPLACE FUNCTION increment_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET likes_count = likes_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- BẬT ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_messages ENABLE ROW LEVEL SECURITY;

-- CẤP QUYỀN TRUY CẬP (GRANTS) - Cần thiết cho chính sách mới của Supabase từ 30/05/2026
-- 1. Profiles
GRANT SELECT ON TABLE public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

-- 2. Posts
GRANT SELECT ON TABLE public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.posts TO authenticated;
GRANT ALL ON TABLE public.posts TO service_role;

-- 3. Comments
GRANT SELECT ON TABLE public.comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.comments TO authenticated;
GRANT ALL ON TABLE public.comments TO service_role;

-- 4. Virtual Posts (Gợi ý từ AI - Thường chỉ xem)
GRANT SELECT ON TABLE public.virtual_posts TO anon, authenticated;
GRANT ALL ON TABLE public.virtual_posts TO service_role;

-- 5. Conversations
GRANT SELECT, INSERT, UPDATE ON TABLE public.conversations TO authenticated;
GRANT ALL ON TABLE public.conversations TO service_role;

-- 6. Messages
GRANT SELECT, INSERT, UPDATE ON TABLE public.messages TO authenticated;
GRANT ALL ON TABLE public.messages TO service_role;

-- 7. Notifications
GRANT SELECT, INSERT, UPDATE ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;

-- 8. Virtual Conversations
GRANT SELECT, INSERT, UPDATE ON TABLE public.virtual_conversations TO authenticated;
GRANT ALL ON TABLE public.virtual_conversations TO service_role;

-- 8. Virtual Messages
GRANT SELECT, INSERT, UPDATE ON TABLE public.virtual_messages TO authenticated;
GRANT ALL ON TABLE public.virtual_messages TO service_role;

-- Cấp quyền sử dụng chuỗi sequence (cho các id tự tăng hoặc mặc định)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- CẤU HÌNH QUYỀN TRUY CẬP (POLICIES)
-- Profiles: Mọi người có thể xem, chỉ chủ nhân mới sửa được
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: Mọi người có thể xem, chỉ user đăng bài mới xóa/sửa được
CREATE POLICY "Posts are viewable by everyone." ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert posts." ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own posts." ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts." ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Conversations: Chỉ người tham gia mới xem được
CREATE POLICY "Users can view their own conversations." ON public.conversations 
FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can insert conversations they are part of." ON public.conversations 
FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id OR auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Virtual Posts: Ai cũng có thể xem
CREATE POLICY "Virtual posts are viewable by everyone." ON public.virtual_posts FOR SELECT USING (true);

-- Virtual Conversations: Chỉ chủ nhân mới xem được
CREATE POLICY "Users can view their virtual conversations." ON public.virtual_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their virtual conversations." ON public.virtual_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages: Chỉ người trong cuộc mới xem được
CREATE POLICY "Messages are viewable by conversation participants." ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id AND (buyer_id = auth.uid() OR seller_id = auth.uid() OR participant_1 = auth.uid() OR participant_2 = auth.uid())
  )
);
CREATE POLICY "Users can insert messages to their conversations." ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id AND (buyer_id = auth.uid() OR seller_id = auth.uid() OR participant_1 = auth.uid() OR participant_2 = auth.uid())
  )
);

-- Notifications: Chỉ chủ nhân mới xem/sửa được
CREATE POLICY "Users can view their own notifications." ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications." ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Comments: Ai cũng có thể xem, chỉ người đăng mới xóa được
CREATE POLICY "Comments are viewable by everyone." ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post comments." ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete own comments." ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Virtual Messages: Chỉ chủ nhân cuộc hội thoại mới xem được
CREATE POLICY "Users can view their virtual messages." ON public.virtual_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.virtual_conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert virtual messages." ON public.virtual_messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.virtual_conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

-- Cấp quyền thực thi hàm RPC
GRANT EXECUTE ON FUNCTION public.increment_likes(UUID) TO anon, authenticated;
