import apiClient, { api } from './base-api';
import type { MobileClinic, PaginatedResponse } from "@/types";
import { handleAPIResponse } from './api-response-handler';

export const mobileClinicsApi = {
  // Get paginated list
  getList: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    diagnosis?: string; // فلتر التشخيص (من القائمة المنسدلة)
    medications?: string; // فلتر الأدوية (من القائمة المنسدلة)
    interventionCategory?: string;
    followUpRequired?: string;
    'request.situation'?: string;
    filter?: Record<string, any>;
    [key: string]: any; // Allow any additional filter parameters
  }): Promise<PaginatedResponse<MobileClinic>> => {
    try {
      console.log('🔍 MobileClinic API getList called with params:', params);
      
      // Filter out empty search parameters to avoid validation errors
      const cleanParams: Record<string, any> = {
        page: params?.page || 1,
        limit: params?.limit || 30,
      };
      
      if (params?.search && params.search.trim()) {
        cleanParams.search = params.search.trim();
      }
      
      // Handle all filter parameters (including direct ones and nested in filter object)
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          // Skip standard pagination/search params
          if (['page', 'limit', 'search', 'filter'].includes(key)) return;
          
          // Add any other parameter as filter if it has a valid value
          if (value !== undefined && value !== null && value !== '' && value !== '__all__') {
            cleanParams[key] = value;
            console.log(`📋 Adding mobile clinic filter parameter: ${key} = ${value}`);
          }
        });
      }
      
      // Also handle legacy filter object structure
      if (params?.filter) {
        Object.entries(params.filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '' && value !== '__all__') {
            cleanParams[key] = value;
            console.log(`📋 Adding legacy mobile clinic filter parameter: ${key} = ${value}`);
          }
        });
      }
      
      console.log('📤 Final mobile clinic API parameters being sent:', cleanParams);

      const response = await api.get('/mobile-clinics/', {
        params: cleanParams,
        timeout: 30000,
      });

      // Use universal response handler
      return handleAPIResponse<MobileClinic>(response, params?.limit || 30);
    } catch (error: any) {
      console.error('Error fetching mobile clinics list:', error);
      throw new Error(`Failed to fetch records: ${error.message || 'Unknown error'}`);
    }
  },

  // Get single record
  getById: async (id: string | number): Promise<MobileClinic> => {
    try {
      const response = await api.get(`/mobile-clinics/${id}`, {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: { record: {...} } }
      const apiResponse = response as any;
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data.record || apiResponse.data;
      }
      return apiResponse.data || apiResponse;
    } catch (error: any) {
      console.error('Error fetching record by ID:', error);
      throw new Error(`Failed to fetch record: ${error.message || 'Unknown error'}`);
    }
  },

  // Create new record
  create: async (data: any): Promise<MobileClinic> => {
    try {
      const response = await api.post('/mobile-clinics/', data, {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: { record: {...} } }
      const apiResponse = response as any;
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data.record || apiResponse.data;
      }
      return apiResponse.data || apiResponse;
    } catch (error: any) {
      console.error('Error creating record:', error);
      throw new Error(`Failed to create record: ${error.message || 'Unknown error'}`);
    }
  },

  // Update record
  update: async (id: string | number, data: any): Promise<MobileClinic> => {
    try {
      const response = await api.put(`/mobile-clinics/${id}`, data, {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: { record: {...} } }
      const apiResponse = response as any;
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data.record || apiResponse.data;
      }
      return apiResponse.data || apiResponse;
    } catch (error: any) {
      console.error('Error updating record:', error);
      throw new Error(`Failed to update record: ${error.message || 'Unknown error'}`);
    }
  },

  // Delete record
  delete: async (id: string | number): Promise<void> => {
    try {
      return await api.delete(`/mobile-clinics/${id}`, {
        timeout: 30000,
      });
    } catch (error: any) {
      console.error('Error deleting record:', error);
      throw new Error(`Failed to delete record: ${error.message || 'Unknown error'}`);
    }
  },

  // Bulk delete records
  bulkDelete: async (ids: (string | number)[]): Promise<{ deletedCount: number }> => {
    try {
      console.log('🗑️ Calling bulk delete with IDs:', ids.length, 'items');
      const response = await apiClient.delete('/mobile-clinics/bulk-delete', {
        data: { ids },
        timeout: 30000,
      });
      console.log('✅ Bulk delete response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error bulk deleting mobile clinic records:', error);
      throw new Error(`Failed to delete records: ${error.message || 'Unknown error'}`);
    }
  },

  // Delete all records
  deleteAll: async (): Promise<{ deletedCount: number }> => {
    try {
      console.log('🗑️ Calling delete all mobile clinic records');
      const response = await apiClient.delete('/mobile-clinics/delete-all', {
        timeout: 30000,
      });
      console.log('✅ Delete all response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error deleting all mobile clinic records:', error);
      throw new Error(`Failed to delete all records: ${error.message || 'Unknown error'}`);
    }
  },

  // Get statistics
  getStatistics: async (): Promise<{
    totalRecords: number;
    recordsThisMonth: number;
    totalAnimalsExamined: number;
    emergencyCases: number;
  }> => {
    try {
      const response = await api.get('/mobile-clinics/statistics', {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: {...} }
      const apiResponse = response as any;
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }
      return apiResponse.data || {
        totalRecords: 0,
        recordsThisMonth: 0,
        totalAnimalsExamined: 0,
        emergencyCases: 0,
      };
    } catch (error: any) {
      console.error('Error fetching mobile clinics statistics:', error);
      return {
        totalRecords: 0,
        recordsThisMonth: 0,
        totalAnimalsExamined: 0,
        emergencyCases: 0,
      };
    }
  },

  // Export to CSV
  exportToCsv: async (): Promise<Blob> => {
    try {
      const response = await api.get('/mobile-clinics/export', {
        params: { format: 'csv' },
        responseType: 'blob',
        timeout: 60000,
      });
      return response as Blob;
    } catch (error: any) {
      console.error('Error exporting mobile clinics to CSV:', error);
      throw new Error(`Failed to export: ${error.message || 'Unknown error'}`);
    }
  },

  // Import from file
  importFromFile: async (file: File): Promise<{
    success: boolean;
    totalRows: number;
    successRows: number;
    errorRows: number;
    errors: Array<{ row: number; field: string; message: string }>;
    importedRecords?: any[];
  }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/import/mobile-clinics', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for import
      });
      
      return response as {
        success: boolean;
        totalRows: number;
        successRows: number;
        errorRows: number;
        errors: Array<{ row: number; field: string; message: string }>;
        importedRecords?: any[];
      };
    } catch (error: any) {
      console.error('Error importing mobile clinics:', error);
      throw new Error(`Failed to import: ${error.message || 'Unknown error'}`);
    }
  }
};

export default mobileClinicsApi;
