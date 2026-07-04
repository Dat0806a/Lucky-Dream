
import { User } from '../types';
import { supabase } from '../lib/supabase';

export const authService = {
  signInEmail: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user found');

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      id: data.user.id,
      name: profile?.name || email.split('@')[0],
      email: data.user.email || email,
      avatar: profile?.avatar || (profile?.name || email).charAt(0).toUpperCase(),
      level: profile?.level || 'Style Discoverer',
      provider: 'email'
    };
  },

  signUpEmail: async (name: string, email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Signup failed');

    // If session is null, it might mean email confirmation is required
    if (!data.session) {
      throw new Error('Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.');
    }

    return {
      id: data.user.id,
      name: name,
      email: email,
      avatar: name.charAt(0).toUpperCase(),
      level: 'New Fashionista',
      provider: 'email'
    };
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    // CHỈ SELECT, KHÔNG INSERT (Database Trigger sẽ lo việc tạo profile)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return {
      id: session.user.id,
      name: profile?.name || session.user.email?.split('@')[0] || 'User',
      email: session.user.email || '',
      avatar: profile?.avatar || (profile?.name || 'U').charAt(0).toUpperCase(),
      level: profile?.level || 'Member',
      provider: 'email'
    };
  },

  signOut: async () => {
    await supabase.auth.signOut();
  }
};
