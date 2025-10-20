import { api } from './base-api';

export interface HoldingCode {
  _id?: string;
  code: string;
  village: string;
  description?: string;
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HoldingCodeCreateRequest {
  code: string;
  village: string;
  description?: string;
}

export interface HoldingCodeUpdateRequest {
  code?: string;
  village?: string;
  description?: string;
  isActive?: boolean;
}

export interface HoldingCodeListParams {
  village?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface HoldingCodeListResponse {
  success: boolean;
  data: HoldingCode[];
  pagination?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
  message?: string;
}

export interface HoldingCodeResponse {
  success: boolean;
  data?: HoldingCode;
  message?: string;
}

export const holdingCodesApi = {
  // Get all holding codes with optional filtering
  getList: async (params?: HoldingCodeListParams): Promise<HoldingCodeListResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.village) queryParams.append('village', params.village);
      if (params?.active !== undefined) queryParams.append('active', params.active.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);

      const response = await api.get(`/holding-codes?${queryParams.toString()}`);
      return response as HoldingCodeListResponse;
    } catch (error) {
      console.error('Error fetching holding codes:', error);
      throw error;
    }
  },

  // Get holding codes by village
  getByVillage: async (village: string): Promise<HoldingCodeListResponse> => {
    try {
      const response = await api.get(`/holding-codes/by-village/${encodeURIComponent(village)}`);
      return response as HoldingCodeListResponse;
    } catch (error) {
      console.error('Error fetching holding codes by village:', error);
      throw error;
    }
  },

  // Get single holding code by ID
  getById: async (id: string): Promise<HoldingCodeResponse> => {
    try {
      const response = await api.get(`/holding-codes/${id}`);
      return response as HoldingCodeResponse;
    } catch (error) {
      console.error('Error fetching holding code:', error);
      throw error;
    }
  },

  // Create new holding code
  create: async (data: HoldingCodeCreateRequest): Promise<HoldingCodeResponse> => {
    try {
      const response = await api.post('/holding-codes', data);
      return response as HoldingCodeResponse;
    } catch (error) {
      console.error('Error creating holding code:', error);
      throw error;
    }
  },

  // Update existing holding code
  update: async (id: string, data: HoldingCodeUpdateRequest): Promise<HoldingCodeResponse> => {
    try {
      const response = await api.put(`/holding-codes/${id}`, data);
      return response as HoldingCodeResponse;
    } catch (error) {
      console.error('Error updating holding code:', error);
      throw error;
    }
  },


  // Delete holding code
  delete: async (id: string): Promise<HoldingCodeResponse> => {
    try {
      const response = await api.delete(`/holding-codes/${id}`);
      return response as HoldingCodeResponse;
    } catch (error) {
      console.error('Error deleting holding code:', error);
      throw error;
    }
  },

  // Get statistics
  getStats: async () => {
    try {
      const response = await api.get('/holding-codes/stats');
      return response;
    } catch (error) {
      console.error('Error fetching holding codes statistics:', error);
      throw error;
    }
  }
};

export default holdingCodesApi;
