import { api } from './base-api';

export interface Supervisor {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'section_supervisor';
  section?: string;
  supervisorCode?: string;
  vehicleNo?: string;
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
      console.log('🔍 Fetching all supervisors using supervisors-only endpoint...');
      
      const response = await api.get('/users?hasVehicleNo=true&limit=100', {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const apiResponse = response as any;
      console.log('📊 API Response:', {
        status: apiResponse.status,
        success: apiResponse.success,
        count: apiResponse.data?.users?.length,
        total: apiResponse.data?.pagination?.total
      });
      
      // معالجة API المستخدمين - يعيد { success: true, data: { users: [...], pagination: {...} } }
      const supervisors = apiResponse.data?.users || [];
      
      console.log(`✅ Successfully fetched ${supervisors.length} supervisors`);
      
      return {
        data: supervisors,
        fallback: false,
        count: supervisors.length,
        timestamp: new Date().toISOString()
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
      console.log(`🔍 Fetching supervisors for section: ${section} using supervisors-only endpoint`);
      
      const response = await api.get(`/users`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const apiResponse = response as any;
      console.log('📊 API Response:', {
        status: apiResponse.status,
        success: apiResponse.success,
        count: apiResponse.data?.users?.length,
        total: apiResponse.data?.pagination?.total
      });
      
      // معالجة API المستخدمين - يعيد { success: true, data: { users: [...], pagination: {...} } }
      const supervisors = apiResponse.data?.users || [];
      
      console.log(`✅ Successfully fetched ${supervisors.length} supervisors for section: ${section}`);
      
      return {
        data: supervisors,
        fallback: false,
        section: section,
        count: supervisors.length,
        timestamp: new Date().toISOString()
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

  // Update existing supervisors with codes and vehicle numbers
  updateExistingSupervisors: async (): Promise<any> => {
    try {
      console.log('🔄 Updating existing supervisors...');
      
      const response = await api.post('/users/supervisors/update-codes');
      
      const apiResponse = response as any;
      console.log('📊 Update Response:', {
        success: apiResponse.success,
        updatedCount: apiResponse.data?.updatedCount,
        totalSupervisors: apiResponse.data?.totalSupervisors
      });
      
      return apiResponse;
    } catch (error: any) {
      console.error('❌ Error updating supervisors:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      throw error;
    }
  }
};
