import { useEffect, useRef } from 'react';
import { apiClient } from '@/lib/apiClient';

/**
 * Hook to prefetch critical admin data after login
 * This ensures dashboard opens instantly without blocking on network
 */
export const usePrefetchAdminData = (enabled: boolean = true) => {
  const hasPrefetched = useRef(false);

  useEffect(() => {
    if (enabled && !hasPrefetched.current) {
      hasPrefetched.current = true;

      // Prefetch in the background without blocking
      apiClient.prefetchAdminData().catch(error => {
        console.error('Background prefetch failed:', error);
      });
    }
  }, [enabled]);

  return {
    prefetch: () => apiClient.prefetchAdminData(),
    clearCache: () => apiClient.clearCache(),
  };
};

/**
 * Hook to manually trigger prefetch for specific endpoints
 */
export const usePrefetch = () => {
  return {
    prefetchJobs: () => apiClient.prefetch('/jobs'),
    prefetchUsers: () => {
      const user = localStorage.getItem('auth_user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          const userId = userData.id;
          if (userId) {
            return apiClient.prefetch(`/get-all-users?user_id=${userId}`);
          }
        } catch (error) {
          console.error('Error prefetching users:', error);
        }
      }
      return Promise.resolve();
    },
    prefetchDashboard: () => apiClient.prefetch('/admin/dashboard/stats'),
  };
};
