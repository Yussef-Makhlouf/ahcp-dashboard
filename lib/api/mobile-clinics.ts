import { api } from './base-api';
import type { MobileClinic, PaginatedResponse } from "@/types";
import { handleAPIResponse } from './api-response-handler';

export const mobileClinicsApi = {
  // Get paginated list
  getList: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    filter?: Record<string, any>;
  }): Promise<PaginatedResponse<MobileClinic>> => {
    try {
      // Filter out empty search parameters to avoid validation errors
      const cleanParams: Record<string, any> = {
        page: params?.page || 1,
        limit: params?.limit || 20,
      };
      
      if (params?.search && params.search.trim()) {
        cleanParams.search = params.search.trim();
      }
      
      // Filter out empty filter values
      if (params?.filter) {
        Object.entries(params.filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            cleanParams[key] = value;
          }
        });
      }

      const response = await api.get('/mobile-clinics/', {
        params: cleanParams,
        timeout: 30000,
      });

      // Use universal response handler
      return handleAPIResponse<MobileClinic>(response, params?.limit || 20);
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
