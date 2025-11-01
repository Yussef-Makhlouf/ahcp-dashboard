import { apiConfig } from './api-config';
import { api } from './base-api';

export interface Village {
  _id: string;
  serialNumber: string;
  sector: string;
  nameArabic: string;
  nameEnglish: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  fullName: string;
}

export interface VillageSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sector?: string;
}

export interface VillageCreateData {
  serialNumber: string;
  sector: string;
  nameArabic: string;
  nameEnglish: string;
}

export interface VillageUpdateData extends Partial<VillageCreateData> {}

export interface VillageResponse {
  success: boolean;
  data: Village[];
  pagination?: {
    current: number;
    pages: number;
    total: number;
  };
  message?: string;
}

export interface VillageSingleResponse {
  success: boolean;
  data: Village;
  message?: string;
}

export interface SectorsResponse {
  success: boolean;
  data: string[];
}

class VillagesApi {
  private baseUrl = apiConfig.baseUrl;


  /**
   * Get all villages with pagination and search
   */
  async getList(params: VillageSearchParams = {}): Promise<VillageResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.sector) searchParams.append('sector', params.sector);

    const queryString = searchParams.toString();
    const url = `/villages${queryString ? `?${queryString}` : ''}`;

    return api.get<VillageResponse>(url);
  }

  /**
   * Search villages by name or region
   */
  async search(query: string, limit: number = 20): Promise<VillageResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    searchParams.append('limit', limit.toString());

    return api.get<VillageResponse>(`/villages/search?${searchParams.toString()}`);
  }

  /**
   * Get all sectors
   */
  async getSectors(): Promise<SectorsResponse> {
    return api.get<SectorsResponse>('/villages/sectors');
  }

  /**
   * Get village by ID
   */
  async getById(id: string): Promise<VillageSingleResponse> {
    return api.get<VillageSingleResponse>(`/villages/${id}`);
  }

  /**
   * Create new village
   */
  async create(data: VillageCreateData): Promise<VillageSingleResponse> {
    return api.post<VillageSingleResponse>('/villages', data);
  }

  /**
   * Update village
   */
  async update(id: string, data: VillageUpdateData): Promise<VillageSingleResponse> {
    return api.put<VillageSingleResponse>(`/villages/${id}`, data);
  }

  /**
   * Delete village (soft delete)
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/villages/${id}`);
  }

  /**
   * Create multiple villages
   */
  async bulkCreate(villages: VillageCreateData[]): Promise<VillageResponse> {
    return api.post<VillageResponse>('/villages/bulk', { villages });
  }

  /**
   * Bulk delete villages
   */
  async bulkDelete(ids: string[]): Promise<{
    success: boolean;
    message: string;
    results: {
      deleted: number;
      failed: number;
      errors: Array<{
        id: string;
        error: string;
      }>;
    };
  }> {
    return api.delete('/villages/bulk-delete', {
      data: { ids }
    });
  }

  /**
   * Delete all villages
   */
  async deleteAll(): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
    usageDetails?: Array<{
      model: string;
      count: number;
    }>;
  }> {
    return api.delete('/villages/delete-all');
  }

}

export const villagesApi = new VillagesApi();
