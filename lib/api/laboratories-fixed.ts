import { api } from './base-api';
import type { Laboratory, PaginatedResponse } from "@/types";
import { handleAPIResponse, handleStatisticsResponse } from './api-response-handler';

export const laboratoriesApi = {
  // Get paginated list
  getList: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    filter?: Record<string, any>;
  }): Promise<PaginatedResponse<Laboratory>> => {
    try {
      const response = await api.get('/laboratories/', {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          search: params?.search || '',
          ...params?.filter,
        },
        timeout: 30000,
      });

      // Use the universal response handler
      return handleAPIResponse<Laboratory>(response, params?.limit || 20);
    } catch (error: any) {
      console.error('Error fetching laboratories list:', error);
      throw new Error(`Failed to fetch records: ${error.message || 'Unknown error'}`);
    }
  },

  // Get single record
  getById: async (id: string | number): Promise<Laboratory> => {
    try {
      const response = await api.get<Laboratory>(`/laboratories/${id}`, {
        timeout: 30000,
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching laboratory record:', error);
      throw new Error(`Failed to fetch record: ${error.message || 'Unknown error'}`);
    }
  },

  // Create new record
  create: async (data: Partial<Laboratory>): Promise<Laboratory> => {
    try {
      const response = await api.post<Laboratory>('/laboratories/', data, {
        timeout: 30000,
      });
      return response;
    } catch (error: any) {
      console.error('Error creating laboratory record:', error);
      throw new Error(`Failed to create record: ${error.message || 'Unknown error'}`);
    }
  },

  // Update record
  update: async (id: string | number, data: Partial<Laboratory>): Promise<Laboratory> => {
    try {
      const response = await api.put<Laboratory>(`/laboratories/${id}`, data, {
        timeout: 30000,
      });
      return response;
    } catch (error: any) {
      console.error('Error updating laboratory record:', error);
      throw new Error(`Failed to update record: ${error.message || 'Unknown error'}`);
    }
  },

  // Delete record
  delete: async (id: string | number): Promise<void> => {
    try {
      await api.delete(`/laboratories/${id}`, {
        timeout: 30000,
      });
    } catch (error: any) {
      console.error('Error deleting laboratory record:', error);
      throw new Error(`Failed to delete record: ${error.message || 'Unknown error'}`);
    }
  },

  // Get statistics
  getStatistics: async (): Promise<{
    totalSamples: number;
    samplesThisMonth: number;
    positiveCases: number;
    pendingTests?: number;
    completedTests?: number;
  }> => {
    try {
      const response = await api.get('/laboratories/statistics', {
        timeout: 30000,
      });
      return handleStatisticsResponse(response);
    } catch (error: any) {
      console.error('Error fetching laboratories statistics:', error);
      // Return default values if API fails
      return {
        totalSamples: 0,
        samplesThisMonth: 0,
        positiveCases: 0,
        pendingTests: 0,
        completedTests: 0,
      };
    }
  },

  // Export to CSV
  exportToCsv: async (): Promise<Blob> => {
    try {
      const response = await api.get('/laboratories/export', {
        responseType: 'blob',
        timeout: 60000,
      });
      return response as Blob;
    } catch (error: any) {
      console.error('Error exporting laboratories to CSV:', error);
      throw new Error(`Failed to export: ${error.message || 'Unknown error'}`);
    }
  }
};

export default laboratoriesApi;
