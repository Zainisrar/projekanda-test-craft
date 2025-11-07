import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 13 * 60 * 1000; // 13 minutes (show warning at 13min)
const ACTIVITY_THROTTLE_INTERVAL = 3000; // 3 seconds - throttle activity handler calls

export const useSessionTimeout = () => {
  const { user, logout, updateActivity } = useAuth();
  const { toast } = useToast();
  
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(0);

  const showWarning = useCallback(() => {
    if (user) {
      toast({
        title: 'Session Expiring Soon',
        description: 'Your session will expire in 2 minutes due to inactivity. Click anywhere to stay logged in.',
        variant: 'destructive',
        duration: 120000, // Show for 2 minutes
      });
    }
  }, [user, toast]);

  const handleLogout = useCallback(() => {
    if (user) {
      toast({
        title: 'Session Expired',
        description: 'You have been logged out due to inactivity.',
        variant: 'destructive',
      });
      logout();
    }
  }, [user, logout, toast]);

  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    // Set new timers
    warningTimerRef.current = setTimeout(showWarning, WARNING_TIME);
    logoutTimerRef.current = setTimeout(handleLogout, SESSION_TIMEOUT);
  }, [showWarning, handleLogout]);

  const handleActivity = useCallback(() => {
    if (user) {
      const now = Date.now();
      // Only process activity if at least 3 seconds have passed since last activity
      if (now - lastActivityRef.current > ACTIVITY_THROTTLE_INTERVAL) {
        lastActivityRef.current = now;
        updateActivity();
        resetTimers();
      }
    }
  }, [user, updateActivity, resetTimers]);

  useEffect(() => {
    if (!user) return;

    // Initial timers
    resetTimers();

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup function
    return () => {
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
      
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, handleActivity, resetTimers]);

  return {
    isActive: !!user,
  };
};
