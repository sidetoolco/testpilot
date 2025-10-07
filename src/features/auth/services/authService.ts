import { supabase } from '../../../lib/supabase';
import { AuthFormData } from '../types';

export const authService = {
  async signUp({ email, password, fullName, companyName, companyId }: AuthFormData) {
    const optionsData: Record<string, string | undefined> = {
      full_name: fullName,
      company_name: companyName,
    };

    if (companyId) {
      optionsData.company_id = companyId;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: optionsData,
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      console.error('Signup error:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('Failed to create user');
    }

    return data;
  },

  async signIn({ email, password }: AuthFormData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      throw error;
    }

    if (!data.user || !data.session) {
      throw new Error('No user data returned');
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Signout error:', error);
      throw error;
    }
  },

  async resetPassword(email: string) {
    console.log(window.location.origin, 'window.location.origin');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  async updatePassword(newPassword: string) {
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('Update password error:', updateError);
      throw updateError;
    }
  },

  async verifyEmail(token: string) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  },
};
