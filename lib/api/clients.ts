import apiClient, { api } from './base-api';
import type { Client, PaginatedResponse } from '@/types';
import { handleAPIResponse, handleStatisticsResponse } from './api-response-handler';
import { entityToasts } from '@/lib/utils/toast-utils';

export interface ClientsResponse {
  success: boolean;
  data: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClientResponse {
  success: boolean;
  data: Client;
  message?: string;
}

export const clientsApi = {
  // Get all clients with pagination and filtering
  getList: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    village?: string;
  }): Promise<PaginatedResponse<Client>> => {
    try {
      // Filter out empty search parameters to avoid validation errors
      const cleanParams: Record<string, any> = {
        page: params?.page || 1,
        limit: params?.limit || 10,
      };
      
      if (params?.search && params.search.trim()) {
        cleanParams.search = params.search.trim();
      }
      if (params?.status) {
        cleanParams.status = params.status;
      }
      if (params?.village) {
        cleanParams.village = params.village;
      }

      const response = await api.get('/clients', {
        params: cleanParams,
        timeout: 30000,
      });

      // Use the universal response handler
      return handleAPIResponse<Client>(response, params?.limit || 10);
    } catch (error: any) {
      console.error('Error fetching clients list:', error);
      // Use enhanced error message from interceptor
      throw new Error(error.userMessage || `Failed to fetch clients: ${error.message || 'Unknown error'}`);
    }
  },

  // Get single client by ID
  getById: async (id: string): Promise<Client> => {
    try {
      const response = await api.get(`/clients/${id}`, {
        timeout: 30000,
      });
      
      console.log('🔍 Raw client response:', response);
      
      // Handle response structure: { success: true, data: { client } }
      const responseData = response as any;
      
      // Check for the correct backend structure: { success: true, data: { client } }
      if (responseData.success && responseData.data && responseData.data.client) {
        console.log('✅ Found client in correct backend structure:', responseData.data.client);
        return responseData.data.client;
      }
      
      // Check for nested structure (axios wrapper)
      if (responseData.data && responseData.data.success && responseData.data.data && responseData.data.data.client) {
        console.log('✅ Found client in nested structure:', responseData.data.data.client);
        return responseData.data.data.client;
      }
      
      // Check for direct data structure
      if (responseData.data && responseData.data.client) {
        console.log('✅ Found client in direct structure:', responseData.data.client);
        return responseData.data.client;
      }
      
      // Check if response.data is the client directly
      if (responseData.data && responseData.data._id) {
        console.log('✅ Found client as direct data:', responseData.data);
        return responseData.data;
      }
      
      // Fallback
      console.log('⚠️ Using fallback for client data:', responseData);
      return responseData.data || responseData;
    } catch (error: any) {
      console.error('❌ Error fetching client by ID:', error);
      throw new Error(error.userMessage || `Failed to fetch client: ${error.message || 'Unknown error'}`);
    }
  },

  // Create new client
  create: async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    try {
      const response = await api.post('/clients', clientData, {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: {...} }
      const recordData = (response as any).data || response;
      return recordData;
    } catch (error: any) {
      console.error('Error creating client:', error);
      throw new Error(error.userMessage || `Failed to create client: ${error.message || 'Unknown error'}`);
    }
  },

  // Update client - Use _id instead of id for MongoDB
  update: async (id: string, clientData: Partial<Client>): Promise<Client> => {
    try {
      const response = await api.put(`/clients/${id}`, clientData, {
        timeout: 30000,
      });
      // Handle response structure: { success: true, data: {...} }
      const recordData = (response as any).data || response;
      return recordData;
    } catch (error: any) {
      console.error('Error updating client:', error);
      throw new Error(error.userMessage || `Failed to update client: ${error.message || 'Unknown error'}`);
    }
  },

  // Delete client
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/clients/${id}`, {
        timeout: 30000,
      });
    } catch (error: any) {
      console.error('Error deleting client:', error);
      throw new Error(error.userMessage || `Failed to delete client: ${error.message || 'Unknown error'}`);
    }
  },

  // Bulk delete clients
  bulkDelete: async (ids: (string | number)[]): Promise<{ deletedCount: number }> => {
    try {
      console.log('🗑️ Calling bulk delete with IDs:', ids.length, 'items');
      const response = await apiClient.delete('/clients/bulk-delete', {
        data: { ids },
        timeout: 30000,
      });
      console.log('✅ Bulk delete response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error bulk deleting clients:', error);
      throw new Error(`Failed to delete records: ${error.message || 'Unknown error'}`);
    }
  },

  // Delete all clients
  deleteAll: async (): Promise<{ deletedCount: number }> => {
    try {
      console.log('🗑️ Calling delete all clients');
      const response = await apiClient.delete('/clients/delete-all', {
        timeout: 30000,
      });
      console.log('✅ Delete all response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error deleting all clients:', error);
      throw new Error(`Failed to delete all records: ${error.message || 'Unknown error'}`);
    }
  },

  // Search clients by name
  search: async (searchTerm: string): Promise<Client[]> => {
    try {
      if (!searchTerm || !searchTerm.trim()) {
        return [];
      }
      
      const response = await api.get('/clients/search', {
        params: { q: searchTerm.trim() },
        timeout: 30000,
      });
      
      // Handle response structure
      const data = (response as any).data || [];
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Error searching clients:', error);
      throw new Error(`Failed to search clients: ${error.message || 'Unknown error'}`);
    }
  },

  // Get clients by village
  getByVillage: async (village: string): Promise<Client[]> => {
    try {
      if (!village || !village.trim()) {
        return [];
      }
      
      const response = await api.get('/clients', {
        params: { village: village.trim() },
        timeout: 30000,
      });
      
      // Handle response structure
      const data = (response as any).data || [];
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Error fetching clients by village:', error);
      throw new Error(`Failed to fetch clients by village: ${error.message || 'Unknown error'}`);
    }
  },

  // Get client statistics
  getStatistics: async (): Promise<{
    totalClients: number;
    activeClients: number;
    inactiveClients: number;
    totalAnimals: number;
    clientsByVillage: Record<string, number>;
  }> => {
    try {
      const response = await api.get('/clients/statistics', {
        timeout: 30000,
      });
      return handleStatisticsResponse(response);
    } catch (error: any) {
      console.error('Error fetching clients statistics:', error);
      // Return default values if API fails
      return {
        totalClients: 0,
        activeClients: 0,
        inactiveClients: 0,
        totalAnimals: 0,
        clientsByVillage: {},
      };
    }
  },

  // Get client visits (all services for a specific client)
  getClientVisits: async (clientId: string): Promise<{
    mobileClinic: any[];
    vaccination: any[];
    parasiteControl: any[];
    equineHealth: any[];
    laboratory: any[];
  }> => {
    try {
      const response = await api.get(`/clients/${clientId}/visits`, {
        timeout: 30000,
      });
      
      console.log('🔍 Raw visits response:', response);
      
      const responseData = response as any;
      
      // Check for the correct backend structure: { success: true, data: { mobileClinic: [], ... } }
      if (responseData.success && responseData.data) {
        console.log('✅ Found visits in correct backend structure:', responseData.data);
        return responseData.data;
      }
      
      // Check for nested structure (axios wrapper)
      if (responseData.data && responseData.data.success && responseData.data.data) {
        console.log('✅ Found visits in nested structure:', responseData.data.data);
        return responseData.data.data;
      }
      
      // Check for direct data structure
      if (responseData.data && (responseData.data.mobileClinic || responseData.data.vaccination)) {
        console.log('✅ Found visits in direct structure:', responseData.data);
        return responseData.data;
      }
      
      // Check if response is the data directly
      if (responseData.mobileClinic || responseData.vaccination) {
        console.log('✅ Found visits as direct response:', responseData);
        return responseData;
      }
      
      console.log('⚠️ No visits found, returning empty structure');
      // Fallback structure
      return {
        mobileClinic: [],
        vaccination: [],
        parasiteControl: [],
        equineHealth: [],
        laboratory: []
      };
    } catch (error: any) {
      console.error('❌ Error fetching client visits:', error);
      // Return empty arrays if API fails
      return {
        mobileClinic: [],
        vaccination: [],
        parasiteControl: [],
        equineHealth: [],
        laboratory: []
      };
    }
  },

};

export default clientsApi;
