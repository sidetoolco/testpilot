import { useEffect } from 'react';
import { useUserStore } from '../stores/userStore';
import { useAuthStore } from '../stores/authStore';

export function useProfile() {
  const { user } = useAuthStore();
  const { profile, loading, error, getProfile } = useUserStore();

  useEffect(() => {
    if (user?.id && !profile) {
      getProfile(user.id);
    }
  }, [user?.id, profile, getProfile]);

  return { profile, loading, error };
}