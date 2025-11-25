/**
 * Centralized API Client with:
 * - Cache-first strategy with TTL
 * - Request deduplication
 * - Prefetching capabilities
 * - Consistent error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://projekanda.top';

// Type definitions for API responses
interface UserData {
  _id?: string;
  user_id: string;
  name: string;
  email: string;
  phoneNo?: string;
  role?: string;
  jobid?: string;
  workexperience?: string;
  skills?: string;
  educationalbackground?: string;
  CVupload?: string;
  ai_recommendation?: string;
  created_at?: string;
  interested_field?: string;
  [key: string]: string | number | boolean | undefined;
}

interface UsersResponse {
  users: UserData[];
  message?: string;
  fromCache?: boolean;
}

// Cache configuration
const CACHE_CONFIG = {
  JOBS: { ttl: 5 * 60 * 1000, key: 'jobs' }, // 5 minutes
  USERS: { ttl: 5 * 60 * 1000, key: 'users' }, // 5 minutes
  JOB_DETAILS: { ttl: 10 * 60 * 1000, key: 'job_details' }, // 10 minutes
  DASHBOARD_STATS: { ttl: 2 * 60 * 1000, key: 'dashboard_stats' }, // 2 minutes
} as const;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface RequestCache {
  promise: Promise<any>;
  timestamp: number;
}

class CentralizedAPIClient {
  private cache = new Map<string, CacheEntry<any>>();
  private inflightRequests = new Map<string, RequestCache>();
  private prefetchQueue: Set<string> = new Set();

  /**
   * Get auth token from localStorage
   */
  private getAuthToken(): string | null {
    const user = localStorage.getItem('auth_user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.token || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Get user ID from localStorage
   */
  private getUserId(): string | null {
    const user = localStorage.getItem('auth_user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.id || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Generate cache key from endpoint and params
   */
  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return endpoint;
    }
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return `${endpoint}?${sortedParams}`;
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
    if (!entry) return false;
    return Date.now() < entry.expiresAt;
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (this.isCacheValid(entry)) {
      return entry!.data;
    }
    // Remove expired cache
    this.cache.delete(key);
    return null;
  }

  /**
   * Store data in cache
   */
  private setCache<T>(key: string, data: T, ttl: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Clear cache by pattern
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Handle API errors consistently
   */
  private async handleApiError(response: Response): Promise<never> {
    let errorMessage = 'An error occurred';
    try {
      const text = await response.text();
      if (text) {
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    switch (response.status) {
      case 401:
        errorMessage = 'Authentication required. Please log in again.';
        localStorage.removeItem('auth_user');
        window.location.href = '/admin/login';
        break;
      case 403:
        errorMessage = 'Access denied. You do not have permission.';
        break;
      case 404:
        errorMessage = 'Resource not found.';
        break;
      case 500:
        errorMessage = 'Server error. Please try again later.';
        break;
    }

    throw new Error(errorMessage);
  }

  /**
   * Core request method with deduplication
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    ttl?: number,
    useCache: boolean = true
  ): Promise<T & { fromCache?: boolean }> {
    const cacheKey = this.getCacheKey(endpoint, options.body ? JSON.parse(options.body as string) : undefined);

    // Check cache first (cache-first strategy)
    if (useCache && options.method === 'GET') {
      const cachedData = this.getFromCache<T>(cacheKey);
      if (cachedData !== null) {
        return { ...cachedData, fromCache: true };
      }
    }

    // Check for inflight request (request deduplication)
    const inflightRequest = this.inflightRequests.get(cacheKey);
    if (inflightRequest) {
      // Reuse the existing promise
      const data = await inflightRequest.promise;
      return { ...data, fromCache: false };
    }

    // Make new request
    const token = this.getAuthToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const requestPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          await this.handleApiError(response);
        }

        const data = await response.json();

        // Cache the result if ttl is provided
        if (ttl && options.method === 'GET') {
          this.setCache(cacheKey, data, ttl);
        }

        return data;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout. Please try again.');
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
        this.inflightRequests.delete(cacheKey);
      }
    })();

    // Store inflight request
    this.inflightRequests.set(cacheKey, {
      promise: requestPromise,
      timestamp: Date.now(),
    });

    const data = await requestPromise;
    return { ...data, fromCache: false };
  }

  /**
   * Prefetch data in the background
   */
  async prefetch(endpoint: string, ttl: number = 5 * 60 * 1000): Promise<void> {
    if (this.prefetchQueue.has(endpoint)) {
      return; // Already prefetching
    }

    this.prefetchQueue.add(endpoint);

    try {
      await this.makeRequest(endpoint, { method: 'GET' }, ttl, true);
    } catch (error) {
      console.error(`Prefetch failed for ${endpoint}:`, error);
    } finally {
      this.prefetchQueue.delete(endpoint);
    }
  }

  /**
   * Prefetch critical admin data
   */
  async prefetchAdminData(): Promise<void> {
    const userId = this.getUserId();
    if (!userId) return;

    // Prefetch in parallel - removed /admin/dashboard/stats as it doesn't exist on backend
    const prefetchTasks = [
      this.prefetch('/jobs', CACHE_CONFIG.JOBS.ttl),
      this.prefetch(`/get-all-users?user_id=${userId}`, CACHE_CONFIG.USERS.ttl),
      // Note: Stats are now calculated client-side from jobs and users data
    ];

    await Promise.allSettled(prefetchTasks);
  }

  /**
   * API Methods - Jobs
   */
  async getJobs(filters: Record<string, any> = {}, useCache: boolean = true) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/jobs${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest(endpoint, { method: 'GET' }, CACHE_CONFIG.JOBS.ttl, useCache);
  }

  async getJobById(id: string, useCache: boolean = true) {
    const endpoint = `/jobs/${id}`;
    return this.makeRequest(endpoint, { method: 'GET' }, CACHE_CONFIG.JOB_DETAILS.ttl, useCache);
  }

  async createJob(data: any) {
    const result = await this.makeRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.clearCache('jobs');
    return result;
  }

  async updateJob(id: string, data: any) {
    const result = await this.makeRequest(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    this.clearCache('jobs');
    return result;
  }

  async deleteJob(id: string) {
    const result = await this.makeRequest(`/jobs/${id}`, { method: 'DELETE' });
    this.clearCache('jobs');
    return result;
  }

  /**
   * API Methods - Users
   */
  async getAllUsers(useCache: boolean = true): Promise<UsersResponse> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User ID not found. Please log in again.');
    }

    const endpoint = `/get-all-users?user_id=${userId}`;
    return this.makeRequest<UsersResponse>(endpoint, { method: 'GET' }, CACHE_CONFIG.USERS.ttl, useCache);
  }

  async submitUserData(data: {
    name: string;
    email: string;
    phoneNo: string;
    workexperience: string;
    skills: string;
    educationalbackground: string;
    CVupload: File;
    jobid: string;
    user_id: string;
  }): Promise<{ message?: string; user?: UserData }> {
    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phoneNo', data.phoneNo);
    formData.append('workexperience', data.workexperience);
    formData.append('skills', data.skills);
    formData.append('educationalbackground', data.educationalbackground);
    formData.append('CVupload', data.CVupload);
    formData.append('jobid', data.jobid);
    formData.append('user_id', data.user_id);

    // For FormData requests, we need to use fetch directly (not makeRequest)
    // because makeRequest uses JSON.stringify which doesn't work with FormData
    const response = await fetch(`${API_BASE_URL}/submit-user-data`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary for FormData
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const text = await response.text();
        if (text) {
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = text || errorMessage;
          }
        }
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      switch (response.status) {
        case 401:
          errorMessage = 'Authentication required. Please log in again.';
          localStorage.removeItem('auth_user');
          window.location.href = '/admin/login';
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Clear users cache after submitting new user data
    this.clearCache('users');

    return result;
  }

  /**
   * API Methods - Dashboard
   */
  async getDashboardStats(useCache: boolean = true) {
    const endpoint = '/admin/dashboard/stats';
    return this.makeRequest(endpoint, { method: 'GET' }, CACHE_CONFIG.DASHBOARD_STATS.ttl, useCache);
  }

  /**
   * API Methods - Candidates
   */
  async getCandidates(filters: Record<string, any> = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/admin/candidates${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest(endpoint, { method: 'GET' });
  }

  async getCandidateById(id: string) {
    return this.makeRequest(`/admin/candidates/${id}`, { method: 'GET' });
  }

  async updateCandidateStatus(id: string, status: string, reason?: string) {
    const result = await this.makeRequest(`/admin/candidates/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
    this.clearCache('candidates');
    return result;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      inflightRequests: this.inflightRequests.size,
      prefetchQueue: this.prefetchQueue.size,
    };
  }
}

// Export singleton instance
export const apiClient = new CentralizedAPIClient();

// Export for use in components
export default apiClient;
