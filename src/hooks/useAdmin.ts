import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../features/auth/hooks/useAuth';

// Module-level cache to avoid redundant requests
const roleCache = new Map<string, boolean>();
const inflight = new Map<string, Promise<boolean>>();

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check cache first
      if (roleCache.has(user.id)) {
        setIsAdmin(roleCache.get(user.id)!);
        setLoading(false);
        return;
      }

      // Check if request is already in flight
      let promise = inflight.get(user.id);
      if (!promise) {
        promise = (async () => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single();

            const admin = !error && data ? data.role === 'admin' : false;
            roleCache.set(user.id, admin);
            return admin;
          } catch (error) {
            console.error('Error checking admin role:', error);
            return false;
          } finally {
            inflight.delete(user.id);
          }
        })();
        inflight.set(user.id, promise);
      }

      try {
        const admin = await promise;
        setIsAdmin(admin);
      } catch (error) {
        console.error('Error in admin check:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user?.id]);

  return { isAdmin, loading };
}
