/**
 * Trash API
 * Handles soft-deleted records management
 */

import api from './base-api';

export interface TrashRecord {
  _id: string;
  isDeleted: boolean;
  deletedAt: string;
  deletedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  [key: string]: any;
}

export interface TrashGroup {
  type: string;
  typeName: string;
  records: TrashRecord[];
  count: number;
}

export interface TrashStats {
  [key: string]: {
    name: string;
    count: number;
  };
}

export interface TrashResponse {
  success: boolean;
  data: TrashGroup[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TrashStatsResponse {
  success: boolean;
  stats: TrashStats;
  totalCount: number;
}

/**
 * Get all trash records
 */
export const getTrashRecords = async (params?: {
  page?: number;
  limit?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
}): Promise<TrashResponse> => {
  const response = await api.get('/trash', { params });
  return response.data;
};

/**
 * Get trash statistics
 */
export const getTrashStats = async (): Promise<TrashStatsResponse> => {
  const response = await api.get('/trash/stats');
  return response.data;
};

/**
 * Restore a deleted record
 */
export const restoreRecord = async (type: string, id: string) => {
  const response = await api.post(`/trash/${type}/${id}/restore`);
  return response.data;
};

/**
 * Permanently delete a record
 */
export const permanentlyDeleteRecord = async (type: string, id: string) => {
  const response = await api.delete(`/trash/${type}/${id}`);
  return response.data;
};

/**
 * Empty trash for specific type
 */
export const emptyTrashByType = async (type: string) => {
  const response = await api.delete(`/trash/${type}/empty`);
  return response.data;
};

/**
 * Empty all trash
 */
export const emptyAllTrash = async () => {
  const response = await api.delete('/trash/empty-all');
  return response.data;
};
