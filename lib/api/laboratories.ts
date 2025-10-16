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
  create: async (data: any): Promise<Laboratory> => {
    try {
      const response = await api.post('/laboratories', data, {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: { record: {...} } }
      const recordData = (response as any).data?.record || (response as any).data || response;
      return recordData;
    } catch (error: any) {
      console.error('Error creating record:', error);
      throw new Error(`Failed to create record: ${error.message || 'Unknown error'}`);
    }
  },

  // Update record
  update: async (sampleCode: string, data: any): Promise<Laboratory> => {
    try {
      const response = await api.put(`/laboratories/${sampleCode}`, data, {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: { record: {...} } }
      const recordData = (response as any).data?.record || (response as any).data || response;
      return recordData;
    } catch (error: any) {
      console.error('Error updating record:', error);
      throw new Error(`Failed to update record: ${error.message || 'Unknown error'}`);
    }
  },

  // Delete record
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/laboratories/${id}`, {
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
    pendingTests: number;
    completedTests: number;
    inProgressTests: number;
    totalTestSamples: number;
    samplesByType?: Array<{ type: string; count: number }>;
    resultsByMonth?: Array<{ month: string; positive: number; negative: number }>;
  }> => {
    try {
      const response = await api.get('/laboratories/statistics', {
        timeout: 30000,
      });
      
      // Use the statistics response handler to extract data correctly
      return handleStatisticsResponse(response);
    } catch (error: any) {
      console.error('Error fetching laboratories statistics:', error);
      // Return default values if API fails
      return {
        totalSamples: 0,
        samplesThisMonth: 0,
        positiveCases: 0,
        negativeCases: 0,
        positivityRate: 0,
        pendingTests: 0,
        completedTests: 0,
        inProgressTests: 0,
        totalTestSamples: 0,
      };
    }
  },

  // Get sample types
  getSampleTypes: async (): Promise<string[]> => {
    const response = await api.get<{ data: string[] }>('/laboratories/sample-types');
    return response.data;
  },

  // Import from file
  importFromFile: async (file: File): Promise<{
    success: boolean;
    message: string;
    imported: number;
    errors?: Array<{ row: number; error: string }>;
  }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/laboratories/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for large files
      });
      
      return response as any;
    } catch (error: any) {
      console.error('Error importing file:', error);
      throw new Error(`Failed to import file: ${error.message || 'Unknown error'}`);
    }
  },

  // Download template
  downloadTemplate: async (): Promise<Blob> => {
    try {
      const response = await api.get('/laboratories/template', {
        responseType: 'blob',
        timeout: 30000,
      });
      return response as Blob;
    } catch (error: any) {
      console.error('Error downloading template:', error);
      throw new Error(`Failed to download template: ${error.message || 'Unknown error'}`);
    }
  },

  // Export to Excel
  exportToExcel: async (sampleCodes?: string[]): Promise<Blob> => {
    try {
      const response = await api.post('/laboratories/export/excel', { sampleCodes }, {
        responseType: 'blob',
        timeout: 60000,
      });
      return response as Blob;
    } catch (error: any) {
      console.error('Error exporting Excel:', error);
      throw new Error(`Failed to export Excel: ${error.message || 'Unknown error'}`);
    }
  },

  // Export to PDF
  exportToPdf: async (sampleCodes?: string[]): Promise<Blob> => {
    try {
      const response = await api.post('/laboratories/export/pdf', { sampleCodes }, {
        responseType: 'blob',
        timeout: 60000,
      });
      return response as Blob;
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      throw new Error(`Failed to export PDF: ${error.message || 'Unknown error'}`);
    }
  }
};

export default laboratoriesApi;
