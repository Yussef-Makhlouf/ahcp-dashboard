import { api } from "./base-api";
import type { EquineHealth, PaginatedResponse } from "@/types";
import { handleAPIResponse, handleStatisticsResponse } from './api-response-handler';

// Transform API response to frontend format
const transformAPIResponse = (apiData: any): EquineHealth => {
  if (!apiData) return apiData;

  return {
    ...apiData,
    // Support both old and new structures
    serialNo: apiData.serialNo || apiData._id,
    client: apiData.client || {
      name: apiData.owner?.name || '',
      nationalId: apiData.owner?.id || '',
      phone: apiData.owner?.phone || '',
      village: apiData.owner?.village || '',
      detailedAddress: apiData.owner?.detailedAddress || '',
    },
    coordinates: apiData.coordinates || {
      latitude: apiData.location?.n || 0,
      longitude: apiData.location?.e || 0,
    },
    farmLocation: apiData.farmLocation || '',
    followUpRequired: apiData.followUpRequired || false,
    followUpDate: apiData.followUpDate || '',
    // Ensure request object exists
    request: apiData.request || {
      date: apiData.date || new Date().toISOString().split('T')[0],
      situation: 'Open',
      fulfillingDate: undefined,
    },
    // Keep legacy fields for backward compatibility
    owner: apiData.owner,
    location: apiData.location,
  };
};

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

      const response = await api.get('/equine-health', {
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
  getById: async (id: string): Promise<EquineHealth> => {
    try {
      const response = await api.get(`/equine-health/${id}`, {
        timeout: 30000,
      });
      // Handle nested response structure: { success: true, data: { record: {...} } }
      const recordData = (response as any).data?.record || (response as any).data || response;
      return transformAPIResponse(recordData);
    } catch (error: any) {
      console.error('Error fetching record by ID:', error);
      throw new Error(`Failed to fetch record: ${error.message || 'Unknown error'}`);
    }
  },

  // Create new record
  create: async (data: Partial<EquineHealth>): Promise<EquineHealth> => {
    try {
      const response = await api.post('/equine-health', data, {
        timeout: 30000,
      });
      // Handle nested response structure: { success: true, data: { record: {...} } }
      const recordData = (response as any).data?.record || (response as any).data || response;
      return transformAPIResponse(recordData);
    } catch (error: any) {
      console.error('Error creating record:', error);
      throw new Error(`Failed to create record: ${error.message || 'Unknown error'}`);
    }
  },

  // Update record
  update: async (id: string, data: Partial<EquineHealth>): Promise<EquineHealth> => {
    try {
      const response = await api.put(`/equine-health/${id}`, data, {
        timeout: 30000,
      });
      // Handle nested response structure: { success: true, data: { record: {...} } }
      const recordData = (response as any).data?.record || (response as any).data || response;
      return transformAPIResponse(recordData);
    } catch (error: any) {
      console.error('Error updating record:', error);
      throw new Error(`Failed to update record: ${error.message || 'Unknown error'}`);
    }
  },

  // Delete record
  delete: async (id: string): Promise<void> => {
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
      const response = await api.get('/equine-health/export', {
        params: ids ? { ids: ids.join(',') } : {},
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
    ultrasonography: number;
    labAnalyses: number;
    farriery: number;
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
        ultrasonography: 0,
        labAnalyses: 0,
        farriery: 0,
      };
    }
  },

  // Download template
  downloadTemplate: async (): Promise<Blob> => {
    try {
      const response = await api.get('/equine-health/template', {
        responseType: 'blob',
        timeout: 30000,
      });
      return response as Blob;
    } catch (error: any) {
      console.error('Error downloading template:', error);
      throw new Error(`Failed to download template: ${error.message || 'Unknown error'}`);
    }
  },

  // Import from CSV
  importFromCsv: async (file: File): Promise<{
    success: boolean;
    totalRows: number;
    successRows: number;
    errorRows: number;
    errors: string[];
    importedRecords?: EquineHealth[];
  }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/equine-health/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for large files
      });

      return (response as any).data || response;
    } catch (error: any) {
      console.error('Error importing CSV:', error);
      throw new Error(`Failed to import CSV: ${error.message || 'Unknown error'}`);
    }
  },
};
