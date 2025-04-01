import { supabase } from '../../../lib/supabase';
import { AuthFormData } from '../types';

export const authService = {
  async signUp({ email, password, fullName, companyName }: AuthFormData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`
      }
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
      password
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
    console.log(window.location.origin, 'window.location.origin')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // redirectTo: `${window.location.origin}/reset-password`,
      redirectTo: `https://testpilot-1.vercel.app/reset-password`,
    });

    if (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  async updatePassword(newPassword: string, code: string) {
    // Get tokens from hash fragment
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token) {
      throw new Error('Missing authentication token');
    }

    // Set the session with the tokens
    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token: refresh_token || ''
    });

    if (sessionError) {
      console.error('Session error:', sessionError);
      throw sessionError;
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      console.error('Update password error:', updateError);
      throw updateError;
    }
  },

  async verifyEmail(token: string) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });

    if (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  },
};