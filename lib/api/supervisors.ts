import { api } from './base-api';

export interface Supervisor {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'section_supervisor';
  section?: string;
}

export const supervisorsApi = {
  // Get all supervisors for dropdown - optimized
  getAll: async (): Promise<Supervisor[]> => {
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
      
      console.log('📊 API Response:', {
        status: (response as any).status,
        cached: (response as any).data?.cached,
        count: (response as any).data?.count,
        timestamp: (response as any).data?.timestamp
      });
      
      // معالجة خاصة لـ API المشرفين - يعيد { success: true, data: [...] }
      const supervisors = Array.isArray((response as any).data) ? (response as any).data : [];
      
      console.log(`✅ Successfully fetched ${supervisors.length} supervisors`);
      return supervisors;
    } catch (error: any) {
      console.error('❌ Error fetching supervisors:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Return empty array instead of throwing to prevent UI crashes
      if (error.response?.status === 401) {
        console.warn('⚠️ Authentication required for supervisors');
      }
      
      return [];
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
  getBySection: async (section: string): Promise<Supervisor[]> => {
    try {
      console.log(`🔍 Fetching supervisors for section: ${section}`);
      
      const response = await api.get(`/auth/supervisors/by-section/${encodeURIComponent(section)}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📊 API Response:', {
        status: (response as any).status,
        section: (response as any).data?.section,
        count: (response as any).data?.count,
        timestamp: (response as any).data?.timestamp
      });
      
      // معالجة خاصة لـ API المشرفين - يعيد { success: true, data: [...] }
      const supervisors = Array.isArray((response as any).data) ? (response as any).data : [];
      
      console.log(`✅ Successfully fetched ${supervisors.length} supervisors for section: ${section}`);
      return supervisors;
    } catch (error: any) {
      console.error('❌ Error fetching supervisors by section:', {
        section,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },
};
