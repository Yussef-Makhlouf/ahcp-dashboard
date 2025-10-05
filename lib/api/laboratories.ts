import { api } from './base-api';
import type { Laboratory, PaginatedResponse } from '@/types';
import { handleAPIResponse, handleStatisticsResponse } from './api-response-handler';

export interface LaboratoriesResponse {
  success: boolean;
  data: Laboratory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LaboratoryResponse {
  success: boolean;
  data: Laboratory;
  message?: string;
}

export const laboratoriesApi = {
  // Get all laboratory records
  getList: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    sampleType?: string;
    collector?: string;
  }): Promise<PaginatedResponse<Laboratory>> => {
    try {
      // Filter out empty search parameters to avoid validation errors
      const cleanParams: Record<string, any> = {
        page: params?.page || 1,
        limit: params?.limit || 20,
      };
      
      if (params?.search && params.search.trim()) {
        cleanParams.search = params.search.trim();
      }
      if (params?.dateFrom) {
        cleanParams.dateFrom = params.dateFrom;
      }
      if (params?.dateTo) {
        cleanParams.dateTo = params.dateTo;
      }
      if (params?.sampleType) {
        cleanParams.sampleType = params.sampleType;
      }
      if (params?.collector) {
        cleanParams.collector = params.collector;
      }

      const response = await api.get('/laboratories', {
        params: cleanParams,
        timeout: 30000,
      });

      // Use the universal response handler
      return handleAPIResponse<Laboratory>(response, params?.limit || 20);
    } catch (error: any) {
      console.error('Error fetching laboratories list:', error);
      throw new Error(`Failed to fetch records: ${error.message || 'Unknown error'}`);
    }
  },

  // Get single record by sample code
  getBySampleCode: async (sampleCode: string): Promise<Laboratory> => {
    try {
      const response = await api.get(`/laboratories/${sampleCode}`, {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: {...} }
      const recordData = (response as any).data || response;
      return recordData;
    } catch (error: any) {
      console.error('Error fetching record by sample code:', error);
      throw new Error(`Failed to fetch record: ${error.message || 'Unknown error'}`);
    }
  },

  // Create new record
  create: async (data: Omit<Laboratory, 'sampleCode'>): Promise<Laboratory> => {
    try {
      const response = await api.post('/laboratories', data, {
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
  update: async (sampleCode: string, data: Partial<Laboratory>): Promise<Laboratory> => {
    try {
      const response = await api.put(`/laboratories/${sampleCode}`, data, {
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
  delete: async (sampleCode: string): Promise<void> => {
    try {
      await api.delete(`/laboratories/${sampleCode}`, {
        timeout: 30000,
      });
    } catch (error: any) {
      console.error('Error deleting record:', error);
      throw new Error(`Failed to delete record: ${error.message || 'Unknown error'}`);
    }
  },

  // Export to CSV
  exportToCsv: async (sampleCodes?: string[]): Promise<Blob> => {
    try {
      const response = await api.post('/laboratories/export/csv', { sampleCodes }, {
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
    totalSamples: number;
    samplesThisMonth: number;
    positiveCases: number;
    negativeCases: number;
    positivityRate: number;
    samplesByType?: Array<{ type: string; count: number }>;
    resultsByMonth?: Array<{ month: string; positive: number; negative: number }>;
  }> => {
    try {
      const response = await api.get<{
        totalSamples: number;
        samplesThisMonth: number;
        positiveCases: number;
        negativeCases: number;
        positivityRate: number;
        samplesByType?: Array<{ type: string; count: number }>;
        resultsByMonth?: Array<{ month: string; positive: number; negative: number }>;
      }>('/laboratories/statistics', {
        timeout: 30000,
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching laboratories statistics:', error);
      // Return default values if API fails
      return {
        totalSamples: 0,
        samplesThisMonth: 0,
        positiveCases: 0,
        negativeCases: 0,
        positivityRate: 0,
      };
    }
  },

  // Get sample types
  getSampleTypes: async (): Promise<string[]> => {
    const response = await api.get<{ data: string[] }>('/laboratories/sample-types');
    return response.data;
  }
};

export default laboratoriesApi;
