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
      (['TVET', 'ADOF'].includes((data as any).role))
    );
  }
};
