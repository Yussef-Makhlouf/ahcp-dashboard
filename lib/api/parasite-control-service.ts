/**
 * Parasite Control API Service
 * 
 * This service provides a comprehensive interface for managing parasite control records
 * with the real API endpoints at https://barns-g2ou.vercel.app/parasite-control/
 * 
 * Supported Operations:
 * - GET /parasite-control/ - Get all records with pagination and filtering
 * - GET /parasite-control/{id} - Get single record by ID
 * - POST /parasite-control/ - Create new record
 * - PUT /parasite-control/{id} - Update entire record
 * - PATCH /parasite-control/{id} - Partial update of record
 * - DELETE /parasite-control/{id} - Delete record
 * - POST /parasite-control/export/csv - Export records to CSV
 */

import { parasiteControlApi } from './parasite-control';
import type { ParasiteControl, PaginatedResponse } from '@/types';

export class ParasiteControlService {
  /**
   * Get all parasite control records with pagination and filtering
   * @param params - Query parameters for pagination and filtering
   * @returns Promise<PaginatedResponse<ParasiteControl>>
   */
  static async getAllRecords(params?: {
    page?: number;
    limit?: number;
    search?: string;
    filter?: Record<string, any>;
  }): Promise<PaginatedResponse<ParasiteControl>> {
    return await parasiteControlApi.getList(params);
  }

  /**
   * Get a single parasite control record by ID
   * @param id - Record ID
   * @returns Promise<ParasiteControl>
   */
  static async getRecordById(id: number): Promise<ParasiteControl> {
    return await parasiteControlApi.getById(id);
  }

  /**
   * Create a new parasite control record
   * @param data - Record data (without serialNo)
   * @returns Promise<ParasiteControl>
   */
  static async createRecord(data: Omit<ParasiteControl, 'serialNo'>): Promise<ParasiteControl> {
    return await parasiteControlApi.create(data);
  }

  /**
   * Update an entire parasite control record (PUT)
   * @param id - Record ID
   * @param data - Complete record data
   * @returns Promise<ParasiteControl>
   */
  static async updateRecord(id: number, data: Partial<ParasiteControl>): Promise<ParasiteControl> {
    return await parasiteControlApi.update(id, data);
  }

  /**
   * Partially update a parasite control record (PATCH)
   * @param id - Record ID
   * @param data - Partial record data
   * @returns Promise<ParasiteControl>
   */
  static async patchRecord(id: number, data: Partial<ParasiteControl>): Promise<ParasiteControl> {
    return await parasiteControlApi.patch(id, data);
  }

  /**
   * Delete a parasite control record
   * @param id - Record ID
   * @returns Promise<void>
   */
  static async deleteRecord(id: number): Promise<void> {
    return await parasiteControlApi.delete(id);
  }

  /**
   * Export records to CSV
   * @param ids - Optional array of record IDs to export
   * @returns Promise<Blob>
   */
  static async exportToCSV(ids?: number[]): Promise<Blob> {
    return await parasiteControlApi.exportToCsv(ids);
  }

  /**
   * Search records by owner name
   * @param searchTerm - Search term
   * @returns Promise<PaginatedResponse<ParasiteControl>>
   */
  static async searchByOwner(searchTerm: string): Promise<PaginatedResponse<ParasiteControl>> {
    return await parasiteControlApi.getList({
      search: searchTerm,
      filter: { 'owner.name': searchTerm }
    });
  }

  /**
   * Get records by health status
   * @param status - Health status filter
   * @returns Promise<PaginatedResponse<ParasiteControl>>
   */
  static async getRecordsByHealthStatus(status: 'Healthy' | 'Sick' | 'Under Treatment'): Promise<PaginatedResponse<ParasiteControl>> {
    return await parasiteControlApi.getList({
      filter: { herdHealthStatus: status }
    });
  }

  /**
   * Get records by compliance status
   * @param compliance - Compliance status filter
   * @returns Promise<PaginatedResponse<ParasiteControl>>
   */
  static async getRecordsByCompliance(compliance: 'Comply' | 'Not Comply'): Promise<PaginatedResponse<ParasiteControl>> {
    return await parasiteControlApi.getList({
      filter: { complying: compliance }
    });
  }

  /**
   * Get records by date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Promise<PaginatedResponse<ParasiteControl>>
   */
  static async getRecordsByDateRange(startDate: string, endDate: string): Promise<PaginatedResponse<ParasiteControl>> {
    return await parasiteControlApi.getList({
      filter: {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    });
  }

  /**
   * Get statistics for dashboard
   * @returns Promise<object>
   */
  static async getStatistics(): Promise<{
    totalRecords: number;
    healthyRecords: number;
    sickRecords: number;
    underTreatmentRecords: number;
    complyRecords: number;
    notComplyRecords: number;
  }> {
    try {
      const allRecords = await parasiteControlApi.getList({ limit: 1000 });
      
      const stats = {
        totalRecords: allRecords.total,
        healthyRecords: 0,
        sickRecords: 0,
        underTreatmentRecords: 0,
        complyRecords: 0,
        notComplyRecords: 0,
      };

      allRecords.data.forEach(record => {
        // Count health status
        switch (record.herdHealthStatus) {
          case 'Healthy':
            stats.healthyRecords++;
            break;
          case 'Sick':
            stats.sickRecords++;
            break;
          case 'Under Treatment':
            stats.underTreatmentRecords++;
            break;
        }

        // Count compliance
        switch (record.complying) {
          case 'Comply':
            stats.complyRecords++;
            break;
          case 'Not Comply':
            stats.notComplyRecords++;
            break;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        totalRecords: 0,
        healthyRecords: 0,
        sickRecords: 0,
        underTreatmentRecords: 0,
        complyRecords: 0,
        notComplyRecords: 0,
      };
    }
  }
}

export default ParasiteControlService;
