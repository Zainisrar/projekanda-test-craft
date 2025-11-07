const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://projekanda.top';

// Types for admin API
export interface Job {
  id: string;
  title: string;
  description: string;
  // fields provided by the new /jobs API
  company?: string;
  location?: string;
  type?: string;
  salary?: string | number;
  skills?: string[];
  test_ids?: string[];
  // keep older optional fields for compatibility
  category?: string;
  status?: 'active' | 'inactive' | 'draft';
  requirements?: string[];
  applicants_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TestResults {
  analysis?: Record<string, string>;
  max_score?: number;
  mcq_id?: string;
  percentage?: number;
  result_id?: string;
  total_score?: number;
  user_id?: string;
}

export interface Candidate {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  applied_job_id: string;
  applied_job_title: string;
  test_score: number;
  ai_recommendation: 'accept' | 'reject' | 'pending';
  status: 'pending' | 'accepted' | 'rejected';
  cv_url?: string;
  test_results?: TestResults;
  applied_at: string;
}

export interface UserData {
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

export interface Report {
  id: string;
  type: 'hiring_stats' | 'activity_logs' | 'test_summaries';
  filters: Record<string, any>;
  status: 'generating' | 'completed' | 'failed';
  download_url?: string;
  created_at: string;
}

export interface JobFilters {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CandidateFilters {
  job_id?: string;
  score_min?: number;
  score_max?: number;
  recommendation?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ReportFilters {
  type: string;
  date_from?: string;
  date_to?: string;
  job_id?: string;
  candidate_status?: string;
  format?: 'csv' | 'pdf';
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
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
};

// Helper function to get user_id from localStorage
const getUserId = (): string | null => {
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
};

// Helper function to handle API errors
const handleApiError = async (response: Response): Promise<never> => {
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
  
  // Handle different status codes
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
};

// Helper function to make authenticated requests
const makeRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  // Add timeout support
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// Jobs API
export const jobsApi = {
  // The backend exposes plain /jobs endpoints (create, list, update, delete).
  // Map MongoDB documents into the frontend Job shape (convert _id to id, set defaults).
  async getJobs(filters: JobFilters = {}, useCache: boolean = true): Promise<{ jobs: Job[]; total: number; page: number; limit: number; fromCache?: boolean }> {
    const CACHE_KEY = 'jobs_cache';
    const CACHE_TIMESTAMP_KEY = 'jobs_cache_timestamp';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Generate cache key based on filters
    const filterKey = JSON.stringify(filters);
    const specificCacheKey = `${CACHE_KEY}_${filterKey}`;
    const specificTimestampKey = `${CACHE_TIMESTAMP_KEY}_${filterKey}`;

    // Check if we should use cache
    if (useCache) {
      const cachedData = localStorage.getItem(specificCacheKey);
      const cacheTimestamp = localStorage.getItem(specificTimestampKey);

      if (cachedData && cacheTimestamp) {
        const timeDiff = Date.now() - parseInt(cacheTimestamp);
        
        if (timeDiff < CACHE_DURATION) {
          // Cache is still valid
          try {
            const parsedData = JSON.parse(cachedData);
            return { ...parsedData, fromCache: true };
          } catch (error) {
            console.error('Error parsing cached jobs data:', error);
            // Continue to fetch fresh data
          }
        }
      }
    }

    // Fetch fresh data
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await makeRequest(`/jobs?${params.toString()}`);
    const data = await response.json();

    // data expected to be an array of job documents
    const jobsArray: any[] = Array.isArray(data) ? data : [];
    const jobs: Job[] = jobsArray.map((doc) => mapDocToJob(doc));

    const result = { jobs, total: jobs.length, page: filters.page || 1, limit: filters.limit || jobs.length };

    // Store in cache
    try {
      localStorage.setItem(specificCacheKey, JSON.stringify(result));
      localStorage.setItem(specificTimestampKey, Date.now().toString());
    } catch (error) {
      console.error('Error caching jobs data:', error);
    }

    return { ...result, fromCache: false };
  },

  async getJobById(id: string, useCache: boolean = true): Promise<Job & { fromCache?: boolean }> {
    const CACHE_KEY = `job_${id}_cache`;
    const CACHE_TIMESTAMP_KEY = `job_${id}_cache_timestamp`;
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Check if we should use cache
    if (useCache) {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedData && cacheTimestamp) {
        const timeDiff = Date.now() - parseInt(cacheTimestamp);
        
        if (timeDiff < CACHE_DURATION) {
          try {
            const parsedData = JSON.parse(cachedData);
            return { ...parsedData, fromCache: true };
          } catch (error) {
            console.error('Error parsing cached job data:', error);
          }
        }
      }
    }

    // Fetch fresh data
    const response = await makeRequest(`/jobs/${id}`);
    const doc = await response.json();
    const job = mapDocToJob(doc);

    // Store in cache
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(job));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error caching job data:', error);
    }

    return { ...job, fromCache: false };
  },

  async createJob(data: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'applicants_count'>): Promise<Job> {
    const response = await makeRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const doc = await response.json();
    // backend returns { message, job } based on the snippet — try to handle both shapes
    const jobDoc = doc.job || doc;
    
    // Clear cache after creating a job
    this.clearCache();
    
    return mapDocToJob(jobDoc);
  },

