import { api } from './base-api';
import type { MobileClinic, PaginatedResponse } from "@/types";
import { handleAPIResponse, handleStatisticsResponse } from './api-response-handler';

export const mobileClinicsApi = {
  // Get paginated list
  getList: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    filter?: Record<string, any>;
  }): Promise<PaginatedResponse<MobileClinic>> => {
    try {
      const response = await api.get('/mobile-clinics/', {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 30,
          search: params?.search || '',
          ...params?.filter,
        },
        timeout: 30000,
      });

      // Use the universal response handler
      return handleAPIResponse<MobileClinic>(response, params?.limit || 30);
    } catch (error: any) {
      console.error('Error fetching mobile clinics list:', error);
      throw new Error(`Failed to fetch records: ${error.message || 'Unknown error'}`);
    }
  },

  // Get single record
  getById: async (id: string | number): Promise<MobileClinic> => {
    try {
      const response = await api.get<MobileClinic>(`/mobile-clinics/${id}`, {
        timeout: 30000,
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching mobile clinic record:', error);
      throw new Error(`Failed to fetch record: ${error.message || 'Unknown error'}`);
    }
  },

  // Create new record
  create: async (data: Partial<MobileClinic>): Promise<MobileClinic> => {
    try {
      const response = await api.post<MobileClinic>('/mobile-clinics/', data, {
        timeout: 30000,
      });
      return response;
    } catch (error: any) {
      console.error('Error creating mobile clinic record:', error);
      throw new Error(`Failed to create record: ${error.message || 'Unknown error'}`);
    }
  },

  // Update record
  update: async (id: string | number, data: Partial<MobileClinic>): Promise<MobileClinic> => {
    try {
      const response = await api.put<MobileClinic>(`/mobile-clinics/${id}`, data, {
        timeout: 30000,
      });
      return response;
    } catch (error: any) {
      console.error('Error updating mobile clinic record:', error);
      throw new Error(`Failed to update record: ${error.message || 'Unknown error'}`);
    }
  },

  // Delete record
  delete: async (id: string | number): Promise<void> => {
    try {
      await api.delete(`/mobile-clinics/${id}`, {
        timeout: 30000,
      });
    } catch (error: any) {
      console.error('Error deleting mobile clinic record:', error);
      throw new Error(`Failed to delete record: ${error.message || 'Unknown error'}`);
    }
  },

  // Get statistics
  getStatistics: async (): Promise<{
    totalRecords: number;
    recordsThisMonth: number;
    totalAnimalsExamined: number;
    commonDiagnoses?: Array<{ diagnosis: string; count: number }>;
    recordsByMonth?: Array<{ month: string; count: number }>;
  }> => {
    try {
      const response = await api.get('/mobile-clinics/statistics', {
        timeout: 30000,
      });
      return handleStatisticsResponse(response);
    } catch (error: any) {
      console.error('Error fetching mobile clinics statistics:', error);
      // Return default values if API fails
      return {
        totalRecords: 0,
        recordsThisMonth: 0,
        totalAnimalsExamined: 0,
      };
    }
  },

  // Export to CSV
  exportToCsv: async (): Promise<Blob> => {
    try {
      const response = await api.get('/mobile-clinics/export', {
        responseType: 'blob',
        timeout: 60000,
      });
      return response as Blob;
    } catch (error: any) {
      console.error('Error exporting mobile clinics to CSV:', error);
      throw new Error(`Failed to export: ${error.message || 'Unknown error'}`);
    }
  }
};

export default mobileClinicsApi;
