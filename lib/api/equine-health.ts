import { api } from "./base-api";
import type { EquineHealth, ApiResponse, PaginatedResponse } from "@/types";
import { handleAPIResponse, handleStatisticsResponse } from './api-response-handler';

export const equineHealthApi = {
  // Get paginated list
  getList: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    filter?: Record<string, any>;
  }): Promise<PaginatedResponse<EquineHealth>> => {
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

      const response = await api.get('/equine-health/', {
        params: cleanParams,
        timeout: 30000,
      });

      // Use the universal response handler
      return handleAPIResponse<EquineHealth>(response, params?.limit || 20);
    } catch (error: any) {
      console.error('Error fetching equine health list:', error);
      throw new Error(`Failed to fetch records: ${error.message || 'Unknown error'}`);
    }
  },

  // Get single record
  getById: async (id: string | number): Promise<EquineHealth> => {
    try {
      const response = await api.get(`/equine-health/${id}`, {
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
  create: async (data: Omit<EquineHealth, 'serialNo'>): Promise<EquineHealth> => {
    try {
      const response = await api.post('/equine-health/', data, {
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
  update: async (id: string | number, data: Partial<EquineHealth>): Promise<EquineHealth> => {
    try {
      const response = await api.put(`/equine-health/${id}`, data, {
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
      await api.delete(`/equine-health/${id}`, {
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
      const response = await api.post('/equine-health/export/csv', { ids }, {
        responseType: 'blob',
        timeout: 60000,
      });
      return response as Blob;
    } catch (error: any) {
      console.error('Error exporting CSV:', error);
      throw new Error(`Failed to export CSV: ${error.message || 'Unknown error'}`);
    }
  },

  // Get statistics
  getStatistics: async (): Promise<{
    totalRecords: number;
    recordsThisMonth: number;
    clinicalExaminations: number;
    surgicalOperations: number;
    labAnalyses: number;
  }> => {
    try {
      const response = await api.get('/equine-health/statistics', {
        timeout: 30000,
      });
      return handleStatisticsResponse(response);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      // Return default values if API fails
      return {
        totalRecords: 0,
        recordsThisMonth: 0,
        clinicalExaminations: 0,
        surgicalOperations: 0,
        labAnalyses: 0,
      };
    }
  },
};