  async updateJob(id: string, data: Partial<Job>): Promise<Job> {
    const response = await makeRequest(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const doc = await response.json();
    // backend returns { message, job } per snippet
    const jobDoc = doc.job || doc;
    
    // Clear cache after updating a job
    this.clearCache();
    
    return mapDocToJob(jobDoc);
  },

  async deleteJob(id: string): Promise<void> {
    await makeRequest(`/jobs/${id}`, {
      method: 'DELETE',
    });
    
    // Clear cache after deleting a job
    this.clearCache();
  },

  clearCache(): void {
    // Clear all jobs-related cache entries
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('jobs_cache') || key.startsWith('job_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },
};

// Helper mapper: convert MongoDB document into frontend Job
const mapDocToJob = (doc: any): Job => {
  if (!doc) return {
    id: '',
    title: '',
    description: '',
  };

  return {
    id: doc._id || doc.id || '',
    title: doc.title || '',
    description: doc.description || '',
    company: doc.company || '',
    location: doc.location || '',
    type: doc.type || doc.job_type || '',
    salary: doc.salary || '',
    skills: Array.isArray(doc.skills) ? doc.skills : [],
    requirements: Array.isArray(doc.requirements) ? doc.requirements : [],
    applicants_count: doc.applicants_count || 0,
    created_at: doc.created_at || doc.createdAt || undefined,
    updated_at: doc.updated_at || doc.updatedAt || undefined,
    category: doc.category,
    status: doc.status,
  } as Job;
};

// Candidates API
export const candidatesApi = {
  async getCandidates(filters: CandidateFilters = {}, useCache: boolean = true): Promise<{ candidates: Candidate[]; total: number; page: number; limit: number; fromCache?: boolean }> {
    const CACHE_KEY = 'candidates_cache';
    const CACHE_TIMESTAMP_KEY = 'candidates_cache_timestamp';
    const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

    // Generate cache key based on filters
    const filterKey = JSON.stringify(filters);
    const specificCacheKey = `${CACHE_KEY}_${filterKey}`;
    const specificTimestampKey = `${CACHE_TIMESTAMP_KEY}_${filterKey}`;

    // Check if we should use cache
    if (useCache) {
      const cachedData = localStorage.getItem(specificCacheKey);
      const cacheTimestamp = localStorage.getItem(specificTimestampKey);

      if (cachedData && cacheTimestamp) {
        const timeDiff = Date.now() - parseInt(cacheTimestamp);
        
        if (timeDiff < CACHE_DURATION) {
          // Cache is still valid
          try {
            const parsedData = JSON.parse(cachedData);
            return { ...parsedData, fromCache: true };
          } catch (error) {
            console.error('Error parsing cached candidates data:', error);
            // Continue to fetch fresh data
          }
        }
      }
    }

    // Fetch fresh data
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await makeRequest(`/admin/candidates?${params.toString()}`);
    const data = await response.json();

    // Store in cache
    try {
      localStorage.setItem(specificCacheKey, JSON.stringify(data));
      localStorage.setItem(specificTimestampKey, Date.now().toString());
    } catch (error) {
      console.error('Error caching candidates data:', error);
    }

    return { ...data, fromCache: false };
  },

  async getCandidateById(id: string): Promise<Candidate> {
    const response = await makeRequest(`/admin/candidates/${id}`);
    return response.json();
  },

  async updateCandidateStatus(id: string, status: 'pending' | 'accepted' | 'rejected', reason?: string): Promise<Candidate> {
    const response = await makeRequest(`/admin/candidates/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
    return response.json();
  },

  async downloadCV(id: string): Promise<Blob> {
    const response = await makeRequest(`/admin/candidates/${id}/cv`);
    return response.blob();
  },

  async exportCandidates(filters: CandidateFilters, format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await makeRequest('/admin/candidates/export', {
      method: 'POST',
      body: JSON.stringify({ ...filters, format }),
    });
    return response.blob();
  },

  clearCache(): void {
    // Clear all candidates cache entries
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('candidates_cache')) {
        localStorage.removeItem(key);
      }
    });
  },
};

// Reports API
export const reportsApi = {
  async generateReport(filters: ReportFilters): Promise<Report> {
    const response = await makeRequest('/admin/reports/generate', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
    return response.json();
  },

  async getReports(): Promise<Report[]> {
    const response = await makeRequest('/admin/reports');
    return response.json();
  },

  async downloadReport(id: string): Promise<Blob> {
    const response = await makeRequest(`/admin/reports/${id}/download`);
    return response.blob();
  },
};

// Dashboard stats API
export const dashboardApi = {
  async getStats(): Promise<{
    total_jobs: number;
    total_candidates: number;
    pending_reviews: number;
    recent_activity: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
    }>;
  }> {
    const response = await makeRequest('/admin/dashboard/stats');
    return response.json();
  },
};

// Users API
export const usersApi = {
  async getAllUsers(useCache: boolean = true): Promise<{ users: UserData[]; message?: string; fromCache?: boolean }> {
    const CACHE_KEY = 'all_users_cache';
    const CACHE_TIMESTAMP_KEY = 'all_users_cache_timestamp';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Check if we should use cache
    if (useCache) {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedData && cacheTimestamp) {
        const timeDiff = Date.now() - parseInt(cacheTimestamp);
        
        if (timeDiff < CACHE_DURATION) {
          // Cache is still valid
          try {
            const parsedData = JSON.parse(cachedData);
            return { ...parsedData, fromCache: true };
          } catch (error) {
            console.error('Error parsing cached data:', error);
            // Continue to fetch fresh data
          }
        }
      }
    }

    // Fetch fresh data
    const userId = getUserId();
    
    if (!userId) {
      throw new Error('User ID not found in local storage. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/get-all-users?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();

    // Store in cache
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error caching data:', error);
    }

    return { ...data, fromCache: false };
  },

  clearCache(): void {
    localStorage.removeItem('all_users_cache');
    localStorage.removeItem('all_users_cache_timestamp');
  },
};
