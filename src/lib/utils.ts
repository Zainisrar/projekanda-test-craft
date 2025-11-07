import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parse and validate localStorage data
 * @param key - localStorage key
 * @param validator - function to validate parsed data shape
 * @returns parsed and validated data or null if invalid
 */
export function safeParseLocalStorage<T>(
  key: string, 
  validator: (data: unknown) => data is T
): T | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    if (validator(parsed)) {
      return parsed;
    }
    
    // Invalid data shape, remove from localStorage
    localStorage.removeItem(key);
    return null;
  } catch (error) {
    console.warn(`Failed to parse localStorage data for key "${key}":`, error);
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Validators for common localStorage data shapes
 */
export const localStorageValidators = {
  // Validates RecommendCoursesResponse shape
  recommendCourses: (data: unknown): data is import('./api').RecommendCoursesResponse => {
    return (
      typeof data === 'object' &&
      data !== null &&
      'data' in data &&
      typeof (data as any).data === 'object' &&
      (data as any).data !== null &&
      'courses' in (data as any).data &&
      Array.isArray((data as any).data.courses)
    );
  },
  
  // Validates User shape
  user: (data: unknown): data is import('../contexts/AuthContext').User => {
    return (
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      'name' in data &&
      'email' in data &&
      'role' in data &&
      typeof (data as any).id === 'string' &&
      typeof (data as any).name === 'string' &&
      typeof (data as any).email === 'string' &&
      (['TVET', 'ADOF', 'ADMIN'].includes((data as any).role))
    );
  }
};

/**
 * Safely set item to localStorage with size check
 * @param key - localStorage key
 * @param value - value to store
 * @returns true if successful, false otherwise
 */
export function safeSetLocalStorage(key: string, value: string): boolean {
  try {
    // Check if the value exceeds reasonable size (5MB)
    if (value.length > 5 * 1024 * 1024) {
      console.warn(`localStorage value for key "${key}" exceeds 5MB`);
      return false;
    }
    
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
      // Clear old cached data to make space
      const cacheKeys = ['all_users_cache', 'recommended_courses'];
      cacheKeys.forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });
      
      // Try again
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    }
    console.error(`Failed to set localStorage item for key "${key}":`, error);
    return false;
  }
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
