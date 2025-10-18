import { useEffect, useState } from 'react';
import { useAuth } from '@/App';
import { supabase } from '@/lib/supabase';

// Security middleware for additional protection
export const useSecurityMiddleware = () => {
  const { user, isAuthenticated } = useAuth();
  const [securityStatus, setSecurityStatus] = useState({
    isSessionValid: false,
    isEmailVerified: false,
    lastActivity: Date.now(),
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  });

  // Check session validity
  const checkSessionValidity = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const isValid = !!session && session.expires_at && new Date(session.expires_at * 1000) > new Date();
      
      setSecurityStatus(prev => ({
        ...prev,
        isSessionValid: isValid,
        isEmailVerified: session?.user?.email_confirmed_at ? true : false,
      }));

      return isValid;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  };

  // Track user activity
  const updateActivity = () => {
    setSecurityStatus(prev => ({
      ...prev,
      lastActivity: Date.now(),
    }));
  };

  // Check for session timeout
  const checkSessionTimeout = () => {
    const now = Date.now();
    const timeSinceLastActivity = now - securityStatus.lastActivity;
    
    if (timeSinceLastActivity > securityStatus.sessionTimeout) {
      console.log('Session timeout detected');
      supabase.auth.signOut();
      return true;
    }
    
    return false;
  };

  // Set up activity tracking
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const updateActivityThrottled = throttle(updateActivity, 1000);
    
    events.forEach(event => {
      document.addEventListener(event, updateActivityThrottled, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivityThrottled, true);
      });
    };
  }, [isAuthenticated]);

  // Set up session monitoring
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const isValid = await checkSessionValidity();
      
      if (!isValid) {
        console.log('Invalid session detected');
        supabase.auth.signOut();
        return;
      }

      if (checkSessionTimeout()) {
        return;
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, securityStatus.lastActivity]);

  // Initial session check
  useEffect(() => {
    if (isAuthenticated && user) {
      checkSessionValidity();
    }
  }, [isAuthenticated, user]);

  return {
    securityStatus,
    checkSessionValidity,
    updateActivity,
  };
};

// Throttle function to limit activity updates
function throttle(func: Function, limit: number) {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Security utilities
export const SecurityUtils = {
  // Validate password strength
  validatePassword: (password: string) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength,
      strength: {
        length: password.length >= minLength,
        uppercase: hasUpperCase,
        lowercase: hasLowerCase,
        numbers: hasNumbers,
        special: hasSpecialChar,
      },
      score: [
        password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar,
      ].filter(Boolean).length,
    };
  },

  // Sanitize user input
  sanitizeInput: (input: string) => {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  },

  // Validate email format
  validateEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.toLowerCase().trim());
  },

  // Generate secure random string
  generateSecureToken: (length: number = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Check if user agent is suspicious
  checkSuspiciousActivity: () => {
    const userAgent = navigator.userAgent;
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  },
};

export default useSecurityMiddleware;
