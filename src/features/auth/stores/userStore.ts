import { create } from 'zustand';
import { UserProfile } from '../types';
import { userService } from '../services/userService';

interface UserStore {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  getProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  clearProfile: () => void;
}

export const useUserStore = create<UserStore>(set => ({
  profile: null,
  loading: false,
  error: null,

  getProfile: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const profile = await userService.getProfile(userId);
      set({ profile, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProfile: async (userId: string, updates: Partial<UserProfile>) => {
    set({ loading: true, error: null });
    try {
      const profile = await userService.updateProfile(userId, updates);
      set({ profile, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearProfile: () => set({ profile: null, error: null }),
}));
