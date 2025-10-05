import { api } from './base-api';
import type { ParasiteControl, ParasiteControlAPIResponse, PaginatedResponse } from '@/types';
import { handleAPIResponse, handleStatisticsResponse } from './api-response-handler';

// Real API integration only - no mock data fallback

// Transform API response to app format
function transformAPIResponse(apiData: any): ParasiteControl {
  return {
    _id: apiData._id,
    serialNo: apiData.serialNo || '',
    date: apiData.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    owner: {
      name: apiData.client?.name || '',
      id: apiData.client?.nationalId || '',
      birthDate: '', // Not provided in current API
      phone: apiData.client?.phone || '',
    },
    location: {
      e: apiData.coordinates?.longitude || 0,
      n: apiData.coordinates?.latitude || 0,
    },
    supervisor: apiData.supervisor || '',
    vehicleNo: apiData.vehicleNo || '',
    herd: {
      sheep: {
        total: apiData.herdCounts?.sheep?.total || 0,
        young: apiData.herdCounts?.sheep?.young || 0,
        female: apiData.herdCounts?.sheep?.female || 0,
        treated: apiData.herdCounts?.sheep?.treated || 0,
      },
      goats: {
        total: apiData.herdCounts?.goats?.total || 0,
        young: apiData.herdCounts?.goats?.young || 0,
        female: apiData.herdCounts?.goats?.female || 0,
        treated: apiData.herdCounts?.goats?.treated || 0,
      },
      camel: {
        total: apiData.herdCounts?.camel?.total || 0,
        young: apiData.herdCounts?.camel?.young || 0,
        female: apiData.herdCounts?.camel?.female || 0,
        treated: apiData.herdCounts?.camel?.treated || 0,
      },
      cattle: {
        total: apiData.herdCounts?.cattle?.total || 0,
        young: apiData.herdCounts?.cattle?.young || 0,
        female: apiData.herdCounts?.cattle?.female || 0,
        treated: apiData.herdCounts?.cattle?.treated || 0,
      },
    },
    insecticide: {
      type: apiData.insecticide?.type || '',
      method: apiData.insecticide?.method || "Pour on",
      volume_ml: apiData.insecticide?.volumeMl || 0,
      status: apiData.insecticide?.status || "Not Sprayed",
      category: apiData.insecticide?.category || '',
    },
    barns: [],
    breedingSites: apiData.breedingSites ? [{ type: apiData.breedingSites, area: 0, treatment: '' }] : [],
    herdLocation: apiData.herdLocation || '',
    animalBarnSizeSqM: apiData.animalBarnSizeSqM || 0,
    parasiteControlVolume: apiData.parasiteControlVolume || 0,
    parasiteControlStatus: apiData.parasiteControlStatus || '',
    herdHealthStatus: apiData.herdHealthStatus || "Healthy",
    complying: apiData.complyingToInstructions ? "Comply" : "Not Comply",
    request: {
      date: apiData.request?.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      situation: apiData.request?.situation || "Pending",
      fulfillingDate: apiData.request?.fulfillingDate ? apiData.request.fulfillingDate.split('T')[0] : undefined,
    },
    category: "مكافحة الطفيليات",
    remarks: apiData.remarks || '',
  };
}

// Transform app format to API format
function transformToAPIFormat(appData: Partial<ParasiteControl>): any {
  return {
    serialNo: appData.serialNo,
    date: appData.date,
    client: {
      name: appData.owner?.name,
      nationalId: appData.owner?.id,
      phone: appData.owner?.phone,
      village: '', // Not available in current app format
      detailedAddress: '', // Not available in current app format
    },
    coordinates: {
      longitude: appData.location?.e,
      latitude: appData.location?.n,
    },
    supervisor: appData.supervisor,
    vehicleNo: appData.vehicleNo,
    herdCounts: {
      sheep: {
        total: appData.herd?.sheep?.total || 0,
        young: appData.herd?.sheep?.young || 0,
        female: appData.herd?.sheep?.female || 0,
        treated: appData.herd?.sheep?.treated || 0,
      },
      goats: {
        total: appData.herd?.goats?.total || 0,
        young: appData.herd?.goats?.young || 0,
        female: appData.herd?.goats?.female || 0,
        treated: appData.herd?.goats?.treated || 0,
      },
      camel: {
        total: appData.herd?.camel?.total || 0,
        young: appData.herd?.camel?.young || 0,
        female: appData.herd?.camel?.female || 0,
        treated: appData.herd?.camel?.treated || 0,
      },
      cattle: {
        total: appData.herd?.cattle?.total || 0,
        young: appData.herd?.cattle?.young || 0,
        female: appData.herd?.cattle?.female || 0,
        treated: appData.herd?.cattle?.treated || 0,
      },
      horse: {
        total: 0,
        young: 0,
        female: 0,
        treated: 0,
      },
    },
    insecticide: {
      type: appData.insecticide?.type,
      method: appData.insecticide?.method || "Pour on",
      volumeMl: appData.insecticide?.volume_ml,
      status: appData.insecticide?.status,
      category: appData.insecticide?.category,
    },
    herdLocation: appData.herdLocation,
    animalBarnSizeSqM: appData.animalBarnSizeSqM,
    breedingSites: appData.breedingSites?.map(site => site.type).join(', ') || 'Not Available',
    parasiteControlVolume: appData.parasiteControlVolume,
    parasiteControlStatus: appData.parasiteControlStatus,
    herdHealthStatus: appData.herdHealthStatus,
    complyingToInstructions: appData.complying === "Comply",
    request: {
      date: appData.request?.date,
      situation: appData.request?.situation,
      fulfillingDate: appData.request?.fulfillingDate,
    },
    remarks: appData.remarks,
  };
}

