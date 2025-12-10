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
    if (typeof data !== 'object' || data === null) return false;
    const obj = data as Record<string, unknown>;
    if (!('data' in obj) || typeof obj.data !== 'object' || obj.data === null) return false;
    const dataObj = obj.data as Record<string, unknown>;
    return 'courses' in dataObj && Array.isArray(dataObj.courses);
  },

  // Validates User shape
  user: (data: unknown): data is import('../contexts/AuthContext').User => {
    if (typeof data !== 'object' || data === null) return false;
    const obj = data as Record<string, unknown>;
    return (
      'id' in obj &&
      'name' in obj &&
      'email' in obj &&
      'role' in obj &&
      typeof obj.id === 'string' &&
      typeof obj.name === 'string' &&
      typeof obj.email === 'string' &&
      (['TVET', 'ADOF', 'ADMIN'].includes(obj.role as string))
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
        } catch { /* noop - continue clearing other cache keys */ }
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
