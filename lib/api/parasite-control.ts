import apiClient, { api } from './base-api';
import type { ParasiteControl, ParasiteControlAPIResponse, PaginatedResponse } from '@/types';
import { handleAPIResponse, handleStatisticsResponse } from './api-response-handler';

// Real API integration only - no mock data fallback

// Transform API response to app format
function transformAPIResponse(apiData: any): ParasiteControl {
  return {
    _id: apiData._id,
    serialNo: apiData.serialNo || '',
    date: apiData.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    // Support both client and owner structures
    client: apiData.client ? {
      _id: apiData.client._id || '',
      name: apiData.client.name || '',
      nationalId: apiData.client.nationalId || '',
      phone: apiData.client.phone || '',
      village: apiData.client.village || '',
      birthDate: apiData.client.birthDate || '',
    } : {
      _id: '',
      name: '',
      nationalId: '',
      phone: '',
      village: '',
      birthDate: '',
    },
    owner: {
      name: apiData.client?.name || '',
      id: apiData.client?.nationalId || '',
      birthDate: apiData.client?.birthDate || '',
      phone: apiData.client?.phone || '',
    },
    coordinates: apiData.coordinates ? {
      latitude: apiData.coordinates.latitude || 0,
      longitude: apiData.coordinates.longitude || 0,
    } : undefined,
    location: {
      e: apiData.coordinates?.longitude || 0,
      n: apiData.coordinates?.latitude || 0,
    },
    supervisor: apiData.supervisor || '',
    vehicleNo: apiData.vehicleNo || '',
    // Support both herdCounts and herd structures
    herdCounts: apiData.herdCounts ? {
      sheep: apiData.herdCounts.sheep || { total: 0, young: 0, female: 0, treated: 0 },
      goats: apiData.herdCounts.goats || { total: 0, young: 0, female: 0, treated: 0 },
      camel: apiData.herdCounts.camel || { total: 0, young: 0, female: 0, treated: 0 },
      cattle: apiData.herdCounts.cattle || { total: 0, young: 0, female: 0, treated: 0 },
      horse: apiData.herdCounts.horse || { total: 0, young: 0, female: 0, treated: 0 },
    } : undefined,
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
      volumeMl: apiData.insecticide?.volumeMl || 0,
      status: apiData.insecticide?.status || "Not Sprayed",
      category: apiData.insecticide?.category || '',
    },
    barns: [],
    breedingSites: apiData.breedingSites || '',
    animalBarnSizeSqM: apiData.animalBarnSizeSqM || 0,
    herdHealthStatus: apiData.herdHealthStatus || "Healthy",
    complying: apiData.complyingToInstructions ? "Comply" : "Not Comply",
    complyingToInstructions: apiData.complyingToInstructions || false,
    request: {
      date: apiData.request?.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      situation: apiData.request?.situation || "Pending",
      fulfillingDate: apiData.request?.fulfillingDate ? apiData.request.fulfillingDate.split('T')[0] : undefined,
    },
    category: "مكافحة الطفيليات",
    remarks: apiData.remarks || '',
    // Virtual fields
    totalHerdCount: apiData.totalHerdCount,
    totalTreated: apiData.totalTreated,
    treatmentEfficiency: apiData.treatmentEfficiency,
    // Holding Code
    holdingCode: apiData.holdingCode,
    // Timestamps
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt,
    createdBy: apiData.createdBy,
    updatedBy: apiData.updatedBy,
  };
}

