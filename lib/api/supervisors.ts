import { api } from './base-api';

export interface Supervisor {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'section_supervisor';
  section?: string;
}

export interface SupervisorResponse {
  data: Supervisor[];
  fallback?: boolean;
  section?: string;
  count?: number;
  timestamp?: string;
}

export const supervisorsApi = {
  // Get all supervisors for dropdown - optimized
  getAll: async (): Promise<SupervisorResponse> => {
    try {
      console.log('🔍 Fetching supervisors from API...');
      
      const response = await api.get('/auth/supervisors', {
        timeout: 10000, // Reduced timeout for faster response
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Remove cache control to allow server-side caching
      });
      
      const apiResponse = response as any;
      console.log('📊 API Response:', {
        status: apiResponse.status,
        cached: apiResponse.data?.cached,
        count: apiResponse.data?.count,
        timestamp: apiResponse.data?.timestamp
      });
      
      // معالجة خاصة لـ API المشرفين - يعيد { success: true, data: [...] }
      const supervisors = Array.isArray(apiResponse.data) ? apiResponse.data : [];
      
      console.log(`✅ Successfully fetched ${supervisors.length} supervisors`);
      return {
        data: supervisors,
        fallback: false,
        count: supervisors.length,
        timestamp: apiResponse.data?.timestamp
      };
    } catch (error: any) {
      console.error('❌ Error fetching supervisors:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Return empty response instead of throwing to prevent UI crashes
      if (error.response?.status === 401) {
        console.warn('⚠️ Authentication required for supervisors');
      }
      
      return {
        data: [],
        fallback: false,
        count: 0
      };
    }
  },

  // Clear server cache
  clearCache: async (): Promise<void> => {
    try {
      await api.post('/auth/supervisors/clear-cache');
      console.log('🗑️ Server cache cleared');
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  },

  // Get supervisors by section
  getBySection: async (section: string): Promise<SupervisorResponse> => {
    try {
      console.log(`🔍 Fetching supervisors for section: ${section}`);
      
      const response = await api.get(`/auth/supervisors/by-section/${encodeURIComponent(section)}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const apiResponse = response as any;
      console.log('📊 API Response:', {
        status: apiResponse.status,
        section: apiResponse.data?.section,
        count: apiResponse.data?.count,
        fallback: apiResponse.data?.fallback,
        timestamp: apiResponse.data?.timestamp
      });
      
      // معالجة خاصة لـ API المشرفين - يعيد { success: true, data: [...], fallback?: boolean }
      const supervisors = Array.isArray(apiResponse.data) ? apiResponse.data : (apiResponse.data?.data || []);
      
      console.log(`✅ Successfully fetched ${supervisors.length} supervisors for section: ${section}`);
      
      return {
        data: supervisors,
        fallback: apiResponse.data?.fallback || false,
        section: apiResponse.data?.section || section,
        count: apiResponse.data?.count || supervisors.length,
        timestamp: apiResponse.data?.timestamp
      };
    } catch (error: any) {
      console.error('❌ Error fetching supervisors by section:', {
        section,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Return empty response instead of throwing to prevent UI crashes
      return {
        data: [],
        fallback: false,
        section,
        count: 0
      };
    }
  },
};
