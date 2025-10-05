import { api } from './base-api';
import type { Vaccination, PaginatedResponse } from "@/types";
import { handleAPIResponse, handleStatisticsResponse } from './api-response-handler';

export const vaccinationApi = {
  // Get paginated list
  getList: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    filter?: Record<string, any>;
  }): Promise<PaginatedResponse<Vaccination>> => {
    try {
      // Filter out empty search parameters to avoid validation errors
      const cleanParams: Record<string, any> = {
        page: params?.page || 1,
        limit: params?.limit || 20,
      };
      
      if (params?.search && params.search.trim()) {
        cleanParams.search = params.search.trim();
      }
      
      if (params?.filter) {
        Object.entries(params.filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            cleanParams[key] = value;
          }
        });
      }

      const response = await api.get('/vaccination/', {
        params: cleanParams,
        timeout: 30000,
      });

      // Use the universal response handler
      return handleAPIResponse<Vaccination>(response, params?.limit || 20);
    } catch (error: any) {
      console.error('Error fetching vaccination list:', error);
      throw new Error(`Failed to fetch records: ${error.message || 'Unknown error'}`);
    }
  },

  // Get single record
  getById: async (id: string | number): Promise<Vaccination> => {
    try {
      const response = await api.get(`/vaccination/${id}`, {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: {...} }
      const recordData = (response as any).data || response;
      return recordData;
    } catch (error: any) {
      console.error('Error fetching record by ID:', error);
      throw new Error(`Failed to fetch record: ${error.message || 'Unknown error'}`);
    }
  },

  // Create new record
  create: async (data: Omit<Vaccination, 'serialNo'>): Promise<Vaccination> => {
    try {
      const response = await api.post('/vaccination/', data, {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: {...} }
      const recordData = (response as any).data || response;
      return recordData;
    } catch (error: any) {
      console.error('Error creating record:', error);
      throw new Error(`Failed to create record: ${error.message || 'Unknown error'}`);
    }
  },

  // Update record
  update: async (id: string | number, data: Partial<Vaccination>): Promise<Vaccination> => {
    try {
      const response = await api.put(`/vaccination/${id}`, data, {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: {...} }
      const recordData = (response as any).data || response;
      return recordData;
    } catch (error: any) {
      console.error('Error updating record:', error);
      throw new Error(`Failed to update record: ${error.message || 'Unknown error'}`);
    }
  },

  // Delete record
  delete: async (id: string | number): Promise<void> => {
    try {
      return await api.delete(`/vaccination/${id}`, {
        timeout: 30000,
      });
    } catch (error: any) {
      console.error('Error deleting record:', error);
      throw new Error(`Failed to delete record: ${error.message || 'Unknown error'}`);
    }
  },

  // Export to CSV
  exportToCsv: async (ids?: (string | number)[]): Promise<Blob> => {
    try {
      return await api.post('/vaccination/export/csv', { ids }, {
        responseType: 'blob',
        timeout: 60000,
      });
    } catch (error: any) {
      console.error('Error exporting CSV:', error);
      throw new Error(`Failed to export CSV: ${error.message || 'Unknown error'}`);
    }
  },

  // Get statistics
  getStatistics: async (): Promise<{
    totalRecords: number;
    preventiveVaccinations: number;
    emergencyVaccinations: number;
    totalAnimalsVaccinated: number;
    recordsThisMonth: number;
  }> => {
    try {
      const response = await api.get('/vaccination/statistics', {
        timeout: 30000,
      });
      return handleStatisticsResponse(response);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      // Return default values if API fails
      return {
        totalRecords: 0,
        preventiveVaccinations: 0,
        emergencyVaccinations: 0,
        totalAnimalsVaccinated: 0,
        recordsThisMonth: 0,
      };
    }
  },
};