// Transform app format to API format
function transformToAPIFormat(appData: any): any {
  // دعم البنية الجديدة والقديمة
  const clientData = appData.clientData || appData.client || appData.owner;
  const coordinatesData = appData.coordinates || appData.location;
  const herdData = appData.herdCounts || appData.herd;
  
  return {
    serialNo: appData.serialNo,
    date: appData.date,
    client: appData.client || clientData?.name, // دعم إرسال client كـ string أو object
    clientData: clientData ? {
      name: clientData.name,
      nationalId: clientData.nationalId || clientData.id,
      phone: clientData.phone,
      village: clientData.village || '',
      detailedAddress: clientData.detailedAddress || '',
    } : undefined,
    coordinates: {
      longitude: coordinatesData?.longitude || coordinatesData?.e || 0,
      latitude: coordinatesData?.latitude || coordinatesData?.n || 0,
    },
    supervisor: appData.supervisor,
    vehicleNo: appData.vehicleNo,
    herdCounts: {
      sheep: {
        total: herdData?.sheep?.total || 0,
        young: herdData?.sheep?.young || 0,
        female: herdData?.sheep?.female || 0,
        treated: herdData?.sheep?.treated || 0,
      },
      goats: {
        total: herdData?.goats?.total || 0,
        young: herdData?.goats?.young || 0,
        female: herdData?.goats?.female || 0,
        treated: herdData?.goats?.treated || 0,
      },
      camel: {
        total: herdData?.camel?.total || 0,
        young: herdData?.camel?.young || 0,
        female: herdData?.camel?.female || 0,
        treated: herdData?.camel?.treated || 0,
      },
      cattle: {
        total: herdData?.cattle?.total || 0,
        young: herdData?.cattle?.young || 0,
        female: herdData?.cattle?.female || 0,
        treated: herdData?.cattle?.treated || 0,
      },
      horse: {
        total: herdData?.horse?.total || 0,
        young: herdData?.horse?.young || 0,
        female: herdData?.horse?.female || 0,
        treated: herdData?.horse?.treated || 0,
      },
    },
    insecticide: {
      type: appData.insecticide?.type,
      method: appData.insecticide?.method || "Pour on",
      volumeMl: appData.insecticide?.volumeMl, // إصلاح اسم الحقل
      status: appData.insecticide?.status,
      category: appData.insecticide?.category,
    },
    animalBarnSizeSqM: appData.animalBarnSizeSqM,
    breedingSites: Array.isArray(appData.breedingSites) 
      ? appData.breedingSites.map((site: any) => site.type).join(', ') 
      : appData.breedingSites || 'Not Available',
    herdHealthStatus: appData.herdHealthStatus,
    complyingToInstructions: appData.complyingToInstructions || appData.complying === "Comply",
    request: {
      date: appData.request?.date,
      situation: appData.request?.situation,
      fulfillingDate: appData.request?.fulfillingDate,
    },
    remarks: appData.remarks,
    // إضافة holdingCode - التأكد من إرساله بشكل صحيح
    holdingCode: (() => {
      console.log('🏠 API transformToAPIFormat - Processing holdingCode:', {
        value: appData.holdingCode,
        type: typeof appData.holdingCode,
        isNull: appData.holdingCode === null,
        isUndefined: appData.holdingCode === undefined,
        isEmpty: appData.holdingCode === ''
      });
      
      // إذا كان null أو undefined أو فارغ، أرسل null
      if (!appData.holdingCode || appData.holdingCode === '' || appData.holdingCode === null || appData.holdingCode === undefined) {
        console.log('🏠 API: holdingCode is empty/null/undefined - sending null');
        return null;
      }
      
      // إذا كان string وصحيح، أرسله
      if (typeof appData.holdingCode === 'string') {
        const trimmed = appData.holdingCode.trim();
        if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
          console.log('🏠 API: Valid ObjectId holdingCode - sending:', trimmed);
          return trimmed;
        } else {
          console.warn('🏠 API: Invalid ObjectId format - sending null instead:', trimmed);
          return null;
        }
      }
      
      // إذا كان object مع _id، استخرج الـ _id
      if (typeof appData.holdingCode === 'object' && appData.holdingCode._id) {
        console.log('🏠 API: Extracting _id from holdingCode object:', appData.holdingCode._id);
        return appData.holdingCode._id;
      }
      
      console.warn('🏠 API: Unknown holdingCode format - sending null:', appData.holdingCode);
      return null;
    })(),
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
        limit: params?.limit || 30,
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
      const result = handleAPIResponse<ParasiteControlAPIResponse>(response, params?.limit || 30);
      
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
      // Handle new response structure: { success: true, data: { records: [...] } }
      const responseData = (response as any).data;
      if (responseData && responseData.records && responseData.records.length > 0) {
        return transformAPIResponse(responseData.records[0]);
      }
      // Fallback for old structure
      const recordData = responseData || response;
      return transformAPIResponse(recordData);
    } catch (error: any) {
      console.error('Error fetching record by ID:', error);
      throw new Error(`Failed to fetch record: ${error.message || 'Unknown error'}`);
    }
  },
  
  // Create new record - Real API only
  create: async (data: Omit<ParasiteControl, 'serialNo'>): Promise<ParasiteControl> => {
    try {
      console.log('🚀 API create - Original data received:', {
        holdingCode: data.holdingCode,
        holdingCodeType: typeof data.holdingCode
      });
      
      const apiData = transformToAPIFormat(data);
      
      console.log('📤 API create - Final data to send:', {
        holdingCode: apiData.holdingCode,
        holdingCodeType: typeof apiData.holdingCode,
        fullApiData: apiData
      });
      
      const endpoint = '/parasite-control/';
      console.log('🌐 Making POST request to endpoint:', endpoint);
      console.log('🔍 Full URL will be:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${endpoint}`);
      
      const response = await api.post(endpoint, apiData, {
        timeout: 30000,
      });
      // Handle new response structure: { success: true, data: { records: [...] } }
      const responseData = (response as any).data;
      if (responseData && responseData.records && responseData.records.length > 0) {
        return transformAPIResponse(responseData.records[0]);
      }
      // Fallback for old structure
      const recordData = responseData || response;
      return transformAPIResponse(recordData);
    } catch (error: any) {
      console.error('Error creating record:', error);
      throw new Error(`Failed to create record: ${error.message || 'Unknown error'}`);
    }
  },
  
  // Update record (PUT - full update) - Real API only
  update: async (id: string | number, data: Partial<ParasiteControl>): Promise<ParasiteControl> => {
    try {
      console.log('🔄 Starting parasite control update:', { id, data });
      console.log('🚀 API update - Original data received:', {
        holdingCode: data.holdingCode,
        holdingCodeType: typeof data.holdingCode
      });
      
      const apiData = transformToAPIFormat(data);
      
      console.log('📤 API update - Final data to send:', {
        holdingCode: apiData.holdingCode,
        holdingCodeType: typeof apiData.holdingCode,
        fullApiData: apiData
      });
      
      const endpoint = `/parasite-control/${id}`;
      console.log('🌐 Making PUT request to endpoint:', endpoint);
      console.log('🔍 Full URL will be:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${endpoint}`);
      
      const response = await api.put(endpoint, apiData, {
        timeout: 30000,
      });
      
      console.log('✅ Update response received:', response);
      // Handle new response structure: { success: true, data: { records: [...] } }
      const responseData = (response as any).data;
      if (responseData && responseData.records && responseData.records.length > 0) {
        return transformAPIResponse(responseData.records[0]);
      }
      // Fallback for old structure
      const recordData = responseData || response;
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
      // Handle new response structure: { success: true, data: { records: [...] } }
      const responseData = (response as any).data;
      if (responseData && responseData.records && responseData.records.length > 0) {
        return transformAPIResponse(responseData.records[0]);
      }
      // Fallback for old structure
      const recordData = responseData || response;
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

  // Bulk delete records
  bulkDelete: async (ids: (string | number)[]): Promise<{ deletedCount: number }> => {
    try {
      console.log('🗑️ Calling bulk delete with IDs:', ids.length, 'items');
      const response = await apiClient.delete('/parasite-control/bulk-delete', {
        data: { ids },
        timeout: 30000,
      });
      console.log('✅ Bulk delete response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error bulk deleting parasite control records:', error);
      throw new Error(`Failed to delete records: ${error.message || 'Unknown error'}`);
    }
  },

  // Delete all records
  deleteAll: async (): Promise<{ deletedCount: number }> => {
    try {
      console.log('🗑️ Calling delete all parasite control records');
      const response = await apiClient.delete('/parasite-control/delete-all', {
        timeout: 30000,
      });
      console.log('✅ Delete all response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error deleting all parasite control records:', error);
      throw new Error(`Failed to delete all records: ${error.message || 'Unknown error'}`);
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
      
      const response = await api.post('/import/parasite-control', formData, {
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
      console.error('Error importing parasite control records:', error);
      throw new Error(`Failed to import: ${error.message || 'Unknown error'}`);
    }
  },

  // Export to Excel with new format - Real API only
  exportToExcel: async (filters?: Record<string, any>): Promise<Blob> => {
    try {
      const params = new URLSearchParams({
        format: 'csv',
        ...filters
      });
      
      return await api.get(`/parasite-control/export?${params.toString()}`, {
        responseType: 'blob',
        timeout: 60000, // 60 seconds timeout for export
      });
    } catch (error: any) {
      console.error('Error exporting Excel:', error);
      throw new Error(`Failed to export Excel: ${error.message || 'Unknown error'}`);
    }
  },

  // Get statistics - Real API only
  getStatistics: async (params?: { startDate?: string; endDate?: string }): Promise<{
    totalRecords: number;
    healthyRecords: number;
    sickRecords: number;
    complyRecords: number;
    recordsThisMonth: number;
    totalAnimals: number;
    totalTreated: number;
    totalVolumeUsed: number;
    healthyHerds: number;
    sickHerds: number;
    underTreatmentHerds: number;
  }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      
      const response = await api.get(`/parasite-control/statistics?${queryParams.toString()}`, {
        timeout: 30000,
      });
      
      // Use handleStatisticsResponse to extract data
      const data = (response as any).data || response;
      
      return {
        totalRecords: data.totalRecords || 0,
        healthyRecords: data.healthyHerds || 0,
        sickRecords: data.sickHerds || 0,
        complyRecords: data.complyRecords || 0,
        recordsThisMonth: data.recordsThisMonth || 0,
        totalAnimals: data.totalAnimals || 0,
        totalTreated: data.totalTreated || 0,
        totalVolumeUsed: data.totalVolumeUsed || 0,
        healthyHerds: data.healthyHerds || 0,
        sickHerds: data.sickHerds || 0,
        underTreatmentHerds: data.underTreatmentHerds || 0,
      };
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      // Return default values if API fails
      return {
        totalRecords: 0,
        healthyRecords: 0,
        sickRecords: 0,
        complyRecords: 0,
        recordsThisMonth: 0,
        totalAnimals: 0,
        totalTreated: 0,
        totalVolumeUsed: 0,
        healthyHerds: 0,
        sickHerds: 0,
        underTreatmentHerds: 0,
      };
    }
  },

  // Get detailed statistics for charts and visualizations
  getDetailedStatistics: async (params?: { startDate?: string; endDate?: string }): Promise<{
    sprayedAnimals: number;
    sprayedBarns: number;
    pourOnAnimals: number;
    oralDrenching: number;
    sheepTreated: number;
    goatsTreated: number;
    cattleTreated: number;
    camelTreated: number;
    horseTreated: number;
  }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      
      const response = await api.get(`/parasite-control/detailed-statistics?${queryParams.toString()}`, {
        timeout: 30000,
      });
      
      const data = (response as any).data || response;
      
      return {
        sprayedAnimals: data.sprayedAnimals || 0,
        sprayedBarns: data.sprayedBarns || 0,
        pourOnAnimals: data.pourOnAnimals || 0,
        oralDrenching: data.oralDrenching || 0,
        sheepTreated: data.sheepTreated || 0,
        goatsTreated: data.goatsTreated || 0,
        cattleTreated: data.cattleTreated || 0,
        camelTreated: data.camelTreated || 0,
        horseTreated: data.horseTreated || 0,
      };
    } catch (error: any) {
      console.error('Error fetching detailed statistics:', error);
      // Return default values if API fails
      return {
        sprayedAnimals: 0,
        sprayedBarns: 0,
        pourOnAnimals: 0,
        oralDrenching: 0,
        sheepTreated: 0,
        goatsTreated: 0,
        cattleTreated: 0,
        camelTreated: 0,
        horseTreated: 0,
      };
    }
  },
};