export const parasiteControlApi = {
  // Get paginated list - Real API only
  getList: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    filter?: Record<string, any>;
  }): Promise<PaginatedResponse<ParasiteControl>> => {
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

      const response = await api.get('/parasite-control/', {
        params: cleanParams,
        timeout: 30000, // 30 seconds timeout
      });

      // Use the universal response handler
      const result = handleAPIResponse<ParasiteControlAPIResponse>(response, params?.limit || 20);
      
      return {
        data: result.data.map(transformAPIResponse),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      };
    } catch (error: any) {
      console.error('Error fetching parasite control list:', error);
      throw new Error(`Failed to fetch records: ${error.message || 'Unknown error'}`);
    }
  },
  
  // Get single record - Real API only
  getById: async (id: string | number): Promise<ParasiteControl> => {
    try {
      const response = await api.get(`/parasite-control/${id}`, {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: {...} }
      const recordData = (response as any).data || response;
      return transformAPIResponse(recordData);
    } catch (error: any) {
      console.error('Error fetching record by ID:', error);
      throw new Error(`Failed to fetch record: ${error.message || 'Unknown error'}`);
    }
  },
  
  // Create new record - Real API only
  create: async (data: Omit<ParasiteControl, 'serialNo'>): Promise<ParasiteControl> => {
    try {
      const apiData = transformToAPIFormat(data);
      const response = await api.post('/parasite-control/', apiData, {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: {...} }
      const recordData = (response as any).data || response;
      return transformAPIResponse(recordData);
    } catch (error: any) {
      console.error('Error creating record:', error);
      throw new Error(`Failed to create record: ${error.message || 'Unknown error'}`);
    }
  },
  
  // Update record (PUT - full update) - Real API only
  update: async (id: string | number, data: Partial<ParasiteControl>): Promise<ParasiteControl> => {
    try {
      const apiData = transformToAPIFormat(data);
      const response = await api.put(`/parasite-control/${id}`, apiData, {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: {...} }
      const recordData = (response as any).data || response;
      return transformAPIResponse(recordData);
    } catch (error: any) {
      console.error('Error updating record:', error);
      throw new Error(`Failed to update record: ${error.message || 'Unknown error'}`);
    }
  },

  // Partial update (PATCH) - Real API only
  patch: async (id: string | number, data: Partial<ParasiteControl>): Promise<ParasiteControl> => {
    try {
      const apiData = transformToAPIFormat(data);
      const response = await api.patch(`/parasite-control/${id}`, apiData, {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: {...} }
      const recordData = (response as any).data || response;
      return transformAPIResponse(recordData);
    } catch (error: any) {
      console.error('Error patching record:', error);
      throw new Error(`Failed to patch record: ${error.message || 'Unknown error'}`);
    }
  },
  
  // Delete record - Real API only
  delete: async (id: string | number): Promise<void> => {
    try {
      return await api.delete(`/parasite-control/${id}`, {
        timeout: 30000,
      });
    } catch (error: any) {
      console.error('Error deleting record:', error);
      throw new Error(`Failed to delete record: ${error.message || 'Unknown error'}`);
    }
  },
  
  // Export to CSV - Real API only
  exportToCsv: async (ids?: (string | number)[]): Promise<Blob> => {
    try {
      return await api.post('/parasite-control/export/csv', { ids }, {
        responseType: 'blob',
        timeout: 60000, // 60 seconds timeout for export
      });
    } catch (error: any) {
      console.error('Error exporting CSV:', error);
      throw new Error(`Failed to export CSV: ${error.message || 'Unknown error'}`);
    }
  },

  // Get statistics - Real API only
  getStatistics: async (): Promise<{
    totalRecords: number;
    healthyRecords: number;
    sickRecords: number;
    complyRecords: number;
    recordsThisMonth: number;
  }> => {
    try {
      const response = await api.get<{
        totalRecords: number;
        healthyRecords: number;
        sickRecords: number;
        complyRecords: number;
        recordsThisMonth: number;
      }>('/parasite-control/statistics', {
        timeout: 30000,
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      // Return default values if API fails
      return {
        totalRecords: 0,
        healthyRecords: 0,
        sickRecords: 0,
        complyRecords: 0,
        recordsThisMonth: 0,
      };
    }
  },
};
